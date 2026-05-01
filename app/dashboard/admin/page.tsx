import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { PillBadge } from "@/components/pill-badge";
import { assertAdmin } from "@/lib/auth";
import { listPaymentRequests } from "@/repositories/payment.repository";
import { listPromptCards } from "@/repositories/prompt-card.repository";
import { ensureDefaultPromptCards } from "@/services/ai/prompt-card.service";

type PaymentRow = Awaited<ReturnType<typeof listPaymentRequests>>[number];
type PromptCardRow = Awaited<ReturnType<typeof listPromptCards>>[number];

export default async function AdminPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await assertAdmin();
  await ensureDefaultPromptCards();
  const [payments, promptCards] = await Promise.all([listPaymentRequests(), listPromptCards()]);
  const searchParams = props.searchParams ? await props.searchParams : {};
  const message = Array.isArray(searchParams.message) ? searchParams.message[0] : searchParams.message;

  const pendingPayments = payments.filter((payment: PaymentRow) => payment.status === "PENDING").length;
  const approvedPayments = payments.filter((payment: PaymentRow) => payment.status === "APPROVED").length;
  const activePromptCards = promptCards.filter((card: PromptCardRow) => card.isActive).length;

  return (
    <div className="page-shell animate-fade-in">
      <PageHero
        eyebrow="Admin Control"
        title="Kelola payment tenant dan prompt global dari workspace admin yang lebih jelas."
        description="Semua flow backend tetap sama. Halaman ini hanya merapikan akses ke review pembayaran dan prompt manager agar lebih cepat dipakai sehari-hari."
        meta={
          <>
            <PillBadge label={`${pendingPayments} pending`} tone="amber" />
            <PillBadge label={`${activePromptCards} prompt aktif`} tone="blue" />
          </>
        }
      />

      {message ? <p className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}

      <section className="grid gap-6 xl:grid-cols-3">
        <article className="metric-card p-6">
          <p className="text-sm font-medium text-slate-500">Payment Pending</p>
          <h3 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{pendingPayments}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Pengajuan pembayaran tenant yang masih menunggu verifikasi admin.
          </p>
          <Link href="/dashboard/admin/payments" className="button-primary mt-6 inline-flex">
            Buka Payment Queue
          </Link>
        </article>

        <article className="metric-card p-6">
          <p className="text-sm font-medium text-slate-500">Payment Approved</p>
          <h3 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{approvedPayments}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Riwayat aktivasi plan PRO yang sudah disetujui admin lewat payment manual.
          </p>
          <Link href="/dashboard/admin/payments" className="button-secondary mt-6 inline-flex">
            Review Semua Payment
          </Link>
        </article>

        <article className="metric-card p-6">
          <p className="text-sm font-medium text-slate-500">Prompt Manager</p>
          <h3 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{activePromptCards}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Jumlah prompt card aktif yang sedang dipakai runtime AI, fallback, dan follow-up.
          </p>
          <Link href="/dashboard/admin/prompts" className="button-primary mt-6 inline-flex">
            Kelola Prompt Cards
          </Link>
        </article>
      </section>
    </div>
  );
}
