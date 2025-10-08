/*
  # Complete Moods Migration - Fixed Version

  This migration creates the complete mood tracking system:
  1. Creates mood_categories table
  2. Creates moods table with predefined moods
  3. Adds missing columns to mood_entries table
  4. Creates view with proper table references
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

-- First, add all missing columns to mood_entries table
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

  -- Add created_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mood_entries' AND column_name = 'created_at') THEN
    ALTER TABLE mood_entries ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;

  -- Handle the notes/note column issue more robustly
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mood_entries' AND column_name = 'notes') THEN
    -- If notes column exists, rename it to note
    ALTER TABLE mood_entries RENAME COLUMN notes TO note;
  ELSE
    -- If notes column doesn't exist, create note column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mood_entries' AND column_name = 'note') THEN
      ALTER TABLE mood_entries ADD COLUMN note text;
    END IF;
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

-- Drop trigger if it exists, then recreate it
DROP TRIGGER IF EXISTS update_mood_entries_updated_at ON mood_entries;
CREATE TRIGGER update_mood_entries_updated_at
  BEFORE UPDATE ON mood_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can manage own mood entries" ON mood_entries;
CREATE POLICY "Users can manage own mood entries"
  ON mood_entries
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create view for mood entries with mood details (AFTER columns are guaranteed to exist)
-- Use defensive column selection to avoid errors
CREATE OR REPLACE VIEW mood_entries_with_details AS
SELECT
  me.id,
  me.user_id,
  me.entry_date,
  me.mood_id,
  me.mood_type,
  me.intensity_rating,
  me.emoji,
  COALESCE(me.note, '') as note,
  me.created_at,
  me.updated_at,
  COALESCE(m.label, 'Unknown') as mood_label,
  COALESCE(m.name, 'unknown') as mood_name,
  COALESCE(m.emoji, '❓') as mood_emoji,
  COALESCE(m.description, 'Mood not found') as mood_description,
  COALESCE(m.color_gradient, ARRAY['#6B7280', '#4B5563', '#374151']) as mood_colors,
  mc.name as category_name,
  mc.display_name as category_display_name,
  mc.color as category_color
FROM mood_entries me
LEFT JOIN moods m ON me.mood_id = m.id
LEFT JOIN mood_categories mc ON m.category_id = mc.id;

-- Enable RLS on new tables
ALTER TABLE mood_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables
DROP POLICY IF EXISTS "Anyone can read mood categories" ON mood_categories;
CREATE POLICY "Anyone can read mood categories"
  ON mood_categories
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can read active moods" ON moods;
CREATE POLICY "Anyone can read active moods"
  ON moods
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Grant permissions
GRANT SELECT ON mood_categories TO authenticated;
GRANT SELECT ON moods TO authenticated;
GRANT SELECT ON mood_entries_with_details TO authenticated;