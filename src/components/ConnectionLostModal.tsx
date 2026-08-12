"use client";

import { useOnlineStatus } from "@/lib/useOnlineStatus";
import { Modal } from "./Modal";

export function ConnectionLostModal() {
  const online = useOnlineStatus();

  if (online) return null;

  return (
    <Modal onClose={() => {}}>
      <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
        Connection to server lost
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        You appear to be offline. Some actions won&apos;t work until your connection is
        restored - this will close automatically once you&apos;re back online.
      </p>
    </Modal>
  );
}
