import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchFilteredTasks, parseTaskFilters } from "@/lib/tasks/query";
import { PRIORITY_LABELS, SEGMENT_LABELS, STATUS_LABELS } from "@/lib/tasks/constants";
import { toCsv } from "@/lib/csv";
import type { Profile } from "@/types/database";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const filters = parseTaskFilters(searchParams);

  const [tasks, { data: profiles }] = await Promise.all([
    fetchFilteredTasks(supabase, filters),
    supabase.from("profiles").select("*"),
  ]);

  const profilesById = Object.fromEntries(
    (profiles ?? []).map((p) => [p.id, p as Profile]),
  );

  const rows = tasks.map((task) => ({
    title: task.title,
    description: task.description ?? "",
    segment: SEGMENT_LABELS[task.segment],
    priority: PRIORITY_LABELS[task.priority],
    status: STATUS_LABELS[task.status],
    due_date: task.due_date ? new Date(task.due_date).toISOString() : "",
    assignee: task.assigned_to ? (profilesById[task.assigned_to]?.full_name ?? "") : "",
    created_at: new Date(task.created_at).toISOString(),
  }));

  const csv = toCsv(rows, [
    { key: "title", header: "Title" },
    { key: "description", header: "Description" },
    { key: "segment", header: "Segment" },
    { key: "priority", header: "Priority" },
    { key: "status", header: "Status" },
    { key: "due_date", header: "Due Date" },
    { key: "assignee", header: "Assignee" },
    { key: "created_at", header: "Created At" },
  ]);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tasks-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
