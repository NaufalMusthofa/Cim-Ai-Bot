import { PageHero } from "@/components/page-hero";
import { PillBadge } from "@/components/pill-badge";
import { SubmitButton } from "@/components/submit-button";
import { assertAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { approvePaymentRequestAction, rejectPaymentRequestAction } from "@/app/dashboard/admin/actions";
import { listPaymentRequests } from "@/repositories/payment.repository";
import { getPaymentProofSignedUrl } from "@/services/payment/payment.service";

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

  const pendingCount = payments.filter((payment: PaymentRequestRow) => payment.status === "PENDING").length;
  const approvedCount = payments.filter((payment: PaymentRequestRow) => payment.status === "APPROVED").length;
  const rejectedCount = payments.filter((payment: PaymentRequestRow) => payment.status === "REJECTED").length;

  return (
    <div className="page-shell animate-fade-in">
      <PageHero
        eyebrow="Admin Payments"
        title="Review bukti transfer dan aktifkan tenant PRO dengan lebih rapi."
        description="Queue ini tetap memakai alur approve/reject yang sama. Perubahan di sini hanya merapikan summary, kartu review, dan akses bukti transfer."
        meta={
          <>
            <PillBadge label={`${pendingCount} pending`} tone="amber" />
            <PillBadge label={`${approvedCount} approved`} tone="green" />
            <PillBadge label={`${rejectedCount} rejected`} tone="rose" />
          </>
        }
      />

      {message ? <p className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="metric-card p-5">
          <p className="text-sm font-medium text-slate-500">Pending</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{pendingCount}</p>
        </article>
        <article className="metric-card p-5">
          <p className="text-sm font-medium text-slate-500">Approved</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{approvedCount}</p>
        </article>
        <article className="metric-card p-5">
          <p className="text-sm font-medium text-slate-500">Rejected</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{rejectedCount}</p>
        </article>
      </section>

      <div className="space-y-4">
        {payments.length ? (
          payments.map((payment: PaymentRequestRow) => (
            <article key={payment.id} className="surface-card p-6">
              <div className="flex flex-col gap-4 border-b border-slate-200/75 pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-3xl font-semibold tracking-tight text-slate-950">
                      {payment.profile.businessName || payment.profile.email}
                    </h3>
                    <PillBadge
                      label={payment.status}
                      tone={
                        payment.status === "APPROVED"
                          ? "green"
                          : payment.status === "REJECTED"
                            ? "rose"
                            : "amber"
                      }
                    />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{payment.profile.email}</p>
                </div>
                <div className="text-sm text-slate-500">
                  <p>Submit: {formatDateTime(payment.requestedAt)}</p>
                  <p>Plan: {payment.plan}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="surface-note p-4 text-sm leading-7 text-slate-700">
                  <p>Nominal: Rp{payment.amount.toLocaleString("id-ID")}</p>
                  <p>Catatan user: {payment.senderNote || "-"}</p>
                  <p>Review note: {payment.reviewNote || "-"}</p>
                  {proofUrlMap.get(payment.id) ? (
                    <p className="mt-2">
                      <a
                        href={proofUrlMap.get(payment.id) || undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-blue-700"
                      >
                        Lihat bukti transfer
                      </a>
                    </p>
                  ) : null}
                </div>

                <div className="space-y-4">
                  <form action={approvePaymentRequestAction} className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-4">
                    <input type="hidden" name="paymentRequestId" value={payment.id} />
                    <SubmitButton idleLabel="Approve & Aktifkan PRO" className="button-primary" />
                  </form>

                  <form action={rejectPaymentRequestAction} className="rounded-[24px] border border-rose-200 bg-rose-50 p-4 space-y-3">
                    <input type="hidden" name="paymentRequestId" value={payment.id} />
                    <textarea name="reviewNote" rows={3} placeholder="Alasan reject / catatan admin" />
                    <SubmitButton idleLabel="Reject Payment" className="button-secondary" />
                  </form>
                </div>
              </div>
            </article>
          ))
        ) : (
          <section className="surface-card p-6 text-sm text-slate-500">Belum ada payment request yang masuk.</section>
        )}
      </div>
    </div>
  );
}
