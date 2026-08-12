import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import { SettingsTabs } from "@/components/settings/SettingsTabs";

export default async function SettingsPage() {
  const { user, profile } = await getCurrentProfile();
  if (profile.role !== "admin") redirect("/tasks");

  const supabase = await createClient();
  const [{ data: profiles }, { data: outputTypes }, { data: writers }, { data: segments }] =
    await Promise.all([
      supabase.from("profiles").select("*").order("full_name"),
      supabase.from("output_types").select("*").order("name"),
      supabase.from("writers").select("*").order("name"),
      supabase.from("segments").select("*").order("name"),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Settings</h1>
      <SettingsTabs
        profiles={profiles ?? []}
        outputTypes={outputTypes ?? []}
        writers={writers ?? []}
        segments={segments ?? []}
        currentUserId={user.id}
      />
    </div>
  );
}
