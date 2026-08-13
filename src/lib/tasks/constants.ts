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

// Admin-assignable badge colors for Output Types and Segments (Settings >
// color swatch picker), so each lookup value can get its own color-coded
// badge wherever a task displays it - not tied to a fixed enum, since both
// are editable lookup tables.
export const LOOKUP_BADGE_CLASSES: Record<string, string> = {
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  red: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  orange: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  green: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  teal: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  cyan: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  purple: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  pink: "bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  rose: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
};

// Solid dot color for the picker UI itself (distinct from the light-fill
// badge classes above, which would barely show as a tiny swatch).
export const LOOKUP_SWATCH_CLASSES: Record<string, string> = {
  slate: "bg-slate-400",
  red: "bg-red-500",
  orange: "bg-orange-500",
  amber: "bg-amber-500",
  green: "bg-green-500",
  teal: "bg-teal-500",
  cyan: "bg-cyan-500",
  blue: "bg-blue-500",
  indigo: "bg-indigo-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  rose: "bg-rose-500",
};

export const LOOKUP_COLORS = Object.keys(LOOKUP_BADGE_CLASSES);
