import Image from "next/image";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { logout } from "../(auth)/actions";
import { SidebarNav } from "@/components/SidebarNav";

export default async function DashboardLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const { profile } = await getCurrentProfile();

  const navItems = [
    { href: "/insights", label: "Insights" },
    { href: "/tasks", label: "Tasks" },
    ...(profile.role === "admin" ? [{ href: "/settings", label: "Settings" }] : []),
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white dark:bg-slate-900">
      <div className="brand-accent-strip" />
      <div className="flex flex-1">
        <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 dark:border-slate-800">
          <Link
            href="/tasks"
            className="flex items-center border-b border-slate-200 px-4 py-4 dark:border-slate-800"
          >
            <Image src="/logo.png" alt="PIO Bataan" width={168} height={63} priority />
          </Link>
          <div className="flex-1 overflow-y-auto p-3">
            <SidebarNav items={navItems} />
          </div>
          <div className="border-t border-slate-200 p-3 text-sm dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400">
              {profile.full_name}
              <span className="block text-xs uppercase text-slate-400 dark:text-slate-500">
                {profile.role}
              </span>
            </p>
            <form action={logout} className="mt-2">
              <button
                type="submit"
                className="text-xs font-medium text-slate-600 underline hover:text-[#1565D8] dark:text-slate-400"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>
        <main className="min-w-0 flex-1 overflow-y-auto px-6 py-8">{children}</main>
      </div>
      {modal}
    </div>
  );
}
