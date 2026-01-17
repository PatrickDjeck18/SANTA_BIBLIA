import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar as RNStatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  Sparkles,
  Star,
  BookOpen,
  Heart,
  Trash2,
  Share,
  Download,
  Moon,
  Calendar,
  Clock
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/DesignTokens';
import { AppTheme } from '../constants/AppTheme';
import BackgroundGradient from '@/components/BackgroundGradient';
import { ModernHeader } from '@/components/ModernHeader';
import { DreamEntry } from '../lib/types/dreams';
import { DreamServiceGuest as DreamService } from '../lib/services/dreamServiceGuest';

import BannerAd from '@/components/BannerAd';
import { useInterstitialAds } from '@/hooks/useInterstitialAds';

const { width } = Dimensions.get('window');

export default function DreamResultScreen() {
  const params = useLocalSearchParams();
  // const { user, loading: authLoading } = useAuth(); // Removed auth
  const { showInterstitialAd } = useInterstitialAds('dream');
  const [dream, setDream] = useState<DreamEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDream = async () => {
      setLoading(true);

      try {
        const dreamId = params.dreamId as string;
        if (!dreamId) {
          throw new Error('No dream ID provided');
        }

        console.log('🔍 Loading dream with ID:', dreamId);

        let fetchedDream: DreamEntry | null = null;

        // Fetch dream for guest users
        const dreams = await DreamService.getDreams();
        fetchedDream = dreams.find(d => d.id === dreamId) || null;

        if (!fetchedDream) {
          throw new Error('Dream not found');
        }

        console.log('✅ Dream loaded successfully:', fetchedDream.title);
        setDream(fetchedDream);
      } catch (error) {
        console.error('❌ Error loading dream:', error);
        Alert.alert('Error', 'Failed to load dream details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadDream();
  }, [params.dreamId]);

  const handleBack = () => {
    if (router.canGoBack?.()) {
      router.back();
    } else {
      router.replace('/dream-interpretation');
    }
  };

  const handleShare = () => {
    // Implement sharing functionality
    Alert.alert('Share Dream', 'Sharing functionality would be implemented here.');
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Dream',
      'Are you sure you want to delete this dream? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DreamService.deleteDream(dream!.id);
              Alert.alert('Success', 'Dream deleted successfully.');
              handleBack();
            } catch (error) {
              console.error('Error deleting dream:', error);
              Alert.alert('Error', 'Failed to delete dream. Please try again.');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMoodEmoji = (mood: string) => {
    const moodEmojis: { [key: string]: string } = {
      'peaceful': '😌',
      'anxious': '😰',
      'joyful': '😊',
      'confused': '😕',
      'hopeful': '🙏'
    };
    return moodEmojis[mood] || '😐';
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#6B7280';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <RNStatusBar style="dark" />
        <BackgroundGradient variant="warm">
          <View style={styles.headerContainer}>
            <ModernHeader
              title="Dream Analysis"
              variant="simple"
              showBackButton={true}
              showReaderButton={false}
              onBackPress={handleBack}
            />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary[600]} />
            <Text style={styles.loadingText}>Loading your dream analysis...</Text>
          </View>
        </BackgroundGradient>
      </SafeAreaView>
    );
  }

  if (!dream) {
    return (
      <SafeAreaView style={styles.container}>
        <RNStatusBar style="dark" />
        <BackgroundGradient variant="warm">
          <View style={styles.headerContainer}>
            <ModernHeader
              title="Dream Analysis"
              variant="simple"
              showBackButton={true}
              showReaderButton={false}
              onBackPress={handleBack}
            />
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Dream not found</Text>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </BackgroundGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar style="dark" />
      <BackgroundGradient variant="warm">
        {/* Header */}
        <View style={styles.headerContainer}>
          <ModernHeader
            title="Dream Analysis"
            variant="simple"
            showBackButton={true}
            showReaderButton={false}
            onBackPress={handleBack}
            readerText={`Dream Analysis: ${dream.title}. ${dream.interpretation}`}
          />
        </View>

        {/* Banner Ad */}
        <BannerAd placement="dream" />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Dream Header Card */}
          <View style={styles.dreamHeaderCard}>
            <LinearGradient
              colors={AppTheme.gradients.hero}
              style={styles.dreamHeaderGradient}
            >
              <View style={styles.dreamHeaderContent}>
                <View style={styles.dreamTitleRow}>
                  <View style={styles.dreamIcon}>
                    <Moon size={24} color="white" />
                  </View>
                  <View style={styles.dreamTitleContent}>
                    <Text style={styles.dreamTitle}>{dream.title}</Text>
                    <View style={styles.dreamMetaRow}>
                      <View style={styles.dreamMetaItem}>
                        <Calendar size={14} color="rgba(255, 255, 255, 0.8)" />
                        <Text style={styles.dreamMetaText}>{formatDate(dream.date)}</Text>
                      </View>
                      <View style={styles.dreamMetaItem}>
                        <Text style={styles.moodEmoji}>{getMoodEmoji(dream.mood)}</Text>
                        <Text style={styles.dreamMetaText}>{dream.mood}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {dream.significance && (
                  <View style={[
                    styles.significanceBadge,
                    { backgroundColor: getSignificanceColor(dream.significance) }
                  ]}>
                    <Text style={styles.significanceText}>
                      {dream.significance.toUpperCase()} SIGNIFICANCE
                    </Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </View>

          {/* Dream Description */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Moon size={24} color={AppTheme.accent.primary} />
              </View>
              <Text style={styles.sectionTitle}>Dream Description</Text>
            </View>
            <Text style={styles.sectionText}>{dream.description}</Text>
          </View>

          {/* AI Interpretation */}
          {dream.interpretation && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Sparkles size={24} color={AppTheme.accent.primary} />
                </View>
                <Text style={styles.sectionTitle}>AI Interpretation</Text>
              </View>
              <LinearGradient
                colors={AppTheme.gradients.success}
                style={styles.interpretationCard}
              >
                <View style={styles.interpretationHeader}>
                  <Sparkles size={20} color="white" />
                  <Text style={[styles.interpretationTitle, { color: 'white' }]}>Biblical Analysis</Text>
                </View>
                <Text style={[styles.interpretationContent, { color: 'white' }]}>{dream.interpretation}</Text>
              </LinearGradient>
            </View>
          )}

          {/* Spiritual Meaning */}
          {dream.spiritual_meaning && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Star size={24} color={AppTheme.accent.primary} />
                </View>
                <Text style={styles.sectionTitle}>Spiritual Meaning</Text>
              </View>
              <LinearGradient
                colors={AppTheme.gradients.warning}
                style={styles.spiritualMeaningCard}
              >
                <View style={styles.spiritualMeaningHeader}>
                  <Star size={20} color="white" />
                  <Text style={[styles.spiritualMeaningTitle, { color: 'white' }]}>Spiritual Insights</Text>
                </View>
                <Text style={[styles.spiritualMeaningContent, { color: 'white' }]}>{dream.spiritual_meaning}</Text>
              </LinearGradient>
            </View>
          )}

          {/* Biblical Insights */}
          {dream.biblical_insights && dream.biblical_insights.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <BookOpen size={24} color={AppTheme.accent.primary} />
                </View>
                <Text style={styles.sectionTitle}>Biblical Insights</Text>
              </View>
              <View style={styles.biblicalInsightsContainer}>
                {dream.biblical_insights.map((insight, index) => (
                  <View key={index} style={styles.biblicalInsightCard}>
                    <View style={styles.biblicalInsightIcon}>
                      <BookOpen size={16} color="#7C3AED" />
                    </View>
                    <Text style={styles.biblicalInsightText}>{insight}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Dream Symbols */}
          {dream.symbols && dream.symbols.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Star size={24} color={AppTheme.accent.primary} />
                </View>
                <Text style={styles.sectionTitle}>Dream Symbols</Text>
              </View>
              <View style={styles.symbolsContainer}>
                {dream.symbols.map((symbol, index) => (
                  <View key={index} style={styles.symbolCard}>
                    <View style={styles.symbolHeader}>
                      <Text style={styles.symbolName}>{symbol.symbol}</Text>
                    </View>
                    <Text style={styles.symbolMeaning}>{symbol.meaning}</Text>
                    {symbol.bibleVerse && (
                      <Text style={styles.symbolVerse}>"{symbol.bibleVerse}"</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Prayer Guidance */}
          {dream.prayer && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Heart size={24} color={AppTheme.accent.primary} />
                </View>
                <Text style={styles.sectionTitle}>Prayer Guidance</Text>
              </View>
              <LinearGradient
                colors={AppTheme.gradients.info}
                style={styles.prayerCard}
              >
                <View style={styles.prayerHeader}>
                  <Text style={styles.prayerIcon}>🙏</Text>
                  <Text style={[styles.prayerTitle, { color: 'white' }]}>Prayer for This Dream</Text>
                </View>
                <Text style={[styles.prayerContent, { color: 'white' }]}>{dream.prayer}</Text>
              </LinearGradient>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtonsCard}>
            <LinearGradient
              colors={AppTheme.gradients.card}
              style={styles.actionButtonsGradient}
            >
              <Text style={styles.actionButtonsTitle}>Actions</Text>
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                  <Share size={20} color={AppTheme.accent.primary} />
                  <Text style={styles.actionButtonText}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Download size={20} color={AppTheme.accent.primary} />
                  <Text style={styles.actionButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
                  <Trash2 size={20} color={Colors.error[600]} />
                  <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </BackgroundGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: Typography.sizes.lg,
    color: Colors.neutral[600],
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: Typography.sizes.xl,
    color: Colors.neutral[600],
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: Colors.primary[600],
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  backButtonText: {
    color: 'white',
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semiBold,
  },

  // Dream Header
  dreamHeaderCard: {
    marginTop: 20,
    marginBottom: 24,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dreamHeaderGradient: {
    padding: Spacing.xl,
  },
  dreamHeaderContent: {
    gap: Spacing.lg,
  },
  dreamTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  dreamIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dreamTitleContent: {
    flex: 1,
  },
  dreamTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: 'white',
    marginBottom: Spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dreamMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  dreamMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dreamMetaText: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: Typography.weights.medium,
  },
  moodEmoji: {
    fontSize: Typography.sizes.base,
  },
  significanceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  significanceText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: 'white',
    letterSpacing: 0.5,
  },

  // Section Cards
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: AppTheme.text.primary,
    flex: 1,
  },
  sectionText: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
  },

  // Interpretation Cards
  interpretationCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  interpretationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  interpretationTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: '#065F46',
  },
  interpretationContent: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
  },

  // Spiritual Meaning
  spiritualMeaningCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  spiritualMeaningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  spiritualMeaningTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: '#D97706',
  },
  spiritualMeaningContent: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
  },

  // Biblical Insights
  biblicalInsightsContainer: {
    gap: Spacing.md,
  },
  biblicalInsightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  biblicalInsightIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  biblicalInsightText: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
    fontStyle: 'italic',
  },

  // Symbols
  symbolsContainer: {
    gap: Spacing.md,
  },
  symbolCard: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  symbolHeader: {
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  symbolName: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
  },
  symbolMeaning: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
    marginBottom: Spacing.sm,
  },
  symbolVerse: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[500],
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Prayer
  prayerCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  prayerIcon: {
    fontSize: Typography.sizes.lg,
  },
  prayerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.primary[700],
  },
  prayerContent: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
    fontStyle: 'italic',
  },

  // Action Buttons
  actionButtonsCard: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonsGradient: {
    padding: Spacing.xl,
  },
  actionButtonsTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    gap: Spacing.sm,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.primary[600],
  },
  deleteButton: {
    borderColor: Colors.error[200],
    backgroundColor: Colors.error[50],
  },
  deleteButtonText: {
    color: Colors.error[600],
  },

  bottomSpacing: {
    height: 100,
  },
});
