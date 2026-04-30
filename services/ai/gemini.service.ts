import { AI_MODEL } from "@/lib/constants";
import { hasGeminiEnv, requireEnv } from "@/lib/env";
import { renderPromptTemplate } from "@/services/ai/prompt-card.service";
import { evaluateKeywordTrigger } from "@/services/trigger/keyword-trigger.service";
import type { AssistantMode, HistoryMessage, TriggerDecision } from "@/types/domain";

const SCHOOL_TOPICS = [
  "pelajaran",
  "matematika",
  "fisika",
  "kimia",
  "biologi",
  "sejarah",
  "geografi",
  "bahasa inggris",
  "bahasa indonesia",
  "tugas",
  "pr",
  "soal",
  "rumus"
] as const;

const EMOTIONAL_TOPICS = [
  "sedih",
  "capek",
  "cape",
  "lelah",
  "bingung",
  "galau",
  "kecewa",
  "marah",
  "kesel",
  "stres",
  "stress",
  "burnout",
  "sendirian",
  "pusing",
  "overthinking"
] as const;

const SENSITIVE_TOPICS = [
  "bunuh diri",
  "nyakitin diri",
  "melukai diri",
  "obat",
  "dosis",
  "diagnosa",
  "penyakit",
  "dokter",
  "hukum",
  "polisi",
  "gugatan",
  "investasi",
  "trading",
  "pinjaman"
] as const;

const SALES_TERMS = [
  "website",
  "aplikasi web",
  "web app",
  "landing page",
  "toko online",
  "online shop",
  "checkout",
  "pembayaran",
  "domain",
  "hosting",
  "jasa website",
  "buat website",
  "bikin website"
] as const;

function normalizeText(input: string) {
  return input.toLowerCase();
}

function includesAny(text: string, values: readonly string[]) {
  return values.some((value) => text.includes(value));
}

function extractStoreCategory(message: string) {
  const lowered = normalizeText(message);

  if (lowered.includes("sepatu")) {
    return "toko sepatu";
  }

  if (lowered.includes("baju") || lowered.includes("fashion")) {
    return "toko fashion";
  }

  if (lowered.includes("kosmetik") || lowered.includes("skincare")) {
    return "toko kosmetik";
  }

  if (lowered.includes("makanan") || lowered.includes("kuliner")) {
    return "bisnis kuliner";
  }

  return null;
}

function conversationAlreadyAskedForDetail(conversation: string) {
  const lowered = normalizeText(conversation);

  return (
    lowered.includes("boleh ceritakan kebutuhan") ||
    lowered.includes("bisa ceritakan kebutuhan") ||
    lowered.includes("lebih detail") ||
    lowered.includes("fitur apa saja")
  );
}

function buildPersonalFallbackReply(input: {
  latestMessage: string;
  conversation: string;
  fallbackTemplate: string;
}) {
  const lowered = normalizeText(input.latestMessage);

  if (/^(halo|hai|hi|p|permisi|assalamualaikum)[!. ]*$/i.test(input.latestMessage.trim())) {
    return "Halo juga 😊 Ada yang mau ditanyain atau diceritain? Santai aja ya.";
  }

  if (includesAny(lowered, SENSITIVE_TOPICS)) {
    return "Untuk hal ini aku belum berani jawab pasti karena takut salah. Biar aman, tunggu admin atau pemilik nomor balas langsung ya.";
  }

  if (includesAny(lowered, EMOTIONAL_TOPICS)) {
    return "Kedengarannya lagi berat ya. Kalau mau, cerita pelan-pelan aja dulu. Bagian mana yang paling bikin kepikiran sekarang?";
  }

  if (includesAny(lowered, SCHOOL_TOPICS)) {
    return "Boleh, kirim bagian soal atau materinya yang bikin bingung ya. Nanti coba aku bantu jelasin pelan-pelan biar lebih gampang dipahami.";
  }

  if (/^(iya|ya|oke|ok|sip|boleh|gimana|terus gimana|lanjut)[!. ]*$/i.test(input.latestMessage.trim())) {
    if (normalizeText(input.conversation).includes("cerita")) {
      return "Boleh, lanjut aja. Aku dengerin kok. Ceritain bagian yang paling pengin kamu bahas dulu ya.";
    }

    return "Oke, boleh jelasin sedikit lagi konteksnya ya biar aku jawab yang paling nyambung.";
  }

  return (
    renderPromptTemplate(input.fallbackTemplate, {
      latestMessage: input.latestMessage
    }) || "Oke, boleh ceritain atau jelasin sedikit konteksnya? Biar aku bantu jawab dengan lebih nyambung dan enak dipahami."
  );
}

