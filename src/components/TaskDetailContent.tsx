import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import { addTaskCheck, deleteTask, updateTask } from "@/lib/tasks/actions";
import { TaskForm } from "@/components/TaskForm";
import { DeleteTaskButton } from "@/components/DeleteTaskButton";
import { ShareTaskButton } from "@/components/ShareTaskButton";
import { AddTaskCheckForm } from "@/components/AddTaskCheckForm";
import { Badge } from "@/components/Badge";
import { PencilIcon } from "@/components/icons";
import { formatPHDateTime } from "@/lib/ph-time";
import {
  CHECK_STAGE_LABELS,
  CHECK_STATUS_BADGE_CLASSES,
  CHECK_STATUS_LABELS,
  LOOKUP_BADGE_CLASSES,
  PRIORITY_BADGE_CLASSES,
  PRIORITY_LABELS,
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
} from "@/lib/tasks/constants";
import type { OutputType, Profile, Segment, Task, Writer } from "@/types/database";

export async function TaskDetailContent({ id, mode }: { id: string; mode?: string }) {
  const { profile } = await getCurrentProfile();
  const supabase = await createClient();

  const [
    { data: task },
    { data: profiles },
    { data: activity },
    { data: outputTypes },
    { data: writers },
    { data: segments },
    { data: checks },
  ] = await Promise.all([
    supabase.from("tasks").select("*").eq("id", id).maybeSingle(),
    supabase.from("profiles").select("*"),
    supabase
      .from("task_activity")
      .select("*")
      .eq("task_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("output_types").select("*").order("name"),
    supabase.from("writers").select("*").order("name"),
    supabase.from("segments").select("*").order("name"),
    supabase
      .from("task_checks")
      .select("*")
      .eq("task_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!task) notFound();

  const profilesById = Object.fromEntries(
    (profiles ?? []).map((p) => [p.id, p as Profile]),
  );
  const outputTypesById = Object.fromEntries(
    (outputTypes ?? []).map((ot) => [ot.id, ot as OutputType]),
  );
  const writersById = Object.fromEntries((writers ?? []).map((w) => [w.id, w as Writer]));
  const segmentsById = Object.fromEntries((segments ?? []).map((s) => [s.id, s as Segment]));

  const canEdit =
    profile.role === "admin" ||
    (profile.role === "editor" &&
      (task.created_by === profile.id || task.assigned_to === profile.id));
  const canDelete =
    profile.role === "admin" ||
    (profile.role === "editor" && task.created_by === profile.id);
  const canCheck = profile.role === "admin" || profile.role === "editor";
  const showForm = canEdit && mode === "edit";

  const boundUpdate = updateTask.bind(null, task.id);
  const boundDelete = deleteTask.bind(null, task.id);
  const boundAddCheck = addTaskCheck.bind(null, task.id);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{task.title}</h1>
        <div className="flex items-center gap-3">
          {canEdit && !showForm && (
            <Link
              href={`/tasks/${task.id}?mode=edit`}
              aria-label="Edit task"
              title="Edit"
              className="text-slate-500 hover:text-[#1565D8] dark:text-slate-400"
            >
              <PencilIcon className="h-4 w-4" />
            </Link>
          )}
          <ShareTaskButton taskId={task.id} />
          {canDelete && <DeleteTaskButton onDelete={boundDelete} />}
        </div>
      </div>

      {showForm ? (
        <TaskForm
          task={task}
          profiles={profiles ?? []}
          outputTypes={outputTypes ?? []}
          writers={writers ?? []}
          segments={segments ?? []}
          onSubmit={boundUpdate}
          submitLabel="Save changes"
        />
      ) : (
        <ReadOnlyTaskDetails
          task={task}
          assignee={task.assigned_to ? profilesById[task.assigned_to] : undefined}
          outputType={task.output_type_id ? outputTypesById[task.output_type_id] : undefined}
          writer={task.writer_id ? writersById[task.writer_id] : undefined}
          segment={task.segment_id ? segmentsById[task.segment_id] : undefined}
        />
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
          Checked By
        </h2>
        <ul className="mb-3 flex flex-col gap-3 text-sm">
          {(checks ?? []).map((check) => (
            <li
              key={check.id}
              className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {writersById[check.checked_by_writer_id]?.name ?? "Unknown"}
                  </span>
                  <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {CHECK_STAGE_LABELS[check.stage]}
                  </Badge>
                  <Badge className={CHECK_STATUS_BADGE_CLASSES[check.status]}>
                    {CHECK_STATUS_LABELS[check.status]}
                  </Badge>
                </div>
                <span className="text-xs text-slate-400">
                  {formatPHDateTime(check.created_at)}
                </span>
              </div>
              {check.remarks && (
                <p className="mt-2 text-slate-600 dark:text-slate-400">{check.remarks}</p>
              )}
            </li>
          ))}
          {(checks ?? []).length === 0 && (
            <li className="text-slate-400">No checks logged yet.</li>
          )}
        </ul>
        {canCheck && <AddTaskCheckForm writers={writers ?? []} onAdd={boundAddCheck} />}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">Activity</h2>
        <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-1 text-sm">
          {(activity ?? []).map((entry) => (
            <li
              key={entry.id}
              className="flex justify-between gap-3 border-b border-slate-100 pb-2 text-slate-600 dark:border-slate-800 dark:text-slate-400"
            >
              <span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {profilesById[entry.actor_id]?.full_name ?? "Someone"}
                </span>{" "}
                {entry.change_summary}
              </span>
              <span className="shrink-0 text-xs text-slate-400">
                {formatPHDateTime(entry.created_at)}
              </span>
            </li>
          ))}
          {(activity ?? []).length === 0 && (
            <li className="text-slate-400">No activity yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export function ReadOnlyTaskDetails({
  task,
  assignee,
  outputType,
  writer,
  segment,
}: {
  task: Task;
  assignee?: Profile;
  outputType?: OutputType;
  writer?: Writer;
  segment?: Segment;
}) {
  return (
    <div className="flex max-w-xl flex-col gap-3 text-sm">
      {task.description && (
        <p className="text-slate-700 dark:text-slate-300">{task.description}</p>
      )}
      <div className="flex flex-wrap gap-2">
        <Badge className={PRIORITY_BADGE_CLASSES[task.priority]}>
          {PRIORITY_LABELS[task.priority]}
        </Badge>
        {segment && (
          <Badge className={LOOKUP_BADGE_CLASSES[segment.color] ?? LOOKUP_BADGE_CLASSES.slate}>
            {segment.name}
          </Badge>
        )}
        <Badge className={STATUS_BADGE_CLASSES[task.status]}>
          {STATUS_LABELS[task.status]}
        </Badge>
        {outputType && (
          <Badge className={LOOKUP_BADGE_CLASSES[outputType.color] ?? LOOKUP_BADGE_CLASSES.slate}>
            {outputType.name}
          </Badge>
        )}
      </div>
      <p className="text-slate-500 dark:text-slate-400">
        Task created: {formatPHDateTime(task.created_at)}
      </p>
      <p className="text-slate-500 dark:text-slate-400">
        Due: {task.due_date ? formatPHDateTime(task.due_date) : "No due date"}
      </p>
      <p className="text-slate-500 dark:text-slate-400">
        Assignee: {assignee?.full_name ?? "Unassigned"}
      </p>
      <p className="text-slate-500 dark:text-slate-400">Writer: {writer?.name ?? "Unassigned"}</p>
      {task.output_link && (
        <p className="text-slate-500 dark:text-slate-400">
          Output Link:{" "}
          <a
            href={task.output_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1565D8] underline"
          >
            {task.output_link}
          </a>
        </p>
      )}
    </div>
  );
}
