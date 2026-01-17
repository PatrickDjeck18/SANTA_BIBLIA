-- Add support for guest prayer sessions in Supabase
-- This allows prayer timer sessions to be saved for both authenticated and guest users

-- Ensure prayers table exists (in case base migrations haven't been run)
create table if not exists prayers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
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

-- Modify prayers table to allow null user_id for guests (if not already done)
ALTER TABLE prayers ALTER COLUMN user_id DROP NOT NULL;

-- Enable RLS if not already enabled
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_prayers_user_created ON prayers(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prayers_guest ON prayers(user_id) WHERE user_id IS NULL;

-- Update RLS policies to allow guest inserts and reads
-- Drop existing policies that require authentication
DROP POLICY IF EXISTS prayers_select_own ON prayers;
DROP POLICY IF EXISTS prayers_insert_self ON prayers;
DROP POLICY IF EXISTS prayers_update_own ON prayers;
DROP POLICY IF EXISTS prayers_delete_own ON prayers;

-- Create new policies that allow guests (null user_id) and authenticated users
CREATE POLICY prayers_select ON prayers
FOR SELECT USING (
  user_id = auth.uid() OR
  (user_id IS NULL AND auth.uid() IS NULL)
);

CREATE POLICY prayers_insert ON prayers
FOR INSERT WITH CHECK (
  user_id = auth.uid() OR
  (user_id IS NULL AND auth.uid() IS NULL)
);

CREATE POLICY prayers_update ON prayers
FOR UPDATE USING (
  user_id = auth.uid() OR
  (user_id IS NULL AND auth.uid() IS NULL)
) WITH CHECK (
  user_id = auth.uid() OR
  (user_id IS NULL AND auth.uid() IS NULL)
);

CREATE POLICY prayers_delete ON prayers
FOR DELETE USING (
  user_id = auth.uid() OR
  (user_id IS NULL AND auth.uid() IS NULL)
);

-- Create index for guest prayers (user_id IS NULL)
CREATE INDEX IF NOT EXISTS idx_prayers_guest ON prayers(user_id) WHERE user_id IS NULL;

-- Optional: Create a function to migrate existing guest prayers from local storage
-- This would be called when a guest user signs up
CREATE OR REPLACE FUNCTION migrate_guest_prayers(new_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  migrated_count INTEGER := 0;
BEGIN
  -- Update all prayers with null user_id to the new authenticated user_id
  UPDATE prayers
  SET user_id = new_user_id
  WHERE user_id IS NULL;

  GET DIAGNOSTICS migrated_count = ROW_COUNT;
  RETURN migrated_count;
END;
$$;