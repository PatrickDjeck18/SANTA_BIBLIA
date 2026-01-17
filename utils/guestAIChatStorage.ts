// Local storage utilities for guest user AI Bible chat data
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getGuestUserId } from './guestStorage';

// Storage key for guest AI conversations
const GUEST_AI_CONVERSATIONS_KEY = 'guest_ai_conversations';

// Types for guest AI chat data
export interface GuestChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string; // ISO string for consistency
  category?: string;
}

export interface GuestAIConversation {
  id: string;
  userId: string;
  category: string;
  title: string;
  preview: string;
  lastMessageTime: string; // ISO string for consistency
  messages: GuestChatMessage[];
}

// Get all guest AI conversations
export const getGuestAIConversations = async (): Promise<GuestAIConversation[]> => {
  try {
    const conversationsJson = await AsyncStorage.getItem(GUEST_AI_CONVERSATIONS_KEY);
    if (!conversationsJson) return [];
    
    const conversations = JSON.parse(conversationsJson);
    // Sort by lastMessageTime in descending order (newest first)
    return conversations.sort((a: GuestAIConversation, b: GuestAIConversation) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
  } catch (error) {
    console.error('Error getting guest AI conversations:', error);
    return [];
  }
};

// Save a new guest AI conversation
export const saveGuestAIConversation = async (conversation: GuestAIConversation): Promise<void> => {
  try {
    const conversations = await getGuestAIConversations();
    const updatedConversations = [conversation, ...conversations];
    await AsyncStorage.setItem(GUEST_AI_CONVERSATIONS_KEY, JSON.stringify(updatedConversations));
    console.log('💾 Saved guest AI conversation:', conversation.id);
  } catch (error) {
    console.error('Error saving guest AI conversation:', error);
    throw error;
  }
};

// Update an existing guest AI conversation
export const updateGuestAIConversation = async (
  conversationId: string, 
  updates: Partial<GuestAIConversation>
): Promise<GuestAIConversation | null> => {
  try {
    console.log('🔄 Updating guest AI conversation:', conversationId);
    const conversations = await getGuestAIConversations();
    const conversationIndex = conversations.findIndex(conv => conv.id === conversationId);
    
    if (conversationIndex === -1) {
      console.warn('❌ Guest AI conversation not found:', conversationId);
      return null;
    }
    
    const updatedConversation = {
      ...conversations[conversationIndex],
      ...updates,
      lastMessageTime: updates.lastMessageTime || new Date().toISOString(),
    };
    
    conversations[conversationIndex] = updatedConversation;
    await AsyncStorage.setItem(GUEST_AI_CONVERSATIONS_KEY, JSON.stringify(conversations));
    console.log('✅ Updated guest AI conversation:', conversationId, 'Message count:', updatedConversation.messages.length);
    return updatedConversation;
  } catch (error) {
    console.error('❌ Error updating guest AI conversation:', error);
    throw error;
  }
};

// Delete a guest AI conversation
export const deleteGuestAIConversation = async (conversationId: string): Promise<boolean> => {
  try {
    const conversations = await getGuestAIConversations();
    const filteredConversations = conversations.filter(conv => conv.id !== conversationId);
    await AsyncStorage.setItem(GUEST_AI_CONVERSATIONS_KEY, JSON.stringify(filteredConversations));
    console.log('🗑️ Deleted guest AI conversation:', conversationId);
    return true;
  } catch (error) {
    console.error('Error deleting guest AI conversation:', error);
    return false;
  }
};

// Get a specific guest AI conversation by ID
export const getGuestAIConversation = async (conversationId: string): Promise<GuestAIConversation | null> => {
  try {
    const conversations = await getGuestAIConversations();
    return conversations.find(conv => conv.id === conversationId) || null;
  } catch (error) {
    console.error('Error getting guest AI conversation:', error);
    return null;
  }
};

// Clear all guest AI conversations (useful for cleanup)
export const clearGuestAIConversations = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(GUEST_AI_CONVERSATIONS_KEY);
    console.log('🗑️ Cleared all guest AI conversations');
  } catch (error) {
    console.error('Error clearing guest AI conversations:', error);
  }
};

// Get conversation count for analytics
export const getGuestAIConversationCount = async (): Promise<number> => {
  try {
    const conversations = await getGuestAIConversations();
    return conversations.length;
  } catch (error) {
    console.error('Error getting guest AI conversation count:', error);
    return 0;
  }
};

// Get total message count across all conversations
export const getGuestAIMessageCount = async (): Promise<number> => {
  try {
    const conversations = await getGuestAIConversations();
    return conversations.reduce((total, conv) => total + conv.messages.length, 0);
  } catch (error) {
    console.error('Error getting guest AI message count:', error);
    return 0;
  }
};

// Ensure guest user ID consistency across conversations
export const ensureGuestUserConsistency = async (): Promise<void> => {
  try {
    const guestUserId = await getGuestUserId();
    const conversations = await getGuestAIConversations();
    
    // Update any conversations that might have inconsistent user IDs
    const updatedConversations = conversations.map(conv => ({
      ...conv,
      userId: guestUserId,
    }));
    
    if (conversations.length > 0) {
      await AsyncStorage.setItem(GUEST_AI_CONVERSATIONS_KEY, JSON.stringify(updatedConversations));
      console.log('🔄 Ensured guest user ID consistency for', updatedConversations.length, 'conversations');
    }
  } catch (error) {
    console.error('Error ensuring guest user consistency:', error);
  }
};
