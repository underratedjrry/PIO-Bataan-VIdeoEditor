import Link from "next/link";
import type { Profile, Task } from "@/types/database";
import {
  PRIORITY_BADGE_CLASSES,
  PRIORITY_LABELS,
  SEGMENT_LABELS,
} from "@/lib/tasks/constants";
import { Badge } from "./Badge";
import { StatusSelect } from "./StatusSelect";

export function TaskTable({
  tasks,
  profilesById,
  canEditStatus,
}: {
  tasks: Task[];
  profilesById: Record<string, Profile>;
  canEditStatus: boolean;
}) {
  if (tasks.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
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
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Segment</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Due</th>
            <th className="px-4 py-3">Assignee</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {tasks.map((task) => {
            const overdue =
              !!task.due_date &&
              new Date(task.due_date).getTime() < now &&
              task.status !== "done";

            return (
              <tr key={task.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                <td className="px-4 py-3">
                  <Link
                    href={`/tasks/${task.id}`}
                    className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                  >
                    {task.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {SEGMENT_LABELS[task.segment]}
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
                      : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {task.due_date ? new Date(task.due_date).toLocaleDateString() : "-"}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {task.assigned_to
                    ? (profilesById[task.assigned_to]?.full_name ?? "Unknown")
                    : "Unassigned"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
