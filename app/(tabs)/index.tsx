import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  StatusBar,
  Share,
} from 'react-native';
import { router } from 'expo-router';
import { AppTheme } from '@/constants/AppTheme';
import { Colors, Shadows, BorderRadius, Spacing, Typography } from '@/constants/DesignTokens';
import { useUnifiedMoodTracker } from '@/hooks/useUnifiedMoodTracker';
import { useUnifiedPrayers } from '@/hooks/useUnifiedPrayers';
import { GuestMoodEntry } from '@/utils/guestStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Heart,
  BookOpen,
  MessageCircle,
  Feather,
  Users,
  Zap,
  ChevronRight,
  Play,
  Share as ShareIcon,
  Sparkles,
  Flame,
  Calendar,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  GlassCard,
  FloatingPill,
  StatBadge,
  MoodOrb,
  MoodSummary,
  type MoodType,
} from '@/components/modern';
import { useModernTheme, GradientPresets } from '@/hooks/useModernTheme';

const { width } = Dimensions.get('window');

const STREAK_KEY = '@daily_bread_streak';
const LAST_VISIT_KEY = '@daily_bread_last_visit';

export default function HomeScreen() {
  const { moodEntries } = useUnifiedMoodTracker();
  const { prayers } = useUnifiedPrayers();
  const theme = useModernTheme();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const heroScaleAnim = useRef(new Animated.Value(0.95)).current;

  // Streak state
  const [streakCount, setStreakCount] = useState(0);
  const [todayMood, setTodayMood] = useState<MoodType | undefined>();

  // Load and update streak on app open
  useEffect(() => {
    const updateStreak = async () => {
      try {
        const today = new Date().toDateString();
        const lastVisit = await AsyncStorage.getItem(LAST_VISIT_KEY);
        const savedStreak = await AsyncStorage.getItem(STREAK_KEY);
        let currentStreak = savedStreak ? parseInt(savedStreak, 10) : 0;

        if (lastVisit === today) {
          setStreakCount(currentStreak);
          return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        if (lastVisit === yesterdayStr) {
          currentStreak += 1;
        } else if (lastVisit) {
          currentStreak = 1;
        } else {
          currentStreak = 1;
        }

        await AsyncStorage.setItem(STREAK_KEY, currentStreak.toString());
        await AsyncStorage.setItem(LAST_VISIT_KEY, today);
        setStreakCount(currentStreak);
      } catch (error) {
        console.error('Error updating streak:', error);
        setStreakCount(1);
      }
    };

    updateStreak();
  }, []);

  // Get today's mood if exists
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = moodEntries.find(entry =>
      entry.entry_date === today
    );
    if (todayEntry) {
      setTodayMood(todayEntry.mood_type as MoodType);
    }
  }, [moodEntries]);

  const currentDayIndex = new Date().getDay();
  const uiDayIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;
  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  const todaysVerse = useMemo(() => ({
    text: "El Señor está conmigo; no tendré miedo.",
    reference: "Salmo 118:6"
  }), []);

  const onShareVerse = async () => {
    try {
      await Share.share({
        message: `"${todaysVerse.text}" - ${todaysVerse.reference}\n\nLee más en la app Santa Biblia!`,
        title: 'Versículo del Día',
      });
    } catch (error) {
      console.error('Error sharing verse:', error);
    }
  };

  // Calculate dates for the current week
  const weekDates = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date.getDate();
    });
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true
      }),
      Animated.spring(heroScaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 12,
        useNativeDriver: true
      }),
    ]).start();
  }, []);

  // Calculate mood stats
  const moodStats = useMemo(() => {
    const total = moodEntries.length;
    if (total === 0) return { topMood: undefined, currentStreak: 0, total };

    const moodCounts: Record<string, number> = {};
    moodEntries.forEach(entry => {
      moodCounts[entry.mood_type] = (moodCounts[entry.mood_type] || 0) + 1;
    });

    const topMood = Object.entries(moodCounts)
      .sort((a, b) => b[1] - a[1])[0];

    return {
      topMood: topMood ? { mood: topMood[0] as MoodType, count: topMood[1] } : undefined,
      currentStreak: streakCount,
      total
    };
  }, [moodEntries, streakCount]);

  return (
    <View style={[styles.container, { backgroundColor: AppTheme.background.secondary }]}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Modern Daily Verse Card - White Style */}
        <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.verseCardWhite}>
            {/* Left Accent Bar */}
            <View style={styles.verseAccentBar} />

            <View style={styles.modernVerseContent}>
              {/* Header */}
              <View style={styles.verseHeaderWhite}>
                <View style={styles.verseTagWhite}>
                  <Feather size={14} color="#E15566" />
                  <Text style={styles.verseTagTextWhite}>Versículo del Día</Text>
                </View>
                <TouchableOpacity onPress={onShareVerse} style={styles.shareBtn}>
                  <ShareIcon size={18} color={AppTheme.text.secondary} />
                </TouchableOpacity>
              </View>

              {/* Quote Icon */}
              <Text style={styles.quoteIcon}>"</Text>

              {/* Verse Text */}
              <Text style={styles.modernVerseText}>
                {todaysVerse.text}
              </Text>

              {/* Reference */}
              <View style={styles.referenceBadge}>
                <Text style={styles.referenceBadgeText}>{todaysVerse.reference}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Week Selector - Modern Glass Pills */}
        <Animated.View
          style={[
            styles.weekSelectorContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weekSelector}
          >
            {weekDays.map((day, index) => {
              const isActive = index === uiDayIndex;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayPill,
                    isActive && styles.dayPillActive,
                    {
                      backgroundColor: isActive
                        ? AppTheme.accent.primary
                        : AppTheme.background.card,
                      borderColor: isActive ? AppTheme.accent.primary : AppTheme.border.light,
                    }
                  ]}
                >
                  <Text style={[
                    styles.dayPillDay,
                    { color: isActive ? '#FFFFFF' : AppTheme.text.secondary }
                  ]}>
                    {day}
                  </Text>
                  <Text style={[
                    styles.dayPillDate,
                    { color: isActive ? '#FFFFFF' : AppTheme.text.primary }
                  ]}>
                    {weekDates[index]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Quick Actions Grid */}
        <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={[styles.sectionTitle, { color: AppTheme.text.primary }]}>
            Acciones Rápidas
          </Text>

          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: AppTheme.background.card }]}
              onPress={() => router.push('/(tabs)/bible')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={AppTheme.gradients.purple}
                style={styles.actionIconBg}
              >
                <BookOpen size={24} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, { color: AppTheme.text.primary }]}>
                  Santa Biblia
                </Text>
                <Text style={[styles.actionSubtitle, { color: AppTheme.text.secondary }]}>
                  Lee la palabra
                </Text>
              </View>
              <ChevronRight size={20} color={AppTheme.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: AppTheme.background.card }]}
              onPress={() => router.push('/(tabs)/prayer-tracker')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={AppTheme.gradients.accent}
                style={styles.actionIconBg}
              >
                <Heart size={24} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, { color: AppTheme.text.primary }]}>
                  Oración
                </Text>
                <Text style={[styles.actionSubtitle, { color: AppTheme.text.secondary }]}>
                  Tiempo con Dios
                </Text>
              </View>
              <ChevronRight size={20} color={AppTheme.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: AppTheme.background.card }]}
              onPress={() => router.push('/(tabs)/mood-tracker')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={AppTheme.gradients.warning}
                style={styles.actionIconBg}
              >
                <Zap size={24} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, { color: AppTheme.text.primary }]}>
                  Ánimo
                </Text>
                <Text style={[styles.actionSubtitle, { color: AppTheme.text.secondary }]}>
                  Rastreador diario
                </Text>
              </View>
              <ChevronRight size={20} color={AppTheme.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: AppTheme.background.card }]}
              onPress={() => router.push('/bible-study-notes')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={AppTheme.gradients.success}
                style={styles.actionIconBg}
              >
                <MessageCircle size={24} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, { color: AppTheme.text.primary }]}>
                  Notas
                </Text>
                <Text style={[styles.actionSubtitle, { color: AppTheme.text.secondary }]}>
                  Tus reflexiones
                </Text>
              </View>
              <ChevronRight size={20} color={AppTheme.text.secondary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Bottom padding */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },

  // Hero Section
  heroSection: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    ...Shadows.lg,
  },
  heroGradient: {
    padding: Spacing.xl,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing['3xl'],
    minHeight: 200,
    position: 'relative',
  },
  heroDecorations: {
    ...StyleSheet.absoluteFillObject,
  },
  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -60,
    right: -60,
  },
  decorCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    bottom: -40,
    left: -40,
  },
  heroContent: {
    zIndex: 1,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  heroBadgeText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    fontSize: Typography.sizes.lg,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: Spacing.lg,
  },
  heroStats: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  streakPillText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: Typography.sizes.sm,
  },
  moodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  moodPillEmoji: {
    fontSize: 16,
  },
  moodPillText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: Typography.sizes.sm,
  },

  // Week Selector
  weekSelectorContainer: {
    marginBottom: Spacing.lg,
  },
  weekSelector: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  dayPill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    minWidth: 56,
  },
  dayPillActive: {
    borderWidth: 0,
  },
  dayPillDay: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    marginBottom: 2,
  },
  dayPillDate: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
  },

  // Modern Verse Card
  modernVerseCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    minHeight: 280,
    position: 'relative',
    overflow: 'hidden',
    ...Shadows.lg,
  },
  verseDecorations: {
    ...StyleSheet.absoluteFillObject,
  },
  verseDecorCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -40,
    right: -40,
  },
  verseDecorCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: -30,
    left: -30,
  },
  modernVerseContent: {
    zIndex: 1,
    flex: 1,
  },
  modernVerseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  verseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  verseTagText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: AppTheme.text.secondary,
  },
  shareBtn: {
    padding: Spacing.sm,
    backgroundColor: AppTheme.background.secondary,
    borderRadius: BorderRadius.full,
  },
  quoteIcon: {
    fontSize: 60,
    fontWeight: '700',
    color: 'rgba(249, 115, 22, 0.2)',
    marginBottom: -Spacing.md,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  modernVerseText: {
    fontSize: 22,
    fontWeight: '600',
    color: AppTheme.text.primary,
    lineHeight: 32,
    marginBottom: Spacing.lg,
    fontStyle: 'italic',
  },
  referenceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: AppTheme.accent.ultraLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  referenceBadgeText: {
    fontSize: Typography.sizes.base,
    fontWeight: '700',
    color: AppTheme.accent.primary,
  },

  // New White Card Styles
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing['3xl'],
    minHeight: 200,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AppTheme.border.light,
    ...Shadows.lg,
  },
  heroAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: AppTheme.accent.primary,
  },
  heroBadgeNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: AppTheme.accent.ultraLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  heroBadgeTextNew: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: AppTheme.accent.primary,
  },
  heroTitleNew: {
    fontSize: 32,
    fontWeight: '800',
    color: AppTheme.text.primary,
    marginBottom: Spacing.sm,
  },
  heroSubtitleNew: {
    fontSize: Typography.sizes.lg,
    color: AppTheme.text.secondary,
    marginBottom: Spacing.lg,
  },
  streakPillNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AppTheme.accent.ultraLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  streakPillTextNew: {
    color: AppTheme.accent.primary,
    fontWeight: '600',
    fontSize: Typography.sizes.sm,
  },
  moodPillNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AppTheme.background.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  moodPillTextNew: {
    color: AppTheme.text.primary,
    fontWeight: '600',
    fontSize: Typography.sizes.sm,
  },

  // Modern Verse Card - White Style
  verseCardWhite: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    minHeight: 260,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AppTheme.border.light,
    ...Shadows.lg,
  },
  verseAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    bottom: 0,
    backgroundColor: '#E15566',
  },
  verseHeaderWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  verseTagWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  verseTagTextWhite: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: '#E15566',
  },

  // Quick Actions
  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: '700',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  actionCard: {
    width: (width - (Spacing.lg * 2) - Spacing.md) / 2,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  actionContent: {
    marginBottom: Spacing.sm,
  },
  actionTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: '700',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: Typography.sizes.sm,
  },
});
