import { Suspense } from "react";
import { getCurrentProfile } from "@/lib/supabase/profile";
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
  const { profile } = await getCurrentProfile();

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/insights", label: "Insights" },
    { href: "/tasks", label: "Tasks" },
    { href: "/editors", label: "Video Editors" },
    { href: "/ai-assist", label: "AI Assist" },
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
