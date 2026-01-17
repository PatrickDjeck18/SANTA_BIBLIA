import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Smile,
  TrendingUp,
  BarChart3,
  Calendar,
  Zap,
  Sparkles,
  Brain,
  Plus,
  ArrowRight,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';
import { useUnifiedMoodTracker } from '@/hooks/useUnifiedMoodTracker';
import type { WeeklyMoodData } from '@/hooks/useGuestMoodTracker';
import { router } from 'expo-router';
import { onMoodEntrySaved, offMoodEntrySaved } from '@/lib/eventEmitter';

const { width: screenWidth } = Dimensions.get('window');

interface MoodTrackerCardProps {
  onPress?: () => void;
  compact?: boolean;
}

export default function MoodTrackerCard({ onPress, compact = false }: MoodTrackerCardProps) {
  const { moodStats, loading, refetch } = useUnifiedMoodTracker();
  const [showInsights, setShowInsights] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [lastRefetchTime, setLastRefetchTime] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const todaysMood = moodStats.todaysMood;
  const todayDate = new Date().toISOString().split('T')[0];

  // Debug logging
  console.log('🔴 MOOD CARD: todaysMood:', todaysMood);
  console.log('🔴 MOOD CARD: moodStats:', moodStats);
  console.log('🔴 MOOD CARD: loading:', loading);

  // Timeout mechanism to prevent infinite loading
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let progressInterval: ReturnType<typeof setInterval>;

    if (loading) {
      // Reset progress when loading starts
      setLoadingProgress(0);

      // Simulate progress
      progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          const newProgress = prev + 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 200);

      timeout = setTimeout(() => {
        console.log('🔴 MOOD CARD: Loading timeout reached');
        setLoadingTimeout(true);
        setHasError(true);
        setLoadingProgress(100);
      }, 5000); // 5 second timeout - reduced for better UX
    } else {
      setLoadingTimeout(false);
      setHasError(false);
      setLoadingProgress(100);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [loading]);

  // Auto-open mood tracker only if user explicitly wants to start tracking
  // Removed automatic redirect to prevent unwanted navigation on page reload
  // Users can manually navigate to mood tracker when they're ready

  const weeklyMoods = useMemo(() => {
    return moodStats.weeklyData.map((d: { date: string; mood: string | null; mood_id: string | null; rating: number | null; emoji: string | null }) => ({
      ...d,
      day: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
      isToday: d.date === todayDate
    }));
  }, [moodStats.weeklyData, todayDate]);

  // Debounced refetch function
  const debouncedRefetch = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastRefetch = now - lastRefetchTime;

    // Debounce refetch calls by 2 seconds
    if (timeSinceLastRefetch < 2000) {
      console.log('🔴 MOOD CARD: Debouncing refetch call');
      return;
    }

    setLastRefetchTime(now);
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing mood data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch, lastRefetchTime]);

  // Listen for mood entry saved events and refresh data
  useEffect(() => {
    const handleMoodSaved = async (data?: any) => {
      if (!refreshing) {
        await debouncedRefetch();
      }
    };

    // Use cross-platform event emitter
    onMoodEntrySaved(handleMoodSaved);

    // Also listen to web events for web platform compatibility
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('moodEntrySaved', handleMoodSaved);
    }

    return () => {
      offMoodEntrySaved(handleMoodSaved);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.removeEventListener('moodEntrySaved', handleMoodSaved);
      }
    };
  }, [debouncedRefetch, refreshing]);

  // Helper functions
  const getMoodGradient = (moodId: string | null | undefined) => {
    return Colors.gradients.spiritualLight;
  };

  const getAllMoods = () => {
    const moodCategories = {
      positive: {
        moods: [
          { id: 'positive_001_blessed', label: '🙏 Blessed', gradient: ['#FFD700', '#FFA500', '#FF8C00'] as const },
          { id: 'positive_002_happy', label: '😊 Happy', gradient: ['#10B981', '#059669', '#047857'] as const },
          { id: 'positive_003_joyful', label: '😄 Joyful', gradient: ['#22C55E', '#16A34A', '#15803D'] as const },
          { id: 'positive_004_grateful', label: '🙏 Grateful', gradient: ['#84CC16', '#65A30D', '#4D7C0F'] as const },
          { id: 'positive_005_excited', label: '🤩 Excited', gradient: ['#F59E0B', '#D97706', '#B45309'] as const },
          { id: 'positive_006_loved', label: '💕 Loved', gradient: ['#EC4899', '#DB2777', '#BE185D'] as const },
          { id: 'positive_007_proud', label: '🏆 Proud', gradient: ['#10B981', '#059669', '#047857'] as const },
        ]
      },
      calm: {
        moods: [
          { id: 'calm_001_peaceful', label: '😇 Peaceful', gradient: ['#06B6D4', '#0891B2', '#0E7490'] as const },
          { id: 'calm_002_calm', label: '😌 Calm', gradient: ['#3B82F6', '#2563EB', '#1D4ED8'] as const },
          { id: 'calm_003_content', label: '😊 Content', gradient: ['#8B5CF6', '#7C3AED', '#6D28D9'] as const },
          { id: 'calm_004_prayerful', label: '🙏 Prayerful', gradient: ['#8B5CF6', '#7C3AED', '#6D28D9'] as const },
        ]
      },
      energetic: {
        moods: [
          { id: 'energetic_001_motivated', label: '💪 Motivated', gradient: ['#10B981', '#059669', '#047857'] as const },
          { id: 'energetic_002_focused', label: '🎯 Focused', gradient: ['#3B82F6', '#2563EB', '#1D4ED8'] as const },
          { id: 'energetic_003_creative', label: '🎨 Creative', gradient: ['#8B5CF6', '#7C3AED', '#6D28D9'] as const },
          { id: 'energetic_004_inspired', label: '✨ Inspired', gradient: ['#EC4899', '#DB2777', '#BE185D'] as const },
          { id: 'energetic_005_accomplished', label: '🎉 Accomplished', gradient: ['#22C55E', '#16A34A', '#15803D'] as const },
        ]
      },
      challenging: {
        moods: [
          { id: 'challenging_001_sad', label: '😔 Sad', gradient: ['#6B7280', '#4B5563', '#374151'] as const },
          { id: 'challenging_002_anxious', label: '😰 Anxious', gradient: ['#8B5CF6', '#7C3AED', '#6D28D9'] as const },
          { id: 'challenging_003_stressed', label: '😓 Stressed', gradient: ['#EC4899', '#DB2777', '#BE185D'] as const },
          { id: 'challenging_004_angry', label: '😠 Angry', gradient: ['#EF4444', '#DC2626', '#B91C1C'] as const },
          { id: 'challenging_005_frustrated', label: '😤 Frustrated', gradient: ['#F97316', '#EA580C', '#C2410C'] as const },
          { id: 'challenging_006_tired', label: '😴 Tired', gradient: ['#A855F7', '#9333EA', '#7C3AED'] as const },
          { id: 'challenging_007_lonely', label: '🥺 Lonely', gradient: ['#6B7280', '#4B5563', '#374151'] as const },
          { id: 'challenging_008_confused', label: '😕 Confused', gradient: ['#F59E0B', '#D97706', '#B45309'] as const },
        ]
      },
      curious: {
        moods: [
          { id: 'curious_001_curious', label: '🤔 Curious', gradient: ['#14B8A6', '#0D9488', '#0F766E'] as const },
          { id: 'curious_002_surprised', label: '😲 Surprised', gradient: ['#FBBF24', '#F59E0B', '#D97706'] as const },
          { id: 'curious_003_hopeful', label: '🌟 Hopeful', gradient: ['#FBBF24', '#F59E0B', '#D97706'] as const },
        ]
      },
      spiritual: {
        moods: [
          { id: 'spiritual_001_inspired', label: '✨ Inspired', gradient: ['#A78BFA', '#8B5CF6', '#7C3AED'] as const },
          { id: 'spiritual_002_connected', label: '🔗 Connected', gradient: ['#6EE7B7', '#34D399', '#10B981'] as const },
          { id: 'spiritual_003_faithful', label: '✝️ Faithful', gradient: ['#F472B6', '#EC4899', '#DB2777'] as const },
        ]
      },
      health: {
        moods: [
          { id: 'health_001_healthy', label: '🍎 Healthy', gradient: ['#6EE7B7', '#34D399', '#10B981'] as const },
          { id: 'health_002_rested', label: '😴 Rested', gradient: ['#A78BFA', '#8B5CF6', '#7C3AED'] as const },
          { id: 'health_003_balanced', label: '🧘 Balanced', gradient: ['#F472B6', '#EC4899', '#DB2777'] as const },
        ]
      }
    };

    const allMoods: any[] = [];
    Object.values(moodCategories).forEach(category => {
      category.moods.forEach(mood => allMoods.push(mood));
    });
    return allMoods;
  };

  const getMoodMessage = (rating: number | null | undefined) => {
    if (!rating) return 'How are you feeling today?';

    if (rating >= 8) return 'You\'re radiating positivity! ✨';
    if (rating >= 6) return 'You\'re doing great! Keep it up! 🌟';
    if (rating >= 4) return 'You\'re making progress! 💪';
    return 'Remember, every day is a new beginning 🌅';
  };

  const getMoodInsight = () => {
    if (moodStats.totalEntries === 0) return 'Start tracking your mood to gain insights!';

    const positiveDays = moodStats.weeklyData.filter((d: WeeklyMoodData) => d.rating && d.rating >= 6).length;
    const positivePercentage = Math.round((positiveDays / 7) * 100);

    if (positivePercentage >= 70) return '🌟 Amazing week! You\'ve been positive most days.';
    if (positivePercentage >= 50) return '✨ Good balance! Keep nurturing your spiritual well-being.';
    return '💭 Every emotion is part of your journey. You\'re growing through it all.';
  };

  const getMoodDisplayName = (moodId: string | null, moodType?: string | null) => {
    // If we have moodType from database, use it directly
    if (moodType) {
      return moodType;
    }

    // If we have moodId, look it up in the predefined moods
    if (moodId) {
      const allMoods = getAllMoods();
      const mood = allMoods.find(m => m.id === moodId);

      if (mood) {
        return mood.label;
      }
    }

    return 'Unknown Mood';
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/(tabs)/mood-tracker');
    }
  };

  const toggleInsights = () => {
    setShowInsights(!showInsights);
  };

  if (loading && !loadingTimeout) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="small" color={Colors.primary[600]} />
        <Text style={styles.loadingText}>Loading mood data...</Text>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${loadingProgress}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>{loadingProgress}%</Text>
        </View>

        <TouchableOpacity
          style={styles.manualRefreshButton}
          onPress={() => router.push('/(tabs)/mood-tracker')}
        >
          <Text style={styles.manualRefreshButtonText}>Open Mood Tracker</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (hasError || loadingTimeout) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <View style={styles.errorContent}>
          <Text style={styles.errorText}>Failed to load mood data</Text>
          <Text style={styles.errorSubtext}>Unable to connect to mood tracker</Text>

          <View style={styles.errorActions}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={async () => {
                setHasError(false);
                setLoadingTimeout(false);
                try {
                  await debouncedRefetch();
                } catch (error) {
                  console.error('Error retrying:', error);
                }
              }}
            >
              <Text style={styles.retryButtonText}>Refresh</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.openMoodTrackerButton}
              onPress={() => router.push('/(tabs)/mood-tracker')}
            >
              <Text style={styles.openMoodTrackerButtonText}>Open Mood Tracker</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, compact && styles.compactContainer]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {refreshing && (
        <View style={styles.refreshOverlay}>
          <ActivityIndicator size="small" color="white" />
        </View>
      )}
      <LinearGradient
        colors={getMoodGradient(todaysMood?.mood_id)}
        style={[styles.gradient, compact && styles.compactGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              {todaysMood?.emoji ? (
                <Text style={styles.moodEmoji}>{todaysMood.emoji}</Text>
              ) : (
                <Smile size={compact ? 20 : 24} color={Colors.primary[600]} />
              )}
            </View>
            <View>
              <Text style={styles.title}>Today's Mood</Text>
              <Text style={styles.subtitle}>
                {todaysMood ?
                  `${getMoodDisplayName(todaysMood.mood_id ?? null, todaysMood.mood_type)} • ${getMoodMessage(todaysMood.intensity_rating)}` :
                  'Track your mood today'
                }
              </Text>
              {todaysMood?.created_at && (
                <Text style={styles.moodTime}>
                  Recorded at {(() => {
                    // Handle different timestamp formats
                    let entryDate;
                    if (typeof todaysMood.created_at === 'number') {
                      // Firebase timestamp (milliseconds)
                      entryDate = new Date(todaysMood.created_at);
                    } else if (typeof todaysMood.created_at === 'string') {
                      // ISO string or other string format
                      entryDate = new Date(todaysMood.created_at);
                    } else if (todaysMood.created_at && typeof (todaysMood.created_at as any).toDate === 'function') {
                      // Firebase Timestamp object
                      entryDate = (todaysMood.created_at as any).toDate();
                    } else {
                      // Fallback to current time
                      entryDate = new Date();
                    }

                    return entryDate.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    });
                  })()}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/(tabs)/mood-tracker')}
            >
              <Plus size={16} color={Colors.primary[600]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Zap size={16} color={Colors.primary[600]} />
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statNumber}>{moodStats.currentStreak}</Text>
          </View>

          <View style={styles.statItem}>
            <BarChart3 size={16} color={Colors.primary[600]} />
            <Text style={styles.statLabel}>Avg</Text>
            <Text style={styles.statNumber}>{moodStats.averageWeekly.toFixed(1)}</Text>
          </View>

          <View style={styles.statItem}>
            <Calendar size={16} color={Colors.primary[600]} />
            <Text style={styles.statLabel}>Entries</Text>
            <Text style={styles.statNumber}>{moodStats.totalEntries}</Text>
          </View>
        </View>

        {/* Weekly Trend */}
        {!compact && (
          <View style={styles.weeklyContainer}>
            <View style={styles.weeklyHeader}>
              <Text style={styles.weeklyTitle}>This Week</Text>
              <TouchableOpacity onPress={toggleInsights}>
                <Brain size={16} color={Colors.primary[600]} opacity={0.8} />
              </TouchableOpacity>
            </View>

            <View style={styles.weeklyBars}>
              {weeklyMoods.map((mood: any, index: number) => (
                <View key={index} style={styles.weeklyBarContainer}>
                  <Text style={[
                    styles.weeklyDay,
                    mood.isToday && styles.todayDay
                  ]}>{mood.day}</Text>
                  {mood.emoji && (
                    <View style={styles.moodContainer}>
                      <Text style={[
                        styles.weeklyEmoji,
                        mood.isToday && styles.todayEmoji
                      ]}>{mood.emoji}</Text>
                      <Text style={[
                        styles.moodName,
                        mood.isToday && styles.todayMoodName
                      ]}>{getMoodDisplayName(mood.mood_id, mood.mood)}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    marginVertical: Spacing.sm,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  compactContainer: {
    marginHorizontal: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  loadingContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral[50],
  },
  loadingText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[600],
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  manualRefreshButton: {
    backgroundColor: Colors.primary[600],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  manualRefreshButtonText: {
    color: 'white',
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginVertical: Spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary[600],
    borderRadius: BorderRadius.sm,
  },
  progressText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  errorContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  errorContent: {
    alignItems: 'center',
  },
  errorText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[700],
    marginBottom: Spacing.xs,
  },
  errorSubtext: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.regular,
    color: Colors.neutral[500],
    marginBottom: Spacing.md,
  },
  errorActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  retryButton: {
    backgroundColor: Colors.primary[600],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    flex: 1,
  },
  retryButtonText: {
    color: 'white',
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
  openMoodTrackerButton: {
    backgroundColor: Colors.neutral[200],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    flex: 1,
  },
  openMoodTrackerButtonText: {
    color: Colors.neutral[700],
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
  refreshOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  gradient: {
    padding: Spacing['3xl'],
    minHeight: 200,
  },
  compactGradient: {
    padding: Spacing.lg,
    minHeight: 160,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  moodEmoji: {
    fontSize: 24,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[900],
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[800],
    marginBottom: Spacing.xs,
  },
  moodTime: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.regular,
    color: Colors.neutral[600],
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.regular,
    color: Colors.neutral[700],
    marginTop: Spacing.xs,
  },
  statNumber: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[900],
    marginTop: Spacing.xs,
  },
  weeklyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  weeklyTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[900],
  },
  weeklyBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weeklyBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  weeklyDay: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.regular,
    color: Colors.neutral[600],
    marginBottom: Spacing.xs,
  },
  todayDay: {
    color: Colors.neutral[900],
    fontWeight: '600',
  },
  moodContainer: {
    alignItems: 'center',
  },
  weeklyEmoji: {
    fontSize: 16,
    marginBottom: Spacing.xs,
  },
  todayEmoji: {
    fontSize: 20,
  },
  moodName: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.regular,
    color: Colors.neutral[700],
    textAlign: 'center',
  },
  todayMoodName: {
    color: Colors.neutral[900],
    fontWeight: '600',
    fontSize: 12,
  },
});
