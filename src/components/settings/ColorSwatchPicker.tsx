"use client";

import { useRef, useState, useTransition } from "react";
import { runWithToast } from "@/lib/toast-action";
import { LOOKUP_COLORS, LOOKUP_SWATCH_CLASSES } from "@/lib/tasks/constants";

const POPOVER_WIDTH = 136;

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
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isPending, startTransition] = useTransition();

  function openPicker() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setPosition({
        top: rect.bottom + 4,
        left: Math.min(rect.left, window.innerWidth - POPOVER_WIDTH - 8),
      });
    }
    setOpen(true);
  }

  return (
    <div className="inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openPicker())}
        aria-label="Change color"
        title="Change color"
        disabled={isPending}
        className={`h-5 w-5 rounded-full ${LOOKUP_SWATCH_CLASSES[color] ?? LOOKUP_SWATCH_CLASSES.slate} ${
          open ? "ring-2 ring-slate-400 ring-offset-2 dark:ring-offset-slate-900" : ""
        }`}
      />
      {open && position && (
        <>
          {/* Fixed (viewport-relative), not absolute - the settings table's
              scroll container clips absolutely-positioned children, which
              was cutting this popover off near the bottom of the table. */}
          <button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed z-50 flex flex-wrap gap-1.5 rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800"
            style={{ top: position.top, left: position.left, width: POPOVER_WIDTH }}
          >
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
