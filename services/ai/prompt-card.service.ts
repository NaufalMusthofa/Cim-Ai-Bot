import {
  activatePromptCard,
  createPromptCard,
  findActivePromptCard,
  findPromptCardByTypeName,
  listPromptCards
} from "@/repositories/prompt-card.repository";
import type { FollowupStage, PromptType } from "@/types/domain";

export const PROMPT_CARD_TYPES: PromptType[] = [
  "SYSTEM_BASE",
  "PERSONAL_MODE",
  "SALES_MODE",
  "FALLBACK_PERSONAL",
  "FALLBACK_SALES",
  "FOLLOWUP_STAGE_1",
  "FOLLOWUP_STAGE_2",
  "FOLLOWUP_STAGE_3"
];

export const PROMPT_TYPE_LABELS: Record<PromptType, string> = {
  SYSTEM_BASE: "System Base",
  PERSONAL_MODE: "Personal Mode",
  SALES_MODE: "Sales Mode",
  FALLBACK_PERSONAL: "Fallback Personal",
  FALLBACK_SALES: "Fallback Sales",
  FOLLOWUP_STAGE_1: "Follow-up H+1",
  FOLLOWUP_STAGE_2: "Follow-up H+3",
  FOLLOWUP_STAGE_3: "Follow-up H+5"
};

const DEFAULT_PROMPT_CARDS: Array<{
  type: PromptType;
  name: string;
  content: string;
}> = [
  {
    type: "SYSTEM_BASE",
    name: "Default System Base",
    content: [
      "Kamu adalah asisten WhatsApp untuk tenant di CIM AI dalam Bahasa Indonesia.",
      "Jawab seperti manusia yang sedang chat di WhatsApp: natural, singkat, jelas, dan tidak kaku.",
      "Selalu jawab pesan terakhir user secara langsung dan nyambung dengan konteks percakapan sebelumnya.",
      "Gunakan memory customer dan riwayat chat yang diberikan.",
      "Jangan mengaku sebagai AI dan hindari jawaban template yang berulang."
    ].join("\n")
  },
  {
    type: "PERSONAL_MODE",
    name: "Default Personal Mode",
    content: [
      "Mode ini dipakai untuk obrolan umum, curhat, pertanyaan sehari-hari, dan topik ringan seperti pelajaran sekolah.",
      "Tanggapi dengan ramah, santai, dan empatik.",
      "Kalau user curhat, respon empati dulu sebelum saran.",
      "Kalau user bingung, bantu dengan 1 pertanyaan lanjutan yang relevan.",
      "Kalau tidak yakin atau topik sensitif/berisiko tinggi, jujur bilang belum yakin dan arahkan menunggu admin atau pemilik nomor membalas langsung.",
      "Jangan promosi jasa website jika topik user tidak relevan ke bisnis atau layanan digital."
    ].join("\n")
  },
  {
    type: "SALES_MODE",
    name: "Default Sales Mode",
    content: [
      "Mode ini dipakai untuk kebutuhan website, aplikasi web, landing page, bisnis, jualan, atau toko online.",
      "Arahkan percakapan ke jasa pembuatan website dengan natural dan profesional.",
      "Kalau user sudah memberi detail, jangan ulang pertanyaan generik.",
      "Lanjutkan dengan 1-2 pertanyaan spesifik seperti jenis bisnis, fitur utama, target pengguna, referensi desain, timeline, atau budget.",
      "Jika ada sisipan promosi yang relevan, gunakan secara natural."
    ].join("\n")
  },
  {
    type: "FALLBACK_PERSONAL",
    name: "Default Personal Fallback",
    content: "Oke, boleh ceritain atau jelasin sedikit konteksnya ya biar aku bantu jawab dengan lebih nyambung dan enak dipahami."
  },
  {
    type: "FALLBACK_SALES",
    name: "Default Sales Fallback",
    content: "{{promotionSnippet}}\n\nSiap kak, supaya kami bisa bantu lebih tepat, boleh jelaskan tujuan utamanya dan fitur yang paling dibutuhkan?"
  },
  {
    type: "FOLLOWUP_STAGE_1",
    name: "Default Follow-up Stage 1",
    content: "Halo kak 😊 kemarin sempat tanya soal website.\nMasih butuh bantuan?"
  },
  {
    type: "FOLLOWUP_STAGE_2",
    name: "Default Follow-up Stage 2",
    content: "Kami siap bantu kapan saja ya kak 🙏\nKalau ada pertanyaan tinggal bilang saja."
  },
  {
    type: "FOLLOWUP_STAGE_3",
    name: "Default Follow-up Stage 3",
    content: "Terakhir ya kak 😊\nKalau masih butuh jasa website, kami siap bantu."
  }
];

function cleanupTemplateResult(content: string) {
  return content
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function renderPromptTemplate(template: string, variables: Record<string, string | undefined>) {
  const rendered = Object.entries(variables).reduce((result, [key, value]) => {
    return result.replaceAll(`{{${key}}}`, (value || "").trim());
  }, template);

  return cleanupTemplateResult(rendered);
}

export async function ensureDefaultPromptCards() {
  for (const promptCard of DEFAULT_PROMPT_CARDS) {
    const existing = await findPromptCardByTypeName(promptCard.type, promptCard.name);

    if (!existing) {
      await createPromptCard({
        type: promptCard.type,
        name: promptCard.name,
        content: promptCard.content,
        isActive: false
      });
    }
  }

  for (const type of PROMPT_CARD_TYPES) {
    const active = await findActivePromptCard(type);

    if (!active) {
      const fallbackDefault = DEFAULT_PROMPT_CARDS.find((item) => item.type === type);

      if (fallbackDefault) {
        const promptCard = await findPromptCardByTypeName(type, fallbackDefault.name);

        if (promptCard) {
          await createActiveDefaultIfNeeded(promptCard.id, type);
        }
      }
    }
  }
}

async function createActiveDefaultIfNeeded(promptCardId: string, type: PromptType) {
  const cards = await listPromptCards();
  const sameType = cards.filter((card) => card.type === type);

  if (sameType.some((card) => card.isActive)) {
    return;
  }

  await activatePromptCard(promptCardId, type);
}

export async function getActivePromptCardMap() {
  await ensureDefaultPromptCards();
  const cards = await listPromptCards();

  const byType = new Map<PromptType, string>();

  for (const type of PROMPT_CARD_TYPES) {
    const active = cards.find((card) => card.type === type && card.isActive) || cards.find((card) => card.type === type);

    if (!active) {
      throw new Error(`Prompt card aktif untuk type ${type} tidak ditemukan.`);
    }

    byType.set(type, active.content);
  }

  return {
    systemBase: byType.get("SYSTEM_BASE") || "",
    personalMode: byType.get("PERSONAL_MODE") || "",
    salesMode: byType.get("SALES_MODE") || "",
    fallbackPersonal: byType.get("FALLBACK_PERSONAL") || "",
    fallbackSales: byType.get("FALLBACK_SALES") || "",
    followupStage1: byType.get("FOLLOWUP_STAGE_1") || "",
    followupStage2: byType.get("FOLLOWUP_STAGE_2") || "",
    followupStage3: byType.get("FOLLOWUP_STAGE_3") || ""
  };
}

export async function getFollowupPromptContent(stage: FollowupStage) {
  const prompts = await getActivePromptCardMap();

  if (stage === 1) {
    return prompts.followupStage1;
  }

  if (stage === 2) {
    return prompts.followupStage2;
  }

  return prompts.followupStage3;
}
