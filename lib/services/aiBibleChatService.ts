// AI Bible Chat Service for Supabase
// This service handles all database operations for the AI Bible chat feature

import { supabase } from '../supabase';
import type {
  ChatCategory,
  AIConversation,
  AIMessage,
  UserChatPreferences,
  ChatAnalytics,
  ConversationWithCategory,
  MessageWithMetadata,
  GetUserConversationsResponse,
  GetConversationMessagesResponse,
  CreateConversationResponse,
  AddMessageResponse,
  ConversationStats,
  CategoryUsageStats,
  CreateConversationParams,
  AddMessageParams,
  GetUserConversationsParams,
  GetConversationMessagesParams,
} from '../types/ai-bible-chat';

export class AIBibleChatService {
  // Chat Categories
  static async getChatCategories(): Promise<ChatCategory[]> {
    try {
      const { data, error } = await supabase
        .from('chat_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching chat categories:', error);
      throw error;
    }
  }

  static async getChatCategoryById(id: string): Promise<ChatCategory | null> {
    try {
      const { data, error } = await supabase
        .from('chat_categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching chat category:', error);
      throw error;
    }
  }

  // Conversations
  static async getUserConversations(params: GetUserConversationsParams): Promise<GetUserConversationsResponse> {
    try {
      const { user_id, limit = 10, offset = 0 } = params;
      
      // Use the database function for better performance
      const { data, error } = await supabase.rpc('get_user_conversations', {
        p_user_id: user_id,
        p_limit: limit,
        p_offset: offset,
      });

      if (error) throw error;

      // Get total count
      const { count } = await supabase
        .from('ai_conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user_id);

      return {
        conversations: data || [],
        total: count || 0,
        has_more: (offset + limit) < (count || 0),
      };
    } catch (error) {
      console.error('Error fetching user conversations:', error);
      throw error;
    }
  }

  static async getConversationById(conversationId: string, userId: string): Promise<AIConversation | null> {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  }

  static async createConversation(params: CreateConversationParams): Promise<CreateConversationResponse> {
    try {
      const { user_id, category_id, title } = params;
      
      // Use the database function
      const { data, error } = await supabase.rpc('create_conversation', {
        p_user_id: user_id,
        p_category_id: category_id,
        p_title: title,
      });

      if (error) throw error;

      return {
        conversation_id: data,
        success: true,
      };
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  static async updateConversation(
    conversationId: string,
    updates: Partial<AIConversation>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .update(updates)
        .eq('id', conversationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
  }

  static async deleteConversation(conversationId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  static async archiveConversation(conversationId: string, userId: string): Promise<void> {
    try {
      await this.updateConversation(conversationId, { is_archived: true });
    } catch (error) {
      console.error('Error archiving conversation:', error);
      throw error;
    }
  }

  static async favoriteConversation(conversationId: string, userId: string, isFavorite: boolean): Promise<void> {
    try {
      await this.updateConversation(conversationId, { is_favorite: isFavorite });
    } catch (error) {
      console.error('Error updating conversation favorite status:', error);
      throw error;
    }
  }

  // Messages
  static async getConversationMessages(params: GetConversationMessagesParams): Promise<GetConversationMessagesResponse> {
    try {
      const { conversation_id, user_id, limit = 50, offset = 0 } = params;
      
      // Use the database function for better performance
      const { data, error } = await supabase.rpc('get_conversation_messages', {
        p_conversation_id: conversation_id,
        p_user_id: user_id,
        p_limit: limit,
        p_offset: offset,
      });

      if (error) throw error;

      // Get total count
      const { count } = await supabase
        .from('ai_messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversation_id);

      return {
        messages: data || [],
        total: count || 0,
        has_more: (offset + limit) < (count || 0),
      };
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      throw error;
    }
  }

  static async addMessage(params: AddMessageParams): Promise<AddMessageResponse> {
    try {
      const { conversation_id, user_id, content, is_user, message_type = 'text', metadata } = params;
      
      // Use the database function
      const { data, error } = await supabase.rpc('add_message', {
        p_conversation_id: conversation_id,
        p_user_id: user_id,
        p_content: content,
        p_is_user: is_user,
        p_message_type: message_type,
        p_metadata: metadata,
      });

      if (error) throw error;

      return {
        message_id: data,
        success: true,
      };
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  static async deleteMessage(messageId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_messages')
        .delete()
        .eq('id', messageId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // User Preferences
  static async getUserChatPreferences(userId: string): Promise<UserChatPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_chat_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    } catch (error) {
      console.error('Error fetching user chat preferences:', error);
      throw error;
    }
  }

  static async updateUserChatPreferences(
    userId: string,
    preferences: Partial<UserChatPreferences>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_chat_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user chat preferences:', error);
      throw error;
    }
  }

  // Analytics
  static async addChatAnalytics(analytics: Omit<ChatAnalytics, 'id' | 'created_at'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_analytics')
        .insert(analytics);

      if (error) throw error;
    } catch (error) {
      console.error('Error adding chat analytics:', error);
      throw error;
    }
  }

  static async getUserConversationStats(userId: string): Promise<ConversationStats | null> {
    try {
      const { data, error } = await supabase
        .from('conversation_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching conversation stats:', error);
      throw error;
    }
  }

  static async getCategoryUsageStats(): Promise<CategoryUsageStats[]> {
    try {
      const { data, error } = await supabase
        .from('category_usage_stats')
        .select('*')
        .order('total_conversations', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching category usage stats:', error);
      throw error;
    }
  }

  // Search functionality
  static async searchConversations(
    userId: string,
    query: string,
    limit: number = 10
  ): Promise<ConversationWithCategory[]> {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select(`
          *,
          chat_categories!inner(title, color)
        `)
        .eq('user_id', userId)
        .or(`title.ilike.%${query}%,preview.ilike.%${query}%`)
        .order('last_message_time', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(conv => ({
        ...conv,
        category_title: conv.chat_categories.title,
        category_color: conv.chat_categories.color,
      })) || [];
    } catch (error) {
      console.error('Error searching conversations:', error);
      throw error;
    }
  }

  static async searchMessages(
    conversationId: string,
    userId: string,
    query: string,
    limit: number = 20
  ): Promise<MessageWithMetadata[]> {
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  }

  // Bulk operations
  static async deleteAllUserConversations(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting all user conversations:', error);
      throw error;
    }
  }

  static async exportUserData(userId: string): Promise<{
    conversations: AIConversation[];
    messages: AIMessage[];
    preferences: UserChatPreferences | null;
    analytics: ChatAnalytics[];
  }> {
    try {
      const [conversationsResult, messagesResult, preferencesResult, analyticsResult] = await Promise.all([
        supabase.from('ai_conversations').select('*').eq('user_id', userId),
        supabase.from('ai_messages').select('*').eq('user_id', userId),
        supabase.from('user_chat_preferences').select('*').eq('user_id', userId).single(),
        supabase.from('chat_analytics').select('*').eq('user_id', userId),
      ]);

      if (conversationsResult.error) throw conversationsResult.error;
      if (messagesResult.error) throw messagesResult.error;
      if (preferencesResult.error && preferencesResult.error.code !== 'PGRST116') throw preferencesResult.error;
      if (analyticsResult.error) throw analyticsResult.error;

      return {
        conversations: conversationsResult.data || [],
        messages: messagesResult.data || [],
        preferences: preferencesResult.data,
        analytics: analyticsResult.data || [],
      };
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }
}
