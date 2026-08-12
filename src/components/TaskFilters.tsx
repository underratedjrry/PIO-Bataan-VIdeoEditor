"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PRIORITIES, PRIORITY_LABELS, STATUSES, STATUS_LABELS } from "@/lib/tasks/constants";
import { PAGE_SIZE_OPTIONS } from "@/lib/tasks/query";
import { ArrowUpDownIcon, DownloadIcon } from "./icons";
import type { OutputType, Segment } from "@/types/database";

const SORT_OPTIONS = [
  { value: "due_date", label: "Due Date" },
  { value: "priority", label: "Priority" },
  { value: "created_at", label: "Created" },
  { value: "title", label: "Title" },
];

export function TaskFilters({
  outputTypes,
  segments,
}: {
  outputTypes: OutputType[];
  segments: Segment[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleDir() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("dir", params.get("dir") === "desc" ? "asc" : "desc");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  const dir = searchParams.get("dir") === "desc" ? "desc" : "asc";
  const pageSize = searchParams.get("pageSize") ?? "25";
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
        value={searchParams.get("segmentId") ?? ""}
        onChange={(v) => update("segmentId", v)}
        options={[
          { value: "", label: "All" },
          ...segments.map((s) => ({ value: s.id, label: s.name })),
        ]}
      />
      <FilterSelect
        label="Output Type"
        value={searchParams.get("outputTypeId") ?? ""}
        onChange={(v) => update("outputTypeId", v)}
        options={[
          { value: "", label: "All" },
          ...outputTypes.map((ot) => ({ value: ot.id, label: ot.name })),
        ]}
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
      <FilterSelect
        label="Per page"
        value={pageSize}
        onChange={(v) => update("pageSize", v)}
        options={PAGE_SIZE_OPTIONS.map((size) => ({ value: String(size), label: String(size) }))}
      />
      <button
        type="button"
        onClick={toggleDir}
        aria-label={dir === "asc" ? "Ascending" : "Descending"}
        title={dir === "asc" ? "Ascending" : "Descending"}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300"
      >
        <ArrowUpDownIcon className={`h-4 w-4 ${dir === "desc" ? "rotate-180" : ""}`} />
      </button>
      <a
        href={exportHref}
        aria-label="Export CSV"
        title="Export CSV"
        className="flex h-9 w-9 items-center justify-center rounded-md bg-[#1565D8] text-white hover:bg-[#0F52B5]"
      >
        <DownloadIcon className="h-4 w-4" />
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
    <label className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
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
