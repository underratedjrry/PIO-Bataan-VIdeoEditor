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
      className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300"
    >
      {isPending ? "Analyzing..." : "Regenerate insights"}
    </button>
  );
}
