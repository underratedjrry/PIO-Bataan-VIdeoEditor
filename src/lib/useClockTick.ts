"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const id = setInterval(callback, 1000);
  return () => clearInterval(id);
}

function getSnapshot() {
  return Date.now();
}

function getServerSnapshot() {
  // 0 is a stable placeholder so the server render and the client's first
  // render match exactly; the interval subscription fills in a real
  // timestamp within a second of mount.
  return 0;
}

export function useClockTick(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
