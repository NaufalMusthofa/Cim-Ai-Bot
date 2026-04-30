import { NextResponse } from "next/server";
import { runFollowupScheduler } from "@/services/trigger/scheduler.service";

export async function GET() {
  const result = await runFollowupScheduler();
  return NextResponse.json(result);
}
