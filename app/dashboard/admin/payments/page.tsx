import { assertAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { listPaymentRequests } from "@/repositories/payment.repository";
import { getPaymentProofSignedUrl } from "@/services/payment/payment.service";
import { SubmitButton } from "@/components/submit-button";
import { approvePaymentRequestAction, rejectPaymentRequestAction } from "@/app/dashboard/admin/actions";

type PaymentRequestRow = Awaited<ReturnType<typeof listPaymentRequests>>[number];

export default async function AdminPaymentsPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await assertAdmin();
  const payments = await listPaymentRequests();
  const searchParams = props.searchParams ? await props.searchParams : {};
  const message = Array.isArray(searchParams.message) ? searchParams.message[0] : searchParams.message;
  const proofUrls = await Promise.all(
    payments.map(async (payment) => ({
      id: payment.id,
      url: await getPaymentProofSignedUrl(payment.proofPath)
    }))
  );
  const proofUrlMap = new Map<string, string | null>(proofUrls.map((item: { id: string; url: string | null }) => [item.id, item.url]));

  return (
    <div className="space-y-6">
      <section className="panel p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-ember/80">Admin Payments</p>
        <h2 className="mt-3 font-display text-5xl text-ink">Review bukti transfer dan aktifkan tenant PRO.</h2>
        {message ? <p className="mt-6 rounded-2xl bg-pine/10 px-4 py-3 text-sm text-pine">{message}</p> : null}
      </section>

      <div className="space-y-4">
        {payments.length ? (
          payments.map((payment: PaymentRequestRow) => (
            <article key={payment.id} className="panel p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-3xl text-ink">{payment.profile.businessName || payment.profile.email}</h3>
                  <p className="mt-1 text-sm text-ink/60">{payment.profile.email}</p>
                </div>
                <div className="text-sm text-ink/60">
                  <p>Status: {payment.status}</p>
                  <p>Submit: {formatDateTime(payment.requestedAt)}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-[22px] border border-ink/8 bg-white/75 p-4 text-sm leading-7 text-ink/75">
                  <p>Plan: {payment.plan}</p>
                  <p>Nominal: Rp{payment.amount.toLocaleString("id-ID")}</p>
                  <p>Catatan user: {payment.senderNote || "-"}</p>
                  <p>Review note: {payment.reviewNote || "-"}</p>
                  {proofUrlMap.get(payment.id) ? (
                    <p className="mt-2">
                      <a
                        href={proofUrlMap.get(payment.id) || undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="text-ember underline"
                      >
                        Lihat bukti transfer
                      </a>
                    </p>
                  ) : null}
                </div>

                <div className="space-y-4">
                  <form action={approvePaymentRequestAction} className="rounded-[22px] border border-pine/15 bg-pine/5 p-4">
                    <input type="hidden" name="paymentRequestId" value={payment.id} />
                    <SubmitButton idleLabel="Approve & Aktifkan PRO" className="button-primary" />
                  </form>

                  <form action={rejectPaymentRequestAction} className="rounded-[22px] border border-ember/15 bg-ember/5 p-4 space-y-3">
                    <input type="hidden" name="paymentRequestId" value={payment.id} />
                    <textarea name="reviewNote" rows={3} placeholder="Alasan reject / catatan admin" />
                    <SubmitButton idleLabel="Reject Payment" className="button-secondary" />
                  </form>
                </div>
              </div>
            </article>
          ))
        ) : (
          <section className="panel p-6 text-sm text-ink/60">Belum ada payment request yang masuk.</section>
        )}
      </div>
    </div>
  );
}
