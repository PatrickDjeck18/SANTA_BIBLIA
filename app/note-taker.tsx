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
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  Calendar,
  Clock,
  BookOpen,
  X,
  FileText,
  BarChart3,
  TrendingUp,
  Star,
  Target,
  CheckCircle2,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';
import { router } from 'expo-router';
import BackgroundGradient from '@/components/BackgroundGradient';
import { ModernHeader } from '@/components/ModernHeader';
import AddNoteModal from '@/components/AddNoteModal';
import { useNotesUnified as useNotes, Note } from '@/hooks/useNotesUnified'; // Import the correct Note type from your hook
import BannerAd from '@/components/BannerAd';
import { useInterstitialAds } from '@/hooks/useInterstitialAds';

const { width, height } = Dimensions.get('window');


export default function NoteTakerScreen() {
  const { showInterstitialAd } = useInterstitialAds('notes');
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

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
    refetch();
  }, [refetch]);

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

  // Calculate stats
  const stats = useMemo(() => ({
    total: notes.length,
    recent: notes.filter(note => {
      const noteDate = new Date(note.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return noteDate >= weekAgo;
    }).length,
    categories: new Set(notes.map(note => note.category || 'general')).size,
  }), [notes]);

  // Filter notes based on search
  const filteredNotes = useMemo(() => {
    if (!searchText.trim()) return notes;
    return notes.filter(note =>
      note.title.toLowerCase().includes(searchText.toLowerCase()) ||
      note.content.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [notes, searchText]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };


  const saveNote = async (note: Note) => {
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
      Alert.alert('Error', 'Error al guardar la nota');
      return false;
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const success = await deleteNote(noteId);
      if (success) {
        console.log('Note deleted successfully');
        Alert.alert('Éxito', '¡Nota eliminada con éxito!');
        return true;
      } else {
        Alert.alert('Error', 'Error al eliminar la nota');
        return false;
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      Alert.alert('Error', 'Error al eliminar la nota');
      return false;
    }
  };

  const createNewNote = () => {
    setShowAddModal(true);
  };

  const handleAddNote = async (title: string, content: string, category: string, priority: string) => {
    try {
      console.log('=== Starting note creation ===');
      console.log('Creating note with data:', { title, content, category, priority });

      const newNoteData = {
        title: title.trim(),
        content: content.trim(),
        category: category as any,
        tags: [],
        background_color: '#FFFFFF',
        is_private: true,
        is_favorite: false,
      };

      console.log('Calling createNote with:', newNoteData);
      const createdNote = await createNote(newNoteData);
      console.log('Note created successfully:', createdNote);

      if (createdNote) {
        console.log('Note was created, checking if it appears in notes list...');
        console.log('Current notes count:', notes.length);
        console.log('Current notes:', notes.map(n => ({ id: n.id, title: n.title })));

        // Force a manual refresh as fallback
        console.log('Forcing manual refresh...');
        await refetch();
        console.log('Notes after manual refresh:', notes.map(n => ({ id: n.id, title: n.title })));

        // Wait a moment for real-time subscription to update
        setTimeout(() => {
          console.log('Notes after 2 seconds:', notes.map(n => ({ id: n.id, title: n.title })));
        }, 2000);
      } else {
        console.log('Note creation returned null - there might be an error');
      }

      Alert.alert('Éxito', '📝 ¡Nota agregada con éxito!');
    } catch (error: any) {
      console.error('Error adding note:', error);
      console.error('Error details:', error);
      Alert.alert('Error', `Error al agregar la nota: ${error.message || 'Error desconocido'}`);
    }
  };

  const openNote = (note: Note) => {
    router.push(`/note-viewer?noteId=${note.id}`);
  };


  const formatDate = (date: string) => {
    try {
      const jsDate = new Date(date);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - jsDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return "Hoy";
      if (diffDays === 2) return 'Ayer';
      if (diffDays <= 7) return `Hace ${diffDays - 1} días`;
      return jsDate.toLocaleDateString();
    } catch (error) {
      return 'Desconocido';
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
                  {item.title || 'Nota sin título'}
                </Text>
                <Text style={styles.notePreview} numberOfLines={2}>
                  {item.content || 'Sin contenido'}
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />

      <BackgroundGradient>
        {/* Header Container with proper styling */}
        <View style={styles.headerContainer}>
          <ModernHeader
            title="Notas"
            variant="simple"
            showBackButton={true}
            showReaderButton={false}
            onBackPress={safeBack}
            readerText="Notas. Capture sus pensamientos e inspiraciones. Escriba sus reflexiones espirituales y pensamientos importantes."
          />
        </View>

        {/* Enhanced Notes List with ScrollView */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary[500]}
              colors={[Colors.primary[500]]}
              progressBackgroundColor={Colors.white}
            />
          }
          contentContainerStyle={[styles.scrollViewContent, { paddingBottom: Spacing['4xl'] + 100 }]}
        >
          {/* Stats Card */}
          <View style={styles.statsCardContainer}>
            <View style={styles.statsCard}>
              <View style={styles.statsHeader}>
                <View style={styles.statsIcon}>
                  <BarChart3 size={24} color={Colors.primary[500]} />
                </View>
                <View style={styles.statsTitleContainer}>
                  <Text style={styles.statsTitle}>Estadísticas</Text>
                  <Text style={styles.statsSubtitle}>Sigue tus inspiraciones</Text>
                </View>
              </View>

              <View style={styles.quickStatsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.total}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: Colors.primary[500] }]}>{stats.recent}</Text>
                  <Text style={styles.statLabel}>Reciente</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: Colors.warning[500] }]}>{stats.categories}</Text>
                  <Text style={styles.statLabel}>Categorías</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color={Colors.neutral[400]} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar notas..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor={Colors.neutral[400]}
              />
              {searchText.trim() ? (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <X size={20} color={Colors.neutral[400]} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Banner Ad */}
          <BannerAd placement="notes" />

          <Animated.View
            style={[
              styles.notesList,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {loading && filteredNotes.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary[500]} />
                <Text style={styles.loadingText}>Cargando notas...</Text>
              </View>
            ) : filteredNotes.length === 0 ? (
              <View style={styles.emptyState}>
                <BookOpen size={48} color={Colors.neutral[400]} />
                <Text style={styles.emptyTitle}>
                  {searchText ? 'No se encontraron notas' : 'No hay notas todavía'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {searchText
                    ? 'Intenta ajustar tu búsqueda'
                    : 'Crea tu primera nota para comenzar'
                  }
                </Text>
                {!searchText && (
                  <TouchableOpacity
                    style={styles.createFirstButton}
                    onPress={createNewNote}
                  >
                    <Plus size={20} color="white" />
                    <Text style={styles.createFirstButtonText}>Crear una Nota</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              filteredNotes.map((note, index) => (
                <View key={note.id}>
                  <Animated.View
                    style={[
                      styles.noteCard,
                      {
                        opacity: fadeAnim,
                        transform: [{
                          translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [30 + (index * 10), 0],
                          }),
                        }],
                      },
                    ]}
                  >
                    {renderNoteItem({ item: note })}
                  </Animated.View>
                  {index < filteredNotes.length - 1 && <View style={styles.itemSeparator} />}
                </View>
              ))
            )}
          </Animated.View>
        </ScrollView>

        {/* Floating Add Note Button */}
        <View style={styles.floatingAddButton}>
          <TouchableOpacity
            style={styles.floatingAddButtonInner}
            onPress={createNewNote}
            activeOpacity={0.8}
          >
            <Plus size={24} color={Colors.white} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <AddNoteModal
          isVisible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAddNote={handleAddNote}
        />


        {/* Delete Confirmation Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showDeleteModal}
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View style={styles.deleteModalOverlay}>
            <View style={styles.deleteModalContent}>
              <Text style={styles.deleteModalTitle}>Eliminar nota</Text>
              <Text style={styles.deleteModalMessage}>
                ¿Estás seguro de que deseas eliminar "{noteToDelete?.title || 'Nota sin título'}"?
                Esta acción no se puede deshacer.
              </Text>
              <View style={styles.deleteModalButtons}>
                <TouchableOpacity
                  style={styles.deleteModalCancelButton}
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={styles.deleteModalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteModalDeleteButton}
                  onPress={() => {
                    if (noteToDelete) {
                      handleDeleteNote(noteToDelete.id);
                    }
                  }}
                >
                  <Text style={styles.deleteModalDeleteText}>Eliminar</Text>
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
    backgroundColor: '#FFFFFF',
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
    position: 'relative',
  },


  // Stats Card
  statsCardContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    zIndex: 10,
    elevation: 2,
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  statsTitleContainer: {
    flex: 1,
  },
  statsTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing.xs,
  },
  statsSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
  },
  quickStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    fontWeight: Typography.weights.medium,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.neutral[200],
    marginHorizontal: Spacing.sm,
  },

  // Search
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    zIndex: 10,
    elevation: 2,
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

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  notesList: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['4xl'],
  },
  loadingText: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    marginTop: Spacing.md,
    fontWeight: Typography.weights.medium,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: Colors.neutral[100],
    marginVertical: Spacing.md,
  },

  // Notes List
  notesContainer: {
    flex: 1,
  },
  notesContent: {
    paddingHorizontal: Spacing.lg,
  },
  noteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
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

  // Floating Add Button Styles
  floatingAddButton: {
    position: 'absolute',
    bottom: 100, // Above tab bar
    right: 20,
    zIndex: 1000,
  },
  floatingAddButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
    elevation: 8,
  },
});