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

  if (!(proofFile instanceof File) || proofFile.size <= 0) {
    redirect("/dashboard/billing?error=Bukti%20transfer%20wajib%20diunggah." as Route);
  }

  try {
    await submitPaymentRequest({
      profileId: profile.id,
      tenantEmail: profile.email,
      businessName: profile.businessName,
      file: proofFile,
      senderNote
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengirim pengajuan pembayaran.";
    redirect(`/dashboard/billing?error=${encodeURIComponent(message)}` as Route);
  }

  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard/admin/payments");
  redirect("/dashboard/billing?message=Pengajuan%20pembayaran%20berhasil%20dikirim.%20Tunggu%20review%20admin." as Route);
}
