import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Edit3,
  Save,
  X,
  Smile,
  Trash2,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';
import { AppTheme, getThemeShadow } from '@/constants/AppTheme';
import { router, useLocalSearchParams } from 'expo-router';
import BackgroundGradient from '@/components/BackgroundGradient';
import { ModernHeader } from '@/components/ModernHeader';

import { useNotesUnified, Note } from '@/hooks/useNotesUnified';
import BannerAd from '@/components/BannerAd';
import { useInterstitialAds } from '@/hooks/useInterstitialAds';

export default function NoteViewerScreen() {

  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const { showInterstitialAd } = useInterstitialAds('notes');
  const {
    notes,
    loading,
    updateNote,
    deleteNote,
    refetch,
  } = useNotesUnified();

  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const titleInputRef = useRef<TextInput>(null);
  const contentInputRef = useRef<TextInput>(null);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Find the note by ID
  useEffect(() => {
    if (noteId && notes.length > 0) {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        setCurrentNote(note);
      } else {
        Alert.alert('Error', 'Note not found', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    }
  }, [noteId, notes]);

  // Animation effects
  useEffect(() => {
    if (currentNote) {
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
  }, [currentNote]);

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

  const saveNote = async (note: Note) => {
    if (!note || isTransitioning) return;

    setIsTransitioning(true);

    const noteToSave = {
      ...note,
      updated_at: new Date().toISOString(),
    };

    try {
      const success = await updateNote({
        id: note.id,
        title: note.title,
        content: note.content,
        category: note.category,
        tags: note.tags,
        background_color: note.background_color,
        is_favorite: note.is_favorite,
        mood_rating: note.mood_rating,
        bible_reference: note.bible_reference,
        is_private: note.is_private
      });

      if (success) {
        setCurrentNote(noteToSave);
        setIsEditing(false);
        await refetch();
        Alert.alert('Success', 'Note saved successfully!');
      } else {
        Alert.alert('Error', 'Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note');
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!currentNote) return;

    Alert.alert(
      'Delete Note',
      `Are you sure you want to delete "${currentNote.title || 'Untitled Note'}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteNote(currentNote.id);
              if (success) {
                Alert.alert('Success', 'Note deleted successfully!');
                router.back();
              } else {
                Alert.alert('Error', 'Failed to delete note');
              }
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Failed to delete note');
            }
          },
        },
      ]
    );
  };

  const editNote = useCallback(() => {
    setIsEditing(true);
    // Focus on title input after a short delay
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 100);
  }, []);

  const updateNoteField = useCallback((field: keyof Note, value: any) => {
    setCurrentNote(prev => {
      if (!prev) return prev;
      if (prev[field] === value) return prev;
      return {
        ...prev,
        [field]: value,
      };
    });
  }, []);

  const selectCategory = useCallback((categoryId: string) => {
    updateNoteField('category', categoryId as Note['category']);
    setShowCategoryPicker(false);
  }, [updateNoteField]);

  const insertEmoji = (emoji: string) => {
    if (!currentNote) return;

    const newContent = (currentNote.content || '') + emoji;
    setCurrentNote({
      ...currentNote,
      content: newContent,
    });
    setShowEmojiPicker(false);
  };

  const popularEmojis = [
    '😊', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💯', '🙏', '😍',
    '😭', '🤔', '👏', '💪', '🎯', '🚀', '💡', '🌟', '💎', '🏆',
    '📚', '✍️', '🎨', '🎵', '🍕', '☕', '🌺', '🌈', '⭐', '💫'
  ];

  const categories = [
    { id: 'reflection', label: 'Reflection', icon: '🤔', color: Colors.primary[500] },
    { id: 'prayer', label: 'Prayer', icon: '🙏', color: Colors.success[500] },
    { id: 'study', label: 'Study', icon: '📚', color: Colors.warning[500] },
    { id: 'journal', label: 'Journal', icon: '📝', color: Colors.secondary[500] },
    { id: 'insight', label: 'Insight', icon: '💡', color: Colors.cardColors.secondaryPurple },
    { id: 'gratitude', label: 'Gratitude', icon: '🙌', color: Colors.cardColors.goldenLight },
    { id: 'other', label: 'Other', icon: '📄', color: Colors.neutral[500] },
  ];


  const formatDate = (date: string) => {
    try {
      const jsDate = new Date(date);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - jsDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return 'Today';
      if (diffDays === 2) return 'Yesterday';
      if (diffDays <= 7) return `${diffDays - 1} days ago`;
      return jsDate.toLocaleDateString();
    } catch (error) {
      return 'Unknown';
    }
  };

  const formatTime = (date: string) => {
    try {
      const jsDate = new Date(date);
      return jsDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '--:--';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <BackgroundGradient variant="warm">
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AppTheme.accent.primary} />
            <Text style={styles.loadingText}>Loading note...</Text>
          </View>
        </BackgroundGradient>
      </View>
    );
  }

  if (!currentNote) {
    return (
      <View style={styles.container}>
        <BackgroundGradient variant="warm">
          <ModernHeader
            title="Note Not Found"
            variant="simple"
            showBackButton={true}
            showReaderButton={false}
            onBackPress={safeBack}
          />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>The requested note could not be found.</Text>
            <TouchableOpacity style={styles.backButton} onPress={safeBack}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </BackgroundGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />

      <BackgroundGradient variant="warm">
        <ModernHeader
          title={isEditing ? 'Edit Note' : 'Detail View'}
          variant="simple"
          showBackButton={true}
          showReaderButton={false}
          onBackPress={safeBack}
        />

        {/* Banner Ad */}
        <BannerAd placement="notes" />

        <Animated.ScrollView
          style={[styles.scrollView, { opacity: fadeAnim }]}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[{ transform: [{ translateY: slideAnim }] }]}>
            <View style={[
              styles.noteContainer,
              isEditing && styles.editingNoteContainer
            ]}>
              <TouchableOpacity
                onPress={() => !isEditing && editNote()}
                activeOpacity={isEditing ? 1 : 0.7}
              >
                <TextInput
                  ref={titleInputRef}
                  style={[
                    styles.noteTitleInput,
                    !isEditing && styles.nonEditableInput
                  ]}
                  placeholder="Note Title"
                  value={currentNote.title || ''}
                  onChangeText={(text) => updateNoteField('title', text)}
                  editable={isEditing}
                  placeholderTextColor={AppTheme.text.tertiary}
                  multiline={false}
                />
              </TouchableOpacity>

              {/* Category Selection */}
              {isEditing && (
                <View style={styles.propertySection}>
                  <Text style={styles.propertyLabel}>Category</Text>
                  <TouchableOpacity
                    style={styles.categoryButton}
                    onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                  >
                    <Text style={styles.categoryButtonText}>
                      {categories.find(cat => cat.id === currentNote.category)?.icon} {categories.find(cat => cat.id === currentNote.category)?.label}
                    </Text>
                    <X size={16} color={Colors.neutral[500]} />
                  </TouchableOpacity>

                  {showCategoryPicker && (
                    <View style={styles.categoryPicker}>
                      {categories.map((category) => (
                        <TouchableOpacity
                          key={category.id}
                          style={[
                            styles.categoryOption,
                            currentNote.category === category.id && styles.selectedCategoryOption
                          ]}
                          onPress={() => selectCategory(category.id)}
                        >
                          <Text style={styles.categoryOptionIcon}>{category.icon}</Text>
                          <Text style={[
                            styles.categoryOptionText,
                            currentNote.category === category.id && styles.selectedCategoryOptionText
                          ]}>
                            {category.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}


              <View style={styles.contentSection}>
                <View style={styles.contentHeader}>
                  <Text style={styles.contentLabel}>Content</Text>
                  {isEditing && (
                    <TouchableOpacity
                      style={styles.emojiButton}
                      onPress={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Smile size={20} color={AppTheme.accent.primary} />
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => !isEditing && editNote()}
                  activeOpacity={isEditing ? 1 : 0.7}
                >
                  <TextInput
                    ref={contentInputRef}
                    style={[
                      styles.noteContentInput,
                      { backgroundColor: isEditing ? '#FFFFFF' : 'transparent' },
                      !isEditing && styles.nonEditableInput
                    ]}
                    multiline
                    placeholder="Start writing your note..."
                    value={currentNote.content || ''}
                    onChangeText={(text) => updateNoteField('content', text)}
                    editable={isEditing}
                    placeholderTextColor={AppTheme.text.tertiary}
                    textAlignVertical="top"
                  />
                </TouchableOpacity>

                {showEmojiPicker && (
                  <View style={styles.emojiPicker}>
                    <View style={styles.emojiGrid}>
                      {popularEmojis.map((emoji, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.emojiItem}
                          onPress={() => insertEmoji(emoji)}
                        >
                          <Text style={styles.emojiText}>{emoji}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              {/* Note Info (always visible) */}
              <View style={styles.noteInfo}>
                <View style={styles.noteInfoRow}>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryInfoIcon}>
                      {categories.find(cat => cat.id === currentNote.category)?.icon}
                    </Text>
                    <Text style={styles.categoryInfoText}>
                      {categories.find(cat => cat.id === currentNote.category)?.label}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.noteMeta}>
                <Text style={styles.noteDate}>
                  Last updated: {formatDate(currentNote.updated_at)}
                </Text>
                <Text style={styles.noteTime}>
                  {formatTime(currentNote.updated_at)}
                </Text>
              </View>

              {isEditing && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDeleteNote}
                >
                  <Trash2 size={20} color={AppTheme.gradients.danger[0]} />
                  <Text style={styles.deleteButtonText}>Delete Note</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          {/* Edit Note Button - positioned below note card */}
          {!isEditing && (
            <View style={styles.editButtonContainer}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={editNote}
              >
                <Edit3 size={20} color="white" />
                <Text style={styles.editButtonText}>Edit Note</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Save/Cancel Buttons - when editing */}
          {isEditing && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsEditing(false);
                  // Reset any unsaved changes if needed
                  refetch();
                }}
              >
                <X size={20} color={Colors.neutral[600]} />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => saveNote(currentNote)}
                disabled={isTransitioning}
              >
                {isTransitioning ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Save size={20} color="white" />
                    <Text style={styles.saveButtonText}>Save</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Animated.ScrollView>
      </BackgroundGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.sizes.base,
    color: AppTheme.text.secondary,
    marginTop: Spacing.md,
    fontWeight: Typography.weights.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: Typography.sizes.lg,
    color: AppTheme.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  backButton: {
    backgroundColor: AppTheme.accent.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  backButtonText: {
    color: 'white',
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
    paddingBottom: 100, // Add space for bottom elements
  },
  noteContainer: {
    backgroundColor: AppTheme.card.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    // Using theme shadows
    shadowColor: AppTheme.card.shadow.shadowColor,
    shadowOffset: AppTheme.card.shadow.shadowOffset,
    shadowOpacity: AppTheme.card.shadow.shadowOpacity,
    shadowRadius: AppTheme.card.shadow.shadowRadius,
    elevation: AppTheme.card.shadow.elevation,
    borderWidth: 1,
    borderColor: AppTheme.border.light,
  },
  editingNoteContainer: {
    borderColor: AppTheme.border.accent,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  noteTitleInput: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: AppTheme.text.primary,
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.border.light,
    minHeight: 48,
  },
  contentSection: {
    marginBottom: Spacing.lg,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  contentLabel: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
    color: AppTheme.text.secondary,
  },
  emojiButton: {
    padding: Spacing.sm,
  },
  noteContentInput: {
    fontSize: Typography.sizes.base,
    color: AppTheme.text.primary,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
    paddingVertical: Spacing.sm,
    textAlignVertical: 'top',
    minHeight: 200,
    maxHeight: 400,
  },
  emojiPicker: {
    marginTop: Spacing.md,
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emojiItem: {
    width: '20%',
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  emojiText: {
    fontSize: Typography.sizes.xl,
  },
  noteMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  noteDate: {
    fontSize: Typography.sizes.sm,
    color: AppTheme.text.tertiary,
  },
  noteTime: {
    fontSize: Typography.sizes.sm,
    color: AppTheme.text.tertiary,
  },
  headerButton: {
    padding: Spacing.sm,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  deleteButtonText: {
    color: '#DC2626',
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    marginLeft: Spacing.sm,
  },

  // Property Sections
  propertySection: {
    marginBottom: Spacing.lg,
  },
  propertyLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[700],
    marginBottom: Spacing.sm,
  },

  // Category Selection
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.neutral[50],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  categoryButtonText: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
  },
  categoryPicker: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    marginTop: Spacing.sm,
    ...Shadows.sm,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  selectedCategoryOption: {
    backgroundColor: Colors.primary[50],
  },
  categoryOptionIcon: {
    fontSize: Typography.sizes.lg,
    marginRight: Spacing.sm,
  },
  categoryOptionText: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
  },
  selectedCategoryOptionText: {
    color: Colors.primary[600],
    fontWeight: Typography.weights.medium,
  },


  // Note Info Display
  noteInfo: {
    marginBottom: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  noteInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryInfoIcon: {
    fontSize: Typography.sizes.base,
    marginRight: Spacing.xs,
  },
  categoryInfoText: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    fontWeight: Typography.weights.medium,
  },

  // Non-editable input styling
  nonEditableInput: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingVertical: 0,
  },

  // Edit Button Container
  editButtonContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginTop: -20, // Overlap effect
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.background.secondary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: AppTheme.border.medium,
  },
  cancelButtonText: {
    color: AppTheme.text.secondary,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    marginLeft: Spacing.sm,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.accent.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    // Theme shadows
    shadowColor: AppTheme.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: 'white',
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.accent.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    shadowColor: AppTheme.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 160,
  },
  editButtonText: {
    color: 'white',
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    marginLeft: Spacing.sm,
  },
});
