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
  const activePromptCards = promptCards.filter((card: PromptCardRow) => card.isActive).length;

  return (
    <div className="space-y-6">
      <section className="panel p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-ember/80">Admin Control</p>
        <h2 className="mt-3 font-display text-5xl text-ink">Kelola payment tenant dan prompt global dari satu tempat.</h2>
        {message ? <p className="mt-6 rounded-2xl bg-pine/10 px-4 py-3 text-sm text-pine">{message}</p> : null}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="panel p-6">
          <p className="text-sm uppercase tracking-[0.18em] text-ember/80">Payment Queue</p>
          <h3 className="mt-3 font-display text-4xl text-ink">{pendingPayments}</h3>
          <p className="mt-4 text-sm leading-7 text-ink/70">
            Pengajuan pembayaran tenant yang masih menunggu verifikasi admin.
          </p>
          <a href="/dashboard/admin/payments" className="button-primary mt-6 inline-flex">
            Buka Payment Queue
          </a>
        </article>

        <article className="panel p-6">
          <p className="text-sm uppercase tracking-[0.18em] text-ember/80">Prompt Manager</p>
          <h3 className="mt-3 font-display text-4xl text-ink">{activePromptCards}</h3>
          <p className="mt-4 text-sm leading-7 text-ink/70">
            Jumlah prompt card aktif yang sedang dipakai runtime AI dan follow-up system.
          </p>
          <a href="/dashboard/admin/prompts" className="button-primary mt-6 inline-flex">
            Kelola Prompt Cards
          </a>
        </article>
      </section>
    </div>
  );
}
