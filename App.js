import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

function BibleReaderScreen({ onBack }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📖 Bible Reader</Text>
      </View>

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

function PrayerJournalScreen({ onBack }) {
  const insets = useSafeAreaInsets();
  const [prayers] = useState([
    { id: 1, title: "Family Health", date: "Today", content: "Praying for my family's health and wellbeing" },
    { id: 2, title: "Work Guidance", date: "Yesterday", content: "Seeking God's guidance in my career decisions" },
    { id: 3, title: "Peace", date: "2 days ago", content: "Asking for peace during difficult times" }
  ]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🙏 Prayer Journal</Text>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity
          style={styles.addPrayerButton}
          onPress={() => Alert.alert('Add Prayer', 'Prayer entry feature coming soon!')}
        >
          <Text style={styles.addPrayerText}>+ Add New Prayer</Text>
        </TouchableOpacity>

        {prayers.map(prayer => (
          <View key={prayer.id} style={styles.prayerCard}>
            <View style={styles.prayerHeader}>
              <Text style={styles.prayerTitle}>{prayer.title}</Text>
              <Text style={styles.prayerDate}>{prayer.date}</Text>
            </View>
            <Text style={styles.prayerContent}>{prayer.content}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function DailyVerseScreen({ onBack }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>✨ Daily Verse</Text>
      </View>

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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>🙏 Daily Bread</Text>
        <Text style={styles.subtitle}>Bible Companion App</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => onNavigate('bible')}
        >
          <Text style={styles.cardIcon}>📖</Text>
          <Text style={styles.cardTitle}>Read Bible</Text>
          <Text style={styles.cardSubtitle}>Discover God's Word</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => onNavigate('prayer')}
        >
          <Text style={styles.cardIcon}>🙏</Text>
          <Text style={styles.cardTitle}>Prayer Journal</Text>
          <Text style={styles.cardSubtitle}>Track your prayers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => onNavigate('verse')}
        >
          <Text style={styles.cardIcon}>✨</Text>
          <Text style={styles.cardTitle}>Daily Verse</Text>
          <Text style={styles.cardSubtitle}>Inspiration for today</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Ready for Google Play Store</Text>
      </View>
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
      case 'prayer':
        return <PrayerJournalScreen onBack={navigateBack} />;
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#6366f1',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 40,
    padding: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#e0e7ff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  // Bible Reader Styles
  verseCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  verseReference: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 8,
  },
  verseText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  // Prayer Journal Styles
  addPrayerButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  addPrayerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  prayerCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  prayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  prayerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  prayerDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  prayerContent: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  // Daily Verse Styles
  dailyVerseContainer: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  featuredVerse: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
  },
  featuredVerseText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#1f2937',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  reflectionCard: {
    backgroundColor: '#fef3c7',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
  },
  reflectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  reflectionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#78350f',
  },
  shareButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
