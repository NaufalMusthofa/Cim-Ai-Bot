import { FOLLOWUP_SCHEDULE_DAYS } from "@/lib/constants";
import { incrementFollowupCount } from "@/repositories/contact.repository";
import { findOrCreateConversation, touchConversation } from "@/repositories/conversation.repository";
import {
  cancelPendingFollowups as cancelPendingFollowupJobs,
  listFollowupsByContact,
  listDueFollowups,
  markFollowupFailed,
  markFollowupSent,
  scheduleFollowupStage
} from "@/repositories/followup.repository";
import { createMessage } from "@/repositories/message.repository";
import { sendWhatsAppMessage } from "@/services/whatsapp/fonnte.service";

const stageMap = {
  1: "STAGE_1",
  2: "STAGE_2",
  3: "STAGE_3"
} as const;

export function getFollowupMessage(stage: 1 | 2 | 3) {
  if (stage === 1) {
    return "Halo kak 😊 kemarin sempat tanya soal website.\nMasih butuh bantuan?";
  }

  if (stage === 2) {
    return "Kami siap bantu kapan saja ya kak 🙏\nKalau ada pertanyaan tinggal bilang saja";
  }

  return "Terakhir ya kak 😊\nKalau masih butuh jasa website, kami siap bantu";
}

export async function scheduleFollowups(contactId: string, fromDate = new Date()) {
  const existingJobs = await listFollowupsByContact(contactId);
  const sentStages = new Set(existingJobs.filter((job) => job.status === "SENT").map((job) => job.stage));

  await Promise.all(
    ([1, 2, 3] as const).map(async (stage) => {
      if (sentStages.has(stageMap[stage])) {
        return null;
      }

      const dueAt = new Date(fromDate);
      dueAt.setDate(dueAt.getDate() + FOLLOWUP_SCHEDULE_DAYS[stage]);

      await scheduleFollowupStage(contactId, stageMap[stage], dueAt);
    })
  );
}

export async function cancelPendingFollowups(contactId: string) {
  return cancelPendingFollowupJobs(contactId);
}

export async function processDueFollowups(now = new Date()) {
  const dueJobs = await listDueFollowups(now);

  const results = await Promise.all(
    dueJobs.map(async (job) => {
      const stage = Number(job.stage.replace("STAGE_", "")) as 1 | 2 | 3;

      try {
        if (!job.contact.profile.fonnteToken) {
          throw new Error("Fonnte token belum tersedia untuk tenant ini.");
        }

        const conversation = await findOrCreateConversation(job.contactId);
        const message = getFollowupMessage(stage);

        await sendWhatsAppMessage({
          token: job.contact.profile.fonnteToken,
          target: job.contact.phone,
          message
        });

        await Promise.all([
          markFollowupSent(job.id),
          incrementFollowupCount(job.contactId),
          createMessage({
            conversationId: conversation.id,
            contactId: job.contactId,
            role: "SYSTEM",
            content: message
          }),
          touchConversation(conversation.id, new Date())
        ]);

        return { jobId: job.id, status: "sent" as const };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown follow-up error";
        await markFollowupFailed(job.id, message);
        return { jobId: job.id, status: "failed" as const, error: message };
      }
    })
  );

  return {
    processed: results.length,
    results
  };
}
