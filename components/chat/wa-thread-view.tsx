import { PillBadge } from "@/components/pill-badge";
import { formatDateTime } from "@/lib/utils";

type ThreadMessage = {
  id: string;
  role: "USER" | "ASSISTANT" | "HUMAN" | "SYSTEM";
  content: string;
  createdAt: Date | string;
};

function getRoleLabel(role: ThreadMessage["role"]) {
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

function getRoleTone(role: ThreadMessage["role"]) {
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

function formatChatDateLabel(date: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium"
  }).format(typeof date === "string" ? new Date(date) : date);
}

function groupMessagesByDate(messages: ThreadMessage[]) {
  const groups: Array<{ date: Date | string; messages: ThreadMessage[] }> = [];
  let currentDate = "";

  for (const message of messages) {
    const rawDate = typeof message.createdAt === "string" ? new Date(message.createdAt) : message.createdAt;
    const dateKey = rawDate.toDateString();

    if (dateKey !== currentDate) {
      currentDate = dateKey;
      groups.push({
        date: message.createdAt,
        messages: []
      });
    }

    groups[groups.length - 1].messages.push(message);
  }

  return groups;
}

export function WhatsAppThreadView(props: {
  messages: ThreadMessage[];
  emptyLabel: string;
}) {
  const groups = groupMessagesByDate(props.messages);

  return (
    <div className="wa-bg chat-scrollbar flex-1 overflow-y-auto px-5 py-4">
      {props.messages.length ? (
        groups.map((group, index) => (
          <div key={`${typeof group.date === "string" ? group.date : group.date.toISOString()}-${index}`}>
            <div className="my-3 flex justify-center">
              <span className="rounded-full bg-white/85 px-3 py-1 text-xs text-slate-500 shadow-sm">
                {formatChatDateLabel(group.date)}
              </span>
            </div>

            {group.messages.map((message) => {
              const isUser = message.role === "USER";

              return (
                <div key={message.id} className={`mb-3 flex ${isUser ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[78%] rounded-[18px] px-4 py-3 shadow-sm ${
                      isUser
                        ? "border border-slate-200 bg-white text-slate-900"
                        : "bg-[#DCF8C6] text-slate-900"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <PillBadge label={getRoleLabel(message.role)} tone={getRoleTone(message.role)} className="text-[10px]" />
                      <span className="text-[11px] text-slate-500">{formatDateTime(message.createdAt)}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{message.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ))
      ) : (
        <div className="flex h-full items-center justify-center py-20">
          <div className="rounded-2xl bg-white/80 px-5 py-4 text-center text-sm text-slate-500 shadow-sm">
            {props.emptyLabel}
          </div>
        </div>
      )}
    </div>
  );
}
