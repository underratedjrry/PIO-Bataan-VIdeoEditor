"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  SEGMENTS,
  SEGMENT_LABELS,
  STATUSES,
  STATUS_LABELS,
} from "@/lib/tasks/constants";
import { taskFormSchema, type TaskFormValues } from "@/lib/tasks/schema";
import type { Profile, Task } from "@/types/database";

function toDatetimeLocal(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function TaskForm({
  task,
  profiles,
  onSubmit,
  submitLabel,
}: {
  task?: Task;
  profiles: Profile[];
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
      segment: task?.segment ?? "other",
      priority: task?.priority ?? "medium",
      status: task?.status ?? "todo",
      due_date: toDatetimeLocal(task?.due_date),
      assigned_to: task?.assigned_to ?? "",
    },
  });

  function submit(values: TaskFormValues) {
    const formData = new FormData();
    formData.set("title", values.title);
    formData.set("description", values.description ?? "");
    formData.set("segment", values.segment);
    formData.set("priority", values.priority);
    formData.set("status", values.status);
    formData.set("due_date", values.due_date ?? "");
    formData.set("assigned_to", values.assigned_to ?? "");
    startTransition(() => {
      onSubmit(formData);
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
        <Field label="Segment" error={errors.segment?.message}>
          <select {...register("segment")} className="form-input">
            {SEGMENTS.map((s) => (
              <option key={s} value={s}>
                {SEGMENT_LABELS[s]}
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

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900"
      >
        {isPending ? "Saving..." : submitLabel}
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
      <span className="font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
      {children}
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </label>
  );
}
