import { randomUUID } from "node:crypto";
import { getDefaultFonnteNumber, getDefaultFonnteToken } from "@/lib/env";
import { ensureProfile, findProfileById } from "@/repositories/profile.repository";
import { updateWhatsAppConnection } from "@/repositories/profile.repository";
import { ensureSubscriptionForPlan } from "@/services/subscription/subscription.service";

export async function ensureWorkspaceForUser(input: {
  id: string;
  email: string;
  businessName?: string | null;
}) {
  const existing = await findProfileById(input.id);
  const webhookKey = existing?.webhookKey ?? randomUUID().replace(/-/g, "");
  const defaultFonnteToken = getDefaultFonnteToken() || undefined;
  const defaultFonnteNumber = getDefaultFonnteNumber() || undefined;

  const profile = await ensureProfile({
    id: input.id,
    email: input.email,
    businessName: input.businessName,
    whatsappNumber: existing?.whatsappNumber ?? defaultFonnteNumber,
    webhookKey,
    fonnteToken: existing?.fonnteToken ?? defaultFonnteToken
  });

  if ((!profile.fonnteToken && defaultFonnteToken) || (!profile.whatsappNumber && defaultFonnteNumber)) {
    await updateWhatsAppConnection(profile.id, {
      ...(profile.fonnteToken ? {} : { fonnteToken: defaultFonnteToken }),
      ...(profile.whatsappNumber ? {} : { whatsappNumber: defaultFonnteNumber })
    });
  }

  const subscription = await ensureSubscriptionForPlan(profile.id, profile.plan);

  return {
    profile,
    subscription
  };
}
