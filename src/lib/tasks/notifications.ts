import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Task } from "@/types/database";

export type DueTaskSummary = Pick<Task, "id" | "title" | "due_date">;

// Tasks with a due date the signed-in user should keep an eye on - either
// overdue, or due within the next 3 days. Same "assigned, falling back to
// creator" recipient logic as the email digest cron, but computed live for
// the header notification bell instead of sent by email.
export async function getUserDueTasks(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ overdue: DueTaskSummary[]; dueSoon: DueTaskSummary[] }> {
  const now = new Date();
  const dueSoonCutoff = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  // "*" (not a narrow column select) - matches this codebase's convention of
  // always selecting full rows, since the hand-rolled Database type doesn't
  // model per-select-string column narrowing.
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .neq("status", "done")
    .not("due_date", "is", null)
    .or(`assigned_to.eq.${userId},and(assigned_to.is.null,created_by.eq.${userId})`)
    .order("due_date", { ascending: true });

  const tasks = (data ?? []) as Task[];
  const overdue = tasks.filter((t) => t.due_date! < now.toISOString());
  const dueSoon = tasks.filter(
    (t) => t.due_date! >= now.toISOString() && t.due_date! <= dueSoonCutoff.toISOString(),
  );

  return { overdue, dueSoon };
}
