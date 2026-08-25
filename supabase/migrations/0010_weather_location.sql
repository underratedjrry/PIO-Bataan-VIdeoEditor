-- Per-user custom location for the Weather dashboard. Nullable - falls
-- back to the app default (Balanga City, Bataan) when unset.
alter table public.profiles
  add column if not exists weather_location_name text,
  add column if not exists weather_location_lat double precision,
  add column if not exists weather_location_lng double precision;
