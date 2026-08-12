"use client";

import { useTransition } from "react";
import { runWithToast } from "@/lib/toast-action";
import { TrashIcon } from "./icons";

export function DeleteTaskButton({ onDelete }: { onDelete: () => Promise<void> }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      aria-label="Delete task"
      title={isPending ? "Deleting..." : "Delete"}
      onClick={() => {
        if (confirm("Delete this task? This cannot be undone.")) {
          startTransition(() => {
            runWithToast(onDelete);
          });
        }
      }}
      className="text-red-600 hover:text-red-700 disabled:opacity-40 dark:text-red-400 dark:hover:text-red-300"
    >
      <TrashIcon className="h-4 w-4" />
    </button>
  );
}
