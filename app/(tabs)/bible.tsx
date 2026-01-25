/**
 * Modern Bible Screen
 * Uses local JSON files for offline-first Bible reading experience
 * Design: Warm cream theme with orange accents
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  FlatList,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  ActivityIndicator,
  Modal,
  useWindowDimensions,
  Share,
} from 'react-native';
import {
  Book,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  X,
  BookOpen,
  Type,
  Plus,
  Minus,
  Play,
  Pause,
  Heart,
  Share2,
  Edit3,
  Highlighter,
  MessageSquare,
  Check,
  SkipBack,
  SkipForward,
  Volume2,
} from 'lucide-react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { AppTheme } from '@/constants/AppTheme';
import { useInterstitialAds } from '@/hooks/useInterstitialAds';

import { BIBLE_BOOKS, BibleBookInfo } from '@/constants/BibleBooks';
import {
  getAllBooks,
  getBooksByTestament,
  getChapter,
  getChapterCount,
  searchVerses,
  BibleVerse,
  BibleChapter,
} from '@/services/localBibleService';

const { width, height } = Dimensions.get('window');

// Theme Colors - Mapped to unified AppTheme
const THEME = {
  background: AppTheme.background.primary,
  backgroundLight: AppTheme.background.secondary,
  card: AppTheme.card.background,
  cardBorder: AppTheme.border.medium,
  accent: AppTheme.accent.primary,
  accentLight: AppTheme.accent.light,
  accentDark: AppTheme.accent.secondary,
  text: AppTheme.text.primary,
  textSecondary: AppTheme.text.secondary,
  textMuted: AppTheme.text.tertiary,
  border: AppTheme.border.light,
  highlight: AppTheme.accent.ultraLight,
  white: '#FFFFFF',
  black: '#1A1A1A',
};

type ViewMode = 'books' | 'chapters' | 'reading' | 'search';
type Testament = 'all' | 'old' | 'new';

export default function BibleScreen() {
  const { width } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  useInterstitialAds('bible');

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('books');
  const [selectedTestament, setSelectedTestament] = useState<Testament>('all');
  const [selectedBook, setSelectedBook] = useState<BibleBookInfo | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [chapterData, setChapterData] = useState<BibleChapter | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [textSize, setTextSize] = useState(22);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);

  // Highlight & Note states
  const [selectedVerse, setSelectedVerse] = useState<number | string | null>(null);
  const [highlightedVerses, setHighlightedVerses] = useState<{ [key: string]: string }>({});
  const [verseNotes, setVerseNotes] = useState<{ [key: string]: string }>({});
  const [showVerseModal, setShowVerseModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showTextSizeModal, setShowTextSizeModal] = useState(false);
  const [showBookSelector, setShowBookSelector] = useState(false);

  // Highlight color options
  const HIGHLIGHT_COLORS = [
    { id: 'yellow', color: '#FEF3C7', name: 'Yellow' },
    { id: 'green', color: '#D1FAE5', name: 'Green' },
    { id: 'blue', color: '#DBEAFE', name: 'Blue' },
    { id: 'pink', color: '#FCE7F3', name: 'Pink' },
    { id: 'orange', color: '#FFEDD5', name: 'Orange' },
  ];

  // Animation
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Refs to track current state for speech callbacks (avoids stale closures)
  const chapterDataRef = useRef<BibleChapter | null>(null);
  const selectedChapterRef = useRef<number>(1);
  const selectedBookRef = useRef<BibleBookInfo | null>(null);
  const isPlayingRef = useRef(false);

  // Load saved text size
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSize = await AsyncStorage.getItem('bible_text_size');
        if (savedSize) setTextSize(parseInt(savedSize));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);

  // Save text size
  useEffect(() => {
    AsyncStorage.setItem('bible_text_size', textSize.toString());
  }, [textSize]);

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  // Keep refs in sync with state
  useEffect(() => {
    chapterDataRef.current = chapterData;
  }, [chapterData]);

  useEffect(() => {
    selectedChapterRef.current = selectedChapter;
  }, [selectedChapter]);

  useEffect(() => {
    selectedBookRef.current = selectedBook;
  }, [selectedBook]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Get filtered books
  const filteredBooks = useMemo(() => {
    if (selectedTestament === 'all') return BIBLE_BOOKS;
    return BIBLE_BOOKS.filter(book => book.testament === selectedTestament);
  }, [selectedTestament]);

  // Handle book selection
  const handleBookSelect = useCallback((book: BibleBookInfo) => {
    setSelectedBook(book);
    setSelectedChapter(1);
    setViewMode('chapters');
  }, []);

  // Handle quick book selection from modal (goes to chapter 1)
  const handleQuickBookSelect = useCallback((book: BibleBookInfo) => {
    setShowBookSelector(false);
    setSelectedBook(book);
    setSelectedChapter(1);
    const data = getChapter(book.id, 1);
    setChapterData(data);
    setViewMode('chapters');
    Speech.stop();
    setIsPlaying(false);
  }, []);

  // Handle chapter selection
  const handleChapterSelect = useCallback((chapterNum: number) => {
    if (!selectedBook) return;

    setSelectedChapter(chapterNum);
    const data = getChapter(selectedBook.id, chapterNum);
    setChapterData(data);
    setViewMode('reading');
    setCurrentVerseIndex(0);
    Speech.stop();
    setIsPlaying(false);
  }, [selectedBook]);

  // Navigate chapters
  const goToPrevChapter = useCallback(() => {
    if (!selectedBook || selectedChapter <= 1) return;
    handleChapterSelect(selectedChapter - 1);
  }, [selectedBook, selectedChapter, handleChapterSelect]);

  const goToNextChapter = useCallback(() => {
    if (!selectedBook || selectedChapter >= selectedBook.chapters) return;
    handleChapterSelect(selectedChapter + 1);
  }, [selectedBook, selectedChapter, handleChapterSelect]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    Speech.stop();
    setIsPlaying(false);

    if (viewMode === 'reading') {
      setViewMode('chapters');
    } else if (viewMode === 'chapters') {
      setViewMode('books');
      setSelectedBook(null);
    } else if (viewMode === 'search') {
      setViewMode('books');
      setSearchQuery('');
      setSearchResults([]);
    } else {
      router.back();
    }
  }, [viewMode]);

  // Handle search
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setViewMode('search');

    setTimeout(() => {
      const results = searchVerses(searchQuery, {
        testament: selectedTestament === 'all' ? undefined : selectedTestament,
        limit: 50,
      });
      setSearchResults(results);
      setIsSearching(false);
    }, 100);
  }, [searchQuery, selectedTestament]);

  // Handle search result click
  const handleSearchResultClick = useCallback((result: any) => {
    const book = BIBLE_BOOKS.find(b => b.id === result.bookId);
    if (!book) return;

    setSelectedBook(book);
    setSelectedChapter(result.chapter);
    const data = getChapter(result.bookId, result.chapter);
    setChapterData(data);
    setViewMode('reading');
  }, []);

  // Text size controls
  const increaseTextSize = useCallback(() => {
    setTextSize(prev => Math.min(prev + 2, 36));
  }, []);

  const decreaseTextSize = useCallback(() => {
    setTextSize(prev => Math.max(prev - 2, 16));
  }, []);

  // Audio controls
  const togglePlayPause = useCallback(async () => {
    if (!chapterData || !chapterData.verses.length) return;

    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakVerse(currentVerseIndex);
    }
  }, [isPlaying, chapterData, currentVerseIndex]);

  // Speak verse using refs to always access latest state (avoids stale closures)
  const speakVerse = useCallback(async (index: number) => {
    // Use refs to get the latest state values
    const currentChapterData = chapterDataRef.current;
    const currentSelectedBook = selectedBookRef.current;
    const currentSelectedChapter = selectedChapterRef.current;

    if (!currentChapterData || index >= currentChapterData.verses.length || isMuted) {
      // If we've finished the chapter, try to go to next chapter
      if (currentChapterData && index >= currentChapterData.verses.length && currentSelectedBook && currentSelectedChapter < currentSelectedBook.chapters) {
        // Stop current speech before advancing
        Speech.stop();

        // Advance to next chapter and continue playing
        const nextChapter = currentSelectedChapter + 1;
        const nextChapterData = getChapter(currentSelectedBook.id, nextChapter);
        if (nextChapterData && nextChapterData.verses.length > 0) {
          // Update state
          setSelectedChapter(nextChapter);
          setChapterData(nextChapterData);
          setCurrentVerseIndex(0);

          // Update refs immediately so next speakVerse call uses new data
          selectedChapterRef.current = nextChapter;
          chapterDataRef.current = nextChapterData;

          // Speak first verse of next chapter after a brief pause
          setTimeout(() => {
            if (isPlayingRef.current) {
              speakVerseWithData(nextChapterData, 0);
            }
          }, 500);
          return;
        }
      }
      setIsPlaying(false);
      isPlayingRef.current = false;
      return;
    }

    const verse = currentChapterData.verses[index];
    setCurrentVerseIndex(index);

    // Build the text to speak - include book name and chapter for first verse
    let textToSpeak = `${verse.verse}. ${verse.text}`;
    if (index === 0 && currentSelectedBook) {
      textToSpeak = `${currentSelectedBook.name}, Chapter ${currentSelectedChapter}. ${textToSpeak}`;
    }

    try {
      await Speech.speak(textToSpeak, {
        language: 'es',
        rate: speechRate,
        onDone: () => {
          // Check if still playing (user might have stopped)
          if (!isPlayingRef.current) return;

          // Get latest chapter data from ref
          const latestChapterData = chapterDataRef.current;
          if (!latestChapterData) return;

          if (index < latestChapterData.verses.length - 1) {
            setTimeout(() => speakVerse(index + 1), 300);
          } else {
            // End of chapter - trigger auto-advance by calling with out-of-bounds index
            setTimeout(() => speakVerse(index + 1), 300);
          }
        },
        onError: () => {
          setIsPlaying(false);
          isPlayingRef.current = false;
        },
      });
    } catch (error) {
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
  }, [isMuted, speechRate]);

  // Helper function to speak verse from specific chapter data (for when we just loaded new data)
  const speakVerseWithData = useCallback(async (data: BibleChapter, index: number) => {
    if (!data || index >= data.verses.length || isMuted) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      return;
    }

    const verse = data.verses[index];
    setCurrentVerseIndex(index);

    // Build the text to speak - include book name and chapter for first verse
    const currentSelectedBook = selectedBookRef.current;
    const currentSelectedChapter = selectedChapterRef.current;
    let textToSpeak = `${verse.verse}. ${verse.text}`;
    if (index === 0 && currentSelectedBook) {
      textToSpeak = `${currentSelectedBook.name}, Chapter ${currentSelectedChapter}. ${textToSpeak}`;
    }

    try {
      await Speech.speak(textToSpeak, {
        language: 'es',
        rate: speechRate,
        onDone: () => {
          // Check if still playing
          if (!isPlayingRef.current) return;

          if (index < data.verses.length - 1) {
            // Continue with next verse using speakVerse (which uses refs)
            setTimeout(() => speakVerse(index + 1), 300);
          } else {
            // End of chapter - trigger auto-advance
            setTimeout(() => speakVerse(index + 1), 300);
          }
        },
        onError: () => {
          setIsPlaying(false);
          isPlayingRef.current = false;
        },
      });
    } catch (error) {
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
  }, [isMuted, speechRate, speakVerse]);

  // Skip to previous verse
  const skipToPrevVerse = useCallback(() => {
    if (!chapterData) return;
    Speech.stop();
    const newIndex = Math.max(0, currentVerseIndex - 1);
    setCurrentVerseIndex(newIndex);
    if (isPlaying) {
      setTimeout(() => speakVerse(newIndex), 100);
    }
  }, [chapterData, currentVerseIndex, isPlaying, speakVerse]);

  // Skip to next verse
  const skipToNextVerse = useCallback(() => {
    if (!chapterData) return;
    Speech.stop();
    const newIndex = Math.min(chapterData.verses.length - 1, currentVerseIndex + 1);
    setCurrentVerseIndex(newIndex);
    if (isPlaying) {
      setTimeout(() => speakVerse(newIndex), 100);
    }
  }, [chapterData, currentVerseIndex, isPlaying, speakVerse]);

  // Cycle through speech rates
  const cycleSpeechRate = useCallback(() => {
    const rates = [0.5, 0.75, 1.0, 1.25, 1.5];
    const currentIndex = rates.indexOf(speechRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setSpeechRate(rates[nextIndex]);
    // Restart speech at new rate if playing
    if (isPlaying && chapterData) {
      Speech.stop();
      setTimeout(() => speakVerse(currentVerseIndex), 100);
    }
  }, [speechRate, isPlaying, chapterData, currentVerseIndex, speakVerse]);

  // Highlight & Note functions
  const getVerseKey = useCallback((verseNum: number | string) => {
    if (!selectedBook) return '';
    return `${selectedBook.id}-${selectedChapter}-${verseNum}`;
  }, [selectedBook, selectedChapter]);

  const handleVersePress = useCallback((verseIndex: number) => {
    if (!chapterData) return;
    const verse = chapterData.verses[verseIndex];
    setSelectedVerse(verse.verse);
    const key = getVerseKey(verse.verse);
    setNoteText(verseNotes[key] || '');
    setShowVerseModal(true);
  }, [chapterData, getVerseKey, verseNotes]);

  const applyHighlight = useCallback((colorId: string) => {
    if (selectedVerse === null) return;
    const key = getVerseKey(selectedVerse);
    const color = HIGHLIGHT_COLORS.find(c => c.id === colorId);
    if (color) {
      setHighlightedVerses(prev => ({ ...prev, [key]: color.color }));
      // Save to AsyncStorage
      AsyncStorage.setItem('bible_highlights', JSON.stringify({ ...highlightedVerses, [key]: color.color }));
    }
  }, [selectedVerse, getVerseKey, HIGHLIGHT_COLORS, highlightedVerses]);

  const saveNote = useCallback(() => {
    if (selectedVerse === null) return;
    const key = getVerseKey(selectedVerse);
    setVerseNotes(prev => ({ ...prev, [key]: noteText }));
    // Save to AsyncStorage
    AsyncStorage.setItem('bible_notes', JSON.stringify({ ...verseNotes, [key]: noteText }));
    setShowVerseModal(false);
  }, [selectedVerse, getVerseKey, noteText, verseNotes]);

  const removeHighlight = useCallback(() => {
    if (selectedVerse === null) return;
    const key = getVerseKey(selectedVerse);
    setHighlightedVerses(prev => {
      const updated = { ...prev };
      delete updated[key];
      AsyncStorage.setItem('bible_highlights', JSON.stringify(updated));
      return updated;
    });
  }, [selectedVerse, getVerseKey]);

  // Share Verse Function
  const handleShareVerse = useCallback(async () => {
    if (!selectedVerse || !chapterData || !selectedBook) return;

    // Find the full verse object
    const verseObj = chapterData.verses.find(v => v.verse === selectedVerse);
    if (!verseObj) return;

    const iosUrl = 'https://apps.apple.com/app/id6757971912';
    const androidUrl = 'https://play.google.com/store/apps/details?id=com.daily.santa.biblia';

    const message = `"${verseObj.text}"\n\n${selectedBook.name} ${selectedChapter}:${selectedVerse}\n\nLee más en la app Santa Biblia:\niOS: ${iosUrl}\nAndroid: ${androidUrl}`;

    try {
      await Share.share({
        message,
        title: 'Compartir Versículo',
      });
    } catch (error) {
      console.error('Error sharing verse:', error);
    }
  }, [selectedVerse, chapterData, selectedBook, selectedChapter]);

  // Load saved highlights and notes
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedHighlights = await AsyncStorage.getItem('bible_highlights');
        const savedNotes = await AsyncStorage.getItem('bible_notes');
        if (savedHighlights) setHighlightedVerses(JSON.parse(savedHighlights));
        if (savedNotes) setVerseNotes(JSON.parse(savedNotes));
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    };
    loadSavedData();
  }, []);

  // Render book item
  const renderBookItem = useCallback(({ item }: { item: BibleBookInfo }) => (
    <TouchableOpacity
      style={styles.bookItem}
      onPress={() => handleBookSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.bookItemContent}>
        <View style={[
          styles.bookItemIcon,
          { backgroundColor: item.testament === 'old' ? THEME.accentLight : '#E8F4FF' }
        ]}>
          <BookOpen size={16} color={item.testament === 'old' ? THEME.accent : '#4A90D9'} />
        </View>
        <View style={styles.bookItemText}>
          <Text style={styles.bookItemName}>{item.name}</Text>
          <Text style={styles.bookItemChapters}>{item.chapters} capítulos</Text>
        </View>
        <ChevronRight size={18} color={THEME.textMuted} />
      </View>
    </TouchableOpacity>
  ), [handleBookSelect]);

  // Render chapter grid
  const renderChapterGrid = () => {
    if (!selectedBook) return null;

    const chapters = Array.from({ length: selectedBook.chapters }, (_, i) => i + 1);
    const totalChapters = selectedBook.chapters;

    // Responsive Layout Calculation
    const colCount = 5;
    const gap = 12;
    const padding = 20;
    const itemSize = (width - (padding * 2) - (gap * (colCount - 1))) / colCount;

    return (
      <View style={styles.chapterGridContainer}>
        <View style={styles.chapterProgressRow}>
          <Text style={styles.chapterProgressText}>
            {totalChapters} Capítulos Disponibles
          </Text>
          <View style={styles.chapterProgressBadge}>
            <BookOpen size={12} color={THEME.accent} />
            <Text style={styles.chapterProgressBadgeText}>Comenzar a Leer</Text>
          </View>
        </View>
        <View style={[styles.chapterGrid, { gap }]}>
          {chapters.map(num => (
            <TouchableOpacity
              key={num}
              style={[styles.chapterCell, { width: itemSize, height: itemSize }]}
              onPress={() => handleChapterSelect(num)}
              activeOpacity={0.6}
            >
              <View style={styles.chapterCellInner}>
                <Text style={styles.chapterNumber}>{num}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Render reading view
  const renderReadingView = () => {
    if (!selectedBook || !chapterData) return null;

    const progress = selectedChapter / selectedBook.chapters;

    return (
      <View style={styles.readingContainer}>
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>

        {/* Reading Card */}
        <View style={styles.readingCard}>
          {/* Top Right Controls: Audio + Close */}
          <View style={styles.topRightControls}>
            <TouchableOpacity style={styles.audioIconBtn} onPress={togglePlayPause}>
              {isPlaying ? (
                <Pause size={20} color={THEME.accent} />
              ) : (
                <Play size={20} color={THEME.accent} />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={handleBack}>
              <X size={20} color={THEME.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Reference Header */}
          <View style={styles.referenceHeader}>
            <BookOpen size={16} color={THEME.textSecondary} />
            <Text style={styles.referenceText}>
              {selectedBook.name} {selectedChapter}:1-{chapterData.verses.length}
            </Text>
          </View>

          {/* Tap hint */}
          <View style={styles.tapHint}>
            <Highlighter size={14} color={THEME.textMuted} />
            <Text style={styles.tapHintText}>Toca cualquier versículo para resaltar o añadir notas</Text>
          </View>

          {/* Verses Content */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.versesScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {chapterData.verses.map((verse, index) => {
              const verseKey = getVerseKey(verse.verse);
              const highlightColor = highlightedVerses[verseKey];
              const hasNote = verseNotes[verseKey] && verseNotes[verseKey].length > 0;

              return (
                <TouchableOpacity
                  key={verse.verse}
                  onPress={() => handleVersePress(index)}
                  activeOpacity={0.7}
                  style={[
                    styles.verseContainer,
                    highlightColor && {
                      backgroundColor: highlightColor,
                      borderRadius: 12,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      marginVertical: 4,
                      borderWidth: 1,
                      borderColor: 'rgba(0,0,0,0.08)',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    },
                  ]}
                >
                  <View style={styles.verseRow}>
                    <Text
                      style={[
                        styles.verseText,
                        { fontSize: textSize, lineHeight: textSize * 1.9 },
                        currentVerseIndex === index && isPlaying && styles.verseHighlighted,
                      ]}
                    >
                      <Text style={styles.verseNumber}>{verse.verse} </Text>
                      {verse.text}
                    </Text>
                    {hasNote && (
                      <View style={styles.noteIndicator}>
                        <MessageSquare size={12} color={THEME.accent} fill={THEME.accentLight} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Chapter Navigation with Text Size Controls */}
        <View style={styles.chapterNavigation}>
          <TouchableOpacity
            style={[styles.chapterNavButton, selectedChapter <= 1 && styles.chapterNavButtonDisabled]}
            onPress={goToPrevChapter}
            disabled={selectedChapter <= 1}
          >
            <ChevronLeft size={24} color={selectedChapter > 1 ? THEME.accent : THEME.textMuted} />
          </TouchableOpacity>

          <View style={styles.textSizeControls}>
            <TouchableOpacity style={styles.textSizeBtn} onPress={decreaseTextSize}>
              <Minus size={18} color={THEME.text} />
            </TouchableOpacity>
            <Text style={styles.textSizeValue}>{textSize}</Text>
            <TouchableOpacity style={styles.textSizeBtn} onPress={increaseTextSize}>
              <Plus size={18} color={THEME.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.chapterNavButton, selectedChapter >= selectedBook.chapters && styles.chapterNavButtonDisabled]}
            onPress={goToNextChapter}
            disabled={selectedChapter >= selectedBook.chapters}
          >
            <ChevronRight size={24} color={selectedChapter < selectedBook.chapters ? THEME.accent : THEME.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render search results
  const renderSearchResults = () => (
    <View style={styles.searchResultsContainer}>
      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.accent} />
          <Text style={styles.loadingText}>Buscando...</Text>
        </View>
      ) : searchResults.length === 0 ? (
        <View style={styles.emptyState}>
          <Search size={48} color={THEME.textMuted} />
          <Text style={styles.emptyStateText}>No se encontraron resultados</Text>
          <Text style={styles.emptyStateSubtext}>Intenta con un término diferente</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => `${item.bookId}-${item.chapter}-${item.verse}-${index}`}
          contentContainerStyle={{ paddingBottom: tabBarHeight + 20, paddingTop: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.searchResultCard}
              onPress={() => handleSearchResultClick(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.searchResultReference}>{item.reference}</Text>
              <Text style={styles.searchResultText} numberOfLines={3}>{item.text}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          {viewMode === 'books' ? (
            <Book size={24} color={THEME.accent} />
          ) : (
            <ArrowLeft size={24} color={THEME.accent} />
          )}
        </TouchableOpacity>

        {(viewMode === 'reading' || viewMode === 'chapters') ? (
          <TouchableOpacity
            style={styles.headerTitleButton}
            onPress={() => setShowBookSelector(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.headerTitle}>
              {viewMode === 'chapters' && selectedBook?.name}
              {viewMode === 'reading' && `${selectedBook?.name} ${selectedChapter}`}
            </Text>
            <ChevronDown size={18} color={THEME.accent} />
          </TouchableOpacity>
        ) : (
          <Text style={styles.headerTitle}>
            {viewMode === 'books' && 'Santa Biblia'}
            {viewMode === 'search' && 'Resultados de Búsqueda'}
          </Text>
        )}

        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => viewMode === 'search' ? handleBack() : setViewMode('search')}
        >
          {viewMode === 'search' ? (
            <X size={24} color={THEME.accent} />
          ) : (
            <Search size={24} color={THEME.accent} />
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {(viewMode === 'books' || viewMode === 'search') && (
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <Search size={18} color={THEME.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar en la Biblia..."
              placeholderTextColor={THEME.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color={THEME.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Testament Filter */}
      {viewMode === 'books' && (
        <View style={styles.testamentFilter}>
          {(['all', 'old', 'new'] as Testament[]).map(testament => (
            <TouchableOpacity
              key={testament}
              style={[
                styles.testamentButton,
                selectedTestament === testament && styles.testamentButtonActive,
              ]}
              onPress={() => setSelectedTestament(testament)}
            >
              <Text style={[
                styles.testamentButtonText,
                selectedTestament === testament && styles.testamentButtonTextActive,
              ]}>
                {testament === 'all' ? 'Todos' : testament === 'old' ? 'Antiguo Testamento' : 'Nuevo Testamento'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {viewMode === 'books' && (
          <FlatList
            data={filteredBooks}
            keyExtractor={item => item.id}
            contentContainerStyle={[styles.booksList, { paddingBottom: tabBarHeight + 20 }]}
            renderItem={renderBookItem}
            showsVerticalScrollIndicator={false}
          />
        )}

        {viewMode === 'chapters' && (
          <ScrollView
            style={styles.chaptersContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: tabBarHeight + 20, paddingTop: 8 }}
          >
            <View style={styles.bookHeaderCard}>
              <View style={styles.bookHeaderEmoji}>
                <Text style={styles.bookEmojiText}>📖</Text>
              </View>
              <Text style={styles.bookHeaderTitle}>{selectedBook?.name}</Text>
              <View style={styles.bookMetaRow}>
                <View style={styles.bookMetaBadge}>
                  <Text style={styles.bookMetaBadgeText}>{selectedBook?.chapters} Capítulos</Text>
                </View>
                <View style={[styles.bookMetaBadge, styles.bookMetaBadgeSecondary]}>
                  <Text style={[styles.bookMetaBadgeText, styles.bookMetaBadgeTextSecondary]}>{selectedBook?.category}</Text>
                </View>
              </View>
              <Text style={styles.bookTestamentLabel}>
                {selectedBook?.testament === 'old' ? 'Antiguo Testamento' : 'Nuevo Testamento'}
              </Text>
            </View>

            <Text style={styles.selectChapterLabel}>SELECCIONA UN CAPÍTULO</Text>
            {renderChapterGrid()}
          </ScrollView>
        )}

        {viewMode === 'reading' && renderReadingView()}

        {viewMode === 'search' && renderSearchResults()}
      </Animated.View>

      {/* Verse Highlight/Note Modal */}
      <Modal
        visible={showVerseModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowVerseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.verseModal}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedBook?.name} {selectedChapter}:{selectedVerse}
              </Text>
              <TouchableOpacity onPress={() => setShowVerseModal(false)}>
                <X size={24} color={THEME.text} />
              </TouchableOpacity>
            </View>

            {/* Highlight Colors */}
            <View style={styles.highlightSection}>
              <View style={styles.sectionHeader}>
                <Highlighter size={16} color={THEME.textSecondary} />
                <Text style={styles.sectionLabel}>RESALTAR</Text>
              </View>
              <View style={styles.colorOptions}>
                {HIGHLIGHT_COLORS.map(colorOption => (
                  <TouchableOpacity
                    key={colorOption.id}
                    style={[
                      styles.colorOption,
                      { backgroundColor: colorOption.color },
                      highlightedVerses[getVerseKey(selectedVerse || 0)] === colorOption.color && styles.colorOptionSelected,
                    ]}
                    onPress={() => applyHighlight(colorOption.id)}
                  />
                ))}
                <TouchableOpacity
                  style={styles.removeHighlightBtn}
                  onPress={removeHighlight}
                >
                  <X size={16} color={THEME.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Actions Section (Share) */}
            <View style={{ marginBottom: 24 }}>
              <View style={styles.sectionHeader}>
                <Share2 size={16} color={THEME.textSecondary} />
                <Text style={styles.sectionLabel}>ACCIONES</Text>
              </View>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  backgroundColor: THEME.backgroundLight,
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: THEME.border
                }}
                onPress={handleShareVerse}
              >
                <Share2 size={18} color={THEME.accent} />
                <Text style={{ fontSize: 15, fontWeight: '600', color: THEME.text }}>Compartir Versículo</Text>
              </TouchableOpacity>
            </View>

            {/* Note Section */}
            <View style={styles.noteSection}>
              <View style={styles.sectionHeader}>
                <MessageSquare size={16} color={THEME.textSecondary} />
                <Text style={styles.sectionLabel}>NOTA</Text>
              </View>
              <TextInput
                style={styles.noteInput}
                placeholder="Añade tus notas aquí..."
                placeholderTextColor={THEME.textMuted}
                value={noteText}
                onChangeText={setNoteText}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveNoteBtn} onPress={saveNote}>
              <Check size={20} color="#FFFFFF" />
              <Text style={styles.saveNoteBtnText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Book Selector Modal */}
      <Modal
        visible={showBookSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBookSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bookSelectorModal}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Libro</Text>
              <TouchableOpacity onPress={() => setShowBookSelector(false)}>
                <X size={24} color={THEME.text} />
              </TouchableOpacity>
            </View>

            {/* Testament Filter */}
            <View style={styles.bookSelectorFilter}>
              {(['all', 'old', 'new'] as Testament[]).map(testament => (
                <TouchableOpacity
                  key={testament}
                  style={[
                    styles.bookSelectorFilterBtn,
                    selectedTestament === testament && styles.bookSelectorFilterBtnActive,
                  ]}
                  onPress={() => setSelectedTestament(testament)}
                >
                  <Text style={[
                    styles.bookSelectorFilterText,
                    selectedTestament === testament && styles.bookSelectorFilterTextActive,
                  ]}>
                    {testament === 'all' ? 'Todos' : testament === 'old' ? 'AT' : 'NT'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Book List */}
            <FlatList
              data={filteredBooks}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.bookSelectorItem,
                    selectedBook?.id === item.id && styles.bookSelectorItemActive,
                  ]}
                  onPress={() => handleQuickBookSelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.bookSelectorIcon,
                    { backgroundColor: item.testament === 'old' ? THEME.accentLight : '#E8F4FF' }
                  ]}>
                    <BookOpen size={14} color={item.testament === 'old' ? THEME.accent : '#4A90D9'} />
                  </View>
                  <View style={styles.bookSelectorItemText}>
                    <Text style={[
                      styles.bookSelectorItemName,
                      selectedBook?.id === item.id && styles.bookSelectorItemNameActive,
                    ]}>
                      {item.name}
                    </Text>
                    <Text style={styles.bookSelectorItemChapters}>{item.chapters} chapters</Text>
                  </View>
                  {selectedBook?.id === item.id && (
                    <Check size={18} color={THEME.accent} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.text,
    flex: 1,
    textAlign: 'center',
  },
  searchButton: {
    padding: 4,
  },
  searchBarContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: THEME.text,
  },
  testamentFilter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  testamentButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  testamentButtonActive: {
    backgroundColor: THEME.accent,
    borderColor: THEME.accent,
  },
  testamentButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: THEME.textSecondary,
  },
  testamentButtonTextActive: {
    color: THEME.white,
  },
  content: {
    flex: 1,
  },
  booksList: {
    paddingHorizontal: 20,
  },
  bookItem: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  bookItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  bookItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookItemText: {
    flex: 1,
  },
  bookItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 2,
  },
  bookItemChapters: {
    fontSize: 13,
    color: THEME.textSecondary,
  },
  chaptersContainer: {
    flex: 1,
  },
  bookHeaderCard: {
    backgroundColor: THEME.card,
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  bookHeaderEmoji: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: THEME.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  bookEmojiText: {
    fontSize: 36,
  },
  bookHeaderIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  bookHeaderTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: THEME.text,
    marginBottom: 12,
  },
  bookMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  bookMetaBadge: {
    backgroundColor: THEME.accentLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  bookMetaBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.accent,
  },
  bookMetaBadgeSecondary: {
    backgroundColor: THEME.backgroundLight,
  },
  bookMetaBadgeTextSecondary: {
    color: THEME.textSecondary,
  },
  bookTestamentLabel: {
    fontSize: 13,
    color: THEME.textMuted,
    marginTop: 4,
  },
  bookHeaderSubtitle: {
    fontSize: 14,
    color: THEME.textSecondary,
  },
  selectChapterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textMuted,
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  chapterGridContainer: {
    paddingHorizontal: 20,
  },
  chapterProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chapterProgressText: {
    fontSize: 14,
    color: THEME.textSecondary,
    fontWeight: '500',
  },
  chapterProgressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chapterProgressBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.accent,
  },
  chapterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chapterCell: {
    marginBottom: 0, // Handled by gap
  },
  chapterCellInner: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chapterNumber: {
    fontSize: 17,
    fontWeight: '700',
    color: '#334155',
  },
  readingContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: THEME.border,
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: THEME.accent,
    borderRadius: 2,
  },
  readingCard: {
    flex: 1,
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 12,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: THEME.backgroundLight,
  },
  topRightControls: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  audioIconBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: THEME.accentLight,
  },
  referenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  referenceText: {
    fontSize: 14,
    color: THEME.textSecondary,
  },
  versesScroll: {
    flex: 1,
  },
  verseText: {
    color: THEME.text,
  },
  verseNumber: {
    fontWeight: '700',
    color: THEME.accent,
  },
  verseHighlighted: {
    backgroundColor: THEME.highlight,
  },

  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  textSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.backgroundLight,
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 8,
  },
  textSizeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: THEME.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  textSizeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.text,
    minWidth: 30,
    textAlign: 'center',
  },
  textSizeButton: {
    padding: 8,
  },
  textSizeLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 8,
  },
  chapterNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  chapterNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chapterNavButtonDisabled: {
    opacity: 0.4,
  },
  chapterNavText: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.accent,
  },
  chapterNavTextDisabled: {
    color: THEME.textMuted,
  },
  searchResultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: THEME.textSecondary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.text,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: THEME.textSecondary,
  },
  searchResultCard: {
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  searchResultReference: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.accent,
    marginBottom: 6,
  },
  searchResultText: {
    fontSize: 14,
    color: THEME.text,
    lineHeight: 22,
  },
  // Highlight & Note Styles
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.highlight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  tapHintText: {
    fontSize: 12,
    color: THEME.textMuted,
  },
  verseContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginHorizontal: -8,
    borderRadius: 8,
  },
  verseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noteIndicator: {
    marginLeft: 4,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  verseModal: {
    backgroundColor: THEME.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
  },
  highlightSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textSecondary,
    letterSpacing: 1,
  },
  colorOptions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: THEME.accent,
    borderWidth: 3,
  },
  removeHighlightBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  noteSection: {
    marginBottom: 24,
  },
  noteInput: {
    backgroundColor: THEME.backgroundLight,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: THEME.text,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  saveNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.accent,
    borderRadius: 12,
    paddingVertical: 16,
  },
  saveNoteBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Audio Player Styles
  audioPlayerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.card,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  audioControlBtn: {
    padding: 8,
  },
  playPauseBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  speedBtn: {
    backgroundColor: THEME.backgroundLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  speedBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
  },
  verseIndicator: {
    backgroundColor: THEME.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verseIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.accent,
  },
  // Header Title Button Style
  headerTitleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    justifyContent: 'center',
  },
  // Book Selector Modal Styles
  bookSelectorModal: {
    backgroundColor: THEME.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  bookSelectorFilter: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  bookSelectorFilterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: THEME.backgroundLight,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  bookSelectorFilterBtnActive: {
    backgroundColor: THEME.accent,
    borderColor: THEME.accent,
  },
  bookSelectorFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.textSecondary,
  },
  bookSelectorFilterTextActive: {
    color: '#FFFFFF',
  },
  bookSelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  bookSelectorItemActive: {
    backgroundColor: THEME.accentLight,
  },
  bookSelectorIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bookSelectorItemText: {
    flex: 1,
  },
  bookSelectorItemName: {
    fontSize: 15,
    fontWeight: '500',
    color: THEME.text,
  },
  bookSelectorItemNameActive: {
    color: THEME.accent,
    fontWeight: '600',
  },
  bookSelectorItemChapters: {
    fontSize: 12,
    color: THEME.textMuted,
    marginTop: 2,
  },
});
