import { requireAppWorkspace } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { getRemainingQuota } from "@/services/subscription/subscription.service";
import { SubmitButton } from "@/components/submit-button";
import { requestUpgradeAction } from "@/app/dashboard/actions";

export default async function DashboardBillingPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { profile, subscription } = await requireAppWorkspace();
  const searchParams = props.searchParams ? await props.searchParams : {};
  const message = Array.isArray(searchParams.message) ? searchParams.message[0] : searchParams.message;

  return (
    <div className="space-y-6">
      <section className="panel p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-ember/80">Billing & Subscription</p>
        <h2 className="mt-3 font-display text-5xl text-ink">Plan aktif dan alur upgrade manual.</h2>
        {message ? <p className="mt-6 rounded-2xl bg-pine/10 px-4 py-3 text-sm text-pine">{message}</p> : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="panel p-6">
          <h3 className="font-display text-3xl text-ink">Status Saat Ini</h3>
          <dl className="mt-6 space-y-4 text-sm text-ink/75">
            <div className="flex items-center justify-between gap-4 border-b border-ink/8 pb-4">
              <dt>Plan</dt>
              <dd>{subscription.plan}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-ink/8 pb-4">
              <dt>Terpakai</dt>
              <dd>{subscription.usageCount}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-ink/8 pb-4">
              <dt>Sisa quota</dt>
              <dd>{getRemainingQuota(subscription)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt>Reset berikutnya</dt>
              <dd>{formatDateTime(subscription.currentPeriodEnd)}</dd>
            </div>
          </dl>
        </article>

        <article className="panel p-6">
          <h3 className="font-display text-3xl text-ink">Upgrade ke PRO</h3>
          <p className="mt-4 text-sm leading-7 text-ink/70">
            Paket PRO seharga Rp150.000 per bulan dengan limit 300 chat. Aktivasi dilakukan manual setelah admin memverifikasi pembayaran.
          </p>
          <div className="mt-5 rounded-[20px] bg-white/70 p-4 text-sm leading-7 text-ink/75">
            <p>DANA: 085157996453</p>
            <p>a.n Nopal</p>
            <p className="mt-3">Setelah transfer, klik tombol di bawah agar tenant Anda masuk antrean verifikasi admin.</p>
          </div>
          <form action={requestUpgradeAction} className="mt-6">
            <SubmitButton
              idleLabel={profile.upgradeRequestedAt ? "Permintaan Sudah Dikirim" : "Saya Sudah Transfer"}
              className="button-primary"
            />
          </form>
        </article>
      </section>
    </div>
  );
}
