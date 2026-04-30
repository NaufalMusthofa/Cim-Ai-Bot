import type { Message, Profile } from "@prisma/client";
import type { TriggerDecision } from "@/types/domain";

export function buildSystemPrompt(input: {
  profile: Pick<Profile, "businessName" | "email">;
  memoryContext: string;
  triggerDecision: TriggerDecision;
}) {
  return [
    "Kamu adalah asisten WhatsApp CIM AI untuk customer service dan sales dalam Bahasa Indonesia.",
    "Jawab dengan ramah, singkat, jelas, dan natural seperti admin bisnis di Indonesia.",
    "Fokus bantu user, gali kebutuhan secukupnya, lalu arahkan ke solusi bisnis yang relevan.",
    "Jika user terlihat butuh solusi bisnis atau ingin jualan online, arahkan secara halus ke jasa pembuatan website.",
    "Jangan mengaku sebagai AI. Jangan menggunakan format yang terlalu panjang.",
    `Nama bisnis tenant: ${input.profile.businessName || "CIM AI Partner"}.`,
    `Email owner tenant: ${input.profile.email}.`,
    `Memory customer:\n${input.memoryContext}`,
    input.triggerDecision.promotionSnippet
      ? `Gunakan sisipan promosi ini dengan natural jika relevan: ${input.triggerDecision.promotionSnippet}`
      : "Tidak ada keyword trigger khusus untuk pesan ini."
  ].join("\n\n");
}

export function buildConversationTranscript(messages: Pick<Message, "role" | "content">[]) {
  if (!messages.length) {
    return "Belum ada riwayat sebelumnya.";
  }

  return messages.map((message) => `${message.role === "USER" ? "Customer" : "Admin"}: ${message.content}`).join("\n");
}
