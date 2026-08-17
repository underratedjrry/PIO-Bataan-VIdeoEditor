"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SidebarNav } from "./SidebarNav";
import { ClockAndWeather } from "./ClockAndWeather";
import { Footer } from "./Footer";
import { LogOutIcon } from "./icons";

export function DashboardShell({
  navItems,
  fullName,
  role,
  logoutAction,
  children,
}: {
  navItems: { href: string; label: string }[];
  fullName: string;
  role: string;
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Mobile top bar - part of normal flow (sticky, not fixed), so it
            never overlaps page content and needs no extra padding compensation. */}
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="text-slate-600 dark:text-slate-300"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Image src="/logo-icon.png" alt="" width={28} height={28} />
          <span className="font-semibold text-slate-900 dark:text-slate-50">
            PIO Bataan - VE PMIS
          </span>
        </div>

        {open && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-slate-900/50 md:hidden"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 md:static md:z-auto md:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Link
            href="/tasks"
            onClick={() => setOpen(false)}
            className="sticky top-0 z-10 flex shrink-0 items-center border-b border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <Image src="/logo.png" alt="PIO Bataan" width={216} height={81} priority />
          </Link>
          <div className="flex-1 overflow-y-auto p-3" onClick={() => setOpen(false)}>
            <SidebarNav items={navItems} />
          </div>
          <div className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="min-w-0 truncate text-slate-500 dark:text-slate-400">
              {fullName}
              <span className="block text-xs uppercase text-slate-400 dark:text-slate-500">
                {role}
              </span>
            </p>
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Sign out"
                title="Sign out"
                className="text-slate-500 hover:text-[#0036AF] dark:text-slate-400"
              >
                <LogOutIcon className="h-4 w-4" />
              </button>
            </form>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto bg-slate-50 px-4 py-6 dark:bg-slate-950/40 md:px-6 md:py-8">
          <div className="mb-4 hidden justify-end md:flex">
            <ClockAndWeather />
          </div>
          <div className="border-2 border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-6">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
