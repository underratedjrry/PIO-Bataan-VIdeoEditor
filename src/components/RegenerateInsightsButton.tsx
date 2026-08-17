"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { RefreshIcon } from "./icons";

export function RegenerateInsightsButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      aria-label="Regenerate insights"
      title={isPending ? "Analyzing..." : "Regenerate insights"}
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
      className="flex h-9 w-9 items-center justify-center rounded-none border border-slate-300 text-slate-700 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300"
    >
      <RefreshIcon className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
    </button>
  );
}
