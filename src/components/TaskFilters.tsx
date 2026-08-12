"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  SEGMENTS,
  SEGMENT_LABELS,
  STATUSES,
  STATUS_LABELS,
} from "@/lib/tasks/constants";

const SORT_OPTIONS = [
  { value: "due_date", label: "Due Date" },
  { value: "priority", label: "Priority" },
  { value: "created_at", label: "Created" },
  { value: "title", label: "Title" },
];

export function TaskFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleDir() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("dir", params.get("dir") === "desc" ? "asc" : "desc");
    router.push(`${pathname}?${params.toString()}`);
  }

  const dir = searchParams.get("dir") === "desc" ? "desc" : "asc";
  const exportHref = `/api/tasks/export?${searchParams.toString()}`;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <FilterSelect
        label="Priority"
        value={searchParams.get("priority") ?? ""}
        onChange={(v) => update("priority", v)}
        options={[{ value: "", label: "All" }, ...PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABELS[p] }))]}
      />
      <FilterSelect
        label="Segment"
        value={searchParams.get("segment") ?? ""}
        onChange={(v) => update("segment", v)}
        options={[{ value: "", label: "All" }, ...SEGMENTS.map((s) => ({ value: s, label: SEGMENT_LABELS[s] }))]}
      />
      <FilterSelect
        label="Status"
        value={searchParams.get("status") ?? ""}
        onChange={(v) => update("status", v)}
        options={[{ value: "", label: "All" }, ...STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))]}
      />
      <FilterSelect
        label="Sort by"
        value={searchParams.get("sort") ?? "due_date"}
        onChange={(v) => update("sort", v)}
        options={SORT_OPTIONS}
      />
      <button
        type="button"
        onClick={toggleDir}
        className="h-9 rounded-md border border-zinc-300 px-3 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
      >
        {dir === "asc" ? "Ascending" : "Descending"}
      </button>
      <a
        href={exportHref}
        className="flex h-9 items-center rounded-md bg-zinc-900 px-3 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
      >
        Export CSV
      </a>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-400">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-md border border-zinc-300 bg-white px-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
