"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PRIORITIES, PRIORITY_LABELS, STATUSES, STATUS_LABELS } from "@/lib/tasks/constants";
import { taskFormSchema, type TaskFormValues } from "@/lib/tasks/schema";
import { runWithToast } from "@/lib/toast-action";
import { CheckIcon } from "@/components/icons";
import type { OutputType, Profile, Segment, Task, Writer } from "@/types/database";

function toDatetimeLocal(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function TaskForm({
  task,
  profiles,
  outputTypes,
  writers,
  segments,
  onSubmit,
  submitLabel,
}: {
  task?: Task;
  profiles: Profile[];
  outputTypes: OutputType[];
  writers: Writer[];
  segments: Segment[];
  onSubmit: (formData: FormData) => Promise<void>;
  submitLabel: string;
}) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      segment_id: task?.segment_id ?? "",
      priority: task?.priority ?? "medium",
      status: task?.status ?? "todo",
      due_date: toDatetimeLocal(task?.due_date),
      created_at: toDatetimeLocal(task?.created_at) || toDatetimeLocal(new Date().toISOString()),
      assigned_to: task?.assigned_to ?? "",
      output_type_id: task?.output_type_id ?? "",
      writer_id: task?.writer_id ?? "",
      output_link: task?.output_link ?? "",
    },
  });

  function submit(values: TaskFormValues) {
    const formData = new FormData();
    formData.set("title", values.title);
    formData.set("description", values.description ?? "");
    formData.set("segment_id", values.segment_id ?? "");
    formData.set("priority", values.priority);
    formData.set("status", values.status);
    formData.set("due_date", values.due_date ?? "");
    formData.set("created_at", values.created_at ?? "");
    formData.set("assigned_to", values.assigned_to ?? "");
    formData.set("output_type_id", values.output_type_id ?? "");
    formData.set("writer_id", values.writer_id ?? "");
    formData.set("output_link", values.output_link ?? "");
    startTransition(() => {
      runWithToast(() => onSubmit(formData));
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex max-w-xl flex-col gap-4">
      <Field label="Title" error={errors.title?.message}>
        <input {...register("title")} className="form-input" />
      </Field>

      <Field label="Description" error={errors.description?.message}>
        <textarea {...register("description")} rows={4} className="form-input" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Segment" error={errors.segment_id?.message}>
          <select {...register("segment_id")} className="form-input">
            <option value="">None</option>
            {segments.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Output Type" error={errors.output_type_id?.message}>
          <select {...register("output_type_id")} className="form-input">
            <option value="">None</option>
            {outputTypes.map((ot) => (
              <option key={ot.id} value={ot.id}>
                {ot.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Priority" error={errors.priority?.message}>
          <select {...register("priority")} className="form-input">
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Status" error={errors.status?.message}>
          <select {...register("status")} className="form-input">
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Due date" error={errors.due_date?.message}>
          <input type="datetime-local" {...register("due_date")} className="form-input" />
        </Field>

        <Field label="Task created" error={errors.created_at?.message}>
          <input type="datetime-local" {...register("created_at")} className="form-input" />
        </Field>

        <Field label="Writer" error={errors.writer_id?.message}>
          <select {...register("writer_id")} className="form-input">
            <option value="">None</option>
            {writers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Assignee" error={errors.assigned_to?.message}>
        <select {...register("assigned_to")} className="form-input">
          <option value="">Unassigned</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Output Link" error={errors.output_link?.message}>
        <input
          type="url"
          placeholder="https://drive.google.com/..."
          {...register("output_link")}
          className="form-input"
        />
      </Field>

      <button
        type="submit"
        disabled={isPending}
        aria-label={submitLabel}
        title={isPending ? "Saving..." : submitLabel}
        className="mt-2 flex h-10 w-10 items-center justify-center rounded-md bg-[#1565D8] text-white hover:bg-[#0F52B5] disabled:opacity-60"
      >
        <CheckIcon className="h-5 w-5" />
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
      {children}
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </label>
  );
}
