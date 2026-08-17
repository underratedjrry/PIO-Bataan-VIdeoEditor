import type { EditorStats } from "@/lib/tasks/editor-stats";
import type { Profile } from "@/types/database";

function formatDuration(hours: number) {
  if (hours >= 24) return `${(hours / 24).toFixed(1)}d`;
  return `${Math.round(hours)}h`;
}

export function EditorCard({ profile, stats }: { profile: Profile; stats: EditorStats }) {
  const completionRate =
    stats.totalTasks > 0 ? Math.round((stats.completed / stats.totalTasks) * 100) : 0;

  return (
    <div className="rounded-none border border-slate-200 p-4 dark:border-slate-800">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0036AF]/10 text-sm font-semibold text-[#0036AF]">
          {profile.full_name.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900 dark:text-slate-50">
            {profile.full_name}
          </p>
          <p className="text-xs uppercase text-slate-400 dark:text-slate-500">{profile.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <Stat label="Total edited" value={String(stats.totalTasks)} />
        <Stat label="Completed" value={String(stats.completed)} />
        <Stat label="Ongoing" value={String(stats.ongoing)} />
        <Stat label="Upcoming" value={String(stats.upcoming)} />
      </div>

      <div className="mt-4 flex justify-between border-t border-slate-100 pt-3 text-sm dark:border-slate-800">
        <p className="text-slate-500 dark:text-slate-400">
          Completion rate{" "}
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {completionRate}%
          </span>
        </p>
        <p className="text-slate-500 dark:text-slate-400">
          Avg. duration{" "}
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {stats.avgCompletionHours !== null ? formatDuration(stats.avgCompletionHours) : "-"}
          </span>
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{value}</p>
    </div>
  );
}
