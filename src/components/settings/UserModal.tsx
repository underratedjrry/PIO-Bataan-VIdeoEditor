"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/Modal";
import { RoleSelect } from "@/components/RoleSelect";
import { runWithToast } from "@/lib/toast-action";
import { deleteUserAccount, updateUserName } from "@/lib/admin/actions";
import type { Profile } from "@/types/database";

export function UserModal({
  user,
  isSelf,
  onClose,
}: {
  user: Profile;
  isSelf: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState(user.full_name);
  const [editingName, setEditingName] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <Modal onClose={onClose}>
      <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">
        User details
      </h2>

      <div className="flex flex-col gap-4 text-sm">
        <div>
          <span className="block text-xs font-medium uppercase text-slate-400">Name</span>
          {editingName ? (
            <div className="mt-1 flex gap-2">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="form-input flex-1"
                autoFocus
              />
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    const ok = await runWithToast(
                      () => updateUserName(user.id, name),
                      "Name updated.",
                    );
                    if (ok) setEditingName(false);
                  })
                }
                className="rounded-md bg-[#1565D8] px-3 py-2 text-sm font-medium text-white hover:bg-[#0F52B5]"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setName(user.full_name);
                  setEditingName(false);
                }}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="mt-1 flex items-center gap-3">
              <span className="text-slate-900 dark:text-slate-100">{name}</span>
              <button
                type="button"
                onClick={() => setEditingName(true)}
                className="text-xs font-medium text-[#1565D8]"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        <div>
          <span className="block text-xs font-medium uppercase text-slate-400">Email</span>
          <p className="mt-1 text-slate-900 dark:text-slate-100">{user.email}</p>
        </div>

        <div>
          <span className="block text-xs font-medium uppercase text-slate-400">Role</span>
          <div className="mt-1">
            <RoleSelect userId={user.id} role={user.role} disabled={isSelf} />
          </div>
        </div>

        <div>
          <span className="block text-xs font-medium uppercase text-slate-400">Joined</span>
          <p className="mt-1 text-slate-900 dark:text-slate-100">
            {new Date(user.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end border-t border-slate-200 pt-4 dark:border-slate-800">
        <button
          type="button"
          disabled={isPending || isSelf}
          title={isSelf ? "You can't delete your own account" : undefined}
          onClick={() => {
            if (confirm(`Delete ${user.full_name}'s account? This can't be undone.`)) {
              startTransition(async () => {
                const ok = await runWithToast(() => deleteUserAccount(user.id), "User deleted.");
                if (ok) onClose();
              });
            }
          }}
          className="rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-600 disabled:opacity-40 dark:border-red-900 dark:text-red-400"
        >
          Delete account
        </button>
      </div>
    </Modal>
  );
}
