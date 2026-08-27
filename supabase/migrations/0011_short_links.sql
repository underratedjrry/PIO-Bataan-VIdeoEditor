-- Self-hosted link shortener for task share links - no external API. One
-- row per shared task (reused on repeat "Share" clicks), redirected via
-- the public /s/[code] route.
create table if not exists public.short_links (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  target_url text not null,
  task_id uuid references public.tasks (id) on delete cascade,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists short_links_task_id_idx on public.short_links (task_id);

alter table public.short_links enable row level security;

-- No public select policy needed - the /s/[code] redirect route uses the
-- service-role client (bypasses RLS), same pattern as the public share page.
drop policy if exists short_links_insert_own on public.short_links;
create policy short_links_insert_own
  on public.short_links for insert
  to authenticated
  with check (created_by = auth.uid());

drop policy if exists short_links_select_own on public.short_links;
create policy short_links_select_own
  on public.short_links for select
  to authenticated
  using (true);
