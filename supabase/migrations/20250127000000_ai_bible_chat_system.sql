-- AI Bible Chat System Migration
-- This migration creates the complete AI Bible chat system for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create chat categories table
CREATE TABLE IF NOT EXISTS chat_categories (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    icon_name TEXT,
    color TEXT,
    gradient_colors TEXT[], -- Array of gradient colors
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL, -- Firebase UID or guest identifier
    category_id TEXT NOT NULL REFERENCES chat_categories(id),
    title TEXT NOT NULL,
    preview TEXT, -- First 100 characters of last message
    last_message_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    message_count INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT false,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, -- Firebase UID or guest identifier
    content TEXT NOT NULL,
    is_user BOOLEAN NOT NULL, -- true for user messages, false for AI responses
    message_type TEXT DEFAULT 'text', -- 'text', 'image', 'file', etc.
    metadata JSONB, -- Store additional message metadata
    tokens_used INTEGER, -- For AI responses, track token usage
    response_time_ms INTEGER, -- Response time in milliseconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user chat preferences table
CREATE TABLE IF NOT EXISTS user_chat_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL UNIQUE,
    preferred_categories TEXT[], -- Array of preferred category IDs
    ai_personality TEXT DEFAULT 'balanced', -- 'conservative', 'balanced', 'progressive'
    response_length TEXT DEFAULT 'medium', -- 'short', 'medium', 'long'
    include_scripture_references BOOLEAN DEFAULT true,
    include_prayer_suggestions BOOLEAN DEFAULT true,
    language TEXT DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat analytics table for insights
CREATE TABLE IF NOT EXISTS chat_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    conversation_id UUID REFERENCES ai_conversations(id),
    category_id TEXT REFERENCES chat_categories(id),
    session_duration_seconds INTEGER,
    messages_sent INTEGER DEFAULT 0,
    messages_received INTEGER DEFAULT 0,
    total_tokens_used INTEGER DEFAULT 0,
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    feedback_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default chat categories
INSERT INTO chat_categories (id, title, subtitle, system_prompt, icon_name, color, gradient_colors, sort_order) VALUES
('bible-study', 'Bible Study', 'Scripture insights & interpretation', 
 'You are a knowledgeable Bible study assistant. Help users understand Scripture, provide context, explain difficult passages, and offer practical applications. Always reference specific Bible verses and provide accurate biblical interpretation based on sound hermeneutics.',
 'Book', '#3B82F6', ARRAY['#3B82F6', '#1D4ED8'], 1),

('prayer-life', 'Prayer Life', 'Prayer guidance & support',
 'You are a prayer mentor and spiritual guide. Help users develop their prayer life, understand different types of prayer, overcome prayer challenges, and deepen their relationship with God through prayer. Provide biblical examples and practical guidance.',
 'Heart', '#10B981', ARRAY['#10B981', '#059669'], 2),

('faith-life', 'Faith & Life', 'Living out your faith daily',
 'You are a Christian life coach helping believers apply their faith to daily life. Provide biblical wisdom for life decisions, relationships, work, and personal growth. Help users see how their faith intersects with practical living.',
 'Sparkles', '#8B5CF6', ARRAY['#8B5CF6', '#7C3AED'], 3),

('theology', 'Theology', 'Deep theological discussions',
 'You are a theological scholar with deep knowledge of Christian doctrine, church history, and biblical theology. Help users understand complex theological concepts, answer doctrinal questions, and explore the depths of Christian faith with biblical accuracy.',
 'Cross', '#EF4444', ARRAY['#EF4444', '#DC2626'], 4),

('relationships', 'Relationships', 'Biblical relationship advice',
 'You are a Christian counselor specializing in relationships. Provide biblical guidance for marriage, family, friendships, and community relationships. Help users navigate relationship challenges with wisdom from Scripture.',
 'Users', '#F59E0B', ARRAY['#F59E0B', '#D97706'], 5),

('spiritual-growth', 'Spiritual Growth', 'Growing in your faith journey',
 'You are a spiritual mentor focused on helping believers grow in their faith. Provide guidance on spiritual disciplines, overcoming spiritual obstacles, developing Christian character, and maturing in faith.',
 'Leaf', '#06B6D4', ARRAY['#06B6D4', '#0891B2'], 6),

('life-questions', 'Life Questions', 'Biblical answers to life''s questions',
 'You are a wise biblical counselor who helps people find biblical answers to life''s big questions. Address topics like purpose, suffering, decision-making, and finding God''s will with compassion and biblical truth.',
 'HelpCircle', '#F59E0B', ARRAY['#F59E0B', '#D97706'], 7),

('holy-spirit', 'Holy Spirit', 'Understanding spiritual gifts',
 'You are an expert on the Holy Spirit and spiritual gifts. Help users understand the role of the Holy Spirit, discover and develop their spiritual gifts, and learn to be led by the Spirit in their daily lives.',
 'Sparkles', '#8B5CF6', ARRAY['#8B5CF6', '#7C3AED'], 8),

('service', 'Service', 'Serving God & others',
 'You are a ministry leader who helps believers discover their calling and serve effectively. Provide guidance on finding your ministry, serving in the church, missions, and making a difference in your community for Christ.',
 'Heart', '#10B981', ARRAY['#10B981', '#059669'], 9),

('general-chat', 'General Chat', 'Open faith conversations',
 'You are a friendly Christian companion for open conversations about faith, life, and spiritual matters. Be encouraging, biblically sound, and ready to discuss any topic from a Christian perspective.',
 'Star', '#EC4899', ARRAY['#EC4899', '#DB2777'], 10)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    system_prompt = EXCLUDED.system_prompt,
    icon_name = EXCLUDED.icon_name,
    color = EXCLUDED.color,
    gradient_colors = EXCLUDED.gradient_colors,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_category_id ON ai_conversations(category_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_last_message_time ON ai_conversations(last_message_time DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_user_id ON ai_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON ai_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_messages_is_user ON ai_messages(is_user);

CREATE INDEX IF NOT EXISTS idx_user_chat_preferences_user_id ON user_chat_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_analytics_user_id ON chat_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_analytics_conversation_id ON chat_analytics(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_analytics_category_id ON chat_analytics(category_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_chat_categories_updated_at 
    BEFORE UPDATE ON chat_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at 
    BEFORE UPDATE ON ai_conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_chat_preferences_updated_at 
    BEFORE UPDATE ON user_chat_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update conversation metadata when messages are added
CREATE OR REPLACE FUNCTION update_conversation_metadata()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the conversation's last_message_time and message_count
    UPDATE ai_conversations 
    SET 
        last_message_time = NEW.created_at,
        message_count = (
            SELECT COUNT(*) 
            FROM ai_messages 
            WHERE conversation_id = NEW.conversation_id
        ),
        preview = CASE 
            WHEN LENGTH(NEW.content) > 100 THEN LEFT(NEW.content, 100) || '...'
            ELSE NEW.content
        END,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update conversation metadata
CREATE TRIGGER update_conversation_on_new_message
    AFTER INSERT ON ai_messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_metadata();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_chat_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_conversations
CREATE POLICY "Users can view their own conversations" ON ai_conversations
    FOR SELECT USING (user_id = auth.uid()::text OR user_id LIKE 'guest_%');

CREATE POLICY "Users can insert their own conversations" ON ai_conversations
    FOR INSERT WITH CHECK (user_id = auth.uid()::text OR user_id LIKE 'guest_%');

CREATE POLICY "Users can update their own conversations" ON ai_conversations
    FOR UPDATE USING (user_id = auth.uid()::text OR user_id LIKE 'guest_%');

CREATE POLICY "Users can delete their own conversations" ON ai_conversations
    FOR DELETE USING (user_id = auth.uid()::text OR user_id LIKE 'guest_%');

-- RLS Policies for ai_messages
CREATE POLICY "Users can view messages from their conversations" ON ai_messages
    FOR SELECT USING (
        user_id = auth.uid()::text OR user_id LIKE 'guest_%'
    );

CREATE POLICY "Users can insert messages to their conversations" ON ai_messages
    FOR INSERT WITH CHECK (
        user_id = auth.uid()::text OR user_id LIKE 'guest_%'
    );

CREATE POLICY "Users can update their own messages" ON ai_messages
    FOR UPDATE USING (
        user_id = auth.uid()::text OR user_id LIKE 'guest_%'
    );

CREATE POLICY "Users can delete their own messages" ON ai_messages
    FOR DELETE USING (
        user_id = auth.uid()::text OR user_id LIKE 'guest_%'
    );

-- RLS Policies for user_chat_preferences
CREATE POLICY "Users can view their own preferences" ON user_chat_preferences
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own preferences" ON user_chat_preferences
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own preferences" ON user_chat_preferences
    FOR UPDATE USING (user_id = auth.uid()::text);

-- RLS Policies for chat_analytics
CREATE POLICY "Users can view their own analytics" ON chat_analytics
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own analytics" ON chat_analytics
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Create helper functions for common operations

-- Function to get user's recent conversations
CREATE OR REPLACE FUNCTION get_user_conversations(
    p_user_id TEXT,
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    category_id TEXT,
    title TEXT,
    preview TEXT,
    last_message_time TIMESTAMP WITH TIME ZONE,
    message_count INTEGER,
    is_archived BOOLEAN,
    is_favorite BOOLEAN,
    category_title TEXT,
    category_color TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.category_id,
        c.title,
        c.preview,
        c.last_message_time,
        c.message_count,
        c.is_archived,
        c.is_favorite,
        cat.title as category_title,
        cat.color as category_color
    FROM ai_conversations c
    JOIN chat_categories cat ON c.category_id = cat.id
    WHERE c.user_id = p_user_id
    ORDER BY c.last_message_time DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get conversation messages
CREATE OR REPLACE FUNCTION get_conversation_messages(
    p_conversation_id UUID,
    p_user_id TEXT,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    is_user BOOLEAN,
    message_type TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.content,
        m.is_user,
        m.message_type,
        m.metadata,
        m.created_at
    FROM ai_messages m
    JOIN ai_conversations c ON m.conversation_id = c.id
    WHERE c.id = p_conversation_id 
    AND c.user_id = p_user_id
    ORDER BY m.created_at ASC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a new conversation
CREATE OR REPLACE FUNCTION create_conversation(
    p_user_id TEXT,
    p_category_id TEXT,
    p_title TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_conversation_id UUID;
    v_category_title TEXT;
BEGIN
    -- Get category title
    SELECT title INTO v_category_title 
    FROM chat_categories 
    WHERE id = p_category_id;
    
    -- Create conversation
    INSERT INTO ai_conversations (user_id, category_id, title, preview)
    VALUES (
        p_user_id, 
        p_category_id, 
        COALESCE(p_title, v_category_title || ' Chat'),
        'Starting conversation...'
    )
    RETURNING id INTO v_conversation_id;
    
    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add a message to conversation
CREATE OR REPLACE FUNCTION add_message(
    p_conversation_id UUID,
    p_user_id TEXT,
    p_content TEXT,
    p_is_user BOOLEAN,
    p_message_type TEXT DEFAULT 'text',
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_message_id UUID;
BEGIN
    -- Verify conversation belongs to user
    IF NOT EXISTS (
        SELECT 1 FROM ai_conversations 
        WHERE id = p_conversation_id AND user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'Conversation not found or access denied';
    END IF;
    
    -- Insert message
    INSERT INTO ai_messages (
        conversation_id, 
        user_id, 
        content, 
        is_user, 
        message_type, 
        metadata
    )
    VALUES (
        p_conversation_id, 
        p_user_id, 
        p_content, 
        p_is_user, 
        p_message_type, 
        p_metadata
    )
    RETURNING id INTO v_message_id;
    
    RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create a view for conversation statistics
CREATE OR REPLACE VIEW conversation_stats AS
SELECT 
    c.user_id,
    COUNT(c.id) as total_conversations,
    COUNT(CASE WHEN c.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as conversations_this_week,
    COUNT(CASE WHEN c.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as conversations_this_month,
    SUM(c.message_count) as total_messages,
    AVG(c.message_count) as avg_messages_per_conversation,
    MAX(c.last_message_time) as last_activity
FROM ai_conversations c
GROUP BY c.user_id;

-- Create a view for category usage statistics
CREATE OR REPLACE VIEW category_usage_stats AS
SELECT 
    cat.id as category_id,
    cat.title as category_title,
    COUNT(c.id) as total_conversations,
    COUNT(CASE WHEN c.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as conversations_this_week,
    COUNT(CASE WHEN c.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as conversations_this_month,
    SUM(c.message_count) as total_messages,
    AVG(c.message_count) as avg_messages_per_conversation
FROM chat_categories cat
LEFT JOIN ai_conversations c ON cat.id = c.category_id
GROUP BY cat.id, cat.title, cat.sort_order
ORDER BY cat.sort_order;
