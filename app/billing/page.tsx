import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "Rp0",
    limit: "25 chat / hari",
    highlight: "Cocok untuk uji coba bot dan CRM dasar."
  },
  {
    name: "Pro",
    price: "Rp150.000",
    limit: "300 chat / bulan",
    highlight: "Untuk operasional jualan yang butuh volume lebih tinggi dan prioritas support."
  }
];

export default function BillingPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10 lg:px-10">
      <div className="panel px-6 py-5">
        <p className="text-sm uppercase tracking-[0.22em] text-ember/80">Pricing</p>
        <h1 className="mt-3 font-display text-5xl text-ink">Paket sederhana, logika SaaS jelas.</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-ink/70">
          Setiap tenant memakai nomor dan token Fonnte sendiri. Anda menjual sistem AI WhatsApp dan jasa Anda, bukan menjual nomor WhatsApp.
        </p>
      </div>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <article key={plan.name} className="panel p-6">
            <p className="text-sm uppercase tracking-[0.18em] text-ember/75">{plan.name}</p>
            <h2 className="mt-3 font-display text-4xl text-ink">{plan.price}</h2>
            <p className="mt-2 text-lg text-ink/80">{plan.limit}</p>
            <p className="mt-6 text-sm leading-7 text-ink/70">{plan.highlight}</p>
          </article>
        ))}
      </section>

      <div className="mt-8 flex gap-4">
        <Link href="/auth" className="button-primary">
          Buat Akun
        </Link>
        <Link href="/" className="button-secondary">
          Kembali
        </Link>
      </div>
    </main>
  );
}
