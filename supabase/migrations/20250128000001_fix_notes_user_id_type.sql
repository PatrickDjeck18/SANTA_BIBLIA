-- Fix notes table user_id column to accept TEXT instead of UUID
-- This allows for both Firebase UIDs and guest identifiers

-- First, drop all existing policies that depend on user_id
-- Drop policies with different naming variations that might exist
DROP POLICY IF EXISTS "Users can view their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can view only their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can insert only their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update only their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete only their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can select own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON public.notes;
DROP POLICY IF EXISTS "notes_select_policy" ON public.notes;
DROP POLICY IF EXISTS "notes_insert_policy" ON public.notes;
DROP POLICY IF EXISTS "notes_update_policy" ON public.notes;
DROP POLICY IF EXISTS "notes_delete_policy" ON public.notes;

-- Drop any existing foreign key constraints
ALTER TABLE public.notes DROP CONSTRAINT IF EXISTS notes_user_id_fkey;

-- Change the user_id column type from UUID to TEXT
ALTER TABLE public.notes ALTER COLUMN user_id TYPE TEXT;

-- Create new RLS policies that work with both authenticated users and guests
CREATE POLICY "Users can view their own notes" ON public.notes
    FOR SELECT USING (
        user_id = auth.uid()::text OR user_id LIKE 'guest_%'
    );

CREATE POLICY "Users can insert their own notes" ON public.notes
    FOR INSERT WITH CHECK (
        user_id = auth.uid()::text OR user_id LIKE 'guest_%'
    );

CREATE POLICY "Users can update their own notes" ON public.notes
    FOR UPDATE USING (
        user_id = auth.uid()::text OR user_id LIKE 'guest_%'
    );

CREATE POLICY "Users can delete their own notes" ON public.notes
    FOR DELETE USING (
        user_id = auth.uid()::text OR user_id LIKE 'guest_%'
    );

-- Add a comment to clarify the user_id column purpose
COMMENT ON COLUMN public.notes.user_id IS 'User identifier - can be Firebase UID (for authenticated users) or guest identifier (for guest users)';
