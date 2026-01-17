import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  Animated,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Star,
  Calendar,
  Clock,
  Heart,
  X,
  Save,
  Smile,
  Sparkles,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';
import { router, useLocalSearchParams } from 'expo-router';
import BackgroundGradient from '@/components/BackgroundGradient';
import { ModernHeader } from '@/components/ModernHeader';
import { useGratitudeJournal, GratitudeEntry } from '@/hooks/useGratitudeJournal';
import BannerAd from '@/components/BannerAd';
import { useInterstitialAds } from '@/hooks/useInterstitialAds';

const { width } = Dimensions.get('window');

// Mood rating configurations
const moodConfigs = [
  { rating: 1, emoji: '😔', color: '#EF4444', label: 'Struggling' },
  { rating: 2, emoji: '😐', color: '#F59E0B', label: 'Okay' },
  { rating: 3, emoji: '🙂', color: '#10B981', label: 'Good' },
  { rating: 4, emoji: '😊', color: '#3B82F6', label: 'Great' },
  { rating: 5, emoji: '🤩', color: '#8B5CF6', label: 'Amazing' },
];

export default function GratitudeEntryViewerScreen() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  const { showInterstitialAd } = useInterstitialAds('gratitude');
  const {
    entries,
    loading,
    updateEntry,
    deleteEntry,
    refetch,
  } = useGratitudeJournal();

  const [currentEntry, setCurrentEntry] = useState<GratitudeEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const titleInputRef = useRef<TextInput>(null);
  const contentInputRef = useRef<TextInput>(null);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Find the entry by ID
  useEffect(() => {
    if (entryId && entries.length > 0) {
      const entry = entries.find(e => e.id === entryId);
      if (entry) {
        setCurrentEntry(entry);
      } else {
        Alert.alert('Error', 'Gratitude entry not found', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    }
  }, [entryId, entries]);

  // Animation effects
  useEffect(() => {
    if (currentEntry) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentEntry]);

  const safeBack = useCallback(() => {
    try {
      // @ts-ignore expo-router provides canGoBack at runtime
      if (typeof router?.canGoBack === 'function' ? router.canGoBack() : false) {
        router.back();
      } else {
        router.replace('/gratitude-journal');
      }
    } catch {
      router.replace('/gratitude-journal');
    }
  }, []);

  const saveEntry = async (entry: GratitudeEntry) => {
    if (!entry.title.trim() || !entry.content.trim()) {
      Alert.alert('Error', 'Please fill in both title and content');
      return;
    }

    try {
      setIsTransitioning(true);
      const success = await updateEntry(entry);
      if (success) {
        setIsEditing(false);
        Alert.alert('Success', 'Gratitude entry updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update gratitude entry');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update gratitude entry');
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleDelete = async () => {
    if (!currentEntry) return;

    try {
      const success = await deleteEntry(currentEntry.id);
      if (success) {
        Alert.alert('Success', 'Gratitude entry deleted successfully', [
          { text: 'OK', onPress: () => router.replace('/gratitude-journal') }
        ]);
      } else {
        Alert.alert('Error', 'Failed to delete gratitude entry');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete gratitude entry');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const toggleFavorite = async () => {
    if (!currentEntry) return;

    const updatedEntry = {
      ...currentEntry,
      is_favorite: !currentEntry.is_favorite,
    };

    try {
      const success = await updateEntry(updatedEntry);
      if (success) {
        setCurrentEntry(updatedEntry);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const updateMoodRating = async (rating: number) => {
    if (!currentEntry) return;

    const updatedEntry = {
      ...currentEntry,
      mood_rating: rating,
    };

    try {
      const success = await updateEntry(updatedEntry);
      if (success) {
        setCurrentEntry(updatedEntry);
        setShowMoodPicker(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update mood rating');
    }
  };

  const getMoodConfig = (rating: number) => {
    return moodConfigs.find(config => config.rating === rating) || moodConfigs[2];
  };

  if (!currentEntry) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" />
        <BackgroundGradient>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
            <Text style={styles.loadingText}>Loading gratitude entry...</Text>
          </View>
        </BackgroundGradient>
      </View>
    );
  }

  const moodConfig = getMoodConfig(currentEntry.mood_rating);
  const entryDate = new Date(currentEntry.created_at);
  const isToday = entryDate.toDateString() === new Date().toDateString();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />

      <BackgroundGradient>
        {/* Header */}
        <View style={styles.headerContainer}>
          <ModernHeader
            title="Gratitude Entry"
            variant="simple"
            showBackButton={true}
            showReaderButton={false}
            onBackPress={safeBack}
            readerText={`Gratitude Entry: ${currentEntry.title}. ${currentEntry.content}`}
          />
        </View>

        {/* Banner Ad */}
        <BannerAd placement="home" />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Animated.View
            style={[
              styles.contentContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            {/* Entry Header */}
            <View style={styles.entryHeader}>
              <View style={styles.entryMeta}>
                <View style={styles.entryDate}>
                  <Calendar size={16} color={Colors.neutral[500]} />
                  <Text style={styles.entryDateText}>
                    {isToday ? 'Today' : entryDate.toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.entryTime}>
                  <Clock size={16} color={Colors.neutral[500]} />
                  <Text style={styles.entryTimeText}>
                    {entryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>

              <View style={styles.entryActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={toggleFavorite}
                >
                  <Star
                    size={20}
                    color={currentEntry.is_favorite ? Colors.warning[500] : Colors.neutral[500]}
                    fill={currentEntry.is_favorite ? Colors.warning[500] : 'none'}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setIsEditing(!isEditing)}
                >
                  <Edit3 size={20} color={Colors.primary[500]} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setShowDeleteModal(true)}
                >
                  <Trash2 size={20} color={Colors.error[500]} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Mood Rating */}
            <TouchableOpacity
              style={styles.moodContainer}
              onPress={() => setShowMoodPicker(true)}
            >
              <View style={styles.moodDisplay}>
                <Text style={styles.moodEmoji}>{moodConfig.emoji}</Text>
                <View>
                  <Text style={styles.moodLabel}>{moodConfig.label}</Text>
                  <Text style={styles.moodRating}>Rating: {currentEntry.mood_rating}/5</Text>
                </View>
              </View>
              <Text style={styles.moodChangeText}>Tap to change</Text>
            </TouchableOpacity>

            {/* Title */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Title</Text>
              {isEditing ? (
                <TextInput
                  ref={titleInputRef}
                  style={styles.titleInput}
                  value={currentEntry.title}
                  onChangeText={(text) => setCurrentEntry({ ...currentEntry, title: text })}
                  placeholder="What are you grateful for?"
                  placeholderTextColor={Colors.neutral[500]}
                  multiline
                />
              ) : (
                <Text style={styles.titleText}>{currentEntry.title}</Text>
              )}
            </View>

            {/* Content */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>What I'm Grateful For</Text>
              {isEditing ? (
                <TextInput
                  ref={contentInputRef}
                  style={styles.contentInput}
                  value={currentEntry.content}
                  onChangeText={(text) => setCurrentEntry({ ...currentEntry, content: text })}
                  placeholder="Write about what you're grateful for today..."
                  placeholderTextColor={Colors.neutral[500]}
                  multiline
                  textAlignVertical="top"
                />
              ) : (
                <Text style={styles.contentText}>{currentEntry.content}</Text>
              )}
            </View>

            {/* Tags */}
            {currentEntry.tags.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Tags</Text>
                <View style={styles.tagsContainer}>
                  {currentEntry.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Save Button */}
            {isEditing && (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => saveEntry(currentEntry)}
                disabled={isTransitioning}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#A855F7']}
                  style={styles.saveButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {isTransitioning ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Save size={20} color="white" />
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
          </Animated.View>
        </ScrollView>

        {/* Mood Picker Modal */}
        <Modal
          visible={showMoodPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMoodPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.moodPickerModal}>
              <Text style={styles.moodPickerTitle}>How are you feeling?</Text>
              <View style={styles.moodOptions}>
                {moodConfigs.map((config) => (
                  <TouchableOpacity
                    key={config.rating}
                    style={[
                      styles.moodOption,
                      currentEntry.mood_rating === config.rating && styles.moodOptionSelected
                    ]}
                    onPress={() => updateMoodRating(config.rating)}
                  >
                    <Text style={styles.moodOptionEmoji}>{config.emoji}</Text>
                    <Text style={[
                      styles.moodOptionLabel,
                      currentEntry.mood_rating === config.rating && styles.moodOptionLabelSelected
                    ]}>
                      {config.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={styles.moodPickerClose}
                onPress={() => setShowMoodPicker(false)}
              >
                <X size={24} color={Colors.neutral[500]} />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
                  onPress={handleDelete}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </BackgroundGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  headerContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[500],
    marginTop: Spacing.md,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  entryMeta: {
    flex: 1,
  },
  entryDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  entryDateText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[500],
    marginLeft: Spacing.xs,
  },
  entryTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryTimeText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.regular,
    color: Colors.neutral[500],
    marginLeft: Spacing.xs,
  },
  entryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  moodContainer: {
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  moodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  moodLabel: {
    fontSize: Typography.sizes.xl,
    color: Colors.neutral[900],
    fontWeight: '600',
  },
  moodRating: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.regular,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  moodChangeText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.regular,
    color: Colors.primary[500],
    textAlign: 'right',
    marginTop: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[500],
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  titleText: {
    fontSize: Typography.sizes['2xl'],
    color: Colors.neutral[900],
    fontWeight: '600',
    lineHeight: 32,
  },
  titleInput: {
    fontSize: Typography.sizes['2xl'],
    color: Colors.neutral[900],
    fontWeight: '600',
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  contentText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.regular,
    color: Colors.neutral[900],
    lineHeight: 26,
  },
  contentInput: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.regular,
    color: Colors.neutral[900],
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    minHeight: 120,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: Colors.primary[100],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tagText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary[700],
    fontWeight: '500',
  },
  saveButton: {
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.md,
    ...Shadows.md,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  saveButtonText: {
    fontSize: Typography.sizes.base,
    color: 'white',
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodPickerModal: {
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginHorizontal: Spacing.lg,
    ...Shadows.lg,
    position: 'relative',
  },
  moodPickerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodOption: {
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    minWidth: 60,
  },
  moodOptionSelected: {
    backgroundColor: Colors.primary[100],
  },
  moodOptionEmoji: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  moodOptionLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.regular,
    color: Colors.neutral[500],
    textAlign: 'center',
  },
  moodOptionLabelSelected: {
    color: Colors.primary[700],
    fontWeight: '600',
  },
  moodPickerClose: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    padding: Spacing.sm,
  },
  modalContent: {
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginHorizontal: Spacing.lg,
    ...Shadows.lg,
  },
  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  modalMessage: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[500],
    textAlign: 'center',
    lineHeight: 22,
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
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.border.primary,
    marginRight: Spacing.sm,
  },
  cancelButtonText: {
    color: Colors.neutral[900],
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: Colors.error[500],
    marginLeft: Spacing.sm,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
