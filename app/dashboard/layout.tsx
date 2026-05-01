import { DashboardShell } from "@/components/dashboard-shell";
import { getAppWorkspaceContext } from "@/lib/auth";

export default async function DashboardLayout(props: { children: React.ReactNode }) {
  const { profile, subscription, isAdmin } = await getAppWorkspaceContext();
  const businessName = profile.businessName || profile.email;

  return (
    <DashboardShell
      businessName={businessName}
      email={profile.email}
      plan={subscription.plan}
      usageCount={subscription.usageCount}
      limitCount={subscription.limitCount}
      isAdmin={isAdmin}
    >
      {props.children}
    </DashboardShell>
  );
}
