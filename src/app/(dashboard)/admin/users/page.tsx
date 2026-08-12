import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import { RoleSelect } from "@/components/RoleSelect";

export default async function AdminUsersPage() {
  const { profile: currentProfile } = await getCurrentProfile();
  if (currentProfile.role !== "admin") redirect("/tasks");

  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Users</h1>
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {(profiles ?? []).map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">{p.full_name}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.email}</td>
                <td className="px-4 py-3">
                  <RoleSelect userId={p.id} role={p.role} disabled={p.id === currentProfile.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
