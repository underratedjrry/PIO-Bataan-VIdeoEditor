-- Video Editing PMIS - initial schema, roles, and RLS policies

-- =========================================================================
-- profiles
-- =========================================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null default 'editor' check (role in ('admin', 'editor', 'viewer')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- =========================================================================
-- tasks
-- =========================================================================
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  segment text not null default 'other' check (
    segment in (
      'rough_cut', 'fine_cut', 'color_grading', 'sound_mix',
      'motion_graphics', 'subtitles', 'client_review', 'final_render', 'other'
    )
  ),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'todo' check (
    status in ('todo', 'in_progress', 'in_review', 'done', 'blocked')
  ),
  due_date timestamptz,
  assigned_to uuid references public.profiles (id) on delete set null,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_priority_idx on public.tasks (priority);
create index tasks_segment_idx on public.tasks (segment);
create index tasks_status_idx on public.tasks (status);
create index tasks_due_date_idx on public.tasks (due_date);
create index tasks_assigned_to_idx on public.tasks (assigned_to);

alter table public.tasks enable row level security;

-- =========================================================================
-- task_activity - audit trail powering "updated" emails + AI analysis
-- =========================================================================
create table public.task_activity (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  actor_id uuid not null references public.profiles (id) on delete cascade,
  change_summary text not null,
  created_at timestamptz not null default now()
);

create index task_activity_task_id_idx on public.task_activity (task_id);

alter table public.task_activity enable row level security;

-- =========================================================================
-- notification_log - dedupes due/overdue/assigned/updated emails
-- =========================================================================
create table public.notification_log (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  type text not null check (type in ('due_soon', 'overdue', 'assigned', 'updated')),
  sent_at timestamptz not null default now()
);

create index notification_log_task_type_idx on public.notification_log (task_id, type);

alter table public.notification_log enable row level security;
-- No policies: only the service-role key (used by the cron route) touches this table,
-- and the service role bypasses RLS entirely.

-- =========================================================================
-- insights_cache - last AI-generated performance analysis per user
-- =========================================================================
create table public.insights_cache (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  generated_at timestamptz not null default now(),
  summary jsonb not null,
  narrative text not null
);

alter table public.insights_cache enable row level security;

-- =========================================================================
-- helper functions (security definer to avoid recursive RLS lookups)
-- =========================================================================
create or replace function public.current_role_name()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_role_name() = 'admin';
$$;

-- =========================================================================
-- triggers
-- =========================================================================

-- keep tasks.updated_at current
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

-- block non-admins from changing their own (or anyone else's) role
create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role <> old.role and not public.is_admin() then
    raise exception 'Only admins can change roles';
  end if;
  return new;
end;
$$;

create trigger trg_prevent_role_self_escalation
before update on public.profiles
for each row execute function public.prevent_role_self_escalation();

-- auto-provision a profile on signup; first user in the system becomes admin
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_role text;
begin
  if (select count(*) from public.profiles) = 0 then
    assigned_role := 'admin';
  else
    assigned_role := 'editor';
  end if;

  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    assigned_role
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =========================================================================
-- RLS policies
-- =========================================================================

-- profiles: everyone signed in can read (needed for assignee pickers/names);
-- users may update their own row (name only - role changes blocked by trigger above);
-- admins may update any row.
create policy profiles_select_all
  on public.profiles for select
  to authenticated
  using (true);

create policy profiles_update_own_or_admin
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- tasks: everyone signed in can read all tasks.
-- admin: full write access. editor: can create tasks, and edit/delete tasks
-- they created or are assigned to. viewer: read-only.
create policy tasks_select_all
  on public.tasks for select
  to authenticated
  using (true);

create policy tasks_insert_admin_or_editor
  on public.tasks for insert
  to authenticated
  with check (
    public.current_role_name() in ('admin', 'editor')
    and created_by = auth.uid()
  );

create policy tasks_update_admin_or_owner_editor
  on public.tasks for update
  to authenticated
  using (
    public.is_admin()
    or (
      public.current_role_name() = 'editor'
      and (created_by = auth.uid() or assigned_to = auth.uid())
    )
  )
  with check (
    public.is_admin()
    or (
      public.current_role_name() = 'editor'
      and (created_by = auth.uid() or assigned_to = auth.uid())
    )
  );

create policy tasks_delete_admin_or_owner_editor
  on public.tasks for delete
  to authenticated
  using (
    public.is_admin()
    or (public.current_role_name() = 'editor' and created_by = auth.uid())
  );

-- task_activity: readable by anyone signed in (mirrors tasks visibility);
-- inserts must be attributed to the acting user.
create policy task_activity_select_all
  on public.task_activity for select
  to authenticated
  using (true);

create policy task_activity_insert_self
  on public.task_activity for insert
  to authenticated
  with check (actor_id = auth.uid());

-- insights_cache: users see and manage only their own cached analysis; admins see all.
create policy insights_select_own_or_admin
  on public.insights_cache for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy insights_upsert_own
  on public.insights_cache for insert
  to authenticated
  with check (user_id = auth.uid());

create policy insights_update_own
  on public.insights_cache for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
