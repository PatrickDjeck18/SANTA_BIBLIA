-- Complete Bible Quiz System Migration
-- Creates tables for storing quiz questions, sessions, and user statistics

-- Create quiz_questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT,
    option_d TEXT,
    correct_answer TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Bible',
    difficulty TEXT NOT NULL DEFAULT 'Easy',
    bible_reference TEXT,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_sessions table (for tracking individual quiz attempts)
CREATE TABLE IF NOT EXISTS quiz_sessions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    questions_answered INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    wrong_answers INTEGER NOT NULL DEFAULT 0,
    total_score INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL DEFAULT 'Bible',
    difficulty TEXT NOT NULL DEFAULT 'mixed',
    time_taken_seconds INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_quiz_stats table (for tracking user progress)
CREATE TABLE IF NOT EXISTS user_quiz_stats (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    total_questions_answered INTEGER NOT NULL DEFAULT 0,
    total_correct_answers INTEGER NOT NULL DEFAULT 0,
    best_score INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    favorite_category TEXT NOT NULL DEFAULT 'Bible',
    total_time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_questions_category ON quiz_questions(category);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON quiz_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_completed_at ON quiz_sessions(completed_at);
CREATE INDEX IF NOT EXISTS idx_user_quiz_stats_user_id ON user_quiz_stats(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_quiz_stats table
CREATE TRIGGER update_user_quiz_stats_updated_at 
    BEFORE UPDATE ON user_quiz_stats 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for quiz_questions (public read, admin write)
CREATE POLICY "Anyone can view quiz questions" ON quiz_questions
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert quiz questions" ON quiz_questions
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update quiz questions" ON quiz_questions
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Create RLS policies for quiz_sessions
CREATE POLICY "Users can view their own quiz sessions" ON quiz_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz sessions" ON quiz_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_quiz_stats
CREATE POLICY "Users can view their own quiz stats" ON user_quiz_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz stats" ON user_quiz_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz stats" ON user_quiz_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- Insert sample Bible quiz questions
INSERT INTO quiz_questions (question_text, option_a, option_b, option_c, option_d, correct_answer, category, difficulty, bible_reference, explanation) VALUES
('Who was the first man created by God?', 'Adam', 'Noah', 'Abraham', 'Moses', 'Adam', 'Bible', 'Easy', 'Genesis 2:7', 'Adam was the first man created by God from the dust of the ground.'),
('How many days did God take to create the world?', '6 days', '7 days', '40 days', '1 day', '6 days', 'Bible', 'Easy', 'Genesis 1:31', 'God created the world in 6 days and rested on the 7th day.'),
('Who built the ark?', 'Noah', 'Moses', 'David', 'Solomon', 'Noah', 'Bible', 'Easy', 'Genesis 6:14', 'Noah built the ark according to God''s instructions to save his family and the animals from the flood.'),
('What was the name of the garden where Adam and Eve lived?', 'Garden of Eden', 'Garden of Gethsemane', 'Garden of Babylon', 'Garden of Paradise', 'Garden of Eden', 'Bible', 'Easy', 'Genesis 2:8', 'The Garden of Eden was the paradise where God placed Adam and Eve.'),
('Who was thrown into the lions'' den?', 'Daniel', 'David', 'Joseph', 'Samuel', 'Daniel', 'Bible', 'Medium', 'Daniel 6:16', 'Daniel was thrown into the lions'' den for praying to God despite the king''s decree.');

-- Insert sample quiz sessions (replace user_id with actual user IDs from your Firebase data)
-- INSERT INTO quiz_sessions (user_id, questions_answered, correct_answers, wrong_answers, total_score, category, difficulty, time_taken_seconds, completed_at) VALUES
-- ('user_uuid_here', 10, 8, 2, 80, 'Bible', 'Easy', 120, NOW());

-- Insert sample user quiz stats (replace user_id with actual user IDs from your Firebase data)
-- INSERT INTO user_quiz_stats (user_id, total_sessions, total_questions_answered, total_correct_answers, best_score, current_streak, longest_streak, favorite_category, total_time_spent_seconds) VALUES
-- ('user_uuid_here', 5, 50, 40, 90, 3, 5, 'Bible', 600);

-- TODO: Add your Firebase migration data here:
-- 1. Export your Firebase quiz questions and convert to INSERT statements for quiz_questions table
-- 2. Export your Firebase quiz sessions and convert to INSERT statements for quiz_sessions table
-- 3. Export your Firebase user statistics and convert to INSERT statements for user_quiz_stats table
-- 4. Update the user_id values to match your Supabase auth.users table