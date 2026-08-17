"use client";

import { useTransition } from "react";
import { updateUserRole } from "@/lib/admin/actions";
import type { Role } from "@/types/database";

const ROLES: Role[] = ["admin", "editor", "viewer"];

export function RoleSelect({
  userId,
  role,
  disabled,
}: {
  userId: string;
  role: Role;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={role}
      disabled={disabled || isPending}
      onChange={(event) => {
        const next = event.target.value as Role;
        startTransition(() => {
          updateUserRole(userId, next);
        });
      }}
      className="rounded-none border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}
