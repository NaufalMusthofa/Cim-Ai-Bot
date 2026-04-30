import { assertAdmin } from "@/lib/auth";
import { listPromptCards } from "@/repositories/prompt-card.repository";
import { PROMPT_CARD_TYPES, PROMPT_TYPE_LABELS, ensureDefaultPromptCards } from "@/services/ai/prompt-card.service";
import { SubmitButton } from "@/components/submit-button";
import {
  activatePromptCardAction,
  createPromptCardAction,
  deletePromptCardAction,
  updatePromptCardAction
} from "@/app/dashboard/admin/actions";
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

  return (
    <div className="space-y-6">
      <section className="panel p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-ember/80">Prompt Manager</p>
        <h2 className="mt-3 font-display text-5xl text-ink">Kelola prompt cards global untuk AI, fallback, dan follow-up.</h2>
        {message ? <p className="mt-6 rounded-2xl bg-pine/10 px-4 py-3 text-sm text-pine">{message}</p> : null}
        {error ? <p className="mt-4 rounded-2xl bg-ember/10 px-4 py-3 text-sm text-ember">{error}</p> : null}
      </section>

      <section className="panel p-6">
        <h3 className="font-display text-3xl text-ink">Tambah Prompt Card</h3>
        <form action={createPromptCardAction} className="mt-6 grid gap-4 lg:grid-cols-[220px_1fr]">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-ink/70">Type</label>
              <select name="type" defaultValue="SYSTEM_BASE">
                {PROMPT_CARD_TYPES.map((type: PromptType) => (
                  <option key={type} value={type}>
                    {PROMPT_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-ink/70">Nama card</label>
              <input name="name" placeholder="Contoh: Sales Prompt v2" required />
            </div>
            <SubmitButton idleLabel="Tambah Prompt Card" className="button-primary" />
          </div>

          <div>
            <label className="mb-2 block text-sm text-ink/70">Isi prompt</label>
            <textarea name="content" rows={10} placeholder="Tulis isi prompt atau template fallback di sini..." required />
          </div>
        </form>
      </section>

      <div className="space-y-6">
        {PROMPT_CARD_TYPES.map((type: PromptType) => {
          const cards = promptCards.filter((card: PromptCardRow) => card.type === type);

          return (
            <section key={type} className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-ember/80">{type}</p>
                <h3 className="mt-2 font-display text-3xl text-ink">{PROMPT_TYPE_LABELS[type]}</h3>
              </div>

              <div className="grid gap-4">
                {cards.map((card: PromptCardRow) => (
                  <article key={card.id} className="panel p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="font-display text-2xl text-ink">{card.name}</h4>
                        <p className="mt-1 text-sm text-ink/60">{card.isActive ? "ACTIVE" : "Inactive"}</p>
                      </div>

                      <form action={activatePromptCardAction}>
                        <input type="hidden" name="promptCardId" value={card.id} />
                        <input type="hidden" name="type" value={card.type} />
                        <SubmitButton idleLabel={card.isActive ? "Sedang Aktif" : "Jadikan Aktif"} className="button-secondary" />
                      </form>
                    </div>

                    <form action={updatePromptCardAction} className="mt-5 space-y-4">
                      <input type="hidden" name="promptCardId" value={card.id} />
                      <div>
                        <label className="mb-2 block text-sm text-ink/70">Nama</label>
                        <input name="name" defaultValue={card.name} required />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-ink/70">Isi</label>
                        <textarea name="content" rows={8} defaultValue={card.content} required />
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
    </div>
  );
}
