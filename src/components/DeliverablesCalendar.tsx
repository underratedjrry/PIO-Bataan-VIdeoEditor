"use client";

import { useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/Modal";
import { Badge } from "@/components/Badge";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import {
  LOOKUP_BADGE_CLASSES,
  PRIORITY_BADGE_CLASSES,
  PRIORITY_LABELS,
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
} from "@/lib/tasks/constants";
import { getPHDateParts } from "@/lib/ph-time";
import type { Priority, Status } from "@/types/database";

export type DayTask = {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  outputTypeColor: string | null;
  assigneeName: string | null;
  dueDate: string;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function monthParam(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export function DeliverablesCalendar({
  year,
  month,
  tasksByDay,
}: {
  year: number;
  month: number;
  tasksByDay: Record<number, DayTask[]>;
}) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = new Date(year, month, 1).getDay();

  const today = getPHDateParts(new Date());
  const isCurrentMonth = today.year === year && today.month === month;

  const prevMonth = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month + 1, 1);

  const cells: (number | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedTasks = selectedDay ? (tasksByDay[selectedDay] ?? []) : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Deliverables Timeline (Video Editors)
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard?month=${monthParam(prevMonth.getFullYear(), prevMonth.getMonth())}`}
          aria-label="Previous month"
          title="Previous month"
          className="flex h-9 w-9 items-center justify-center rounded-none border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            {MONTH_NAMES[month]} {year}
          </span>
          {!isCurrentMonth && (
            <Link href="/dashboard" className="text-xs font-medium text-[#0036AF] underline">
              Today
            </Link>
          )}
        </div>
        <Link
          href={`/dashboard?month=${monthParam(nextMonth.getFullYear(), nextMonth.getMonth())}`}
          aria-label="Next month"
          title="Next month"
          className="flex h-9 w-9 items-center justify-center rounded-none border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[700px] grid-cols-7 gap-px overflow-hidden rounded-none border border-slate-200 bg-slate-200 dark:border-slate-800 dark:bg-slate-800">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="bg-slate-50 px-2 py-2 text-center text-xs font-semibold uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400"
            >
              {d}
            </div>
          ))}
          {cells.map((day, index) => {
            if (day === null) {
              return <div key={index} className="min-h-[100px] bg-white dark:bg-slate-900" />;
            }
            const dayTasks = tasksByDay[day] ?? [];
            const isToday = isCurrentMonth && today.day === day;
            return (
              <button
                type="button"
                key={index}
                onClick={() => dayTasks.length > 0 && setSelectedDay(day)}
                disabled={dayTasks.length === 0}
                className={`flex min-h-[100px] flex-col items-start gap-1 bg-white p-1.5 text-left dark:bg-slate-900 ${
                  dayTasks.length > 0
                    ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    : "cursor-default"
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    isToday
                      ? "bg-[#0036AF] text-white"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {day}
                </span>
                <div className="flex w-full flex-col gap-1">
                  {dayTasks.slice(0, 3).map((t) => (
                    <span
                      key={t.id}
                      title={t.title}
                      className={`truncate rounded px-1.5 py-0.5 text-[11px] ${
                        LOOKUP_BADGE_CLASSES[t.outputTypeColor ?? "slate"] ?? LOOKUP_BADGE_CLASSES.slate
                      }`}
                    >
                      {t.title}
                    </span>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[11px] text-slate-400">
                      +{dayTasks.length - 3} more
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <Modal onClose={() => setSelectedDay(null)}>
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">
            Due {MONTH_NAMES[month]} {selectedDay}, {year}
          </h2>
          <ul className="flex flex-col gap-3 text-sm">
            {selectedTasks.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/tasks/${t.id}`}
                  onClick={() => setSelectedDay(null)}
                  className="flex flex-col gap-2 rounded-none border border-slate-200 p-3 hover:border-[#0036AF] dark:border-slate-800"
                >
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {t.title}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={PRIORITY_BADGE_CLASSES[t.priority]}>
                      {PRIORITY_LABELS[t.priority]}
                    </Badge>
                    <Badge className={STATUS_BADGE_CLASSES[t.status]}>
                      {STATUS_LABELS[t.status]}
                    </Badge>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {t.assigneeName ?? "Unassigned"}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </div>
  );
}
