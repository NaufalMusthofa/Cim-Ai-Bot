import { NextResponse } from "next/server";
import { requireAppWorkspace } from "@/lib/auth";
import { listContactsByProfile } from "@/repositories/contact.repository";

export async function GET() {
  const { profile } = await requireAppWorkspace();
  const contacts = await listContactsByProfile(profile.id);

  return NextResponse.json({
    items: contacts
  });
}
