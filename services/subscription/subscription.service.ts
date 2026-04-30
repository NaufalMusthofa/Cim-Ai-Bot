import type { Subscription } from "@prisma/client";
import { PLAN_LIMITS } from "@/lib/constants";
import { findLatestSubscriptionByProfileId, createSubscription, updateSubscription } from "@/repositories/subscription.repository";
import { updatePlan } from "@/repositories/profile.repository";
import type { PlanType, SubscriptionWindow } from "@/types/domain";

export function createSubscriptionWindow(
  plan: PlanType,
  now = new Date()
): SubscriptionWindow & { limitCount: number } {
  const currentPeriodStart = new Date(now);
  const currentPeriodEnd = new Date(now);

  if (plan === "FREE") {
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 1);
  } else {
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
  }

  return {
    currentPeriodStart,
    currentPeriodEnd,
    limitCount: PLAN_LIMITS[plan]
  };
}

export function isSubscriptionExpired(subscription: Pick<Subscription, "currentPeriodEnd">, now = new Date()) {
  return subscription.currentPeriodEnd <= now;
}

export function getRemainingQuota(subscription: Pick<Subscription, "usageCount" | "limitCount">) {
  return Math.max(subscription.limitCount - subscription.usageCount, 0);
}

export function hasRemainingQuota(subscription: Pick<Subscription, "usageCount" | "limitCount">) {
  return getRemainingQuota(subscription) > 0;
}

export async function ensureSubscriptionForPlan(profileId: string, plan: PlanType, now = new Date()) {
  const existing = await findLatestSubscriptionByProfileId(profileId);

  if (!existing) {
    const window = createSubscriptionWindow(plan, now);
    return createSubscription({
      profileId,
      plan,
      limitCount: window.limitCount,
      currentPeriodStart: window.currentPeriodStart,
      currentPeriodEnd: window.currentPeriodEnd
    });
  }

  if (existing.plan !== plan || isSubscriptionExpired(existing, now)) {
    const window = createSubscriptionWindow(plan, now);
    return updateSubscription(existing.id, {
      plan,
      usageCount: 0,
      limitCount: window.limitCount,
      currentPeriodStart: window.currentPeriodStart,
      currentPeriodEnd: window.currentPeriodEnd
    });
  }

  if (existing.limitCount !== PLAN_LIMITS[plan]) {
    return updateSubscription(existing.id, {
      limitCount: PLAN_LIMITS[plan]
    });
  }

  return existing;
}

export async function incrementSubscriptionUsage(subscriptionId: string, nextUsageCount: number) {
  return updateSubscription(subscriptionId, {
    usageCount: nextUsageCount
  });
}

export async function activateProPlan(profileId: string, now = new Date()) {
  await updatePlan(profileId, "PRO");
  return ensureSubscriptionForPlan(profileId, "PRO", now);
}
