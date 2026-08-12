-- Proper editing-duration tracking: separate "when did editing actually
-- start" and "when was it actually finished" from created_at/updated_at
-- (which change on any edit, not just these specific transitions).
alter table public.tasks
  add column started_editing_at timestamptz,
  add column completed_at timestamptz;
