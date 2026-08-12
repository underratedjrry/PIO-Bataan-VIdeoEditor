"use client";

import { useState, useTransition } from "react";
import { RoleSelect } from "@/components/RoleSelect";
import type { Role } from "@/types/database";

export function UserRow({
  id,
  fullName,
  email,
  role,
  isSelf,
  onRename,
  onDelete,
}: {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  isSelf: boolean;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(fullName);
  const [isPending, startTransition] = useTransition();

  return (
    <tr>
      <td className="px-4 py-2">
        {editing ? (
          <div className="flex gap-2">
            <input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="form-input flex-1 py-1"
              autoFocus
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await onRename(id, value);
                  setEditing(false);
                })
              }
              className="rounded-md bg-[#1565D8] px-2.5 py-1 text-xs font-medium text-white hover:bg-[#0F52B5]"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setValue(fullName);
                setEditing(false);
              }}
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
          </div>
        ) : (
          <span className="text-slate-900 dark:text-slate-100">{fullName}</span>
        )}
      </td>
      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{email}</td>
      <td className="px-4 py-2">
        <RoleSelect userId={id} role={role} disabled={isSelf} />
      </td>
      <td className="px-4 py-2">
        {!editing && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs font-medium text-[#1565D8]"
            >
              Edit
            </button>
            <button
              type="button"
              disabled={isPending || isSelf}
              title={isSelf ? "You can't delete your own account" : undefined}
              onClick={() => {
                if (confirm(`Delete ${fullName}'s account? This can't be undone.`)) {
                  startTransition(() => onDelete(id));
                }
              }}
              className="text-xs font-medium text-red-600 disabled:opacity-40 dark:text-red-400"
            >
              Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
