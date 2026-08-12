"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") router.back();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 py-10">
      <button
        type="button"
        aria-label="Close"
        onClick={() => router.back()}
        className="absolute inset-0 cursor-default"
      />
      <div className="relative w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Close"
          className="absolute right-4 top-4 text-xl leading-none text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}
