import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { PillBadge } from "@/components/pill-badge";
import { StatCard } from "@/components/stat-card";
import { requireAppWorkspace } from "@/lib/auth";
import { formatDateTime, redactToken } from "@/lib/utils";
import { getDashboardSummary } from "@/repositories/dashboard.repository";

type LatestMessageRow = Awaited<ReturnType<typeof getDashboardSummary>>["latestMessages"][number];

function StatIcon(props: { type: "contacts" | "threads" | "followup" | "plan" }) {
  const className = "h-6 w-6 stroke-current";

  switch (props.type) {
    case "contacts":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M16 19a4 4 0 0 0-8 0m8 0h3m-11 0H5m7-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm6-1.5a2.5 2.5 0 1 0 0-5m-12 5a2.5 2.5 0 1 1 0-5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "threads":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M7 17.5h8.5a4.5 4.5 0 0 0 0-9H8a4.5 4.5 0 1 0 0 9H9l-3.5 3v-3Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "followup":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M6 4h12M9 2v4m6-4v4m-9 7h12M7 10h10a2 2 0 0 1 2 2v6.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 18.5V12a2 2 0 0 1 2-2Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "plan":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M8 6h8m-8 5h8m-8 5h4m-6-12h12a2 2 0 0 1 2 2v12.5a1.5 1.5 0 0 1-2.2 1.3L12 17l-5.8 2.8A1.5 1.5 0 0 1 4 18.5V6a2 2 0 0 1 2-2Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

export default async function DashboardPage() {
  const { profile, subscription } = await requireAppWorkspace();
  const summary = await getDashboardSummary(profile.id);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Dashboard"
        title="Workspace operasional tenant yang simpel, rapi, dan enak dibaca."
        description="Semua alur WhatsApp, AI, CRM, billing, dan follow-up tetap berjalan seperti sebelumnya, tapi sekarang ditata sebagai panel kerja yang lebih jelas untuk operasional harian."
        meta={
          <>
            <PillBadge label={subscription.plan} tone={subscription.plan === "PRO" ? "violet" : "blue"} />
            <PillBadge label={`${subscription.usageCount}/${subscription.limitCount} usage`} tone="slate" />
          </>
        }
        actions={
          <>
            <Link href="/dashboard/chat" className="button-primary">
              Buka Chat Workspace
            </Link>
            <Link href="/dashboard/chat-history" className="button-secondary">
              Lihat Chat History
            </Link>
          </>
        }
      />

      <section className="grid gap-4 xl:grid-cols-4">
        <StatCard
          label="Contacts"
          value={summary.contactsCount}
          hint="Kontak yang sudah pernah masuk ke CRM tenant ini."
          tone="blue"
          icon={<StatIcon type="contacts" />}
        />
        <StatCard
          label="Conversation Threads"
          value={summary.conversationsCount}
          hint="Jumlah thread percakapan yang tersimpan dan bisa diaudit."
          tone="green"
          icon={<StatIcon type="threads" />}
        />
        <StatCard
          label="Pending Follow-up"
          value={summary.pendingFollowups}
          hint="Follow-up sales yang masih menunggu jadwal kirim berikutnya."
          tone="amber"
          icon={<StatIcon type="followup" />}
        />
        <StatCard
          label="Active Plan"
          value={subscription.plan}
          hint="Tier langganan aktif tenant untuk quota dan fitur operasional."
          tone="violet"
          icon={<StatIcon type="plan" />}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Tenant Status</p>
              <h3 className="mt-3 font-display text-3xl text-slate-950">Snapshot akun dan koneksi tenant.</h3>
            </div>
            <PillBadge label={subscription.plan} tone={subscription.plan === "PRO" ? "violet" : "blue"} />
          </div>

          <dl className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="muted-card p-4">
              <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Reset berikutnya</dt>
              <dd className="mt-2 text-sm font-medium text-slate-900">{formatDateTime(subscription.currentPeriodEnd)}</dd>
            </div>
            <div className="muted-card p-4">
              <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Fonnte Token</dt>
              <dd className="mt-2 break-all text-sm font-medium text-slate-900">{redactToken(profile.fonnteToken)}</dd>
            </div>
            <div className="muted-card p-4">
              <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Usage saat ini</dt>
              <dd className="mt-2 text-sm font-medium text-slate-900">
                {subscription.usageCount} / {subscription.limitCount}
              </dd>
            </div>
            <div className="muted-card p-4">
              <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Email tenant</dt>
              <dd className="mt-2 text-sm font-medium text-slate-900">{profile.email}</dd>
            </div>
          </dl>
        </article>

        <article className="panel p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Quick Navigation</p>
          <h3 className="mt-3 font-display text-3xl text-slate-950">Masuk ke area kerja yang paling sering dipakai.</h3>

          <div className="mt-6 grid gap-3">
            <Link href="/dashboard/chat" className="muted-card flex items-center justify-between p-4 transition hover:-translate-y-0.5 hover:bg-white">
              <span>
                <span className="block text-sm font-semibold text-slate-900">Chat Workspace</span>
                <span className="mt-1 block text-sm text-slate-500">Balas manual, takeover HUMAN, dan live monitoring.</span>
              </span>
              <span className="text-xl text-slate-400">→</span>
            </Link>
            <Link href="/dashboard/whatsapp" className="muted-card flex items-center justify-between p-4 transition hover:-translate-y-0.5 hover:bg-white">
              <span>
                <span className="block text-sm font-semibold text-slate-900">WhatsApp Setup</span>
                <span className="mt-1 block text-sm text-slate-500">Kelola token Fonnte, webhook URL, dan koneksi device.</span>
              </span>
              <span className="text-xl text-slate-400">→</span>
            </Link>
            <Link href="/dashboard/billing" className="muted-card flex items-center justify-between p-4 transition hover:-translate-y-0.5 hover:bg-white">
              <span>
                <span className="block text-sm font-semibold text-slate-900">Billing & Payment</span>
                <span className="mt-1 block text-sm text-slate-500">Cek plan, quota, dan status upgrade payment manual.</span>
              </span>
              <span className="text-xl text-slate-400">→</span>
            </Link>
          </div>
        </article>
      </section>

      <section className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Recent Messages</p>
            <h3 className="mt-3 font-display text-3xl text-slate-950">Pesan terbaru yang masuk ke tenant ini.</h3>
          </div>
          <Link href="/dashboard/chat-history" className="button-secondary">
            Buka semua history
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          {summary.latestMessages.length ? (
            summary.latestMessages.map((message: LatestMessageRow) => (
              <article key={message.id} className="muted-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{message.contact.displayName || message.contact.phone}</p>
                    <p className="mt-1 text-sm text-slate-500">{message.contact.phone}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <PillBadge
                      label={message.role}
                      tone={message.role === "USER" ? "slate" : message.role === "HUMAN" ? "green" : "blue"}
                    />
                    <p className="text-sm text-slate-500">{formatDateTime(message.createdAt)}</p>
                    <a href={`/dashboard/chat?contact=${message.contact.id}`} className="button-secondary">
                      Buka Chat
                    </a>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-700">{message.content}</p>
              </article>
            ))
          ) : (
            <div className="surface-note p-5 text-sm text-slate-500">
              Belum ada pesan masuk. Hubungkan Fonnte lalu pasang webhook URL di dashboard WhatsApp.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
