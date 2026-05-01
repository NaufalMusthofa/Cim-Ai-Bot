"use client";

import { useState } from "react";
import { signOutAction } from "@/app/auth/actions";
import { DashboardSidebarNav } from "@/components/dashboard-sidebar-nav";
import { PillBadge } from "@/components/pill-badge";

function ChevronIcon(props: { collapsed: boolean }) {
  return props.collapsed ? (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current">
      <path d="m9 6 6 6-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current">
      <path d="m15 6-6 6 6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 stroke-current">
      <path d="M4 7h16M4 12h16M4 17h16" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 stroke-current">
      <path d="m6 6 12 12M18 6 6 18" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 stroke-current">
      <path d="M4 7.5h16M6 4h12a2 2 0 0 1 2 2v12.5a1.5 1.5 0 0 1-2.2 1.3L12 17l-5.8 2.8A1.5 1.5 0 0 1 4 18.5V6a2 2 0 0 1 2-2Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SidebarContent(props: {
  businessName: string;
  email: string;
  plan: string;
  usageCount: number;
  limitCount: number;
  isAdmin: boolean;
  collapsed: boolean;
  onToggle: () => void;
  onCloseMobile?: () => void;
}) {
  const usagePercent = props.limitCount ? Math.min(100, Math.round((props.usageCount / props.limitCount) * 100)) : 0;
  const initials = props.businessName.slice(0, 2).toUpperCase();

  return (
    <div className="relative flex h-full flex-col px-3 py-4">
      <div className={`sidebar-brand-card ${props.collapsed ? "p-3" : "p-4"}`}>
        <div className={`flex ${props.collapsed ? "flex-col items-center gap-3" : "items-start justify-between gap-4"}`}>
          <div className={`flex items-center ${props.collapsed ? "justify-center" : "gap-3"}`}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-950/40">
              <WalletIcon />
            </div>

            {!props.collapsed ? (
              <div className="overflow-hidden">
                <p className="text-[11px] uppercase tracking-[0.26em] text-cyan-200/70">CIM AI</p>
                <h1 className="mt-1 whitespace-nowrap text-lg font-semibold tracking-tight text-white">Admin Workspace</h1>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {props.onCloseMobile ? (
              <button
                type="button"
                onClick={props.onCloseMobile}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
                title="Tutup sidebar"
              >
                <CloseIcon />
              </button>
            ) : null}

            <button
              type="button"
              onClick={props.onToggle}
              className="hidden h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white lg:flex"
              title={props.collapsed ? "Perbesar sidebar" : "Kecilkan sidebar"}
            >
              <ChevronIcon collapsed={props.collapsed} />
            </button>
          </div>
        </div>
      </div>

      <div className={`mt-4 sidebar-brand-card ${props.collapsed ? "p-3" : "p-4"}`}>
        <div className={`flex ${props.collapsed ? "justify-center" : "items-start gap-3"}`}>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 text-sm font-bold text-white shadow-lg shadow-cyan-950/30">
            {initials}
          </div>

          {!props.collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{props.businessName}</p>
              <p className="mt-1 truncate text-[11px] text-slate-400">{props.email}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <PillBadge
                  label={props.plan}
                  tone={props.plan === "PRO" ? "violet" : "blue"}
                  className={
                    props.plan === "PRO"
                      ? "bg-violet-500/15 text-violet-100 ring-violet-300/20"
                      : "bg-cyan-500/15 text-cyan-100 ring-cyan-300/20"
                  }
                />
                <span className="text-[11px] text-slate-300/70">
                  {props.usageCount}/{props.limitCount} chat
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] text-slate-300/60">
                  <span>Usage</span>
                  <span>{usagePercent}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${usagePercent}%` }} />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto styled-scrollbar">
        <DashboardSidebarNav isAdmin={props.isAdmin} collapsed={props.collapsed} />
      </div>

      <div className={`mt-4 sidebar-brand-card ${props.collapsed ? "p-3" : "p-4"}`}>
        <div className={`flex ${props.collapsed ? "flex-col items-center gap-3" : "items-center gap-3"}`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xs font-bold text-white">
            {initials}
          </div>

          {!props.collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{props.businessName}</p>
              <p className="mt-1 truncate text-[11px] text-slate-400">{props.email}</p>
            </div>
          ) : null}
        </div>

        {!props.collapsed ? (
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-3 py-2.5">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span>Sistem Aktif</span>
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/35">v1.0.0</span>
          </div>
        ) : null}

        <form action={signOutAction} className="mt-4">
          <button
            type="submit"
            className={`button-secondary w-full border-white/10 bg-white/8 text-white hover:bg-white/14 ${props.collapsed ? "px-0" : ""}`}
            title={props.collapsed ? "Keluar" : undefined}
          >
            {props.collapsed ? "↗" : "Keluar dari Workspace"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function DashboardShell(props: {
  businessName: string;
  email: string;
  plan: string;
  usageCount: number;
  limitCount: number;
  isAdmin: boolean;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <main className="flex min-h-screen bg-transparent">
      <div className="fixed left-4 right-4 top-4 z-40 lg:hidden">
        <div className="flex items-center justify-between rounded-[24px] border border-slate-200/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">CIM AI</p>
            <h1 className="mt-1 text-sm font-semibold text-slate-900">{props.businessName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <PillBadge label={props.plan} tone={props.plan === "PRO" ? "violet" : "blue"} />
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700"
              title="Buka menu"
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] lg:hidden">
          <div className="h-full max-w-[340px] p-4">
            <aside className="sidebar-shell h-full overflow-hidden">
              <SidebarContent
                businessName={props.businessName}
                email={props.email}
                plan={props.plan}
                usageCount={props.usageCount}
                limitCount={props.limitCount}
                isAdmin={props.isAdmin}
                collapsed={false}
                onToggle={() => undefined}
                onCloseMobile={() => setMobileOpen(false)}
              />
            </aside>
          </div>
        </div>
      ) : null}

      <aside className={`${collapsed ? "w-24" : "w-[292px]"} relative hidden shrink-0 self-stretch transition-all duration-300 lg:block`}>
        <div className="sidebar-shell sticky top-0 h-screen overflow-hidden border-r border-slate-800/80 shadow-sidebar">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-blue-500/10 via-cyan-400/5 to-transparent" />
          <SidebarContent
            businessName={props.businessName}
            email={props.email}
            plan={props.plan}
            usageCount={props.usageCount}
            limitCount={props.limitCount}
            isAdmin={props.isAdmin}
            collapsed={collapsed}
            onToggle={() => setCollapsed((value) => !value)}
          />
        </div>
      </aside>

      <section className="relative flex-1 overflow-auto styled-scrollbar pt-24 lg:pt-0">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-white/60 to-transparent" />
        <div className="relative min-h-screen">{props.children}</div>
      </section>
    </main>
  );
}
