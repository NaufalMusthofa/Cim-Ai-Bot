import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminEmails } from "@/lib/env";
import { ensureWorkspaceForUser } from "@/services/account/account.service";

export async function requireAppSession() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/auth");
  }

  return user;
}

export async function requireAppWorkspace() {
  const user = await requireAppSession();
  return ensureWorkspaceForUser({
    id: user.id,
    email: user.email || "",
    businessName: user.user_metadata?.business_name as string | undefined
  });
}

export async function assertAdmin() {
  const user = await requireAppSession();
  const adminEmails = getAdminEmails();
  const isAdmin =
    adminEmails.length === 0 && process.env.NODE_ENV !== "production"
      ? true
      : adminEmails.includes(user.email?.toLowerCase() || "");

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return user;
}
