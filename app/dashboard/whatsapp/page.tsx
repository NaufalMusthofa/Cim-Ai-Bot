import { PageHero } from "@/components/page-hero";
import { PillBadge } from "@/components/pill-badge";
import { SubmitButton } from "@/components/submit-button";
import { requireAppWorkspace } from "@/lib/auth";
import { getAppUrl } from "@/lib/env";
import { redactToken } from "@/lib/utils";
import { regenerateWebhookKeyAction, saveWhatsAppConnectionAction } from "@/app/dashboard/actions";

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
      <PageHero
        eyebrow="WhatsApp Onboarding"
        title="Hubungkan tenant ke Fonnte dengan setup yang lebih jelas."
        description="Halaman ini dipakai untuk menyimpan token, mengambil webhook URL unik, dan memastikan tenant siap menerima serta membalas chat WhatsApp."
        meta={<PillBadge label="Auto Route: Personal + Sales" tone="green" />}
      />

      {message ? <p className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <article className="panel p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Current Connection</p>
              <h3 className="mt-3 font-display text-3xl text-slate-950">Status token dan webhook tenant.</h3>
            </div>
            <PillBadge label="Ready for Fonnte" tone="blue" />
          </div>

          <dl className="mt-6 space-y-4 text-sm text-slate-700">
            <div className="muted-card p-4">
              <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Token Fonnte</dt>
              <dd className="mt-2">{redactToken(profile.fonnteToken)}</dd>
            </div>
            <div className="muted-card p-4">
              <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Webhook URL unik</dt>
              <dd className="mt-2 break-all">{webhookUrl}</dd>
            </div>
            <div className="muted-card p-4">
              <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Mode AI aktif</dt>
              <dd className="mt-2">Auto Route: Personal + Sales</dd>
            </div>
          </dl>

          <form action={regenerateWebhookKeyAction} className="mt-6">
            <SubmitButton idleLabel="Regenerate Webhook Key" className="button-secondary" />
          </form>
        </article>

        <article className="panel p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Setup Device</p>
          <h3 className="mt-3 font-display text-3xl text-slate-950">Simpan token dan ikuti alur pemasangan webhook.</h3>

          <form action={saveWhatsAppConnectionAction} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm text-slate-600">Token Fonnte</label>
              <input
                name="fonnteToken"
                required
                defaultValue={profile.fonnteToken || ""}
                placeholder="Masukkan token Fonnte milik tenant"
              />
            </div>
            <SubmitButton idleLabel="Simpan Token" className="button-primary" />
          </form>

          <div className="surface-note mt-6 p-5 text-sm leading-7 text-slate-600">
            <p className="font-semibold text-slate-900">Langkah setup</p>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>Scan device tenant di Fonnte.</li>
              <li>Paste webhook URL dari halaman ini ke dashboard device Fonnte.</li>
              <li>Pastikan `autoread` aktif agar chatbot bisa memproses pesan masuk.</li>
              <li>Simpan token supaya aplikasi bisa membalas chat keluar dengan benar.</li>
            </ol>
          </div>
        </article>
      </section>
    </div>
  );
}
