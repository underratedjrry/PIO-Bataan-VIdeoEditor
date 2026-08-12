-- "Checked By" now credits a Writer (picked from a dropdown) rather than
-- always being the logged-in user who submitted the entry. Who actually
-- submitted it is still recorded in task_activity (actor_id), so the audit
-- trail isn't lost - this just changes who the check is *attributed to*.
alter table public.task_checks
  drop constraint task_checks_checked_by_fkey,
  drop column checked_by,
  add column checked_by_writer_id uuid not null references public.writers (id);

create index task_checks_checked_by_writer_id_idx
  on public.task_checks (checked_by_writer_id);

-- The insert policy no longer ties to auth.uid() (it credits a writer, not
-- the actor) - admins/editors may still only submit as themselves in the
-- sense that task_activity.actor_id continues to record their identity.
drop policy task_checks_insert_admin_or_editor on public.task_checks;

create policy task_checks_insert_admin_or_editor
  on public.task_checks for insert
  to authenticated
  with check (public.current_role_name() in ('admin', 'editor'));
