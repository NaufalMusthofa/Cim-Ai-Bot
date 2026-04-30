import { describe, expect, it } from "vitest";
import { detectCommand, getCommandMessage } from "@/services/whatsapp/command.service";

describe("command.service", () => {
  it("detects supported whatsapp commands", () => {
    expect(detectCommand("/help")).toBe("help");
    expect(detectCommand(" /status ")).toBe("status");
    expect(detectCommand("/upgrade")).toBe("upgrade");
    expect(detectCommand("halo admin")).toBeNull();
  });

  it("builds a useful status message", () => {
    const message = getCommandMessage("status", {
      plan: "FREE",
      usageCount: 10,
      limitCount: 25,
      currentPeriodEnd: new Date("2026-04-30T10:00:00.000Z")
    });

    expect(message).toContain("Paket: FREE");
    expect(message).toContain("Sisa limit: 15");
    expect(message).toContain("Reset berikutnya:");
  });
});
