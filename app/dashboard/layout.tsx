import { signOutAction } from "@/app/auth/actions";
import { DashboardSidebarNav } from "@/components/dashboard-sidebar-nav";
import { PillBadge } from "@/components/pill-badge";
import { getAppWorkspaceContext } from "@/lib/auth";

function SidebarContent(props: {
  businessName: string;
  email: string;
  plan: string;
  usageCount: number;
  limitCount: number;
  isAdmin: boolean;
}) {
  const usagePercent = props.limitCount ? Math.min(100, Math.round((props.usageCount / props.limitCount) * 100)) : 0;

  return (
    <div className="flex h-full flex-col gap-6 p-5 lg:p-6">
      <div className="sidebar-brand-card p-5">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-lg font-semibold text-white shadow-[0_18px_36px_rgba(37,99,235,0.34)]">
            AI
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300/55">CIM AI Workspace</p>
            <h1 className="mt-2 truncate text-2xl font-semibold text-white">{props.businessName}</h1>
            <p className="mt-1 truncate text-sm text-slate-300/70">{props.email}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <PillBadge
            label={props.plan}
            tone={props.plan === "PRO" ? "violet" : "blue"}
            className={props.plan === "PRO" ? "bg-violet-500/15 text-violet-100 ring-violet-300/20" : "bg-cyan-500/15 text-cyan-100 ring-cyan-300/20"}
          />
          <span className="text-xs text-slate-300/70">
            {props.usageCount} / {props.limitCount} chat terpakai
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-300/65">
            <span>Usage</span>
            <span>{usagePercent}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto glass-scroll pr-1">
        <DashboardSidebarNav isAdmin={props.isAdmin} />
      </div>

      <div className="sidebar-brand-card p-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold text-white">
            {props.businessName.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{props.businessName}</p>
            <p className="truncate text-xs text-slate-300/70">{props.email}</p>
          </div>
        </div>

        <form action={signOutAction} className="mt-4">
          <button type="submit" className="button-secondary w-full border-white/10 bg-white/8 text-white hover:bg-white/14">
            Keluar dari Workspace
          </button>
        </form>
      </div>
    </div>
  );
}

export default async function DashboardLayout(props: { children: React.ReactNode }) {
  const { profile, subscription, isAdmin } = await getAppWorkspaceContext();
  const businessName = profile.businessName || profile.email;

  return (
    <main className="min-h-screen px-4 py-4 lg:px-5">
      <div className="mx-auto max-w-[1680px]">
        <details className="lg:hidden">
          <summary className="sidebar-mobile-summary">
            <span>
              <span className="block text-sm font-semibold">Menu Workspace</span>
              <span className="mt-1 block text-xs text-slate-500">Navigasi chat, billing, prompt, dan admin.</span>
            </span>
            <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
              {subscription.plan}
            </span>
          </summary>

          <div className="mt-4">
            <aside className="sidebar-shell">
              <SidebarContent
                businessName={businessName}
                email={profile.email}
                plan={subscription.plan}
                usageCount={subscription.usageCount}
                limitCount={subscription.limitCount}
                isAdmin={isAdmin}
              />
            </aside>
          </div>
        </details>

        <div className="mt-4 flex min-h-[calc(100vh-2rem)] flex-col gap-5 lg:mt-0 lg:flex-row">
          <aside className="hidden lg:block lg:w-[330px] lg:flex-none">
            <div className="sidebar-shell sticky top-4 h-[calc(100vh-2rem)] overflow-hidden">
              <SidebarContent
                businessName={businessName}
                email={profile.email}
                plan={subscription.plan}
                usageCount={subscription.usageCount}
                limitCount={subscription.limitCount}
                isAdmin={isAdmin}
              />
            </div>
          </aside>

          <section className="min-w-0 flex-1 space-y-6">{props.children}</section>
        </div>
      </div>
    </main>
  );
}
