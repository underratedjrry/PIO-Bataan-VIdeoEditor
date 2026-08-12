import Link from "next/link";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import { fetchFilteredTasks, fetchLatestChecksByTaskId, parseTaskFilters } from "@/lib/tasks/query";
import { TaskFilters } from "@/components/TaskFilters";
import { TaskTable } from "@/components/TaskTable";
import { Pagination } from "@/components/Pagination";
import { PlusIcon } from "@/components/icons";
import type { OutputType, Profile, Segment } from "@/types/database";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { profile } = await getCurrentProfile();
  const filters = parseTaskFilters(await searchParams);

  const supabase = await createClient();
  const [{ tasks, totalCount }, { data: profiles }, { data: outputTypes }, { data: segments }] =
    await Promise.all([
      fetchFilteredTasks(supabase, filters),
      supabase.from("profiles").select("*"),
      supabase.from("output_types").select("*").order("name"),
      supabase.from("segments").select("*").order("name"),
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
  const segmentsById = Object.fromEntries(
    (segments ?? []).map((s) => [s.id, s as Segment]),
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
            aria-label="New task"
            title="New task"
            className="flex h-9 w-9 items-center justify-center rounded-md bg-[#1565D8] text-white hover:bg-[#0F52B5]"
          >
            <PlusIcon className="h-4 w-4" />
          </Link>
        )}
      </div>
      <TaskFilters outputTypes={outputTypes ?? []} segments={segments ?? []} />
      <TaskTable
        tasks={tasks}
        profilesById={profilesById}
        outputTypesById={outputTypesById}
        segmentsById={segmentsById}
        latestCheckByTaskId={latestCheckByTaskId}
        currentUser={{ id: profile.id, role: profile.role }}
        canEditStatus={canEditStatus}
      />
      <Pagination page={filters.page} pageSize={filters.pageSize} totalCount={totalCount} />
    </div>
  );
}
