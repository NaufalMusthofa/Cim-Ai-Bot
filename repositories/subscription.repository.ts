import { prisma } from "@/lib/prisma";

export async function findLatestSubscriptionByProfileId(profileId: string) {
  return prisma.subscription.findFirst({
    where: { profileId },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function createSubscription(input: {
  profileId: string;
  plan: "FREE" | "PRO";
  limitCount: number;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}) {
  return prisma.subscription.create({
    data: {
      profileId: input.profileId,
      plan: input.plan,
      limitCount: input.limitCount,
      currentPeriodStart: input.currentPeriodStart,
      currentPeriodEnd: input.currentPeriodEnd
    }
  });
}

export async function updateSubscription(
  subscriptionId: string,
  data: {
    plan?: "FREE" | "PRO";
    usageCount?: number;
    limitCount?: number;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
  }
) {
  return prisma.subscription.update({
    where: { id: subscriptionId },
    data
  });
}
