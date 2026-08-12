export type Role = "admin" | "editor" | "viewer";

export type Segment =
  | "rough_cut"
  | "fine_cut"
  | "color_grading"
  | "sound_mix"
  | "motion_graphics"
  | "subtitles"
  | "client_review"
  | "final_render"
  | "other";

export type Priority = "low" | "medium" | "high" | "urgent";

export type Status = "todo" | "in_progress" | "in_review" | "done" | "blocked";

export type NotificationType = "due_soon" | "overdue" | "assigned" | "updated";

export type CheckStage = "draft_checking" | "revision_checking" | "final_approval";

export type CheckStatus = "for_revision" | "approved" | "disapproved";

// Note: these are plain `type` aliases, not `interface`s. Interfaces don't
// get TypeScript's implicit index-signature leniency, so they fail the
// `Record<string, unknown>` structural check that @supabase/postgrest-js's
// `GenericTable` requires for `Row`/`Insert`/`Update` - using `interface`
// here silently collapses every query's inferred type to `never`.
export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  created_at: string;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  segment: Segment;
  priority: Priority;
  status: Status;
  due_date: string | null;
  assigned_to: string | null;
  created_by: string | null;
  output_type_id: string | null;
  writer_id: string | null;
  output_link: string | null;
  created_at: string;
  updated_at: string;
};

export type OutputType = {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
};

export type Writer = {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
};

export type TaskCheck = {
  id: string;
  task_id: string;
  checked_by: string;
  stage: CheckStage;
  status: CheckStatus;
  remarks: string | null;
  created_at: string;
};

export type TaskActivity = {
  id: string;
  task_id: string;
  actor_id: string;
  change_summary: string;
  created_at: string;
};

export type NotificationLogEntry = {
  id: string;
  task_id: string;
  type: NotificationType;
  sent_at: string;
};

export type InsightsCache = {
  user_id: string;
  generated_at: string;
  summary: Record<string, unknown>;
  narrative: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; full_name: string; email: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      tasks: {
        Row: Task;
        Insert: Partial<Task> & { title: string; created_by: string };
        Update: Partial<Task>;
        Relationships: [];
      };
      task_activity: {
        Row: TaskActivity;
        Insert: Partial<TaskActivity> & {
          task_id: string;
          actor_id: string;
          change_summary: string;
        };
        Update: Partial<TaskActivity>;
        Relationships: [];
      };
      notification_log: {
        Row: NotificationLogEntry;
        Insert: Partial<NotificationLogEntry> & {
          task_id: string;
          type: NotificationType;
        };
        Update: Partial<NotificationLogEntry>;
        Relationships: [];
      };
      insights_cache: {
        Row: InsightsCache;
        Insert: InsightsCache;
        Update: Partial<InsightsCache>;
        Relationships: [];
      };
      output_types: {
        Row: OutputType;
        Insert: Partial<OutputType> & { name: string };
        Update: Partial<OutputType>;
        Relationships: [];
      };
      writers: {
        Row: Writer;
        Insert: Partial<Writer> & { name: string };
        Update: Partial<Writer>;
        Relationships: [];
      };
      task_checks: {
        Row: TaskCheck;
        Insert: Partial<TaskCheck> & {
          task_id: string;
          checked_by: string;
          stage: CheckStage;
          status: CheckStatus;
        };
        Update: Partial<TaskCheck>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
