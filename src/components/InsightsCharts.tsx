"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PerformanceStats } from "@/lib/anthropic";
import { CATEGORICAL, CHROME, SEQUENTIAL_BLUE, STATUS_COLORS } from "@/lib/palette";
import { useColorScheme } from "@/lib/useColorScheme";
import {
  PRIORITY_LABELS,
  SEGMENT_LABELS,
  STATUS_LABELS,
} from "@/lib/tasks/constants";
import type { Priority, Status } from "@/types/database";

function toChartRows(
  counts: Record<string, number>,
  labels: Record<string, string>,
) {
  return Object.entries(counts)
    .map(([key, value]) => ({ key, name: labels[key] ?? key, value }))
    .sort((a, b) => b.value - a.value);
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "critical" | "good";
}) {
  const scheme = useColorScheme();
  const color = tone ? STATUS_COLORS[tone][scheme] : CHROME[scheme].primaryInk;

  return (
    <div className="rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="text-2xl font-semibold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function HorizontalBarChart({
  rows,
  barColor,
}: {
  rows: { key: string; name: string; value: number }[];
  barColor: (key: string, index: number) => string;
}) {
  const scheme = useColorScheme();
  const chrome = CHROME[scheme];
  const height = Math.max(rows.length * 36, 80);

  if (rows.length === 0) {
    return (
      <p className="py-6 text-sm text-zinc-500 dark:text-zinc-400">No data yet.</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <XAxis type="number" allowDecimals={false} tick={{ fill: chrome.muted, fontSize: 12 }} stroke={chrome.grid} />
        <YAxis
          type="category"
          dataKey="name"
          width={140}
          tick={{ fill: chrome.secondaryInk, fontSize: 12 }}
          stroke={chrome.grid}
        />
        <Tooltip
          cursor={{ fill: chrome.grid, opacity: 0.4 }}
          contentStyle={{
            background: chrome.surface,
            border: `1px solid ${chrome.grid}`,
            borderRadius: 6,
            fontSize: 12,
            color: chrome.primaryInk,
          }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}>
          {rows.map((row, index) => (
            <Cell key={row.key} fill={barColor(row.key, index)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function InsightsCharts({ stats }: { stats: PerformanceStats }) {
  const scheme = useColorScheme();

  const segmentRows = toChartRows(stats.bySegment, SEGMENT_LABELS as Record<string, string>);
  const priorityRows = toChartRows(stats.byPriority, PRIORITY_LABELS as Record<string, string>);
  const statusRows = toChartRows(stats.byStatus, STATUS_LABELS as Record<string, string>);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Assigned tasks" value={String(stats.totalTasks)} />
        <StatTile
          label="Completion rate"
          value={`${Math.round(stats.completionRate * 100)}%`}
        />
        <StatTile
          label="Overdue"
          value={String(stats.overdueTasks)}
          tone={stats.overdueTasks > 0 ? "critical" : "good"}
        />
        <StatTile
          label="Avg turnaround"
          value={
            stats.avgTurnaroundHours !== null
              ? `${Math.round(stats.avgTurnaroundHours)}h`
              : "-"
          }
        />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Tasks by segment
        </h3>
        <HorizontalBarChart
          rows={segmentRows}
          barColor={() => SEQUENTIAL_BLUE[scheme]}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Tasks by priority
          </h3>
          <HorizontalBarChart
            rows={priorityRows}
            barColor={(key) => {
              const index = (Object.keys(PRIORITY_LABELS) as Priority[]).indexOf(
                key as Priority,
              );
              return CATEGORICAL[scheme][index % CATEGORICAL[scheme].length];
            }}
          />
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Tasks by status
          </h3>
          <HorizontalBarChart
            rows={statusRows}
            barColor={(key) => {
              const index = (Object.keys(STATUS_LABELS) as Status[]).indexOf(key as Status);
              return CATEGORICAL[scheme][index % CATEGORICAL[scheme].length];
            }}
          />
        </div>
      </div>
    </div>
  );
}

