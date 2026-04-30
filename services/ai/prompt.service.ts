import type { Message, Profile } from "@prisma/client";
import type { AssistantMode, TriggerDecision } from "@/types/domain";

export function buildSystemPrompt(input: {
  assistantMode: AssistantMode;
  basePrompt: string;
  modePrompt: string;
  profile: Pick<Profile, "businessName" | "email">;
  memoryContext: string;
  triggerDecision: TriggerDecision;
}) {
  const sharedContext = [
    `Mode aktif saat ini: ${input.assistantMode}.`,
    `Nama bisnis tenant: ${input.profile.businessName || "CIM AI Partner"}.`,
    `Email owner tenant: ${input.profile.email}.`,
    `Memory customer:\n${input.memoryContext}`
  ];

  return [
    input.basePrompt,
    input.modePrompt,
    ...sharedContext,
    input.assistantMode === "SALES"
      ? input.triggerDecision.promotionSnippet
        ? `Gunakan sisipan promosi ini dengan natural jika relevan: ${input.triggerDecision.promotionSnippet}`
        : "Tidak ada keyword trigger khusus untuk pesan ini."
      : "Mode personal aktif. Fokus pada bantuan yang natural dan relevan."
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildConversationTranscript(messages: Pick<Message, "role" | "content">[]) {
  if (!messages.length) {
    return "Belum ada riwayat sebelumnya.";
  }

  return messages.map((message) => `${message.role === "USER" ? "Customer" : "Admin"}: ${message.content}`).join("\n");
}
