"use client";

import { useMemo, useState } from "react";
import { PillBadge } from "@/components/pill-badge";

type FilterMode = "ALL" | "AI" | "HUMAN";

export type WhatsAppSidebarContact = {
  id: string;
  name: string;
  phone: string;
  mode: "AI" | "HUMAN";
  lastPreview: string;
  lastInboundAt?: string | null;
};

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current">
      <path d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function formatListTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  if (sameDay) {
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "numeric",
    year: now.getFullYear() === date.getFullYear() ? undefined : "numeric"
  }).format(date);
}

export function WhatsAppChatSidebar(props: {
  appLabel: string;
  title: string;
  subtitle?: string;
  contacts: WhatsAppSidebarContact[];
  selectedContactId?: string;
  baseHref: "/dashboard/chat" | "/dashboard/chat-history";
  emptyLabel: string;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("ALL");

  const filteredContacts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return props.contacts.filter((contact) => {
      const modeMatch = filter === "ALL" ? true : contact.mode === filter;
      const textMatch = keyword
        ? `${contact.name} ${contact.phone} ${contact.lastPreview}`.toLowerCase().includes(keyword)
        : true;

      return modeMatch && textMatch;
    });
  }, [filter, props.contacts, search]);

  const chips: Array<{ id: FilterMode; label: string }> = [
    { id: "ALL", label: "Semua" },
    { id: "AI", label: "Mode AI" },
    { id: "HUMAN", label: "Mode HUMAN" }
  ];

  return (
    <aside className="flex h-full flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[2rem] font-semibold tracking-tight text-[#25D366]">{props.appLabel}</h2>
            {props.subtitle ? <p className="mt-1 text-sm text-slate-500">{props.subtitle}</p> : null}
          </div>
          <PillBadge label={props.title} tone="green" className="normal-case tracking-normal" />
        </div>

        <div className="relative mt-4">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari atau mulai chat baru"
            className="rounded-full border border-slate-200 bg-white px-4 py-3 pl-11 text-sm shadow-none focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((chip) => {
            const active = filter === chip.id;

            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setFilter(chip.id)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="styled-scrollbar flex-1 overflow-y-auto">
        {filteredContacts.length ? (
          filteredContacts.map((contact) => {
            const selected = contact.id === props.selectedContactId;

            return (
              <a
                key={contact.id}
                href={`${props.baseHref}?contact=${contact.id}`}
                className={`flex items-start gap-3 border-b border-slate-100 px-4 py-3 transition ${
                  selected ? "bg-emerald-50/70" : "hover:bg-slate-50/80"
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-200 via-rose-100 to-blue-100 text-sm font-semibold text-slate-700 shadow-sm">
                  {contact.name.trim().charAt(0).toUpperCase() || "?"}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[1.05rem] font-medium text-slate-900">{contact.name}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">{contact.phone}</p>
                    </div>
                    <div className="shrink-0 text-xs text-slate-400">{formatListTime(contact.lastInboundAt)}</div>
                  </div>

                  <div className="mt-2 flex items-start justify-between gap-3">
                    <p className="line-clamp-2 text-sm leading-6 text-slate-600">{contact.lastPreview}</p>
                    <PillBadge label={contact.mode} tone={contact.mode === "AI" ? "blue" : "green"} className="shrink-0 text-[10px]" />
                  </div>
                </div>
              </a>
            );
          })
        ) : (
          <div className="p-6 text-center text-sm text-slate-500">{props.emptyLabel}</div>
        )}
      </div>
    </aside>
  );
}
