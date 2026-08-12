"use client";

import { useTransition } from "react";
import { runWithToast } from "@/lib/toast-action";
import { TrashIcon } from "./icons";

export function DeleteTaskButton({
  onDelete,
  compact,
  icon,
}: {
  onDelete: () => Promise<void>;
  compact?: boolean;
  icon?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (confirm("Delete this task? This cannot be undone.")) {
      startTransition(() => {
        runWithToast(onDelete);
      });
    }
  }

  if (icon) {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={handleClick}
        aria-label="Delete task"
        title="Delete"
        className="text-red-600 hover:text-red-700 disabled:opacity-40 dark:text-red-400 dark:hover:text-red-300"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClick}
      className={
        compact
          ? "text-xs font-medium text-red-600 disabled:opacity-60 dark:text-red-400"
          : "rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-600 disabled:opacity-60 dark:border-red-900 dark:text-red-400"
      }
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
