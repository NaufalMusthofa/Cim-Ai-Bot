import { after, NextResponse } from "next/server";
import { findProfileByWebhook } from "@/repositories/profile.repository";
import { parseFonntePayload } from "@/services/webhook/fonnte-payload";
import { processFonnteWebhook } from "@/services/webhook/fonnte-orchestrator.service";

export async function POST(
  request: Request,
  context: { params: Promise<{ tenantId: string; webhookKey: string }> }
) {
  const { tenantId, webhookKey } = await context.params;
  const profile = await findProfileByWebhook(tenantId, webhookKey);

  if (!profile) {
    return NextResponse.json(
      {
        accepted: false,
        error: "Invalid webhook credentials"
      },
      {
        status: 401
      }
    );
  }

  const payload = await parseFonntePayload(request);

  after(async () => {
    await processFonnteWebhook({
      tenantId,
      webhookKey,
      payload
    });
  });

  return NextResponse.json({
    accepted: true
  });
}
