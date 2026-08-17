"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { CheckIcon, LinkIcon } from "@/components/icons";

const POPOVER_WIDTH = 320;

// A small anchored popover, not a <Modal> - Share is opened from inside the
// task view, which is itself already a modal when reached via the
// intercepted route, so a second full-screen Modal would stack on top of
// it. Closing the popover then still left the task modal visible
// underneath, which read as "leftover"/stacked dialogs.
export function ShareTaskButton({ taskId }: { taskId: string }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const shareUrl = open ? `${window.location.origin}/share/tasks/${taskId}` : "";

  function openPopover() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setPosition({
        top: rect.bottom + 6,
        left: Math.min(rect.left, window.innerWidth - POPOVER_WIDTH - 8),
      });
    }
    setCopied(false);
    setOpen(true);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link - copy it manually instead.");
    }
  }

  return (
    <div className="inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openPopover())}
        aria-label="Share task"
        title="Share"
        className="text-slate-500 hover:text-[#0036AF] dark:text-slate-400"
      >
        <LinkIcon className="h-4 w-4" />
      </button>

      {open && position && (
        <>
          <button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed z-50 rounded-none border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-800"
            style={{ top: position.top, left: position.left, width: POPOVER_WIDTH }}
          >
            <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
              Anyone with this link can view a read-only copy - no login required.
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={shareUrl}
                onFocus={(event) => event.currentTarget.select()}
                className="form-input min-w-0 flex-1"
              />
              <button
                type="button"
                onClick={copyLink}
                aria-label="Copy link"
                title="Copy link"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-[#0036AF] text-white hover:bg-[#002583]"
              >
                {copied ? <CheckIcon className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
