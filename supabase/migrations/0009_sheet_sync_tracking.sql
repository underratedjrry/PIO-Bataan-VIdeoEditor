-- Tracks the last time a task was synced to the Google Sheet, so a segment
-- change later the same day doesn't create a duplicate row for that day -
-- only the first sync of a given PH calendar day (creation or a segment
-- change) goes through.
alter table public.tasks
  add column if not exists last_sheet_synced_at timestamptz;
