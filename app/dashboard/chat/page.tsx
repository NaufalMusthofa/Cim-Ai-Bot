import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { PillBadge } from "@/components/pill-badge";
import { SubmitButton } from "@/components/submit-button";
import { requireAppWorkspace } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { sendManualReplyAction, switchContactModeAction } from "@/app/dashboard/chat/actions";
import { listChatContactsByProfile } from "@/repositories/contact.repository";
import { getConversationThreadForContact } from "@/repositories/conversation.repository";

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

function getMessageRoleTone(role: ChatMessageRow["role"]) {
  if (role === "USER") {
    return "slate";
  }

  if (role === "HUMAN") {
    return "green";
  }

  if (role === "ASSISTANT") {
    return "blue";
  }

  return "amber";
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
      <PageHero
        eyebrow="Chat Workspace"
        title="Pantau user, takeover chat, dan ganti AI ↔ HUMAN dari satu workspace."
        description="Halaman ini fokus untuk operasional live. Semua riwayat audit dipisah ke Chat History agar workspace balas pesan tetap bersih."
        meta={
          <>
            <PillBadge label={`${contacts.length} user`} tone="blue" />
            <PillBadge label="Live Workspace" tone="green" />
          </>
        }
        actions={<Link href="/dashboard/chat-history" className="button-secondary">Buka Chat History</Link>}
      />

      {message ? <p className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      <section className="grid min-h-[72vh] gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="panel overflow-hidden p-0">
          <div className="border-b border-slate-200/75 px-5 py-5">
            <h3 className="font-display text-3xl text-slate-950">Daftar User</h3>
            <p className="mt-2 text-sm text-slate-500">Pilih kontak untuk melihat thread aktif dan mengatur mode balas.</p>
          </div>

          <div className="glass-scroll max-h-[72vh] overflow-y-auto p-3">
            {contacts.length ? (
              contacts.map((contact: ChatContactRow) => (
                <a
                  key={contact.id}
                  href={`/dashboard/chat?contact=${contact.id}`}
                  className={`block rounded-[26px] border p-4 transition ${
                    contact.id === selectedContactId
                      ? "border-blue-300 bg-gradient-to-br from-blue-50 to-white shadow-sm"
                      : "border-transparent bg-white/60 hover:border-slate-200 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{contact.displayName || "Tanpa nama"}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">{contact.phone}</p>
                    </div>
                    <PillBadge label={contact.mode} tone={contact.mode === "AI" ? "blue" : "green"} />
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{getLatestPreview(contact)}</p>
                  <p className="mt-3 text-xs text-slate-400">
                    {contact.lastInboundAt ? formatDateTime(contact.lastInboundAt) : "Belum ada inbound"}
                  </p>
                </a>
              ))
            ) : (
              <p className="px-3 py-6 text-sm text-slate-500">
                Belum ada user yang chat. Data akan muncul setelah webhook menerima percakapan masuk.
              </p>
            )}
          </div>
        </aside>

        <article className="panel flex min-h-[72vh] flex-col overflow-hidden p-0">
          {selectedThread ? (
            <>
              <div className="border-b border-slate-200/75 px-6 py-5">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-display text-3xl text-slate-950">
                        {selectedThread.contact.displayName || selectedThread.contact.phone}
                      </h3>
                      <PillBadge
                        label={selectedThread.contact.mode}
                        tone={selectedThread.contact.mode === "AI" ? "blue" : "green"}
                      />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{selectedThread.contact.phone}</p>
                  </div>

                  <div className="flex flex-col gap-3 xl:items-end">
                    <form action={switchContactModeAction} className="flex flex-wrap items-center gap-3">
                      <input type="hidden" name="contactId" value={selectedThread.contact.id} />
                      <label className="text-sm text-slate-500">Mode balas</label>
                      <select name="mode" defaultValue={selectedThread.contact.mode} className="min-w-[160px]">
                        <option value="AI">AI Bot</option>
                        <option value="HUMAN">Human</option>
                      </select>
                      <SubmitButton idleLabel="Ubah Mode" className="button-secondary" />
                    </form>
                    <Link href="/dashboard/chat-history" className="text-sm font-medium text-blue-700">
                      Lihat semua history →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="glass-scroll flex-1 space-y-4 overflow-y-auto bg-slate-50/70 px-6 py-6">
                {selectedThread.messages.length ? (
                  selectedThread.messages.map((messageRow: ChatMessageRow) => {
                    const isUser = messageRow.role === "USER";

                    return (
                      <div key={messageRow.id} className={`flex ${isUser ? "justify-start" : "justify-end"}`}>
                        <div
                          className={`max-w-[78%] rounded-[26px] px-4 py-3 shadow-sm ${
                            isUser
                              ? "border border-slate-200/80 bg-white text-slate-900"
                              : "border border-blue-200/30 bg-gradient-to-br from-slate-950 to-blue-900 text-slate-50"
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-3">
                            <PillBadge label={getMessageRoleLabel(messageRow.role)} tone={getMessageRoleTone(messageRow.role)} />
                            <span className={`text-[11px] ${isUser ? "text-slate-500" : "text-slate-300/80"}`}>
                              {formatDateTime(messageRow.createdAt)}
                            </span>
                          </div>
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{messageRow.content}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-500">Belum ada history chat untuk user ini.</p>
                )}
              </div>

              <div className="border-t border-slate-200/75 px-6 py-5">
                <form action={sendManualReplyAction} className="space-y-4">
                  <input type="hidden" name="contactId" value={selectedThread.contact.id} />
                  <div>
                    <label className="mb-2 block text-sm text-slate-600">Balas manual sebagai human</label>
                    <textarea name="message" rows={4} placeholder="Ketik balasan yang mau dikirim ke user..." />
                  </div>
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <p className="text-sm leading-7 text-slate-500">
                      Pesan manual tetap dikirim lewat Fonnte dan langsung masuk ke history thread user ini.
                    </p>
                    <SubmitButton idleLabel="Kirim Balasan" className="button-primary" />
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center px-6 py-10 text-center text-sm text-slate-500">
              Pilih user di panel kiri untuk melihat history chat dan mengatur mode balas AI atau HUMAN.
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
