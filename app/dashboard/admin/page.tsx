import { assertAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { listProfilesPendingUpgrade } from "@/repositories/profile.repository";
import { activateProAction } from "@/app/dashboard/actions";
import { SubmitButton } from "@/components/submit-button";

type PendingProfile = Awaited<ReturnType<typeof listProfilesPendingUpgrade>>[number];

export default async function AdminPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await assertAdmin();
  const pendingProfiles = await listProfilesPendingUpgrade();
  const searchParams = props.searchParams ? await props.searchParams : {};
  const message = Array.isArray(searchParams.message) ? searchParams.message[0] : searchParams.message;

  return (
    <div className="space-y-6">
      <section className="panel p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-ember/80">Admin Approval</p>
        <h2 className="mt-3 font-display text-5xl text-ink">Aktivasi plan PRO setelah verifikasi transfer.</h2>
        {message ? <p className="mt-6 rounded-2xl bg-pine/10 px-4 py-3 text-sm text-pine">{message}</p> : null}
      </section>

      <section className="table-shell">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Bisnis</th>
              <th>Minta upgrade</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pendingProfiles.length ? (
              pendingProfiles.map((profile: PendingProfile) => (
                <tr key={profile.id}>
                  <td>{profile.email}</td>
                  <td>{profile.businessName || "-"}</td>
                  <td>{profile.upgradeRequestedAt ? formatDateTime(profile.upgradeRequestedAt) : "-"}</td>
                  <td>
                    <form action={activateProAction}>
                      <input type="hidden" name="userId" value={profile.id} />
                      <SubmitButton idleLabel="Aktifkan PRO" className="button-primary" />
                    </form>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-sm text-ink/60">
                  Belum ada permintaan upgrade yang menunggu aktivasi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
