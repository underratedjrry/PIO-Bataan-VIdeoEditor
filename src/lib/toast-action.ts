"use client";

import { toast } from "sonner";
import { unstable_rethrow } from "next/navigation";

// Runs a server action from a client component, showing a toast on error
// and (optionally) on success. Actions that redirect() internally (create/
// update/delete task) throw a framework-internal control-flow error that
// must be re-thrown, not swallowed - unstable_rethrow does exactly that,
// letting the redirect/notFound proceed while still catching real errors.
// Returns whether the action succeeded, so callers can decide whether to
// reset UI state (e.g. close a form) only on success.
export async function runWithToast(
  action: () => Promise<void>,
  successMessage?: string,
): Promise<boolean> {
  try {
    await action();
    if (successMessage) toast.success(successMessage);
    return true;
  } catch (error) {
    unstable_rethrow(error);
    toast.error(error instanceof Error ? error.message : "Something went wrong.");
    return false;
  }
}
