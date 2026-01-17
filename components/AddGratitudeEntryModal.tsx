import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Sparkles,
  Heart,
} from 'lucide-react-native';
import { Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';

// Hardcoded colors to eliminate import dependency
const safeColors = {
  primary: { 100: '#FCE7F3', 500: '#EC4899', 600: '#DB2777', 700: '#BE185D' },
  secondary: { 500: '#8B5CF6', 600: '#7C3AED' },
  success: { 500: '#22C55E', 600: '#16A34A' },
  warning: { 100: '#FEF3C7', 500: '#F59E0B', 600: '#D97706' },
  error: { 500: '#EF4444' },
  neutral: { 50: '#FAFAF9', 100: '#F5F5F4', 400: '#A8A29E', 500: '#78716C', 600: '#57534E', 700: '#44403C', 900: '#1C1917' },
  border: { primary: '#E5E7EB' }
};
import { useGratitudeJournal, CreateGratitudeEntryData } from '@/hooks/useGratitudeJournal';

const { width } = Dimensions.get('window');

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

interface AddGratitudeEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddGratitudeEntryModal({ visible, onClose, onSuccess }: AddGratitudeEntryModalProps) {
  const { createEntry } = useGratitudeJournal();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [moodRating, setMoodRating] = useState(3);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const titleInputRef = useRef<TextInput>(null);
  const contentInputRef = useRef<TextInput>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setTitle('');
      setContent('');
      setMoodRating(3);
      setSelectedTags([]);
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in both title and content');
      return;
    }

    if (selectedTags.length === 0) {
      Alert.alert('Error', 'Please select at least one category');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const entryData: CreateGratitudeEntryData = {
        title: title.trim(),
        content: content.trim(),
        mood_rating: moodRating,
        tags: selectedTags,
        is_private: true, // All entries are private by default
        is_favorite: false,
        background_color: '#FFFFFF',
      };

      const newEntry = await createEntry(entryData);
      
      if (newEntry) {
        Alert.alert('Success', 'Gratitude entry created successfully');
        onSuccess?.();
        onClose();
      } else {
        Alert.alert('Error', 'Failed to create gratitude entry');
      }
    } catch (error) {
      console.error('Error in gratitude entry modal:', error);
      Alert.alert('Error', `Failed to create gratitude entry: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(tag => tag !== tagId)
        : [...prev, tagId]
    );
  };

  const getMoodConfig = (rating: number) => {
    return moodConfigs.find(config => config.rating === rating) || moodConfigs[2];
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient
          colors={['#8B5CF6', '#A855F7']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Heart size={24} color="white" />
              <Text style={styles.headerTitle}>New Gratitude Entry</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title Input */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>What are you grateful for? *</Text>
            <TextInput
              ref={titleInputRef}
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., My family's love and support"
              placeholderTextColor={safeColors.neutral[500]}
              multiline
            />
          </View>

          {/* Content Input */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Tell us more about it *</Text>
            <TextInput
              ref={contentInputRef}
              style={styles.contentInput}
              value={content}
              onChangeText={setContent}
              placeholder="Write about what you're grateful for and why it means so much to you..."
              placeholderTextColor={safeColors.neutral[500]}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Mood Rating */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>How are you feeling today?</Text>
            <View style={styles.moodContainer}>
              <View style={styles.moodOptions}>
                {moodConfigs.map((config) => (
                  <TouchableOpacity
                    key={config.rating}
                    style={[
                      styles.moodOption,
                      moodRating === config.rating && styles.moodOptionSelected
                    ]}
                    onPress={() => setMoodRating(config.rating)}
                  >
                    <Text style={styles.moodEmoji}>{config.emoji}</Text>
                    <Text style={[
                      styles.moodLabel,
                      moodRating === config.rating && styles.moodLabelSelected
                    ]}>
                      {config.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Categories *</Text>
            <View style={styles.categoriesContainer}>
              {gratitudeCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedTags.includes(category.id) && styles.categoryChipSelected
                  ]}
                  onPress={() => toggleTag(category.id)}
                >
                  <Text style={styles.categoryEmoji}>{category.icon}</Text>
                  <Text style={[
                    styles.categoryLabel,
                    selectedTags.includes(category.id) && styles.categoryLabelSelected
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isSubmitting || !title.trim() || !content.trim() || selectedTags.length === 0}
          >
            <LinearGradient
              colors={['#8B5CF6', '#A855F7']}
              style={[
                styles.submitButtonGradient,
                (!title.trim() || !content.trim() || selectedTags.length === 0) && styles.submitButtonDisabled
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {isSubmitting ? (
                <Text style={styles.submitButtonText}>Creating...</Text>
              ) : (
                <>
                  <Sparkles size={20} color="white" />
                  <Text style={styles.submitButtonText}>Create Entry</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: safeColors.neutral[50],
  },
  header: {
    paddingTop: 50,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: 'white',
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: safeColors.neutral[900],
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  titleInput: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semiBold,
    color: safeColors.neutral[900],
    backgroundColor: safeColors.neutral[100],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: safeColors.border.primary,
    minHeight: 50,
  },
  contentInput: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: safeColors.neutral[900],
    backgroundColor: safeColors.neutral[100],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: safeColors.border.primary,
    minHeight: 120,
  },
  moodContainer: {
    backgroundColor: safeColors.neutral[100],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: safeColors.border.primary,
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodOption: {
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    flex: 1,
    marginHorizontal: 2,
  },
  moodOptionSelected: {
    backgroundColor: safeColors.primary[100],
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  moodLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.regular,
    color: safeColors.neutral[500],
    textAlign: 'center',
  },
  moodLabelSelected: {
    color: safeColors.primary[700],
    fontWeight: '600',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: safeColors.neutral[100],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: safeColors.border.primary,
  },
  categoryChipSelected: {
    backgroundColor: safeColors.primary[100],
    borderColor: safeColors.primary[500],
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  categoryLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.regular,
    color: safeColors.neutral[500],
    fontWeight: '500',
  },
  categoryLabelSelected: {
    color: safeColors.primary[700],
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: safeColors.border.primary,
    backgroundColor: safeColors.neutral[100],
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  cancelButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: safeColors.neutral[500],
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: 'white',
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
});
