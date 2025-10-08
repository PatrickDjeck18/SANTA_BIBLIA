-- SCHEMA: core tables
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  full_name text,
  email text,
  avatar_url text,
  journey_start_date date not null default (now()::date),
  current_streak int not null default 0,
  total_prayers int not null default 0,
  total_bible_readings int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists daily_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  activity_date date not null,
  bible_reading_minutes int not null default 0,
  prayer_minutes int not null default 0,
  devotional_completed boolean not null default false,
  mood_rating int,
  activities_completed int not null default 0,
  goal_percentage int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  entry_date date not null,
  mood_id text,
  mood_type text not null,
  intensity_rating int not null,
  emoji text not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists mood_influences (
  id uuid primary key default gen_random_uuid(),
  mood_entry_id uuid not null references mood_entries(id) on delete cascade,
  influence_name text not null,
  influence_category text not null,
  created_at timestamptz not null default now()
);

create table if not exists prayers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  description text,
  status text not null check (status in ('active','answered','paused','archived')),
  frequency text not null check (frequency in ('daily','weekly','monthly','custom')),
  category text not null check (category in ('personal','family','health','work','spiritual','community','world','other')),
  priority text not null check (priority in ('low','medium','high','urgent')),
  is_shared boolean not null default false,
  is_community boolean not null default false,
  answered_at timestamptz,
  answered_notes text,
  prayer_notes text,
  gratitude_notes text,
  reminder_time text,
  reminder_frequency text,
  last_prayed_at timestamptz,
  prayer_count int not null default 0,
  answered_prayer_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists dreams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  description text,
  dream_date date not null,
  category text not null,
  emotional_tone text,
  is_lucid boolean not null default false,
  interpretation text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  questions_answered int not null default 0,
  correct_answers int not null default 0,
  wrong_answers int not null default 0,
  total_score int not null default 0,
  category text not null,
  difficulty text not null,
  time_taken_seconds int not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_quiz_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  total_sessions int not null default 0,
  total_questions_answered int not null default 0,
  total_correct_answers int not null default 0,
  best_score int not null default 0,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  favorite_category text,
  total_time_spent_seconds int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- helpful indexes
create index if not exists idx_daily_activities_user_date on daily_activities(user_id, activity_date desc);
create index if not exists idx_mood_entries_user_date on mood_entries(user_id, entry_date desc);
create index if not exists idx_prayers_user on prayers(user_id, created_at desc);
create index if not exists idx_dreams_user_date on dreams(user_id, dream_date desc);
create index if not exists idx_quiz_sessions_user_created on quiz_sessions(user_id, created_at desc);

-- RLS
alter table profiles enable row level security;
alter table daily_activities enable row level security;
alter table mood_entries enable row level security;
alter table mood_influences enable row level security;
alter table prayers enable row level security;
alter table dreams enable row level security;
alter table quiz_sessions enable row level security;
alter table user_quiz_stats enable row level security;

-- Policies (owner-only by user_id)
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'profiles',
    'daily_activities',
    'mood_entries',
    'mood_influences',
    'prayers',
    'dreams',
    'quiz_sessions',
    'user_quiz_stats'
  ]) loop
    execute format($p$
      create policy if not exists %I_select_own on %I
      for select using (user_id = auth.uid());
    $p$, t, t);

    execute format($p$
      create policy if not exists %I_insert_self on %I
      for insert with check (user_id = auth.uid());
    $p$, t, t);

    execute format($p$
      create policy if not exists %I_update_own on %I
      for update using (user_id = auth.uid()) with check (user_id = auth.uid());
    $p$, t, t);

    execute format($p$
      create policy if not exists %I_delete_own on %I
      for delete using (user_id = auth.uid());
    $p$, t, t);
  end loop;
end $$;

-- Create profile row automatically on new auth user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into profiles (user_id, email, full_name, journey_start_date)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email,''),'@',1)), now()::date)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();


