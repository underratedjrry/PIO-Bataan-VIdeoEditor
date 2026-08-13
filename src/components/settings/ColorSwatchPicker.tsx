"use client";

import { useState, useTransition } from "react";
import { runWithToast } from "@/lib/toast-action";
import { LOOKUP_COLORS, LOOKUP_SWATCH_CLASSES } from "@/lib/tasks/constants";

export function ColorSwatchPicker({
  id,
  color,
  onSetColor,
}: {
  id: string;
  color: string;
  onSetColor: (id: string, color: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Change color"
        title="Change color"
        disabled={isPending}
        className={`h-5 w-5 rounded-full ${LOOKUP_SWATCH_CLASSES[color] ?? LOOKUP_SWATCH_CLASSES.slate} ${
          open ? "ring-2 ring-slate-400 ring-offset-2 dark:ring-offset-slate-900" : ""
        }`}
      />
      {open && (
        <>
          <button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-7 z-20 flex w-[136px] flex-wrap gap-1.5 rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
            {LOOKUP_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={c}
                title={c}
                onClick={() => {
                  setOpen(false);
                  startTransition(() => {
                    runWithToast(() => onSetColor(id, c), "Color updated.");
                  });
                }}
                className={`h-5 w-5 rounded-full ${LOOKUP_SWATCH_CLASSES[c]} ${
                  c === color ? "ring-2 ring-slate-900 ring-offset-1 dark:ring-white" : ""
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
