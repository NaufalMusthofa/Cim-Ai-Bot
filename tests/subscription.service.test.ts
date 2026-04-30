import { describe, expect, it } from "vitest";
import {
  createSubscriptionWindow,
  getRemainingQuota,
  hasRemainingQuota,
  isSubscriptionExpired
} from "@/services/subscription/subscription.service";

describe("subscription.service", () => {
  it("builds a daily quota window for free plan", () => {
    const now = new Date("2026-04-30T10:00:00.000Z");
    const window = createSubscriptionWindow("FREE", now);

    expect(window.limitCount).toBe(25);
    expect(window.currentPeriodStart.toISOString()).toBe("2026-04-30T10:00:00.000Z");
    expect(window.currentPeriodEnd.toISOString()).toBe("2026-05-01T10:00:00.000Z");
  });

  it("builds a monthly quota window for pro plan", () => {
    const now = new Date("2026-04-30T10:00:00.000Z");
    const window = createSubscriptionWindow("PRO", now);

    expect(window.limitCount).toBe(300);
    expect(window.currentPeriodEnd.toISOString()).toBe("2026-05-30T10:00:00.000Z");
  });

  it("detects remaining quota correctly", () => {
    expect(
      hasRemainingQuota({
        usageCount: 24,
        limitCount: 25
      })
    ).toBe(true);

    expect(
      getRemainingQuota({
        usageCount: 26,
        limitCount: 25
      })
    ).toBe(0);
  });

  it("respects period expiration", () => {
    expect(
      isSubscriptionExpired(
        {
          currentPeriodEnd: new Date("2026-04-30T10:00:00.000Z")
        },
        new Date("2026-04-30T10:00:00.000Z")
      )
    ).toBe(true);
  });
});
