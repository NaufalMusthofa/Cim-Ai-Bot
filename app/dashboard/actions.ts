"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin, requireAppWorkspace } from "@/lib/auth";
import { activateProPlan } from "@/services/subscription/subscription.service";
import {
  clearUpgradeRequest,
  markUpgradeRequested,
  updateWhatsAppConnection
} from "@/repositories/profile.repository";

function getValue(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function saveWhatsAppConnectionAction(formData: FormData) {
  const { profile } = await requireAppWorkspace();
  const fonnteToken = getValue(formData, "fonnteToken");

  if (!fonnteToken) {
    redirect("/dashboard/whatsapp?error=Token Fonnte wajib diisi.");
  }

  await updateWhatsAppConnection(profile.id, {
    fonnteToken
  });

  revalidatePath("/dashboard/whatsapp");
  redirect("/dashboard/whatsapp?message=Token Fonnte berhasil disimpan.");
}

export async function regenerateWebhookKeyAction() {
  const { profile } = await requireAppWorkspace();

  await updateWhatsAppConnection(profile.id, {
    webhookKey: randomUUID().replace(/-/g, "")
  });

  revalidatePath("/dashboard/whatsapp");
  redirect("/dashboard/whatsapp?message=Webhook key berhasil diganti.");
}

export async function requestUpgradeAction() {
  const { profile } = await requireAppWorkspace();
  await markUpgradeRequested(profile.id);
  revalidatePath("/dashboard/billing");
  redirect("/dashboard/billing?message=Permintaan upgrade dicatat. Tunggu verifikasi admin maksimal 1x24 jam.");
}

export async function activateProAction(formData: FormData) {
  await assertAdmin();
  const userId = getValue(formData, "userId");

  await activateProPlan(userId);
  await clearUpgradeRequest(userId);

  revalidatePath("/dashboard/admin");
  redirect("/dashboard/admin?message=Plan PRO berhasil diaktifkan.");
}
