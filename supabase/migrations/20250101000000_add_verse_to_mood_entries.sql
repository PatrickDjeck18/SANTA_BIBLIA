-- Add verse fields to mood_entries table
-- This allows storing scripture verses with mood entries

-- Add verse columns if they don't exist
DO $$ 
BEGIN
  -- Add verse_reference column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mood_entries' AND column_name = 'verse_reference'
  ) THEN
    ALTER TABLE mood_entries ADD COLUMN verse_reference text;
    RAISE NOTICE 'Added verse_reference column to mood_entries';
  END IF;

  -- Add verse_text column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mood_entries' AND column_name = 'verse_text'
  ) THEN
    ALTER TABLE mood_entries ADD COLUMN verse_text text;
    RAISE NOTICE 'Added verse_text column to mood_entries';
  END IF;

  -- Add verse_explanation column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mood_entries' AND column_name = 'verse_explanation'
  ) THEN
    ALTER TABLE mood_entries ADD COLUMN verse_explanation text;
    RAISE NOTICE 'Added verse_explanation column to mood_entries';
  END IF;

  -- Add verse_application column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mood_entries' AND column_name = 'verse_application'
  ) THEN
    ALTER TABLE mood_entries ADD COLUMN verse_application text;
    RAISE NOTICE 'Added verse_application column to mood_entries';
  END IF;

  -- Add verse_mood_alignment column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mood_entries' AND column_name = 'verse_mood_alignment'
  ) THEN
    ALTER TABLE mood_entries ADD COLUMN verse_mood_alignment text;
    RAISE NOTICE 'Added verse_mood_alignment column to mood_entries';
  END IF;
END $$;

-- Create index for verse_reference if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_mood_entries_verse_reference 
ON mood_entries(verse_reference) 
WHERE verse_reference IS NOT NULL;

