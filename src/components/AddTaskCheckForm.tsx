"use client";

import { useState, useTransition } from "react";
import {
  CHECK_STAGES,
  CHECK_STAGE_LABELS,
  CHECK_STATUSES,
  CHECK_STATUS_LABELS,
} from "@/lib/tasks/constants";
import { runWithToast } from "@/lib/toast-action";
import { CheckIcon, PlusIcon, XIcon } from "@/components/icons";
import type { Writer } from "@/types/database";

export function AddTaskCheckForm({
  writers,
  onAdd,
}: {
  writers: Writer[];
  onAdd: (formData: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Add check"
        title="Add check"
        className="flex h-9 w-9 items-center justify-center rounded-none border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300"
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <form
      action={(formData: FormData) => {
        startTransition(async () => {
          const ok = await runWithToast(() => onAdd(formData), "Check logged.");
          if (ok) setOpen(false);
        });
      }}
      className="flex flex-col gap-3 rounded-none border border-slate-200 p-4 dark:border-slate-800"
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-300">Checked by</span>
        <select name="checked_by_writer_id" required defaultValue="" className="form-input">
          <option value="" disabled>
            Select a writer
          </option>
          {writers.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </label>
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
          aria-label="Submit check"
          title={isPending ? "Saving..." : "Submit check"}
          className="rounded-none bg-[#0036AF] p-2 text-white hover:bg-[#002583] disabled:opacity-60"
        >
          <CheckIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Cancel"
          title="Cancel"
          className="rounded-none border border-slate-300 p-2 text-slate-700 dark:border-slate-700 dark:text-slate-300"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
