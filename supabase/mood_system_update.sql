-- =====================================================
-- Daily Faith App - Mood System Update (Handles Existing Objects)
-- =====================================================
-- This script safely updates the mood system without conflicts

-- 1. Create mood_categories table (if not exists)
CREATE TABLE IF NOT EXISTS mood_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  color text NOT NULL,
  icon text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 2. Create moods table (if not exists)
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

-- 3. Create mood_entries table (if not exists)
CREATE TABLE IF NOT EXISTS mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  entry_date date NOT NULL,
  mood_id text REFERENCES moods(id) ON DELETE CASCADE,
  mood_type text,
  intensity_rating integer NOT NULL CHECK (intensity_rating >= 1 AND intensity_rating <= 10),
  emoji text NOT NULL,
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Create mood_influences table (if not exists)
CREATE TABLE IF NOT EXISTS mood_influences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mood_entry_id uuid REFERENCES mood_entries(id) ON DELETE CASCADE,
  influence_name text NOT NULL,
  influence_category text NOT NULL CHECK (influence_category IN ('spiritual', 'social', 'physical', 'emotional', 'environmental', 'work', 'other')),
  created_at timestamptz DEFAULT now()
);

-- 5. Create indexes (if not exists)
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_entry_date ON mood_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_mood_entries_created_at ON mood_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_date ON mood_entries(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_mood_influences_entry_id ON mood_influences(mood_entry_id);
CREATE INDEX IF NOT EXISTS idx_moods_category_id ON moods(category_id);
CREATE INDEX IF NOT EXISTS idx_moods_active ON moods(is_active) WHERE is_active = true;

-- 6. Insert mood categories (only if they don't exist)
INSERT INTO mood_categories (name, display_name, color, icon, sort_order) VALUES
  ('positive', 'Positive', '#10B981', 'heart', 1),
  ('calm', 'Calm', '#06B6D4', 'sun', 2),
  ('energetic', 'Energetic', '#3B82F6', 'zap', 3),
  ('challenging', 'Challenging', '#6B7280', 'cloud', 4),
  ('curious', 'Curious', '#14B8A6', 'search', 5),
  ('spiritual', 'Spiritual', '#8B5CF6', 'star', 6),
  ('health', 'Health', '#22C55E', 'activity', 7)
ON CONFLICT (name) DO NOTHING;

-- 7. Insert positive moods (only if they don't exist)
INSERT INTO moods (id, category_id, name, label, emoji, description, color_gradient, sort_order) VALUES
  ('positive_001_blessed', (SELECT id FROM mood_categories WHERE name = 'positive'), 'Blessed', '🙏 Blessed', '🙏', 'Feeling blessed and grateful', ARRAY['#FFD700', '#FFA500', '#FF8C00'], 1),
  ('positive_002_happy', (SELECT id FROM mood_categories WHERE name = 'positive'), 'Happy', '😊 Happy', '😊', 'Feeling happy and content', ARRAY['#10B981', '#059669', '#047857'], 2),
  ('positive_003_joyful', (SELECT id FROM mood_categories WHERE name = 'positive'), 'Joyful', '😄 Joyful', '😄', 'Feeling joyful and excited', ARRAY['#22C55E', '#16A34A', '#15803D'], 3),
  ('positive_004_grateful', (SELECT id FROM mood_categories WHERE name = 'positive'), 'Grateful', '🙏 Grateful', '🙏', 'Feeling grateful and thankful', ARRAY['#84CC16', '#65A30D', '#4D7C0F'], 4),
  ('positive_005_excited', (SELECT id FROM mood_categories WHERE name = 'positive'), 'Excited', '🤩 Excited', '🤩', 'Feeling excited and enthusiastic', ARRAY['#F59E0B', '#D97706', '#B45309'], 5),
  ('positive_006_loved', (SELECT id FROM mood_categories WHERE name = 'positive'), 'Loved', '💕 Loved', '💕', 'Feeling loved and cherished', ARRAY['#EC4899', '#DB2777', '#BE185D'], 6),
  ('positive_007_proud', (SELECT id FROM mood_categories WHERE name = 'positive'), 'Proud', '🏆 Proud', '🏆', 'Feeling proud and accomplished', ARRAY['#10B981', '#059669', '#047857'], 7)
ON CONFLICT (id) DO NOTHING;

-- 8. Insert calm moods (only if they don't exist)
INSERT INTO moods (id, category_id, name, label, emoji, description, color_gradient, sort_order) VALUES
  ('calm_001_peaceful', (SELECT id FROM mood_categories WHERE name = 'calm'), 'Peaceful', '😇 Peaceful', '😇', 'Feeling peaceful and serene', ARRAY['#06B6D4', '#0891B2', '#0E7490'], 1),
  ('calm_002_calm', (SELECT id FROM mood_categories WHERE name = 'calm'), 'Calm', '😌 Calm', '😌', 'Feeling calm and relaxed', ARRAY['#3B82F6', '#2563EB', '#1D4ED8'], 2),
  ('calm_003_content', (SELECT id FROM mood_categories WHERE name = 'calm'), 'Content', '😊 Content', '😊', 'Feeling content and satisfied', ARRAY['#8B5CF6', '#7C3AED', '#6D28D9'], 3),
  ('calm_004_prayerful', (SELECT id FROM mood_categories WHERE name = 'calm'), 'Prayerful', '🙏 Prayerful', '🙏', 'Feeling prayerful and spiritual', ARRAY['#8B5CF6', '#7C3AED', '#6D28D9'], 4)
ON CONFLICT (id) DO NOTHING;

-- 9. Insert energetic moods (only if they don't exist)
INSERT INTO moods (id, category_id, name, label, emoji, description, color_gradient, sort_order) VALUES
  ('energetic_001_motivated', (SELECT id FROM mood_categories WHERE name = 'energetic'), 'Motivated', '💪 Motivated', '💪', 'Feeling motivated and driven', ARRAY['#10B981', '#059669', '#047857'], 1),
  ('energetic_002_focused', (SELECT id FROM mood_categories WHERE name = 'energetic'), 'Focused', '🎯 Focused', '🎯', 'Feeling focused and determined', ARRAY['#3B82F6', '#2563EB', '#1D4ED8'], 2),
  ('energetic_003_creative', (SELECT id FROM mood_categories WHERE name = 'energetic'), 'Creative', '🎨 Creative', '🎨', 'Feeling creative and inspired', ARRAY['#8B5CF6', '#7C3AED', '#6D28D9'], 3),
  ('energetic_004_inspired', (SELECT id FROM mood_categories WHERE name = 'energetic'), 'Inspired', '✨ Inspired', '✨', 'Feeling inspired and energized', ARRAY['#EC4899', '#DB2777', '#BE185D'], 4),
  ('energetic_005_accomplished', (SELECT id FROM mood_categories WHERE name = 'energetic'), 'Accomplished', '🎉 Accomplished', '🎉', 'Feeling accomplished and successful', ARRAY['#22C55E', '#16A34A', '#15803D'], 5)
ON CONFLICT (id) DO NOTHING;

-- 10. Insert challenging moods (only if they don't exist)
INSERT INTO moods (id, category_id, name, label, emoji, description, color_gradient, sort_order) VALUES
  ('challenging_001_sad', (SELECT id FROM mood_categories WHERE name = 'challenging'), 'Sad', '😢 Sad', '😢', 'Feeling sad and down', ARRAY['#6B7280', '#4B5563', '#374151'], 1),
  ('challenging_002_worried', (SELECT id FROM mood_categories WHERE name = 'challenging'), 'Worried', '😟 Worried', '😟', 'Feeling worried and anxious', ARRAY['#F59E0B', '#D97706', '#B45309'], 2),
  ('challenging_003_stressed', (SELECT id FROM mood_categories WHERE name = 'challenging'), 'Stressed', '😤 Stressed', '😤', 'Feeling stressed and overwhelmed', ARRAY['#DC2626', '#B91C1C', '#991B1B'], 3),
  ('challenging_004_anxious', (SELECT id FROM mood_categories WHERE name = 'challenging'), 'Anxious', '😰 Anxious', '😰', 'Feeling anxious and nervous', ARRAY['#8B5CF6', '#7C3AED', '#6D28D9'], 4),
  ('challenging_005_frustrated', (SELECT id FROM mood_categories WHERE name = 'challenging'), 'Frustrated', '😠 Frustrated', '😠', 'Feeling frustrated and irritated', ARRAY['#EF4444', '#DC2626', '#B91C1C'], 5),
  ('challenging_006_lonely', (SELECT id FROM mood_categories WHERE name = 'challenging'), 'Lonely', '😔 Lonely', '😔', 'Feeling lonely and isolated', ARRAY['#6B7280', '#4B5563', '#374151'], 6),
  ('challenging_007_overwhelmed', (SELECT id FROM mood_categories WHERE name = 'challenging'), 'Overwhelmed', '😵 Overwhelmed', '😵', 'Feeling overwhelmed and exhausted', ARRAY['#8B5CF6', '#7C3AED', '#6D28D9'], 7),
  ('challenging_008_confused', (SELECT id FROM mood_categories WHERE name = 'challenging'), 'Confused', '😕 Confused', '😕', 'Feeling confused and uncertain', ARRAY['#6B7280', '#4B5563', '#374151'], 8)
ON CONFLICT (id) DO NOTHING;

-- 11. Insert curious moods (only if they don't exist)
INSERT INTO moods (id, category_id, name, label, emoji, description, color_gradient, sort_order) VALUES
  ('curious_001_curious', (SELECT id FROM mood_categories WHERE name = 'curious'), 'Curious', '🤔 Curious', '🤔', 'Feeling curious and inquisitive', ARRAY['#14B8A6', '#0D9488', '#0F766E'], 1),
  ('curious_002_surprised', (SELECT id FROM mood_categories WHERE name = 'curious'), 'Surprised', '😮 Surprised', '😮', 'Feeling surprised and amazed', ARRAY['#F59E0B', '#D97706', '#B45309'], 2),
  ('curious_003_hopeful', (SELECT id FROM mood_categories WHERE name = 'curious'), 'Hopeful', '🌟 Hopeful', '🌟', 'Feeling hopeful and optimistic', ARRAY['#8B5CF6', '#7C3AED', '#6D28D9'], 3)
ON CONFLICT (id) DO NOTHING;

-- 12. Insert spiritual moods (only if they don't exist)
INSERT INTO moods (id, category_id, name, label, emoji, description, color_gradient, sort_order) VALUES
  ('spiritual_001_connected', (SELECT id FROM mood_categories WHERE name = 'spiritual'), 'Connected', '🤝 Connected', '🤝', 'Feeling connected to God and others', ARRAY['#8B5CF6', '#7C3AED', '#6D28D9'], 1),
  ('spiritual_002_faithful', (SELECT id FROM mood_categories WHERE name = 'spiritual'), 'Faithful', '✝️ Faithful', '✝️', 'Feeling faithful and trusting', ARRAY['#8B5CF6', '#7C3AED', '#6D28D9'], 2),
  ('spiritual_003_reflective', (SELECT id FROM mood_categories WHERE name = 'spiritual'), 'Reflective', '🤲 Reflective', '🤲', 'Feeling reflective and contemplative', ARRAY['#8B5CF6', '#7C3AED', '#6D28D9'], 3)
ON CONFLICT (id) DO NOTHING;

-- 13. Insert health moods (only if they don't exist)
INSERT INTO moods (id, category_id, name, label, emoji, description, color_gradient, sort_order) VALUES
  ('health_001_healthy', (SELECT id FROM mood_categories WHERE name = 'health'), 'Healthy', '💚 Healthy', '💚', 'Feeling healthy and energetic', ARRAY['#22C55E', '#16A34A', '#15803D'], 1),
  ('health_002_rested', (SELECT id FROM mood_categories WHERE name = 'health'), 'Rested', '😴 Rested', '😴', 'Feeling rested and refreshed', ARRAY['#06B6D4', '#0891B2', '#0E7490'], 2),
  ('health_003_balanced', (SELECT id FROM mood_categories WHERE name = 'health'), 'Balanced', '⚖️ Balanced', '⚖️', 'Feeling balanced and centered', ARRAY['#8B5CF6', '#7C3AED', '#6D28D9'], 3)
ON CONFLICT (id) DO NOTHING;

-- 14. Create or replace view for mood entries with details
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
  m.name as mood_name,
  m.label as mood_label,
  m.description as mood_description,
  m.color_gradient,
  mc.name as category_name,
  mc.display_name as category_display_name,
  mc.color as category_color
FROM mood_entries me
LEFT JOIN moods m ON me.mood_id = m.id
LEFT JOIN mood_categories mc ON m.category_id = mc.id;

-- 15. Create or replace function to get all active moods
CREATE OR REPLACE FUNCTION get_all_active_moods()
RETURNS TABLE (
  id text,
  name text,
  label text,
  emoji text,
  description text,
  color_gradient text[],
  category_name text,
  category_display_name text,
  category_color text,
  sort_order integer
)
LANGUAGE sql
AS $$
  SELECT 
    m.id,
    m.name,
    m.label,
    m.emoji,
    m.description,
    m.color_gradient,
    mc.name as category_name,
    mc.display_name as category_display_name,
    mc.color as category_color,
    m.sort_order
  FROM moods m
  JOIN mood_categories mc ON m.category_id = mc.id
  WHERE m.is_active = true
  ORDER BY mc.sort_order, m.sort_order;
$$;

-- 16. Enable Row Level Security (RLS) if not already enabled
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_influences ENABLE ROW LEVEL SECURITY;

-- 17. Drop existing policies if they exist and create new ones
DROP POLICY IF EXISTS "Users can view their own mood entries" ON mood_entries;
DROP POLICY IF EXISTS "Users can insert their own mood entries" ON mood_entries;
DROP POLICY IF EXISTS "Users can update their own mood entries" ON mood_entries;
DROP POLICY IF EXISTS "Users can delete their own mood entries" ON mood_entries;

-- Create RLS policies for mood_entries
CREATE POLICY "Users can view their own mood entries" ON mood_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mood entries" ON mood_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood entries" ON mood_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood entries" ON mood_entries
  FOR DELETE USING (auth.uid() = user_id);

-- 18. Drop existing influence policies if they exist and create new ones
DROP POLICY IF EXISTS "Users can view influences for their mood entries" ON mood_influences;
DROP POLICY IF EXISTS "Users can insert influences for their mood entries" ON mood_influences;
DROP POLICY IF EXISTS "Users can update influences for their mood entries" ON mood_influences;
DROP POLICY IF EXISTS "Users can delete influences for their mood entries" ON mood_influences;

-- Create RLS policies for mood_influences
CREATE POLICY "Users can view influences for their mood entries" ON mood_influences
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mood_entries 
      WHERE id = mood_influences.mood_entry_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert influences for their mood entries" ON mood_influences
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM mood_entries 
      WHERE id = mood_influences.mood_entry_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update influences for their mood entries" ON mood_influences
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM mood_entries 
      WHERE id = mood_influences.mood_entry_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete influences for their mood entries" ON mood_influences
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM mood_entries 
      WHERE id = mood_influences.mood_entry_id 
      AND user_id = auth.uid()
    )
  );

-- 19. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 20. Create or replace function for update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 21. Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS update_mood_entries_updated_at ON mood_entries;
CREATE TRIGGER update_mood_entries_updated_at 
  BEFORE UPDATE ON mood_entries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Setup Complete!
-- =====================================================
-- Your Supabase database now has:
-- 1. Complete mood system with categories and moods
-- 2. Proper indexes for performance
-- 3. Row Level Security (RLS) policies
-- 4. Real-time capabilities
-- 5. Helper functions and views
-- =====================================================
