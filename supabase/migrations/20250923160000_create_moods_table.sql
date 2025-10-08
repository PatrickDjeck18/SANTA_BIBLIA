/*
  # Create Comprehensive Moods System

  This migration creates a moods table that provides:
  1. Predefined mood options with unique IDs
  2. Mood categories for organization
  3. Emoji representations
  4. Color gradients for UI
  5. Proper relationships with mood_entries

  This replaces the simple mood_type enum with a more flexible system.

  IMPORTANT: This migration adds missing columns to existing mood_entries table
  and creates comprehensive mood tracking system.
 */

-- Create mood_categories table
CREATE TABLE IF NOT EXISTS mood_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  color text NOT NULL,
  icon text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create moods table
CREATE TABLE IF NOT EXISTS moods (
  id text PRIMARY KEY,
  category_id uuid REFERENCES mood_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  label text NOT NULL,
  emoji text NOT NULL,
  description text,
  color_gradient text[] NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_moods_category_id ON moods(category_id);
CREATE INDEX IF NOT EXISTS idx_moods_active ON moods(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_moods_category_active ON moods(category_id, is_active) WHERE is_active = true;

-- Insert mood categories
INSERT INTO mood_categories (name, display_name, color, icon, sort_order) VALUES
  ('positive', 'Positive', '#10B981', 'heart', 1),
  ('calm', 'Calm', '#06B6D4', 'sun', 2),
  ('energetic', 'Energetic', '#3B82F6', 'zap', 3),
  ('challenging', 'Challenging', '#6B7280', 'cloud', 4),
  ('curious', 'Curious', '#14B8A6', 'search', 5),
  ('spiritual', 'Spiritual', '#8B5CF6', 'star', 6),
  ('health', 'Health', '#22C55E', 'activity', 7)
ON CONFLICT (name) DO NOTHING;

-- Insert positive moods
INSERT INTO moods (id, category_id, name, label, emoji, description, color_gradient, sort_order) VALUES
  ('positive_001_blessed', (SELECT id FROM mood_categories WHERE name = 'positive'), 'blessed', '🙏 Blessed', '🙏', 'Feeling spiritually blessed and grateful', ARRAY['#FFD700', '#FFA500', '#FF8C00'], 1),
  ('positive_002_happy', (SELECT id FROM mood_categories WHERE name = 'positive'), 'happy', '😊 Happy', '😊', 'Feeling joyful and content', ARRAY['#10B981', '#059669', '#047857'], 2),
  ('positive_003_joyful', (SELECT id FROM mood_categories WHERE name = 'positive'), 'joyful', '😄 Joyful', '😄', 'Experiencing pure joy and happiness', ARRAY['#22C55E', '#16A34A', '#15803D'], 3),
  ('positive_004_grateful', (SELECT id FROM mood_categories WHERE name = 'positive'), 'grateful', '🙏 Grateful', '🙏', 'Feeling thankful and appreciative', ARRAY['#84CC16', '#65A30D', '#4D7C0F'], 4),
  ('positive_005_excited', (SELECT id FROM mood_categories WHERE name = 'positive'), 'excited', '🤩 Excited', '🤩', 'Feeling enthusiastic and energetic', ARRAY['#F59E0B', '#D97706', '#B45309'], 5),
  ('positive_006_loved', (SELECT id FROM mood_categories WHERE name = 'positive'), 'loved', '💕 Loved', '💕', 'Feeling loved and cherished', ARRAY['#EC4899', '#DB2777', '#BE185D'], 6),
  ('positive_007_proud', (SELECT id FROM mood_categories WHERE name = 'positive'), 'proud', '🏆 Proud', '🏆', 'Feeling accomplished and proud', ARRAY['#10B981', '#059669', '#047857'], 7)
ON CONFLICT (id) DO NOTHING;

-- Insert calm moods
INSERT INTO moods (id, category_id, name, label, emoji, description, color_gradient, sort_order) VALUES
  ('calm_001_peaceful', (SELECT id FROM mood_categories WHERE name = 'calm'), 'peaceful', '😇 Peaceful', '😇', 'Feeling at peace with yourself', ARRAY['#06B6D4', '#0891B2', '#0E7490'], 1),
  ('calm_002_calm', (SELECT id FROM mood_categories WHERE name = 'calm'), 'calm', '😌 Calm', '😌', 'Feeling relaxed and composed', ARRAY['#3B82F6', '#2563EB', '#1D4ED8'], 2),
  ('calm_003_content', (SELECT id FROM mood_categories WHERE name = 'calm'), 'content', '😊 Content', '😊', 'Feeling satisfied and at ease', ARRAY['#8B5CF6', '#7C3AED', '#6D28D9'], 3),
  ('calm_004_prayerful', (SELECT id FROM mood_categories WHERE name = 'calm'), 'prayerful', '🙏 Prayerful', '🙏', 'Feeling connected through prayer', ARRAY['#8B5CF6', '#7C3AED', '#6D28D9'], 4)
ON CONFLICT (id) DO NOTHING;

-- Insert energetic moods
INSERT INTO moods (id, category_id, name, label, emoji, description, color_gradient, sort_order) VALUES
  ('energetic_001_motivated', (SELECT id FROM mood_categories WHERE name = 'energetic'), 'motivated', '💪 Motivated', '💪', 'Feeling driven and purposeful', ARRAY['#10B981', '#059669', '#047857'], 1),
  ('energetic_002_focused', (SELECT id FROM mood_categories WHERE name = 'energetic'), 'focused', '🎯 Focused', '🎯', 'Feeling concentrated and determined', ARRAY['#3B82F6', '#2563EB', '#1D4ED8'], 2),
  ('energetic_003_creative', (SELECT id FROM mood_categories WHERE name = 'energetic'), 'creative', '🎨 Creative', '🎨', 'Feeling inspired and artistic', ARRAY['#8B5CF6', '#7C3AED', '#6D28D9'], 3),
  ('energetic_004_inspired', (SELECT id FROM mood_categories WHERE name = 'energetic'), 'inspired', '✨ Inspired', '✨', 'Feeling motivated by divine inspiration', ARRAY['#EC4899', '#DB2777', '#BE185D'], 4),
  ('energetic_005_accomplished', (SELECT id FROM mood_categories WHERE name = 'energetic'), 'accomplished', '🎉 Accomplished', '🎉', 'Feeling successful and fulfilled', ARRAY['#22C55E', '#16A34A', '#15803D'], 5)
ON CONFLICT (id) DO NOTHING;

-- Insert challenging moods
INSERT INTO moods (id, category_id, name, label, emoji, description, color_gradient, sort_order) VALUES
  ('challenging_001_sad', (SELECT id FROM mood_categories WHERE name = 'challenging'), 'sad', '😔 Sad', '😔', 'Feeling down or sorrowful', ARRAY['#6B7280', '#4B5563', '#374151'], 1),
  ('challenging_002_anxious', (SELECT id FROM mood_categories WHERE name = 'challenging'), 'anxious', '😰 Anxious', '😰', 'Feeling worried or nervous', ARRAY['#8B5CF6', '#7C3AED', '#6D28D9'], 2),
  ('challenging_003_stressed', (SELECT id FROM mood_categories WHERE name = 'challenging'), 'stressed', '😓 Stressed', '😓', 'Feeling overwhelmed or pressured', ARRAY['#EC4899', '#DB2777', '#BE185D'], 3),
  ('challenging_004_angry', (SELECT id FROM mood_categories WHERE name = 'challenging'), 'angry', '😠 Angry', '😠', 'Feeling frustrated or upset', ARRAY['#EF4444', '#DC2626', '#B91C1C'], 4),
  ('challenging_005_frustrated', (SELECT id FROM mood_categories WHERE name = 'challenging'), 'frustrated', '😤 Frustrated', '😤', 'Feeling irritated or annoyed', ARRAY['#F97316', '#EA580C', '#C2410C'], 5),
  ('challenging_006_tired', (SELECT id FROM mood_categories WHERE name = 'challenging'), 'tired', '😴 Tired', '😴', 'Feeling exhausted or fatigued', ARRAY['#A855F7', '#9333EA', '#7C3AED'], 6),
  ('challenging_007_lonely', (SELECT id FROM mood_categories WHERE name = 'challenging'), 'lonely', '🥺 Lonely', '🥺', 'Feeling isolated or alone', ARRAY['#6B7280', '#4B5563', '#374151'], 7),
  ('challenging_008_confused', (SELECT id FROM mood_categories WHERE name = 'challenging'), 'confused', '😕 Confused', '😕', 'Feeling uncertain or puzzled', ARRAY['#F59E0B', '#D97706', '#B45309'], 8)
ON CONFLICT (id) DO NOTHING;

-- Insert curious moods
INSERT INTO moods (id, category_id, name, label, emoji, description, color_gradient, sort_order) VALUES
  ('curious_001_curious', (SELECT id FROM mood_categories WHERE name = 'curious'), 'curious', '🤔 Curious', '🤔', 'Feeling inquisitive and interested', ARRAY['#14B8A6', '#0D9488', '#0F766E'], 1),
  ('curious_002_surprised', (SELECT id FROM mood_categories WHERE name = 'curious'), 'surprised', '😲 Surprised', '😲', 'Feeling amazed or astonished', ARRAY['#FBBF24', '#F59E0B', '#D97706'], 2),
  ('curious_003_hopeful', (SELECT id FROM mood_categories WHERE name = 'curious'), 'hopeful', '🌟 Hopeful', '🌟', 'Feeling optimistic about the future', ARRAY['#FBBF24', '#F59E0B', '#D97706'], 3)
ON CONFLICT (id) DO NOTHING;

-- Insert spiritual moods
INSERT INTO moods (id, category_id, name, label, emoji, description, color_gradient, sort_order) VALUES
  ('spiritual_001_inspired', (SELECT id FROM mood_categories WHERE name = 'spiritual'), 'inspired', '✨ Inspired', '✨', 'Feeling divinely inspired', ARRAY['#A78BFA', '#8B5CF6', '#7C3AED'], 1),
  ('spiritual_002_connected', (SELECT id FROM mood_categories WHERE name = 'spiritual'), 'connected', '🔗 Connected', '🔗', 'Feeling spiritually connected', ARRAY['#6EE7B7', '#34D399', '#10B981'], 2),
  ('spiritual_003_faithful', (SELECT id FROM mood_categories WHERE name = 'spiritual'), 'faithful', '✝️ Faithful', '✝️', 'Feeling strong in faith', ARRAY['#F472B6', '#EC4899', '#DB2777'], 3)
ON CONFLICT (id) DO NOTHING;

-- Insert health moods
INSERT INTO moods (id, category_id, name, label, emoji, description, color_gradient, sort_order) VALUES
  ('health_001_healthy', (SELECT id FROM mood_categories WHERE name = 'health'), 'healthy', '🍎 Healthy', '🍎', 'Feeling physically healthy', ARRAY['#6EE7B7', '#34D399', '#10B981'], 1),
  ('health_002_rested', (SELECT id FROM mood_categories WHERE name = 'health'), 'rested', '😴 Rested', '😴', 'Feeling well-rested and energized', ARRAY['#A78BFA', '#8B5CF6', '#7C3AED'], 2),
  ('health_003_balanced', (SELECT id FROM mood_categories WHERE name = 'health'), 'balanced', '🧘 Balanced', '🧘', 'Feeling balanced and centered', ARRAY['#F472B6', '#EC4899', '#DB2777'], 3)
ON CONFLICT (id) DO NOTHING;

-- Add missing columns to mood_entries table
DO $$
BEGIN
  -- Add user_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mood_entries' AND column_name = 'user_id') THEN
    ALTER TABLE mood_entries ADD COLUMN user_id uuid REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  -- Add entry_date column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mood_entries' AND column_name = 'entry_date') THEN
    ALTER TABLE mood_entries ADD COLUMN entry_date date NOT NULL DEFAULT CURRENT_DATE;
  END IF;

  -- Add mood_type column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mood_entries' AND column_name = 'mood_type') THEN
    ALTER TABLE mood_entries ADD COLUMN mood_type text;
  END IF;

  -- Add intensity_rating column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mood_entries' AND column_name = 'intensity_rating') THEN
    ALTER TABLE mood_entries ADD COLUMN intensity_rating integer CHECK (intensity_rating >= 1 AND intensity_rating <= 10);
  END IF;

  -- Add emoji column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mood_entries' AND column_name = 'emoji') THEN
    ALTER TABLE mood_entries ADD COLUMN emoji text;
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mood_entries' AND column_name = 'updated_at') THEN
    ALTER TABLE mood_entries ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;

  -- Rename notes column to note if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mood_entries' AND column_name = 'notes') THEN
    ALTER TABLE mood_entries RENAME COLUMN notes TO note;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_date ON mood_entries(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_mood_entries_date ON mood_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_mood_entries_mood_id ON mood_entries(mood_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mood_entries_updated_at
  BEFORE UPDATE ON mood_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage own mood entries"
  ON mood_entries
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create view for mood entries with mood details (after columns are added)
CREATE OR REPLACE VIEW mood_entries_with_details AS
SELECT
  me.id,
  me.user_id,
  me.entry_date,
  me.mood_id,
  me.mood_type,
  me.intensity_rating,
  me.emoji,
  me.note,
  me.created_at,
  me.updated_at,
  m.label as mood_label,
  m.name as mood_name,
  m.emoji as mood_emoji,
  m.description as mood_description,
  m.color_gradient as mood_colors,
  mc.name as category_name,
  mc.display_name as category_display_name,
  mc.color as category_color
FROM mood_entries me
LEFT JOIN moods m ON me.mood_id = m.id
LEFT JOIN mood_categories mc ON m.category_id = mc.id;

-- Create function to get mood by name or ID
CREATE OR REPLACE FUNCTION get_mood_by_name_or_id(mood_input text)
RETURNS TABLE(
  id text,
  name text,
  label text,
  emoji text,
  description text,
  color_gradient text[],
  category_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.name,
    m.label,
    m.emoji,
    m.description,
    m.color_gradient,
    mc.name as category_name
  FROM moods m
  LEFT JOIN mood_categories mc ON m.category_id = mc.id
  WHERE m.id = mood_input
    OR m.name = mood_input
    OR m.label = mood_input
    AND m.is_active = true
  ORDER BY m.sort_order
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all active moods
CREATE OR REPLACE FUNCTION get_all_active_moods()
RETURNS TABLE(
  id text,
  name text,
  label text,
  emoji text,
  description text,
  color_gradient text[],
  category_name text,
  category_display_name text,
  category_color text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.name,
    m.label,
    m.emoji,
    m.description,
    m.color_gradient,
    mc.name as category_name,
    mc.display_name as category_display_name,
    mc.color as category_color
  FROM moods m
  JOIN mood_categories mc ON m.category_id = mc.id
  WHERE m.is_active = true
  ORDER BY mc.sort_order, m.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT ON mood_categories TO authenticated;
GRANT SELECT ON moods TO authenticated;
GRANT SELECT ON mood_entries_with_details TO authenticated;
GRANT EXECUTE ON FUNCTION get_mood_by_name_or_id(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_active_moods() TO authenticated;
GRANT EXECUTE ON FUNCTION get_mood_streak(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_weekly_mood_average(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_mood_trends(uuid, integer) TO authenticated;

-- Enable RLS
ALTER TABLE mood_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read mood categories"
  ON mood_categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read active moods"
  ON moods
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create function to get mood streak
CREATE OR REPLACE FUNCTION get_mood_streak(user_uuid uuid)
RETURNS integer AS $$
DECLARE
  streak_count integer := 0;
  current_date date := CURRENT_DATE;
  entry_exists boolean;
BEGIN
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM mood_entries
      WHERE user_id = user_uuid AND entry_date = current_date
    ) INTO entry_exists;

    IF entry_exists THEN
      streak_count := streak_count + 1;
      current_date := current_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;
  END LOOP;

  RETURN streak_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get weekly mood average
CREATE OR REPLACE FUNCTION get_weekly_mood_average(user_uuid uuid)
RETURNS numeric AS $$
DECLARE
  week_start date := CURRENT_DATE - INTERVAL '6 days';
  avg_rating numeric;
BEGIN
  SELECT COALESCE(AVG(intensity_rating), 0)
  INTO avg_rating
  FROM mood_entries
  WHERE user_id = user_uuid
    AND entry_date >= week_start
    AND entry_date <= CURRENT_DATE;

  RETURN ROUND(avg_rating, 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get mood trends
CREATE OR REPLACE FUNCTION get_mood_trends(user_uuid uuid, days_back integer DEFAULT 30)
RETURNS TABLE(
  entry_date date,
  mood_type text,
  intensity_rating integer,
  emoji text,
  mood_label text,
  category_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    me.entry_date,
    me.mood_type,
    me.intensity_rating,
    me.emoji,
    m.label as mood_label,
    mc.name as category_name
  FROM mood_entries me
  LEFT JOIN moods m ON me.mood_id = m.id
  LEFT JOIN mood_categories mc ON m.category_id = mc.id
  WHERE me.user_id = user_uuid
    AND me.entry_date >= CURRENT_DATE - INTERVAL '1 day' * days_back
  ORDER BY me.entry_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample data for testing
-- Note: Replace 'your-user-id' with actual user ID when testing
-- INSERT INTO mood_entries (user_id, entry_date, mood_id, intensity_rating, emoji, note)
-- SELECT
--   'your-user-id',
--   CURRENT_DATE,
--   id,
--   7,
--   emoji,
--   'Sample mood entry'
-- FROM moods
-- WHERE name = 'happy'
-- LIMIT 1;