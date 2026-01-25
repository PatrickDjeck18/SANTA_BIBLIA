import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    StatusBar,
    Alert,
    RefreshControl,
    KeyboardAvoidingView,
    Platform,
    Modal as RNModal,
    useWindowDimensions,
    FlatList,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Plus,
    BookOpen,
    Search,
    Trash2,
    Edit3,
    Calendar,
    Tag,
    ChevronRight,
    ArrowLeft,
    Save,
    X,
    Clock,
    Filter,
    BookMarked,
    FileText,
    ChevronDown,
    Check,
    Link as LinkIcon,
    Folder,
    FolderPlus,
} from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme, ThemeText, getThemeShadow } from '@/constants/AppTheme';
import { Spacing, BorderRadius, Typography, Shadows } from '@/constants/DesignTokens';
import BackgroundGradient from '@/components/BackgroundGradient';
import { ModernHeader } from '@/components/ModernHeader';
import { BIBLE_BOOKS, BibleBookInfo } from '@/constants/BibleBooks';
import localBibleService from '@/services/localBibleService';
import * as Haptics from 'expo-haptics';
import BannerAdComponent from '@/components/BannerAd';
import { useInterstitialAds } from '@/hooks/useInterstitialAds';

const NOTES_KEY = '@bible_study_notes';
const CATEGORIES_KEY = '@bible_notes_categories';

// Types
interface AttachedVerse {
    bookId: string;
    bookName: string;
    chapter: number;
    verse: number;
    text: string;
    reference: string;
}

interface NoteCategory {
    id: string;
    name: string;
    emoji: string;
    color: string;
    isCustom: boolean;
}

interface BibleNote {
    id: string;
    title: string;
    reference: string;
    content: string;
    tags: string[];
    category: string; // category id
    attachedVerses: AttachedVerse[];
    createdAt: string;
    updatedAt: string;
}

// Default categories
// Default categories
const DEFAULT_CATEGORIES: NoteCategory[] = [
    { id: 'sermon', name: 'Notas de sermón', emoji: '🎤', color: '#F97316', isCustom: false },
    { id: 'study', name: 'Estudio bíblico', emoji: '📖', color: '#8B5CF6', isCustom: false },
    { id: 'prayer', name: 'Pedidos de oración', emoji: '🙏', color: '#EC4899', isCustom: false },
    { id: 'devotional', name: 'Devocional', emoji: '✨', color: '#10B981', isCustom: false },
    { id: 'questions', name: 'Preguntas', emoji: '❓', color: '#3B82F6', isCustom: false },
    { id: 'insights', name: 'Pensamientos', emoji: '💡', color: '#F59E0B', isCustom: false },
];

// Safe colors matching other screens
const safeColors = {
    primary: { 100: '#FFF7ED', 200: '#FFEDD5', 300: '#FED7AA', 400: '#FDBA74', 500: '#FB923C', 600: '#F97316', 700: '#EA580C' },
    secondary: { 100: '#EDE9FE', 200: '#DDD6FE', 300: '#C4B5FD', 400: '#A78BFA', 500: '#8B5CF6', 600: '#7C3AED', 700: '#6D28D9' },
    success: { 100: '#DCFCE7', 500: '#22C55E', 600: '#16A34A' },
    warning: { 100: '#FEF3C7', 500: '#F59E0B', 600: '#D97706' },
    error: { 500: '#EF4444' },
    neutral: { 50: '#FAFAF9', 100: '#F5F5F4', 200: '#E7E5E4', 300: '#D6D3D1', 400: '#A8A29E', 500: '#78716C', 600: '#57534E', 700: '#44403C', 800: '#292524', 900: '#1C1917' },
};

