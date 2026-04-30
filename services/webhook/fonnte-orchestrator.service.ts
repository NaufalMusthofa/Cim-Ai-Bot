import { LIMIT_REACHED_MESSAGE } from "@/lib/constants";
import { findOrCreateContact, updateContactAfterReply } from "@/repositories/contact.repository";
import { findOrCreateConversation, touchConversation } from "@/repositories/conversation.repository";
import { cancelPendingFollowups, scheduleFollowups } from "@/services/trigger/followup.service";
import { createMessage, listRecentMessages } from "@/repositories/message.repository";
import { findProfileByWebhook } from "@/repositories/profile.repository";
import { createWebhookEvent, updateWebhookEventStatus } from "@/repositories/webhook-event.repository";
import { resolveAssistantMode } from "@/services/ai/assistant-mode.service";
import { getActivePromptCardMap } from "@/services/ai/prompt-card.service";
import { buildConversationTranscript, buildSystemPrompt } from "@/services/ai/prompt.service";
import { generateAiReply } from "@/services/ai/gemini.service";
import { getMemorySnapshot, updateMemoryFromConversation } from "@/services/crm/memory.service";
import { ensureSubscriptionForPlan, getRemainingQuota, hasRemainingQuota, incrementSubscriptionUsage } from "@/services/subscription/subscription.service";
import { evaluateKeywordTrigger } from "@/services/trigger/keyword-trigger.service";
import { detectCommand, getCommandMessage } from "@/services/whatsapp/command.service";
import { sendWhatsAppMessage } from "@/services/whatsapp/fonnte.service";
import type { InboundWebhookPayload } from "@/types/domain";

function normalizePhone(sender: string) {
  return sender.replace(/[^\d]/g, "");
}

export async function processFonnteWebhook(input: {
  tenantId: string;
  webhookKey: string;
  payload: InboundWebhookPayload;
}) {
  const profile = await findProfileByWebhook(input.tenantId, input.webhookKey);

  if (!profile) {
    throw new Error("Webhook tenant tidak valid.");
  }

  const webhookEvent = await createWebhookEvent(profile.id, input.payload.eventId, input.payload.raw);

  if (!webhookEvent) {
    return {
      status: "duplicate" as const
    };
  }

  try {
    if (input.payload.isGroup || !input.payload.sender || !input.payload.message) {
      await updateWebhookEventStatus(webhookEvent.id, { status: "IGNORED" });
      return { status: "ignored" as const };
    }

    if (!profile.fonnteToken) {
      throw new Error("Tenant belum menghubungkan token Fonnte.");
    }

    const phone = normalizePhone(input.payload.sender);
    const contact = await findOrCreateContact(profile.id, phone, input.payload.senderName);
    const conversation = await findOrCreateConversation(contact.id);

    await cancelPendingFollowups(contact.id);

    const subscription = await ensureSubscriptionForPlan(profile.id, profile.plan);
    const command = detectCommand(input.payload.message);

    if (command) {
      await sendWhatsAppMessage({
        token: profile.fonnteToken,
        target: contact.phone,
        message: getCommandMessage(command, subscription),
        inboxId: input.payload.inboxId
      });

      await createMessage({
        conversationId: conversation.id,
        contactId: contact.id,
        role: "SYSTEM",
        content: `Command ${command} diproses.`
      });
      await touchConversation(conversation.id, new Date());
      await updateWebhookEventStatus(webhookEvent.id, { status: "PROCESSED" });

      return { status: "command" as const, command };
    }

    if (contact.mode === "HUMAN") {
      await Promise.all([
        createMessage({
          conversationId: conversation.id,
          contactId: contact.id,
          role: "USER",
          content: input.payload.message || "[Attachment received]",
          externalId: input.payload.eventId,
          inboxId: input.payload.inboxId,
          metadata: input.payload.attachment ? { attachment: input.payload.attachment } : null
        }),
        touchConversation(conversation.id, new Date()),
        updateWebhookEventStatus(webhookEvent.id, { status: "PROCESSED" })
      ]);

      return {
        status: "human_mode" as const
      };
    }

    if (!hasRemainingQuota(subscription)) {
      await sendWhatsAppMessage({
        token: profile.fonnteToken,
        target: contact.phone,
        message: LIMIT_REACHED_MESSAGE,
        inboxId: input.payload.inboxId
      });

      await updateWebhookEventStatus(webhookEvent.id, { status: "PROCESSED" });
      return {
        status: "limit_reached" as const,
        remainingQuota: getRemainingQuota(subscription)
      };
    }

    await createMessage({
      conversationId: conversation.id,
      contactId: contact.id,
      role: "USER",
      content: input.payload.message || "[Attachment received]",
      externalId: input.payload.eventId,
      inboxId: input.payload.inboxId,
      metadata: input.payload.attachment ? { attachment: input.payload.attachment } : null
    });

    const [memoryState, recentHistory, promptCards] = await Promise.all([
      getMemorySnapshot(contact.id),
      listRecentMessages(conversation.id),
      getActivePromptCardMap()
    ]);
    const assistantModeDecision = resolveAssistantMode({
      latestMessage: input.payload.message,
      historyMessages: recentHistory.map((message) => ({
        role: message.role,
        content: message.content
      })),
      lastModeHint: memoryState.assistantModeHint
    });
    const rawTriggerDecision = evaluateKeywordTrigger(input.payload.message);
    const triggerDecision =
      assistantModeDecision.mode === "SALES"
        ? rawTriggerDecision
        : {
            matchedKeywords: [],
            qualifiesForFollowup: false
          };

    const aiReply = await generateAiReply({
      assistantMode: assistantModeDecision.mode,
      systemPrompt: buildSystemPrompt({
        assistantMode: assistantModeDecision.mode,
        basePrompt: promptCards.systemBase,
        modePrompt: assistantModeDecision.mode === "PERSONAL" ? promptCards.personalMode : promptCards.salesMode,
        profile: {
          businessName: profile.businessName,
          email: profile.email
        },
        memoryContext: memoryState.context,
        triggerDecision
      }),
      fallbackTemplate: assistantModeDecision.mode === "PERSONAL" ? promptCards.fallbackPersonal : promptCards.fallbackSales,
      conversation: buildConversationTranscript(recentHistory),
      historyMessages: recentHistory.map((message) => ({
        role: message.role,
        content: message.content
      })),
      latestMessage: input.payload.message,
      triggerDecision
    });

    await sendWhatsAppMessage({
      token: profile.fonnteToken,
      target: contact.phone,
      message: aiReply,
      inboxId: input.payload.inboxId
    });

    await Promise.all([
      createMessage({
        conversationId: conversation.id,
        contactId: contact.id,
        role: "ASSISTANT",
        content: aiReply,
        inboxId: input.payload.inboxId
      }),
      incrementSubscriptionUsage(subscription.id, subscription.usageCount + 1),
      updateMemoryFromConversation({
        contactId: contact.id,
        senderName: input.payload.senderName,
        lastMessage: input.payload.message,
        lastReply: aiReply,
        assistantMode: assistantModeDecision.mode,
        triggerDecision
      }),
      updateContactAfterReply(contact.id, new Date()),
      touchConversation(conversation.id, new Date())
    ]);

    if (assistantModeDecision.mode === "SALES" && triggerDecision.qualifiesForFollowup) {
      await scheduleFollowups(contact.id, new Date());
    }

    await updateWebhookEventStatus(webhookEvent.id, { status: "PROCESSED" });

    return {
      status: "processed" as const
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown webhook error";
    await updateWebhookEventStatus(webhookEvent.id, {
      status: "FAILED",
      error: message
    });
    throw error;
  }
}
