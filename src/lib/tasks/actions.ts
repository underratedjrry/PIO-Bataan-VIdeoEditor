"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendTaskAssignedEmail, sendTaskUpdatedEmail } from "@/lib/resend";
import type { Status, Task } from "@/types/database";
import { PRIORITY_LABELS, STATUS_LABELS } from "./constants";
import { taskFormSchema } from "./schema";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

function parseTaskForm(formData: FormData) {
  return taskFormSchema.parse({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    segment: String(formData.get("segment") ?? "other"),
    priority: String(formData.get("priority") ?? "medium"),
    status: String(formData.get("status") ?? "todo"),
    due_date: String(formData.get("due_date") ?? ""),
    assigned_to: String(formData.get("assigned_to") ?? ""),
  });
}

export async function createTask(formData: FormData) {
  const { supabase, user } = await requireUser();
  const values = parseTaskForm(formData);

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      title: values.title,
      description: values.description || null,
      segment: values.segment,
      priority: values.priority,
      status: values.status,
      due_date: values.due_date ? new Date(values.due_date).toISOString() : null,
      assigned_to: values.assigned_to || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error || !task) {
    throw new Error(error?.message ?? "Failed to create task");
  }

  await supabase.from("task_activity").insert({
    task_id: task.id,
    actor_id: user.id,
    change_summary: "Task created",
  });

  if (task.assigned_to && task.assigned_to !== user.id) {
    const { data: assignee } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", task.assigned_to)
      .single();
    if (assignee?.email) {
      await sendTaskAssignedEmail(assignee.email, task as Task);
    }
  }

  revalidatePath("/tasks");
  redirect(`/tasks/${task.id}`);
}

export async function updateTask(taskId: string, formData: FormData) {
  const { supabase, user } = await requireUser();
  const values = parseTaskForm(formData);

  const { data: existing } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (!existing) throw new Error("Task not found");

  const { data: updated, error } = await supabase
    .from("tasks")
    .update({
      title: values.title,
      description: values.description || null,
      segment: values.segment,
      priority: values.priority,
      status: values.status,
      due_date: values.due_date ? new Date(values.due_date).toISOString() : null,
      assigned_to: values.assigned_to || null,
    })
    .eq("id", taskId)
    .select()
    .single();

  if (error || !updated) {
    throw new Error(error?.message ?? "Failed to update task");
  }

  const changes: string[] = [];
  if (existing.title !== updated.title) changes.push("title changed");
  if (existing.status !== updated.status) {
    changes.push(`status: ${STATUS_LABELS[existing.status]} -> ${STATUS_LABELS[updated.status]}`);
  }
  if (existing.priority !== updated.priority) {
    changes.push(`priority: ${PRIORITY_LABELS[existing.priority]} -> ${PRIORITY_LABELS[updated.priority]}`);
  }
  if (existing.due_date !== updated.due_date) changes.push("due date changed");
  if (existing.assigned_to !== updated.assigned_to) changes.push("reassigned");
  const summary = changes.length > 0 ? changes.join("; ") : "Task details updated";

  await supabase.from("task_activity").insert({
    task_id: taskId,
    actor_id: user.id,
    change_summary: summary,
  });

  const notifyIds = new Set<string>();
  if (updated.assigned_to && updated.assigned_to !== user.id) notifyIds.add(updated.assigned_to);
  if (updated.created_by !== user.id) notifyIds.add(updated.created_by);

  if (existing.assigned_to !== updated.assigned_to && updated.assigned_to) {
    const { data: assignee } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", updated.assigned_to)
      .single();
    if (assignee?.email) await sendTaskAssignedEmail(assignee.email, updated as Task);
    notifyIds.delete(updated.assigned_to);
  }

  if (notifyIds.size > 0) {
    const { data: recipients } = await supabase
      .from("profiles")
      .select("email")
      .in("id", Array.from(notifyIds));
    for (const recipient of recipients ?? []) {
      await sendTaskUpdatedEmail(recipient.email, updated as Task, summary);
    }
  }

  revalidatePath("/tasks");
  revalidatePath(`/tasks/${taskId}`);
  redirect(`/tasks/${taskId}`);
}

export async function deleteTask(taskId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw new Error(error.message);
  revalidatePath("/tasks");
  redirect("/tasks");
}

export async function setTaskStatus(taskId: string, status: Status) {
  const { supabase, user } = await requireUser();
  const { data: existing } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();
  if (!existing) throw new Error("Task not found");

  const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId);
  if (error) throw new Error(error.message);

  await supabase.from("task_activity").insert({
    task_id: taskId,
    actor_id: user.id,
    change_summary: `status: ${STATUS_LABELS[existing.status]} -> ${STATUS_LABELS[status]}`,
  });

  revalidatePath("/tasks");
  revalidatePath(`/tasks/${taskId}`);
}
