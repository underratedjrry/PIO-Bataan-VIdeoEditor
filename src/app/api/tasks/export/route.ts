import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchFilteredTasks, fetchLatestChecksByTaskId, parseTaskFilters } from "@/lib/tasks/query";
import {
  CHECK_STATUS_LABELS,
  PRIORITY_LABELS,
  SEGMENT_LABELS,
  STATUS_LABELS,
} from "@/lib/tasks/constants";
import { toCsv } from "@/lib/csv";
import type { OutputType, Profile, Writer } from "@/types/database";

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

  const [{ tasks }, { data: profiles }, { data: outputTypes }, { data: writers }] =
    await Promise.all([
      fetchFilteredTasks(supabase, filters, { paginate: false }),
      supabase.from("profiles").select("*"),
      supabase.from("output_types").select("*"),
      supabase.from("writers").select("*"),
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
  const writersById = Object.fromEntries((writers ?? []).map((w) => [w.id, w as Writer]));

  const rows = tasks.map((task) => ({
    title: task.title,
    description: task.description ?? "",
    segment: SEGMENT_LABELS[task.segment],
    output_type: task.output_type_id ? (outputTypesById[task.output_type_id]?.name ?? "") : "",
    priority: PRIORITY_LABELS[task.priority],
    status: STATUS_LABELS[task.status],
    due_date: task.due_date ? new Date(task.due_date).toISOString() : "",
    assignee: task.assigned_to ? (profilesById[task.assigned_to]?.full_name ?? "") : "",
    writer: task.writer_id ? (writersById[task.writer_id]?.name ?? "") : "",
    output_link: task.output_link ?? "",
    latest_check_status: latestCheckByTaskId[task.id]
      ? CHECK_STATUS_LABELS[latestCheckByTaskId[task.id].status]
      : "",
    created_at: new Date(task.created_at).toISOString(),
  }));

  const csv = toCsv(rows, [
    { key: "title", header: "Title" },
    { key: "description", header: "Description" },
    { key: "segment", header: "Segment" },
    { key: "output_type", header: "Output Type" },
    { key: "priority", header: "Priority" },
    { key: "status", header: "Status" },
    { key: "due_date", header: "Due Date" },
    { key: "assignee", header: "Assignee" },
    { key: "writer", header: "Writer" },
    { key: "output_link", header: "Output Link" },
    { key: "latest_check_status", header: "Latest Check Status" },
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
