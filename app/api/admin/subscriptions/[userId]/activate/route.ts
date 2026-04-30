import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth";
import { activateProPlan } from "@/services/subscription/subscription.service";
import { clearUpgradeRequest } from "@/repositories/profile.repository";

export async function POST(
  _request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  await assertAdmin();
  const { userId } = await context.params;

  const subscription = await activateProPlan(userId);
  await clearUpgradeRequest(userId);

  return NextResponse.json({
    status: "ok",
    plan: subscription.plan,
    limitCount: subscription.limitCount
  });
}
