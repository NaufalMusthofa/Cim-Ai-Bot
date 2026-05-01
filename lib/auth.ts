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

export function isAdminEmail(email?: string | null) {
  const adminEmails = getAdminEmails();

  return adminEmails.length === 0 && process.env.NODE_ENV !== "production"
    ? true
    : adminEmails.includes(email?.toLowerCase() || "");
}

export async function getAppWorkspaceContext() {
  const user = await requireAppSession();
  const workspace = await ensureWorkspaceForUser({
    id: user.id,
    email: user.email || "",
    businessName: user.user_metadata?.business_name as string | undefined
  });

  return {
    user,
    isAdmin: isAdminEmail(user.email),
    ...workspace
  };
}

export async function requireAppWorkspace() {
  const { profile, subscription } = await getAppWorkspaceContext();

  return {
    profile,
    subscription
  };
}

export async function assertAdmin() {
  const user = await requireAppSession();
  const isAdmin = isAdminEmail(user.email);

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return user;
}
