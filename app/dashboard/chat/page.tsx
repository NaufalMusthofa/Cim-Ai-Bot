import { requireAppWorkspace } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { listChatContactsByProfile } from "@/repositories/contact.repository";
import { getConversationThreadForContact } from "@/repositories/conversation.repository";
import { SubmitButton } from "@/components/submit-button";
import { sendManualReplyAction, switchContactModeAction } from "@/app/dashboard/chat/actions";

type ChatContactRow = Awaited<ReturnType<typeof listChatContactsByProfile>>[number];
type ChatThreadRow = NonNullable<Awaited<ReturnType<typeof getConversationThreadForContact>>>;
type ChatMessageRow = ChatThreadRow["messages"][number];

function getLatestPreview(contact: ChatContactRow) {
  return contact.conversations[0]?.messages[0]?.content || "Belum ada pesan.";
}

function getMessageRoleLabel(role: ChatMessageRow["role"]) {
  if (role === "USER") {
    return "User";
  }

  if (role === "HUMAN") {
    return "Human";
  }

  if (role === "ASSISTANT") {
    return "AI Bot";
  }

  return "System";
}

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

  return (
    <div className="space-y-6">
      <section className="panel p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-ember/80">Chat Workspace</p>
        <h2 className="mt-3 font-display text-5xl text-ink">Pantau user, lihat history chat, dan ganti AI ↔ HUMAN kapan saja.</h2>
        {message ? <p className="mt-6 rounded-2xl bg-pine/10 px-4 py-3 text-sm text-pine">{message}</p> : null}
        {error ? <p className="mt-4 rounded-2xl bg-ember/10 px-4 py-3 text-sm text-ember">{error}</p> : null}
      </section>

      <section className="grid min-h-[70vh] gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="panel overflow-hidden p-0">
          <div className="border-b border-ink/8 px-5 py-4">
            <h3 className="font-display text-3xl text-ink">Daftar User</h3>
            <p className="mt-2 text-sm text-ink/65">Tampilan ini dibuat seperti panel percakapan WhatsApp untuk operasional harian.</p>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {contacts.length ? (
              contacts.map((contact: ChatContactRow) => (
                <a
                  key={contact.id}
                  href={`/dashboard/chat?contact=${contact.id}`}
                  className={`block border-b border-ink/6 px-5 py-4 transition hover:bg-white/65 ${
                    contact.id === selectedContactId ? "bg-white/70" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{contact.displayName || "Tanpa nama"}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-ember/80">{contact.mode}</p>
                    </div>
                    <p className="text-xs text-ink/50">
                      {contact.lastInboundAt ? formatDateTime(contact.lastInboundAt) : "-"}
                    </p>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink/65">{getLatestPreview(contact)}</p>
                </a>
              ))
            ) : (
              <p className="px-5 py-6 text-sm text-ink/60">Belum ada user yang chat. Data akan muncul setelah webhook menerima percakapan masuk.</p>
            )}
          </div>
        </aside>

        <article className="panel flex min-h-[70vh] flex-col p-0">
          {selectedThread ? (
            <>
              <div className="border-b border-ink/8 px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-3xl text-ink">{selectedThread.contact.displayName || selectedThread.contact.phone}</h3>
                    <p className="mt-1 text-sm text-ink/60">{selectedThread.contact.phone}</p>
                  </div>

                  <form action={switchContactModeAction} className="flex items-center gap-3">
                    <input type="hidden" name="contactId" value={selectedThread.contact.id} />
                    <label className="text-sm text-ink/65">Mode balas</label>
                    <select name="mode" defaultValue={selectedThread.contact.mode}>
                      <option value="AI">AI Bot</option>
                      <option value="HUMAN">Human</option>
                    </select>
                    <SubmitButton idleLabel="Ubah Mode" className="button-secondary" />
                  </form>
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                {selectedThread.messages.length ? (
                  selectedThread.messages.map((messageRow: ChatMessageRow) => {
                    const isUser = messageRow.role === "USER";

                    return (
                      <div key={messageRow.id} className={`flex ${isUser ? "justify-start" : "justify-end"}`}>
                        <div
                          className={`max-w-[78%] rounded-[24px] px-4 py-3 text-sm leading-7 ${
                            isUser ? "bg-white/80 text-ink shadow-sm" : "bg-ink text-sand"
                          }`}
                        >
                          <p className={`text-[11px] uppercase tracking-[0.18em] ${isUser ? "text-ember/70" : "text-sand/65"}`}>
                            {getMessageRoleLabel(messageRow.role)}
                          </p>
                          <p className="mt-2 whitespace-pre-wrap">{messageRow.content}</p>
                          <p className={`mt-3 text-[11px] ${isUser ? "text-ink/45" : "text-sand/55"}`}>
                            {formatDateTime(messageRow.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-ink/60">Belum ada history chat untuk user ini.</p>
                )}
              </div>

              <div className="border-t border-ink/8 px-6 py-5">
                <form action={sendManualReplyAction} className="space-y-4">
                  <input type="hidden" name="contactId" value={selectedThread.contact.id} />
                  <div>
                    <label className="mb-2 block text-sm text-ink/70">Balas manual sebagai human</label>
                    <textarea
                      name="message"
                      rows={4}
                      placeholder="Ketik balasan yang mau dikirim ke user..."
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-ink/60">
                      Pesan ini dikirim langsung ke WhatsApp user lewat Fonnte dan tersimpan di history.
                    </p>
                    <SubmitButton idleLabel="Kirim Balasan" className="button-primary" />
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center px-6 py-10 text-center text-sm text-ink/60">
              Pilih user di panel kiri untuk melihat history chat dan mengatur mode balas AI atau HUMAN.
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
