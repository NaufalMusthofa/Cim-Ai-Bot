import { describe, expect, it } from "vitest";
import { generateAiReply } from "@/services/ai/gemini.service";

describe("gemini fallback reply", () => {
  it("asks a more specific follow-up for web store needs", async () => {
    const reply = await generateAiReply({
      assistantMode: "SALES",
      systemPrompt: "test",
      fallbackTemplate: "Siap kak, boleh jelaskan tujuan utamanya dan fitur utama yang dibutuhkan?",
      conversation: "Customer: Saya mau bikin aplikasi website toko sepatu",
      historyMessages: [
        {
          role: "USER",
          content: "Saya mau bikin aplikasi website toko sepatu"
        }
      ],
      latestMessage: "Saya mau bikin aplikasi website toko sepatu"
    });

    expect(reply.toLowerCase()).toContain("toko sepatu");
    expect(reply.toLowerCase()).toContain("checkout");
  });

  it("does not repeat generic detail question after user has already clarified", async () => {
    const reply = await generateAiReply({
      assistantMode: "SALES",
      systemPrompt: "test",
      fallbackTemplate: "Siap kak, boleh jelaskan tujuan utamanya dan fitur utama yang dibutuhkan?",
      conversation:
        "Admin: Boleh ceritakan kebutuhan kakak lebih detail ya.\nCustomer: Saya mau bikin aplikasi website toko sepatu",
      historyMessages: [
        {
          role: "ASSISTANT",
          content: "Boleh ceritakan kebutuhan kakak lebih detail ya."
        },
        {
          role: "USER",
          content: "Saya mau bikin aplikasi website toko sepatu"
        }
      ],
      latestMessage: "Saya mau bikin aplikasi website toko sepatu"
    });

    expect(reply.toLowerCase()).not.toContain("boleh ceritakan kebutuhan kakak lebih detail");
    expect(reply.toLowerCase()).toContain("fitur utamanya");
    expect(reply.toLowerCase()).toContain("checkout");
  });

  it("answers school questions in personal mode without selling website", async () => {
    const reply = await generateAiReply({
      assistantMode: "PERSONAL",
      systemPrompt: "test",
      fallbackTemplate: "Boleh jelasin sedikit konteksnya ya biar aku bantu jawab lebih nyambung.",
      conversation: "Customer: pelajaran matematika ini gimana ya",
      historyMessages: [
        {
          role: "USER",
          content: "pelajaran matematika ini gimana ya"
        }
      ],
      latestMessage: "pelajaran matematika ini gimana ya"
    });

    expect(reply.toLowerCase()).toContain("materi");
    expect(reply.toLowerCase()).not.toContain("website");
  });

  it("responds with empathy first for emotional chats in personal mode", async () => {
    const reply = await generateAiReply({
      assistantMode: "PERSONAL",
      systemPrompt: "test",
      fallbackTemplate: "Boleh cerita pelan-pelan ya.",
      conversation: "Customer: aku lagi capek banget akhir-akhir ini",
      historyMessages: [
        {
          role: "USER",
          content: "aku lagi capek banget akhir-akhir ini"
        }
      ],
      latestMessage: "aku lagi capek banget akhir-akhir ini"
    });

    expect(reply.toLowerCase()).toContain("berat");
    expect(reply.toLowerCase()).not.toContain("website");
  });
});
