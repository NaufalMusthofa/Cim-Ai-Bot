import type { FollowupStage, PlanType } from "@/types/domain";

export const APP_NAME = "CIM AI";
export const AI_MODEL = "gemini-2.5-flash";

export const PLAN_LIMITS: Record<PlanType, number> = {
  FREE: 25,
  PRO: 300
};

export const FOLLOWUP_SCHEDULE_DAYS: Record<FollowupStage, number> = {
  1: 1,
  2: 3,
  3: 5
};

export const KEYWORD_TRIGGER_MAP = {
  website: "Kami juga menyediakan jasa pembuatan website kak 😊",
  jualan: "Kalau kakak ingin jualan lebih rapi, kami juga bisa bantu buatkan website jualannya 😊",
  bisnis: "Kami juga menyediakan jasa pembuatan website untuk bantu perkembangan bisnis kak 😊",
  "online shop": "Kalau online shop kakak butuh tampilan yang lebih profesional, kami siap bantu buatkan websitenya 😊"
} as const;

export const HELP_MESSAGE = [
  "Halo kak 😊",
  "",
  "Perintah yang tersedia:",
  "/help - lihat bantuan",
  "/status - cek paket dan sisa limit",
  "/upgrade - lihat cara upgrade ke PRO"
].join("\n");

export const UPGRADE_MESSAGE = [
  "Upgrade ke paket PRO hanya Rp150.000 / bulan 😊",
  "",
  "Benefit yang kamu dapat:",
  "✔ 300 chat per bulan",
  "✔ Balasan AI lebih cepat & stabil",
  "✔ Prioritas support",
  "",
  "Silakan transfer ke:",
  "",
  "DANA: 085157996453",
  "a.n Nopal",
  "",
  "Setelah transfer, kirim bukti pembayaran ya 🙏",
  "Nanti akan kami aktifkan maksimal 1x24 jam."
].join("\n");

export const LIMIT_REACHED_MESSAGE = [
  "Limit chat paket kamu sudah habis ya kak 🙏",
  "",
  "Ketik /status untuk cek penggunaan saat ini atau /upgrade untuk info upgrade ke paket PRO."
].join("\n");
