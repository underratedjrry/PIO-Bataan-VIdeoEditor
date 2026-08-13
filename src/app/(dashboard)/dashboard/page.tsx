import { createClient } from "@/lib/supabase/server";
import { DeliverablesCalendar, type DayTask } from "@/components/DeliverablesCalendar";

function parseMonthParam(param?: string) {
  if (param && /^\d{4}-\d{2}$/.test(param)) {
    const [year, month] = param.split("-").map(Number);
    return { year, month: month - 1 };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const { year, month } = parseMonthParam(monthParam);

  // Query a day of buffer on each side of the month so tasks near the
  // month boundary aren't dropped by timezone differences between the DB's
  // UTC timestamp and the viewer's local calendar day (grouped below).
  const rangeStart = new Date(year, month, 1);
  rangeStart.setDate(rangeStart.getDate() - 1);
  const rangeEnd = new Date(year, month + 1, 1);
  rangeEnd.setDate(rangeEnd.getDate() + 1);

  const supabase = await createClient();
  const [{ data: tasks }, { data: profiles }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .not("due_date", "is", null)
      .gte("due_date", rangeStart.toISOString())
      .lt("due_date", rangeEnd.toISOString())
      .order("due_date", { ascending: true }),
    supabase.from("profiles").select("*"),
  ]);

  const profilesById = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  const tasksByDay: Record<number, DayTask[]> = {};
  for (const task of tasks ?? []) {
    if (!task.due_date) continue;
    const due = new Date(task.due_date);
    if (due.getFullYear() !== year || due.getMonth() !== month) continue;
    const day = due.getDate();
    (tasksByDay[day] ??= []).push({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      assigneeName: task.assigned_to ? (profilesById[task.assigned_to]?.full_name ?? null) : null,
      dueDate: task.due_date,
    });
  }

  return <DeliverablesCalendar year={year} month={month} tasksByDay={tasksByDay} />;
}