function buildSalesFallbackReply(input: {
  latestMessage: string;
  conversation: string;
  triggerDecision: TriggerDecision;
  fallbackTemplate: string;
}) {
  const lowered = normalizeText(input.latestMessage);
  const alreadyAskedForDetail = conversationAlreadyAskedForDetail(input.conversation);
  const storeCategory = extractStoreCategory(input.latestMessage);

  if (/^(halo|hai|hi|p|permisi|assalamualaikum)[!. ]*$/i.test(input.latestMessage.trim())) {
    return "Halo kak 😊 Ada yang bisa kami bantu hari ini? Kalau kakak sedang butuh website, toko online, atau landing page, tinggal ceritakan kebutuhannya ya.";
  }

  if (
    lowered.includes("website") ||
    lowered.includes("aplikasi web") ||
    lowered.includes("web app") ||
    lowered.includes("landing page") ||
    lowered.includes("online shop") ||
    lowered.includes("toko online")
  ) {
    const intro = storeCategory
      ? `Siap kak, kami bisa bantu buat website ${storeCategory}.`
      : lowered.includes("landing page")
        ? "Siap kak, kami bisa bantu buat landing page yang rapi dan siap dipakai promosi."
        : "Siap kak, kami bisa bantu buat website sesuai kebutuhan kakak.";

    if (lowered.includes("aplikasi") || lowered.includes("web app")) {
      return `${intro} Biar kami arahkan solusinya, kakak butuh fitur utamanya apa saja? Misalnya katalog produk, keranjang, checkout, pembayaran, atau dashboard admin.`;
    }

    if (alreadyAskedForDetail) {
      return `${intro} Untuk tahap berikutnya, kakak maunya model katalog saja atau toko online lengkap dengan checkout dan pembayaran? Kalau ada contoh website referensi, boleh sekalian dikirim ya.`;
    }

    return `${intro} Biar kami bantu hitungkan arah pengerjaannya, kakak butuh model katalog saja atau toko online lengkap dengan checkout/pembayaran?`;
  }

  const rendered = renderPromptTemplate(input.fallbackTemplate, {
    latestMessage: input.latestMessage,
    promotionSnippet: input.triggerDecision.promotionSnippet,
    businessCategory: storeCategory || "bisnis kakak"
  });

  return rendered || "Baik kak 😊 Supaya kami bisa bantu lebih tepat, boleh jelaskan tujuan utamanya apa dan hasil seperti apa yang kakak inginkan?";
}

function buildFallbackReply(input: {
  assistantMode: AssistantMode;
  latestMessage: string;
  conversation: string;
  fallbackTemplate: string;
  triggerDecision?: TriggerDecision;
}) {
  if (input.assistantMode === "PERSONAL") {
    return buildPersonalFallbackReply({
      latestMessage: input.latestMessage,
      conversation: input.conversation,
      fallbackTemplate: input.fallbackTemplate
    });
  }

  return buildSalesFallbackReply({
    latestMessage: input.latestMessage,
    conversation: input.conversation,
    triggerDecision: input.triggerDecision ?? evaluateKeywordTrigger(input.latestMessage),
    fallbackTemplate: input.fallbackTemplate
  });
}

function buildGeminiContents(historyMessages: HistoryMessage[]) {
  const filtered = historyMessages
    .filter((message) => message.role !== "SYSTEM" && message.content.trim())
    .slice(-12)
    .map((message) => ({
      role: message.role === "USER" ? "user" : "model",
      parts: [
        {
          text: message.content
        }
      ]
    }));

  if (!filtered.length) {
    return [
      {
        role: "user",
        parts: [
          {
            text: "Halo"
          }
        ]
      }
    ];
  }

  return filtered;
}

function extractCandidateText(data: {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}) {
  return data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim() || "";
}

function normalizeReply(text: string) {
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

function isTooGenericSalesReply(reply: string, latestMessage: string) {
  const loweredReply = normalizeText(reply);
  const loweredLatest = normalizeText(latestMessage);

  return (
    loweredReply.includes("boleh ceritakan kebutuhan kakak lebih detail") &&
    (loweredLatest.includes("website") || loweredLatest.includes("aplikasi") || loweredLatest.includes("toko"))
  );
}

function isWrongModeReply(input: {
  reply: string;
  latestMessage: string;
  assistantMode: AssistantMode;
}) {
  const loweredReply = normalizeText(input.reply);
  const loweredLatest = normalizeText(input.latestMessage);

  if (input.assistantMode === "PERSONAL") {
    return !includesAny(loweredLatest, SALES_TERMS) && includesAny(loweredReply, SALES_TERMS);
  }

  return false;
}

function shouldUseFallback(input: {
  reply: string;
  latestMessage: string;
  assistantMode: AssistantMode;
}) {
  if (!input.reply) {
    return true;
  }

  if (input.assistantMode === "SALES" && isTooGenericSalesReply(input.reply, input.latestMessage)) {
    return true;
  }

  return isWrongModeReply(input);
}

function logGeminiFailure(context: string, detail: string) {
  console.error(`[gemini] ${context}: ${detail}`);
}

export async function generateAiReply(input: {
  assistantMode: AssistantMode;
  systemPrompt: string;
  fallbackTemplate: string;
  conversation: string;
  historyMessages: HistoryMessage[];
  latestMessage: string;
  triggerDecision?: TriggerDecision;
}) {
  const fallbackReply = buildFallbackReply({
    assistantMode: input.assistantMode,
    latestMessage: input.latestMessage,
    conversation: input.conversation,
    fallbackTemplate: input.fallbackTemplate,
    triggerDecision: input.triggerDecision
  });

  if (!hasGeminiEnv()) {
    return fallbackReply;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${requireEnv("GEMINI_API_KEY")}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: input.systemPrompt
            }
          ]
        },
        contents: buildGeminiContents(input.historyMessages),
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 300
        }
      })
    }
  );

  if (!response.ok) {
    logGeminiFailure("non-ok response", `${response.status} ${response.statusText}`);
    return fallbackReply;
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
    }>;
  };

  const text = normalizeReply(extractCandidateText(data));

  if (
    shouldUseFallback({
      reply: text,
      latestMessage: input.latestMessage,
      assistantMode: input.assistantMode
    })
  ) {
    if (!text) {
      logGeminiFailure("empty response", `${input.assistantMode}:${input.latestMessage}`);
    }

    return fallbackReply;
  }

  return text;
}
