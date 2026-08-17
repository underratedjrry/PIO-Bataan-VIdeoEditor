"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { BellIcon } from "@/components/icons";
import { formatPHDateTime } from "@/lib/ph-time";
import type { DueTaskSummary } from "@/lib/tasks/notifications";

const POPOVER_WIDTH = 320;

export function NotificationBell({
  overdue,
  dueSoon,
}: {
  overdue: DueTaskSummary[];
  dueSoon: DueTaskSummary[];
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const count = overdue.length + dueSoon.length;

  function openPopover() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setPosition({
        top: rect.bottom + 6,
        left: Math.min(rect.left, window.innerWidth - POPOVER_WIDTH - 8),
      });
    }
    setOpen(true);
  }

  return (
    <div className="inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openPopover())}
        aria-label={`Notifications${count > 0 ? ` (${count})` : ""}`}
        title="Notifications"
        className="relative text-slate-500 hover:text-[#0036AF] dark:text-slate-400"
      >
        <BellIcon className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center border-l-2 border-red-700 bg-[#E10017] px-1 text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && position && (
        <>
          <button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed z-50 max-h-[70vh] overflow-y-auto border-2 border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
            style={{ top: position.top, left: position.left, width: POPOVER_WIDTH }}
          >
            <p className="nav-label border-b border-slate-200 px-4 py-3 text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Notifications
            </p>
            {count === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-400">
                No due or overdue tasks.
              </p>
            ) : (
              <ul className="flex flex-col">
                {overdue.map((t) => (
                  <NotificationRow key={t.id} task={t} tone="overdue" onClick={() => setOpen(false)} />
                ))}
                {dueSoon.map((t) => (
                  <NotificationRow key={t.id} task={t} tone="due-soon" onClick={() => setOpen(false)} />
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function NotificationRow({
  task,
  tone,
  onClick,
}: {
  task: DueTaskSummary;
  tone: "overdue" | "due-soon";
  onClick: () => void;
}) {
  return (
    <li>
      <Link
        href={`/tasks/${task.id}`}
        onClick={onClick}
        className={`flex flex-col gap-0.5 border-b border-l-4 border-slate-100 px-4 py-2.5 text-sm hover:bg-slate-50 dark:border-slate-700/60 dark:hover:bg-slate-700/40 ${
          tone === "overdue" ? "border-l-[#E10017]" : "border-l-amber-500"
        }`}
      >
        <span className="font-medium text-slate-900 dark:text-slate-100">{task.title}</span>
        <span
          className={`text-xs ${tone === "overdue" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`}
        >
          {tone === "overdue" ? "Overdue" : "Due soon"} - {formatPHDateTime(task.due_date)}
        </span>
      </Link>
    </li>
  );
}
