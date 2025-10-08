/*
  # Complete Notes System Setup for Daily Bread App
  
  This script creates the complete notes system with all dependencies.
  Run this in your Supabase SQL editor to set up the notes functionality.
*/

-- First, ensure we have the profiles table (required for user_id reference)
-- If profiles table doesn't exist, create a basic one
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create a basic prayers table if it doesn't exist (for the foreign key reference)
CREATE TABLE IF NOT EXISTS prayers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'answered', 'paused', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create the notes table
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
  related_prayer_id uuid REFERENCES prayers(id) ON DELETE SET NULL,
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
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "notes_select_policy" ON notes;
DROP POLICY IF EXISTS "notes_insert_policy" ON notes;
DROP POLICY IF EXISTS "notes_update_policy" ON notes;
DROP POLICY IF EXISTS "notes_delete_policy" ON notes;
DROP POLICY IF EXISTS "Users can read own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
DROP POLICY IF EXISTS "Users can update own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON notes;

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

-- Create policies for prayers table
CREATE POLICY "prayers_select_policy"
  ON prayers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "prayers_insert_policy"
  ON prayers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "prayers_update_policy"
  ON prayers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "prayers_delete_policy"
  ON prayers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_is_favorite ON notes(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_notes_bible_reference ON notes(bible_reference) WHERE bible_reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notes_related_prayer ON notes(related_prayer_id) WHERE related_prayer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notes_background_color ON notes(background_color);

-- Create indexes for profiles and prayers
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_prayers_user_id ON prayers(user_id);

-- Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at timestamp on notes
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at 
  BEFORE UPDATE ON notes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for updated_at timestamp on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for updated_at timestamp on prayers
DROP TRIGGER IF EXISTS update_prayers_updated_at ON prayers;
CREATE TRIGGER update_prayers_updated_at 
  BEFORE UPDATE ON prayers 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to search notes by content and title
CREATE OR REPLACE FUNCTION search_notes(
  search_term text,
  user_uuid uuid DEFAULT auth.uid(),
  note_category text DEFAULT NULL,
  favorite_only boolean DEFAULT false
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  category text,
  tags text[],
  is_favorite boolean,
  mood_rating integer,
  bible_reference text,
  background_color text,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.content,
    n.category,
    n.tags,
    n.is_favorite,
    n.mood_rating,
    n.bible_reference,
    n.background_color,
    n.created_at,
    n.updated_at
  FROM notes n
  WHERE n.user_id = user_uuid
    AND (
      n.title ILIKE '%' || search_term || '%' 
      OR n.content ILIKE '%' || search_term || '%'
      OR search_term = ANY(n.tags)
    )
    AND (note_category IS NULL OR n.category = note_category)
    AND (NOT favorite_only OR n.is_favorite = true)
  ORDER BY n.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get notes statistics
CREATE OR REPLACE FUNCTION get_notes_stats(user_uuid uuid DEFAULT auth.uid())
RETURNS TABLE (
  total_notes bigint,
  notes_by_category jsonb,
  favorite_notes bigint,
  notes_with_bible_refs bigint,
  recent_notes_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_notes,
    COALESCE(jsonb_object_agg(category, count), '{}'::jsonb) as notes_by_category,
    COUNT(*) FILTER (WHERE is_favorite = true) as favorite_notes,
    COUNT(*) FILTER (WHERE bible_reference IS NOT NULL) as notes_with_bible_refs,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as recent_notes_count
  FROM (
    SELECT 
      category,
      COUNT(*) as count
    FROM notes 
    WHERE user_id = user_uuid
    GROUP BY category
  ) category_counts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for notes with related prayer information
CREATE OR REPLACE VIEW notes_with_prayers AS
SELECT 
  n.id,
  n.user_id,
  n.title,
  n.content,
  n.category,
  n.tags,
  n.is_private,
  n.is_favorite,
  n.mood_rating,
  n.bible_reference,
  n.background_color,
  n.related_prayer_id,
  p.title as prayer_title,
  p.status as prayer_status,
  n.created_at,
  n.updated_at
FROM notes n
LEFT JOIN prayers p ON n.related_prayer_id = p.id;

-- Grant permissions
GRANT SELECT ON notes_with_prayers TO authenticated;
GRANT ALL ON notes TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON prayers TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE notes IS 'User notes for spiritual journaling, reflections, and insights';
COMMENT ON COLUMN notes.category IS 'Type of note: reflection, prayer, study, journal, insight, gratitude, other';
COMMENT ON COLUMN notes.tags IS 'Array of tags for categorizing and searching notes';
COMMENT ON COLUMN notes.is_private IS 'Whether the note is private to the user (future feature for sharing)';
COMMENT ON COLUMN notes.mood_rating IS 'User mood rating from 1-10 when the note was created';
COMMENT ON COLUMN notes.bible_reference IS 'Related Bible verse or passage reference';
COMMENT ON COLUMN notes.related_prayer_id IS 'Link to a related prayer if applicable';
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

-- Test the setup by showing table counts
SELECT 
  'Setup Complete!' as status,
  (SELECT COUNT(*) FROM notes) as notes_count,
  (SELECT COUNT(*) FROM profiles) as profiles_count,
  (SELECT COUNT(*) FROM prayers) as prayers_count;
