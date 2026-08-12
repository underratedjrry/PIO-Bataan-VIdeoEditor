import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Task } from "@/types/database";
import { taskDurationHours } from "./duration";
import type { PerformanceStats } from "./narrative";

export async function computePerformanceStats(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<PerformanceStats> {
  const [{ data, error }, { data: segments }] = await Promise.all([
    supabase.from("tasks").select("*").eq("assigned_to", userId),
    supabase.from("segments").select("*"),
  ]);

  if (error) throw new Error(error.message);

  const tasks = (data ?? []) as Task[];
  const segmentNameById = new Map((segments ?? []).map((s) => [s.id, s.name]));
  const now = Date.now();

  const completed = tasks.filter((t) => t.status === "done");
  const overdueTasks = tasks.filter(
    (t) => t.status !== "done" && t.due_date !== null && new Date(t.due_date).getTime() < now,
  ).length;

  const turnaroundHours = completed
    .map(taskDurationHours)
    .filter((hours): hours is number => hours !== null);

  const byPriority: Record<string, number> = {};
  const bySegment: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  for (const task of tasks) {
    const segmentName =
      (task.segment_id && segmentNameById.get(task.segment_id)) || "Unassigned";
    byPriority[task.priority] = (byPriority[task.priority] ?? 0) + 1;
    bySegment[segmentName] = (bySegment[segmentName] ?? 0) + 1;
    byStatus[task.status] = (byStatus[task.status] ?? 0) + 1;
  }

  return {
    totalTasks: tasks.length,
    completedTasks: completed.length,
    overdueTasks,
    completionRate: tasks.length > 0 ? completed.length / tasks.length : 0,
    avgTurnaroundHours:
      turnaroundHours.length > 0
        ? turnaroundHours.reduce((a, b) => a + b, 0) / turnaroundHours.length
        : null,
    byPriority,
    bySegment,
    byStatus,
  };
}
