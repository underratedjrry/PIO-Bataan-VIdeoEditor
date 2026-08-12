import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Task } from "@/types/database";
import type { PerformanceStats } from "@/lib/anthropic";

export async function computePerformanceStats(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<PerformanceStats> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("assigned_to", userId);

  if (error) throw new Error(error.message);

  const tasks = (data ?? []) as Task[];
  const now = Date.now();

  const completed = tasks.filter((t) => t.status === "done");
  const overdueTasks = tasks.filter(
    (t) => t.status !== "done" && t.due_date !== null && new Date(t.due_date).getTime() < now,
  ).length;

  const turnaroundHours = completed
    .map(
      (t) =>
        (new Date(t.updated_at).getTime() - new Date(t.created_at).getTime()) / 3_600_000,
    )
    .filter((hours) => hours >= 0);

  const byPriority: Record<string, number> = {};
  const bySegment: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  for (const task of tasks) {
    byPriority[task.priority] = (byPriority[task.priority] ?? 0) + 1;
    bySegment[task.segment] = (bySegment[task.segment] ?? 0) + 1;
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
