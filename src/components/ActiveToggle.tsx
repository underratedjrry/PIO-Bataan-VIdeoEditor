"use client";

import { useTransition } from "react";
import { runWithToast } from "@/lib/toast-action";

export function ActiveToggle({
  id,
  isActive,
  onToggle,
}: {
  id: string;
  isActive: boolean;
  onToggle: (id: string, next: boolean) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          runWithToast(() => onToggle(id, !isActive), isActive ? "Deactivated." : "Activated.");
        });
      }}
      className={`rounded-full px-2.5 py-1 text-xs font-medium disabled:opacity-60 ${
        isActive
          ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </button>
  );
}
