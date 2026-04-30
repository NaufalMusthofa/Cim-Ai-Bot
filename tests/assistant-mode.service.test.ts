import { describe, expect, it } from "vitest";
import { resolveAssistantMode } from "@/services/ai/assistant-mode.service";

describe("assistant-mode.service", () => {
  it("routes school and daily-life questions to personal mode", () => {
    const decision = resolveAssistantMode({
      latestMessage: "pelajaran matematika ini gimana ya",
      historyMessages: [
        {
          role: "USER",
          content: "pelajaran matematika ini gimana ya"
        }
      ]
    });

    expect(decision.mode).toBe("PERSONAL");
    expect(decision.reason).toContain("personal_phrase");
  });

  it("routes explicit website requests to sales mode", () => {
    const decision = resolveAssistantMode({
      latestMessage: "mau bikin website toko sepatu",
      historyMessages: [
        {
          role: "USER",
          content: "mau bikin website toko sepatu"
        }
      ]
    });

    expect(decision.mode).toBe("SALES");
    expect(decision.reason).toContain("sales_phrase");
  });

  it("keeps ambiguous follow-ups in sales mode when the last hint was sales", () => {
    const decision = resolveAssistantMode({
      latestMessage: "yang lengkap",
      lastModeHint: "SALES",
      historyMessages: [
        {
          role: "ASSISTANT",
          content: "Kakak maunya katalog saja atau toko online lengkap dengan checkout?"
        },
        {
          role: "USER",
          content: "yang lengkap"
        }
      ]
    });

    expect(decision.mode).toBe("SALES");
    expect(decision.reason).toBe("followup_hint:sales");
  });

  it("keeps ambiguous follow-ups in personal mode when the last hint was personal", () => {
    const decision = resolveAssistantMode({
      latestMessage: "terus gimana",
      lastModeHint: "PERSONAL",
      historyMessages: [
        {
          role: "ASSISTANT",
          content: "Kalau mau, cerita pelan-pelan dulu ya."
        },
        {
          role: "USER",
          content: "terus gimana"
        }
      ]
    });

    expect(decision.mode).toBe("PERSONAL");
    expect(decision.reason).toBe("followup_hint:personal");
  });
});
