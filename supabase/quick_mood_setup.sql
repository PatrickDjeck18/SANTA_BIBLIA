-- =====================================================
-- Quick Mood System Setup for Supabase
-- =====================================================
-- Run this if you just need the basic tables

-- 1. Create mood_entries table (basic version)
CREATE TABLE IF NOT EXISTS mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  entry_date date NOT NULL,
  mood_id text,
  mood_type text,
  intensity_rating integer NOT NULL CHECK (intensity_rating >= 1 AND intensity_rating <= 10),
  emoji text NOT NULL,
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create basic indexes
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_entry_date ON mood_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_mood_entries_created_at ON mood_entries(created_at);

-- 3. Enable RLS
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
CREATE POLICY "Users can manage their own mood entries" ON mood_entries
  FOR ALL USING (auth.uid() = user_id);

-- 5. Grant permissions
GRANT ALL ON mood_entries TO authenticated;

-- 6. Create update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mood_entries_updated_at 
  BEFORE UPDATE ON mood_entries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
