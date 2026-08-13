-- Segments: convert the hardcoded enum into an admin-managed lookup table
-- (same pattern as output_types/writers) so segment values can be edited
-- from Settings instead of being fixed at deploy time.

create table if not exists public.segments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.segments enable row level security;

drop policy if exists segments_select_all on public.segments;
create policy segments_select_all
  on public.segments for select
  to authenticated
  using (true);

drop policy if exists segments_admin_write on public.segments;
create policy segments_admin_write
  on public.segments for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into public.segments (name)
values
  ('Rough Cut'), ('Fine Cut'), ('Color Grading'), ('Sound Design / Mix'),
  ('Motion Graphics / VFX'), ('Subtitles / Captions'), ('Client Review'),
  ('Final Render'), ('Other')
on conflict (name) do nothing;

alter table public.tasks
  add column if not exists segment_id uuid references public.segments (id) on delete set null;

-- Backfill existing rows from the old text enum to the matching new lookup
-- row. Guarded + dynamic: if a prior run of this migration already dropped
-- `segment` below, referencing it here would fail to even parse, so this
-- only runs (and only builds the SQL) when the column still exists.
do $migrate$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'tasks' and column_name = 'segment'
  ) then
    execute $sql$
      update public.tasks t
      set segment_id = s.id
      from public.segments s
      where t.segment_id is null
        and s.name = case t.segment
          when 'rough_cut' then 'Rough Cut'
          when 'fine_cut' then 'Fine Cut'
          when 'color_grading' then 'Color Grading'
          when 'sound_mix' then 'Sound Design / Mix'
          when 'motion_graphics' then 'Motion Graphics / VFX'
          when 'subtitles' then 'Subtitles / Captions'
          when 'client_review' then 'Client Review'
          when 'final_render' then 'Final Render'
          else 'Other'
        end
    $sql$;
  end if;
end
$migrate$;

drop index if exists tasks_segment_idx;
create index if not exists tasks_segment_id_idx on public.tasks (segment_id);

alter table public.tasks drop column if exists segment;
