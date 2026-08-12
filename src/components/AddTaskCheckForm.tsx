"use client";

import { useState, useTransition } from "react";
import {
  CHECK_STAGES,
  CHECK_STAGE_LABELS,
  CHECK_STATUSES,
  CHECK_STATUS_LABELS,
} from "@/lib/tasks/constants";

export function AddTaskCheckForm({
  onAdd,
}: {
  onAdd: (formData: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-fit rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300"
      >
        Add check
      </button>
    );
  }

  return (
    <form
      action={(formData: FormData) => {
        startTransition(async () => {
          await onAdd(formData);
          setOpen(false);
        });
      }}
      className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800"
    >
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">Checking stage</span>
          <select name="stage" required className="form-input">
            {CHECK_STAGES.map((s) => (
              <option key={s} value={s}>
                {CHECK_STAGE_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">Status</span>
          <select name="status" required className="form-input">
            {CHECK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {CHECK_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-300">Remarks</span>
        <textarea name="remarks" rows={3} className="form-input" />
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-[#1565D8] px-3 py-2 text-sm font-medium text-white hover:bg-[#0F52B5] disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Submit check"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
