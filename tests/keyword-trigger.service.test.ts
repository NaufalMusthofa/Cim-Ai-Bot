import { describe, expect, it } from "vitest";
import { evaluateKeywordTrigger } from "@/services/trigger/keyword-trigger.service";

describe("keyword-trigger.service", () => {
  it("detects configured sales keywords", () => {
    const decision = evaluateKeywordTrigger("Saya mau bikin website untuk bisnis online shop");

    expect(decision.matchedKeywords).toEqual(["website", "bisnis", "online shop"]);
    expect(decision.qualifiesForFollowup).toBe(true);
    expect(decision.promotionSnippet).toContain("website");
  });

  it("returns empty result for neutral messages", () => {
    const decision = evaluateKeywordTrigger("Halo, jam buka hari ini berapa?");

    expect(decision.matchedKeywords).toEqual([]);
    expect(decision.qualifiesForFollowup).toBe(false);
    expect(decision.promotionSnippet).toBeUndefined();
  });
});
