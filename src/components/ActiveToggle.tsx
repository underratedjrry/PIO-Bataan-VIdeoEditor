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
      className={`border-l-4 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide disabled:opacity-60 ${
        isActive
          ? "bg-green-50 text-green-700 border-green-600 dark:bg-green-950 dark:text-green-300 dark:border-green-400"
          : "bg-slate-100 text-slate-600 border-slate-400 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-500"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </button>
  );
}
