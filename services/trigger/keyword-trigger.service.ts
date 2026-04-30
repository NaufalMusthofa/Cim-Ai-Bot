import { KEYWORD_TRIGGER_MAP } from "@/lib/constants";
import type { TriggerDecision } from "@/types/domain";

const orderedKeywords = Object.keys(KEYWORD_TRIGGER_MAP);

export function evaluateKeywordTrigger(message: string): TriggerDecision {
  const lowered = message.toLowerCase();
  const matchedKeywords = orderedKeywords.filter((keyword) => lowered.includes(keyword));
  const promotionSnippet = matchedKeywords.length
    ? KEYWORD_TRIGGER_MAP[matchedKeywords[0] as keyof typeof KEYWORD_TRIGGER_MAP]
    : undefined;

  return {
    matchedKeywords,
    promotionSnippet,
    qualifiesForFollowup: matchedKeywords.length > 0
  };
}
