import Link from "next/link";
import type { OutputType, Profile, Role, Segment, Task, TaskCheck } from "@/types/database";
import { CHECK_STATUS_BADGE_CLASSES, CHECK_STATUS_LABELS, LOOKUP_BADGE_CLASSES } from "@/lib/tasks/constants";
import { deleteTask } from "@/lib/tasks/actions";
import { Badge } from "./Badge";
import { StatusSelect } from "./StatusSelect";
import { DeleteTaskButton } from "./DeleteTaskButton";
import { EyeIcon, PencilIcon } from "./icons";

export function TaskTable({
  tasks,
  profilesById,
  outputTypesById,
  segmentsById,
  latestCheckByTaskId,
  currentUser,
  canEditStatus,
}: {
  tasks: Task[];
  profilesById: Record<string, Profile>;
  outputTypesById: Record<string, OutputType>;
  segmentsById: Record<string, Segment>;
  latestCheckByTaskId: Record<string, TaskCheck>;
  currentUser: { id: string; role: Role };
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
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          <tr>
            <th className="px-4 py-3">Output Type</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Segment</th>
            <th className="px-4 py-3">Due</th>
            <th className="px-4 py-3">Assignee</th>
            <th className="px-4 py-3">Latest Check</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {tasks.map((task) => {
            const overdue =
              !!task.due_date &&
              new Date(task.due_date).getTime() < now &&
              task.status !== "done";
            const latestCheck = latestCheckByTaskId[task.id];
            const canEdit =
              currentUser.role === "admin" ||
              (currentUser.role === "editor" &&
                (task.created_by === currentUser.id || task.assigned_to === currentUser.id));
            const canDelete =
              currentUser.role === "admin" ||
              (currentUser.role === "editor" && task.created_by === currentUser.id);
            const boundDelete = deleteTask.bind(null, task.id);

            return (
              <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                <td className="px-4 py-3">
                  {task.output_type_id && outputTypesById[task.output_type_id] ? (
                    <Badge
                      className={
                        LOOKUP_BADGE_CLASSES[outputTypesById[task.output_type_id].color] ??
                        LOOKUP_BADGE_CLASSES.slate
                      }
                    >
                      {outputTypesById[task.output_type_id].name}
                    </Badge>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/tasks/${task.id}`}
                    className="font-medium text-slate-900 hover:underline dark:text-slate-50"
                  >
                    {task.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {task.segment_id && segmentsById[task.segment_id] ? (
                    <Badge
                      className={
                        LOOKUP_BADGE_CLASSES[segmentsById[task.segment_id].color] ??
                        LOOKUP_BADGE_CLASSES.slate
                      }
                    >
                      {segmentsById[task.segment_id].name}
                    </Badge>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
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
                <td className="px-4 py-3">
                  <StatusSelect taskId={task.id} status={task.status} disabled={!canEditStatus} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/tasks/${task.id}`}
                      aria-label="View task"
                      title="View"
                      className="text-slate-500 hover:text-[#1565D8] dark:text-slate-400"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                    {canEdit && (
                      <Link
                        href={`/tasks/${task.id}?mode=edit`}
                        aria-label="Edit task"
                        title="Edit"
                        className="text-slate-500 hover:text-[#1565D8] dark:text-slate-400"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                    )}
                    {canDelete && <DeleteTaskButton onDelete={boundDelete} />}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
