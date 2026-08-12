"use client";

import { useState } from "react";
import type { OutputType, Profile, Writer } from "@/types/database";
import { UserRow } from "./UserRow";
import { LookupRow } from "./LookupRow";
import {
  createOutputType,
  createWriter,
  deleteOutputType,
  deleteWriter,
  renameOutputType,
  renameWriter,
  toggleOutputType,
  toggleWriter,
} from "@/lib/lookups/actions";
import { deleteUserAccount, updateUserName } from "@/lib/admin/actions";

const TABS = [
  { key: "users", label: "Users" },
  { key: "outputTypes", label: "Output Types" },
  { key: "writers", label: "Writers" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function SettingsTabs({
  profiles,
  outputTypes,
  writers,
  currentUserId,
}: {
  profiles: Profile[];
  outputTypes: OutputType[];
  writers: Writer[];
  currentUserId: string;
}) {
  const [tab, setTab] = useState<TabKey>("users");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium ${
              tab === t.key
                ? "border-b-2 border-[#1565D8] text-[#1565D8]"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {profiles.map((p) => (
                <UserRow
                  key={p.id}
                  id={p.id}
                  fullName={p.full_name}
                  email={p.email}
                  role={p.role}
                  isSelf={p.id === currentUserId}
                  onRename={updateUserName}
                  onDelete={deleteUserAccount}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "outputTypes" && (
        <LookupSection
          items={outputTypes}
          itemLabel="output type"
          onCreate={createOutputType}
          onRename={renameOutputType}
          onToggle={toggleOutputType}
          onDelete={deleteOutputType}
        />
      )}

      {tab === "writers" && (
        <LookupSection
          items={writers}
          itemLabel="writer"
          onCreate={createWriter}
          onRename={renameWriter}
          onToggle={toggleWriter}
          onDelete={deleteWriter}
        />
      )}
    </div>
  );
}

function LookupSection({
  items,
  itemLabel,
  onCreate,
  onRename,
  onToggle,
  onDelete,
}: {
  items: (OutputType | Writer)[];
  itemLabel: string;
  onCreate: (formData: FormData) => Promise<void>;
  onRename: (id: string, name: string) => Promise<void>;
  onToggle: (id: string, next: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <form action={onCreate} className="flex max-w-md gap-2">
        <input
          name="name"
          placeholder={`Add a new ${itemLabel}`}
          required
          className="form-input flex-1"
        />
        <button
          type="submit"
          className="rounded-md bg-[#1565D8] px-3 py-2 text-sm font-medium text-white hover:bg-[#0F52B5]"
        >
          Add
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item) => (
              <LookupRow
                key={item.id}
                id={item.id}
                name={item.name}
                isActive={item.is_active}
                itemLabel={itemLabel}
                onRename={onRename}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                  No {itemLabel}s yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
