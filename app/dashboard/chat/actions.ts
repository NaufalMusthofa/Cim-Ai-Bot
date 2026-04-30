"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAppWorkspace } from "@/lib/auth";
import { findContactByIdForProfile, updateContactAfterReply, updateContactMode } from "@/repositories/contact.repository";
import { findOrCreateConversation, touchConversation } from "@/repositories/conversation.repository";
import { createMessage } from "@/repositories/message.repository";
import { cancelPendingFollowups } from "@/services/trigger/followup.service";
import { sendWhatsAppMessage } from "@/services/whatsapp/fonnte.service";
import type { ContactMode } from "@/types/domain";

function getValue(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function buildChatRedirect(contactId: string, query: string) {
  return `/dashboard/chat?contact=${contactId}&${query}` as Route;
}

export async function switchContactModeAction(formData: FormData) {
  const { profile } = await requireAppWorkspace();
  const contactId = getValue(formData, "contactId");
  const mode = getValue(formData, "mode") as ContactMode;

  if (mode !== "AI" && mode !== "HUMAN") {
    redirect("/dashboard/chat?error=Mode%20contact%20tidak%20valid." as Route);
  }

  const contact = await findContactByIdForProfile(profile.id, contactId);

  if (!contact) {
    redirect("/dashboard/chat?error=Contact%20tidak%20ditemukan." as Route);
  }

  await updateContactMode(contact.id, mode);

  if (mode === "HUMAN") {
    await cancelPendingFollowups(contact.id);
  }

  revalidatePath("/dashboard/chat");
  revalidatePath("/dashboard/contacts");
  redirect(buildChatRedirect(contact.id, `message=Mode berhasil diubah ke ${mode}.`));
}

export async function sendManualReplyAction(formData: FormData) {
  const { profile } = await requireAppWorkspace();
  const contactId = getValue(formData, "contactId");
  const message = getValue(formData, "message");

  if (!message) {
    redirect("/dashboard/chat?error=Pesan%20balasan%20manual%20wajib%20diisi." as Route);
  }

  const contact = await findContactByIdForProfile(profile.id, contactId);

  if (!contact) {
    redirect("/dashboard/chat?error=Contact%20tidak%20ditemukan." as Route);
  }

  if (!profile.fonnteToken) {
    redirect(buildChatRedirect(contact.id, "error=Token Fonnte tenant belum tersedia."));
  }

  const conversation = await findOrCreateConversation(contact.id);

  await sendWhatsAppMessage({
    token: profile.fonnteToken,
    target: contact.phone,
    message
  });

  await Promise.all([
    createMessage({
      conversationId: conversation.id,
      contactId: contact.id,
      role: "HUMAN",
      content: message
    }),
    updateContactAfterReply(contact.id, new Date()),
    touchConversation(conversation.id, new Date())
  ]);

  revalidatePath("/dashboard/chat");
  revalidatePath("/dashboard/contacts");
  redirect(buildChatRedirect(contact.id, "message=Balasan manual berhasil dikirim."));
}
