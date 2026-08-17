import { Suspense } from "react";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import { getUserDueTasks } from "@/lib/tasks/notifications";
import { logout } from "../(auth)/actions";
import { DashboardShell } from "@/components/DashboardShell";
import { ToastFromSearchParams } from "@/components/ToastFromSearchParams";

export default async function DashboardLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const { user, profile } = await getCurrentProfile();
  const supabase = await createClient();
  const { overdue, dueSoon } = await getUserDueTasks(supabase, user.id);

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/insights", label: "Insights" },
    { href: "/tasks", label: "Tasks" },
    { href: "/editors", label: "Video Editors" },
    { href: "/ai-assist", label: "AI Assist" },
    {
      href: "https://docs.google.com/spreadsheets/d/1x8Nl6RkVMr2YJPL3G0O_4IUrfn8hYJYbZoDNZhLguD4/edit?usp=sharing",
      label: "PIO Accomplishments 2026",
      external: true,
    },
    ...(profile.role === "admin" ? [{ href: "/settings", label: "Settings" }] : []),
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white dark:bg-slate-900">
      <div className="brand-accent-strip hidden md:block" />
      <DashboardShell
        navItems={navItems}
        fullName={profile.full_name}
        role={profile.role}
        logoutAction={logout}
        overdue={overdue}
        dueSoon={dueSoon}
      >
        {children}
      </DashboardShell>
      {modal}
      <Suspense fallback={null}>
        <ToastFromSearchParams />
      </Suspense>
    </div>
  );
}
