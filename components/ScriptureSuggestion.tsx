// ScriptureSuggestion Component
// Displays relevant Bible verses based on user's current mood with AI insights using DeepSeek API

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Share,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BookOpen,
  Heart,
  Share2,
  Copy,
  Sparkles,
  Lightbulb,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';
import { config } from '@/lib/config';

const { width: screenWidth } = Dimensions.get('window');

interface ScriptureSuggestionProps {
  moodType: string;
  intensity?: number;
  notes?: string;
  onVerseSelect?: (verse: any) => void;
  isCompact?: boolean;
  showAIInsight?: boolean;
  refreshTrigger?: number; // Add trigger to force refresh
}

interface DeepSeekScriptureResponse {
  reference: string;
  verse: string;
  explanation: string;
  application: string;
  moodAlignment: string;
  timestamp: string;
}

interface VerseData {
  reference: string;
  text: string;
  category: string;
  explanation: string;
  application: string;
  moodAlignment: string;
}

const ScriptureSuggestion: React.FC<ScriptureSuggestionProps> = ({
  moodType,
  intensity = 5,
  notes,
  onVerseSelect,
  isCompact = false,
  showAIInsight = true,
  refreshTrigger = 0,
}) => {
  const [verseData, setVerseData] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [favoriteVerses, setFavoriteVerses] = useState<Set<string>>(new Set());
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [error, setError] = useState<string | null>(null);

  const getMoodCategory = (mood: string): string => {
    const moodLower = mood.toLowerCase();
    if (['happy', 'joyful', 'grateful', 'blessed', 'excited', 'loved', 'proud'].some(m => moodLower.includes(m))) {
      return 'positive';
    }
    if (['peaceful', 'calm', 'content', 'prayerful'].some(m => moodLower.includes(m))) {
      return 'calm';
    }
    if (['motivated', 'focused', 'creative', 'inspired', 'accomplished'].some(m => moodLower.includes(m))) {
      return 'energetic';
    }
    if (['sad', 'anxious', 'stressed', 'angry', 'frustrated', 'tired', 'lonely', 'confused', 'fearful'].some(m => moodLower.includes(m))) {
      return 'challenging';
    }
    if (['curious', 'surprised', 'hopeful'].some(m => moodLower.includes(m))) {
      return 'curious';
    }
    if (['inspired', 'connected', 'faithful'].some(m => moodLower.includes(m))) {
      return 'spiritual';
    }
    return 'challenging'; // default
  };

  const loadScriptureFromDeepSeek = useCallback(async () => {
    try {
      console.log('📖 loadScriptureFromDeepSeek called with:', { moodType, intensity, notes });
      setLoading(true);
      setError(null);
      setVerseData(null); // Clear previous data

      const category = getMoodCategory(moodType);

      // Import and use the DeepSeek scripture service
      const { generateMoodScripture } = await import('@/lib/services/deepseekScriptureService');

      console.log('📖 Calling DeepSeek API directly for scripture recommendation...');

      const data = await generateMoodScripture({
        moodType,
        intensity,
        category,
        notes: notes || '',
      });

      console.log('✅ Received scripture from DeepSeek:', data);

      // Transform the response to match our component structure
      const transformedData: VerseData = {
        reference: data.reference,
        text: data.verse,
        category: category.charAt(0).toUpperCase() + category.slice(1),
        explanation: data.explanation,
        application: data.application,
        moodAlignment: data.moodAlignment,
      };

      console.log('✅ Setting verse data:', transformedData);
      setVerseData(transformedData);

      // Notify parent component that verse is generated
      if (onVerseSelect) {
        onVerseSelect(transformedData);
      }

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error: any) {
      console.error('❌ Error loading scripture from DeepSeek:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      // Clear any existing verse data
      setVerseData(null);

      // Clear parent callback if error occurs
      if (onVerseSelect) {
        onVerseSelect(null as any); // Notify parent that verse generation failed
      }

      // Only set error, don't set fallback data automatically
      const errorMessage = error.message || 'Failed to load scripture recommendation. Please try again.';
      setError(errorMessage);

      console.error('❌ Setting error state - NO fallback data will be shown');
    } finally {
      setLoading(false);
    }
  }, [moodType, intensity, notes, fadeAnim, slideAnim]);

  const loadFavorites = async () => {
    try {
      // In a real app, this would load from AsyncStorage or a database
      const favorites = new Set<string>(); // Placeholder
      setFavoriteVerses(favorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  useEffect(() => {
    // Clear any previous data when mood changes or refresh is triggered
    console.log('📖 ScriptureSuggestion useEffect triggered:', { moodType, intensity, notes, refreshTrigger });
    setVerseData(null);
    setError(null);
    setLoading(true);

    // Small delay to ensure state is cleared
    const timer = setTimeout(() => {
      console.log('📖 Calling loadScriptureFromDeepSeek...');
      loadScriptureFromDeepSeek();
      loadFavorites();
    }, 100);

    return () => clearTimeout(timer);
  }, [moodType, intensity, notes, refreshTrigger, loadScriptureFromDeepSeek]);

  const toggleFavorite = async () => {
    if (!verseData) return;

    try {
      const newFavorites = new Set(favoriteVerses);
      const isFavorite = favoriteVerses.has(verseData.reference);

      if (isFavorite) {
        newFavorites.delete(verseData.reference);
        Alert.alert('Removed from Favorites', `"${verseData.reference}" has been removed from your favorites.`);
      } else {
        newFavorites.add(verseData.reference);
        Alert.alert('Added to Favorites', `"${verseData.reference}" has been added to your favorites!`);
      }

      setFavoriteVerses(newFavorites);

      // In a real app, save to AsyncStorage or database
      // await AsyncStorage.setItem('favoriteVerses', JSON.stringify([...newFavorites]));

    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Unable to update favorites at this time.');
    }
  };

  const handleShare = async () => {
    if (!verseData) return;

    try {
      const message = `"${verseData.text}" - ${verseData.reference}\n\nShared from Daily Bread Mood Tracker`;
      await Share.share({
        message,
        title: `${verseData.reference} - Daily Bread`,
      });
    } catch (error) {
      console.error('Error sharing verse:', error);
    }
  };

  const handleCopy = async () => {
    if (!verseData) return;

    try {
      // In React Native, you'd use Clipboard API
      // For now, just show an alert
      Alert.alert('Copied!', `"${verseData.reference}" has been copied to clipboard.`);
    } catch (error) {
      console.error('Error copying verse:', error);
    }
  };

  const getMoodEmoji = (mood: string) => {
    const moodEmojis: Record<string, string> = {
      'happy': '😊',
      'joyful': '😄',
      'grateful': '🙏',
      'blessed': '🙏',
      'peaceful': '😇',
      'calm': '😌',
      'anxious': '😰',
      'sad': '😔',
      'stressed': '😓',
      'angry': '😠',
      'tired': '😴',
      'hopeful': '🌟',
      'excited': '🤩',
      'loved': '💕',
      'content': '😊',
    };

    const moodKey = mood.toLowerCase();
    for (const [key, emoji] of Object.entries(moodEmojis)) {
      if (moodKey.includes(key)) {
        return emoji;
      }
    }
    return '📖';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Peace': Colors.peace[500],
      'Comfort': Colors.secondary[500],
      'Joy': Colors.warning[500],
      'Strength': Colors.success[500],
      'Hope': Colors.hope[500],
      'Love': Colors.love[500],
      'Wisdom': Colors.secondary[600],
      'Courage': Colors.hope[600],
      'Faith': Colors.faith[500],
      'Guidance': Colors.primary[600],
      'Forgiveness': Colors.peace[600],
      'Healing': Colors.faith[600],
      'Provision': Colors.success[600],
      'Care': Colors.love[600],
      'Connection': Colors.peace[400],
    };
    return colors[category] || Colors.primary[500];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Colors.primary[500]} />
        <Text style={styles.loadingText}>Finding relevant scripture with AI...</Text>
      </View>
    );
  }

  // If there's an error, show error message - NO fallback verse
  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <Text style={styles.errorSubtext}>
          Unable to generate scripture recommendation. Please try again.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            loadScriptureFromDeepSeek();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // If no verse data and no error, show empty state
  if (!verseData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No scripture recommendation available for this mood.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadScriptureFromDeepSeek}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={[Colors.primary[50], Colors.secondary[50]]}
        style={styles.gradientContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <BookOpen size={20} color={Colors.primary[600]} />
            <Text style={styles.title}>
              Scripture for {getMoodEmoji(moodType)} {moodType}
            </Text>
          </View>
        </View>

        {/* Verse Display */}
        <View style={styles.selectedVerseContainer}>
          <View
            style={[
              styles.verseCard,
              { backgroundColor: getCategoryColor(verseData.category) + '15' }
            ]}
          >
            <View style={styles.verseHeader}>
              <Text style={styles.verseReference}>
                {verseData.reference}
              </Text>
              <View style={[
                styles.categoryBadge,
                { backgroundColor: getCategoryColor(verseData.category) + '20' }
              ]}>
                <Text style={[
                  styles.categoryText,
                  { color: getCategoryColor(verseData.category) }
                ]}>
                  {verseData.category}
                </Text>
              </View>
            </View>

            <Text style={styles.verseText}>
              "{verseData.text}"
            </Text>

            <Text style={styles.reasonText}>
              💡 {verseData.explanation}
            </Text>

            {showAIInsight && verseData.application && (
              <View style={styles.aiInsightContainer}>
                <Lightbulb size={16} color={Colors.warning[500]} />
                <Text style={styles.aiInsightText}>
                  {verseData.application}
                </Text>
              </View>
            )}

            {verseData.moodAlignment && (
              <Text style={styles.moodAlignmentText}>
                ✨ {verseData.moodAlignment}
              </Text>
            )}

            <View style={styles.verseActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleShare}
              >
                <Share2 size={16} color={Colors.primary[600]} />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleCopy}
              >
                <Copy size={16} color={Colors.primary[600]} />
                <Text style={styles.actionText}>Copy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={toggleFavorite}
              >
                {favoriteVerses.has(verseData.reference) ? (
                  <Heart size={16} color={Colors.error[500]} fill={Colors.error[500]} />
                ) : (
                  <Heart size={16} color={Colors.primary[600]} />
                )}
                <Text style={styles.actionText}>
                  {favoriteVerses.has(verseData.reference) ? 'Favorited' : 'Favorite'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Mood Context */}
        {notes && (
          <View style={styles.contextContainer}>
            <Text style={styles.contextLabel}>Your thoughts:</Text>
            <Text style={styles.contextText} numberOfLines={2}>
              {notes}
            </Text>
          </View>
        )}

        {/* Divine Sparkle Effect */}
        {isCompact && (
          <View style={styles.sparkleContainer}>
            <Sparkles size={12} color={Colors.warning[400]} />
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
  },
  gradientContainer: {
    padding: Spacing.md,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    fontWeight: '500',
  },
  emptyContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[500],
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: Typography.sizes.base,
    color: Colors.error[600],
    textAlign: 'center',
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  errorSubtext: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[500],
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  retryButton: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.base,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[800],
  },
  expandButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    opacity: 0.8,
  },
  selectedVerseContainer: {
    marginBottom: Spacing.md,
  },
  verseCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  verseReference: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.primary[700],
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semiBold,
  },
  verseText: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[800],
    lineHeight: Typography.sizes.base * Typography.lineHeights.relaxed,
    marginBottom: Spacing.md,
    fontStyle: 'italic',
  },
  reasonText: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    marginBottom: Spacing.sm,
    fontWeight: '500',
  },
  aiInsightContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    padding: Spacing.sm,
    backgroundColor: Colors.warning[50],
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  aiInsightText: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[700],
    lineHeight: Typography.sizes.sm * Typography.lineHeights.normal,
    flex: 1,
  },
  verseActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
  },
  actionText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary[600],
    fontWeight: '500',
  },
  otherRecommendations: {
    marginTop: Spacing.md,
  },
  otherTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[700],
    marginBottom: Spacing.sm,
  },
  otherVerseCard: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  otherVerseReference: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semiBold,
    color: Colors.primary[600],
    marginBottom: Spacing.xs,
  },
  otherVersePreview: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    lineHeight: Typography.sizes.sm * Typography.lineHeights.normal,
    marginBottom: Spacing.sm,
  },
  otherVerseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  otherCategory: {
    fontSize: Typography.sizes.xs,
    color: Colors.neutral[500],
    fontWeight: '500',
  },
  otherScore: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary[500],
    fontWeight: '600',
  },
  contextContainer: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary[300],
  },
  contextLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[700],
    marginBottom: Spacing.xs,
  },
  contextText: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    lineHeight: Typography.sizes.sm * Typography.lineHeights.normal,
  },
  moodAlignmentText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary[600],
    marginTop: Spacing.sm,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  sparkleContainer: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
});

export default ScriptureSuggestion;