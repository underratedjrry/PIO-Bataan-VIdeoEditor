import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Task } from "@/types/database";
import { taskDurationHours } from "./duration";

export type EditorStats = {
  totalTasks: number;
  completed: number;
  ongoing: number;
  upcoming: number;
  avgCompletionHours: number | null;
};

const EMPTY_STATS: EditorStats = {
  totalTasks: 0,
  completed: 0,
  ongoing: 0,
  upcoming: 0,
  avgCompletionHours: null,
};

// Buckets: completed = done; ongoing = in_progress/in_review/blocked
// (actively being worked, even if currently stuck); upcoming = todo.
export async function computeAllEditorStats(
  supabase: SupabaseClient<Database>,
): Promise<Record<string, EditorStats>> {
  const { data, error } = await supabase.from("tasks").select("*");
  if (error) throw new Error(error.message);

  const tasks = (data ?? []) as Task[];
  const byUser: Record<string, EditorStats> = {};
  const durationsByUser: Record<string, number[]> = {};

  for (const task of tasks) {
    if (!task.assigned_to) continue;
    const stats = byUser[task.assigned_to] ?? { ...EMPTY_STATS };
    stats.totalTasks += 1;

    if (task.status === "done") {
      stats.completed += 1;
      const hours = taskDurationHours(task);
      if (hours !== null) {
        (durationsByUser[task.assigned_to] ??= []).push(hours);
      }
    } else if (task.status === "todo") {
      stats.upcoming += 1;
    } else {
      // in_progress, in_review, blocked
      stats.ongoing += 1;
    }

    byUser[task.assigned_to] = stats;
  }

  for (const [userId, hoursList] of Object.entries(durationsByUser)) {
    byUser[userId].avgCompletionHours =
      hoursList.reduce((a, b) => a + b, 0) / hoursList.length;
  }

  return byUser;
}
