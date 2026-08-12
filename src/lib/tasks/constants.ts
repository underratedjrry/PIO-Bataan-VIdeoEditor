import type { CheckStage, CheckStatus, Priority, Status } from "@/types/database";

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const STATUS_LABELS: Record<Status, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
  blocked: "Blocked",
};

export const PRIORITY_BADGE_CLASSES: Record<Priority, string> = {
  low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  medium: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  high: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  urgent: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export const STATUS_BADGE_CLASSES: Record<Status, string> = {
  todo: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  in_progress: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  in_review: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  done: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  blocked: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export const PRIORITIES = Object.keys(PRIORITY_LABELS) as Priority[];
export const STATUSES = Object.keys(STATUS_LABELS) as Status[];

export const CHECK_STAGE_LABELS: Record<CheckStage, string> = {
  draft_checking: "Draft Checking",
  revision_checking: "Revision Checking",
  final_approval: "Final Approval",
};

export const CHECK_STATUS_LABELS: Record<CheckStatus, string> = {
  for_revision: "For Revision",
  approved: "Approved",
  disapproved: "Disapproved",
};

export const CHECK_STATUS_BADGE_CLASSES: Record<CheckStatus, string> = {
  approved: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  disapproved: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  for_revision: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
};

export const CHECK_STAGES = Object.keys(CHECK_STAGE_LABELS) as CheckStage[];
export const CHECK_STATUSES = Object.keys(CHECK_STATUS_LABELS) as CheckStatus[];
