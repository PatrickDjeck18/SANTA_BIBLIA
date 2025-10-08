/*
  # Fix Note Column Issue

  This migration specifically addresses the note/notes column issue
  that might be causing the view creation to fail.
 */

-- Ensure the note column exists in mood_entries
DO $$
BEGIN
  -- If notes column exists, rename it to note
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mood_entries' AND column_name = 'notes') THEN
    ALTER TABLE mood_entries RENAME COLUMN notes TO note;
    RAISE NOTICE 'Renamed notes column to note';
  END IF;

  -- If note column doesn't exist, create it
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mood_entries' AND column_name = 'note') THEN
    ALTER TABLE mood_entries ADD COLUMN note text;
    RAISE NOTICE 'Added note column to mood_entries';
  END IF;
END $$;

-- Recreate the view with defensive column handling
CREATE OR REPLACE VIEW mood_entries_with_details AS
SELECT
  me.id,
  me.user_id,
  me.entry_date,
  me.mood_id,
  me.mood_type,
  me.intensity_rating,
  me.emoji,
  COALESCE(me.note, '') as note_column,
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

-- Grant permissions
GRANT SELECT ON mood_entries_with_details TO authenticated;