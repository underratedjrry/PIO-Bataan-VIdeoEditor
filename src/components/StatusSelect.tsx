"use client";

import { useTransition } from "react";
import { setTaskStatus } from "@/lib/tasks/actions";
import { STATUSES, STATUS_LABELS } from "@/lib/tasks/constants";
import type { Status } from "@/types/database";

export function StatusSelect({
  taskId,
  status,
  disabled,
}: {
  taskId: string;
  status: Status;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={disabled || isPending}
      onChange={(event) => {
        const next = event.target.value as Status;
        startTransition(() => {
          setTaskStatus(taskId, next);
        });
      }}
      className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
