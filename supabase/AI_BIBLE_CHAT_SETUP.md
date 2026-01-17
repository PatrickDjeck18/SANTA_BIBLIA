# AI Bible Chat Database Setup

This document provides instructions for setting up the AI Bible Chat database schema in Supabase.

## Overview

The AI Bible Chat system includes the following main components:

- **Chat Categories**: Predefined conversation topics (Bible Study, Prayer Life, etc.)
- **Conversations**: Individual chat sessions between users and AI
- **Messages**: Individual messages within conversations
- **User Preferences**: User-specific chat settings
- **Analytics**: Usage statistics and feedback data

## Database Schema

### Tables

1. **`chat_categories`** - Predefined conversation categories
2. **`ai_conversations`** - Individual chat sessions
3. **`ai_messages`** - Messages within conversations
4. **`user_chat_preferences`** - User-specific settings
5. **`chat_analytics`** - Usage analytics and feedback

### Views

1. **`conversation_stats`** - User conversation statistics
2. **`category_usage_stats`** - Category usage analytics

### Functions

1. **`get_user_conversations()`** - Get user's conversations with pagination
2. **`get_conversation_messages()`** - Get messages for a conversation
3. **`create_conversation()`** - Create a new conversation
4. **`add_message()`** - Add a message to a conversation

## Setup Instructions

### 1. Run the Migration

Execute the migration file in your Supabase project:

```sql
-- Run this in your Supabase SQL Editor
\i supabase/migrations/20250127000000_ai_bible_chat_system.sql
```

Or copy and paste the contents of `supabase/migrations/20250127000000_ai_bible_chat_system.sql` into the Supabase SQL Editor.

### 2. Verify Setup

After running the migration, verify the setup by checking:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('chat_categories', 'ai_conversations', 'ai_messages', 'user_chat_preferences', 'chat_analytics');

-- Check if categories were inserted
SELECT * FROM chat_categories ORDER BY sort_order;

-- Check if functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_user_conversations', 'get_conversation_messages', 'create_conversation', 'add_message');
```

### 3. Test the Setup

Test the basic functionality:

```sql
-- Test creating a conversation
SELECT create_conversation('test-user-123', 'bible-study', 'Test Conversation');

-- Test adding a message
SELECT add_message(
    'conversation-id-here',
    'test-user-123',
    'Hello, this is a test message',
    true
);
```

## Usage Examples

### Creating a New Conversation

```typescript
import { AIBibleChatService } from '@/lib/services/aiBibleChatService';

const conversation = await AIBibleChatService.createConversation({
  user_id: 'user-123',
  category_id: 'bible-study',
  title: 'Bible Study Session'
});
```

### Adding Messages

```typescript
// Add user message
await AIBibleChatService.addMessage({
  conversation_id: 'conv-123',
  user_id: 'user-123',
  content: 'What does this verse mean?',
  is_user: true
});

// Add AI response
await AIBibleChatService.addMessage({
  conversation_id: 'conv-123',
  user_id: 'user-123',
  content: 'This verse teaches us about...',
  is_user: false,
  metadata: { tokens_used: 150, response_time_ms: 1200 }
});
```

### Fetching Conversations

```typescript
const conversations = await AIBibleChatService.getUserConversations({
  user_id: 'user-123',
  limit: 10,
  offset: 0
});
```

### Fetching Messages

```typescript
const messages = await AIBibleChatService.getConversationMessages({
  conversation_id: 'conv-123',
  user_id: 'user-123',
  limit: 50,
  offset: 0
});
```

## Security Features

### Row Level Security (RLS)

All tables have RLS enabled with the following policies:

- Users can only access their own data
- Guest users (with `guest_` prefix) can access their data
- Public read access to chat categories
- Secure function execution with `SECURITY DEFINER`

### Data Protection

- All user data is isolated by `user_id`
- Guest users are supported with `guest_` prefix
- Automatic conversation metadata updates
- Secure function execution

## Performance Optimizations

### Indexes

The schema includes optimized indexes for:

- User ID lookups
- Conversation queries
- Message retrieval
- Time-based sorting
- Category filtering

### Database Functions

Optimized functions for common operations:

- `get_user_conversations()` - Efficient conversation listing
- `get_conversation_messages()` - Paginated message retrieval
- `create_conversation()` - Atomic conversation creation
- `add_message()` - Secure message insertion

## Analytics and Insights

### Conversation Statistics

```sql
-- Get user conversation stats
SELECT * FROM conversation_stats WHERE user_id = 'user-123';
```

### Category Usage

```sql
-- Get category usage statistics
SELECT * FROM category_usage_stats ORDER BY total_conversations DESC;
```

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**: Ensure user authentication is working
2. **Function Errors**: Check function permissions
3. **Index Issues**: Verify indexes were created properly

### Debug Queries

```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'ai_conversations';

-- Check function permissions
SELECT routine_name, security_type FROM information_schema.routines 
WHERE routine_schema = 'public';

-- Check table permissions
SELECT grantee, privilege_type FROM information_schema.table_privileges 
WHERE table_name = 'ai_conversations';
```

## Migration from Firebase

If migrating from Firebase, you'll need to:

1. Export data from Firebase
2. Transform data to match Supabase schema
3. Import data using the service functions
4. Update your application code to use Supabase

## Support

For issues with the database schema:

1. Check the Supabase logs
2. Verify RLS policies
3. Test with simple queries first
4. Ensure proper authentication

## Schema Diagram

```
chat_categories (1) ──┐
                     ├── ai_conversations (N)
                     │
ai_messages (N) ─────┘

user_chat_preferences (1) ── user_id
chat_analytics (N) ───────── user_id
```

This schema provides a robust foundation for AI Bible chat functionality with proper security, performance, and scalability considerations.
