import { getAdminNotificationPhone, getAdminNotifierToken } from "@/lib/env";
import { sendWhatsAppMessage } from "@/services/whatsapp/fonnte.service";

export async function sendAdminPaymentNotification(input: {
  tenantEmail: string;
  businessName?: string | null;
  plan: "FREE" | "PRO";
  amount: number;
  requestedAt: Date;
  senderNote?: string | null;
}) {
  const adminPhone = getAdminNotificationPhone();
  const adminNotifierToken = getAdminNotifierToken();

  if (!adminPhone || !adminNotifierToken) {
    return {
      ok: false as const,
      reason: "missing_admin_notifier_env"
    };
  }

  const message = [
    "📢 PENGAJUAN PEMBAYARAN BARU",
    "",
    `Tenant: ${input.businessName || "-"}`,
    `Email: ${input.tenantEmail}`,
    `Plan: ${input.plan}`,
    `Nominal: Rp${input.amount.toLocaleString("id-ID")}`,
    `Waktu submit: ${input.requestedAt.toLocaleString("id-ID")}`,
    `Catatan: ${input.senderNote || "-"}`,
    "",
    "Silakan cek dashboard admin untuk review bukti transfer."
  ].join("\n");

  await sendWhatsAppMessage({
    token: adminNotifierToken,
    target: adminPhone,
    message
  });

  return {
    ok: true as const
  };
}
