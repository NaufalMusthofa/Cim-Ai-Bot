import Link from "next/link";
import { SubmitButton } from "@/components/submit-button";
import { PillBadge } from "@/components/pill-badge";
import { WhatsAppChatSidebar } from "@/components/chat/wa-chat-sidebar";
import { WhatsAppThreadView } from "@/components/chat/wa-thread-view";
import { requireAppWorkspace } from "@/lib/auth";
import { sendManualReplyAction, switchContactModeAction } from "@/app/dashboard/chat/actions";
import { listChatContactsByProfile } from "@/repositories/contact.repository";
import { getConversationThreadForContact } from "@/repositories/conversation.repository";

type ChatContactRow = Awaited<ReturnType<typeof listChatContactsByProfile>>[number];

export default async function DashboardChatPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { profile } = await requireAppWorkspace();
  const contacts = await listChatContactsByProfile(profile.id);
  const searchParams = props.searchParams ? await props.searchParams : {};
  const message = Array.isArray(searchParams.message) ? searchParams.message[0] : searchParams.message;
  const error = Array.isArray(searchParams.error) ? searchParams.error[0] : searchParams.error;
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
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Operasional Chat</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Chat Workspace ala WhatsApp Web</h1>
            <p className="mt-2 text-sm text-slate-500">
              Ambil alih ke HUMAN kapan saja, lalu balas manual langsung dari thread aktif.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <PillBadge label={`${contacts.length} chat user`} tone="green" />
            <Link href="/dashboard/chat-history" className="button-secondary">
              Buka History
            </Link>
          </div>
        </div>
      </section>

      {message ? <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <section className="surface-card grid min-h-[80vh] overflow-hidden xl:grid-cols-[390px_1fr]">
        <WhatsAppChatSidebar
          appLabel="WhatsApp"
          title="Workspace"
          subtitle="Cari user dan takeover thread aktif"
          contacts={sidebarContacts}
          selectedContactId={selectedContactId}
          baseHref="/dashboard/chat"
          emptyLabel="Belum ada user yang chat. Data akan muncul setelah webhook menerima percakapan masuk."
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

                <div className="flex flex-col gap-3 lg:items-end">
                  <form action={switchContactModeAction} className="flex flex-wrap items-center gap-3">
                    <input type="hidden" name="contactId" value={selectedThread.contact.id} />
                    <select name="mode" defaultValue={selectedThread.contact.mode} className="min-w-[150px] rounded-full">
                      <option value="AI">AI Bot</option>
                      <option value="HUMAN">Human</option>
                    </select>
                    <SubmitButton idleLabel="Ubah Mode" className="button-secondary" />
                  </form>
                  <p className="text-xs text-slate-500">Mode AI/HUMAN bisa diganti di tengah percakapan.</p>
                </div>
              </div>

              <WhatsAppThreadView
                messages={selectedThread.messages.map((messageRow) => ({
                  id: messageRow.id,
                  role: messageRow.role,
                  content: messageRow.content,
                  createdAt: messageRow.createdAt
                }))}
                emptyLabel="Belum ada history chat untuk user ini."
              />

              <div className="border-t border-slate-200 bg-[#F0F2F5] px-4 py-3">
                <form action={sendManualReplyAction} className="space-y-3">
                  <input type="hidden" name="contactId" value={selectedThread.contact.id} />
                  <div className="flex items-end gap-3">
                    <button
                      type="button"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm"
                      title="Aksi tambahan"
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 stroke-current">
                        <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>

                    <div className="flex-1 rounded-[28px] bg-white px-4 py-2 shadow-sm">
                      <textarea
                        name="message"
                        rows={2}
                        placeholder="Ketik pesan"
                        className="min-h-[44px] resize-none border-0 bg-transparent px-0 py-1 shadow-none focus:ring-0"
                      />
                    </div>

                    <SubmitButton idleLabel="Kirim Balasan" className="button-primary" />
                  </div>
                  <p className="text-xs text-slate-500">
                    Balasan manual dikirim lewat Fonnte dan langsung masuk ke history thread user ini.
                  </p>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center px-6 py-10 text-center text-sm text-slate-500">
              Pilih user di panel kiri untuk melihat thread aktif dan mengatur mode balas AI atau HUMAN.
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
