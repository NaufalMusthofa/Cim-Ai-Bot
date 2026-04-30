import Link from "next/link";
import { StatCard } from "@/components/stat-card";
import { requireAppWorkspace } from "@/lib/auth";
import { formatDateTime, redactToken } from "@/lib/utils";
import { getDashboardSummary } from "@/repositories/dashboard.repository";

type LatestMessageRow = Awaited<ReturnType<typeof getDashboardSummary>>["latestMessages"][number];

export default async function DashboardPage() {
  const { profile, subscription } = await requireAppWorkspace();
  const summary = await getDashboardSummary(profile.id);

  return (
    <div className="space-y-6">
      <section className="panel p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-ember/80">Overview</p>
        <h2 className="mt-3 font-display text-5xl text-ink">Operasional tenant dalam satu layar.</h2>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-ink/70">
          Webhook masuk akan memeriksa limit subscription, menyimpan chat ke CRM, membangun memory, lalu membalas lewat AI dan menjadwalkan follow-up otomatis bila relevan.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Contacts" value={summary.contactsCount} hint="Kontak yang sudah pernah menghubungi tenant ini." />
        <StatCard label="Conversations" value={summary.conversationsCount} hint="Jumlah percakapan yang tercatat di CRM." />
        <StatCard label="Pending Follow-up" value={summary.pendingFollowups} hint="Job follow-up yang masih menunggu jadwal kirim." />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="panel p-6">
          <h3 className="font-display text-3xl text-ink">Status Tenant</h3>
          <dl className="mt-6 space-y-4 text-sm text-ink/75">
            <div className="flex items-center justify-between gap-4 border-b border-ink/8 pb-4">
              <dt>Paket</dt>
              <dd>{subscription.plan}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-ink/8 pb-4">
              <dt>Usage</dt>
              <dd>
                {subscription.usageCount} / {subscription.limitCount}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-ink/8 pb-4">
              <dt>Reset berikutnya</dt>
              <dd>{formatDateTime(subscription.currentPeriodEnd)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt>Token Fonnte</dt>
              <dd>{redactToken(profile.fonnteToken)}</dd>
            </div>
          </dl>
          <div className="mt-6 flex gap-3">
            <Link href="/dashboard/whatsapp" className="button-primary">
              Hubungkan WhatsApp
            </Link>
            <Link href="/dashboard/billing" className="button-secondary">
              Kelola Paket
            </Link>
          </div>
        </article>

        <article className="panel p-6">
          <h3 className="font-display text-3xl text-ink">Pesan Terbaru</h3>
          <div className="mt-6 space-y-4">
            {summary.latestMessages.length ? (
              summary.latestMessages.map((message: LatestMessageRow) => (
                <div key={message.id} className="rounded-[22px] border border-ink/8 bg-white/75 p-4">
                  <div className="flex items-center justify-between gap-4 text-sm text-ink/60">
                    <span>{message.contact.displayName || message.contact.phone}</span>
                    <span>{formatDateTime(message.createdAt)}</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-ink/80">{message.content}</p>
                </div>
              ))
            ) : (
              <p className="rounded-[22px] border border-dashed border-ink/15 bg-white/55 p-4 text-sm text-ink/60">
                Belum ada pesan masuk. Hubungkan Fonnte lalu pasang webhook URL di dashboard WhatsApp.
              </p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
