import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import { deleteTask, updateTask } from "@/lib/tasks/actions";
import { TaskForm } from "@/components/TaskForm";
import { DeleteTaskButton } from "@/components/DeleteTaskButton";
import { Badge } from "@/components/Badge";
import {
  PRIORITY_BADGE_CLASSES,
  PRIORITY_LABELS,
  SEGMENT_LABELS,
  STATUS_LABELS,
} from "@/lib/tasks/constants";
import type { Profile, Task } from "@/types/database";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await getCurrentProfile();
  const supabase = await createClient();

  const [{ data: task }, { data: profiles }, { data: activity }] = await Promise.all([
    supabase.from("tasks").select("*").eq("id", id).maybeSingle(),
    supabase.from("profiles").select("*"),
    supabase
      .from("task_activity")
      .select("*")
      .eq("task_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!task) notFound();

  const profilesById = Object.fromEntries(
    (profiles ?? []).map((p) => [p.id, p as Profile]),
  );

  const canEdit =
    profile.role === "admin" ||
    (profile.role === "editor" &&
      (task.created_by === profile.id || task.assigned_to === profile.id));
  const canDelete =
    profile.role === "admin" ||
    (profile.role === "editor" && task.created_by === profile.id);

  const boundUpdate = updateTask.bind(null, task.id);
  const boundDelete = deleteTask.bind(null, task.id);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{task.title}</h1>
        {canDelete && <DeleteTaskButton onDelete={boundDelete} />}
      </div>

      {canEdit ? (
        <TaskForm
          task={task}
          profiles={profiles ?? []}
          onSubmit={boundUpdate}
          submitLabel="Save changes"
        />
      ) : (
        <ReadOnlyTaskDetails
          task={task}
          assignee={task.assigned_to ? profilesById[task.assigned_to] : undefined}
        />
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Activity</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {(activity ?? []).map((entry) => (
            <li
              key={entry.id}
              className="flex justify-between border-b border-zinc-100 pb-2 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
            >
              <span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {profilesById[entry.actor_id]?.full_name ?? "Someone"}
                </span>{" "}
                {entry.change_summary}
              </span>
              <span className="text-xs text-zinc-400">
                {new Date(entry.created_at).toLocaleString()}
              </span>
            </li>
          ))}
          {(activity ?? []).length === 0 && (
            <li className="text-zinc-400">No activity yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function ReadOnlyTaskDetails({ task, assignee }: { task: Task; assignee?: Profile }) {
  return (
    <div className="flex max-w-xl flex-col gap-3 text-sm">
      {task.description && (
        <p className="text-zinc-700 dark:text-zinc-300">{task.description}</p>
      )}
      <div className="flex flex-wrap gap-2">
        <Badge className={PRIORITY_BADGE_CLASSES[task.priority]}>
          {PRIORITY_LABELS[task.priority]}
        </Badge>
        <Badge className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {SEGMENT_LABELS[task.segment]}
        </Badge>
        <Badge className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {STATUS_LABELS[task.status]}
        </Badge>
      </div>
      <p className="text-zinc-500 dark:text-zinc-400">
        Due: {task.due_date ? new Date(task.due_date).toLocaleString() : "No due date"}
      </p>
      <p className="text-zinc-500 dark:text-zinc-400">
        Assignee: {assignee?.full_name ?? "Unassigned"}
      </p>
    </div>
  );
}
