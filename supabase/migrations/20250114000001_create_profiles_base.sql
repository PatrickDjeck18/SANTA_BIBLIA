-- Minimal profiles table so earlier migrations that reference it can run
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique
);


