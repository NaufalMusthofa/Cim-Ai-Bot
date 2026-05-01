import { PageHero } from "@/components/page-hero";
import { PillBadge } from "@/components/pill-badge";
import { SubmitButton } from "@/components/submit-button";
import { requireAppWorkspace } from "@/lib/auth";
import { PRO_PLAN_AMOUNT } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { submitPaymentRequestAction } from "@/app/dashboard/billing/actions";
import { getRemainingQuota } from "@/services/subscription/subscription.service";
import { getBillingPaymentState, getPaymentProofSignedUrl } from "@/services/payment/payment.service";

export default async function DashboardBillingPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { subscription, profile } = await requireAppWorkspace();
  const searchParams = props.searchParams ? await props.searchParams : {};
  const message = Array.isArray(searchParams.message) ? searchParams.message[0] : searchParams.message;
  const error = Array.isArray(searchParams.error) ? searchParams.error[0] : searchParams.error;
  const paymentState = await getBillingPaymentState(profile.id);
  const latestProofUrl = paymentState.latestPayment?.proofPath
    ? await getPaymentProofSignedUrl(paymentState.latestPayment.proofPath)
    : null;

  return (
    <div className="page-shell animate-fade-in">
      <PageHero
        eyebrow="Billing & Subscription"
        title="Kelola tier tenant, quota aktif, dan upgrade payment manual."
        description="Semua alur plan tetap sama, hanya tampilannya dibuat lebih jelas agar status paket, quota, dan review payment lebih mudah dibaca."
        meta={
          <>
            <PillBadge label={subscription.plan} tone={subscription.plan === "PRO" ? "violet" : "blue"} />
            <PillBadge label={`${getRemainingQuota(subscription)} quota tersisa`} tone="slate" />
          </>
        }
      />

      {message ? <p className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="surface-card p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Current Subscription</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Status plan dan penggunaan saat ini.</h3>
            </div>
            <PillBadge label={subscription.plan} tone={subscription.plan === "PRO" ? "violet" : "blue"} />
          </div>

          <dl className="mt-6 space-y-4 text-sm text-slate-700">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
              <dt>Plan</dt>
              <dd className="font-semibold text-slate-950">{subscription.plan}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
              <dt>Terpakai</dt>
              <dd className="font-semibold text-slate-950">{subscription.usageCount}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
              <dt>Sisa quota</dt>
              <dd className="font-semibold text-slate-950">{getRemainingQuota(subscription)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
              <dt>Reset berikutnya</dt>
              <dd className="font-semibold text-slate-950">{formatDateTime(subscription.currentPeriodEnd)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt>Pengajuan payment</dt>
              <dd className="font-semibold text-slate-950">
                {paymentState.pendingPayment ? "PENDING" : paymentState.latestPayment?.status || "Belum ada"}
              </dd>
            </div>
          </dl>
        </article>

        <article className="surface-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Upgrade to PRO</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Upgrade manual dengan bukti transfer yang masuk ke admin queue.</h3>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Paket PRO seharga Rp{PRO_PLAN_AMOUNT.toLocaleString("id-ID")} per bulan dengan limit 300 chat. Upload bukti transfer di sini, lalu admin akan review dan mengaktifkan akun secara manual.
          </p>

          <div className="surface-note mt-5 p-5 text-sm leading-7 text-slate-700">
            <p className="font-semibold text-slate-950">Tujuan transfer</p>
            <p className="mt-2">DANA: 085157996453</p>
            <p>a.n Nopal</p>
            <p className="mt-3">Setelah transfer, upload bukti pembayaran agar pengajuan langsung masuk ke antrian admin.</p>
          </div>

          {paymentState.pendingPayment ? (
            <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-slate-700">
              <p className="font-semibold text-slate-950">Masih ada pengajuan payment yang sedang direview.</p>
              <p className="mt-2">Status: {paymentState.pendingPayment.status}</p>
              <p>Submit: {formatDateTime(paymentState.pendingPayment.requestedAt)}</p>
              <p>Catatan: {paymentState.pendingPayment.senderNote || "-"}</p>
            </div>
          ) : (
            <form action={submitPaymentRequestAction} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-600">Upload bukti transfer</label>
                <input name="proofFile" type="file" accept="image/*,.pdf" required />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-600">Catatan tambahan</label>
                <textarea
                  name="senderNote"
                  rows={4}
                  placeholder="Contoh: transfer dari rekening istri / nama berbeda / info tambahan lain"
                />
              </div>
              <SubmitButton idleLabel="Kirim Pengajuan Payment" className="button-primary" />
            </form>
          )}

          {paymentState.latestPayment ? (
            <div className="surface-note mt-6 p-5 text-sm leading-7 text-slate-700">
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-semibold text-slate-950">Riwayat payment terakhir</p>
                <PillBadge
                  label={paymentState.latestPayment.status}
                  tone={
                    paymentState.latestPayment.status === "APPROVED"
                      ? "green"
                      : paymentState.latestPayment.status === "REJECTED"
                        ? "rose"
                        : "amber"
                  }
                />
              </div>
              <p className="mt-3">Plan: {paymentState.latestPayment.plan}</p>
              <p>Nominal: Rp{paymentState.latestPayment.amount.toLocaleString("id-ID")}</p>
              <p>Waktu submit: {formatDateTime(paymentState.latestPayment.requestedAt)}</p>
              <p>Catatan: {paymentState.latestPayment.senderNote || "-"}</p>
              <p>Review note: {paymentState.latestPayment.reviewNote || "-"}</p>
              {latestProofUrl ? (
                <p className="mt-2">
                  <a href={latestProofUrl} target="_blank" rel="noreferrer" className="font-medium text-blue-700">
                    Lihat bukti transfer terakhir
                  </a>
                </p>
              ) : null}
            </div>
          ) : null}
        </article>
      </section>
    </div>
  );
}
