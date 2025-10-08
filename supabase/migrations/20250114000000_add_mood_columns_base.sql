-- Ensure required columns exist before data backfills in later migrations
alter table if exists mood_entries add column if not exists mood_type text;
alter table if exists mood_entries add column if not exists emoji text;
alter table if exists mood_entries add column if not exists mood_id text;

