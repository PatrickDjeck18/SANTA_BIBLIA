/*
  # Quick Fix for Notes - Remove Foreign Key Constraint Temporarily
  
  This will allow notes to be created without requiring a profiles table
*/

-- First, let's check if the notes table exists and what constraints it has
SELECT 
  'Notes Table Constraints' as check_type,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'notes' 
  AND tc.constraint_type = 'FOREIGN KEY';

-- Option 1: Drop the foreign key constraint temporarily
ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_user_id_fkey;

-- Option 2: If the above doesn't work, let's check what the constraint is actually called
-- Run this to see all constraints on the notes table
SELECT 
  'All Notes Constraints' as check_type,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'notes';

-- Option 3: Create a simple profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  full_name text,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for profiles
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

CREATE POLICY "profiles_select_policy"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_policy"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_policy"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON profiles TO authenticated;

-- Test: Try to create a profile for the current user
DO $$
DECLARE
    current_user_id uuid;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NOT NULL THEN
        -- Insert profile if it doesn't exist
        INSERT INTO profiles (user_id, full_name, email) 
        VALUES (current_user_id, 'User', 'user@example.com')
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE NOTICE '✅ Profile created/verified for user: %', current_user_id;
    ELSE
        RAISE NOTICE '❌ No authenticated user found';
    END IF;
END $$;

-- Show the results
SELECT 
  'Setup Complete' as status,
  (SELECT COUNT(*) FROM profiles) as profiles_count,
  (SELECT COUNT(*) FROM notes) as notes_count;
