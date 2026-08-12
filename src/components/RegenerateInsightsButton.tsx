"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function RegenerateInsightsButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const res = await fetch("/api/insights/generate", { method: "POST" });
          if (res.ok) router.refresh();
        });
      }}
      className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300"
    >
      {isPending ? "Analyzing..." : "Regenerate insights"}
    </button>
  );
}
