-- Lets admins color-code Output Types and Segments (badge fill color shown
-- wherever a task displays them), for at-a-glance categorization like a
-- typical admin panel's colored badges.

alter table public.output_types add column if not exists color text not null default 'slate';
alter table public.segments add column if not exists color text not null default 'slate';
