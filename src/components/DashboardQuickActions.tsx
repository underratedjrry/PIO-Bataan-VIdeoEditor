import Link from "next/link";
import {
  ChartBarIcon,
  ClipboardListIcon,
  CloudIcon,
  GearIcon,
  PlusIcon,
  UsersIcon,
} from "@/components/icons";
import type { Role } from "@/types/database";

const ACTIONS = [
  {
    href: "/tasks/new",
    label: "New Task",
    sublabel: "Log a new editing task",
    icon: PlusIcon,
    adminOnly: false,
  },
  {
    href: "/tasks",
    label: "Tasks",
    sublabel: "View & manage all tasks",
    icon: ClipboardListIcon,
    adminOnly: false,
  },
  {
    href: "/editors",
    label: "Video Editors",
    sublabel: "Performance dashboard",
    icon: UsersIcon,
    adminOnly: false,
  },
  {
    href: "/insights",
    label: "Insights",
    sublabel: "Your performance analysis",
    icon: ChartBarIcon,
    adminOnly: false,
  },
  {
    href: "/weather",
    label: "Weather",
    sublabel: "Live conditions & forecast",
    icon: CloudIcon,
    adminOnly: false,
  },
  {
    href: "/settings",
    label: "Settings",
    sublabel: "Manage users & lookups",
    icon: GearIcon,
    adminOnly: true,
  },
] as const;

export function DashboardQuickActions({ role }: { role: Role }) {
  const actions = ACTIONS.filter((a) => !a.adminOnly || role === "admin");

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="flex flex-col items-center gap-2 border-2 border-slate-200 bg-white px-3 py-5 text-center transition-colors hover:border-[#0036AF] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-[#4d7fff]"
        >
          <span className="flex h-11 w-11 items-center justify-center bg-[#0036AF]/10 text-[#0036AF] dark:bg-[#4d7fff]/10 dark:text-[#4d7fff]">
            <action.icon className="h-5 w-5" />
          </span>
          <span className="nav-label text-slate-900 dark:text-slate-50">{action.label}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{action.sublabel}</span>
        </Link>
      ))}
    </div>
  );
}
