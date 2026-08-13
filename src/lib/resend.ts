import { Resend } from "resend";
import type { Task } from "@/types/database";
import { PRIORITY_LABELS } from "@/lib/tasks/constants";
import { PH_TIME_ZONE } from "@/lib/ph-time";

export type TaskWithSegmentName = Task & { segmentName: string };

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.RESEND_FROM_EMAIL ?? "PMIS <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn(`[resend] RESEND_API_KEY not set - skipped "${subject}" to ${to}`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("[resend] send failed", err);
  }
}

function taskLink(taskId: string) {
  return `${APP_URL}/tasks/${taskId}`;
}

function formatDue(task: Task) {
  return task.due_date
    ? new Date(task.due_date).toLocaleString("en-PH", {
        timeZone: PH_TIME_ZONE,
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "No due date";
}

function layout(title: string, bodyHtml: string) {
  return `<div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;color:#18181b;">
    <h2 style="margin-bottom:8px;">${title}</h2>
    ${bodyHtml}
    <p style="margin-top:24px;font-size:12px;color:#71717a;">Video Editing PMIS</p>
  </div>`;
}

function taskMetaRow(task: TaskWithSegmentName) {
  return `<p style="margin:4px 0;color:#3f3f46;">
    Segment: ${task.segmentName}<br/>
    Priority: ${PRIORITY_LABELS[task.priority]}<br/>
    Due: ${formatDue(task)}
  </p>`;
}

export async function sendTaskAssignedEmail(to: string, task: TaskWithSegmentName) {
  await send(
    to,
    `Assigned: ${task.title}`,
    layout(
      "You've been assigned a task",
      `<p style="font-weight:600;">${task.title}</p>
       ${taskMetaRow(task)}
       <p><a href="${taskLink(task.id)}">View task</a></p>`,
    ),
  );
}

export async function sendTaskUpdatedEmail(
  to: string,
  task: Task,
  changeSummary: string,
) {
  await send(
    to,
    `Updated: ${task.title}`,
    layout(
      "A task you're involved in was updated",
      `<p style="font-weight:600;">${task.title}</p>
       <p style="color:#3f3f46;">${changeSummary}</p>
       <p><a href="${taskLink(task.id)}">View task</a></p>`,
    ),
  );
}

function taskListRows(tasks: TaskWithSegmentName[]) {
  return tasks
    .map(
      (task) => `<li style="margin-bottom:10px;">
        <a href="${taskLink(task.id)}" style="font-weight:600;">${task.title}</a><br/>
        <span style="color:#71717a;font-size:13px;">
          ${task.segmentName} - ${PRIORITY_LABELS[task.priority]} - due ${formatDue(task)}
        </span>
      </li>`,
    )
    .join("");
}

export async function sendDueSoonDigestEmail(to: string, tasks: TaskWithSegmentName[]) {
  if (tasks.length === 0) return;
  await send(
    to,
    `${tasks.length} task${tasks.length > 1 ? "s" : ""} due soon`,
    layout(
      "Upcoming due dates",
      `<ul style="padding-left:18px;">${taskListRows(tasks)}</ul>`,
    ),
  );
}

export async function sendOverdueDigestEmail(to: string, tasks: TaskWithSegmentName[]) {
  if (tasks.length === 0) return;
  await send(
    to,
    `${tasks.length} overdue task${tasks.length > 1 ? "s" : ""}`,
    layout(
      "Overdue tasks need attention",
      `<ul style="padding-left:18px;">${taskListRows(tasks)}</ul>`,
    ),
  );
}
