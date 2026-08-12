import Link from "next/link";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { logout } from "../(auth)/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getCurrentProfile();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/tasks" className="font-semibold text-zinc-900 dark:text-zinc-50">
              Video Editing PMIS
            </Link>
            <nav className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
              <Link href="/tasks" className="hover:text-zinc-900 dark:hover:text-zinc-50">
                Tasks
              </Link>
              <Link href="/insights" className="hover:text-zinc-900 dark:hover:text-zinc-50">
                Insights
              </Link>
              {profile.role === "admin" && (
                <Link
                  href="/admin/users"
                  className="hover:text-zinc-900 dark:hover:text-zinc-50"
                >
                  Users
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">
              {profile.full_name}{" "}
              <span className="text-xs uppercase text-zinc-400 dark:text-zinc-500">
                ({profile.role})
              </span>
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
