"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

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
          if (res.ok) {
            toast.success("Insights refreshed.");
            router.refresh();
          } else {
            const data = await res.json().catch(() => null);
            toast.error(data?.error ?? "Failed to refresh insights.");
          }
        });
      }}
      className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300"
    >
      {isPending ? "Analyzing..." : "Regenerate insights"}
    </button>
  );
}
