import { requireAppWorkspace } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { listConversationsByProfile } from "@/repositories/conversation.repository";

export default async function ConversationsPage() {
  const { profile } = await requireAppWorkspace();
  const conversations = await listConversationsByProfile(profile.id);

  return (
    <div className="space-y-6">
      <section className="panel p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-ember/80">Conversation Log</p>
        <h2 className="mt-3 font-display text-5xl text-ink">Riwayat percakapan untuk audit bot dan sales flow.</h2>
      </section>

      <div className="space-y-4">
        {conversations.length ? (
          conversations.map((conversation) => (
            <article key={conversation.id} className="panel p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-3xl text-ink">
                    {conversation.contact.displayName || conversation.contact.phone}
                  </h3>
                  <p className="mt-1 text-sm text-ink/60">{conversation.contact.phone}</p>
                </div>
                <p className="text-sm text-ink/60">
                  {conversation.lastMessageAt ? formatDateTime(conversation.lastMessageAt) : "Belum ada aktivitas"}
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {conversation.messages.length ? (
                  conversation.messages.map((message) => (
                    <div key={message.id} className="rounded-[22px] border border-ink/8 bg-white/75 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-ember/75">{message.role}</p>
                      <p className="mt-2 text-sm leading-7 text-ink/80">{message.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-ink/60">Belum ada message yang tersimpan di percakapan ini.</p>
                )}
              </div>
            </article>
          ))
        ) : (
          <section className="panel p-6 text-sm text-ink/65">
            Belum ada percakapan yang tersimpan. Pastikan webhook Fonnte sudah mengarah ke URL tenant Anda.
          </section>
        )}
      </div>
    </div>
  );
}
