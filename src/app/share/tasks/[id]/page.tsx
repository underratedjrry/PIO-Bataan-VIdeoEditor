import Image from "next/image";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ReadOnlyTaskDetails } from "@/components/TaskDetailContent";
import { Badge } from "@/components/Badge";
import {
  CHECK_STAGE_LABELS,
  CHECK_STATUS_BADGE_CLASSES,
  CHECK_STATUS_LABELS,
} from "@/lib/tasks/constants";
import { formatPHDateTime } from "@/lib/ph-time";
import type { OutputType, Profile, Segment, Writer } from "@/types/database";

// Public, read-only "view a task by link" page - intentionally outside the
// (dashboard) route group so it isn't behind the auth-gated layout/proxy
// redirect. Uses the service-role client (bypasses RLS) since visitors here
// have no Supabase session; the task's own unguessable UUID is what gates
// access, the same trust model as any "anyone with the link" share URL.
export default async function SharedTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

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
    supabase.from("output_types").select("*"),
    supabase.from("writers").select("*"),
    supabase.from("segments").select("*"),
    supabase
      .from("task_checks")
      .select("*")
      .eq("task_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!task) notFound();

  const profilesById = Object.fromEntries((profiles ?? []).map((p) => [p.id, p as Profile]));
  const outputTypesById = Object.fromEntries(
    (outputTypes ?? []).map((ot) => [ot.id, ot as OutputType]),
  );
  const writersById = Object.fromEntries((writers ?? []).map((w) => [w.id, w as Writer]));
  const segmentsById = Object.fromEntries((segments ?? []).map((s) => [s.id, s as Segment]));

  return (
    <div className="flex flex-1 justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950/40">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-center">
          <Image src="/logo.png" alt="PIO Bataan - VE PMIS" width={200} height={75} priority />
        </div>

        <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-400">
            Shared task - read only
          </p>
          <h1 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-50">
            {task.title}
          </h1>

          <ReadOnlyTaskDetails
            task={task}
            assignee={task.assigned_to ? profilesById[task.assigned_to] : undefined}
            outputType={task.output_type_id ? outputTypesById[task.output_type_id] : undefined}
            writer={task.writer_id ? writersById[task.writer_id] : undefined}
            segment={task.segment_id ? segmentsById[task.segment_id] : undefined}
          />

          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
              Checked By
            </h2>
            <ul className="flex flex-col gap-3 text-sm">
              {(checks ?? []).map((check) => (
                <li
                  key={check.id}
                  className="rounded-none border border-slate-200 p-3 dark:border-slate-800"
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
          </div>

          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
              Activity
            </h2>
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

        <p className="mt-4 text-center text-xs text-slate-400">
          Provincial Information Office - Bataan | VE PMIS
        </p>
      </div>
    </div>
  );
}
