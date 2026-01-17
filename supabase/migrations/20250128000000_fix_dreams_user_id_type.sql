-- Fix dreams table user_id column to accept TEXT instead of UUID
-- This allows for both Firebase UIDs and guest identifiers

-- First, drop all existing policies that depend on user_id
-- Drop policies with different naming variations that might exist
DROP POLICY IF EXISTS "Users can view their own dreams" ON public.dreams;
DROP POLICY IF EXISTS "Users can insert their own dreams" ON public.dreams;
DROP POLICY IF EXISTS "Users can update their own dreams" ON public.dreams;
DROP POLICY IF EXISTS "Users can delete their own dreams" ON public.dreams;
DROP POLICY IF EXISTS "Users can view only their own dreams" ON public.dreams;
DROP POLICY IF EXISTS "Users can insert only their own dreams" ON public.dreams;
DROP POLICY IF EXISTS "Users can update only their own dreams" ON public.dreams;
DROP POLICY IF EXISTS "Users can delete only their own dreams" ON public.dreams;
DROP POLICY IF EXISTS "Users can select own dreams" ON public.dreams;
DROP POLICY IF EXISTS "Users can insert own dreams" ON public.dreams;
DROP POLICY IF EXISTS "Users can update own dreams" ON public.dreams;
DROP POLICY IF EXISTS "Users can delete own dreams" ON public.dreams;

-- Drop any existing foreign key constraints
ALTER TABLE public.dreams DROP CONSTRAINT IF EXISTS dreams_user_id_fkey;

-- Change the user_id column type from UUID to TEXT
ALTER TABLE public.dreams ALTER COLUMN user_id TYPE TEXT;

-- Create new RLS policies that work with both authenticated users and guests
CREATE POLICY "Users can view their own dreams" ON public.dreams
    FOR SELECT USING (
        user_id = auth.uid()::text OR user_id LIKE 'guest_%'
    );

CREATE POLICY "Users can insert their own dreams" ON public.dreams
    FOR INSERT WITH CHECK (
        user_id = auth.uid()::text OR user_id LIKE 'guest_%'
    );

CREATE POLICY "Users can update their own dreams" ON public.dreams
    FOR UPDATE USING (
        user_id = auth.uid()::text OR user_id LIKE 'guest_%'
    );

CREATE POLICY "Users can delete their own dreams" ON public.dreams
    FOR DELETE USING (
        user_id = auth.uid()::text OR user_id LIKE 'guest_%'
    );

-- Add a comment to clarify the user_id column purpose
COMMENT ON COLUMN public.dreams.user_id IS 'User identifier - can be Firebase UID (for authenticated users) or guest identifier (for guest users)';
