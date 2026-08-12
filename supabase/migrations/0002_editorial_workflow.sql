-- Editorial workflow: Output Type, Writer lookups, and the "Checked By"
-- approval history (Draft Checking / Revision Checking / Final Approval).

-- =========================================================================
-- output_types - admin-managed, customizable deliverable types
-- =========================================================================
create table public.output_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.output_types enable row level security;

create policy output_types_select_all
  on public.output_types for select
  to authenticated
  using (true);

create policy output_types_admin_write
  on public.output_types for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into public.output_types (name) values
  ('AVP'), ('Reels'), ('Infographics'), ('Balitaan sa 1Bataan');

-- =========================================================================
-- writers - admin-managed plain name list (no login required)
-- =========================================================================
create table public.writers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.writers enable row level security;

create policy writers_select_all
  on public.writers for select
  to authenticated
  using (true);

create policy writers_admin_write
  on public.writers for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =========================================================================
-- tasks: link to the new lookups
-- =========================================================================
alter table public.tasks
  add column output_type_id uuid references public.output_types (id) on delete set null,
  add column writer_id uuid references public.writers (id) on delete set null;

create index tasks_output_type_id_idx on public.tasks (output_type_id);
create index tasks_writer_id_idx on public.tasks (writer_id);

-- =========================================================================
-- task_checks - immutable "Checked By" approval history
-- =========================================================================
create table public.task_checks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  checked_by uuid not null references public.profiles (id) on delete cascade,
  stage text not null check (
    stage in ('draft_checking', 'revision_checking', 'final_approval')
  ),
  status text not null check (status in ('for_revision', 'approved', 'disapproved')),
  remarks text,
  created_at timestamptz not null default now()
);

create index task_checks_task_id_idx on public.task_checks (task_id);

alter table public.task_checks enable row level security;

create policy task_checks_select_all
  on public.task_checks for select
  to authenticated
  using (true);

create policy task_checks_insert_admin_or_editor
  on public.task_checks for insert
  to authenticated
  with check (
    public.current_role_name() in ('admin', 'editor')
    and checked_by = auth.uid()
  );
