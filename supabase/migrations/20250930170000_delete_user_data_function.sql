-- Function to delete all user data across all tables
-- This function can be called by authenticated users to delete their own data
CREATE OR REPLACE FUNCTION delete_user_data(user_id uuid DEFAULT auth.uid())
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow users to delete their own data
  IF user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: can only delete your own data';
  END IF;

  -- Delete user data from all tables in correct order (respecting foreign keys)

  -- Delete mood influences first (has foreign key to mood_entries)
  DELETE FROM mood_influences WHERE mood_entry_id IN (
    SELECT id FROM mood_entries WHERE user_id = user_id
  );

  -- Delete mood entries
  DELETE FROM mood_entries WHERE user_id = user_id;

  -- Delete daily activities
  DELETE FROM daily_activities WHERE user_id = user_id;

  -- Delete prayers (notes related_prayer_id will be set to null by cascade)
  DELETE FROM prayers WHERE user_id = user_id;

  -- Delete dreams
  DELETE FROM dreams WHERE user_id = user_id;

  -- Delete quiz sessions
  DELETE FROM quiz_sessions WHERE user_id = user_id;

  -- Delete user quiz stats
  DELETE FROM user_quiz_stats WHERE user_id = user_id;

  -- Delete notes
  DELETE FROM notes WHERE user_id = user_id;

  -- Finally delete the profile
  DELETE FROM profiles WHERE user_id = user_id;

  -- Log the deletion for audit purposes
  RAISE NOTICE 'Deleted all data for user: %', user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_data(uuid) TO authenticated;