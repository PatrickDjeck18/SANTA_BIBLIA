// AI Bible Chat TypeScript Types
// These types match the Supabase database schema

export interface ChatCategory {
  id: string;
  title: string;
  subtitle: string;
  system_prompt: string;
  icon_name?: string;
  color?: string;
  gradient_colors?: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  preview?: string;
  last_message_time: string;
  message_count: number;
  is_archived: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  content: string;
  is_user: boolean;
  message_type: 'text' | 'image' | 'file' | 'audio';
  metadata?: Record<string, any>;
  tokens_used?: number;
  response_time_ms?: number;
  created_at: string;
}

export interface UserChatPreferences {
  id: string;
  user_id: string;
  preferred_categories?: string[];
  ai_personality: 'conservative' | 'balanced' | 'progressive';
  response_length: 'short' | 'medium' | 'long';
  include_scripture_references: boolean;
  include_prayer_suggestions: boolean;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface ChatAnalytics {
  id: string;
  user_id: string;
  conversation_id?: string;
  category_id?: string;
  session_duration_seconds?: number;
  messages_sent: number;
  messages_received: number;
  total_tokens_used: number;
  satisfaction_rating?: number;
  feedback_text?: string;
  created_at: string;
}

// Extended types for UI components
export interface ConversationWithCategory extends AIConversation {
  category_title: string;
  category_color: string;
}

export interface MessageWithMetadata extends AIMessage {
  // Additional UI-specific properties can be added here
  formatted_time?: string;
  is_loading?: boolean;
}

// API Response types
export interface GetUserConversationsResponse {
  conversations: ConversationWithCategory[];
  total: number;
  has_more: boolean;
}

export interface GetConversationMessagesResponse {
  messages: MessageWithMetadata[];
  total: number;
  has_more: boolean;
}

export interface CreateConversationResponse {
  conversation_id: string;
  success: boolean;
}

export interface AddMessageResponse {
  message_id: string;
  success: boolean;
}

// Statistics types
export interface ConversationStats {
  user_id: string;
  total_conversations: number;
  conversations_this_week: number;
  conversations_this_month: number;
  total_messages: number;
  avg_messages_per_conversation: number;
  last_activity: string;
}

export interface CategoryUsageStats {
  category_id: string;
  category_title: string;
  total_conversations: number;
  conversations_this_week: number;
  conversations_this_month: number;
  total_messages: number;
  avg_messages_per_conversation: number;
}

// Database function parameter types
export interface CreateConversationParams {
  user_id: string;
  category_id: string;
  title?: string;
}

export interface AddMessageParams {
  conversation_id: string;
  user_id: string;
  content: string;
  is_user: boolean;
  message_type?: 'text' | 'image' | 'file' | 'audio';
  metadata?: Record<string, any>;
}

export interface GetUserConversationsParams {
  user_id: string;
  limit?: number;
  offset?: number;
}

export interface GetConversationMessagesParams {
  conversation_id: string;
  user_id: string;
  limit?: number;
  offset?: number;
}

// Supabase database types (generated from schema)
export interface Database {
  public: {
    Tables: {
      chat_categories: {
        Row: ChatCategory;
        Insert: Omit<ChatCategory, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ChatCategory, 'id' | 'created_at' | 'updated_at'>>;
      };
      ai_conversations: {
        Row: AIConversation;
        Insert: Omit<AIConversation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AIConversation, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      ai_messages: {
        Row: AIMessage;
        Insert: Omit<AIMessage, 'id' | 'created_at'>;
        Update: Partial<Omit<AIMessage, 'id' | 'conversation_id' | 'user_id' | 'created_at'>>;
      };
      user_chat_preferences: {
        Row: UserChatPreferences;
        Insert: Omit<UserChatPreferences, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserChatPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      chat_analytics: {
        Row: ChatAnalytics;
        Insert: Omit<ChatAnalytics, 'id' | 'created_at'>;
        Update: Partial<Omit<ChatAnalytics, 'id' | 'user_id' | 'created_at'>>;
      };
    };
    Views: {
      conversation_stats: {
        Row: ConversationStats;
      };
      category_usage_stats: {
        Row: CategoryUsageStats;
      };
    };
    Functions: {
      get_user_conversations: {
        Args: {
          p_user_id: string;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: ConversationWithCategory[];
      };
      get_conversation_messages: {
        Args: {
          p_conversation_id: string;
          p_user_id: string;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: MessageWithMetadata[];
      };
      create_conversation: {
        Args: {
          p_user_id: string;
          p_category_id: string;
          p_title?: string;
        };
        Returns: string;
      };
      add_message: {
        Args: {
          p_conversation_id: string;
          p_user_id: string;
          p_content: string;
          p_is_user: boolean;
          p_message_type?: string;
          p_metadata?: Record<string, any>;
        };
        Returns: string;
      };
    };
  };
}
