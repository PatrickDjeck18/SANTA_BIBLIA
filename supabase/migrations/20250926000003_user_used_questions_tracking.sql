-- Migration: Add user_used_questions table for tracking answered questions
-- This prevents question repetition across quiz sessions

-- Create user_used_questions table
CREATE TABLE IF NOT EXISTS user_used_questions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Ensure a user doesn't answer the same question multiple times
    UNIQUE(user_id, question_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_used_questions_user_id ON user_used_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_used_questions_question_id ON user_used_questions(question_id);
CREATE INDEX IF NOT EXISTS idx_user_used_questions_answered_at ON user_used_questions(answered_at DESC);

-- Add RLS policies
ALTER TABLE user_used_questions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own used questions
CREATE POLICY "Users can view their own used questions" ON user_used_questions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own used questions
CREATE POLICY "Users can insert their own used questions" ON user_used_questions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own used questions
CREATE POLICY "Users can delete their own used questions" ON user_used_questions
    FOR DELETE USING (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON TABLE user_used_questions IS 'Tracks which questions each user has already answered to prevent repetition';
COMMENT ON COLUMN user_used_questions.user_id IS 'Reference to the user who answered the question';
COMMENT ON COLUMN user_used_questions.question_id IS 'Reference to the question that was answered';
COMMENT ON COLUMN user_used_questions.answered_at IS 'When the question was answered';