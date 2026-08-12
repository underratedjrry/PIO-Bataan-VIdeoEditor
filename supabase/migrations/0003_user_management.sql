-- Protect task history when an admin deletes a user account: creating a
-- task should not risk cascading its deletion later if the creator's
-- account is removed. Mirrors the existing (safe) behavior of assigned_to.
alter table public.tasks
  drop constraint tasks_created_by_fkey,
  alter column created_by drop not null,
  add constraint tasks_created_by_fkey
    foreign key (created_by) references public.profiles (id) on delete set null;
