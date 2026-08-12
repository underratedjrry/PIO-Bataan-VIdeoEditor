import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Priority, Segment, Status } from "@/types/database";
import { PRIORITY_ORDER } from "./constants";

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

export interface TaskFilters {
  priority?: string;
  segment?: string;
  status?: string;
  assignedTo?: string;
  sort: string;
  dir: "asc" | "desc";
}

export function parseTaskFilters(searchParams: SearchParamsRecord): TaskFilters {
  const get = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  return {
    priority: get("priority") || undefined,
    segment: get("segment") || undefined,
    status: get("status") || undefined,
    assignedTo: get("assignedTo") || undefined,
    sort: get("sort") || "due_date",
    dir: get("dir") === "desc" ? "desc" : "asc",
  };
}

export function filtersToSearchParams(filters: TaskFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.segment) params.set("segment", filters.segment);
  if (filters.status) params.set("status", filters.status);
  if (filters.assignedTo) params.set("assignedTo", filters.assignedTo);
  params.set("sort", filters.sort);
  params.set("dir", filters.dir);
  return params;
}

export async function fetchFilteredTasks(
  supabase: SupabaseClient<Database>,
  filters: TaskFilters,
) {
  let query = supabase.from("tasks").select("*");

  // These come from URL search params, so they aren't guaranteed to be valid
  // enum values - an invalid value just yields zero matches at query time.
  if (filters.priority) query = query.eq("priority", filters.priority as Priority);
  if (filters.segment) query = query.eq("segment", filters.segment as Segment);
  if (filters.status) query = query.eq("status", filters.status as Status);
  if (filters.assignedTo) query = query.eq("assigned_to", filters.assignedTo);

  // priority is a text enum (not alphabetically meaningful), so sort it client-side.
  if (filters.sort !== "priority") {
    query = query.order(filters.sort, {
      ascending: filters.dir !== "desc",
      nullsFirst: false,
    });
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let tasks = data ?? [];
  if (filters.sort === "priority") {
    tasks = [...tasks].sort((a, b) => {
      const diff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      return filters.dir === "desc" ? -diff : diff;
    });
  }

  return tasks;
}
