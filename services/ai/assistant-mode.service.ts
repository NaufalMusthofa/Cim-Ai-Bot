import { evaluateKeywordTrigger } from "@/services/trigger/keyword-trigger.service";
import type { AssistantMode, AssistantModeDecision, HistoryMessage } from "@/types/domain";

const SALES_PHRASES = [
  "website",
  "web app",
  "aplikasi web",
  "landing page",
  "toko online",
  "online shop",
  "checkout",
  "pembayaran",
  "dashboard admin",
  "domain",
  "hosting",
  "company profile",
  "jasa website",
  "buat website",
  "bikin website",
  "buat web",
  "bikin web"
] as const;

const PERSONAL_PHRASES = [
  "curhat",
  "sedih",
  "capek",
  "cape",
  "lelah",
  "bingung",
  "galau",
  "kecewa",
  "marah",
  "kesel",
  "stress",
  "stres",
  "burnout",
  "sendirian",
  "kangen",
  "pelajaran",
  "tugas",
  "pr",
  "soal",
  "matematika",
  "fisika",
  "kimia",
  "biologi",
  "sejarah",
  "bahasa inggris",
  "pelajaran sekolah"
] as const;

const SALES_CONTEXT_HINTS = [
  "website",
  "landing page",
  "checkout",
  "pembayaran",
  "fitur",
  "dashboard admin",
  "toko online",
  "online shop"
] as const;

const PERSONAL_CONTEXT_HINTS = [
  "cerita",
  "bingung",
  "sedih",
  "capek",
  "pelan-pelan",
  "soal",
  "materi",
  "mood",
  "tenang"
] as const;

const AMBIGUOUS_FOLLOWUPS = new Set([
  "iya",
  "ya",
  "oke",
  "ok",
  "sip",
  "boleh",
  "berapa",
  "gimana",
  "terus gimana",
  "yang ini",
  "yang itu",
  "yang lengkap",
  "lanjut",
  "lanjut dong",
  "bisa",
  "siap"
]);

function normalizeText(input: string) {
  return input.toLowerCase().replace(/\s+/g, " ").trim();
}

function includesAny(text: string, phrases: readonly string[]) {
  return phrases.some((phrase) => text.includes(phrase));
}

function findFirstMatch(text: string, phrases: readonly string[]) {
  return phrases.find((phrase) => text.includes(phrase));
}

function isGreeting(text: string) {
  return /^(halo|hai|hi|p|permisi|assalamualaikum|assalamu'alaikum)[!. ]*$/.test(text);
}

function isAmbiguousFollowUp(text: string) {
  if (AMBIGUOUS_FOLLOWUPS.has(text)) {
    return true;
  }

  return text.length <= 18 && /^(iya|ya|ok|oke|sip|boleh|berapa|gimana|lanjut)/.test(text);
}

function buildRecentContext(historyMessages: HistoryMessage[]) {
  return historyMessages
    .slice(-6, -1)
    .map((message) => normalizeText(message.content))
    .join(" \n ");
}

export function resolveAssistantMode(input: {
  latestMessage: string;
  historyMessages: HistoryMessage[];
  lastModeHint?: AssistantMode | null;
}): AssistantModeDecision {
  const latestMessage = normalizeText(input.latestMessage);
  const recentContext = buildRecentContext(input.historyMessages);
  const triggerDecision = evaluateKeywordTrigger(input.latestMessage);
  const matchedSalesPhrase = findFirstMatch(latestMessage, SALES_PHRASES);
  const matchedPersonalPhrase = findFirstMatch(latestMessage, PERSONAL_PHRASES);

  if (isGreeting(latestMessage)) {
    return {
      mode: "PERSONAL",
      reason: "greeting",
      shouldPersistHint: true
    };
  }

  if (matchedSalesPhrase) {
    return {
      mode: "SALES",
      reason: `sales_phrase:${matchedSalesPhrase}`,
      shouldPersistHint: true
    };
  }

  if (triggerDecision.matchedKeywords.length) {
    return {
      mode: "SALES",
      reason: `sales_keyword:${triggerDecision.matchedKeywords[0]}`,
      shouldPersistHint: true
    };
  }

  if (
    /(harga|biaya|paket|quote|estimasi)/.test(latestMessage) &&
    includesAny(latestMessage, ["website", "landing page", "aplikasi", "web", "jasa"])
  ) {
    return {
      mode: "SALES",
      reason: "sales_pricing",
      shouldPersistHint: true
    };
  }

  if (matchedPersonalPhrase) {
    return {
      mode: "PERSONAL",
      reason: `personal_phrase:${matchedPersonalPhrase}`,
      shouldPersistHint: true
    };
  }

  if (isAmbiguousFollowUp(latestMessage)) {
    if (input.lastModeHint) {
      return {
        mode: input.lastModeHint,
        reason: `followup_hint:${input.lastModeHint.toLowerCase()}`,
        shouldPersistHint: true
      };
    }

    if (includesAny(recentContext, SALES_CONTEXT_HINTS)) {
      return {
        mode: "SALES",
        reason: "followup_recent_sales_context",
        shouldPersistHint: true
      };
    }

    if (includesAny(recentContext, PERSONAL_CONTEXT_HINTS)) {
      return {
        mode: "PERSONAL",
        reason: "followup_recent_personal_context",
        shouldPersistHint: true
      };
    }
  }

  if (includesAny(latestMessage, ["bisnis", "jualan", "omzet", "produk", "brand"])) {
    return {
      mode: "SALES",
      reason: "sales_business_context",
      shouldPersistHint: true
    };
  }

  return {
    mode: "PERSONAL",
    reason: "default_personal",
    shouldPersistHint: true
  };
}
