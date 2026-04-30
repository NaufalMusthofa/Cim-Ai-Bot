import type { Subscription } from "@prisma/client";
import { HELP_MESSAGE, UPGRADE_MESSAGE } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils";
import { getRemainingQuota } from "@/services/subscription/subscription.service";

export function detectCommand(message: string) {
  const normalized = message.trim().toLowerCase();

  if (normalized === "/help") {
    return "help" as const;
  }

  if (normalized === "/status") {
    return "status" as const;
  }

  if (normalized === "/upgrade") {
    return "upgrade" as const;
  }

  return null;
}

export function getCommandMessage(
  command: ReturnType<typeof detectCommand>,
  subscription?: Pick<Subscription, "plan" | "usageCount" | "limitCount" | "currentPeriodEnd">
) {
  if (command === "help") {
    return HELP_MESSAGE;
  }

  if (command === "upgrade") {
    return UPGRADE_MESSAGE;
  }

  if (command === "status" && subscription) {
    const remaining = getRemainingQuota(subscription);
    return [
      "Status paket kamu saat ini:",
      `Paket: ${subscription.plan}`,
      `Terpakai: ${subscription.usageCount} dari ${subscription.limitCount}`,
      `Sisa limit: ${remaining}`,
      `Reset berikutnya: ${formatDateTime(subscription.currentPeriodEnd)}`
    ].join("\n");
  }

  return [
    "Status paket belum tersedia.",
    `Tanggal cek: ${formatDate(new Date())}`
  ].join("\n");
}
