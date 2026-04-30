import Link from "next/link";
import type { Route } from "next";
import { requireAppWorkspace } from "@/lib/auth";
import { signOutAction } from "@/app/auth/actions";

const navItems: Array<{ href: Route; label: string }> = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/contacts", label: "Contacts" },
  { href: "/dashboard/conversations", label: "Conversations" },
  { href: "/dashboard/whatsapp", label: "WhatsApp" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/admin", label: "Admin" }
];

export default async function DashboardLayout(props: { children: React.ReactNode }) {
  const { profile, subscription } = await requireAppWorkspace();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 py-6 lg:flex-row lg:px-10">
      <aside className="panel h-fit w-full p-5 lg:sticky lg:top-6 lg:w-80">
        <p className="text-xs uppercase tracking-[0.22em] text-ember/80">Tenant</p>
        <h1 className="mt-3 font-display text-3xl text-ink">{profile.businessName || profile.email}</h1>
        <p className="mt-2 text-sm text-ink/65">{profile.email}</p>
        <div className="mt-6 rounded-[24px] bg-ink px-5 py-4 text-sand">
          <p className="text-sm text-sand/70">Paket aktif</p>
          <p className="mt-2 text-2xl">{subscription.plan}</p>
          <p className="mt-2 text-sm text-sand/80">
            {subscription.usageCount} / {subscription.limitCount} chat terpakai
          </p>
        </div>

        <nav className="mt-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-2xl px-4 py-3 text-sm text-ink/75 transition hover:bg-white/65 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form action={signOutAction} className="mt-6">
          <button type="submit" className="button-secondary w-full">
            Keluar
          </button>
        </form>
      </aside>

      <section className="w-full">{props.children}</section>
    </main>
  );
}
