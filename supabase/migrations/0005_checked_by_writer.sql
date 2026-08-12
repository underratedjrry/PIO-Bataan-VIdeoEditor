-- "Checked By" now credits a Writer (picked from a dropdown) rather than
-- always being the logged-in user who submitted the entry. Who actually
-- submitted it is still recorded in task_activity (actor_id), so the audit
-- trail isn't lost - this just changes who the check is *attributed to*.
--
-- Written to be safely re-runnable in case an earlier attempt partially
-- applied before failing.

drop policy if exists task_checks_insert_admin_or_editor on public.task_checks;

-- Existing rows (if any, from testing) have no writer to backfill to -
-- there's no meaningful mapping from the old profiles-based checked_by to
-- a writer, so clear them before adding the new NOT NULL column.
delete from public.task_checks;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'task_checks' and column_name = 'checked_by'
  ) then
    alter table public.task_checks drop constraint if exists task_checks_checked_by_fkey;
    alter table public.task_checks drop column checked_by;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'task_checks' and column_name = 'checked_by_writer_id'
  ) then
    alter table public.task_checks
      add column checked_by_writer_id uuid not null references public.writers (id);
  end if;
end $$;

create index if not exists task_checks_checked_by_writer_id_idx
  on public.task_checks (checked_by_writer_id);

-- The insert policy no longer ties to auth.uid() (it credits a writer, not
-- the actor) - admins/editors may still only submit as themselves in the
-- sense that task_activity.actor_id continues to record their identity.
drop policy if exists task_checks_insert_admin_or_editor on public.task_checks;
create policy task_checks_insert_admin_or_editor
  on public.task_checks for insert
  to authenticated
  with check (public.current_role_name() in ('admin', 'editor'));
