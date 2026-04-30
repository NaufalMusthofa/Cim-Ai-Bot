import { requireAppWorkspace } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { listContactsByProfile } from "@/repositories/contact.repository";

type ContactRow = Awaited<ReturnType<typeof listContactsByProfile>>[number];

export default async function ContactsPage() {
  const { profile } = await requireAppWorkspace();
  const contacts = await listContactsByProfile(profile.id);

  return (
    <div className="space-y-6">
      <section className="panel p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-ember/80">CRM Contacts</p>
        <h2 className="mt-3 font-display text-5xl text-ink">Kontak tersimpan dari seluruh chat masuk.</h2>
      </section>

      <section className="table-shell">
        <table>
          <thead>
            <tr>
              <th>Kontak</th>
              <th>Interaksi terakhir</th>
              <th>Follow-up</th>
              <th>Memory</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length ? (
              contacts.map((contact: ContactRow) => (
                <tr key={contact.id}>
                  <td>
                    <p className="font-medium text-ink">{contact.displayName || "Tanpa nama"}</p>
                    <p className="mt-1 text-sm text-ink/60">{contact.phone}</p>
                  </td>
                  <td className="text-sm text-ink/70">
                    {contact.lastInteraction ? formatDateTime(contact.lastInteraction) : "Belum ada balasan AI"}
                  </td>
                  <td className="text-sm text-ink/70">{contact.followupCount}x terkirim</td>
                  <td className="text-sm text-ink/70">{contact.memories.length} memory item</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-sm text-ink/60">
                  Belum ada kontak. Data akan muncul setelah webhook Fonnte menerima chat personal 1:1.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
