import { prisma } from "@/lib/prisma";
import type { PlanType } from "@/types/domain";

export async function findProfileById(profileId: string) {
  return prisma.profile.findUnique({
    where: { id: profileId }
  });
}

export async function findProfileByWebhook(profileId: string, webhookKey: string) {
  return prisma.profile.findFirst({
    where: {
      id: profileId,
      webhookKey
    }
  });
}

export async function ensureProfile(input: {
  id: string;
  email: string;
  businessName?: string | null;
  whatsappNumber?: string | null;
  webhookKey: string;
  fonnteToken?: string;
}) {
  return prisma.profile.upsert({
    where: { id: input.id },
    update: {
      email: input.email,
      businessName: input.businessName ?? undefined,
      ...(input.whatsappNumber !== undefined ? { whatsappNumber: input.whatsappNumber || null } : {})
    },
    create: {
      id: input.id,
      email: input.email,
      businessName: input.businessName ?? undefined,
      whatsappNumber: input.whatsappNumber ?? undefined,
      webhookKey: input.webhookKey,
      fonnteToken: input.fonnteToken
    }
  });
}

export async function updateWhatsAppConnection(
  profileId: string,
  input: {
    fonnteToken?: string;
    whatsappNumber?: string | null;
    webhookKey?: string;
  }
) {
  return prisma.profile.update({
    where: { id: profileId },
    data: {
      ...(input.fonnteToken !== undefined ? { fonnteToken: input.fonnteToken } : {}),
      ...(input.whatsappNumber !== undefined ? { whatsappNumber: input.whatsappNumber || null } : {}),
      ...(input.webhookKey !== undefined ? { webhookKey: input.webhookKey } : {})
    }
  });
}

export async function markUpgradeRequested(profileId: string) {
  return prisma.profile.update({
    where: { id: profileId },
    data: {
      upgradeRequestedAt: new Date()
    }
  });
}

export async function clearUpgradeRequest(profileId: string) {
  return prisma.profile.update({
    where: { id: profileId },
    data: {
      upgradeRequestedAt: null
    }
  });
}

export async function updatePlan(profileId: string, plan: PlanType) {
  return prisma.profile.update({
    where: { id: profileId },
    data: { plan }
  });
}

export async function listProfilesPendingUpgrade() {
  return prisma.profile.findMany({
    where: {
      upgradeRequestedAt: {
        not: null
      }
    },
    orderBy: {
      upgradeRequestedAt: "asc"
    }
  });
}
