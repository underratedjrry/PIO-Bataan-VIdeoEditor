import type { Priority, Segment, Status } from "@/types/database";

export const SEGMENT_LABELS: Record<Segment, string> = {
  rough_cut: "Rough Cut",
  fine_cut: "Fine Cut",
  color_grading: "Color Grading",
  sound_mix: "Sound Design / Mix",
  motion_graphics: "Motion Graphics / VFX",
  subtitles: "Subtitles / Captions",
  client_review: "Client Review",
  final_render: "Final Render",
  other: "Other",
};

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
  low: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  medium: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  high: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  urgent: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export const STATUS_BADGE_CLASSES: Record<Status, string> = {
  todo: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  in_progress: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  in_review: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  done: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  blocked: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export const SEGMENTS = Object.keys(SEGMENT_LABELS) as Segment[];
export const PRIORITIES = Object.keys(PRIORITY_LABELS) as Priority[];
export const STATUSES = Object.keys(STATUS_LABELS) as Status[];
