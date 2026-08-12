"use client";

import { useState, useTransition } from "react";
import { createUserAccount } from "@/lib/admin/actions";
import { runWithToast } from "@/lib/toast-action";
import { PasswordField } from "@/components/PasswordField";
import { CheckIcon, PlusIcon, XIcon } from "@/components/icons";
import type { Role } from "@/types/database";

const ROLES: Role[] = ["admin", "editor", "viewer"];

export function AddUserForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Add user"
        title="Add user"
        className="flex h-9 w-9 items-center justify-center rounded-md bg-[#1565D8] text-white hover:bg-[#0F52B5]"
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <form
      action={(formData: FormData) => {
        startTransition(async () => {
          const ok = await runWithToast(() => createUserAccount(formData), "User created.");
          if (ok) setOpen(false);
        });
      }}
      className="flex max-w-md flex-col gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800"
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-300">Full name</span>
        <input name="fullName" required className="form-input" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-300">Email</span>
        <input name="email" type="email" required className="form-input" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-300">Temporary password</span>
        <PasswordField
          id="new-user-password"
          name="password"
          autoComplete="new-password"
          minLength={6}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-300">Role</span>
        <select name="role" defaultValue="editor" className="form-input">
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          aria-label="Create user"
          title={isPending ? "Creating..." : "Create user"}
          className="rounded-md bg-[#1565D8] p-2 text-white hover:bg-[#0F52B5] disabled:opacity-60"
        >
          <CheckIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Cancel"
          title="Cancel"
          className="rounded-md border border-slate-300 p-2 text-slate-700 dark:border-slate-700 dark:text-slate-300"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
