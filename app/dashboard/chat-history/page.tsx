import { PillBadge } from "@/components/pill-badge";
import { WhatsAppChatSidebar } from "@/components/chat/wa-chat-sidebar";
import { WhatsAppThreadView } from "@/components/chat/wa-thread-view";
import { requireAppWorkspace } from "@/lib/auth";
import { listChatContactsByProfile } from "@/repositories/contact.repository";
import { getConversationThreadForContact } from "@/repositories/conversation.repository";

type ChatContactRow = Awaited<ReturnType<typeof listChatContactsByProfile>>[number];

export default async function ChatHistoryPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { profile } = await requireAppWorkspace();
  const contacts = await listChatContactsByProfile(profile.id);
  const searchParams = props.searchParams ? await props.searchParams : {};
  const requestedContactId = Array.isArray(searchParams.contact) ? searchParams.contact[0] : searchParams.contact;
  const selectedContactId = requestedContactId || contacts[0]?.id;
  const selectedThread = selectedContactId
    ? await getConversationThreadForContact(profile.id, selectedContactId)
    : null;

  const sidebarContacts = contacts.map((contact: ChatContactRow) => ({
    id: contact.id,
    name: contact.displayName || "Tanpa nama",
    phone: contact.phone,
    mode: contact.mode,
    lastPreview: contact.conversations[0]?.messages[0]?.content || "Belum ada pesan.",
    lastInboundAt: contact.lastInboundAt?.toISOString?.() || String(contact.lastInboundAt || "")
  }));

  return (
    <div className="page-shell animate-fade-in">
      <section className="surface-card px-5 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Audit Percakapan</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Chat History ala WhatsApp Web</h1>
            <p className="mt-2 text-sm text-slate-500">
              Halaman read-only untuk audit kualitas balasan AI atau HUMAN sebelum takeover ke workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <PillBadge label={`${contacts.length} thread`} tone="blue" />
            <PillBadge label="Read Only Audit" tone="slate" />
          </div>
        </div>
      </section>

      <section className="surface-card grid min-h-[80vh] overflow-hidden xl:grid-cols-[390px_1fr]">
        <WhatsAppChatSidebar
          appLabel="WhatsApp"
          title="History"
          subtitle="Baca audit thread seperti WhatsApp Web"
          contacts={sidebarContacts}
          selectedContactId={selectedContactId}
          baseHref="/dashboard/chat-history"
          emptyLabel="Belum ada percakapan yang tersimpan."
        />

        <article className="flex min-h-[80vh] flex-col bg-[#F7F7F7]">
          {selectedThread ? (
            <>
              <div className="surface-toolbar flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-sm font-bold text-white shadow-sm">
                    {(selectedThread.contact.displayName || selectedThread.contact.phone || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900">
                        {selectedThread.contact.displayName || selectedThread.contact.phone}
                      </h2>
                      <PillBadge
                        label={selectedThread.contact.mode}
                        tone={selectedThread.contact.mode === "AI" ? "blue" : "green"}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{selectedThread.contact.phone}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs text-slate-500">Mode baca saja</span>
                  <a href={`/dashboard/chat?contact=${selectedThread.contact.id}`} className="button-secondary">
                    Buka Workspace
                  </a>
                </div>
              </div>

              <WhatsAppThreadView
                messages={selectedThread.messages.map((messageRow) => ({
                  id: messageRow.id,
                  role: messageRow.role,
                  content: messageRow.content,
                  createdAt: messageRow.createdAt
                }))}
                emptyLabel="Tidak ada pesan chat untuk thread ini."
              />

              <div className="border-t border-slate-200 bg-[#F0F2F5] px-5 py-4 text-center text-xs text-slate-500">
                Thread ini read-only. Gunakan{" "}
                <a href={`/dashboard/chat?contact=${selectedThread.contact.id}`} className="font-medium text-blue-700">
                  Chat Workspace
                </a>{" "}
                untuk takeover live.
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center px-6 py-10 text-center text-sm text-slate-500">
              Pilih user di panel kiri untuk membaca riwayat percakapan.
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
