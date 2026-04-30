import { NextResponse } from "next/server";
import { requireAppWorkspace } from "@/lib/auth";
import { getRemainingQuota } from "@/services/subscription/subscription.service";

export async function GET() {
  const { profile, subscription } = await requireAppWorkspace();

  return NextResponse.json({
    profileId: profile.id,
    plan: subscription.plan,
    usageCount: subscription.usageCount,
    limitCount: subscription.limitCount,
    remaining: getRemainingQuota(subscription),
    currentPeriodEnd: subscription.currentPeriodEnd
  });
}
