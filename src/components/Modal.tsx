"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { XIcon } from "@/components/icons";

export function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  /** Defaults to router.back() - pass this for client-state-driven modals
   * that aren't backed by an intercepted route. */
  onClose?: () => void;
}) {
  const router = useRouter();
  const close = onClose ?? (() => router.back());

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 py-10">
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute inset-0 cursor-default"
      />
      <div className="relative w-full max-w-2xl rounded-xl bg-white p-6 pr-12 shadow-xl dark:bg-slate-800">
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
        >
          <XIcon className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}
