-- Create daily_verse_likes table
CREATE TABLE IF NOT EXISTS daily_verse_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  verse_reference text NOT NULL,
  verse_text text NOT NULL,
  like_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add unique constraint to prevent multiple likes from same user on same verse-date
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_verse_likes_unique 
ON daily_verse_likes(user_id, verse_reference, like_date);

-- Add index for fetching likes count
CREATE INDEX IF NOT EXISTS idx_daily_verse_likes_reference 
ON daily_verse_likes(verse_reference, like_date);

-- Add index for user queries
CREATE INDEX IF NOT EXISTS idx_daily_verse_likes_user 
ON daily_verse_likes(user_id, like_date DESC);

-- Enable RLS
ALTER TABLE daily_verse_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all likes" ON daily_verse_likes;
DROP POLICY IF EXISTS "Users can insert their own likes" ON daily_verse_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON daily_verse_likes;

-- RLS Policies
CREATE POLICY "Users can view all likes" ON daily_verse_likes
FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes" ON daily_verse_likes
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own likes" ON daily_verse_likes
FOR DELETE USING (user_id = auth.uid());

