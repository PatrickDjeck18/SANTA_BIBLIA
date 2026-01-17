import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  useColorScheme,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';
import {
  Brain,
  Play,
  Trophy,
  Target,
  Sparkles,
  ChevronRight,
  Zap,
  Award,
} from 'lucide-react-native';
import { useQuizDatabase } from '@/hooks/useQuizDatabase';

const { width: screenWidth } = Dimensions.get('window');

const ThemeColors = {
  light: {
    background: '#F8FAFC',
    card: '#FFFFFF',
    cardGlass: 'rgba(255,255,255,0.9)',
    text: '#1E293B',
    subtext: '#64748B',
    border: 'rgba(0,0,0,0.06)',
    accent: '#8B5CF6',
    isDark: false,
  },
  dark: {
    background: '#0F0F1A',
    card: '#1E1E2E',
    cardGlass: 'rgba(30,30,46,0.9)',
    text: '#F1F5F9',
    subtext: 'rgba(255,255,255,0.6)',
    border: 'rgba(255,255,255,0.08)',
    accent: '#A78BFA',
    isDark: true,
  }
};

export default function QuizTabScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = ThemeColors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { stats, refreshStats } = useQuizDatabase();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const heroScale = useRef(new Animated.Value(0.9)).current;
  const cardAnimations = useRef([...Array(3)].map(() => new Animated.Value(0))).current;

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => refreshStats(), 300);
      return () => clearTimeout(timer);
    }, [])
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
      Animated.spring(heroScale, { toValue: 1, tension: 100, friction: 10, useNativeDriver: true }),
    ]).start();

    cardAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: 200 + index * 100,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const handleStartQuiz = () => {
    router.push('/bible-quiz');
  };

  const StatCard = ({
    icon,
    value,
    label,
    gradient,
    animValue,
  }: {
    icon: React.ReactNode;
    value: string | number;
    label: string;
    gradient: readonly [string, string, ...string[]];
    animValue: Animated.Value;
  }) => (
    <Animated.View style={[
      styles.statCard,
      {
        backgroundColor: theme.cardGlass,
        borderColor: theme.border,
        opacity: animValue,
        transform: [{ translateY: animValue.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
      }
    ]}>
      <LinearGradient
        colors={gradient}
        style={styles.statIconBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {icon}
      </LinearGradient>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.subtext }]}>{label}</Text>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <Animated.View style={[
          styles.heroSection,
          { transform: [{ scale: heroScale }], opacity: fadeAnim }
        ]}>
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Decorative Elements */}
            <View style={styles.heroDecoration}>
              <View style={[styles.decorCircle, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
              <View style={[styles.decorCircle2, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
            </View>

            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <Sparkles size={14} color="#FCD34D" />
                <Text style={styles.heroBadgeText}>Test Your Knowledge</Text>
              </View>

              <Text style={styles.heroTitle}>Bible Quiz</Text>
              <Text style={styles.heroSubtitle}>
                Challenge yourself with questions from Scripture and deepen your understanding of God's Word
              </Text>

              <View style={styles.heroIconContainer}>
                <Brain size={80} color="rgba(255,255,255,0.2)" />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            icon={<Trophy size={20} color="white" />}
            value={stats?.totalCorrect || 0}
            label="Correct"
            gradient={['#10B981', '#059669', '#047857']}
            animValue={cardAnimations[0]}
          />
          <StatCard
            icon={<Target size={20} color="white" />}
            value={stats?.totalQuestions || 0}
            label="Questions"
            gradient={['#3B82F6', '#2563EB', '#1D4ED8']}
            animValue={cardAnimations[1]}
          />
          <StatCard
            icon={<Award size={20} color="white" />}
            value={stats?.accuracy ? `${stats.accuracy}%` : '0%'}
            label="Accuracy"
            gradient={['#F59E0B', '#D97706', '#B45309']}
            animValue={cardAnimations[2]}
          />
        </View>

        {/* Start Quiz Card */}
        <Animated.View style={[
          styles.startCard,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
          <TouchableOpacity
            style={[styles.startCardInner, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}
            onPress={handleStartQuiz}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              style={styles.startIconBg}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Play size={28} color="white" />
            </LinearGradient>

            <View style={styles.startContent}>
              <Text style={[styles.startTitle, { color: theme.text }]}>Start New Quiz</Text>
              <Text style={[styles.startSubtitle, { color: theme.subtext }]}>
                200+ questions from the Bible
              </Text>
            </View>

            <View style={styles.startArrow}>
              <ChevronRight size={24} color={theme.accent} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Features List */}
        <Animated.View style={[styles.featuresSection, { opacity: fadeAnim }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Features</Text>

          {[
            { icon: <Zap size={20} color="#F59E0B" />, title: 'Quick Rounds', desc: '10 questions per quiz' },
            { icon: <Brain size={20} color="#8B5CF6" />, title: 'Learn & Grow', desc: 'Detailed explanations for each answer' },
            { icon: <Trophy size={20} color="#10B981" />, title: 'Track Progress', desc: 'See your improvement over time' },
          ].map((feature, index) => (
            <View
              key={index}
              style={[styles.featureItem, { backgroundColor: theme.cardGlass, borderColor: theme.border }]}
            >
              <View style={[styles.featureIcon, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                {feature.icon}
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: theme.text }]}>{feature.title}</Text>
                <Text style={[styles.featureDesc, { color: theme.subtext }]}>{feature.desc}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Bottom Spacing */}
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },

  // Hero Section
  heroSection: {
    marginBottom: Spacing.xl,
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
  heroDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  decorCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -50,
    right: -50,
  },
  decorCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    bottom: -30,
    left: -30,
  },
  heroContent: {
    zIndex: 10,
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
    fontWeight: '700',
    color: 'white',
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    fontSize: Typography.sizes.base,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
    maxWidth: '80%',
  },
  heroIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: -20,
    opacity: 0.5,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    ...Shadows.sm,
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: '500',
  },

  // Start Card
  startCard: {
    marginBottom: Spacing.xl,
  },
  startCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    ...Shadows.md,
  },
  startIconBg: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  startContent: {
    flex: 1,
  },
  startTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    marginBottom: 4,
  },
  startSubtitle: {
    fontSize: Typography.sizes.sm,
  },
  startArrow: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Features Section
  featuresSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: Typography.sizes.sm,
  },
});
