"use client";

import { useTransition } from "react";

export function DeleteTaskButton({ onDelete }: { onDelete: () => Promise<void> }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm("Delete this task? This cannot be undone.")) {
          startTransition(() => {
            onDelete();
          });
        }
      }}
      className="rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-600 disabled:opacity-60 dark:border-red-900 dark:text-red-400"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
