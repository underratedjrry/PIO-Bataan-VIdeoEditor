import Link from "next/link";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import { fetchFilteredTasks, fetchLatestChecksByTaskId, parseTaskFilters } from "@/lib/tasks/query";
import { TaskFilters } from "@/components/TaskFilters";
import { TaskTable } from "@/components/TaskTable";
import { Pagination } from "@/components/Pagination";
import type { OutputType, Profile } from "@/types/database";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { profile } = await getCurrentProfile();
  const filters = parseTaskFilters(await searchParams);

  const supabase = await createClient();
  const [{ tasks, totalCount }, { data: profiles }, { data: outputTypes }] = await Promise.all([
    fetchFilteredTasks(supabase, filters),
    supabase.from("profiles").select("*"),
    supabase.from("output_types").select("*").order("name"),
  ]);
  const latestCheckByTaskId = await fetchLatestChecksByTaskId(
    supabase,
    tasks.map((t) => t.id),
  );

  const profilesById = Object.fromEntries(
    (profiles ?? []).map((p) => [p.id, p as Profile]),
  );
  const outputTypesById = Object.fromEntries(
    (outputTypes ?? []).map((ot) => [ot.id, ot as OutputType]),
  );
  const canCreate = profile.role !== "viewer";
  const canEditStatus = profile.role !== "viewer";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Tasks</h1>
        {canCreate && (
          <Link
            href="/tasks/new"
            className="rounded-md bg-[#1565D8] px-3 py-2 text-sm font-medium text-white hover:bg-[#0F52B5]"
          >
            New Task
          </Link>
        )}
      </div>
      <TaskFilters outputTypes={outputTypes ?? []} />
      <TaskTable
        tasks={tasks}
        profilesById={profilesById}
        outputTypesById={outputTypesById}
        latestCheckByTaskId={latestCheckByTaskId}
        canEditStatus={canEditStatus}
      />
      <Pagination page={filters.page} pageSize={filters.pageSize} totalCount={totalCount} />
    </div>
  );
}
