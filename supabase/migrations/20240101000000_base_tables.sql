-- Minimal base tables required by early migrations

-- Create mood_entries early so subsequent migrations that alter it can succeed
create table if not exists mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  entry_date date not null
);


