import Link from "next/link";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import { fetchFilteredTasks, parseTaskFilters } from "@/lib/tasks/query";
import { TaskFilters } from "@/components/TaskFilters";
import { TaskTable } from "@/components/TaskTable";
import type { Profile } from "@/types/database";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { profile } = await getCurrentProfile();
  const filters = parseTaskFilters(await searchParams);

  const supabase = await createClient();
  const [tasks, { data: profiles }] = await Promise.all([
    fetchFilteredTasks(supabase, filters),
    supabase.from("profiles").select("*"),
  ]);

  const profilesById = Object.fromEntries(
    (profiles ?? []).map((p) => [p.id, p as Profile]),
  );
  const canCreate = profile.role !== "viewer";
  const canEditStatus = profile.role !== "viewer";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Tasks</h1>
        {canCreate && (
          <Link
            href="/tasks/new"
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
          >
            New Task
          </Link>
        )}
      </div>
      <TaskFilters />
      <TaskTable tasks={tasks} profilesById={profilesById} canEditStatus={canEditStatus} />
    </div>
  );
}
