import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendDueSoonDigestEmail, sendOverdueDigestEmail, type TaskWithSegmentName } from "@/lib/resend";
import type { Task } from "@/types/database";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

// Runs daily via Vercel Cron (see vercel.json). Emails a due-soon digest
// (next 3 days) and an overdue digest, deduped against notification_log so
// re-runs / redeploys don't spam the same task twice in one day.
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const dueSoonCutoff = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const [{ data: openTasks, error }, { data: segments }] = await Promise.all([
    supabase.from("tasks").select("*").neq("status", "done").not("due_date", "is", null),
    supabase.from("segments").select("*"),
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const segmentNameById = new Map((segments ?? []).map((s) => [s.id, s.name]));
  const tasks = (openTasks ?? []).map((t) => ({
    ...(t as Task),
    segmentName: (t.segment_id && segmentNameById.get(t.segment_id)) || "Unassigned",
  }));
  const dueSoon = tasks.filter(
    (t) => t.due_date! >= now.toISOString() && t.due_date! <= dueSoonCutoff.toISOString(),
  );
  const overdue = tasks.filter((t) => t.due_date! < now.toISOString());

  const candidateIds = Array.from(new Set([...dueSoon, ...overdue].map((t) => t.id)));
  const since = new Date(now.getTime() - 20 * 60 * 60 * 1000).toISOString();

  const alreadySent = new Set<string>();
  if (candidateIds.length > 0) {
    const { data: recentLogs } = await supabase
      .from("notification_log")
      .select("task_id, type")
      .in("task_id", candidateIds)
      .gte("sent_at", since);
    for (const log of recentLogs ?? []) {
      alreadySent.add(`${log.task_id}:${log.type}`);
    }
  }

  const dueSoonByRecipient = new Map<string, TaskWithSegmentName[]>();
  const overdueByRecipient = new Map<string, TaskWithSegmentName[]>();
  const toLog: { task_id: string; type: "due_soon" | "overdue" }[] = [];

  for (const task of dueSoon) {
    if (alreadySent.has(`${task.id}:due_soon`)) continue;
    const recipientId = task.assigned_to ?? task.created_by;
    if (!recipientId) continue;
    const list = dueSoonByRecipient.get(recipientId) ?? [];
    list.push(task);
    dueSoonByRecipient.set(recipientId, list);
    toLog.push({ task_id: task.id, type: "due_soon" });
  }

  for (const task of overdue) {
    if (alreadySent.has(`${task.id}:overdue`)) continue;
    const recipientId = task.assigned_to ?? task.created_by;
    if (!recipientId) continue;
    const list = overdueByRecipient.get(recipientId) ?? [];
    list.push(task);
    overdueByRecipient.set(recipientId, list);
    toLog.push({ task_id: task.id, type: "overdue" });
  }

  const recipientIds = Array.from(
    new Set([...dueSoonByRecipient.keys(), ...overdueByRecipient.keys()]),
  );

  if (recipientIds.length === 0) {
    return NextResponse.json({ dueSoon: 0, overdue: 0, tasksNotified: 0 });
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("id", recipientIds);

  const emailById = new Map((profiles ?? []).map((p) => [p.id, p.email]));

  for (const [recipientId, taskList] of dueSoonByRecipient) {
    const email = emailById.get(recipientId);
    if (email) await sendDueSoonDigestEmail(email, taskList);
  }
  for (const [recipientId, taskList] of overdueByRecipient) {
    const email = emailById.get(recipientId);
    if (email) await sendOverdueDigestEmail(email, taskList);
  }

  if (toLog.length > 0) {
    await supabase.from("notification_log").insert(toLog);
  }

  return NextResponse.json({
    dueSoon: dueSoonByRecipient.size,
    overdue: overdueByRecipient.size,
    tasksNotified: toLog.length,
  });
}
