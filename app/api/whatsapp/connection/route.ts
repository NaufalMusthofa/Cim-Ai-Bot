import { NextResponse } from "next/server";
import { requireAppWorkspace } from "@/lib/auth";
import { updateWhatsAppConnection } from "@/repositories/profile.repository";

export async function POST(request: Request) {
  const { profile } = await requireAppWorkspace();
  const body = (await request.json()) as {
    fonnteToken?: string;
    webhookKey?: string;
  };

  if (!body.fonnteToken && !body.webhookKey) {
    return NextResponse.json(
      {
        error: "fonnteToken atau webhookKey wajib dikirim"
      },
      {
        status: 400
      }
    );
  }

  const updated = await updateWhatsAppConnection(profile.id, {
    fonnteToken: body.fonnteToken,
    webhookKey: body.webhookKey
  });

  return NextResponse.json({
    status: "ok",
    profileId: updated.id,
    webhookKey: updated.webhookKey
  });
}
