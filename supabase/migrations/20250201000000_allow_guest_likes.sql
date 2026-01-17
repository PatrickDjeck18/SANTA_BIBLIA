-- Allow guest users to like verses by adding session_id support
ALTER TABLE daily_verse_likes 
ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE daily_verse_likes 
ADD COLUMN IF NOT EXISTS session_id text;

-- Drop constraint if it exists, then recreate it
ALTER TABLE daily_verse_likes 
DROP CONSTRAINT IF EXISTS check_user_or_session;

-- Add constraint to ensure either user_id or session_id is present
ALTER TABLE daily_verse_likes 
ADD CONSTRAINT check_user_or_session 
CHECK ((user_id IS NOT NULL) OR (session_id IS NOT NULL));

-- Drop existing unique index
DROP INDEX IF EXISTS idx_daily_verse_likes_unique;

-- Create new unique index that handles both authenticated and guest users
-- Separate indexes for better type safety
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_verse_likes_unique 
ON daily_verse_likes(
  COALESCE(user_id::text, session_id), 
  verse_reference, 
  like_date
);

-- Add index for session-based queries
CREATE INDEX IF NOT EXISTS idx_daily_verse_likes_session 
ON daily_verse_likes(session_id, like_date DESC);

-- Update RLS policies to allow both authenticated and anonymous users
DROP POLICY IF EXISTS "Users can insert their own likes" ON daily_verse_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON daily_verse_likes;
DROP POLICY IF EXISTS "Authenticated users can insert their own likes" ON daily_verse_likes;
DROP POLICY IF EXISTS "Anonymous users can insert likes" ON daily_verse_likes;
DROP POLICY IF EXISTS "Authenticated users can delete their own likes" ON daily_verse_likes;
DROP POLICY IF EXISTS "Anonymous users can delete their likes" ON daily_verse_likes;

-- Allow both authenticated users and anonymous users to insert likes
-- Split into two separate policies for clarity
CREATE POLICY "Authenticated users can insert their own likes" ON daily_verse_likes
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow anonymous users to insert likes with session_id
-- Note: We can't check the specific session_id in the WITH CHECK clause
-- The client is trusted to pass the correct session_id
CREATE POLICY "Anonymous users can insert likes" ON daily_verse_likes
FOR INSERT 
TO anon
WITH CHECK (session_id IS NOT NULL AND user_id IS NULL);

-- Allow authenticated users to delete their own likes
CREATE POLICY "Authenticated users can delete their own likes" ON daily_verse_likes
FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- Allow anonymous users to delete their own likes by session_id
-- Note: RLS cannot verify the session_id matches what's in the DELETE query
-- The client's DELETE query with .eq('session_id', value) will filter correctly
CREATE POLICY "Anonymous users can delete their likes" ON daily_verse_likes
FOR DELETE 
TO anon
USING (user_id IS NULL AND session_id IS NOT NULL);

