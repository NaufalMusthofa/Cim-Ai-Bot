import { getAdminNotificationEmail, getAdminNotificationPhone, getAdminNotifierToken } from "@/lib/env";
import { sendEmailNotification } from "@/services/notification/email.service";
import { sendWhatsAppMessage } from "@/services/whatsapp/fonnte.service";

export async function sendAdminPaymentNotification(input: {
  tenantEmail: string;
  businessName?: string | null;
  tenantPhone?: string | null;
  plan: "FREE" | "PRO";
  amount: number;
  requestedAt: Date;
  senderNote?: string | null;
}) {
  const adminPhone = getAdminNotificationPhone();
  const adminEmail = getAdminNotificationEmail();
  const adminNotifierToken = getAdminNotifierToken();

  const message = [
    "📢 PENGAJUAN PEMBAYARAN BARU",
    "",
    `Tenant: ${input.businessName || "-"}`,
    `Email: ${input.tenantEmail}`,
    `No. WhatsApp Tenant: ${input.tenantPhone || "-"}`,
    `Plan: ${input.plan}`,
    `Nominal: Rp${input.amount.toLocaleString("id-ID")}`,
    `Waktu submit: ${input.requestedAt.toLocaleString("id-ID")}`,
    `Catatan: ${input.senderNote || "-"}`,
    "",
    "Silakan cek dashboard admin untuk review bukti transfer."
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2 style="margin:0 0 16px">Pengajuan Pembayaran Baru</h2>
      <p><strong>Tenant:</strong> ${input.businessName || "-"}</p>
      <p><strong>Email:</strong> ${input.tenantEmail}</p>
      <p><strong>No. WhatsApp Tenant:</strong> ${input.tenantPhone || "-"}</p>
      <p><strong>Plan:</strong> ${input.plan}</p>
      <p><strong>Nominal:</strong> Rp${input.amount.toLocaleString("id-ID")}</p>
      <p><strong>Waktu submit:</strong> ${input.requestedAt.toLocaleString("id-ID")}</p>
      <p><strong>Catatan:</strong> ${input.senderNote || "-"}</p>
      <p>Silakan cek dashboard admin untuk review bukti transfer.</p>
    </div>
  `;

  let whatsapp = {
    ok: false,
    reason: "missing_whatsapp_env"
  };

  if (adminPhone && adminNotifierToken) {
    try {
      await sendWhatsAppMessage({
        token: adminNotifierToken,
        target: adminPhone,
        message
      });
      whatsapp = {
        ok: true,
        reason: ""
      };
    } catch (error) {
      whatsapp = {
        ok: false,
        reason: error instanceof Error ? error.message : "unknown_whatsapp_error"
      };
    }
  }

  if (whatsapp.ok) {
    return {
      ok: true as const,
      deliveredVia: "whatsapp" as const,
      whatsapp,
      email: {
        ok: false,
        reason: "skipped_after_whatsapp_success"
      }
    };
  }

  const email = await sendEmailNotification({
    to: adminEmail,
    subject: `Pengajuan pembayaran baru - ${input.businessName || input.tenantEmail}`,
    text: message,
    html
  });

  if (email.ok) {
    return {
      ok: true as const,
      deliveredVia: "email" as const,
      whatsapp,
      email
    };
  }

  return {
    ok: false as const,
    deliveredVia: null,
    whatsapp,
    email
  };
}
