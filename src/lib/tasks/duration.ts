import type { Task } from "@/types/database";

// Prefers the explicit started_editing_at/completed_at timestamps (set when
// a task first moves to in_progress/done) over created_at/updated_at, which
// change on any edit and don't reflect actual editing duration. Falls back
// for tasks completed before those columns existed.
export function taskDurationHours(task: Task): number | null {
  const end = task.completed_at ?? (task.status === "done" ? task.updated_at : null);
  if (!end) return null;

  const start = task.started_editing_at ?? task.created_at;
  const hours = (new Date(end).getTime() - new Date(start).getTime()) / 3_600_000;
  return hours >= 0 ? hours : null;
}
