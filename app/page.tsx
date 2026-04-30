import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

const featureCards = [
  {
    title: "WhatsApp AI yang bisa jualan",
    body: "Bot menjawab otomatis, mengingat konteks customer, dan mengarahkan pembicaraan ke jasa website saat relevan."
  },
  {
    title: "CRM yang langsung kepakai",
    body: "Semua chat masuk dipetakan ke kontak, percakapan, memory, dan status follow-up tanpa dashboard yang ribet."
  },
  {
    title: "Multi-tenant siap dijual",
    body: "Setiap user membawa token Fonnte dan nomor WhatsApp sendiri, jadi model SaaS tetap ringan dan bisa diskalakan."
  }
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:px-10">
      <header className="panel flex items-center justify-between px-6 py-5">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-ember/80">CIM Stack</p>
          <h1 className="font-display text-2xl text-ink">{APP_NAME}</h1>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/billing" className="button-secondary">
            Pricing
          </Link>
          <Link href="/auth" className="button-primary">
            Masuk Dashboard
          </Link>
        </nav>
      </header>

      <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex rounded-full border border-ember/20 bg-white/65 px-4 py-2 text-sm text-ember shadow-sm">
            WhatsApp AI SaaS + Auto Sales System
          </div>
          <div className="space-y-4">
            <h2 className="max-w-4xl font-display text-5xl leading-tight text-ink md:text-6xl">
              Bangun admin WhatsApp yang bisa melayani, mengingat, dan follow-up tanpa kerja manual.
            </h2>
            <p className="max-w-2xl text-lg leading-8 text-ink/70">
              CIM AI menggabungkan webhook Fonnte, CRM, subscription, dan trigger sales ke dalam satu alur yang siap dipakai untuk layanan jasa digital.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/auth" className="button-primary">
              Mulai Sekarang
            </Link>
            <Link href="/dashboard" className="button-secondary">
              Lihat Dashboard
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featureCards.map((card) => (
              <article key={card.title} className="panel p-5">
                <h3 className="font-display text-2xl text-ink">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-ink/70">{card.body}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="panel relative overflow-hidden p-6">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-ember/15 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-clay/30 blur-3xl" />
          <div className="relative space-y-5">
            <div className="rounded-[22px] bg-ink px-5 py-4 text-sand shadow-2xl">
              <p className="text-sm text-sand/70">Flow utama</p>
              <p className="mt-3 text-lg">Webhook masuk → Subscription cek → AI reply → CRM update → Follow-up schedule</p>
            </div>
            <div className="rounded-[22px] border border-ink/10 bg-white/90 p-5">
              <p className="text-sm uppercase tracking-[0.18em] text-ember/80">Plan</p>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span>Free</span>
                  <span className="font-semibold">25 chat / hari</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pro</span>
                  <span className="font-semibold">300 chat / bulan</span>
                </div>
              </div>
            </div>
            <div className="rounded-[22px] border border-ink/10 bg-white/90 p-5">
              <p className="text-sm uppercase tracking-[0.18em] text-ember/80">Trigger bawaan</p>
              <p className="mt-3 text-sm leading-7 text-ink/70">
                website, jualan, bisnis, online shop. Semua diarahkan halus ke penawaran jasa website.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
