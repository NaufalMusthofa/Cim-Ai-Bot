import { PageHero } from "@/components/page-hero";
import { PillBadge } from "@/components/pill-badge";
import { requireAppWorkspace } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { listContactsByProfile } from "@/repositories/contact.repository";

type ContactRow = Awaited<ReturnType<typeof listContactsByProfile>>[number];

export default async function ContactsPage() {
  const { profile } = await requireAppWorkspace();
  const contacts = await listContactsByProfile(profile.id);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="CRM Contacts"
        title="Kontak yang tersimpan dari seluruh chat masuk tenant."
        description="Daftar ini membantu Anda melihat siapa yang aktif, mode balas yang dipakai, dan seberapa jauh follow-up atau memory sudah terbentuk."
        meta={<PillBadge label={`${contacts.length} kontak`} tone="blue" />}
      />

      <section className="table-shell">
        <table>
          <thead>
            <tr>
              <th>Kontak</th>
              <th>Mode</th>
              <th>Interaksi terakhir</th>
              <th>Follow-up</th>
              <th>Memory</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length ? (
              contacts.map((contact: ContactRow) => (
                <tr key={contact.id}>
                  <td>
                    <p className="font-semibold text-slate-900">{contact.displayName || "Tanpa nama"}</p>
                    <p className="mt-1 text-sm text-slate-500">{contact.phone}</p>
                  </td>
                  <td>
                    <PillBadge label={contact.mode} tone={contact.mode === "AI" ? "blue" : "green"} />
                  </td>
                  <td className="text-sm text-slate-600">
                    {contact.lastInteraction ? formatDateTime(contact.lastInteraction) : "Belum ada balasan AI"}
                  </td>
                  <td className="text-sm text-slate-600">{contact.followupCount}x terkirim</td>
                  <td className="text-sm text-slate-600">{contact.memories.length} memory item</td>
                  <td>
                    <a href={`/dashboard/chat?contact=${contact.id}`} className="button-secondary">
                      Buka Chat
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-sm text-slate-500">
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
