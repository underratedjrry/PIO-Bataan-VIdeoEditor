"use client";

import { useState, useTransition } from "react";
import { ActiveToggle } from "@/components/ActiveToggle";

export function LookupRow({
  id,
  name,
  isActive,
  itemLabel,
  onRename,
  onToggle,
  onDelete,
}: {
  id: string;
  name: string;
  isActive: boolean;
  itemLabel: string;
  onRename: (id: string, name: string) => Promise<void>;
  onToggle: (id: string, next: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
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
                setValue(name);
                setEditing(false);
              }}
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
          </div>
        ) : (
          <span className="text-slate-900 dark:text-slate-100">{name}</span>
        )}
      </td>
      <td className="px-4 py-2">
        <ActiveToggle id={id} isActive={isActive} onToggle={onToggle} />
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
              disabled={isPending}
              onClick={() => {
                if (confirm(`Delete "${name}"? Tasks using it will just show no ${itemLabel}.`)) {
                  startTransition(() => onDelete(id));
                }
              }}
              className="text-xs font-medium text-red-600 dark:text-red-400"
            >
              Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