export default function BibleStudyNotesScreen() {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    useInterstitialAds('notes');
    const [notes, setNotes] = useState<BibleNote[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showVersePickerModal, setShowVersePickerModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [editingNote, setEditingNote] = useState<BibleNote | null>(null);
    const [loading, setLoading] = useState(true);

    // Categories
    const [categories, setCategories] = useState<NoteCategory[]>(DEFAULT_CATEGORIES);
    const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryEmoji, setNewCategoryEmoji] = useState('📝');

    // Form state
    const [title, setTitle] = useState('');
    const [reference, setReference] = useState('');
    const [content, setContent] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [attachedVerses, setAttachedVerses] = useState<AttachedVerse[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('study'); // Default to Bible Study

    // Verse Picker state
    const [selectedBook, setSelectedBook] = useState<BibleBookInfo | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<number>(1);
    const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
    const [versePickerStep, setVersePickerStep] = useState<'book' | 'chapter' | 'verse'>('book');
    const [verseSearchQuery, setVerseSearchQuery] = useState('');
    const [loadingVerse, setLoadingVerse] = useState(false);

    // Animation
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    // Animation on mount
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 80,
                friction: 10,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // Load notes and categories
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // Load notes
            const savedNotes = await AsyncStorage.getItem(NOTES_KEY);
            if (savedNotes) {
                const parsedNotes = JSON.parse(savedNotes);
                // Ensure attachedVerses and category exist for backward compatibility
                const notesWithDefaults = parsedNotes.map((note: any) => ({
                    ...note,
                    attachedVerses: note.attachedVerses || [],
                    category: note.category || 'study', // Default to Bible Study
                }));
                setNotes(notesWithDefaults);
            }
            // Load custom categories
            const savedCategories = await AsyncStorage.getItem(CATEGORIES_KEY);
            if (savedCategories) {
                const customCategories = JSON.parse(savedCategories);
                setCategories([...DEFAULT_CATEGORIES, ...customCategories]);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveNotes = async (updatedNotes: BibleNote[]) => {
        try {
            await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
            setNotes(updatedNotes);
        } catch (error) {
            Alert.alert('Erreur', 'Échec de l\'enregistrement des notes');
        }
    };

    const saveCustomCategories = async (customCategories: NoteCategory[]) => {
        try {
            await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(customCategories));
            setCategories([...DEFAULT_CATEGORIES, ...customCategories]);
        } catch (error) {
            Alert.alert('Error', 'Failed to save categories');
        }
    };

    const handleCreateCategory = () => {
        if (!newCategoryName.trim()) {
            Alert.alert('Requis', 'Veuillez entrer un nom de catégorie');
            return;
        }

        const newId = `custom_${Date.now()}`;
        const customColors = ['#EF4444', '#06B6D4', '#84CC16', '#A855F7', '#F43F5E', '#14B8A6'];
        const randomColor = customColors[Math.floor(Math.random() * customColors.length)];

        const newCategory: NoteCategory = {
            id: newId,
            name: newCategoryName.trim(),
            emoji: newCategoryEmoji,
            color: randomColor,
            isCustom: true,
        };

        const customCategories = categories.filter(c => c.isCustom);
        saveCustomCategories([...customCategories, newCategory]);

        setNewCategoryName('');
        setNewCategoryEmoji('📝');
        setShowCategoryModal(false);
        setSelectedCategory(newId);

        if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const handleDeleteCategory = (categoryId: string) => {
        const category = categories.find(c => c.id === categoryId);
        if (!category?.isCustom) {
            Alert.alert('Imposible eliminar', 'Las categorías predeterminadas no pueden ser eliminadas');
            return;
        }

        Alert.alert(
            'Eliminar categoría',
            `¿Eliminar "${category.name}"? Las notas de esta categoría se moverán a "Estudio bíblico".`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        // Move notes to Bible Study category
                        const updatedNotes = notes.map(n =>
                            n.category === categoryId ? { ...n, category: 'study' } : n
                        );
                        await saveNotes(updatedNotes);

                        // Remove category
                        const customCategories = categories.filter(c => c.isCustom && c.id !== categoryId);
                        await saveCustomCategories(customCategories);

                        if (selectedFilterCategory === categoryId) {
                            setSelectedFilterCategory('all');
                        }
                    },
                },
            ]
        );
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
            if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    const resetForm = () => {
        setTitle('');
        setReference('');
        setContent('');
        setTags([]);
        setTagInput('');
        setAttachedVerses([]);
        setSelectedCategory('study');
        setEditingNote(null);
        setShowAddModal(false);
    };

    const handleOpenAdd = () => {
        if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        resetForm();
        setShowAddModal(true);
    };

    const handleSaveNote = async () => {
        if (!title.trim()) {
            Alert.alert('Requis', 'Veuillez entrer un titre pour votre note');
            return;
        }

        if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const now = new Date().toISOString();

        if (editingNote) {
            const updatedNotes = notes.map(n =>
                n.id === editingNote.id
                    ? { ...n, title, reference, content, tags, category: selectedCategory, attachedVerses, updatedAt: now }
                    : n
            );
            await saveNotes(updatedNotes);
        } else {
            const newNote: BibleNote = {
                id: Date.now().toString(),
                title: title.trim(),
                reference: reference.trim(),
                content: content.trim(),
                tags,
                category: selectedCategory,
                attachedVerses,
                createdAt: now,
                updatedAt: now,
            };
            await saveNotes([newNote, ...notes]);
        }

        resetForm();
    };

    const handleEditNote = (note: BibleNote) => {
        setEditingNote(note);
        setTitle(note.title);
        setReference(note.reference);
        setContent(note.content);
        setTags(note.tags);
        setSelectedCategory(note.category || 'study');
        setAttachedVerses(note.attachedVerses || []);
        setShowAddModal(true);
    };

    const handleDeleteNote = (noteId: string) => {
        if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
            'Supprimer la note',
            'Êtes-vous sûr de vouloir supprimer cette note ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        const updatedNotes = notes.filter(n => n.id !== noteId);
                        await saveNotes(updatedNotes);
                    },
                },
            ]
        );
    };

    // Verse Picker Functions
    const openVersePicker = () => {
        setVersePickerStep('book');
        setSelectedBook(null);
        setSelectedChapter(1);
        setSelectedVerse(null);
        setVerseSearchQuery('');
        setShowVersePickerModal(true);
    };

    const handleSelectBook = (book: BibleBookInfo) => {
        setSelectedBook(book);
        setSelectedChapter(1);
        setVersePickerStep('chapter');
        if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleSelectChapter = (chapter: number) => {
        setSelectedChapter(chapter);
        setVersePickerStep('verse');
        if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleSelectVerse = async (verseNumber: number) => {
        if (!selectedBook) return;

        setLoadingVerse(true);
        try {
            const verse = localBibleService.getVerse(selectedBook.id, selectedChapter, verseNumber);
            if (verse) {
                const newVerse: AttachedVerse = {
                    bookId: selectedBook.id,
                    bookName: selectedBook.name,
                    chapter: selectedChapter,
                    verse: verseNumber,
                    text: verse.text,
                    reference: `${selectedBook.name} ${selectedChapter}:${verseNumber}`,
                };

                // Check if verse already attached
                const alreadyAttached = attachedVerses.some(
                    v => v.bookId === newVerse.bookId && v.chapter === newVerse.chapter && v.verse === newVerse.verse
                );

                if (!alreadyAttached) {
                    setAttachedVerses([...attachedVerses, newVerse]);
                    if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } else {
                    Alert.alert('Déjà attaché', 'Ce verset est déjà attaché à votre note.');
                }

                setShowVersePickerModal(false);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load verse');
        } finally {
            setLoadingVerse(false);
        }
    };

    const handleRemoveVerse = (verse: AttachedVerse) => {
        setAttachedVerses(attachedVerses.filter(v =>
            !(v.bookId === verse.bookId && v.chapter === verse.chapter && v.verse === verse.verse)
        ));
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Helper to get category by ID
    const getCategoryById = (categoryId: string): NoteCategory | undefined => {
        return categories.find(c => c.id === categoryId);
    };

    const filteredNotes = notes.filter(note => {
        // Filter by category first
        if (selectedFilterCategory !== 'all' && note.category !== selectedFilterCategory) {
            return false;
        }
        // Then filter by search
        if (searchQuery) {
            return (
                note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (note.attachedVerses || []).some(v => v.reference.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }
        return true;
    });

    const filteredBooks = BIBLE_BOOKS.filter(book =>
        book.name.toLowerCase().includes(verseSearchQuery.toLowerCase()) ||
        book.abbreviation.toLowerCase().includes(verseSearchQuery.toLowerCase())
    );

    const stats = {
        total: notes.length,
        thisWeek: notes.filter(n => {
            const noteDate = new Date(n.createdAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return noteDate >= weekAgo;
        }).length,
        withVerses: notes.filter(n => (n.attachedVerses || []).length > 0).length,
    };

    const renderVersePickerContent = () => {
        if (versePickerStep === 'book') {
            return (
                <View style={styles.versePickerContent}>
                    <Text style={styles.versePickerTitle}>Sélectionner un livre</Text>
                    <View style={styles.verseSearchContainer}>
                        <Search size={18} color={safeColors.neutral[400]} />
                        <TextInput
                            style={styles.verseSearchInput}
                            placeholder="Rechercher des livres..."
                            placeholderTextColor={safeColors.neutral[400]}
                            value={verseSearchQuery}
                            onChangeText={setVerseSearchQuery}
                        />
                    </View>
                    <FlatList
                        data={filteredBooks}
                        keyExtractor={item => item.id}
                        style={styles.bookList}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.bookItem}
                                onPress={() => handleSelectBook(item)}
                            >
                                <View style={[styles.bookIcon, { backgroundColor: item.testament === 'old' ? safeColors.primary[100] : safeColors.secondary[100] }]}>
                                    <BookOpen size={16} color={item.testament === 'old' ? safeColors.primary[600] : safeColors.secondary[600]} />
                                </View>
                                <View style={styles.bookInfo}>
                                    <Text style={styles.bookName}>{item.name}</Text>
                                    <Text style={styles.bookMeta}>{item.chapters} chapitres • {item.testament === 'old' ? 'Ancien Testament' : 'Nouveau Testament'}</Text>
                                </View>
                                <ChevronRight size={18} color={safeColors.neutral[400]} />
                            </TouchableOpacity>
                        )}
                    />
                </View>
            );
        }

        if (versePickerStep === 'chapter' && selectedBook) {
            const chapters = Array.from({ length: selectedBook.chapters }, (_, i) => i + 1);
            return (
                <View style={styles.versePickerContent}>
                    <TouchableOpacity style={styles.backButton} onPress={() => setVersePickerStep('book')}>
                        <ArrowLeft size={18} color={safeColors.primary[600]} />
                        <Text style={styles.backButtonText}>{selectedBook.name}</Text>
                    </TouchableOpacity>
                    <Text style={styles.versePickerTitle}>Sélectionner un chapitre</Text>
                    <View style={styles.chapterGrid}>
                        {chapters.map(chapter => (
                            <TouchableOpacity
                                key={chapter}
                                style={styles.chapterButton}
                                onPress={() => handleSelectChapter(chapter)}
                            >
                                <Text style={styles.chapterButtonText}>{chapter}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            );
        }

        if (versePickerStep === 'verse' && selectedBook) {
            const verseCount = localBibleService.getVerseCount(selectedBook.id, selectedChapter);
            const verses = Array.from({ length: verseCount }, (_, i) => i + 1);
            return (
                <View style={styles.versePickerContent}>
                    <TouchableOpacity style={styles.backButton} onPress={() => setVersePickerStep('chapter')}>
                        <ArrowLeft size={18} color={safeColors.primary[600]} />
                        <Text style={styles.backButtonText}>{selectedBook.name} {selectedChapter}</Text>
                    </TouchableOpacity>
                    <Text style={styles.versePickerTitle}>Sélectionner un verset</Text>
                    {loadingVerse ? (
                        <ActivityIndicator size="large" color={safeColors.primary[600]} style={{ marginTop: 40 }} />
                    ) : (
                        <View style={styles.verseGrid}>
                            {verses.map(verse => (
                                <TouchableOpacity
                                    key={verse}
                                    style={styles.verseButton}
                                    onPress={() => handleSelectVerse(verse)}
                                >
                                    <Text style={styles.verseButtonText}>{verse}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            );
        }

        return null;
    };

    const safeBack = useCallback(() => {
        try {
            if (typeof router?.canGoBack === 'function' ? router.canGoBack() : false) {
                router.back();
            } else {
                router.replace('/(tabs)');
            }
        } catch {
            router.replace('/(tabs)');
        }
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <BackgroundGradient variant="warm" />

            {/* Modern Hero Header */}
            <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
                <LinearGradient
                    colors={[safeColors.primary[100], '#FDF8F3']}
                    style={styles.heroGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.heroContent}>
                        <TouchableOpacity style={styles.backBtn} onPress={safeBack}>
                            <ArrowLeft size={22} color={safeColors.neutral[700]} />
                        </TouchableOpacity>
                        <View style={styles.heroTextContainer}>
                            <View style={styles.heroSubtitleRow}>
                                <View style={styles.subtitleIcon}>
                                    <Edit3 size={14} color={safeColors.primary[600]} />
                                </View>
                                <Text style={styles.heroSubtitle}>Tus pensamientos y reflexiones espirituales</Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </Animated.View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={safeColors.primary[600]} />
                    }
                >
                    {/* Stats Cards */}
                    <Animated.View style={[styles.statsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <View style={styles.statCard}>
                            <LinearGradient
                                colors={[safeColors.primary[500], safeColors.primary[700]]}
                                style={styles.statIconGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <FileText size={18} color="#FFFFFF" />
                            </LinearGradient>
                            <View>
                                <Text style={styles.statNumber}>{stats.total}</Text>
                                <Text style={styles.statLabel}>Total de notas</Text>
                            </View>
                        </View>
                        <View style={styles.statCard}>
                            <LinearGradient
                                colors={[safeColors.success[500], safeColors.success[600]]}
                                style={styles.statIconGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Clock size={18} color="#FFFFFF" />
                            </LinearGradient>
                            <View>
                                <Text style={styles.statNumber}>{stats.thisWeek}</Text>
                                <Text style={styles.statLabel}>Esta semana</Text>
                            </View>
                        </View>
                        <View style={styles.statCard}>
                            <LinearGradient
                                colors={[safeColors.secondary[500], safeColors.secondary[600]]}
                                style={styles.statIconGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <BookMarked size={18} color="#FFFFFF" />
                            </LinearGradient>
                            <View>
                                <Text style={styles.statNumber}>{stats.withVerses}</Text>
                                <Text style={styles.statLabel}>Con versículos</Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Search Bar */}
                    <Animated.View style={[styles.searchContainer, { opacity: fadeAnim }]}>
                        <Search size={20} color={safeColors.neutral[400]} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar notas, etiquetas o versículos..."
                            placeholderTextColor={safeColors.neutral[400]}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <X size={18} color={safeColors.neutral[400]} />
                            </TouchableOpacity>
                        )}
                    </Animated.View>

                    {/* Category Filter */}
                    <Animated.View style={[styles.categoryFilterContainer, { opacity: fadeAnim }]}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.categoryFilterScroll}
                        >
                            {/* All Notes filter */}
                            <TouchableOpacity
                                style={[
                                    styles.categoryChip,
                                    selectedFilterCategory === 'all' && styles.categoryChipActive
                                ]}
                                onPress={() => {
                                    setSelectedFilterCategory('all');
                                    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }}
                            >
                                <Text style={styles.categoryChipEmoji}>📋</Text>
                                <Text style={[
                                    styles.categoryChipText,
                                    selectedFilterCategory === 'all' && styles.categoryChipTextActive
                                ]}>Todas las notas</Text>
                            </TouchableOpacity>

                            {/* Category chips */}
                            {categories.map(category => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.categoryChip,
                                        selectedFilterCategory === category.id && {
                                            backgroundColor: category.color,
                                            borderColor: category.color,
                                        }
                                    ]}
                                    onPress={() => {
                                        setSelectedFilterCategory(category.id);
                                        if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    }}
                                    onLongPress={() => category.isCustom && handleDeleteCategory(category.id)}
                                >
                                    <Text style={styles.categoryChipEmoji}>{category.emoji}</Text>
                                    <Text style={[
                                        styles.categoryChipText,
                                        selectedFilterCategory === category.id && styles.categoryChipTextActive
                                    ]}>{category.name}</Text>
                                </TouchableOpacity>
                            ))}

                            {/* Add new category button */}
                            <TouchableOpacity
                                style={styles.addCategoryChip}
                                onPress={() => setShowCategoryModal(true)}
                            >
                                <FolderPlus size={16} color={safeColors.primary[600]} />
                                <Text style={styles.addCategoryText}>Nuevo</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </Animated.View>

                    {/* Notes Section Header */}
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <Text style={styles.sectionTitle}>
                                {selectedFilterCategory === 'all' ? 'Todas las notas' : getCategoryById(selectedFilterCategory)?.name || 'Notas'}
                            </Text>
                            <View style={styles.noteCountBadge}>
                                <Text style={styles.noteCountText}>{filteredNotes.length}</Text>
                            </View>
                        </View>
                        {filteredNotes.length > 0 && (
                            <Text style={styles.sectionSubtitle}>Toca una nota para ver o editar</Text>
                        )}
                    </View>

                    {/* Notes List */}
                    <View style={styles.notesSection}>
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={safeColors.primary[600]} />
                                <Text style={styles.loadingText}>Cargando tus notas...</Text>
                            </View>
                        ) : filteredNotes.length === 0 ? (
                            <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
                                <View style={styles.emptyIconContainer}>
                                    <Edit3 size={48} color={safeColors.neutral[300]} />
                                </View>
                                <Text style={styles.emptyTitle}>No se encontraron notas</Text>
                                <Text style={styles.emptySubtitle}>
                                    {searchQuery ? "Intenta otro término de búsqueda" : "Toca el botón + para crear tu primera nota"}
                                </Text>
                                {!searchQuery && (
                                    <TouchableOpacity style={styles.emptyActionButton} onPress={handleOpenAdd}>
                                        <Plus size={20} color="#FFFFFF" />
                                        <Text style={styles.emptyActionText}>Crear una nota</Text>
                                    </TouchableOpacity>
                                )}
                            </Animated.View>
                        ) : (
                            filteredNotes.map((note, index) => {
                                // Use note's category color for accent bar
                                const noteCategory = getCategoryById(note.category);
                                const categoryColor = noteCategory?.color || safeColors.primary[500];

                                return (
                                    <Animated.View
                                        key={note.id}
                                        style={[
                                            styles.noteCard,
                                            {
                                                opacity: fadeAnim,
                                                transform: [{ translateY: Animated.multiply(slideAnim, new Animated.Value(1 + index * 0.1)) }]
                                            }
                                        ]}
                                    >
                                        {/* Left Accent Bar - uses category color */}
                                        <View style={[styles.noteAccentBar, { backgroundColor: categoryColor }]} />
                                        <TouchableOpacity
                                            onPress={() => handleEditNote(note)}
                                            activeOpacity={0.7}
                                            style={styles.noteCardContent}
                                        >
                                            <View style={styles.noteHeader}>
                                                <View style={styles.noteTitleRow}>
                                                    <Text style={styles.noteTitle} numberOfLines={1}>{note.title}</Text>
                                                    <View style={styles.dateBadge}>
                                                        <Calendar size={10} color={safeColors.neutral[400]} />
                                                        <Text style={styles.noteDate}>{formatDate(note.createdAt)}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.badgesRow}>
                                                    {/* Category Badge */}
                                                    {noteCategory && (
                                                        <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20', borderColor: categoryColor }]}>
                                                            <Text style={styles.categoryBadgeEmoji}>{noteCategory.emoji}</Text>
                                                            <Text style={[styles.categoryBadgeText, { color: categoryColor }]}>{noteCategory.name}</Text>
                                                        </View>
                                                    )}
                                                    {note.reference ? (
                                                        <View style={styles.referenceBadge}>
                                                            <BookOpen size={11} color={safeColors.primary[600]} />
                                                            <Text style={styles.referenceText}>{note.reference}</Text>
                                                        </View>
                                                    ) : null}
                                                    {/* Attached Verses Preview */}
                                                    {(note.attachedVerses || []).length > 0 && (
                                                        <View style={styles.attachedVersesPreview}>
                                                            <LinkIcon size={11} color={safeColors.secondary[600]} />
                                                            <Text style={styles.attachedVersesText} numberOfLines={1}>
                                                                {note.attachedVerses.length} versículo{note.attachedVerses.length > 1 ? 's' : ''}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>

                                            {note.content ? (
                                                <Text style={styles.noteContent} numberOfLines={3}>
                                                    {note.content}
                                                </Text>
                                            ) : null}

                                            <View style={styles.noteFooter}>
                                                <View style={styles.noteTagsRow}>
                                                    {note.tags.slice(0, 3).map(tag => (
                                                        <View key={tag} style={styles.noteTag}>
                                                            <Tag size={10} color={safeColors.neutral[500]} />
                                                            <Text style={styles.noteTagText}>{tag}</Text>
                                                        </View>
                                                    ))}
                                                    {note.tags.length > 3 && (
                                                        <Text style={styles.moreTagsText}>+{note.tags.length - 3}</Text>
                                                    )}
                                                </View>
                                                <View style={styles.noteActions}>
                                                    <TouchableOpacity
                                                        style={styles.editBtn}
                                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                                        onPress={() => handleEditNote(note)}
                                                    >
                                                        <Edit3 size={14} color={safeColors.primary[600]} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={styles.deleteBtn}
                                                        onPress={() => handleDeleteNote(note.id)}
                                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                                    >
                                                        <Trash2 size={14} color={safeColors.error[500]} />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    </Animated.View>
                                );
                            })
                        )}
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Floating Add Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={handleOpenAdd}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={[safeColors.primary[500], safeColors.primary[700]]}
                    style={styles.fabGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Plus size={28} color="#FFFFFF" />
                </LinearGradient>
            </TouchableOpacity>

            {/* Add/Edit Modal */}
            <RNModal
                visible={showAddModal}
                animationType="slide"
                transparent={true}
                onRequestClose={resetForm}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {editingNote ? 'Editar nota' : 'Nueva nota'}
                                </Text>
                                <TouchableOpacity onPress={resetForm} style={styles.closeModalBtn}>
                                    <X size={24} color={safeColors.neutral[600]} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Título</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Título de la nota"
                                        placeholderTextColor={safeColors.neutral[400]}
                                        value={title}
                                        onChangeText={setTitle}
                                        autoFocus
                                    />
                                </View>

                                {/* Category Selection */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Categoría</Text>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        style={styles.categorySelectScroll}
                                    >
                                        {categories.map(category => (
                                            <TouchableOpacity
                                                key={category.id}
                                                style={[
                                                    styles.categorySelectChip,
                                                    selectedCategory === category.id && {
                                                        backgroundColor: category.color,
                                                        borderColor: category.color,
                                                    }
                                                ]}
                                                onPress={() => {
                                                    setSelectedCategory(category.id);
                                                    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                }}
                                            >
                                                <Text style={styles.categorySelectEmoji}>{category.emoji}</Text>
                                                <Text style={[
                                                    styles.categorySelectText,
                                                    selectedCategory === category.id && styles.categorySelectTextActive
                                                ]}>{category.name}</Text>
                                                {selectedCategory === category.id && (
                                                    <Check size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Referencia bíblica (Opcional)</Text>
                                    <View style={styles.referenceInputContainer}>
                                        <BookOpen size={18} color={safeColors.neutral[400]} style={{ marginRight: 8 }} />
                                        <TextInput
                                            style={[styles.input, { borderWidth: 0, paddingLeft: 0, flex: 1, backgroundColor: 'transparent' }]}
                                            placeholder="ex: Psaume 23:1"
                                            placeholderTextColor={safeColors.neutral[400]}
                                            value={reference}
                                            onChangeText={setReference}
                                        />
                                    </View>
                                </View>

                                {/* Attached Verses Section */}
                                <View style={styles.inputGroup}>
                                    <View style={styles.attachedVersesHeader}>
                                        <Text style={styles.inputLabel}>Versículos adjuntos</Text>
                                        <TouchableOpacity style={styles.attachVerseBtn} onPress={openVersePicker}>
                                            <Plus size={16} color="#FFFFFF" />
                                            <Text style={styles.attachVerseBtnText}>Agregar versículo</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {attachedVerses.length > 0 ? (
                                        <View style={styles.attachedVersesList}>
                                            {attachedVerses.map((verse, index) => (
                                                <View key={`${verse.bookId}-${verse.chapter}-${verse.verse}`} style={styles.attachedVerseCard}>
                                                    <View style={styles.attachedVerseContent}>
                                                        <Text style={styles.attachedVerseRef}>{verse.reference}</Text>
                                                        <Text style={styles.attachedVerseText} numberOfLines={2}>"{verse.text}"</Text>
                                                    </View>
                                                    <TouchableOpacity
                                                        style={styles.removeVerseBtn}
                                                        onPress={() => handleRemoveVerse(verse)}
                                                    >
                                                        <X size={16} color={safeColors.error[500]} />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </View>
                                    ) : (
                                        <View style={styles.noVersesContainer}>
                                            <BookMarked size={24} color={safeColors.neutral[300]} />
                                            <Text style={styles.noVersesText}>Ningún versículo adjunto por el momento</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Tus pensamientos</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        placeholder="Escribe tus notas de estudio aquí..."
                                        placeholderTextColor={safeColors.neutral[400]}
                                        value={content}
                                        onChangeText={setContent}
                                        multiline
                                        textAlignVertical="top"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Etiquetas</Text>
                                    <View style={styles.tagInputRow}>
                                        <TextInput
                                            style={[styles.input, { flex: 1 }]}
                                            placeholder="Agregar etiqueta..."
                                            placeholderTextColor={safeColors.neutral[400]}
                                            value={tagInput}
                                            onChangeText={setTagInput}
                                            onSubmitEditing={handleAddTag}
                                        />
                                        <TouchableOpacity style={styles.addTagBtn} onPress={handleAddTag}>
                                            <Plus size={20} color="#FFFFFF" />
                                        </TouchableOpacity>
                                    </View>
                                    {tags.length > 0 && (
                                        <View style={styles.tagsContainer}>
                                            {tags.map(tag => (
                                                <TouchableOpacity
                                                    key={tag}
                                                    style={styles.tag}
                                                    onPress={() => handleRemoveTag(tag)}
                                                >
                                                    <Text style={styles.tagText}>#{tag}</Text>
                                                    <X size={14} color={safeColors.primary[600]} />
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>

                                <View style={{ height: 40 }} />
                            </ScrollView>

                            <View style={[styles.modalFooter, { paddingBottom: Math.max(Spacing.xl, insets.bottom + 20) }]}>
                                <TouchableOpacity style={styles.saveButton} onPress={handleSaveNote}>
                                    <LinearGradient
                                        colors={[safeColors.primary[500], safeColors.primary[700]]}
                                        style={styles.saveButtonGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Save size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                                        <Text style={styles.saveButtonText}>Guardar nota</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </View>
            </RNModal>

            {/* Verse Picker Modal */}
            <RNModal
                visible={showVersePickerModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowVersePickerModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.versePickerModalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Adjuntar un versículo</Text>
                            <TouchableOpacity onPress={() => setShowVersePickerModal(false)} style={styles.closeModalBtn}>
                                <X size={24} color={safeColors.neutral[600]} />
                            </TouchableOpacity>
                        </View>
                        {renderVersePickerContent()}
                    </View>
                </View>
            </RNModal>

            {/* Create Category Modal */}
            <RNModal
                visible={showCategoryModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowCategoryModal(false)}
            >
                <View style={styles.categoryModalOverlay}>
                    <View style={styles.categoryModalContent}>
                        <View style={styles.categoryModalHeader}>
                            <Text style={styles.categoryModalTitle}>Crear una categoría</Text>
                            <TouchableOpacity
                                onPress={() => setShowCategoryModal(false)}
                                style={styles.closeModalBtn}
                            >
                                <X size={20} color={safeColors.neutral[600]} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.categoryModalBody}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Emoji</Text>
                                <View style={styles.emojiInputContainer}>
                                    <TextInput
                                        style={styles.emojiInput}
                                        value={newCategoryEmoji}
                                        onChangeText={(text) => setNewCategoryEmoji(text.slice(-2))}
                                        maxLength={2}
                                    />
                                    <Text style={styles.emojiHint}>Elegir un emoji</Text>
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Nombre de la categoría</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="ej: Serie de sermones"
                                    placeholderTextColor={safeColors.neutral[400]}
                                    value={newCategoryName}
                                    onChangeText={setNewCategoryName}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.createCategoryBtn}
                                onPress={handleCreateCategory}
                            >
                                <LinearGradient
                                    colors={[safeColors.primary[500], safeColors.primary[700]]}
                                    style={styles.createCategoryBtnGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <FolderPlus size={18} color="#FFFFFF" />
                                    <Text style={styles.createCategoryBtnText}>Crear una categoría</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </RNModal>

            {/* Banner Ad at Bottom */}
            <View style={styles.bannerContainer}>
                <BannerAdComponent placement="notes" />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDF8F3',
    },
    bannerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FDF8F3',
        paddingBottom: Platform.OS === 'ios' ? 34 : 48,
        alignItems: 'center',
    },
    // Hero Section
    heroSection: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    heroGradient: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.lg,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    heroContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
        ...Shadows.sm,
    },
    heroTextContainer: {
        flex: 1,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: safeColors.neutral[900],
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    heroSubtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subtitleIcon: {
        width: 24,
        height: 24,
        borderRadius: 8,
        backgroundColor: safeColors.primary[200],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    heroSubtitle: {
        fontSize: 14,
        color: safeColors.neutral[600],
        fontWeight: '500',
    },
    // Legacy header container (kept for compatibility)
    headerContainer: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.sm,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
    },
    // Stats
    statsContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: Spacing.md,
        flexDirection: 'column',
        alignItems: 'center',
        gap: Spacing.xs,
        ...Shadows.md,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statIconGradient: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: safeColors.neutral[900],
        textAlign: 'center',
    },
    statLabel: {
        fontSize: 11,
        color: safeColors.neutral[500],
        textAlign: 'center',
    },
    // Section Header
    sectionHeader: {
        marginBottom: Spacing.md,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: safeColors.neutral[900],
    },
    noteCountBadge: {
        backgroundColor: safeColors.primary[500],
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    noteCountText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    sectionSubtitle: {
        fontSize: 13,
        color: safeColors.neutral[500],
        marginTop: 4,
    },
    // Search
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingHorizontal: Spacing.md,
        paddingVertical: 14,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: safeColors.neutral[200],
        ...Shadows.sm,
    },
    searchIcon: {
        marginRight: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: safeColors.neutral[900],
    },
    notesSection: {
        gap: Spacing.md,
    },
    noteCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        ...Shadows.md,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
        marginBottom: Spacing.sm,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    noteAccentBar: {
        width: 5,
        borderTopLeftRadius: 18,
        borderBottomLeftRadius: 18,
    },
    noteCardContent: {
        flex: 1,
        padding: Spacing.lg,
    },
    noteHeader: {
        marginBottom: Spacing.sm,
    },
    noteTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    noteTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: safeColors.neutral[900],
        flex: 1,
        marginRight: 8,
    },
    noteDate: {
        fontSize: 12,
        color: safeColors.neutral[400],
    },
    referenceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: safeColors.primary[100],
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        gap: 4,
    },
    referenceText: {
        fontSize: 12,
        color: safeColors.primary[600],
        fontWeight: '600',
    },
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: safeColors.neutral[100],
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
        marginTop: 4,
    },
    attachedVersesPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: safeColors.secondary[100],
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        gap: 6,
    },
    attachedVersesText: {
        fontSize: 12,
        color: safeColors.secondary[600],
        fontWeight: '500',
    },
    noteContent: {
        fontSize: 15,
        color: safeColors.neutral[600],
        lineHeight: 22,
        marginTop: Spacing.sm,
        marginBottom: Spacing.md,
    },
    noteFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.xs,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: safeColors.neutral[100],
    },
    noteTagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        flex: 1,
    },
    noteTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: safeColors.neutral[100],
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    noteTagText: {
        fontSize: 11,
        color: safeColors.neutral[600],
        fontWeight: '500',
    },
    moreTagsText: {
        fontSize: 11,
        color: safeColors.neutral[400],
        alignSelf: 'center',
    },
    noteActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    editBtn: {
        padding: 8,
        backgroundColor: safeColors.primary[100],
        borderRadius: 8,
    },
    deleteBtn: {
        padding: 8,
        backgroundColor: safeColors.neutral[100],
        borderRadius: 8,
    },
    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: safeColors.neutral[100],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: safeColors.neutral[800],
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        color: safeColors.neutral[500],
        textAlign: 'center',
        paddingHorizontal: Spacing.xl,
        marginBottom: Spacing.lg,
    },
    emptyActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: safeColors.primary[600],
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: 14,
        gap: 8,
    },
    emptyActionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    // Loading
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        fontSize: 15,
        color: safeColors.neutral[500],
        marginTop: Spacing.md,
    },
    // FAB
    fab: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 100 : 110,
        right: 24,
        ...Shadows.lg,
    },
    fabGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        height: '90%',
        paddingTop: Spacing.xl,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        marginBottom: Spacing.lg,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: safeColors.neutral[900],
    },
    closeModalBtn: {
        padding: 8,
        backgroundColor: safeColors.neutral[100],
        borderRadius: 12,
    },
    modalForm: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: safeColors.neutral[800],
        marginBottom: 10,
    },
    input: {
        backgroundColor: safeColors.neutral[50],
        borderRadius: 14,
        padding: 16,
        fontSize: 16,
        color: safeColors.neutral[900],
        borderWidth: 1,
        borderColor: safeColors.neutral[200],
    },
    referenceInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: safeColors.neutral[50],
        borderRadius: 14,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: safeColors.neutral[200],
    },
    textArea: {
        minHeight: 120,
        textAlignVertical: 'top',
    },
    // Tags
    tagInputRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    addTagBtn: {
        width: 52,
        backgroundColor: safeColors.primary[600],
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 14,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: safeColors.primary[100],
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
        borderWidth: 1,
        borderColor: safeColors.primary[200],
    },
    tagText: {
        fontSize: 13,
        color: safeColors.primary[700],
        fontWeight: '600',
    },
    // Attached Verses Section
    attachedVersesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    attachVerseBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: safeColors.secondary[600],
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 4,
    },
    attachVerseBtnText: {
        fontSize: 13,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    attachedVersesList: {
        gap: Spacing.sm,
        marginTop: Spacing.md,
    },
    attachedVerseCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: safeColors.secondary[100],
        borderRadius: 14,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: safeColors.secondary[200],
    },
    attachedVerseContent: {
        flex: 1,
    },
    attachedVerseRef: {
        fontSize: 14,
        fontWeight: '700',
        color: safeColors.secondary[700],
        marginBottom: 4,
    },
    attachedVerseText: {
        fontSize: 13,
        color: safeColors.neutral[600],
        fontStyle: 'italic',
        lineHeight: 18,
    },
    removeVerseBtn: {
        padding: 6,
        marginLeft: Spacing.sm,
    },
    noVersesContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        backgroundColor: safeColors.neutral[50],
        borderRadius: 14,
        marginTop: Spacing.md,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: safeColors.neutral[300],
    },
    noVersesText: {
        fontSize: 14,
        color: safeColors.neutral[400],
        marginTop: 8,
    },
    // Modal Footer
    modalFooter: {
        padding: Spacing.xl,
        borderTopWidth: 1,
        borderTopColor: safeColors.neutral[100],
        backgroundColor: '#FFFFFF',
    },
    saveButton: {
        borderRadius: 16,
        overflow: 'hidden',
        ...Shadows.md,
    },
    saveButtonGradient: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    // Verse Picker Modal
    versePickerModalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        height: '85%',
        paddingTop: Spacing.xl,
    },
    versePickerContent: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
    },
    versePickerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: safeColors.neutral[800],
        marginBottom: Spacing.md,
    },
    verseSearchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: safeColors.neutral[50],
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
        paddingVertical: 12,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: safeColors.neutral[200],
    },
    verseSearchInput: {
        flex: 1,
        fontSize: 15,
        color: safeColors.neutral[900],
        marginLeft: 8,
    },
    bookList: {
        flex: 1,
    },
    bookItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: safeColors.neutral[100],
    },
    bookIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    bookInfo: {
        flex: 1,
    },
    bookName: {
        fontSize: 16,
        fontWeight: '600',
        color: safeColors.neutral[900],
    },
    bookMeta: {
        fontSize: 12,
        color: safeColors.neutral[500],
        marginTop: 2,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    backButtonText: {
        fontSize: 15,
        color: safeColors.primary[600],
        fontWeight: '600',
        marginLeft: 4,
    },
    chapterGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chapterButton: {
        width: 52,
        height: 52,
        borderRadius: 12,
        backgroundColor: safeColors.neutral[100],
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: safeColors.neutral[200],
    },
    chapterButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: safeColors.neutral[800],
    },
    verseGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingBottom: 100,
    },
    verseButton: {
        width: 48,
        height: 48,
        borderRadius: 10,
        backgroundColor: safeColors.secondary[100],
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: safeColors.secondary[200],
    },
    verseButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: safeColors.secondary[700],
    },
    // Category Filter Styles
    categoryFilterContainer: {
        marginBottom: Spacing.md,
    },
    categoryFilterScroll: {
        paddingRight: Spacing.lg,
        gap: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: safeColors.neutral[200],
        gap: 6,
        ...Shadows.sm,
    },
    categoryChipActive: {
        backgroundColor: safeColors.primary[600],
        borderColor: safeColors.primary[600],
    },
    categoryChipEmoji: {
        fontSize: 16,
    },
    categoryChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: safeColors.neutral[700],
    },
    categoryChipTextActive: {
        color: '#FFFFFF',
    },
    addCategoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: safeColors.primary[100],
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: safeColors.primary[200],
        borderStyle: 'dashed',
        gap: 6,
    },
    addCategoryText: {
        fontSize: 13,
        fontWeight: '600',
        color: safeColors.primary[600],
    },
    // Category Select in Modal
    categorySelectScroll: {
        marginTop: 8,
    },
    categorySelectChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: safeColors.neutral[100],
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: safeColors.neutral[200],
        marginRight: 8,
        gap: 6,
    },
    categorySelectEmoji: {
        fontSize: 16,
    },
    categorySelectText: {
        fontSize: 13,
        fontWeight: '600',
        color: safeColors.neutral[700],
    },
    categorySelectTextActive: {
        color: '#FFFFFF',
    },
    // Create Category Modal
    categoryModalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: Spacing.xl,
    },
    categoryModalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        width: '100%',
        maxWidth: 400,
        ...Shadows.lg,
    },
    categoryModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: safeColors.neutral[100],
    },
    categoryModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: safeColors.neutral[900],
    },
    categoryModalBody: {
        padding: Spacing.lg,
    },
    emojiInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    emojiInput: {
        width: 60,
        height: 60,
        fontSize: 32,
        textAlign: 'center',
        backgroundColor: safeColors.neutral[50],
        borderRadius: 16,
        borderWidth: 1,
        borderColor: safeColors.neutral[200],
    },
    emojiHint: {
        fontSize: 13,
        color: safeColors.neutral[500],
    },
    createCategoryBtn: {
        marginTop: Spacing.md,
        borderRadius: 14,
        overflow: 'hidden',
    },
    createCategoryBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 8,
    },
    createCategoryBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    // Category Badge on Note Cards
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        gap: 4,
    },
    categoryBadgeEmoji: {
        fontSize: 12,
    },
    categoryBadgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
});
