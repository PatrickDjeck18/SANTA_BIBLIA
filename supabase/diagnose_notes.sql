/*
  # Notes System Diagnostic Script
  
  Run this to check if the notes system is properly set up
*/

-- Check if tables exist
SELECT 
  'Tables Check' as check_type,
  table_name,
  CASE 
    WHEN table_name = 'notes' THEN '✅ Notes table exists'
    WHEN table_name = 'profiles' THEN '✅ Profiles table exists'
    ELSE '❌ Missing table'
  END as status
FROM information_schema.tables 
WHERE table_name IN ('notes', 'profiles')
ORDER BY table_name;

-- Check notes table structure
SELECT 
  'Notes Structure' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'notes' 
ORDER BY ordinal_position;

-- Check RLS policies
SELECT 
  'RLS Policies' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'notes'
ORDER BY policyname;

-- Check if RLS is enabled
SELECT 
  'RLS Status' as check_type,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'notes';

-- Test insert (this will fail if RLS is blocking)
-- Note: This will only work if you're authenticated
DO $$
BEGIN
  -- Try to insert a test note (will fail if not authenticated or RLS blocks it)
  INSERT INTO notes (user_id, title, content) 
  VALUES (auth.uid(), 'Test Note', 'This is a test note for diagnostics')
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE '✅ Test insert successful - RLS and authentication working';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Test insert failed: %', SQLERRM;
END $$;

-- Check current user
SELECT 
  'Current User' as check_type,
  auth.uid() as user_id,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ No authenticated user'
    ELSE '✅ User authenticated: ' || auth.uid()::text
  END as status;

-- Show any existing notes (if any)
SELECT 
  'Existing Notes' as check_type,
  COUNT(*) as note_count,
  CASE 
    WHEN COUNT(*) = 0 THEN 'ℹ️ No notes found (this is normal for new setup)'
    ELSE '✅ Found ' || COUNT(*)::text || ' existing notes'
  END as status
FROM notes;
