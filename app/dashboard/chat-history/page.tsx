import { PageHero } from "@/components/page-hero";
import { PillBadge } from "@/components/pill-badge";
import { requireAppWorkspace } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { listConversationsByProfile } from "@/repositories/conversation.repository";

type ConversationRow = Awaited<ReturnType<typeof listConversationsByProfile>>[number];
type ConversationMessageRow = ConversationRow["messages"][number];

function getMessageRoleTone(role: ConversationMessageRow["role"]) {
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

export default async function ChatHistoryPage() {
  const { profile } = await requireAppWorkspace();
  const conversations = await listConversationsByProfile(profile.id);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Chat History"
        title="Audit percakapan HUMAN dan AI dalam satu timeline yang rapi."
        description="Halaman ini fokus untuk baca riwayat, cek kualitas balasan, dan lompat ke workspace bila perlu takeover percakapan."
        meta={
          <>
            <PillBadge label={`${conversations.length} thread`} tone="blue" />
            <PillBadge label="Read Only Audit" tone="slate" />
          </>
        }
      />

      <div className="space-y-5">
        {conversations.length ? (
          conversations.map((conversation: ConversationRow) => (
            <article key={conversation.id} className="panel overflow-hidden p-0">
              <div className="flex flex-col gap-4 border-b border-slate-200/70 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-display text-3xl text-slate-950">
                      {conversation.contact.displayName || conversation.contact.phone}
                    </h3>
                    <PillBadge
                      label={conversation.contact.mode}
                      tone={conversation.contact.mode === "AI" ? "blue" : "green"}
                    />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{conversation.contact.phone}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm text-slate-500">
                    {conversation.lastMessageAt ? formatDateTime(conversation.lastMessageAt) : "Belum ada aktivitas"}
                  </p>
                  <a href={`/dashboard/chat?contact=${conversation.contact.id}`} className="button-secondary">
                    Buka Workspace
                  </a>
                </div>
              </div>

              <div className="space-y-3 px-6 py-6">
                {conversation.messages.length ? (
                  conversation.messages.map((message: ConversationMessageRow) => {
                    const isUser = message.role === "USER";

                    return (
                      <div key={message.id} className={`flex ${isUser ? "justify-start" : "justify-end"}`}>
                        <div
                          className={`max-w-[82%] rounded-[24px] px-4 py-3 shadow-sm ${
                            isUser
                              ? "border border-slate-200/80 bg-slate-50 text-slate-900"
                              : "border border-blue-200/40 bg-gradient-to-br from-slate-950 to-blue-900 text-slate-50"
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-3">
                            <PillBadge label={message.role} tone={getMessageRoleTone(message.role)} />
                            <span className={`text-[11px] ${isUser ? "text-slate-500" : "text-slate-300/80"}`}>
                              {formatDateTime(message.createdAt)}
                            </span>
                          </div>
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{message.content}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="surface-note p-5 text-sm text-slate-500">Belum ada message yang tersimpan di percakapan ini.</div>
                )}
              </div>
            </article>
          ))
        ) : (
          <section className="panel p-6 text-sm text-slate-500">
            Belum ada percakapan yang tersimpan. Pastikan webhook Fonnte sudah mengarah ke URL tenant Anda.
          </section>
        )}
      </div>
    </div>
  );
}
