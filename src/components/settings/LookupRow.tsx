"use client";

import { useState, useTransition } from "react";
import { ActiveToggle } from "@/components/ActiveToggle";
import { runWithToast } from "@/lib/toast-action";
import { CheckIcon, PencilIcon, TrashIcon, XIcon } from "@/components/icons";

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
              aria-label="Save"
              title="Save"
              onClick={() =>
                startTransition(async () => {
                  const ok = await runWithToast(() => onRename(id, value), "Renamed.");
                  if (ok) setEditing(false);
                })
              }
              className="rounded-md bg-[#1565D8] p-1.5 text-white hover:bg-[#0F52B5] disabled:opacity-60"
            >
              <CheckIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Cancel"
              title="Cancel"
              onClick={() => {
                setValue(name);
                setEditing(false);
              }}
              className="rounded-md border border-slate-300 p-1.5 text-slate-700 dark:border-slate-700 dark:text-slate-300"
            >
              <XIcon className="h-4 w-4" />
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
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label="Edit"
              title="Edit"
              className="text-slate-500 hover:text-[#1565D8] dark:text-slate-400"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={isPending}
              aria-label="Delete"
              title="Delete"
              onClick={() => {
                if (confirm(`Delete "${name}"? Tasks using it will just show no ${itemLabel}.`)) {
                  startTransition(() => {
                    runWithToast(() => onDelete(id), "Deleted.");
                  });
                }
              }}
              className="text-red-600 hover:text-red-700 disabled:opacity-40 dark:text-red-400 dark:hover:text-red-300"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
