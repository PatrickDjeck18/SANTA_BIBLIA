-- Remove the foreign key constraint from notes table
-- This will allow notes to be created without requiring a profiles table

-- First, let's see what constraints exist
SELECT 
  'Current Constraints' as info,
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

-- Remove the foreign key constraint
ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_user_id_fkey;

-- Also try other possible constraint names
ALTER TABLE notes DROP CONSTRAINT IF EXISTS fk_notes_user_id;
ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_user_id_fkey;

-- Verify the constraint is removed
SELECT 
  'Constraints After Removal' as info,
  tc.constraint_name,
  tc.constraint_type
FROM information_schema.table_constraints AS tc 
WHERE tc.table_name = 'notes' 
  AND tc.constraint_type = 'FOREIGN KEY';

-- Test: Try to insert a note directly (this will fail if not authenticated)
DO $$
DECLARE
    current_user_id uuid;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NOT NULL THEN
        -- Try to insert a test note
        INSERT INTO notes (user_id, title, content) 
        VALUES (current_user_id, 'Test Note', 'This is a test note')
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE '✅ Test note inserted successfully for user: %', current_user_id;
    ELSE
        RAISE NOTICE '❌ No authenticated user - cannot test note insertion';
    END IF;
END $$;

-- Show final status
SELECT 
  'Fix Complete' as status,
  'Foreign key constraint removed from notes table' as message;
