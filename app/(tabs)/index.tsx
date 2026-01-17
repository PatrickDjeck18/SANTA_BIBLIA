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
  useColorScheme,
  Share,
} from 'react-native';
import { router } from 'expo-router';
import { AppTheme } from '@/constants/AppTheme';
import { Colors, Shadows, BorderRadius, Spacing, Typography } from '@/constants/DesignTokens';
import { useUnifiedMoodTracker } from '@/hooks/useUnifiedMoodTracker';
import { useUnifiedPrayers } from '@/hooks/useUnifiedPrayers';
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
  Crown,
  Sparkles,
  Share as ShareIcon,
} from 'lucide-react-native';
import { useSubscription } from '@/context/SubscriptionContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const STREAK_KEY = '@daily_bread_streak';
const LAST_VISIT_KEY = '@daily_bread_last_visit';

export default function HomeScreen() {
  const { moodEntries } = useUnifiedMoodTracker();
  const { prayers } = useUnifiedPrayers();
  const { isPremium } = useSubscription();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Streak state
  const [streakCount, setStreakCount] = useState(0);

  // Load and update streak on app open
  useEffect(() => {
    const updateStreak = async () => {
      try {
        const today = new Date().toDateString();
        const lastVisit = await AsyncStorage.getItem(LAST_VISIT_KEY);
        const savedStreak = await AsyncStorage.getItem(STREAK_KEY);
        let currentStreak = savedStreak ? parseInt(savedStreak, 10) : 0;

        if (lastVisit === today) {
          // Already visited today, just show current streak
          setStreakCount(currentStreak);
          return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        if (lastVisit === yesterdayStr) {
          // Visited yesterday, increment streak
          currentStreak += 1;
        } else if (lastVisit) {
          // Missed a day, reset streak
          currentStreak = 1;
        } else {
          // First visit ever
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

  const currentDayIndex = new Date().getDay(); // 0-6 Sun-Sat
  // Adjust to make Monday index 0 for the UI
  const uiDayIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const todaysVerse = useMemo(() => ({
    text: "The Lord is with me; I will not be afraid.",
    reference: "Psalm 118:6"
  }), []);

  // Daily inspirational quotes with prayers from various authors
  const dailyQuotes = useMemo(() => [
    {
      quote: "God can't give us peace and happiness apart from Himself because there is no such thing.",
      author: "C.S. Lewis",
      prayer: "Lord, help me find my peace and joy in You alone, not in the things of this world. Amen."
    },
    {
      quote: "Pray as though everything depended on God. Work as though everything depended on you.",
      author: "Saint Augustine",
      prayer: "Father, help me balance trust in You with faithful action in my daily life. Amen."
    },
    {
      quote: "God never said that the journey would be easy, but He did say that the arrival would be worthwhile.",
      author: "Max Lucado",
      prayer: "Lord, strengthen me for today's journey, knowing the destination is worth every step. Amen."
    },
    {
      quote: "Faith is taking the first step even when you don't see the whole staircase.",
      author: "Martin Luther King Jr.",
      prayer: "God, give me courage to step forward in faith, trusting You to light my path. Amen."
    },
    {
      quote: "If you can't fly then run, if you can't run then walk, if you can't walk then crawl, but whatever you do you have to keep moving forward.",
      author: "Martin Luther King Jr.",
      prayer: "Father, help me persevere no matter what obstacles I face today. Amen."
    },
    {
      quote: "God loves each of us as if there were only one of us.",
      author: "Saint Augustine",
      prayer: "Lord, let me rest in Your personal, infinite love for me today. Amen."
    },
    {
      quote: "Never be afraid to trust an unknown future to a known God.",
      author: "Corrie ten Boom",
      prayer: "Jesus, I surrender my fears about tomorrow into Your capable hands. Amen."
    },
    {
      quote: "Worry does not empty tomorrow of its sorrow, it empties today of its strength.",
      author: "Corrie ten Boom",
      prayer: "Father, free me from anxiety and fill me with Your peace and power today. Amen."
    },
    {
      quote: "The will of God will never take you where the grace of God cannot keep you.",
      author: "Billy Graham",
      prayer: "Lord, I trust that wherever You lead me, Your grace will sustain me. Amen."
    },
    {
      quote: "God has given us two hands, one to receive with and the other to give with.",
      author: "Billy Graham",
      prayer: "Father, make me generous with all the blessings You've given me. Amen."
    },
    {
      quote: "Do not let what you cannot do interfere with what you can do.",
      author: "John Wooden",
      prayer: "God, help me focus on the abilities You've given me and use them fully. Amen."
    },
    {
      quote: "God doesn't call the qualified, He qualifies the called.",
      author: "Mark Batterson",
      prayer: "Lord, equip me for the calling You've placed on my life. Amen."
    },
    {
      quote: "Not all of us can do great things. But we can do small things with great love.",
      author: "Mother Teresa",
      prayer: "Jesus, help me show Your love in the small moments of today. Amen."
    },
    {
      quote: "If you judge people, you have no time to love them.",
      author: "Mother Teresa",
      prayer: "Father, replace my judgmental thoughts with compassion and understanding. Amen."
    },
    {
      quote: "Yesterday is gone. Tomorrow has not yet come. We have only today. Let us begin.",
      author: "Mother Teresa",
      prayer: "Lord, help me live fully present in this day You've given me. Amen."
    },
    {
      quote: "God has a purpose for your pain, a reason for your struggle, and a gift for your faithfulness.",
      author: "Unknown",
      prayer: "Father, help me trust Your purpose even when I don't understand my circumstances. Amen."
    },
    {
      quote: "When you go through deep waters, I will be with you.",
      author: "Isaiah 43:2",
      prayer: "Lord, thank You for never leaving me, especially in life's hardest moments. Amen."
    },
    {
      quote: "Joy does not simply happen to us. We have to choose joy and keep choosing it every day.",
      author: "Henri Nouwen",
      prayer: "God, I choose joy today regardless of my circumstances. Amen."
    },
    {
      quote: "Our greatest fear should not be of failure but of succeeding at things in life that don't really matter.",
      author: "Francis Chan",
      prayer: "Father, align my priorities with Your eternal purposes. Amen."
    },
    {
      quote: "God is most glorified in us when we are most satisfied in Him.",
      author: "John Piper",
      prayer: "Lord, let my deepest satisfaction be found in knowing You. Amen."
    },
    {
      quote: "A man who was completely innocent offered himself as a sacrifice for the good of others. It was a perfect act.",
      author: "Mahatma Gandhi",
      prayer: "Jesus, thank You for Your perfect sacrifice. Help me live sacrificially for others. Amen."
    },
    {
      quote: "God writes the gospel not in the Bible alone, but on trees and flowers and clouds and stars.",
      author: "Martin Luther",
      prayer: "Father, open my eyes to see Your glory in creation today. Amen."
    },
    {
      quote: "There is not a single moment in which God does not present Himself under the cover of some pain to be endured, some consolation to be enjoyed, or some duty to be performed.",
      author: "Jean-Pierre de Caussade",
      prayer: "Lord, help me recognize Your presence in every moment of this day. Amen."
    },
    {
      quote: "God does not give us everything we want, but He does fulfill His promises.",
      author: "Dietrich Bonhoeffer",
      prayer: "Father, I trust in Your promises even when my prayers go unanswered. Amen."
    },
    {
      quote: "The Christian life is not a constant high. I have my moments of deep discouragement.",
      author: "Billy Graham",
      prayer: "Lord, thank You that it's okay to struggle. Meet me in my low moments. Amen."
    },
    {
      quote: "We are not makers of history. We are made by history.",
      author: "Martin Luther King Jr.",
      prayer: "God, use my life as part of Your great story of redemption. Amen."
    },
    {
      quote: "Be faithful in small things because it is in them that your strength lies.",
      author: "Mother Teresa",
      prayer: "Father, help me be faithful in the small responsibilities You've given me. Amen."
    },
    {
      quote: "I have held many things in my hands, and I have lost them all; but whatever I have placed in God's hands, that I still possess.",
      author: "Martin Luther",
      prayer: "Lord, I place everything I hold dear into Your faithful hands. Amen."
    },
    {
      quote: "The measure of a life is not its duration, but its donation.",
      author: "Corrie ten Boom",
      prayer: "Father, help me live a life that gives rather than takes. Amen."
    },
    {
      quote: "Let God's promises shine on your problems.",
      author: "Corrie ten Boom",
      prayer: "Lord, let Your Word illuminate every dark situation I face today. Amen."
    },
    {
      quote: "A room without books is like a body without a soul.",
      author: "Marcus Tullius Cicero",
      prayer: "God, cultivate in me a love for wisdom and Your Word. Amen."
    },
  ], []);

  const dayOfYear = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }, []);

  const todaysQuote = dailyQuotes[dayOfYear % dailyQuotes.length];

  const onShareQuote = async () => {
    try {
      const result = await Share.share({
        message: `"${todaysQuote.quote}" - ${todaysQuote.author}\n\nRead more in the Daily Bread app!`,
        title: 'Daily Inspiration',
      });
    } catch (error) {
      console.error('Error sharing quote:', error);
    }
  };

  // Calculate dates for the current week (Monday to Sunday)
  const weekDates = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
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
    ]).start();
  }, []);

  const DailyItemCard = ({
    icon,
    title,
    meta,
    onPress,
    delay = 0
  }: {
    icon: React.ReactNode,
    title: string,
    meta: string,
    onPress: () => void,
    delay?: number
  }) => (
    <TouchableOpacity
      style={styles.dailyItemCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.dailyItemContent}>
        <View style={styles.dailyItemIcon}>{icon}</View>
        <Text style={styles.dailyItemTitle}>{title}</Text>
      </View>
      <Text style={styles.dailyItemMeta}>{meta}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <Text style={styles.greetingText}>Connect with God</Text>
            </View>

            <View style={styles.headerActions}>
              <View style={styles.streakBadge}>
                <Zap size={14} color={AppTheme.accent.primary} fill={AppTheme.accent.primary} />
                <Text style={styles.streakText}>{streakCount}</Text>
              </View>
            </View>
          </View>

          {/* Week Selector */}
          <View style={styles.weekSelector}>
            {weekDays.map((day, index) => {
              const isActive = index === uiDayIndex;
              return (
                <View key={index} style={styles.dayColumn}>
                  <Text style={styles.dayText}>
                    {day}
                  </Text>
                  <View style={styles.dateCircleContainer}>
                    {isActive && <View style={styles.activeDayIndicator} />}
                    <Text style={[
                      styles.dateText,
                      isActive && styles.activeDateText
                    ]}>
                      {weekDates[index]}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Main Content Card */}
        <Animated.View style={[
          styles.mainCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <View style={styles.mainCardContent}>
            <Text style={styles.dateLabel}>
              {new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              }).toUpperCase()}
            </Text>



            <Text style={styles.sectionLabel}>DAILY DEVOTIONAL</Text>

            {/* Quote Card */}
            <View style={styles.quoteCard}>
              <View style={styles.quoteCardHeader}>
                <View style={styles.quoteHeaderLeft}>
                  <Feather size={20} color={AppTheme.text.primary} />
                  <Text style={styles.quoteLabel}>Daily Quote</Text>
                </View>
                <TouchableOpacity onPress={onShareQuote} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <ShareIcon size={20} color={AppTheme.text.primary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.quoteIntro}>TODAY'S QUOTE FROM:</Text>
              <Text style={styles.quoteAuthor}>{todaysQuote.author}</Text>

              <Text style={styles.quoteText}>"{todaysQuote.quote}"</Text>

              <View style={styles.prayerSection}>
                <Text style={styles.prayerLabel}>🙏 TODAY'S PRAYER</Text>
                <Text style={styles.prayerText}>{todaysQuote.prayer}</Text>
              </View>
            </View>

            {/* Daily Items List */}
            <View style={styles.dailyItemsList}>
              <DailyItemCard
                icon={<BookOpen size={20} color={AppTheme.text.primary} />}
                title="Passage"
                meta=""
                onPress={() => router.push('/(tabs)/bible')}
              />

              <DailyItemCard
                icon={<MessageCircle size={20} color={AppTheme.text.primary} />}
                title="Bible Study Notes"
                meta=""
                onPress={() => router.push('/bible-study-notes')}
              />

              <DailyItemCard
                icon={<View style={{ transform: [{ rotate: '-45deg' }] }}><Users size={20} color={AppTheme.text.primary} /></View>} // Using Users as Hands placeholder
                title="Prayer"
                meta=""
                onPress={() => router.push('/(tabs)/prayer-tracker')}
              />

              {/* Added Mood Tracker to fit the list style */}
              <DailyItemCard
                icon={<Play size={20} color={AppTheme.text.primary} />}
                title="Mood Check-in"
                meta=""
                onPress={() => router.push('/(tabs)/mood-tracker')}
              />
            </View>

            {/* Remove Ads Card - Only show for non-premium iOS users */}
            {Platform.OS !== 'android' && !isPremium && (
              <TouchableOpacity
                style={styles.removeAdsCard}
                onPress={() => router.push('/paywall')}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#1a1a2e', '#16213e']}
                  style={styles.removeAdsGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.removeAdsContent}>
                    <View style={styles.removeAdsLeft}>
                      <View style={styles.removeAdsIconContainer}>
                        <Zap size={24} color="#F97316" />
                      </View>
                      <View style={styles.removeAdsTextContainer}>
                        <Text style={styles.removeAdsTitle}>Go Ad-Free</Text>
                        <Text style={styles.removeAdsSubtitle}>Enjoy without interruptions • $3.99/mo</Text>
                      </View>
                    </View>
                    <View style={styles.removeAdsButton}>
                      <Text style={styles.removeAdsButtonText}>Remove Ads</Text>
                    </View>
                  </View>
                  {/* Decorative sparkles */}
                  <View style={styles.sparkleDecor1}>
                    <Sparkles size={12} color="rgba(249, 115, 22, 0.3)" />
                  </View>
                  <View style={styles.sparkleDecor2}>
                    <Sparkles size={10} color="rgba(249, 115, 22, 0.2)" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}

          </View>
        </Animated.View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5EF', // Matches the warm cream bg
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD8B4', // Light orange
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
  },
  greetingText: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    ...Shadows.sm,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D97706',
  },
  communityBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFD8B4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  dayColumn: {
    alignItems: 'center',
    gap: 6,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C2410C',
  },
  activeDayText: {
    color: '#C2410C',
  },
  dateCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C2410C',
    zIndex: 1,
  },
  activeDateText: {
    color: '#FFFFFF',
  },
  activeDayIndicator: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EA580C',
  },
  viewCalendarBtn: {
    marginBottom: Spacing.sm,
  },
  viewCalendarText: {
    color: '#EA580C',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Main Card Styles
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    minHeight: Dimensions.get('window').height * 0.7,
    paddingHorizontal: Spacing.md,
    paddingTop: 32,
    ...Shadows.md,
  },
  mainCardContent: {
    gap: Spacing.md,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    flex: 1,
    marginRight: Spacing.md,
    lineHeight: 34,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },

  // Quote Card
  quoteCard: {
    backgroundColor: '#FAF5EF',
    borderRadius: 24,
    padding: 24,
    marginBottom: Spacing.lg,
  },
  quoteCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quoteHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quoteLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  quoteIntro: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  quoteAuthor: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  quoteText: {
    fontSize: 17,
    fontWeight: '500',
    fontStyle: 'italic',
    color: '#475569',
    lineHeight: 26,
    marginBottom: 20,
  },
  prayerSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  prayerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: AppTheme.accent.primary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  prayerText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#475569',
    lineHeight: 22,
  },
  readButton: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  readButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 1,
  },

  // Daily List Items
  dailyItemsList: {
    gap: Spacing.md,
  },
  dailyItemCard: {
    backgroundColor: '#FAF5EF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dailyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dailyItemIcon: {
    width: 24,
    alignItems: 'center',
  },
  dailyItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  dailyItemMeta: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.5,
  },

  // Remove Ads Card Styles
  removeAdsCard: {
    marginTop: Spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  removeAdsGradient: {
    padding: 20,
    position: 'relative',
  },
  removeAdsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  removeAdsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  removeAdsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeAdsTextContainer: {
    flex: 1,
  },
  removeAdsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  removeAdsSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  removeAdsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F97316',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  removeAdsButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sparkleDecor1: {
    position: 'absolute',
    top: 10,
    right: 80,
  },
  sparkleDecor2: {
    position: 'absolute',
    bottom: 12,
    left: 60,
  },
});