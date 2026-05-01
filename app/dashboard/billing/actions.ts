"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAppWorkspace } from "@/lib/auth";
import { submitPaymentRequest } from "@/services/payment/payment.service";

function getValue(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function submitPaymentRequestAction(formData: FormData) {
  const { profile } = await requireAppWorkspace();
  const senderNote = getValue(formData, "senderNote");
  const proofFile = formData.get("proofFile");
  let adminNotificationOk = true;

  if (!(proofFile instanceof File) || proofFile.size <= 0) {
    redirect("/dashboard/billing?error=Bukti%20transfer%20wajib%20diunggah." as Route);
  }

  try {
    const result = await submitPaymentRequest({
      profileId: profile.id,
      tenantEmail: profile.email,
      businessName: profile.businessName,
      tenantPhone: profile.whatsappNumber,
      file: proofFile,
      senderNote
    });

    adminNotificationOk = result.adminNotification.ok;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengirim pengajuan pembayaran.";
    redirect(`/dashboard/billing?error=${encodeURIComponent(message)}` as Route);
  }

  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard/admin/payments");

  if (!adminNotificationOk) {
    redirect(
      `/dashboard/billing?message=${encodeURIComponent("Pengajuan pembayaran berhasil disimpan.")}&notice=${encodeURIComponent(
        "Notifikasi WhatsApp ke admin belum berhasil terkirim. Cek token notifier, nomor admin, atau status device Fonnte."
      )}` as Route
    );
  }

  redirect("/dashboard/billing?message=Pengajuan%20pembayaran%20berhasil%20dikirim.%20Tunggu%20review%20admin." as Route);
}
