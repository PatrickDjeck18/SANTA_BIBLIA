import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { cleanAIResponse } from '@/utils/textFormatting';
import { config } from '@/lib/config';
import {
  getGuestAIConversations,
  saveGuestAIConversation,
  updateGuestAIConversation,
  deleteGuestAIConversation,
  ensureGuestUserConsistency
} from '@/utils/guestAIChatStorage';
import { getGuestUserId } from '@/utils/guestStorage';

// Re-defining interfaces for clarity
export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date | { toDate: () => Date }; // Handles Firestore Timestamp -> kept for compatibility
  category?: string;
}

export interface ChatCategory {
  id: string;
  title: string;
  subtitle: string;
  systemPrompt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  category: string;
  title: string;
  preview: string;
  lastMessageTime: Date;
  messages: ChatMessage[];
}

export function useAIBibleChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const chatCategories: ChatCategory[] = useRef([
    {
      id: 'bible-study',
      title: 'Bible Study',
      subtitle: 'Scripture insights & interpretation',
      systemPrompt: 'You are a knowledgeable Bible study assistant. Help users understand Scripture, provide context, explain difficult passages, and offer practical applications. Always reference specific Bible verses and provide accurate biblical interpretation based on sound hermeneutics.'
    },
    {
      id: 'prayer-life',
      title: 'Prayer Life',
      subtitle: 'Prayer guidance & support',
      systemPrompt: 'You are a prayer mentor and spiritual guide. Help users develop their prayer life, understand different types of prayer, overcome prayer challenges, and deepen their relationship with God through prayer. Provide biblical examples and practical guidance.'
    },
    {
      id: 'faith-life',
      title: 'Faith & Life',
      subtitle: 'Living out your faith daily',
      systemPrompt: 'You are a Christian life coach helping believers apply their faith to daily life. Provide biblical wisdom for life decisions, relationships, work, and personal growth. Help users see how their faith intersects with practical living.'
    },
    {
      id: 'theology',
      title: 'Theology',
      subtitle: 'Deep theological discussions',
      systemPrompt: 'You are a theological scholar with deep knowledge of Christian doctrine, church history, and biblical theology. Help users understand complex theological concepts, answer doctrinal questions, and explore the depths of Christian faith with biblical accuracy.'
    },
    {
      id: 'relationships',
      title: 'Relationships',
      subtitle: 'Biblical relationship advice',
      systemPrompt: 'You are a Christian counselor specializing in relationships. Provide biblical guidance for marriage, family, friendships, and community relationships. Help users navigate relationship challenges with wisdom from Scripture.'
    },
    {
      id: 'spiritual-growth',
      title: 'Spiritual Growth',
      subtitle: 'Growing in your faith journey',
      systemPrompt: 'You are a spiritual mentor focused on helping believers grow in their faith. Provide guidance on spiritual disciplines, overcoming spiritual obstacles, developing Christian character, and maturing in faith.'
    },
    {
      id: 'life-questions',
      title: 'Life Questions',
      subtitle: 'Biblical answers to life\'s questions',
      systemPrompt: 'You are a wise biblical counselor who helps people find biblical answers to life\'s big questions. Address topics like purpose, suffering, decision-making, and finding God\'s will with compassion and biblical truth.'
    },
    {
      id: 'holy-spirit',
      title: 'Holy Spirit',
      subtitle: 'Understanding spiritual gifts',
      systemPrompt: 'You are an expert on the Holy Spirit and spiritual gifts. Help users understand the role of the Holy Spirit, discover and develop their spiritual gifts, and learn to be led by the Spirit in their daily lives.'
    },
    {
      id: 'service',
      title: 'Service',
      subtitle: 'Serving God & others',
      systemPrompt: 'You are a ministry leader who helps believers discover their calling and serve effectively. Provide guidance on finding your ministry, serving in the church, missions, and making a difference in your community for Christ.'
    },
    {
      id: 'general-chat',
      title: 'General Chat',
      subtitle: 'Open faith conversations',
      systemPrompt: 'You are a friendly Christian companion for open conversations about faith, life, and spiritual matters. Be encouraging, biblically sound, and ready to discuss any topic from a Christian perspective.'
    }
  ]).current;

  // Load conversations from local storage on mount
  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        // Ensure guest user ID consistency before loading conversations
        await ensureGuestUserConsistency();

        // Fetch from local storage for guest users using dedicated storage utilities
        const guestConversations = await getGuestAIConversations();
        if (guestConversations.length > 0) {
          // Convert timestamp strings back to Date objects for compatibility
          const conversationsWithDates = guestConversations.map((conv: any) => ({
            ...conv,
            lastMessageTime: new Date(conv.lastMessageTime),
            messages: conv.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })),
          }));
          setConversations(conversationsWithDates);
          console.log('📱 Loaded guest conversations from local storage:', conversationsWithDates.length);
        } else {
          setConversations([]);
          console.log('📱 No guest conversations found in local storage');
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const createNewConversation = async (categoryId: string): Promise<string> => {
    console.log('🆕 Creating new conversation for category:', categoryId);

    const category = chatCategories.find(c => c.id === categoryId);
    const welcomeMessage: ChatMessage = {
      id: `${Date.now()}`,
      text: `Hello! I'm here to help you with ${category?.title.toLowerCase()}. ${category?.subtitle} What would you like to discuss today?`,
      isUser: false,
      timestamp: new Date(),
      category: categoryId,
    };

    const conversationData = {
      userId: await getGuestUserId(),
      category: categoryId,
      title: `${category?.title} Chat`,
      preview: welcomeMessage.text,
      lastMessageTime: new Date(),
      messages: [{
        ...welcomeMessage,
        timestamp: new Date()
      }],
    };

    try {
      console.log('💾 Creating conversation in local storage for guest user');
      // Create in local storage for guest users
      const conversationId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('🆔 Generated guest conversation ID:', conversationId);

      const newConversation: Conversation = {
        id: conversationId,
        ...conversationData,
        lastMessageTime: new Date(),
        messages: [{ ...welcomeMessage }],
      } as Conversation;

      // Save to local storage using dedicated storage utilities
      const guestConversation = {
        ...newConversation,
        lastMessageTime: newConversation.lastMessageTime.toISOString(),
        messages: newConversation.messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() :
            typeof msg.timestamp === 'string' ? msg.timestamp :
              new Date().toISOString(),
        })),
      };
      await saveGuestAIConversation(guestConversation);
      console.log('✅ Guest conversation saved to local storage');

      setConversations(prev => [newConversation, ...prev]);
      setCurrentCategory(categoryId);
      setCurrentConversationId(conversationId);
      setMessages(newConversation.messages);

      return conversationId;
    } catch (error) {
      console.error('❌ Error creating new conversation:', error);
      throw error;
    }
  };

  const updateConversation = async (conversationId: string, newMessages: ChatMessage[]): Promise<void> => {
    try {
      console.log('🔄 Updating conversation:', { conversationId, messageCount: newMessages.length });

      const lastMessage = newMessages[newMessages.length - 1];
      const firstUserMessage = newMessages.find(m => m.isUser);

      const updatedConversation = {
        messages: newMessages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date()
        })),
        preview: lastMessage.text.substring(0, 100) + (lastMessage.text.length > 100 ? '...' : ''),
        lastMessageTime: new Date(),
        title: firstUserMessage ?
          (firstUserMessage.text.substring(0, 50) + (firstUserMessage.text.length > 50 ? '...' : '')) :
          'New Chat',
      };

      console.log('💾 Updating in local storage for guest user');
      // Update in local storage for guest users using dedicated storage utilities
      const guestConversationUpdate = {
        ...updatedConversation,
        lastMessageTime: new Date().toISOString(),
        messages: updatedConversation.messages.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() :
            typeof msg.timestamp === 'string' ? msg.timestamp :
              new Date().toISOString(),
        })),
      };
      await updateGuestAIConversation(conversationId, guestConversationUpdate);
      console.log('✅ Local storage update successful');

      console.log('🔄 Updating local state...');
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: newMessages,
            preview: lastMessage.text.substring(0, 100) + (lastMessage.text.length > 100 ? '...' : ''),
            lastMessageTime: lastMessage.timestamp as Date,
            title: firstUserMessage ?
              (firstUserMessage.text.substring(0, 50) + (firstUserMessage.text.length > 50 ? '...' : '')) :
              conv.title,
          };
        }
        return conv;
      }));
      console.log('✅ Local state updated successfully');
    } catch (error) {
      console.error('❌ Error updating conversation:', error);
      Alert.alert('Save Error', 'Failed to save your message. Please try again.');
    }
  };

  const sendMessage = async (userMessage: string, categoryId: string): Promise<void> => {
    if (!userMessage.trim() || !currentConversationId) {
      console.log('❌ Cannot send message: missing text or conversation ID');
      return;
    }

    console.log('📤 Sending message:', { userMessage: userMessage.substring(0, 50), categoryId, conversationId: currentConversationId });
    setIsTyping(true);

    const userMsg: ChatMessage = {
      id: `${Date.now()}`,
      text: userMessage.trim(),
      isUser: true,
      timestamp: new Date(),
      category: categoryId,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    console.log('💬 User message added to state');

    try {
      const aiResponse = await _fetchAIResponse(userMessage, categoryId, updatedMessages);

      const aiMessage: ChatMessage = {
        id: `${Date.now() + 1}`,
        text: cleanAIResponse(aiResponse),
        isUser: false,
        timestamp: new Date(),
        category: categoryId,
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      console.log('🤖 AI response added to state, updating conversation...');

      await updateConversation(currentConversationId, finalMessages);
      console.log('✅ Conversation updated successfully');

    } catch (error) {
      console.error('❌ Error getting AI response:', error);
      const fallbackMessage: ChatMessage = {
        id: `${Date.now() + 1}`,
        text: "I apologize, but I'm having trouble connecting to the AI service right now. Please try again in a moment. In the meantime, I encourage you to pray about your question and seek wisdom from God's Word.",
        isUser: false,
        timestamp: new Date(),
        category: categoryId,
      };
      const finalMessages = [...updatedMessages, fallbackMessage];
      setMessages(finalMessages);
      console.log('🔄 Fallback message added, updating conversation...');

      await updateConversation(currentConversationId, finalMessages);
      console.log('✅ Fallback conversation updated successfully');

      Alert.alert('Connection Issue', 'Unable to connect to the AI service. Please check your internet connection and try again.');
    } finally {
      setIsTyping(false);
    }
  };

  // ➡️ Helper function to handle AI API calls
  const _fetchAIResponse = async (userMessage: string, categoryId: string, history: ChatMessage[]): Promise<string> => {
    const API_KEY = config.deepseek.apiKey;

    if (!API_KEY) {
      throw new Error('DeepSeek API key is not configured.');
    }

    const category = chatCategories.find(c => c.id === categoryId);
    const systemPrompt = category?.systemPrompt || 'You are a helpful Christian AI assistant.';

    const conversationHistory = history
      .slice(-10) // Keep last 10 messages for context
      .map(m => ({
        role: m.isUser ? 'user' : 'assistant',
        content: m.text
      }));

    const requestBody = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `${systemPrompt}
Guidelines:
- Always provide biblically accurate information
- Reference specific Bible verses when relevant
- Be encouraging and supportive
- Keep responses conversational and helpful
- If you're unsure about something, acknowledge it and suggest prayer or consulting Scripture
- Maintain a warm, pastoral tone
- Limit responses to 2-3 paragraphs for mobile readability`
        },
        ...conversationHistory,
        {
          role: 'user',
          content: userMessage
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
      top_p: 0.9,
    };

    try {
      const response = await fetch(config.deepseek.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ DeepSeek API error:', errorText);
        throw new Error(`DeepSeek API request failed: ${response.status}`);
      }

      const responseData = await response.json();
      const content = responseData.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from DeepSeek API');
      }
      return cleanAIResponse(content);
    } catch (error) {
      console.error('Error fetching from DeepSeek:', error);
      throw error;
    }
  };

  const startNewConversation = async (categoryId: string): Promise<string> => {
    try {
      const conversationId = await createNewConversation(categoryId);
      return conversationId;
    } catch (error) {
      console.error('Failed to start new conversation:', error);
      // You might want to throw the error or return a specific value
      // to indicate failure, e.g., an empty string or null.
      throw error;
    }
  };

  const openExistingConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setCurrentCategory(conversation.category);
      setCurrentConversationId(conversationId);
      setMessages(conversation.messages);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setCurrentCategory(null);
    setCurrentConversationId(null);
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      // Delete from local storage for guest users using dedicated storage utilities
      await deleteGuestAIConversation(conversationId);

      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (currentConversationId === conversationId) {
        clearConversation();
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const getRecentConversations = (limit: number = 10): Conversation[] => {
    return [...conversations].sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime()).slice(0, limit);
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  // Delete a specific message from the current conversation
  const deleteMessage = async (messageId: string): Promise<void> => {
    if (!currentConversationId) {
      console.warn('❌ No current conversation to delete message from');
      return;
    }

    try {
      console.log('🗑️ Deleting message:', { messageId, conversationId: currentConversationId });

      // Remove message from local state
      const updatedMessages = messages.filter(msg => msg.id !== messageId);
      setMessages(updatedMessages);

      // Update conversation in storage
      await updateConversation(currentConversationId, updatedMessages);

      console.log('✅ Message deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      Alert.alert('Delete Error', 'Failed to delete message. Please try again.');
    }
  };

  // Debug function to verify message saving
  const verifyMessageSaving = async (): Promise<void> => {
    try {
      console.log('🔍 Verifying message saving...');
      console.log('📊 Current state:', {
        conversationsCount: conversations.length,
        currentConversationId,
        currentCategory,
        messagesCount: messages.length,
      });

      // Check local storage
      const guestConversations = await getGuestAIConversations();
      console.log('💾 Local storage conversations count:', guestConversations.length);
    } catch (error) {
      console.error('❌ Error verifying message saving:', error);
    }
  };

  return {
    messages,
    conversations,
    loading,
    isTyping,
    currentCategory,
    currentConversationId,
    chatCategories,
    sendMessage,
    startNewConversation,
    openExistingConversation,
    clearConversation,
    getRecentConversations,
    deleteConversation,
    deleteMessage,
    formatTimeAgo,
    verifyMessageSaving,
  };
}