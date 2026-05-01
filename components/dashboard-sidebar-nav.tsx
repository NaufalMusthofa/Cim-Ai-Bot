"use client";

import clsx from "clsx";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

type IconName =
  | "dashboard"
  | "chat"
  | "history"
  | "contacts"
  | "whatsapp"
  | "billing"
  | "admin"
  | "payments"
  | "prompt";

type NavItem = {
  href: Route;
  label: string;
  hint: string;
  icon: IconName;
  matchPaths: string[];
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const BASE_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        hint: "Ringkasan tenant",
        icon: "dashboard",
        matchPaths: ["/dashboard"]
      }
    ]
  },
  {
    label: "Operasional",
    items: [
      {
        href: "/dashboard/chat",
        label: "Chat Workspace",
        hint: "Balas live AI atau HUMAN",
        icon: "chat",
        matchPaths: ["/dashboard/chat"]
      },
      {
        href: "/dashboard/chat-history",
        label: "Chat History",
        hint: "Audit percakapan",
        icon: "history",
        matchPaths: ["/dashboard/chat-history", "/dashboard/conversations"]
      },
      {
        href: "/dashboard/contacts",
        label: "Contacts",
        hint: "CRM dan mode user",
        icon: "contacts",
        matchPaths: ["/dashboard/contacts"]
      }
    ]
  },
  {
    label: "Channel",
    items: [
      {
        href: "/dashboard/whatsapp",
        label: "WhatsApp",
        hint: "Token dan webhook",
        icon: "whatsapp",
        matchPaths: ["/dashboard/whatsapp"]
      }
    ]
  },
  {
    label: "Billing",
    items: [
      {
        href: "/dashboard/billing",
        label: "Subscription & Payment",
        hint: "Plan dan upgrade",
        icon: "billing",
        matchPaths: ["/dashboard/billing"]
      }
    ]
  }
];

const ADMIN_GROUP: NavGroup = {
  label: "Admin",
  items: [
    {
      href: "/dashboard/admin",
      label: "Admin Home",
      hint: "Ringkasan admin",
      icon: "admin",
      matchPaths: ["/dashboard/admin"]
    },
    {
      href: "/dashboard/admin/payments",
      label: "Payment Queue",
      hint: "Review pembayaran",
      icon: "payments",
      matchPaths: ["/dashboard/admin/payments"]
    },
    {
      href: "/dashboard/admin/prompts",
      label: "Prompt Cards",
      hint: "Kelola prompt global",
      icon: "prompt",
      matchPaths: ["/dashboard/admin/prompts"]
    }
  ]
};

function SidebarIcon(props: { name: IconName }) {
  const className = "h-[19px] w-[19px] stroke-current";

  switch (props.name) {
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M4 4h7v7H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 13h7v7H4z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M7 17.5h8.5a4.5 4.5 0 0 0 0-9H8a4.5 4.5 0 1 0 0 9H9l-3.5 3v-3Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "history":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M4 12a8 8 0 1 0 2.4-5.7L4 9m8-3v6l4 2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "contacts":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M16 19a4 4 0 0 0-8 0m8 0h3m-11 0H5m7-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm6-1.5a2.5 2.5 0 1 0 0-5m-12 5a2.5 2.5 0 1 1 0-5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M6.8 18.2 5 21l2.9-.8A8 8 0 1 0 4 12a7.9 7.9 0 0 0 2.8 6.2Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.5 9.5c.3-.7.7-.7 1-.7h.4c.1 0 .3 0 .4.3l.9 2c.1.2.1.4 0 .6l-.4.6c-.1.1-.2.2-.1.4.2.5 1 1.6 2.2 2.1.2.1.3 0 .4-.1l.5-.6c.2-.2.4-.2.6-.1l1.9.9c.2.1.3.3.3.4v.4c0 .3-.1.7-.7 1-.6.3-1.3.5-2 .4-1.1-.1-2.3-.8-3.7-2.1-1.3-1.3-2.1-2.6-2.3-3.8-.1-.7.1-1.3.4-1.7Z" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "billing":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M4 7.5h16M6 4h12a2 2 0 0 1 2 2v12.5a1.5 1.5 0 0 1-2.2 1.3L12 17l-5.8 2.8A1.5 1.5 0 0 1 4 18.5V6a2 2 0 0 1 2-2Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "admin":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M12 3 5 6v5c0 4.5 2.7 7.9 7 10 4.3-2.1 7-5.5 7-10V6l-7-3Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "payments":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M3.5 7.5h17m-15 9h8m-8 0a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5.5Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "prompt":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="m5 18 2.5-6L14 5.5a1.8 1.8 0 0 1 2.5 0l2 2a1.8 1.8 0 0 1 0 2.5L12 16.5 6 19l-1-1Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m13 7 4 4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

function isItemActive(pathname: string, item: NavItem) {
  return item.matchPaths.includes(pathname);
}

export function DashboardSidebarNav(props: { isAdmin: boolean; collapsed?: boolean }) {
  const pathname = usePathname();
  const groups = props.isAdmin ? [...BASE_GROUPS, ADMIN_GROUP] : BASE_GROUPS;
  const collapsed = props.collapsed || false;

  return (
    <nav className="mt-8 space-y-8">
      {groups.map((group) => (
        <div key={group.label}>
          {!collapsed ? <p className="sidebar-group-title">{group.label}</p> : null}
          <div className="mt-3 space-y-2">
            {group.items.map((item) => {
              const isActive = isItemActive(pathname, item);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx("sidebar-link", isActive && "sidebar-link-active")}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="sidebar-link-icon">
                    <SidebarIcon name={item.icon} />
                  </span>
                  {!collapsed ? (
                    <>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{item.label}</span>
                        <span className="mt-1 block truncate text-xs text-slate-300/70">{item.hint}</span>
                      </span>
                      <span
                        className={clsx(
                          "h-2.5 w-2.5 rounded-full transition",
                          isActive ? "bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.95)]" : "bg-white/12"
                        )}
                      />
                    </>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
