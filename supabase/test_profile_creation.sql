/*
  # Test Profile Creation Script
  
  Run this to test if profile creation works manually
*/

-- First, let's see what the profiles table looks like
SELECT 
  'Profiles Table Structure' as test_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Check if there are any existing profiles
SELECT 
  'Existing Profiles' as test_type,
  COUNT(*) as profile_count,
  CASE 
    WHEN COUNT(*) = 0 THEN 'ℹ️ No profiles found'
    ELSE '✅ Found ' || COUNT(*)::text || ' profiles'
  END as status
FROM profiles;

-- Check the current authenticated user
SELECT 
  'Current User' as test_type,
  auth.uid() as user_id,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ No authenticated user'
    ELSE '✅ User authenticated: ' || auth.uid()::text
  END as status;

-- Try to create a test profile (this will fail if not authenticated or if there are issues)
DO $$
DECLARE
    current_user_id uuid;
    test_profile_id uuid;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE NOTICE '❌ No authenticated user - cannot test profile creation';
        RETURN;
    END IF;
    
    RAISE NOTICE '👤 Testing profile creation for user: %', current_user_id;
    
    -- Try to insert a test profile
    INSERT INTO profiles (user_id, full_name, email) 
    VALUES (current_user_id, 'Test User', 'test@example.com')
    ON CONFLICT (user_id) DO NOTHING
    RETURNING id INTO test_profile_id;
    
    IF test_profile_id IS NOT NULL THEN
        RAISE NOTICE '✅ Test profile created successfully with ID: %', test_profile_id;
    ELSE
        RAISE NOTICE 'ℹ️ Profile already exists for this user';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error creating test profile: %', SQLERRM;
END $$;

-- Show the profiles after the test
SELECT 
  'Profiles After Test' as test_type,
  id,
  user_id,
  full_name,
  email,
  created_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;
