/*
  # Simple Notes Setup (without prayers dependency)
  
  This creates just the notes table without the prayers foreign key reference.
  Use this if you don't need the prayers integration.
*/

-- Ensure we have the profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create the notes table without prayers reference
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'reflection' CHECK (category IN (
    'reflection', 'prayer', 'study', 'journal', 'insight', 'gratitude', 'other'
  )),
  tags text[] DEFAULT '{}',
  is_private boolean DEFAULT true,
  is_favorite boolean DEFAULT false,
  mood_rating integer CHECK (mood_rating >= 1 AND mood_rating <= 10),
  bible_reference text,
  background_color text DEFAULT '#ffffff' CHECK (
    background_color ~ '^#[0-9A-Fa-f]{6}$' OR 
    background_color ~ '^#[0-9A-Fa-f]{3}$' OR
    background_color IN ('transparent', 'inherit')
  ),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "notes_select_policy" ON notes;
DROP POLICY IF EXISTS "notes_insert_policy" ON notes;
DROP POLICY IF EXISTS "notes_update_policy" ON notes;
DROP POLICY IF EXISTS "notes_delete_policy" ON notes;

-- Create secure RLS policies for notes
CREATE POLICY "notes_select_policy"
  ON notes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "notes_insert_policy"
  ON notes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notes_update_policy"
  ON notes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notes_delete_policy"
  ON notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for profiles table
CREATE POLICY "profiles_select_policy"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_policy"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_policy"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_is_favorite ON notes(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_notes_bible_reference ON notes(bible_reference) WHERE bible_reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notes_background_color ON notes(background_color);

-- Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at timestamp
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at 
  BEFORE UPDATE ON notes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON notes TO authenticated;
GRANT ALL ON profiles TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE notes IS 'User notes for spiritual journaling, reflections, and insights';
COMMENT ON COLUMN notes.category IS 'Type of note: reflection, prayer, study, journal, insight, gratitude, other';
COMMENT ON COLUMN notes.tags IS 'Array of tags for categorizing and searching notes';
COMMENT ON COLUMN notes.is_private IS 'Whether the note is private to the user (future feature for sharing)';
COMMENT ON COLUMN notes.mood_rating IS 'User mood rating from 1-10 when the note was created';
COMMENT ON COLUMN notes.bible_reference IS 'Related Bible verse or passage reference';
COMMENT ON COLUMN notes.background_color IS 'Hex color code for note background (e.g., #ffffff, #ff0000) or special values like transparent';

-- Show the created table structure
SELECT 
  'notes' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'notes' 
ORDER BY ordinal_position;

-- Test the setup
SELECT 
  'Notes setup complete!' as status,
  (SELECT COUNT(*) FROM notes) as notes_count,
  (SELECT COUNT(*) FROM profiles) as profiles_count;
