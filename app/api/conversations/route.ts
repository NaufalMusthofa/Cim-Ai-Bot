import { NextResponse } from "next/server";
import { requireAppWorkspace } from "@/lib/auth";
import { listConversationsByProfile } from "@/repositories/conversation.repository";

export async function GET() {
  const { profile } = await requireAppWorkspace();
  const conversations = await listConversationsByProfile(profile.id);

  return NextResponse.json({
    items: conversations
  });
}
