import { requireAppWorkspace } from "@/lib/auth";
import { getAppUrl } from "@/lib/env";
import { redactToken } from "@/lib/utils";
import { SubmitButton } from "@/components/submit-button";
import {
  regenerateWebhookKeyAction,
  saveWhatsAppConnectionAction
} from "@/app/dashboard/actions";

export default async function WhatsAppPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { profile } = await requireAppWorkspace();
  const searchParams = props.searchParams ? await props.searchParams : {};
  const message = Array.isArray(searchParams.message) ? searchParams.message[0] : searchParams.message;
  const error = Array.isArray(searchParams.error) ? searchParams.error[0] : searchParams.error;
  const webhookUrl = `${getAppUrl()}/api/webhook/fonnte/${profile.id}/${profile.webhookKey}`;

  return (
    <div className="space-y-6">
      <section className="panel p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-ember/80">WhatsApp Onboarding</p>
        <h2 className="mt-3 font-display text-5xl text-ink">Hubungkan tenant ke Fonnte.</h2>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-ink/70">
          Simpan token Fonnte milik tenant ini, lalu copy webhook URL unik di bawah ke dashboard device Fonnte.
        </p>
        {message ? <p className="mt-6 rounded-2xl bg-pine/10 px-4 py-3 text-sm text-pine">{message}</p> : null}
        {error ? <p className="mt-4 rounded-2xl bg-ember/10 px-4 py-3 text-sm text-ember">{error}</p> : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="panel p-6">
          <h3 className="font-display text-3xl text-ink">Koneksi Saat Ini</h3>
          <dl className="mt-6 space-y-4 text-sm text-ink/75">
            <div className="rounded-[20px] bg-white/65 p-4">
              <dt className="text-xs uppercase tracking-[0.18em] text-ember/80">Token Fonnte</dt>
              <dd className="mt-2">{redactToken(profile.fonnteToken)}</dd>
            </div>
            <div className="rounded-[20px] bg-white/65 p-4">
              <dt className="text-xs uppercase tracking-[0.18em] text-ember/80">Webhook URL unik</dt>
              <dd className="mt-2 break-all">{webhookUrl}</dd>
            </div>
          </dl>
          <form action={regenerateWebhookKeyAction} className="mt-6">
            <SubmitButton idleLabel="Regenerate Webhook Key" className="button-secondary" />
          </form>
        </article>

        <article className="panel p-6">
          <h3 className="font-display text-3xl text-ink">Simpan Token</h3>
          <form action={saveWhatsAppConnectionAction} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm text-ink/70">Token Fonnte</label>
              <input name="fonnteToken" required defaultValue={profile.fonnteToken || ""} placeholder="Masukkan token Fonnte milik tenant" />
            </div>
            <SubmitButton idleLabel="Simpan Token" className="button-primary" />
          </form>
          <div className="mt-6 rounded-[20px] border border-ink/8 bg-white/65 p-4 text-sm leading-7 text-ink/70">
            <p>Langkah setup:</p>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>Scan device tenant di Fonnte.</li>
              <li>Paste webhook URL dari halaman ini di dashboard/device Fonnte.</li>
              <li>Simpan token agar aplikasi bisa membalas chat keluar.</li>
            </ol>
          </div>
        </article>
      </section>
    </div>
  );
}
