import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Dimensions,
  Modal,
  FlatList,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Plus,
  Edit3,
  Trash2,
  Search,
  Calendar,
  Clock,
  BookOpen,
  Save,
  X,
  FileText,
  Smile,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';
import { router } from 'expo-router';
import BackgroundGradient from '@/components/BackgroundGradient';
import { HeaderCard } from '@/components/HeaderCard';
import { useAuth } from '@/hooks/useAuth';
import { useNotesOptimized as useNotes, Note } from '@/hooks/useNotesOptimized'; // Import the correct Note type from your hook
import AuthGuard from '@/components/auth/AuthGuard';

const { width, height } = Dimensions.get('window');


export default function NoteTakerScreen() {
  const { user } = useAuth();
  const {
    notes,
    loading,
    error,
    refetch, // Use refetch instead of loadNotes
    createNote,
    updateNote,
    deleteNote,
    loadMore,
    hasMore,
  } = useNotes();

  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [savedNote, setSavedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const titleInputRef = useRef<TextInput>(null);
  const contentInputRef = useRef<TextInput>(null);
  const isTransitioningRef = useRef(false);

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

  useEffect(() => {
    if (user?.uid) { // Use uid for consistency with Firebase
      refetch();
    }
  }, [user?.uid, refetch]);


  const saveNote = async (note: Note) => {
    if (!user?.uid) {
      console.error('❌ User not authenticated for saving note');
      Alert.alert('Error', 'You must be logged in to save notes');
      return false;
    }

    console.log('💾 Saving note:', { id: note.id, title: note.title, hasId: !!note.id });

    try {
      if (note.id && note.id !== '') {
        // Update existing note
        console.log('🔄 Updating existing note with ID:', note.id);
        const success = await updateNote({
          id: note.id,
          title: note.title,
          content: note.content,
          category: (note.category as 'reflection' | 'prayer' | 'study' | 'journal' | 'insight' | 'gratitude' | 'other') || 'reflection',
          tags: note.tags || [],
          background_color: note.background_color || '#FFFFFF',
          is_favorite: note.is_favorite || false,
          mood_rating: note.mood_rating,
          bible_reference: note.bible_reference,
          is_private: note.is_private !== false
        });
        console.log('✅ Update result:', !!success);
        return !!success;
      } else {
        // Create new note
        console.log('➕ Creating new note');
        const newNote = await createNote({
          title: note.title,
          content: note.content,
          category: (note.category as 'reflection' | 'prayer' | 'study' | 'journal' | 'insight' | 'gratitude' | 'other') || 'reflection',
          tags: note.tags || [],
          background_color: note.background_color || '#FFFFFF',
          is_favorite: note.is_favorite || false,
          mood_rating: note.mood_rating,
          bible_reference: note.bible_reference,
          is_private: note.is_private !== false
        });
        console.log('✅ Create result:', !!newNote);
        return !!newNote;
      }
    } catch (error) {
      console.error('❌ Error saving note:', error);
      Alert.alert('Error', 'Failed to save note');
      return false;
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user?.uid) {
      Alert.alert('Error', 'You must be logged in to delete notes');
      return false;
    }

    try {
      const success = await deleteNote(noteId);
      if (success) {
        console.log('Note deleted successfully');
        if (currentNote?.id === noteId) {
          setCurrentNote(null);
          setShowNoteModal(false);
        }
        Alert.alert('Success', 'Note deleted successfully!');
        return true;
      } else {
        Alert.alert('Error', 'Failed to delete note');
        return false;
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      Alert.alert('Error', 'Failed to delete note');
      return false;
    }
  };

  const createNewNote = () => {
    if (!user?.uid) {
      Alert.alert('Error', 'You must be logged in to create notes');
      return;
    }

    console.log('Creating new note...');
    
    const newNote: Note = {
  id: '',
  title: '',
  content: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  tags: [],
  background_color: '#FFFFFF',
  category: 'reflection',
  is_private: true,
  is_favorite: false,
  user_id: ''
};
    
    console.log('Setting note state:', { newNote, isEditing: true });
    setCurrentNote(newNote);
    setIsEditing(true); 
    setShowNoteModal(true);
  };

  const openNote = (note: Note) => {
    setCurrentNote(note);
    setSavedNote(note);
    setIsEditing(false); // Open in view mode first
    setShowNoteModal(true);
  };

  const editNote = useCallback(() => {
    setIsEditing(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowNoteModal(false);
    setCurrentNote(null);
    setSavedNote(null);
    setIsEditing(false);
    setShowEmojiPicker(false);
    isTransitioningRef.current = false;
  }, []);

  const saveCurrentNote = async () => {
    if (!currentNote || isTransitioningRef.current) return;

    isTransitioningRef.current = true;

    const noteToSave = {
      ...currentNote,
      updated_at: new Date().toISOString(), // Update timestamp
    };

    const success = await saveNote(noteToSave);
    if (success) {
      setSavedNote(noteToSave);
      setIsEditing(false);
      setTimeout(() => {
        setCurrentNote(noteToSave);
        isTransitioningRef.current = false;
        // Close the modal after successful save
        setShowNoteModal(false);
        setCurrentNote(null);
        setSavedNote(null);
      }, 200);
      refetch();
    } else {
      isTransitioningRef.current = false;
      Alert.alert('Error', 'Failed to save note');
    }
  };

  const updateNoteField = useCallback((field: 'title' | 'content', value: string) => {
    setCurrentNote(prev => {
      if (!prev) return prev;
      if (prev[field] === value) return prev;
      return {
        ...prev,
        [field]: value,
      };
    });
  }, []);

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

  const filteredNotes = notes.filter(note => {
    if (!note || !note.title || !note.content) {
      return false;
    }
    
    const searchLower = searchText.toLowerCase();
    return note.title.toLowerCase().includes(searchLower) ||
           note.content.toLowerCase().includes(searchLower);
  });

  const renderNoteItem = ({ item }: { item: Note }) => {
    if (!item) {
      return null;
    }
    
    return (
      <View>
        <View style={[
          styles.noteCard,
          {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            overflow: 'hidden',
          }
        ]}>
          <View style={styles.noteHeader}>
            <TouchableOpacity
              style={styles.noteContentArea}
              onPress={() => openNote(item)}
              activeOpacity={0.7}
            >
              <View style={styles.noteIcon}>
                <FileText size={20} color={Colors.primary[600]} />
              </View>
              <View style={styles.noteInfo}>
                <Text style={styles.noteTitle} numberOfLines={1}>
                  {item.title || 'Untitled Note'}
                </Text>
                <Text style={styles.notePreview} numberOfLines={2}>
                  {item.content || 'No content'}
                </Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.noteActions}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  console.log('🗑️ DELETE BUTTON PRESSED for note:', item.id, 'Title:', item.title);
                  setNoteToDelete(item);
                  setShowDeleteModal(true);
                }}
                activeOpacity={0.7}
              >
                <Trash2 size={16} color={Colors.neutral[400]} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.noteFooter}>
            <View style={styles.noteMeta}>
              <Calendar size={12} color={Colors.neutral[500]} />
              <Text style={styles.noteDate}>{formatDate(item.updated_at)}</Text>
            </View>
            <View style={styles.noteMeta}>
              <Clock size={12} color={Colors.neutral[500]} />
              <Text style={styles.noteTime}>{formatTime(item.updated_at)}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <AuthGuard
      message="Sign in to save and organize your spiritual notes. Your insights will be securely stored and accessible across all your devices."
      showGuestWarning={true}
    >
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" />
        
        <BackgroundGradient>
        {/* Header */}
        <HeaderCard
          title="Notes"
          subtitle="Capture your thoughts and insights"
          showBackButton={true}
          onBackPress={safeBack}
          rightActions={
            <TouchableOpacity
              style={styles.heroActionButton}
              onPress={createNewNote}
            >
              <Plus size={20} color={Colors.primary[600]} />
            </TouchableOpacity>
          }
          gradientColors={['#fdfcfb', '#e2d1c3', '#c9d6ff']}
        />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.neutral[500]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search notes..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor={Colors.neutral[500]}
            />
            {searchText.trim() ? (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <X size={20} color={Colors.neutral[500]} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Notes List */}
        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Loading notes...</Text>
          </View>
        ) : filteredNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <BookOpen size={48} color={Colors.neutral[400]} />
            <Text style={styles.emptyTitle}>
              {searchText ? 'No notes found' : 'No notes yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchText 
                ? 'Try adjusting your search terms'
                : 'Create your first note to get started'
              }
            </Text>
            {!searchText && (
              <TouchableOpacity
              style={styles.createFirstButton}
              onPress={createNewNote}
              >
              <Plus size={20} color="white" />
              <Text style={styles.createFirstButtonText}>Create Note</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredNotes}
            renderItem={renderNoteItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.notesContent}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={refetch} />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
          />
        )}
        {loading && hasMore && <Text>Loading more notes...</Text>}

        {/* Note Modal - Mobile Optimized */}
        <Modal
          visible={showNoteModal}
          animationType="slide"
          transparent={true}
          statusBarTranslucent={true}
          onRequestClose={closeModal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <TouchableOpacity
              style={styles.modalOverlayTouchable}
              activeOpacity={1}
              onPress={closeModal}
            >
              <TouchableOpacity
                style={styles.modalContainer}
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
              >
                <LinearGradient
                  colors={['#ffffff', '#ffffff']}
                  style={StyleSheet.absoluteFillObject}
                />
                
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={closeModal}
                  >
                    <ArrowLeft size={24} color={Colors.neutral[700]} />
                  </TouchableOpacity>

                  <Text style={styles.modalTitle}>
                    {isEditing ? 'Edit Note' : 'View Note'}
                  </Text>

                  {isEditing ? (
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={saveCurrentNote}
                    >
                      <Save size={24} color={Colors.neutral[700]} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={editNote}
                    >
                      <Edit3 size={24} color={Colors.neutral[700]} />
                    </TouchableOpacity>
                  )}
                </View>

                <ScrollView
                  style={styles.modalContent}
                  keyboardShouldPersistTaps="handled"
                >
                  <TextInput
                    style={styles.noteTitleInput}
                    placeholder="Note Title"
                    value={currentNote?.title || ''}
                    onChangeText={(text) => updateNoteField('title', text)}
                    editable={isEditing}
                    placeholderTextColor={Colors.neutral[500]}
                  />

                  <>
                    <View style={styles.contentSection}>
                      <View style={styles.contentHeader}>
                        <Text style={styles.contentText}>Content</Text>
                        {isEditing && (
                          <TouchableOpacity
                            style={styles.emojiButton}
                            onPress={() => setShowEmojiPicker(!showEmojiPicker)}
                          >
                            <Smile size={20} color={Colors.primary[600]} />
                          </TouchableOpacity>
                        )}
                      </View>

                      <TextInput
                        style={styles.noteContentInput}
                        multiline
                        placeholder="Start writing your note..."
                        value={currentNote?.content || ''}
                        onChangeText={(text) => updateNoteField('content', text)}
                        editable={isEditing}
                        placeholderTextColor={Colors.neutral[500]}
                      />

                      {showEmojiPicker && (
                        <View style={styles.emojiPicker}>
                          <View style={styles.emojiGrid}>
                            {popularEmojis.map((emoji, index) => (
                              <TouchableOpacity
                                key={index}
                                style={styles.emojiItem}
                                onPress={() => {
                                  insertEmoji(emoji);
                                }}
                              >
                                <Text style={styles.emojiText}>{emoji}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  </>

                  <View style={styles.noteViewMeta}>
                    <Text style={styles.noteViewDate}>
                      Last updated: {currentNote?.updated_at ? formatDate(currentNote.updated_at) : 'N/A'}
                    </Text>
                    <Text style={styles.noteViewTime}>
                      {currentNote?.updated_at ? formatTime(currentNote.updated_at) : 'N/A'}
                    </Text>
                  </View>
                </ScrollView>
              </TouchableOpacity>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showDeleteModal}
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View style={styles.deleteModalOverlay}>
            <View style={styles.deleteModalContent}>
              <Text style={styles.deleteModalTitle}>Delete Note</Text>
              <Text style={styles.deleteModalMessage}>
                Are you sure you want to delete "{noteToDelete?.title || 'Untitled Note'}"?
                This action cannot be undone.
              </Text>
              <View style={styles.deleteModalButtons}>
                <TouchableOpacity
                  style={styles.deleteModalCancelButton}
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={styles.deleteModalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteModalDeleteButton}
                  onPress={() => {
                    if (noteToDelete) {
                      handleDeleteNote(noteToDelete.id);
                    }
                  }}
                >
                  <Text style={styles.deleteModalDeleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </BackgroundGradient>
    </View>
  </AuthGuard>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Hero Header
  hero: {
    paddingTop: Platform.OS === 'ios' ? 60 : 24,
  },
  heroGradient: {
    borderBottomLeftRadius: BorderRadius['3xl'],
    borderBottomRightRadius: BorderRadius['3xl'],
    overflow: 'hidden',
  },
  heroContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    paddingTop: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    ...Shadows.sm,
  },
  heroTextBlock: {
    flex: 1,
  },
  heroTitle: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
  },
  heroSubtitle: {
    marginTop: Spacing.xs,
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
  },
  heroActionButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },

  // Search
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.sm,
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
  },

  // Notes List
  notesContainer: {
    flex: 1,
  },
  notesContent: {
    paddingHorizontal: Spacing.lg,
  },
  noteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  noteContentArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteIcon: {
    marginRight: Spacing.sm,
  },
  noteInfo: {
    flex: 1,
  },
  noteTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[800],
  },
  notePreview: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
  },
  noteActions: {
    flexDirection: 'row',
  },
  editButton: {
    padding: Spacing.xs,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  noteDate: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[500],
    marginLeft: Spacing.xs,
  },
  noteTime: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[500],
    marginLeft: Spacing.xs,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.sizes.lg,
    color: Colors.neutral[500],
  },
  emptyTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.lg,
    maxWidth: 280,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[600],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  createFirstButtonText: {
    color: 'white',
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    marginLeft: Spacing.sm,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlayTouchable: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: BorderRadius['3xl'],
    borderTopRightRadius: BorderRadius['3xl'],
    padding: Spacing.lg,
    paddingBottom: Spacing['4xl'],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
  },
  modalCloseButton: {
    padding: Spacing.sm,
  },
  saveButton: {
    padding: Spacing.sm,
    backgroundColor: Colors.primary[600],
    borderRadius: BorderRadius.md,
  },
  modalContent: {
    flex: 1,
  },
  noteTitleInput: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  contentSection: {
    marginBottom: Spacing.lg,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  contentText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[700],
  },
  emojiButton: {
    padding: Spacing.sm,
  },
  noteContentInput: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
    paddingVertical: Spacing.sm,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  emojiPicker: {
    marginTop: Spacing.md,
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
  noteViewMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  noteViewDate: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[500],
  },
  noteViewTime: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[500],
  },

  // Delete Modal Styles
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContent: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    width: '80%',
  },
  deleteModalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
    marginBottom: Spacing.sm,
  },
  deleteModalMessage: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
    marginBottom: Spacing.lg,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteModalCancelButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginRight: Spacing.md,
  },
  deleteModalCancelText: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
  },
  deleteModalDeleteButton: {
    backgroundColor: Colors.error[500],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  deleteModalDeleteText: {
    color: 'white',
    fontSize: Typography.sizes.base,
  },
});