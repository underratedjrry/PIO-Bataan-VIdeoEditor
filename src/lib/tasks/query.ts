import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Priority, Status, Task } from "@/types/database";
import { PRIORITY_ORDER } from "./constants";

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

export const PAGE_SIZE_OPTIONS = [10, 25, 100] as const;
const DEFAULT_PAGE_SIZE = 25;

export interface TaskFilters {
  priority?: string;
  segmentId?: string;
  status?: string;
  assignedTo?: string;
  outputTypeId?: string;
  sort: string;
  dir: "asc" | "desc";
  page: number;
  pageSize: number;
}

export function parseTaskFilters(searchParams: SearchParamsRecord): TaskFilters {
  const get = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const pageSizeRaw = Number(get("pageSize"));
  const pageSize = (PAGE_SIZE_OPTIONS as readonly number[]).includes(pageSizeRaw)
    ? pageSizeRaw
    : DEFAULT_PAGE_SIZE;

  const pageRaw = Number(get("page"));
  const page = Number.isInteger(pageRaw) && pageRaw >= 1 ? pageRaw : 1;

  // Default view is most-recently-created task first. If the user picks a
  // different sort field from the dropdown but doesn't also set a
  // direction, that field's own natural default (ascending) applies -
  // only the untouched default ("created_at" with no explicit dir) is
  // descending.
  const sortRaw = get("sort");
  const dirRaw = get("dir");
  const sort = sortRaw || "created_at";
  const dir = dirRaw === "desc" ? "desc" : dirRaw === "asc" ? "asc" : sortRaw ? "asc" : "desc";

  return {
    priority: get("priority") || undefined,
    segmentId: get("segmentId") || undefined,
    status: get("status") || undefined,
    assignedTo: get("assignedTo") || undefined,
    outputTypeId: get("outputTypeId") || undefined,
    sort,
    dir,
    page,
    pageSize,
  };
}

export async function fetchFilteredTasks(
  supabase: SupabaseClient<Database>,
  filters: TaskFilters,
  options: { paginate?: boolean } = {},
): Promise<{ tasks: Task[]; totalCount: number }> {
  const paginate = options.paginate ?? true;

  let query = supabase.from("tasks").select("*", { count: "exact" });

  // These come from URL search params, so they aren't guaranteed to be valid
  // enum values - an invalid value just yields zero matches at query time.
  if (filters.priority) query = query.eq("priority", filters.priority as Priority);
  if (filters.segmentId) query = query.eq("segment_id", filters.segmentId);
  if (filters.status) query = query.eq("status", filters.status as Status);
  if (filters.assignedTo) query = query.eq("assigned_to", filters.assignedTo);
  if (filters.outputTypeId) query = query.eq("output_type_id", filters.outputTypeId);

  // priority is a text enum (not alphabetically meaningful), so it's sorted
  // client-side below - can't paginate at the DB level for that case since
  // the DB's own ordering wouldn't match.
  const sortsInDb = filters.sort !== "priority";
  if (sortsInDb) {
    query = query.order(filters.sort, {
      ascending: filters.dir !== "desc",
      nullsFirst: false,
    });
    if (paginate) {
      const from = (filters.page - 1) * filters.pageSize;
      query = query.range(from, from + filters.pageSize - 1);
    }
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  let tasks = data ?? [];
  let totalCount = count ?? tasks.length;

  if (filters.sort === "priority") {
    tasks = [...tasks].sort((a, b) => {
      const diff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      return filters.dir === "desc" ? -diff : diff;
    });
    totalCount = tasks.length;
    if (paginate) {
      const from = (filters.page - 1) * filters.pageSize;
      tasks = tasks.slice(from, from + filters.pageSize);
    }
  }

  return { tasks, totalCount };
}

// Returns a map of taskId -> most recent task_checks row, for quick "latest
// review status" display in the task list.
export async function fetchLatestChecksByTaskId(
  supabase: SupabaseClient<Database>,
  taskIds: string[],
) {
  if (taskIds.length === 0) return {};

  const { data, error } = await supabase
    .from("task_checks")
    .select("*")
    .in("task_id", taskIds)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const latestByTaskId: Record<string, NonNullable<typeof data>[number]> = {};
  for (const check of data ?? []) {
    if (!latestByTaskId[check.task_id]) {
      latestByTaskId[check.task_id] = check;
    }
  }
  return latestByTaskId;
}
