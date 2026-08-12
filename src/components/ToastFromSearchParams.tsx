"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const MESSAGES: Record<string, string> = {
  "task-created": "Task created.",
  "task-updated": "Task updated.",
  "task-deleted": "Task deleted.",
};

// Server actions that redirect() on success (create/update/delete task)
// can't easily show a toast before navigating away, so they tag the
// destination URL with ?toast=<key> instead - this fires the matching
// toast once on mount, then strips the param from the URL.
export function ToastFromSearchParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const key = searchParams.get("toast");

  useEffect(() => {
    if (!key) return;
    const message = MESSAGES[key];
    if (message) toast.success(message);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("toast");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return null;
}
