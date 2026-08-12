import { z } from "zod";
import type { CheckStage, CheckStatus, Priority, Status } from "@/types/database";
import { CHECK_STAGES, CHECK_STATUSES, PRIORITIES, STATUSES } from "./constants";

export const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional().or(z.literal("")),
  segment_id: z.string().uuid().optional().or(z.literal("")),
  priority: z.enum(PRIORITIES as [Priority, ...Priority[]]),
  status: z.enum(STATUSES as [Status, ...Status[]]),
  due_date: z.string().optional().or(z.literal("")),
  created_at: z.string().optional().or(z.literal("")),
  assigned_to: z.string().uuid().optional().or(z.literal("")),
  output_type_id: z.string().uuid().optional().or(z.literal("")),
  writer_id: z.string().uuid().optional().or(z.literal("")),
  output_link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const taskCheckFormSchema = z.object({
  checked_by_writer_id: z.string().uuid("Select who checked this"),
  stage: z.enum(CHECK_STAGES as [CheckStage, ...CheckStage[]]),
  status: z.enum(CHECK_STATUSES as [CheckStatus, ...CheckStatus[]]),
  remarks: z.string().max(2000).optional().or(z.literal("")),
});

export type TaskCheckFormValues = z.infer<typeof taskCheckFormSchema>;
