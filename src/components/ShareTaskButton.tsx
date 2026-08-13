"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/Modal";
import { CheckIcon, LinkIcon } from "@/components/icons";

export function ShareTaskButton({ taskId }: { taskId: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = open ? `${window.location.origin}/share/tasks/${taskId}` : "";

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
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Share task"
        title="Share"
        className="text-slate-500 hover:text-[#1565D8] dark:text-slate-400"
      >
        <LinkIcon className="h-4 w-4" />
      </button>

      {open && (
        <Modal onClose={() => setOpen(false)}>
          <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
            Share this task
          </h2>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Anyone with this link can view a read-only copy of this task&apos;s details - no
            login required.
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
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#1565D8] text-white hover:bg-[#0F52B5]"
            >
              {copied ? <CheckIcon className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
