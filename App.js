import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Animated } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { ModernHeader } from './components/ModernHeader';

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

function BibleReaderScreen({ onBack }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ModernHeader
        title="Bible Reader"
        showBackButton={true}
        onBackPress={onBack}
        variant="default"
      />

      <ScrollView style={styles.content}>
        <View style={styles.verseCard}>
          <Text style={styles.verseReference}>John 3:16</Text>
          <Text style={styles.verseText}>
            "For God so loved the world that he gave his one and only Son,
            that whoever believes in him shall not perish but have eternal life."
          </Text>
        </View>

        <View style={styles.verseCard}>
          <Text style={styles.verseReference}>Psalm 23:1</Text>
          <Text style={styles.verseText}>
            "The Lord is my shepherd, I lack nothing."
          </Text>
        </View>

        <View style={styles.verseCard}>
          <Text style={styles.verseReference}>Romans 8:28</Text>
          <Text style={styles.verseText}>
            "And we know that in all things God works for the good of those
            who love him, who have been called according to his purpose."
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function DailyVerseScreen({ onBack }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ModernHeader
        title="Daily Verse"
        showBackButton={true}
        onBackPress={onBack}
        variant="default"
      />

      <View style={styles.content}>
        <View style={styles.dailyVerseContainer}>
          <Text style={styles.dateText}>September 21, 2025</Text>
          <View style={styles.featuredVerse}>
            <Text style={styles.verseReference}>Philippians 4:13</Text>
            <Text style={styles.featuredVerseText}>
              "I can do all this through him who gives me strength."
            </Text>
          </View>

          <View style={styles.reflectionCard}>
            <Text style={styles.reflectionTitle}>Daily Reflection</Text>
            <Text style={styles.reflectionText}>
              Today's verse reminds us that our strength comes from God.
              Whatever challenges we face, we can overcome them through His power.
              Take a moment to pray and surrender your worries to Him.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => Alert.alert('Share Verse', 'Sharing feature coming soon!')}
          >
            <Text style={styles.shareButtonText}>Share This Verse</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function HomeScreen({ onNavigate }) {
  const insets = useSafeAreaInsets();

  const quickActions = [
    {
      id: 'bible',
      icon: '📖',
      title: 'Bible Reader',
      description: 'Continue in John 3',
      onPress: () => onNavigate('bible'),
    },
    {
      id: 'verse',
      icon: '✨',
      title: 'Daily Verse',
      description: "Today's inspiration",
      onPress: () => onNavigate('verse'),
    },
    {
      id: 'focus',
      icon: '🕊️',
      title: 'Quiet Time',
      description: 'Schedule reminders',
      onPress: () => Alert.alert('Coming Soon', 'Quiet time reminders arrive shortly.'),
    },
  ];

  const insightCards = [
    {
      id: 'journal',
      icon: '📝',
      title: 'Prayer Journal',
      description: "Capture today's gratitude and petitions.",
    },
    {
      id: 'plan',
      icon: '📅',
      title: 'Reading Plan',
      description: '3-day “Peace & Hope” plan in progress.',
    },
  ];

  return (
    <View style={styles.container}>
      <ModernHeader
        title="Daily Bible KJV"
        showNotificationButton={true}
        badgeCount={2}
        onNotificationPress={() => Alert.alert('Notifications', 'You have 2 unread reminders')}
        showProfileButton={true}
        onProfilePress={() => Alert.alert('Profile', 'Profile settings coming soon')}
        variant="default"
      />
      <ScrollView
        contentContainerStyle={styles.homeScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Modern Hero Section with Solid Color */}
        <View style={styles.hero}>
          <View style={styles.heroInner}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroTextBlock}>
                <View style={styles.heroBadgeContainer}>
                  <Text style={styles.heroBadge}>KJV Bible</Text>
                </View>
                <Text style={styles.heroHeading}>Modern quiet time hub</Text>
                <Text style={styles.heroSubHeading}>
                  Stay rooted in scripture with curated flows and streak tracking.
                </Text>
              </View>
              <View style={styles.streakPill}>
                <Text style={styles.streakNumber}>12</Text>
                <Text style={styles.streakLabel}>day streak</Text>
              </View>
            </View>

            <View style={styles.heroStatsRow}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>03</Text>
                <Text style={styles.heroStatLabel}>Plans active</Text>
              </View>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>15m</Text>
                <Text style={styles.heroStatLabel}>Avg prayer</Text>
              </View>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>24</Text>
                <Text style={styles.heroStatLabel}>Verses saved</Text>
              </View>
            </View>
          </View>

          {/* Decorative Elements */}
          <View style={styles.heroDecor1} />
          <View style={styles.heroDecor2} />
        </View>

        <View style={styles.mainSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick actions</Text>
            <TouchableOpacity
              onPress={() => Alert.alert('Coming Soon', 'More actions are on the way.')}
            >
              <Text style={styles.sectionLink}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={action.onPress}
              >
                <View style={styles.actionIconWrap}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                </View>
                <View style={styles.actionTextWrap}>
                  <Text style={styles.actionCardTitle}>{action.title}</Text>
                  <Text style={styles.actionCardDescription}>{action.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureCardLabel}>Verse of the day</Text>
            <Text style={styles.featureCardReference}>Philippians 4:13</Text>
            <Text style={styles.featureCardText}>
              “I can do all things through Christ which strengtheneth me.”
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => onNavigate('verse')}
            >
              <Text style={styles.primaryButtonText}>Open devotion</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dualCardRow}>
            {insightCards.map((card) => (
              <View key={card.id} style={styles.miniCard}>
                <Text style={styles.miniCardIcon}>{card.icon}</Text>
                <Text style={styles.miniCardTitle}>{card.title}</Text>
                <Text style={styles.miniCardDescription}>{card.description}</Text>
              </View>
            ))}
          </View>

          <View style={styles.scheduleCard}>
            <View>
              <Text style={styles.scheduleTitle}>Next quiet time</Text>
              <Text style={styles.scheduleSubtitle}>Tonight · 9:00 PM · Psalms 27</Text>
            </View>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => Alert.alert('Reminder', 'Scheduling controls coming soon.')}
            >
              <Text style={styles.secondaryButtonText}>Adjust</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <StatusBar style="light" />
    </View>
  );
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');

  const navigateToScreen = (screen) => {
    setCurrentScreen(screen);
  };

  const navigateBack = () => {
    setCurrentScreen('home');
  };

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'bible':
        return <BibleReaderScreen onBack={navigateBack} />;
      case 'verse':
        return <DailyVerseScreen onBack={navigateBack} />;
      default:
        return <HomeScreen onNavigate={navigateToScreen} />;
    }
  };

  return (
    <SafeAreaProvider>
      {renderScreen()}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F', // Deep dark modern background
  },
  // Removed custom header styles as we now use ModernHeader
  homeScroll: {
    paddingBottom: 40,
    paddingTop: 16,
  },
  // Modern Hero Section
  hero: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 28,
    backgroundColor: '#1A1A2E',
    borderRadius: 32,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  heroInner: {
    padding: 24,
    zIndex: 2,
  },
  heroDecor1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#7C3AED',
    opacity: 0.15,
  },
  heroDecor2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EC4899',
    opacity: 0.1,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroTextBlock: {
    flex: 1,
    marginRight: 16,
  },
  heroBadgeContainer: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  heroBadge: {
    color: '#A78BFA',
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  heroHeading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  heroSubHeading: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  streakPill: {
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.25)',
  },
  streakNumber: {
    fontSize: 28,
    color: '#F472B6',
    fontWeight: '800',
  },
  streakLabel: {
    color: 'rgba(244, 114, 182, 0.8)',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
    marginTop: 2,
  },
  heroStatsRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  heroStat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  heroStatValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  mainSection: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  sectionLink: {
    color: '#A78BFA',
    fontWeight: '600',
    fontSize: 14,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#16162A',
    borderRadius: 24,
    padding: 18,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  actionIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
  },
  actionIcon: {
    fontSize: 24,
  },
  actionTextWrap: {
    marginTop: 14,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  actionCardDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
    lineHeight: 18,
  },
  featureCard: {
    backgroundColor: '#16162A',
    borderRadius: 28,
    padding: 24,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  featureCardLabel: {
    color: '#A78BFA',
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  featureCardReference: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: 10,
    letterSpacing: -0.5,
  },
  featureCardText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: '#7C3AED',
    alignSelf: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  dualCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 12,
  },
  miniCard: {
    width: '48%',
    backgroundColor: '#16162A',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  miniCardIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  miniCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  miniCardDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 18,
  },
  scheduleCard: {
    backgroundColor: '#16162A',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scheduleSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  secondaryButton: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  secondaryButtonText: {
    color: '#A78BFA',
    fontWeight: '700',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0A0A0F',
  },
  card: {
    backgroundColor: '#16162A',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
  },
  // Bible Reader Styles
  verseCard: {
    backgroundColor: '#16162A',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  verseReference: {
    fontSize: 16,
    fontWeight: '700',
    color: '#A78BFA',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  verseText: {
    fontSize: 16,
    lineHeight: 26,
    color: 'rgba(255,255,255,0.85)',
  },
  // Prayer Journal Styles
  addPrayerButton: {
    backgroundColor: '#7C3AED',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  addPrayerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  prayerCard: {
    backgroundColor: '#16162A',
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  prayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  prayerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  prayerDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  prayerContent: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
  },
  // Daily Verse Styles
  dailyVerseContainer: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  featuredVerse: {
    backgroundColor: '#16162A',
    padding: 28,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  featuredVerseText: {
    fontSize: 19,
    lineHeight: 30,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  reflectionCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    padding: 22,
    borderRadius: 20,
    marginBottom: 28,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  reflectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FCD34D',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  reflectionText: {
    fontSize: 15,
    lineHeight: 24,
    color: 'rgba(252, 211, 77, 0.85)',
  },
  shareButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
