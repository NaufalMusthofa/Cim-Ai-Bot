import { PageHero } from "@/components/page-hero";
import { PillBadge } from "@/components/pill-badge";
import { SubmitButton } from "@/components/submit-button";
import { assertAdmin } from "@/lib/auth";
import {
  activatePromptCardAction,
  createPromptCardAction,
  deletePromptCardAction,
  updatePromptCardAction
} from "@/app/dashboard/admin/actions";
import { listPromptCards } from "@/repositories/prompt-card.repository";
import {
  PROMPT_CARD_TYPES,
  PROMPT_TYPE_LABELS,
  ensureDefaultPromptCards
} from "@/services/ai/prompt-card.service";
import type { PromptType } from "@/types/domain";

type PromptCardRow = Awaited<ReturnType<typeof listPromptCards>>[number];

export default async function AdminPromptsPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await assertAdmin();
  await ensureDefaultPromptCards();
  const promptCards = await listPromptCards();
  const searchParams = props.searchParams ? await props.searchParams : {};
  const message = Array.isArray(searchParams.message) ? searchParams.message[0] : searchParams.message;
  const error = Array.isArray(searchParams.error) ? searchParams.error[0] : searchParams.error;
  const activeCount = promptCards.filter((card: PromptCardRow) => card.isActive).length;

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Prompt Manager"
        title="Kelola prompt cards global untuk AI, fallback, dan follow-up."
        description="Prompt tidak lagi tersebar di logic runtime. Versi aktif untuk setiap type dipilih dari halaman ini agar maintenance lebih aman dan lebih cepat."
        meta={
          <>
            <PillBadge label={`${activeCount} aktif`} tone="blue" />
            <PillBadge label={`${promptCards.length} total cards`} tone="slate" />
          </>
        }
      />

      {message ? <p className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <article className="panel h-fit p-6 xl:sticky xl:top-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Create Prompt Card</p>
          <h3 className="mt-3 font-display text-3xl text-slate-950">Tambah versi prompt baru.</h3>

          <form action={createPromptCardAction} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm text-slate-600">Type</label>
              <select name="type" defaultValue="SYSTEM_BASE">
                {PROMPT_CARD_TYPES.map((type: PromptType) => (
                  <option key={type} value={type}>
                    {PROMPT_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-600">Nama card</label>
              <input name="name" placeholder="Contoh: Sales Prompt v2" required />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-600">Isi prompt</label>
              <textarea name="content" rows={12} placeholder="Tulis isi prompt atau template fallback di sini..." required />
            </div>
            <SubmitButton idleLabel="Tambah Prompt Card" className="button-primary" />
          </form>
        </article>

        <div className="space-y-6">
          {PROMPT_CARD_TYPES.map((type: PromptType) => {
            const cards = promptCards.filter((card: PromptCardRow) => card.type === type);

            return (
              <section key={type} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{type}</p>
                    <h3 className="mt-2 font-display text-3xl text-slate-950">{PROMPT_TYPE_LABELS[type]}</h3>
                  </div>
                  <PillBadge label={`${cards.length} card`} tone="slate" />
                </div>

                <div className="grid gap-4">
                  {cards.map((card: PromptCardRow) => (
                    <article key={card.id} className="panel p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h4 className="font-display text-2xl text-slate-950">{card.name}</h4>
                            <PillBadge label={card.isActive ? "ACTIVE" : "INACTIVE"} tone={card.isActive ? "green" : "slate"} />
                          </div>
                          <p className="mt-2 text-sm text-slate-500">Update prompt card aktif sesuai kebutuhan mode AI atau follow-up.</p>
                        </div>

                        <form action={activatePromptCardAction}>
                          <input type="hidden" name="promptCardId" value={card.id} />
                          <input type="hidden" name="type" value={card.type} />
                          <SubmitButton
                            idleLabel={card.isActive ? "Sedang Aktif" : "Jadikan Aktif"}
                            className="button-secondary"
                          />
                        </form>
                      </div>

                      <form action={updatePromptCardAction} className="mt-5 space-y-4">
                        <input type="hidden" name="promptCardId" value={card.id} />
                        <div>
                          <label className="mb-2 block text-sm text-slate-600">Nama</label>
                          <input name="name" defaultValue={card.name} required />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm text-slate-600">Isi</label>
                          <textarea name="content" rows={10} defaultValue={card.content} required />
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <SubmitButton idleLabel="Simpan Perubahan" className="button-primary" />
                        </div>
                      </form>

                      <form action={deletePromptCardAction} className="mt-4">
                        <input type="hidden" name="promptCardId" value={card.id} />
                        <SubmitButton idleLabel="Hapus Card" className="button-secondary" />
                      </form>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}
