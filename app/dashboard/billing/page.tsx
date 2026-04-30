import { requireAppWorkspace } from "@/lib/auth";
import { PRO_PLAN_AMOUNT } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { getRemainingQuota } from "@/services/subscription/subscription.service";
import { SubmitButton } from "@/components/submit-button";
import { getBillingPaymentState, getPaymentProofSignedUrl } from "@/services/payment/payment.service";
import { submitPaymentRequestAction } from "@/app/dashboard/billing/actions";

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
    <div className="space-y-6">
      <section className="panel p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-ember/80">Billing & Subscription</p>
        <h2 className="mt-3 font-display text-5xl text-ink">Plan aktif, pembayaran manual, dan status review admin.</h2>
        {message ? <p className="mt-6 rounded-2xl bg-pine/10 px-4 py-3 text-sm text-pine">{message}</p> : null}
        {error ? <p className="mt-4 rounded-2xl bg-ember/10 px-4 py-3 text-sm text-ember">{error}</p> : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
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
            <div className="flex items-center justify-between gap-4 border-b border-ink/8 pb-4">
              <dt>Reset berikutnya</dt>
              <dd>{formatDateTime(subscription.currentPeriodEnd)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt>Pengajuan payment</dt>
              <dd>{paymentState.pendingPayment ? "PENDING" : paymentState.latestPayment?.status || "Belum ada"}</dd>
            </div>
          </dl>
        </article>

        <article className="panel p-6">
          <h3 className="font-display text-3xl text-ink">Upgrade ke PRO</h3>
          <p className="mt-4 text-sm leading-7 text-ink/70">
            Paket PRO seharga Rp{PRO_PLAN_AMOUNT.toLocaleString("id-ID")} per bulan dengan limit 300 chat. Upload bukti
            transfer di sini, lalu admin akan review dan mengaktifkan akun secara manual.
          </p>
          <div className="mt-5 rounded-[20px] bg-white/70 p-4 text-sm leading-7 text-ink/75">
            <p>DANA: 085157996453</p>
            <p>a.n Nopal</p>
            <p className="mt-3">Setelah transfer, upload bukti pembayaran agar pengajuan langsung masuk ke antrian admin.</p>
          </div>

          {paymentState.pendingPayment ? (
            <div className="mt-6 rounded-[20px] border border-ember/20 bg-ember/5 p-4 text-sm leading-7 text-ink/75">
              <p className="font-medium text-ink">Masih ada pengajuan payment yang sedang direview.</p>
              <p className="mt-2">Status: {paymentState.pendingPayment.status}</p>
              <p>Submit: {formatDateTime(paymentState.pendingPayment.requestedAt)}</p>
              <p>Catatan: {paymentState.pendingPayment.senderNote || "-"}</p>
            </div>
          ) : (
            <form action={submitPaymentRequestAction} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-ink/70">Upload bukti transfer</label>
                <input name="proofFile" type="file" accept="image/*,.pdf" required />
              </div>
              <div>
                <label className="mb-2 block text-sm text-ink/70">Catatan tambahan</label>
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
            <div className="mt-6 rounded-[20px] border border-ink/8 bg-white/70 p-4 text-sm leading-7 text-ink/75">
              <p className="font-medium text-ink">Riwayat payment terakhir</p>
              <p className="mt-2">Status: {paymentState.latestPayment.status}</p>
              <p>Plan: {paymentState.latestPayment.plan}</p>
              <p>Nominal: Rp{paymentState.latestPayment.amount.toLocaleString("id-ID")}</p>
              <p>Waktu submit: {formatDateTime(paymentState.latestPayment.requestedAt)}</p>
              <p>Catatan: {paymentState.latestPayment.senderNote || "-"}</p>
              <p>Review note: {paymentState.latestPayment.reviewNote || "-"}</p>
              {latestProofUrl ? (
                <p className="mt-2">
                  <a href={latestProofUrl} target="_blank" rel="noreferrer" className="text-ember underline">
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
