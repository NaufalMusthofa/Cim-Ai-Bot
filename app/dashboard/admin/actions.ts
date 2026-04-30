"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/auth";
import {
  activatePromptCard,
  createPromptCard,
  deletePromptCard,
  findPromptCardById,
  listPromptCardsByType,
  updatePromptCard
} from "@/repositories/prompt-card.repository";
import { approvePaymentRequest, rejectPaymentRequest } from "@/services/payment/payment.service";
import { ensureDefaultPromptCards } from "@/services/ai/prompt-card.service";
import type { PromptType } from "@/types/domain";

function getValue(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function isPromptType(value: string): value is PromptType {
  return [
    "SYSTEM_BASE",
    "PERSONAL_MODE",
    "SALES_MODE",
    "FALLBACK_PERSONAL",
    "FALLBACK_SALES",
    "FOLLOWUP_STAGE_1",
    "FOLLOWUP_STAGE_2",
    "FOLLOWUP_STAGE_3"
  ].includes(value);
}

export async function approvePaymentRequestAction(formData: FormData) {
  const admin = await assertAdmin();
  const paymentRequestId = getValue(formData, "paymentRequestId");

  await approvePaymentRequest({
    paymentRequestId,
    reviewerEmail: admin.email || ""
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/payments");
  revalidatePath("/dashboard/billing");
  redirect("/dashboard/admin/payments?message=Payment%20berhasil%20di-approve%20dan%20PRO%20diaktifkan." as Route);
}

export async function rejectPaymentRequestAction(formData: FormData) {
  const admin = await assertAdmin();
  const paymentRequestId = getValue(formData, "paymentRequestId");
  const reviewNote = getValue(formData, "reviewNote");

  await rejectPaymentRequest({
    paymentRequestId,
    reviewerEmail: admin.email || "",
    reviewNote
  });

  revalidatePath("/dashboard/admin/payments");
  revalidatePath("/dashboard/billing");
  redirect("/dashboard/admin/payments?message=Payment%20berhasil%20ditolak." as Route);
}

export async function createPromptCardAction(formData: FormData) {
  await assertAdmin();
  await ensureDefaultPromptCards();
  const type = getValue(formData, "type");
  const name = getValue(formData, "name");
  const content = getValue(formData, "content");

  if (!isPromptType(type)) {
    redirect("/dashboard/admin/prompts?error=Tipe%20prompt%20tidak%20valid." as Route);
  }

  if (!name || !content) {
    redirect("/dashboard/admin/prompts?error=Nama%20dan%20isi%20prompt%20wajib%20diisi." as Route);
  }

  await createPromptCard({
    type,
    name,
    content,
    isActive: false
  });

  revalidatePath("/dashboard/admin/prompts");
  redirect("/dashboard/admin/prompts?message=Prompt%20card%20berhasil%20ditambahkan." as Route);
}

export async function updatePromptCardAction(formData: FormData) {
  await assertAdmin();
  const promptCardId = getValue(formData, "promptCardId");
  const name = getValue(formData, "name");
  const content = getValue(formData, "content");

  await updatePromptCard(promptCardId, {
    name,
    content
  });

  revalidatePath("/dashboard/admin/prompts");
  redirect("/dashboard/admin/prompts?message=Prompt%20card%20berhasil%20diperbarui." as Route);
}

export async function activatePromptCardAction(formData: FormData) {
  await assertAdmin();
  const promptCardId = getValue(formData, "promptCardId");
  const type = getValue(formData, "type");

  if (!isPromptType(type)) {
    redirect("/dashboard/admin/prompts?error=Tipe%20prompt%20tidak%20valid." as Route);
  }

  await activatePromptCard(promptCardId, type);
  revalidatePath("/dashboard/admin/prompts");
  redirect("/dashboard/admin/prompts?message=Prompt%20card%20aktif%20berhasil%20diubah." as Route);
}

export async function deletePromptCardAction(formData: FormData) {
  await assertAdmin();
  const promptCardId = getValue(formData, "promptCardId");
  const promptCard = await findPromptCardById(promptCardId);

  if (!promptCard) {
    redirect("/dashboard/admin/prompts?error=Prompt%20card%20tidak%20ditemukan." as Route);
  }

  const peers = await listPromptCardsByType(promptCard.type);

  if (promptCard.isActive && peers.length <= 1) {
    redirect("/dashboard/admin/prompts?error=Prompt%20card%20aktif%20terakhir%20tidak%20boleh%20dihapus." as Route);
  }

  await deletePromptCard(promptCard.id);

  if (promptCard.isActive) {
    const nextCards = await listPromptCardsByType(promptCard.type);
    const nextActive = nextCards.find((card: (typeof nextCards)[number]) => card.id !== promptCard.id);

    if (nextActive) {
      await activatePromptCard(nextActive.id, promptCard.type);
    }
  }

  revalidatePath("/dashboard/admin/prompts");
  redirect("/dashboard/admin/prompts?message=Prompt%20card%20berhasil%20dihapus." as Route);
}
