"use client";

import { useState, useTransition } from "react";
import { createUserAccount } from "@/lib/admin/actions";
import { runWithToast } from "@/lib/toast-action";
import { PasswordField } from "@/components/PasswordField";
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
        className="w-fit rounded-md bg-[#1565D8] px-3 py-2 text-sm font-medium text-white hover:bg-[#0F52B5]"
      >
        Add User
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
          className="rounded-md bg-[#1565D8] px-3 py-2 text-sm font-medium text-white hover:bg-[#0F52B5] disabled:opacity-60"
        >
          {isPending ? "Creating..." : "Create user"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
