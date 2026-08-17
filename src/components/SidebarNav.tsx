"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LinkIcon } from "./icons";

export function SidebarNav({
  items,
}: {
  items: { href: string; label: string; external?: boolean }[];
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = !item.external && (pathname === item.href || pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener noreferrer" : undefined}
            className={`nav-label flex items-center justify-between border-l-4 px-3 py-2.5 ${
              active
                ? "border-[#E10017] bg-[#0036AF]/10 text-[#0036AF]"
                : "border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            }`}
          >
            {item.label}
            {item.external && <LinkIcon className="h-3.5 w-3.5 shrink-0 opacity-60" />}
          </Link>
        );
      })}
    </nav>
  );
}
