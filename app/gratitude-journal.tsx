import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  Dimensions,
  Modal,
  FlatList,
  StatusBar,
  RefreshControl,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar as RNCalendar } from 'react-native-calendars';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Heart,
  Star,
  Smile,
  Target,
  CheckCircle2,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react-native';
import { Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';
import { router } from 'expo-router';
import { ModernHeader } from '@/components/ModernHeader';
import { useGratitudeJournal, GratitudeEntry } from '@/hooks/useGratitudeJournal';

import AddGratitudeEntryModal from '@/components/AddGratitudeEntryModal';
import { parseDate, getRelativeDateString, formatTime } from '@/utils/dateUtils';
import BannerAd from '@/components/BannerAd';
import { useInterstitialAds } from '@/hooks/useInterstitialAds';

// Hardcoded colors to eliminate import dependency
const safeColors = {
  primary: { 100: '#FCE7F3', 200: '#FBCFE8', 300: '#F9A8D4', 400: '#F472B6', 500: '#EC4899', 600: '#DB2777', 700: '#BE185D', 800: '#9D174D', 900: '#831843' },
  secondary: { 100: '#EDE9FE', 200: '#DDD6FE', 300: '#C4B5FD', 400: '#A78BFA', 500: '#8B5CF6', 600: '#7C3AED', 700: '#6D28D9', 900: '#4C1D95' },
  success: { 100: '#DCFCE7', 500: '#22C55E', 600: '#16A34A', 700: '#15803D' },
  warning: { 100: '#FEF3C7', 500: '#F59E0B', 600: '#D97706', 700: '#B45309' },
  error: { 500: '#EF4444' },
  neutral: { 50: '#FAFAF9', 100: '#F5F5F4', 200: '#E7E5E4', 300: '#D6D3D1', 400: '#A8A29E', 500: '#78716C', 600: '#57534E', 700: '#44403C', 800: '#292524', 900: '#1C1917' },
  text: {
    primary: '#1C1917',
    secondary: '#78716C'
  },
  white: '#FFFFFF',
  black: '#000000',
};

const { width, height } = Dimensions.get('window');

// Mood rating configurations
const moodConfigs = [
  { rating: 1, emoji: '😔', color: '#EF4444', label: 'Struggling' },
  { rating: 2, emoji: '😐', color: '#F59E0B', label: 'Okay' },
  { rating: 3, emoji: '🙂', color: '#10B981', label: 'Good' },
  { rating: 4, emoji: '😊', color: '#3B82F6', label: 'Great' },
  { rating: 5, emoji: '🤩', color: '#8B5CF6', label: 'Amazing' },
];

// Gratitude categories
const gratitudeCategories = [
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', color: safeColors.primary[500] },
  { id: 'health', label: 'Health', icon: '🏥', color: safeColors.success[500] },
  { id: 'work', label: 'Work', icon: '💼', color: safeColors.warning[500] },
  { id: 'friends', label: 'Friends', icon: '👥', color: safeColors.secondary[500] },
  { id: 'nature', label: 'Nature', icon: '🌿', color: safeColors.success[600] },
  { id: 'faith', label: 'Faith', icon: '🙏', color: safeColors.primary[600] },
  { id: 'achievements', label: 'Achievements', icon: '🏆', color: safeColors.warning[600] },
  { id: 'simple_joys', label: 'Simple Joys', icon: '☀️', color: safeColors.secondary[600] },
];

export default function GratitudeJournalScreen() {
  const { showInterstitialAd } = useInterstitialAds('gratitude');
  const {
    entries,
    loading,
    error,
    refetch,
    createEntry,
    updateEntry,
    deleteEntry,
    loadMore,
    hasMore,
  } = useGratitudeJournal();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<GratitudeEntry | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Use a safe back navigation to avoid GO_BACK warning when there's no history
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

  // Defer data fetch to allow UI to render immediately
  useEffect(() => {
    // Small delay to let UI render first
    const timer = setTimeout(() => {
      refetch();
    }, 150);
    return () => clearTimeout(timer);
  }, []); // Remove refetch from dependencies to prevent circular dependency

  // Animation effects
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
    ]).start();
  }, []);

  // Map dates to gratitude category emojis
  const gratitudeDates = useMemo(() => {
    const dateMap: { [key: string]: string[] } = {};
    entries.forEach(entry => {
      const entryDate = parseDate(entry.created_at);
      const dateString = entryDate.toISOString().split('T')[0];

      if (!dateMap[dateString]) {
        dateMap[dateString] = [];
      }

      // Add category emoji for each tag
      entry.tags.forEach(tag => {
        const category = gratitudeCategories.find(cat => cat.id === tag);
        if (category && !dateMap[dateString].includes(category.icon)) {
          dateMap[dateString].push(category.icon);
        }
      });
    });
    return dateMap;
  }, [entries]);

  // Prepare marked dates for calendar
  const markedDates = useMemo(() => {
    const marked: any = {};

    entries.forEach(entry => {
      const entryDate = parseDate(entry.created_at);
      const dateString = entryDate.toISOString().split('T')[0];

      if (!marked[dateString]) {
        marked[dateString] = {
          marked: true,
          dots: []
        };
      }
    });

    // Highlight selected date
    if (selectedDate) {
      if (!marked[selectedDate]) {
        marked[selectedDate] = {};
      }
      marked[selectedDate].selected = true;
      marked[selectedDate].selectedColor = safeColors.primary[500];
      marked[selectedDate].selectedTextColor = '#FFFFFF';
    }

    return marked;
  }, [entries, selectedDate]);

  const handleDayPress = useCallback((day: any) => {
    setSelectedDate(day.dateString);
  }, []);

  // Filter entries based on category and selected date
  const filteredEntries = useMemo(() => {
    let filtered = entries;

    // Filter by selected date
    if (selectedDate) {
      filtered = filtered.filter(entry => {
        const entryDate = parseDate(entry.created_at);
        const dateString = entryDate.toISOString().split('T')[0];
        return dateString === selectedDate;
      });
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(entry => entry.tags.includes(selectedCategory));
    }

    return filtered;
  }, [entries, selectedCategory, selectedDate]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, []); // Remove refetch from dependencies to prevent circular dependency

  const handleDeleteEntry = useCallback(async (entry: GratitudeEntry) => {
    setEntryToDelete(entry);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!entryToDelete) return;

    try {
      const success = await deleteEntry(entryToDelete.id);
      if (success) {
        Alert.alert('Success', 'Gratitude entry deleted successfully');
      } else {
        Alert.alert('Error', 'Failed to delete gratitude entry');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete gratitude entry');
    } finally {
      setShowDeleteModal(false);
      setEntryToDelete(null);
    }
  }, [entryToDelete, deleteEntry]);

  const getMoodConfig = (rating: number) => {
    return moodConfigs.find(config => config.rating === rating) || moodConfigs[2];
  };

  // Custom day component to add gratitude category emojis
  const renderDay = useCallback((props: any) => {
    const { date, state } = props;
    const dayKey = date.dateString;

    // Handle disabled dates (dates outside current month)
    if (state === 'disabled') {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 }}>
          <Text style={{ color: safeColors.neutral[400], fontSize: 14 }}>
            {date.day}
          </Text>
        </View>
      );
    }

    const gratitudeEmojis = gratitudeDates[dayKey] || [];
    const isSelected = selectedDate === dayKey;
    const isToday = dayKey === new Date().toISOString().split('T')[0];

    // Get the marked style for this date
    const marking = markedDates[dayKey];

    // Handle background color for selected state
    const backgroundColor = isSelected ? safeColors.primary[500] : 'transparent';

    return (
      <TouchableOpacity
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 6,
          backgroundColor: backgroundColor,
          borderRadius: 4,
          marginHorizontal: 2,
        }}
        onPress={() => {
          setSelectedDate(dayKey);
        }}
        activeOpacity={0.7}
      >
        <Text style={{
          color: isSelected ? 'white' : (isToday ? safeColors.primary[600] : '#333'),
          fontSize: 14,
          fontWeight: marking?.marked ? '600' : '400'
        }}>
          {date.day}
        </Text>
        {gratitudeEmojis.length > 0 && (
          <Text style={{
            fontSize: 11,
            marginTop: 2,
            color: isSelected ? 'white' : '#666'
          }}>
            {gratitudeEmojis.join(' ')}
          </Text>
        )}
      </TouchableOpacity>
    );
  }, [gratitudeDates, markedDates, selectedDate]);

  const renderCalendar = () => (
    <Animated.View
      style={[styles.calendarContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <View style={styles.calendarHeader}>
        <Text style={styles.calendarTitle}>Gratitude Calendar</Text>
        <Text style={styles.calendarSubtitle}>Select a date to view your entries</Text>
      </View>
      <LinearGradient
        colors={['rgba(236, 72, 153, 0.05)', 'rgba(139, 92, 246, 0.05)']}
        style={styles.calendarGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <RNCalendar
          onDayPress={handleDayPress}
          markedDates={markedDates}
          dayComponent={renderDay}
          theme={{
            backgroundColor: 'transparent',
            calendarBackground: 'transparent',
            textSectionTitleColor: safeColors.primary[600],
            selectedDayBackgroundColor: safeColors.primary[500],
            selectedDayTextColor: '#FFFFFF',
            todayTextColor: safeColors.primary[600],
            dayTextColor: safeColors.neutral[800],
            textDisabledColor: safeColors.neutral[400],
            dotColor: safeColors.primary[500],
            selectedDotColor: '#FFFFFF',
            arrowColor: safeColors.primary[500],
            monthTextColor: safeColors.neutral[900],
            indicatorColor: safeColors.primary[500],
            textDayFontSize: 16,
            textMonthFontSize: 20,
            textDayHeaderFontSize: 14,
            textDayFontWeight: '500',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '600',
          }}
          style={styles.calendar}
        />
      </LinearGradient>
      <Text style={styles.calendarLegend}>
        • Dates with gratitude entries
      </Text>
    </Animated.View>
  );

  const renderCategoryFilter = () => (
    <View style={styles.categoryFilter}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
        <TouchableOpacity
          style={[
            styles.categoryChip,
            selectedCategory === 'all' && styles.categoryChipActive
          ]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[
            styles.categoryChipText,
            selectedCategory === 'all' && styles.categoryChipTextActive
          ]}>
            All
          </Text>
        </TouchableOpacity>
        {gratitudeCategories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={styles.categoryEmoji}>{category.icon}</Text>
            <Text style={[
              styles.categoryChipText,
              selectedCategory === category.id && styles.categoryChipTextActive
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderEntryItem = ({ item }: { item: GratitudeEntry }) => {
    if (!item) {
      return null;
    }

    const moodConfig = getMoodConfig(item.mood_rating);

    // Use utility function to safely parse the date
    const entryDate = parseDate(item.created_at);
    const isToday = entryDate.toDateString() === new Date().toDateString();

    return (
      <Animated.View style={[styles.entryCard, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.entryContent}
          onPress={() => router.push(`/gratitude-entry-viewer?entryId=${item.id}`)}
        >
          <View style={styles.entryHeader}>
            <View style={styles.entryTitleContainer}>
              <Text style={styles.entryTitle} numberOfLines={1}>
                {item.title}
              </Text>
              {item.is_favorite && (
                <Star size={16} color={safeColors.warning[500]} fill={safeColors.warning[500]} />
              )}
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteEntry(item)}
            >
              <Trash2 size={16} color={safeColors.error[500]} />
            </TouchableOpacity>
          </View>

          <Text style={styles.entryContentText} numberOfLines={3}>
            {item.content}
          </Text>

          <View style={styles.entryFooter}>
            <View style={styles.entryMood}>
              <Text style={styles.moodEmoji}>{moodConfig.emoji}</Text>
              <Text style={styles.moodLabel}>{moodConfig.label}</Text>
            </View>

            <View style={styles.entryMeta}>
              <View style={styles.entryDate}>
                <Calendar size={12} color={safeColors.text.secondary} />
                <Text style={styles.entryDateText}>
                  {getRelativeDateString(item.created_at)}
                </Text>
              </View>
              <View style={styles.entryTime}>
                <Clock size={12} color={safeColors.text.secondary} />
                <Text style={styles.entryTimeText}>
                  {formatTime(item.created_at)}
                </Text>
              </View>
            </View>
          </View>

          {item.tags.length > 0 && (
            <View style={styles.entryTags}>
              {item.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              {item.tags.length > 3 && (
                <Text style={styles.moreTagsText}>+{item.tags.length - 3} more</Text>
              )}
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
      <View style={styles.emptyIconContainer}>
        <Heart size={48} color={safeColors.primary[300]} />
      </View>
      <Text style={styles.emptyTitle}>Start Your Gratitude Journey</Text>
      <Text style={styles.emptySubtitle}>
        Begin by writing down the things you're grateful for today.
        It's a simple practice that can transform your perspective.
      </Text>
      <TouchableOpacity
        style={styles.emptyActionButton}
        onPress={() => setShowAddModal(true)}
      >
        <Plus size={20} color="white" />
        <Text style={styles.emptyActionText}>Write First Entry</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" />

        <View style={styles.backgroundContainer}>
          {/* Header Container with proper styling */}
          <View style={styles.headerContainer}>
            <ModernHeader
              title="Gratitude Journal"
              variant="simple"
              showBackButton={true}
              showReaderButton={false}
              onBackPress={safeBack}
              readerText="Gratitude Journal. Reflect on the blessings in your life. Write down what you're grateful for and watch your perspective transform."
            />
          </View>

          {/* ScrollView with Calendar and Filter - All content inside ScrollView */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={safeColors.primary[500]}
                colors={[safeColors.primary[500]]}
                progressBackgroundColor={safeColors.white}
              />
            }
            contentContainerStyle={[styles.scrollViewContent, { paddingBottom: Spacing.xl + 100 }]}
            scrollEventThrottle={16}
            removeClippedSubviews={false}
            keyboardShouldPersistTaps="handled"
            bounces={true}
            alwaysBounceVertical={false}
            scrollsToTop={true}
            automaticallyAdjustContentInsets={false}
            contentInsetAdjustmentBehavior="automatic"
          >
            {/* Calendar */}
            {renderCalendar()}

            {/* Category Filter */}
            {renderCategoryFilter()}

            {/* Banner Ad */}
            <BannerAd placement="home" />

            {loading && entries.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={safeColors.primary[500]} />
                <Text style={styles.loadingText}>Loading your gratitude entries...</Text>
              </View>
            ) : filteredEntries.length === 0 ? (
              renderEmptyState()
            ) : (
              <FlatList
                data={filteredEntries}
                renderItem={renderEntryItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={styles.entriesList}
              />
            )}

            {hasMore && !loading && (
              <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
                <Text style={styles.loadMoreText}>Load More Entries</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Floating Action Button */}
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setShowAddModal(true)}
          >
            <LinearGradient
              colors={['#8B5CF6', '#A855F7']}
              style={styles.fabGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Plus size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Add Gratitude Entry Modal */}
          <AddGratitudeEntryModal
            visible={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              refetch();
              setShowAddModal(false);
            }}
          />

          {/* Delete Confirmation Modal */}
          <Modal
            visible={showDeleteModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowDeleteModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Delete Entry</Text>
                <Text style={styles.modalMessage}>
                  Are you sure you want to delete this gratitude entry? This action cannot be undone.
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowDeleteModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.deleteButton]}
                    onPress={confirmDelete}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: safeColors.neutral[50],
  },
  backgroundContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  // Calendar Styles
  calendarContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: safeColors.white,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.lg,
    elevation: 8,
  },
  calendarHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  calendarTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: safeColors.neutral[900],
    marginBottom: Spacing.xs,
  },
  calendarSubtitle: {
    fontSize: Typography.sizes.sm,
    color: safeColors.neutral[600],
    textAlign: 'center',
  },
  calendarGradient: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: safeColors.primary[50],
  },
  calendar: {
    borderRadius: BorderRadius.lg,
    backgroundColor: 'transparent'
  },
  calendarLegend: {
    fontSize: Typography.sizes.xs,
    color: safeColors.neutral[600],
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: Spacing.lg,
  },
  categoryFilter: {
    marginBottom: Spacing.lg,
  },
  categoryScroll: {
    paddingHorizontal: Spacing.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: safeColors.neutral[100],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: safeColors.neutral[200],
  },
  categoryChipActive: {
    backgroundColor: safeColors.primary[500],
    borderColor: safeColors.primary[500],
  },
  categoryChipText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: safeColors.neutral[600],
  },
  categoryChipTextActive: {
    color: 'white',
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  entriesList: {
    paddingHorizontal: Spacing.lg,
  },
  entryCard: {
    backgroundColor: safeColors.neutral[100],
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.small,
    borderWidth: 1,
    borderColor: safeColors.neutral[200],
  },
  entryContent: {
    padding: Spacing.lg,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  entryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  entryTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semiBold,
    color: safeColors.neutral[900],
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  entryContentText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: safeColors.neutral[600],
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  entryMood: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  moodLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: safeColors.neutral[600],
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  entryDateText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.regular,
    color: safeColors.neutral[600],
    marginLeft: 4,
  },
  entryTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryTimeText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.regular,
    color: safeColors.neutral[600],
    marginLeft: 4,
  },
  entryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: safeColors.primary[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  tagText: {
    fontWeight: Typography.weights.regular,
    color: safeColors.primary[700],
    fontSize: 12,
  },
  moreTagsText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.regular,
    color: safeColors.neutral[600],
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing['2xl'],
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: safeColors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: safeColors.neutral[900],
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: safeColors.neutral[600],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: safeColors.primary[500],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  emptyActionText: {
    fontSize: Typography.sizes.base,
    color: 'white',
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },
  loadingText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: safeColors.neutral[600],
    marginTop: Spacing.md,
  },
  loadMoreButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.lg,
  },
  loadMoreText: {
    fontSize: Typography.sizes.base,
    color: safeColors.primary[500],
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    ...Shadows.lg,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginHorizontal: Spacing.lg,
    minWidth: 300,
    maxWidth: '90%',
    ...Shadows.lg,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  modalMessage: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: Spacing.sm,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    marginLeft: Spacing.sm,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
