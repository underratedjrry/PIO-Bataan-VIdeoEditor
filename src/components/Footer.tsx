"use client";

import { useOnlineStatus } from "@/lib/useOnlineStatus";

const APP_VERSION = "1.0.0";
const BUILD_TAG = "2026.08.12";

export function Footer() {
  const online = useOnlineStatus();

  return (
    <footer className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>Provincial Information Office - Bataan | VE PMIS</span>
        <div className="flex items-center gap-3">
          <span>
            v{APP_VERSION} (build {BUILD_TAG})
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${online ? "bg-green-500" : "bg-red-500"}`}
              aria-hidden="true"
            />
            {online ? "Online" : "Offline"}
          </span>
        </div>
      </div>
    </footer>
  );
}
