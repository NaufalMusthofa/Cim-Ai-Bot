import { listMemories, upsertMemory } from "@/repositories/memory.repository";
import type { AssistantMode, TriggerDecision } from "@/types/domain";

function parseAssistantModeHint(value?: string | null): AssistantMode | null {
  return value === "PERSONAL" || value === "SALES" ? value : null;
}

export async function getMemorySnapshot(contactId: string) {
  const memories = await listMemories(contactId);
  const assistantModeHint = memories.find((memory) => memory.key === "assistant_mode_hint")?.value;
  const promptMemories = memories.filter((memory) => memory.key !== "assistant_mode_hint");

  if (!promptMemories.length) {
    return {
      context: "Belum ada memory penting.",
      assistantModeHint: parseAssistantModeHint(assistantModeHint)
    };
  }

  return {
    context: promptMemories.map((memory) => `${memory.key}: ${memory.value}`).join("\n"),
    assistantModeHint: parseAssistantModeHint(assistantModeHint)
  };
}

export async function updateMemoryFromConversation(input: {
  contactId: string;
  senderName?: string;
  lastMessage: string;
  lastReply: string;
  assistantMode: AssistantMode;
  triggerDecision: TriggerDecision;
}) {
  const operations = [
    upsertMemory(input.contactId, "last_user_message", input.lastMessage.slice(0, 500)),
    upsertMemory(input.contactId, "last_ai_reply", input.lastReply.slice(0, 500)),
    upsertMemory(input.contactId, "assistant_mode_hint", input.assistantMode)
  ];

  if (input.senderName) {
    operations.push(upsertMemory(input.contactId, "display_name", input.senderName));
  }

  if (input.triggerDecision.matchedKeywords.length) {
    operations.push(
      upsertMemory(
        input.contactId,
        "interest_topics",
        input.triggerDecision.matchedKeywords.join(", ")
      )
    );
  }

  await Promise.all(operations);
}
