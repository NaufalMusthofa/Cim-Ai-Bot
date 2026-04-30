import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/submit-button";
import { signInAction, signUpAction } from "@/app/auth/actions";

export default async function AuthPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!hasSupabaseEnv()) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-10">
        <section className="panel w-full p-8">
          <h1 className="font-display text-4xl text-ink">Supabase belum dikonfigurasi</h1>
          <p className="mt-4 text-lg leading-8 text-ink/70">
            Isi `.env.local` dengan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, lalu jalankan ulang aplikasi.
          </p>
        </section>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const searchParams = props.searchParams ? await props.searchParams : {};
  const message = Array.isArray(searchParams.message) ? searchParams.message[0] : searchParams.message;
  const error = Array.isArray(searchParams.error) ? searchParams.error[0] : searchParams.error;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-10 lg:px-10">
      <section className="grid w-full gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="panel p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-ember/80">Akses Tenant</p>
          <h1 className="mt-4 font-display text-5xl leading-tight text-ink">
            Login untuk mulai hubungkan WhatsApp, CRM, dan AI.
          </h1>
          <p className="mt-5 text-lg leading-8 text-ink/70">
            Auth menggunakan Supabase. Setelah login, workspace tenant dan paket Free akan dibootstrap otomatis.
          </p>
          {message ? <p className="mt-6 rounded-2xl bg-pine/10 px-4 py-3 text-sm text-pine">{message}</p> : null}
          {error ? <p className="mt-4 rounded-2xl bg-ember/10 px-4 py-3 text-sm text-ember">{error}</p> : null}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="panel p-6">
            <h2 className="font-display text-3xl text-ink">Masuk</h2>
            <form action={signInAction} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-ink/70">Email</label>
                <input name="email" type="email" required placeholder="owner@bisnis.com" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-ink/70">Password</label>
                <input name="password" type="password" required placeholder="••••••••" />
              </div>
              <SubmitButton idleLabel="Masuk Dashboard" className="button-primary w-full" />
            </form>
          </section>

          <section className="panel p-6">
            <h2 className="font-display text-3xl text-ink">Daftar</h2>
            <form action={signUpAction} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-ink/70">Nama bisnis</label>
                <input name="businessName" placeholder="Studio Website Nopal" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-ink/70">Email</label>
                <input name="email" type="email" required placeholder="owner@bisnis.com" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-ink/70">Password</label>
                <input name="password" type="password" required minLength={8} placeholder="Minimal 8 karakter" />
              </div>
              <SubmitButton idleLabel="Buat Akun" className="button-primary w-full" />
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}
