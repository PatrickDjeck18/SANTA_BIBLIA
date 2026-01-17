// AIBibleChatScreen.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useContext } from 'react';

import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Send, Book, Heart, Cross, Users, Sparkles, CircleHelp as HelpCircle, MessageCircle, Star, Leaf, User, Info, Clock, ChevronRight, Play, Star as PremiumStar, Zap } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors, Shadows } from '@/constants/DesignTokens';
import { useAIBibleChat } from '@/hooks/useAIBibleChat';
import type { ChatMessage, ChatCategory } from '@/hooks/useAIBibleChat';
import { ChatMessage as ChatMessageComponent } from '@/components/ChatMessage';
import { ModernHeader } from '@/components/ModernHeader';
import BannerAd from '@/components/BannerAd';
import { useInterstitialAds } from '@/hooks/useInterstitialAds';
import { getPromptsForCategory } from '@/lib/data/bibleChatPrompts';

const { width, height } = Dimensions.get('window');

interface RecentConversation {
  id: string;
  category: string;
  title: string;
  preview: string;
  timeAgo: string;
  icon: React.ReactNode;
  color: string;
}


// Removed AccessModal component - no longer needed

export default function AIBibleChatScreen() {
  const { showInterstitialAd } = useInterstitialAds('bible');

  const {
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
  } = useAIBibleChat();
  
  const [inputText, setInputText] = useState('');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const typingAnim = useRef(new Animated.Value(0)).current;

  // Ref for the scroll view to auto-scroll to the bottom
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Initialize animations on component mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Typing animation
  useEffect(() => {
    if (isTyping) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [isTyping]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const categoryDisplayData = [
    {
      id: 'bible-study',
      title: 'Bible Study',
      subtitle: 'Scripture insights & interpretation',
      icon: <Book size={24} color="white" />,
      color: '#3B82F6',
      gradient: ['#3B82F6', '#1D4ED8'],
    },
    {
      id: 'prayer-life',
      title: 'Prayer Life',
      subtitle: 'Prayer guidance & support',
      icon: <Heart size={24} color="white" />,
      color: '#10B981',
      gradient: ['#10B981', '#059669'],
    },
    {
      id: 'faith-life',
      title: 'Faith & Life',
      subtitle: 'Living out your faith daily',
      icon: <Sparkles size={24} color="white" />,
      color: '#8B5CF6',
      gradient: ['#8B5CF6', '#7C3AED'],
    },
    {
      id: 'theology',
      title: 'Theology',
      subtitle: 'Deep theological discussions',
      icon: <Cross size={24} color="white" />,
      color: '#EF4444',
      gradient: ['#EF4444', '#DC2626'],
    },
    {
      id: 'relationships',
      title: 'Relationships',
      subtitle: 'Biblical relationship advice',
      icon: <Users size={24} color="white" />,
      color: '#F59E0B',
      gradient: ['#F59E0B', '#D97706'],
    },
    {
      id: 'spiritual-growth',
      title: 'Spiritual Growth',
      subtitle: 'Growing in your faith journey',
      icon: <Leaf size={24} color="white" />,
      color: '#06B6D4',
      gradient: ['#06B6D4', '#0891B2'],
    },
    {
      id: 'life-questions',
      title: 'Life Questions',
      subtitle: 'Biblical answers to life\'s questions',
      icon: <HelpCircle size={24} color="white" />,
      color: '#F59E0B',
      gradient: ['#F59E0B', '#D97706'],
    },
    {
      id: 'holy-spirit',
      title: 'Holy Spirit',
      subtitle: 'Understanding spiritual gifts',
      icon: <Sparkles size={24} color="white" />,
      color: '#8B5CF6',
      gradient: ['#8B5CF6', '#7C3AED'],
    },
    {
      id: 'service',
      title: 'Service',
      subtitle: 'Serving God & others',
      icon: <Heart size={24} color="white" />,
      color: '#10B981',
      gradient: ['#10B981', '#059669'],
    },
    {
      id: 'general-chat',
      title: 'General Chat',
      subtitle: 'Open faith conversations',
      icon: <Star size={24} color="white" />,
      color: '#EC4899',
      gradient: ['#EC4899', '#DB2777'],
    },
  ];

  const recentConversations = getRecentConversations(5);

  const getCategoryDisplayData = (categoryId: string) => {
    return categoryDisplayData.find(c => c.id === categoryId);
  };

  const getCategoryIcon = (categoryId: string) => {
    const categoryData = getCategoryDisplayData(categoryId);
    return categoryData?.icon || <MessageCircle size={20} color="#6B7280" />;
  };

  const getCategoryColor = (categoryId: string) => {
    const categoryData = getCategoryDisplayData(categoryId);
    return categoryData?.color || '#6B7280';
  };

  const handleCategorySelect = async (categoryData: any) => {
    try {
      console.log('Category clicked:', categoryData.title);
      
      // Start the conversation
      console.log('Starting new conversation for category:', categoryData.id);
      const conversationId = await startNewConversation(categoryData.id);
      console.log('Conversation created with ID:', conversationId);
      
      if (conversationId) {
        console.log('Category selected successfully:', categoryData.title);
      } else {
        throw new Error('Failed to create conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      Alert.alert('Error', 'Failed to start conversation. Please try again.');
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const messageText = inputText.trim();
    setInputText('');
    
    console.log('🚀 Sending message from UI:', { messageText: messageText.substring(0, 50), currentCategory, currentConversationId });
    
    if (currentCategory) {
      await sendMessage(messageText, currentCategory);
    } else {
      console.warn('❌ No current category set, cannot send message');
    }
  };

  // Use a safe back navigation to avoid callback errors when there's no history
  const safeBack = useCallback(() => {
    try {
      // @ts-ignore expo-router provides canGoBack at runtime
      if (typeof router?.canGoBack === 'function' ? router.canGoBack() : false) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    } catch {
      router.replace('/(tabs)');
    }
  }, []);

  const handleBackToCategories = () => {
    clearConversation();
    safeBack();
  };
  

  // Show category selection if no conversation is active
  if (!currentConversationId) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.whiteBackground}>
          {/* Header - Outside ScrollView for full width */}
          <View style={styles.headerContainer}>
            <ModernHeader
              title="AI Bible Chat"
              variant="simple"
              showBackButton={true}
              showReaderButton={false}
              onBackPress={safeBack}
              readerText="AI Bible Chat. Choose a topic to start your conversation with our AI Bible assistant."
            />
          </View>

          {/* Banner Ad */}
          <BannerAd placement="bible" />

          <Animated.ScrollView 
            style={[styles.scrollView, { opacity: fadeAnim }]}
            showsVerticalScrollIndicator={false}
          >

            {/* Main Chat Card */}
            <Animated.View style={[styles.mainChatCard, { transform: [{ scale: scaleAnim }] }]}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
                style={styles.mainChatGradient}
              >
                <View style={styles.aiAvatarContainer}>
                  <LinearGradient
                    colors={['#8B5CF6', '#7C3AED']}
                    style={styles.aiAvatar}
                  >
                    <Book size={32} color="white" />
                  </LinearGradient>
                  <View style={styles.onlineIndicator} />
                </View>
                <Text style={styles.mainChatTitle}>AI Bible Assistant</Text>
                <Text style={styles.mainChatSubtitle}>
                  Your intelligent companion for Bible study, prayer guidance, and spiritual growth
                </Text>
              </LinearGradient>
            </Animated.View>

            {/* Categories Section */}
            <Animated.View style={[styles.categoriesSection, { transform: [{ translateY: slideAnim }] }]}>
              <Text style={styles.sectionTitle}>Choose Your Topic</Text>
              <View style={styles.categoriesGrid}>
                {categoryDisplayData.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryCardContainer}
                    onPress={() => handleCategorySelect(category)}
                  >
                    <View style={[styles.categoryCard, { backgroundColor: '#FFFFFF' }]}>
                      <View style={styles.categoryContent}>
                        <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                          {category.icon}
                        </View>
                        <Text style={styles.categoryTitle}>{category.title}</Text>
                        <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            {/* Recent Conversations */}
            {recentConversations.length > 0 && (
              <Animated.View style={[styles.recentSection, { transform: [{ translateY: slideAnim }] }]}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Conversations</Text>
                  <Text style={styles.viewAll}>View All</Text>
                </View>
                <View style={styles.recentList}>
                  {recentConversations.map((conversation) => (
                    <TouchableOpacity
                      key={conversation.id}
                      style={styles.recentItem}
                      onPress={() => openExistingConversation(conversation.id)}
                    >
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
                        style={styles.recentGradient}
                      >
                        <View style={styles.recentLeft}>
                          <View style={[styles.recentIcon, { backgroundColor: getCategoryColor(conversation.category) + '20' }]}>
                            {getCategoryIcon(conversation.category)}
                          </View>
                          <View style={styles.recentContent}>
                            <Text style={styles.recentCategory}>
                              {getCategoryDisplayData(conversation.category)?.title || 'General Chat'}
                            </Text>
                            <Text style={styles.recentTitle}>{conversation.title}</Text>
                            <Text style={styles.recentPreview}>{conversation.preview}</Text>
                          </View>
                        </View>
                        <View style={styles.recentRight}>
                          <Text style={styles.recentTime}>{formatTimeAgo(conversation.lastMessageTime)}</Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* Empty Recent State */}
            {recentConversations.length === 0 && (
              <Animated.View style={[styles.emptyRecentSection, { transform: [{ translateY: slideAnim }] }]}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
                  style={styles.emptyRecentGradient}
                >
                  <Book size={48} color="#9CA3AF" />
                  <Text style={styles.emptyRecentTitle}>No Recent Conversations</Text>
                  <Text style={styles.emptyRecentSubtitle}>
                    Start a new conversation by selecting a topic above
                  </Text>
                </LinearGradient>
              </Animated.View>
            )}

            <View style={styles.bottomSpacing} />
          </Animated.ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // Main Chat UI
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.whiteBackground}>
        <KeyboardAvoidingView 
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Chat Header */}
          <View style={styles.headerContainer}>
            <ModernHeader
              title="AI Bible Assistant"
              variant="simple"
              showBackButton={true}
              showReaderButton={false}
              onBackPress={handleBackToCategories}
              readerText={`AI Bible Assistant. ${currentCategory ? chatCategories.find(c => c.id === currentCategory)?.title : 'Online'}. Chat with our AI to explore biblical topics.`}
            />
          </View>

          {/* Banner Ad */}
          <BannerAd placement="bible" />

          {/* Messages */}
          <Animated.ScrollView 
            style={[styles.messagesContainer, { opacity: fadeAnim }]}
            showsVerticalScrollIndicator={false}
            ref={scrollViewRef}
            contentContainerStyle={styles.messagesContainerEmpty}
          >
            {messages.map((message) => (
              <ChatMessageComponent
                key={message.id}
                message={message}
                onCopy={(text) => console.log('Copied:', text)}
                onShare={(text) => console.log('Shared:', text)}
                onDelete={deleteMessage}
                showDeleteButton={true}
              />
            ))}

            {/* Prompts Section - Show when no user messages exist */}
            {messages.filter(m => m.isUser).length === 0 && currentCategory && (
              <View style={styles.promptsContainerWrapper}>
                <Animated.View style={[styles.promptsContainer]}>
                  <Text style={styles.promptsTitle}>💡 Suggested Questions</Text>
                  <View style={styles.promptsScrollContent}>
                    {getPromptsForCategory(currentCategory).map((prompt, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.promptChip}
                        onPress={() => {
                          setInputText(prompt.text);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.promptChipContent}>
                          <View style={styles.promptNumber}>
                            <Text style={styles.promptNumberText}>{index + 1}</Text>
                          </View>
                          <Text style={styles.promptText}>{prompt.text}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Animated.View>
              </View>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <Animated.View style={[styles.typingContainer, { opacity: typingAnim }]}>
                <View style={styles.aiMessageAvatar}>
                  <Book size={16} color="white" />
                </View>
                <View style={styles.typingBubble}>
                  <View style={styles.typingDots}>
                    <View style={styles.typingDot} />
                    <View style={styles.typingDot} />
                    <View style={styles.typingDot} />
                  </View>
                </View>
              </Animated.View>
            )}
          </Animated.ScrollView>

          {/* Input Area */}
          <Animated.View style={[styles.inputContainer, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
              style={styles.inputGradient}
            >
              <TextInput
                style={styles.textInput}
                placeholder="Ask me anything about faith, Bible, or spiritual life..."
                placeholderTextColor="#9CA3AF"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                onSubmitEditing={handleSendMessage}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                onPress={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
              >
                <LinearGradient
                  colors={inputText.trim() && !isTyping ? ['#8B5CF6', '#7C3AED'] : ['#E5E7EB', '#D1D5DB']}
                  style={styles.sendButtonGradient}
                >
                  <Send size={20} color={inputText.trim() && !isTyping ? 'white' : '#9CA3AF'} />
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  whiteBackground: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    backgroundColor: Colors.white,
    zIndex: 1000,
    elevation: 4,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    position: 'relative',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 120, // Space for floating tab bar
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  infoButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Main Chat Card
  mainChatCard: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 32,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  mainChatGradient: {
    padding: 32,
    alignItems: 'center',
  },
  aiAvatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  aiAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: 'white',
  },
  mainChatTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  mainChatSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Categories Section
  categoriesSection: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  categoryCardContainer: {
    width: (width - 60) / 2,
  },
  categoryCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  categoryGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  categoryContent: {
    padding: 20,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 6,
  },
  categorySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Recent Section
  recentSection: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAll: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  recentList: {
    gap: 12,
  },
  recentItem: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  recentGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentContent: {
    flex: 1,
  },
  recentCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  recentPreview: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  recentRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  recentTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  // Empty Recent State
  emptyRecentSection: {
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyRecentGradient: {
    padding: 32,
    alignItems: 'center',
  },
  emptyRecentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyRecentSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },

  // Chat Interface Styles
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  chatHeaderCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  chatAvatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  chatHeaderSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  chatBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chatInfoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Messages
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  messagesContainerEmpty: {
    flexGrow: 1,
  },
  aiMessageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  // Typing Indicator
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  typingBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },

  // Input Area
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  inputGradient: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 28,
    gap: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    maxHeight: 100,
    lineHeight: 22,
    fontWeight: '400',
  },
  sendButton: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Prompts Section
  promptsContainerWrapper: {
    marginBottom: 16,
  },
  promptsContainer: {
    borderRadius: 24,
    backgroundColor: 'white',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  promptsScrollContent: {
    paddingBottom: 16,
  },
  promptsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
    letterSpacing: -0.5,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  promptChip: {
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    shadowColor: 'rgba(139, 92, 246, 0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  promptChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  promptNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  promptNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: 'white',
  },
  promptText: {
    flex: 1,
    fontSize: 15,
    color: '#6B21A8',
    lineHeight: 22,
    fontWeight: '600',
    letterSpacing: -0.2,
  },

  bottomSpacing: {
    height: 40,
  },
});

// Removed accessModalStyles - no longer needed