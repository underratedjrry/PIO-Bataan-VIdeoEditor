import Link from "next/link";
import type { OutputType, Profile, Task, TaskCheck } from "@/types/database";
import {
  CHECK_STATUS_BADGE_CLASSES,
  CHECK_STATUS_LABELS,
  PRIORITY_BADGE_CLASSES,
  PRIORITY_LABELS,
  SEGMENT_LABELS,
} from "@/lib/tasks/constants";
import { Badge } from "./Badge";
import { StatusSelect } from "./StatusSelect";

export function TaskTable({
  tasks,
  profilesById,
  outputTypesById,
  latestCheckByTaskId,
  canEditStatus,
}: {
  tasks: Task[];
  profilesById: Record<string, Profile>;
  outputTypesById: Record<string, OutputType>;
  latestCheckByTaskId: Record<string, TaskCheck>;
  canEditStatus: boolean;
}) {
  if (tasks.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
        No tasks match these filters.
      </p>
    );
  }

  // Server Component rendered fresh per request (the route is already
  // dynamic due to auth) - this is a one-time "as of now" snapshot for the
  // overdue-row highlight, not state a compiler would need to memoize.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
      <table className="w-full min-w-[880px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Segment</th>
            <th className="px-4 py-3">Output Type</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Due</th>
            <th className="px-4 py-3">Assignee</th>
            <th className="px-4 py-3">Latest Check</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {tasks.map((task) => {
            const overdue =
              !!task.due_date &&
              new Date(task.due_date).getTime() < now &&
              task.status !== "done";
            const latestCheck = latestCheckByTaskId[task.id];

            return (
              <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                <td className="px-4 py-3">
                  <Link
                    href={`/tasks/${task.id}`}
                    className="font-medium text-slate-900 hover:underline dark:text-slate-50"
                  >
                    {task.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {SEGMENT_LABELS[task.segment]}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {task.output_type_id
                    ? (outputTypesById[task.output_type_id]?.name ?? "-")
                    : "-"}
                </td>
                <td className="px-4 py-3">
                  <Badge className={PRIORITY_BADGE_CLASSES[task.priority]}>
                    {PRIORITY_LABELS[task.priority]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <StatusSelect taskId={task.id} status={task.status} disabled={!canEditStatus} />
                </td>
                <td
                  className={`px-4 py-3 ${
                    overdue
                      ? "font-medium text-red-600 dark:text-red-400"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {task.due_date ? new Date(task.due_date).toLocaleDateString() : "-"}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {task.assigned_to
                    ? (profilesById[task.assigned_to]?.full_name ?? "Unknown")
                    : "Unassigned"}
                </td>
                <td className="px-4 py-3">
                  {latestCheck ? (
                    <Badge className={CHECK_STATUS_BADGE_CLASSES[latestCheck.status]}>
                      {CHECK_STATUS_LABELS[latestCheck.status]}
                    </Badge>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
