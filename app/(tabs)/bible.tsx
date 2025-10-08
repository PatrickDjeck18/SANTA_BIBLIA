
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  FlatList,
  Animated,
  Dimensions,
  StatusBar,
  Alert,
  Modal,
  Platform,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Breakpoints } from '@/constants/DesignTokens';
import {
  ChevronDown,
  Book,
  Star,
  Share,
  Heart,
  ArrowLeft,
  X,
  Menu,
  MoreHorizontal,
  Headphones,
  SkipForward,
  SkipBack,
  Type, ChevronLeft, ChevronRight,
  Wifi, WifiOff
} from 'lucide-react-native';
import { BIBLE_BOOKS, OLD_TESTAMENT_BOOKS, NEW_TESTAMENT_BOOKS } from '@/constants/BibleBooks';
import { useBibleAPI } from '../../hooks/useBibleAPI';
import { useDailyActivity } from '@/hooks/useDailyActivity';
import { useFocusEffect } from 'expo-router';
import { BibleReader } from '@/components/BibleReader';
import { OfflineBibleManager } from '@/components/OfflineBibleManager';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { ModernHeader } from '@/components/ModernHeader';
import BannerAd from '@/components/BannerAd';
import { useInterstitialAds } from '@/hooks/useInterstitialAds';
import { Search, Filter, Clock, TrendingUp, BookOpen, Hash } from 'lucide-react-native';


interface APIBook {
  id: string;
  translationId: string;
  name: string;
  commonName: string;
  title: string | null;
  order: number;
  numberOfChapters: number;
  firstChapterApiLink: string;
  lastChapterApiLink: string;
  totalNumberOfVerses: number;
  isApocryphal?: boolean;
}

interface APIChapter {
  id: string;
  translationId: string;
  bookId: string;
  chapterNumber: number;
  numberOfVerses: number;
  verses: any[];
}

export default function BibleScreen() {
  const {
    bibles,
    books,
    chapters: apiChapters,
    currentPassage,
    loading,
    error,
    isOnline,
    fetchBibles,
    fetchBooks,
    fetchChapters,
    fetchPassage,
    searchVerses,
    clearOldCache,
    fetchBooksWithOffline,
    fetchChaptersWithOffline,
    syncOfflineProgress,
    getOfflineBooks,
  } = useBibleAPI();
  const { todayActivity, updateBibleReading } = useDailyActivity();
  const tabBarHeight = useBottomTabBarHeight();
  const { showInterstitialAd } = useInterstitialAds('bible');

  // Dimensions hook - moved inside component
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const { width, height } = dimensions;

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  // Get responsive styles based on current screen width
  const { isSmallScreen, isLargeScreen, modernStyles, styles } = getResponsiveStyles(width);

  // State Management
  const [selectedBible, setSelectedBible] = useState('de4e12af7f28f599-02'); // KJV
  const [selectedBook, setSelectedBook] = useState<APIBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'books' | 'chapters' | 'read' | 'search'>('books');

  const [selectedTestament, setSelectedTestament] = useState<'all' | 'old' | 'new'>('all');
  const [showChapterSelector, setShowChapterSelector] = useState(false);
  const [fontSize, setFontSize] = useState(18); // Default font size for verse text
  const [showOfflineIndicator, setShowOfflineIndicator] = useState(false);
  const [showOfflineManager, setShowOfflineManager] = useState(false);
  const [offlineBooks, setOfflineBooks] = useState<Set<string>>(new Set());

  // Enhanced search state
  const [searchHistory, setSearchHistory] = useState<Array<{query: string, timestamp: number, resultCount: number}>>([]);
  const [searchFilters, setSearchFilters] = useState({
    testament: 'all' as 'all' | 'old' | 'new',
    bookIds: [] as string[],
    chapterRange: { start: 1, end: 150 } as { start: number; end: number },
    sortBy: 'relevance' as 'relevance' | 'book' | 'chapter',
  });
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Reading timer refs
  const isScreenFocusedRef = useRef(false);
  const readingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartTimestampRef = useRef<number | null>(null);
  const startingMinutesRef = useRef<number>(0);
  const lastCommittedSessionMinutesRef = useRef<number>(0);

  useEffect(() => {
    // Initialize animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Initialize data with offline support
    initializeBibleData();
    
    // Check for navigation target
    checkNavigationTarget();
    
    // Start periodic cache cleanup
    const cleanupInterval = setInterval(() => {
      clearOldCache();
    }, 24 * 60 * 60 * 1000); // Clean up every 24 hours
    
    // Monitor online status for UI indicators
    const checkOnlineStatus = () => {
      setShowOfflineIndicator(!isOnline);
    };
    
    checkOnlineStatus();
    
    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);

  const initializeBibleData = async () => {
    try {
      await fetchBibles();
    } catch (error) {
      console.error('Failed to initialize Bible data:', error);
      // If offline, try to use cached data
      if (!isOnline) {
        console.log('📱 Offline mode - attempting to use cached Bible data');
      }
    }
  };

  const checkNavigationTarget = async () => {
    try {
      const navigationDataStr = await AsyncStorage.getItem('bible_navigation_target');
      if (navigationDataStr) {
        const navigationData = JSON.parse(navigationDataStr);
        // Clear the navigation target
        await AsyncStorage.removeItem('bible_navigation_target');
        
        // Navigate to the specific verse
        await handleNavigationTarget(navigationData);
      }
    } catch (error) {
      console.error('Failed to check navigation target:', error);
    }
  };

  const handleNavigationTarget = async (navigationData: any) => {
    try {
      const { bibleId, bookId, chapterNumber, verseNumber } = navigationData;
      
      // Set the bible version
      setSelectedBible(bibleId);
      
      // Find and set the book
      if (books.length > 0) {
        const targetBook = books.find(book => book.id === bookId);
        if (targetBook) {
          setSelectedBook(targetBook);
          setSelectedChapter(chapterNumber);
          
          // Fetch chapters and passage
          await fetchChapters(bibleId, bookId);
          const passageId = `${bookId}-${chapterNumber}`;
          await fetchPassage(bibleId, passageId);
          
          // Switch to read mode
          setViewMode('read');
        }
      }
    } catch (error) {
      console.error('Failed to handle navigation target:', error);
    }
  };

  useEffect(() => {
    if (bibles.length > 0) {
      const preferredBible = bibles.find(bible => bible.id === selectedBible) || bibles[0];
      if (preferredBible) {
        setSelectedBible(preferredBible.id);
        // Use offline-enhanced book fetching
        fetchBooksWithOffline(preferredBible.id);
      }
    }
  }, [bibles]);

  useEffect(() => {
    if (books.length > 0 && selectedBible) {
      const firstBook = books[0];
      if (firstBook) {
        setSelectedBook(firstBook);
        // Use offline-enhanced chapter fetching
        fetchChaptersWithOffline(selectedBible, firstBook.id);
      }
    }
  }, [books, selectedBible]);

  // Load offline books when bible changes
  useEffect(() => {
    const loadOfflineBooks = async () => {
      try {
        const offlineBooksList = await getOfflineBooks(selectedBible);
        const offlineBookIds = new Set(offlineBooksList.map(book => book.id));
        setOfflineBooks(offlineBookIds);
      } catch (error) {
        console.error('Error loading offline books:', error);
      }
    };

    if (selectedBible) {
      loadOfflineBooks();
    }
  }, [selectedBible, getOfflineBooks]);

  // Load search history on component mount
  useEffect(() => {
    const loadSearchHistory = async () => {
      try {
        const history = await AsyncStorage.getItem('bible_search_history');
        if (history) {
          setSearchHistory(JSON.parse(history));
        }
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    };

    loadSearchHistory();
  }, []);

  // Save search history when it changes
  useEffect(() => {
    const saveSearchHistory = async () => {
      try {
        await AsyncStorage.setItem('bible_search_history', JSON.stringify(searchHistory));
      } catch (error) {
        console.error('Error saving search history:', error);
      }
    };

    if (searchHistory.length > 0) {
      saveSearchHistory();
    }
  }, [searchHistory]);

  // Debug logging and online status monitoring
  useEffect(() => {
    console.log('🔍 Debug - View mode:', viewMode);
    console.log('🔍 Debug - Current passage:', !!currentPassage);
    console.log('🔍 Debug - Selected book:', !!selectedBook);
    console.log('🔍 Debug - Should show BibleReader:', viewMode === 'read' && !!currentPassage && !!selectedBook);
    console.log('🌐 Online status:', isOnline);
    
    // Update offline indicator
    setShowOfflineIndicator(!isOnline);

    // Sync offline progress when coming back online
    if (isOnline) {
      syncOfflineProgress();
    }
  }, [viewMode, currentPassage, selectedBook, isOnline, syncOfflineProgress]);

  // Filter books based on testament
  const filteredBooks = books.filter(book => {
    if (selectedTestament === 'all') return true;
    const staticBook = BIBLE_BOOKS.find(b => b.name === book.name || b.id === book.id);
    if (!staticBook) return true;
    return staticBook.testament === selectedTestament;
  });

  // Handle book selection
  const handleBookSelect = async (book: APIBook) => {
    setSelectedBook(book);
    setViewMode('chapters');
    try {
      // Use offline-enhanced chapter fetching
      await fetchChaptersWithOffline(selectedBible, book.id);
    } catch (error) {
      console.error('Failed to fetch chapters:', error);
    }
  };

  // Handle chapter selection
  const handleChapterSelect = async (chapter: APIChapter) => {
    setSelectedChapter(chapter.chapterNumber);
    setViewMode('read');
    try {
      // Use the correct format expected by the API: bookId-chapterNumber
      const passageId = `${selectedBook?.id}-${chapter.chapterNumber}`;
      await fetchPassage(selectedBible, passageId);
    } catch (error) {
      console.error('Failed to fetch passage:', error);
    }
  };


  // Handle back navigation
  const handleBack = () => {
    if (viewMode === 'read') {
      setViewMode('chapters');
    } else if (viewMode === 'chapters') {
      setViewMode('books');
    } else if (viewMode === 'search') {
      setViewMode('books');
      setSearchText('');
      setSearchResults([]);
    }
  };

  // Handle search result click - navigate to the verse
  const handleSearchResultClick = async (searchResult: any) => {
    try {
      // Find the book from the bookId
      const book = books.find(b => b.id === searchResult.bookId);
      if (!book) {
        console.error('Book not found for bookId:', searchResult.bookId);
        return;
      }

      // Set the selected book and chapter
      setSelectedBook(book);
      setSelectedChapter(searchResult.chapterNumber);

      // Fetch chapters for the book with offline support
      await fetchChaptersWithOffline(selectedBible, book.id);

      // Fetch the passage for the specific chapter
      const passageId = `${book.id}-${searchResult.chapterNumber}`;
      await fetchPassage(selectedBible, passageId);

      // Switch to read mode
      setViewMode('read');
    } catch (error) {
      console.error('Failed to navigate to search result:', error);
    }
  };

  // Enhanced search function with filters
  const handleSearch = async (query?: string) => {
    const searchQuery = query || searchText.trim();
    if (!searchQuery) return;

    setIsSearching(true);
    setViewMode('search');

    try {
      // Prepare filters for API call
      const filters = {
        bookIds: searchFilters.bookIds.length > 0 ? searchFilters.bookIds : undefined,
      };

      const results = await searchVerses(selectedBible, searchQuery, 50, filters);

      // Apply client-side filters
      let filteredResults = results;

      // Filter by testament if specified
      if (searchFilters.testament !== 'all') {
        filteredResults = filteredResults.filter(result => {
          const book = books.find(b => b.id === result.bookId);
          if (!book) return true;
          const staticBook = BIBLE_BOOKS.find(b => b.id === book.id);
          return staticBook?.testament === searchFilters.testament;
        });
      }

      // Filter by chapter range
      if (searchFilters.chapterRange) {
        filteredResults = filteredResults.filter(result =>
          result.chapterNumber >= searchFilters.chapterRange.start &&
          result.chapterNumber <= searchFilters.chapterRange.end
        );
      }

      // Sort results based on sortBy preference
      if (searchFilters.sortBy === 'book') {
        filteredResults.sort((a, b) => {
          const bookA = books.find(book => book.id === a.bookId);
          const bookB = books.find(book => book.id === b.bookId);
          return (bookA?.order || 0) - (bookB?.order || 0);
        });
      } else if (searchFilters.sortBy === 'chapter') {
        filteredResults.sort((a, b) => a.chapterNumber - b.chapterNumber);
      }
      // 'relevance' sort is handled by the API

      setSearchResults(filteredResults);

      // Add to search history
      const newHistoryEntry = {
        query: searchQuery,
        timestamp: Date.now(),
        resultCount: filteredResults.length
      };

      setSearchHistory(prev => [newHistoryEntry, ...prev.filter(h => h.query !== searchQuery).slice(0, 19)]);
    } catch (error) {
      console.error('Search failed:', error);
      Alert.alert('Search Error', 'Failed to search verses. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Generate search suggestions based on search history and popular terms
  const generateSearchSuggestions = (query: string) => {
    if (!query.trim()) {
      setSearchSuggestions([]);
      return;
    }

    const popularTerms = [
      'love', 'faith', 'hope', 'peace', 'joy', 'grace', 'mercy', 'forgiveness',
      'salvation', 'prayer', 'worship', 'praise', 'thanksgiving', 'wisdom',
      'strength', 'courage', 'healing', 'miracle', 'blessing', 'kingdom'
    ];

    const suggestions = [
      ...searchHistory
        .filter(h => h.query.toLowerCase().includes(query.toLowerCase()))
        .map(h => h.query)
        .slice(0, 3),
      ...popularTerms
        .filter(term => term.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 4)
    ].filter((value, index, self) => self.indexOf(value) === index).slice(0, 7);

    setSearchSuggestions(suggestions);
  };

  // Highlight search terms in text
  const highlightSearchTerms = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;

    const terms = searchQuery.split(' ').filter(term => term.length > 0);
    let highlightedText = text;

    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '**$1**');
    });

    return highlightedText;
  };

  // Clear search history
  const clearSearchHistory = async () => {
    setSearchHistory([]);
    try {
      await AsyncStorage.removeItem('bible_search_history');
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  };

  // Handle search suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    setSearchText(suggestion);
    setSearchSuggestions([]);
    handleSearch();
  };

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyPress = (event: any) => {
      // Only handle shortcuts when in search mode
      if (viewMode !== 'search') return;

      if (event.key === 'Escape') {
        // Escape key - clear search or go back
        if (searchText.length > 0) {
          setSearchText('');
          setSearchSuggestions([]);
          setSearchResults([]);
        } else {
          handleBack();
        }
      } else if (event.key === '/' && event.target.tagName !== 'INPUT') {
        // Forward slash - focus search input (but not when already in input)
        event.preventDefault();
        // Focus would need to be implemented with ref
      } else if (event.key === 'ArrowDown' && searchSuggestions.length > 0) {
        // Arrow down - navigate suggestions
        event.preventDefault();
        // Suggestion navigation would need additional state management
      } else if (event.key === 'ArrowUp' && searchSuggestions.length > 0) {
        // Arrow up - navigate suggestions
        event.preventDefault();
        // Suggestion navigation would need additional state management
      }
    };

    const subscription = require('react-native').Keyboard.addListener('keydown', handleKeyPress);

    return () => {
      subscription?.remove();
    };
  }, [viewMode, searchText, searchSuggestions]);

  // Export search results
  const exportSearchResults = async () => {
    if (searchResults.length === 0) return;

    try {
      const exportData = {
        searchQuery: searchText,
        searchFilters,
        results: searchResults,
        exportedAt: new Date().toISOString(),
        totalResults: searchResults.length
      };

      const jsonString = JSON.stringify(exportData, null, 2);

      // For React Native, you might want to use Share API or write to file
      if (Platform.OS === 'web') {
        // Web: Download as file
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bible-search-${searchText.replace(/\s+/g, '-').toLowerCase()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // Mobile: Share the results
        const message = `Bible Search Results for "${searchText}"\n\nFound ${searchResults.length} verses:\n\n${searchResults.slice(0, 5).map((result, index) => `${index + 1}. ${result.reference}: ${result.text.substring(0, 100)}...`).join('\n')}${searchResults.length > 5 ? `\n\n... and ${searchResults.length - 5} more results` : ''}`;

        // You would need to import and use React Native Share
        // const Share = require('react-native').Share;
        // await Share.share({ message });

        Alert.alert('Export', 'Search results exported successfully!');
      }
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('Export Error', 'Failed to export search results.');
    }
  };

  // Share search results
  const shareSearchResults = async () => {
    if (searchResults.length === 0) return;

    try {
      const shareText = `Bible Search Results for "${searchText}"\n\nFound ${searchResults.length} verses:\n\n${searchResults.slice(0, 3).map((result, index) => `${index + 1}. ${result.reference}: ${result.text}`).join('\n\n')}${searchResults.length > 3 ? `\n\n... and ${searchResults.length - 3} more results` : ''}\n\nShared via Daily Bread App`;

      // You would need to import and use React Native Share
      // const Share = require('react-native').Share;
      // await Share.share({ message: shareText });

      Alert.alert('Share', 'Search results shared successfully!');
    } catch (error) {
      console.error('Share failed:', error);
      Alert.alert('Share Error', 'Failed to share search results.');
    }
  };

  // Advanced search modal component
  const renderAdvancedSearchModal = () => (
    <Modal
      visible={showAdvancedSearch}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAdvancedSearch(false)}
    >
      <SafeAreaView style={styles.advancedSearchContainer}>
        <View style={styles.advancedSearchHeader}>
          <TouchableOpacity
            style={styles.advancedSearchBackButton}
            onPress={() => setShowAdvancedSearch(false)}
          >
            <ArrowLeft size={24} color={Colors.neutral[600]} />
          </TouchableOpacity>
          <Text style={styles.advancedSearchTitle}>Advanced Search</Text>
          <TouchableOpacity
            style={styles.advancedSearchApplyButton}
            onPress={() => {
              setShowAdvancedSearch(false);
              handleSearch();
            }}
          >
            <Text style={styles.advancedSearchApplyText}>Apply</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.advancedSearchContent} showsVerticalScrollIndicator={false}>
          {/* Search Query Section */}
          <View style={styles.advancedSearchSection}>
            <Text style={styles.advancedSearchSectionTitle}>Search Query</Text>
            <View style={styles.advancedSearchInputWrapper}>
              <Search size={20} color={Colors.neutral[400]} style={styles.advancedSearchIcon} />
              <TextInput
                style={styles.advancedSearchInput}
                placeholder="Enter search terms..."
                placeholderTextColor={Colors.neutral[400]}
                value={searchText}
                onChangeText={setSearchText}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Testament Filter */}
          <View style={styles.advancedSearchSection}>
            <Text style={styles.advancedSearchSectionTitle}>Testament</Text>
            <View style={styles.advancedSearchOptions}>
              {['all', 'old', 'new'].map((testament) => (
                <TouchableOpacity
                  key={testament}
                  style={[
                    styles.advancedSearchOption,
                    searchFilters.testament === testament && styles.advancedSearchOptionSelected
                  ]}
                  onPress={() => setSearchFilters(prev => ({ ...prev, testament: testament as 'all' | 'old' | 'new' }))}
                >
                  <Text style={[
                    styles.advancedSearchOptionText,
                    searchFilters.testament === testament && styles.advancedSearchOptionTextSelected
                  ]}>
                    {testament === 'all' ? 'All Books' :
                     testament === 'old' ? 'Old Testament' : 'New Testament'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort Options */}
          <View style={styles.advancedSearchSection}>
            <Text style={styles.advancedSearchSectionTitle}>Sort Results By</Text>
            <View style={styles.advancedSearchOptions}>
              {[
                { value: 'relevance', label: 'Relevance' },
                { value: 'book', label: 'Book Order' },
                { value: 'chapter', label: 'Chapter Order' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.advancedSearchOption,
                    searchFilters.sortBy === option.value && styles.advancedSearchOptionSelected
                  ]}
                  onPress={() => setSearchFilters(prev => ({ ...prev, sortBy: option.value as any }))}
                >
                  <Text style={[
                    styles.advancedSearchOptionText,
                    searchFilters.sortBy === option.value && styles.advancedSearchOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Chapter Range */}
          <View style={styles.advancedSearchSection}>
            <Text style={styles.advancedSearchSectionTitle}>Chapter Range</Text>
            <View style={styles.chapterRangeContainer}>
              <View style={styles.chapterRangeInput}>
                <Text style={styles.chapterRangeLabel}>From</Text>
                <TextInput
                  style={styles.chapterRangeTextInput}
                  value={searchFilters.chapterRange.start.toString()}
                  onChangeText={(text) => {
                    const value = parseInt(text) || 1;
                    setSearchFilters(prev => ({
                      ...prev,
                      chapterRange: { ...prev.chapterRange, start: Math.max(1, Math.min(value, prev.chapterRange.end)) }
                    }));
                  }}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
              <Text style={styles.chapterRangeSeparator}>to</Text>
              <View style={styles.chapterRangeInput}>
                <Text style={styles.chapterRangeLabel}>To</Text>
                <TextInput
                  style={styles.chapterRangeTextInput}
                  value={searchFilters.chapterRange.end.toString()}
                  onChangeText={(text) => {
                    const value = parseInt(text) || 150;
                    setSearchFilters(prev => ({
                      ...prev,
                      chapterRange: { ...prev.chapterRange, end: Math.max(prev.chapterRange.start, value) }
                    }));
                  }}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
            </View>
          </View>

          {/* Search History Section */}
          {searchHistory.length > 0 && (
            <View style={styles.advancedSearchSection}>
              <View style={styles.searchHistoryHeader}>
                <Text style={styles.advancedSearchSectionTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={clearSearchHistory}>
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.searchHistoryList}>
                {searchHistory.slice(0, 5).map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.searchHistoryItem}
                    onPress={() => {
                      setSearchText(item.query);
                      setShowAdvancedSearch(false);
                      handleSearch(item.query);
                    }}
                  >
                    <Clock size={16} color={Colors.neutral[400]} />
                    <View style={styles.searchHistoryContent}>
                      <Text style={styles.searchHistoryQuery}>{item.query}</Text>
                      <Text style={styles.searchHistoryResults}>
                        {item.resultCount} result{item.resultCount !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  // Enhanced navigation functions with cross-book support
  const handleNextChapter = async () => {
    if (!selectedBook || !apiChapters.length) return;

    const currentIndex = apiChapters.findIndex(ch => ch.chapterNumber === selectedChapter);

    // If there's a next chapter in current book
    if (currentIndex < apiChapters.length - 1) {
      const nextChapter = apiChapters[currentIndex + 1];
      await handleChapterSelect(nextChapter);
    } else {
      // Go to next book's first chapter
      const currentBookIndex = books.findIndex(book => book.id === selectedBook.id);
      if (currentBookIndex < books.length - 1) {
        const nextBook = books[currentBookIndex + 1];
        setSelectedBook(nextBook);
        setViewMode('read');
        try {
          await fetchChaptersWithOffline(selectedBible, nextBook.id);
          // Wait a bit for chapters to load, then select first chapter
          setTimeout(async () => {
            // Re-fetch chapters to ensure we have the latest data
            await fetchChaptersWithOffline(selectedBible, nextBook.id);
            setTimeout(async () => {
              if (apiChapters.length > 0) {
                const firstChapter = apiChapters[0];
                const passageId = `${nextBook.id}-${firstChapter.chapterNumber}`;
                setSelectedChapter(firstChapter.chapterNumber);
                await fetchPassage(selectedBible, passageId);
              }
            }, 300);
          }, 200);
        } catch (error) {
          console.error('Failed to navigate to next book:', error);
        }
      }
    }
  };

  const handlePrevChapter = async () => {
    if (!selectedBook || !apiChapters.length) return;

    const currentIndex = apiChapters.findIndex(ch => ch.chapterNumber === selectedChapter);

    // If there's a previous chapter in current book
    if (currentIndex > 0) {
      const prevChapter = apiChapters[currentIndex - 1];
      await handleChapterSelect(prevChapter);
    } else {
      // Go to previous book's last chapter
      const currentBookIndex = books.findIndex(book => book.id === selectedBook.id);
      if (currentBookIndex > 0) {
        const prevBook = books[currentBookIndex - 1];
        setSelectedBook(prevBook);
        setViewMode('read');
        try {
          await fetchChaptersWithOffline(selectedBible, prevBook.id);
          // Wait a bit for chapters to load, then select last chapter
          setTimeout(async () => {
            // Re-fetch chapters to ensure we have the latest data
            await fetchChaptersWithOffline(selectedBible, prevBook.id);
            setTimeout(async () => {
              if (apiChapters.length > 0) {
                const lastChapter = apiChapters[apiChapters.length - 1];
                const passageId = `${prevBook.id}-${lastChapter.chapterNumber}`;
                setSelectedChapter(lastChapter.chapterNumber);
                await fetchPassage(selectedBible, passageId);
              }
            }, 300);
          }, 200);
        } catch (error) {
          console.error('Failed to navigate to previous book:', error);
        }
      }
    }
  };

  // Helper function to check if we can navigate to previous chapter/book
  const canNavigatePrev = () => {
    if (!selectedBook || !apiChapters.length) return false;

    const currentChapterIndex = apiChapters.findIndex(ch => ch.chapterNumber === selectedChapter);
    const currentBookIndex = books.findIndex(book => book.id === selectedBook.id);

    // Can go prev if there's a previous chapter in current book OR a previous book
    return currentChapterIndex > 0 || currentBookIndex > 0;
  };

  // Helper function to check if we can navigate to next chapter/book
  const canNavigateNext = () => {
    if (!selectedBook || !apiChapters.length) return false;

    const currentChapterIndex = apiChapters.findIndex(ch => ch.chapterNumber === selectedChapter);
    const currentBookIndex = books.findIndex(book => book.id === selectedBook.id);

    // Can go next if there's a next chapter in current book OR a next book
    return currentChapterIndex < apiChapters.length - 1 || currentBookIndex < books.length - 1;
  };

  // Enhanced verse formatting with modern typography
  const formatVerseText = (content: string) => {
    if (!content) return '';

    // 1) Normalize common HTML verse markers to explicit tokens before stripping tags
    let normalized = content
      // sup-based verse numbers
      .replace(/<sup[^>]*?>\s*(\d{1,3})\s*<\/sup>/gi, '||VERSE:$1||')
      // potential span-based numbers
      .replace(/<span[^>]*?verse[^>]*?>\s*(\d{1,3})\s*<\/span>/gi, '||VERSE:$1||')
      // paragraph markers
      .replace(/<p[^>]*?>/gi, '\n\n')
      .replace(/<br\s*\/?\s*>/gi, '\n');

    // 2) Strip remaining HTML
    normalized = normalized.replace(/<[^>]*>/g, '');

    // 3) Handle pilcrow paragraph markers as paragraph breaks
    normalized = normalized.replace(/\u00B6/g, '\n\n'); // ¶

    // 4) Fix cases like "1In" => "1 In"
    normalized = normalized.replace(/(^|\s)(\d{1,3})(?=[A-Za-z(\[])/g, '$1$2 ');

    // 5) Collapse excessive whitespace
    normalized = normalized.replace(/[\t ]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();

    // If explicit tokens present, use them for reliable splitting
    if (normalized.includes('||VERSE:')) {
      const chunks = normalized.split('||VERSE:').filter(Boolean);
      const verses: { number: number; text: string }[] = [];
      for (const chunk of chunks) {
        const match = chunk.match(/^(\d{1,3})\|\|(.*)$/s);
        if (match) {
          const number = parseInt(match[1]);
          const text = chunk[2].replace(/\s*\n\s*/g, '\n').trim();
          if (!isNaN(number) && text) {
            verses.push({ number, text });
          }
        } else {
          // Handle edge case where token not followed by number
          const maybeNum = chunk.match(/^(\d{1,3})\s+(.*)$/s);
          if (maybeNum) {
            const number = parseInt(maybeNum[1]);
            const text = maybeNum[2].trim();
            if (!isNaN(number) && text) {
              verses.push({ number, text });
            }
          }
        }
      }
      return verses.length ? verses : normalized;
    }

    // Fallback: parse by verse-number pattern (heuristic)
    const verses: { number: number; text: string }[] = [];
    const regex = /(\b\d{1,3})\s+([^]+?)(?=(?:\b\d{1,3}\s+)|$)/g; // number + text until next number
    let m: RegExpExecArray | null;
    while ((m = regex.exec(normalized)) !== null) {
      const number = parseInt(m[1]);
      const text = m[2].trim();
      if (!isNaN(number) && text) {
        verses.push({ number, text });
      }
    }

    if (verses.length) return verses;

    // Final fallback: return readable paragraph text
    return normalized;
  };

  // Modern verse component with enhanced styling
  const renderVerse = (verse: { number: number; text: string }, index: number) => (
    <TouchableOpacity
      key={`verse-${verse.number}`}
      style={[
        modernStyles.modernVerseContainer,
        {
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 30],
              outputRange: [0, 20 + (index * 5)],
            })
          }],
          opacity: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          })
        }
      ]}
      activeOpacity={0.95}
      onPress={() => {
        // Optional: Add verse note-taking functionality
        console.log(`Verse ${verse.number} selected`);
      }}
      onLongPress={() => {
        // TODO: Add note-taking functionality here if needed
        console.log(`Long press on verse ${verse.number}`);
      }}
    >
      <View style={modernStyles.verseNumberBadge}>
        <Text style={modernStyles.verseNumberText}>{verse.number}</Text>
      </View>
      <View style={modernStyles.verseContentWrapper}>
        <Text style={[modernStyles.modernVerseText, { fontSize: fontSize }]}>
          {verse.text}
        </Text>
        <View style={modernStyles.verseDivider} />
      </View>
    </TouchableOpacity>
  );

  // Render search input component
  const renderSearchInput = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputWrapper}>
        <Search size={20} color={Colors.neutral[400]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search the Bible..."
          placeholderTextColor={Colors.neutral[400]}
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            generateSearchSuggestions(text);
          }}
          onSubmitEditing={() => handleSearch()}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Bible search input"
          accessibilityHint="Enter keywords to search for Bible verses and passages"
          accessibilityRole="searchbox"
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setSearchText('');
              setSearchSuggestions([]);
              setSearchResults([]);
            }}
          >
            <X size={16} color={Colors.neutral[400]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Search suggestions */}
      {searchSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {searchSuggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionSelect(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Search controls */}
      <View style={styles.searchControls}>
        <TouchableOpacity
          style={styles.advancedSearchButton}
          onPress={() => setShowAdvancedSearch(true)}
        >
          <Filter size={16} color={Colors.primary[600]} />
          <Text style={styles.advancedSearchText}>Filters</Text>
        </TouchableOpacity>

        {searchHistory.length > 0 && (
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => {
              // Show recent searches
              const recentSearch = searchHistory[0];
              if (recentSearch) {
                setSearchText(recentSearch.query);
                handleSearch(recentSearch.query);
              }
            }}
          >
            <Clock size={16} color={Colors.neutral[600]} />
            <Text style={styles.historyText}>Recent</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Render search result item with highlighting
  const renderSearchResultItem = ({ item }: { item: any }) => {
    const highlightedText = highlightSearchTerms(item.text, searchText);
    const parts = highlightedText.split(/(\*\*.*?\*\*)/);

    return (
      <TouchableOpacity
        style={styles.searchResultItem}
        onPress={() => handleSearchResultClick(item)}
        activeOpacity={0.7}
      >
        <View style={styles.searchResultHeader}>
          <Text style={styles.searchResultReference}>{item.reference}</Text>
          <TouchableOpacity style={styles.bookmarkButton}>
            <Heart size={16} color={Colors.neutral[300]} />
          </TouchableOpacity>
        </View>
        <View style={styles.searchResultContent}>
          <Text style={styles.searchResultText}>
            {parts.map((part, index) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                const highlighted = part.slice(2, -2);
                return (
                  <Text key={index} style={styles.highlightedText}>
                    {highlighted}
                  </Text>
                );
              }
              return part;
            })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Render header
  const renderHeader = () => {
    const getHeaderTitle = () => {
      switch (viewMode) {
        case 'books': return 'Holy Bible';
        case 'chapters': return selectedBook?.name || 'Select Book';
        case 'read': return `${selectedBook?.name || ''} ${selectedChapter}`;
        case 'search': return 'Search Results';
        default: return 'Holy Bible';
      }
    };

    const getHeaderSubtitle = () => {
      if (viewMode === 'search') return 'Find verses and passages';
      return undefined;
    };

    return (
      <View>
        <ModernHeader
          title={getHeaderTitle()}
          subtitle={getHeaderSubtitle()}
          showBackButton={viewMode === 'chapters' || viewMode === 'search'}
          onBackPress={handleBack}
          variant="default"
          showSearchButton={viewMode === 'books'}
          onSearchPress={() => setViewMode('search')}
          showOfflineButton={viewMode === 'books'}
          onOfflinePress={() => setShowOfflineManager(true)}
        />
        
        {/* Banner Ad below header */}
        {/* <BannerAd placement="bible" /> */}
        
        {/* Offline indicator */}
        {showOfflineIndicator && (
          <View style={styles.offlineIndicator}>
            <WifiOff size={16} color={Colors.warning[500]} />
            <Text style={styles.offlineText}>Offline - Using cached data</Text>
          </View>
        )}
      </View>
    );
  };


  // Render testament selector
  const renderTestamentSelector = () => {
    if (viewMode !== 'books') return null;

    return (
      <View style={styles.testamentContainer}>
        {['all', 'old', 'new'].map((testament) => (
          <TouchableOpacity
            key={testament}
            style={[
              styles.testamentButton,
              selectedTestament === testament && styles.activeTestamentButton
            ]}
            onPress={() => setSelectedTestament(testament as 'all' | 'old' | 'new')}
          >
            <Text style={[
              styles.testamentText,
              selectedTestament === testament && styles.activeTestamentText
            ]}>
              {testament === 'all' ? 'All Books' :
               testament === 'old' ? 'Old Testament' : 'New Testament'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderBookItem = ({ item: book }: { item: APIBook }) => {
    const testament = BIBLE_BOOKS.find(b => b.id === book.id)?.testament || 'new';
    const isOfflineAvailable = offlineBooks.has(book.id);

    return (
      <TouchableOpacity
        style={styles.bookItem}
        onPress={() => handleBookSelect(book)}
        activeOpacity={0.7}
      >
        <View style={styles.bookCard}>
          <View style={[
            styles.bookIcon,
            { backgroundColor: testament === 'old' ? Colors.primary[100] : Colors.secondary[100] }
          ]}>
            <Book size={24} color={testament === 'old' ? Colors.primary[600] : Colors.secondary[600]} />
          </View>
          <View style={styles.bookInfo}>
            <View style={styles.bookHeaderRow}>
              <Text style={styles.bookName}>{book.name}</Text>
              {/* Offline indicator - only show if actually downloaded */}
              {isOfflineAvailable && (
                <View style={styles.offlineIndicatorContainer}>
                  <Wifi size={14} color={Colors.success[600]} />
                  <Text style={styles.offlineIndicatorText}>Offline</Text>
                </View>
              )}
            </View>
            <Text style={styles.bookDetails}>
              {book.numberOfChapters} chapters • {testament === 'old' ? 'Old Testament' : 'New Testament'}
              {isOfflineAvailable && ' • Available offline'}
            </Text>
          </View>
          <ChevronRight size={20} color={Colors.neutral[400]} />
        </View>
      </TouchableOpacity>
    );
  };

  // Render chapter item
  const renderChapterItem = ({ item: chapter }: { item: APIChapter }) => (
    <TouchableOpacity
      style={styles.chapterItem}
      onPress={() => handleChapterSelect(chapter)}
      activeOpacity={0.7}
    >
      <View style={[
        styles.chapterCard,
        selectedChapter === chapter.chapterNumber && styles.selectedChapterCard
      ]}>
        <Text style={[
          styles.chapterNumber,
          selectedChapter === chapter.chapterNumber && styles.selectedChapterNumber
        ]}>
          {chapter.chapterNumber}
        </Text>
        {chapter.numberOfVerses > 0 && (
          <Text style={styles.chapterVerses}>
            {chapter.numberOfVerses} verses
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // Render verse content
  const renderVerseContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text style={styles.loadingText}>Loading passage...</Text>
        </View>
      );
    }

    if (!currentPassage) {
      return (
        <View style={styles.emptyContainer}>
          <BookOpen size={48} color={Colors.neutral[400]} />
          <Text style={styles.emptyTitle}>Select a Chapter</Text>
          <Text style={styles.emptySubtitle}>Choose a chapter to start reading</Text>
        </View>
      );
    }

    const verses = formatVerseText(currentPassage.content);

    return (
      <ScrollView style={styles.verseContainer} showsVerticalScrollIndicator={false}>
        {Array.isArray(verses) ? (
          <View style={styles.versesWrapper}>
            <View style={styles.chapterHeader}>
              <LinearGradient
                colors={Colors.gradients.spiritualLight || ['#fdfcfb', '#e2d1c3', '#c9d6ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.chapterHeaderGradient}
              >
                <Text style={styles.chapterTitle}>
                  {selectedBook?.name} {selectedChapter}
                </Text>
                <Text style={styles.chapterSubtitle}>
                  {verses.length} verses • {selectedBook?.name}
                </Text>
              </LinearGradient>
            </View>
            {verses.map((verse, index) => renderVerse(verse, index))}
          </View>
        ) : (
          <View style={styles.fallbackTextContainer}>
            <Text style={[modernStyles.modernFallbackText, { fontSize }]}>
              {verses}
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={Colors.gradients.spiritualLight}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {viewMode !== 'read' && renderHeader()}
        {viewMode !== 'read' && renderTestamentSelector()}

        <Animated.View style={[styles.mainContent, { transform: [{ translateY: slideAnim }] }]}>
          {viewMode === 'books' && (
            <FlatList
              data={filteredBooks}
              renderItem={renderBookItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.listContainer,
                { paddingBottom: tabBarHeight + Spacing['4xl'] }
              ]}
            />
          )}

          {viewMode === 'chapters' && (
            <FlatList
              data={apiChapters}
              renderItem={renderChapterItem}
              keyExtractor={(item) => item.id}
              numColumns={isSmallScreen ? 3 : isLargeScreen ? 5 : 4}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.chaptersGrid,
                { paddingBottom: tabBarHeight + Spacing['4xl'] }
              ]}
            />
          )}

          {viewMode === 'read' && currentPassage && selectedBook && (
            <BibleReader
              bookName={selectedBook.name || ''}
              chapterNumber={selectedChapter}
              verses={formatVerseText(currentPassage.content) as { number: number; text: string }[]}
              bibleVersion="GNBUK"
              bibleId={selectedBible}
              bookId={selectedBook.id}
              onBack={handleBack}
              onSearch={() => setViewMode('search')}
              onMenu={() => {
                // Add menu functionality here
                console.log('Menu pressed');
              }}
              onPrevChapter={handlePrevChapter}
              onNextChapter={handleNextChapter}
              canGoPrev={apiChapters.length > 0 && apiChapters.findIndex(ch => ch.chapterNumber === selectedChapter) > 0}
              canGoNext={apiChapters.length > 0 && apiChapters.findIndex(ch => ch.chapterNumber === selectedChapter) < apiChapters.length - 1}
            />
          )}

          {viewMode === 'search' && (
            <View style={styles.searchView}>
              {/* Search Input */}
              {renderSearchInput()}

              {/* Search Results */}
              {isSearching ? (
                <View style={styles.searchLoadingContainer}>
                  <ActivityIndicator size="large" color={Colors.primary[500]} />
                  <Text style={styles.searchLoadingText}>Searching...</Text>
                </View>
              ) : searchResults.length > 0 ? (
                <View style={styles.searchResultsContainer}>
                  <View style={styles.searchResultsHeader}>
                    <Text style={styles.searchResultsCount}>
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                    </Text>
                    <View style={styles.searchResultsActions}>
                      {searchResults.length > 0 && (
                        <>
                          <TouchableOpacity
                            style={styles.searchActionButton}
                            onPress={shareSearchResults}
                            accessibilityLabel="Share search results"
                            accessibilityHint="Share these search results with others"
                          >
                            <Share size={16} color={Colors.neutral[600]} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.searchActionButton}
                            onPress={exportSearchResults}
                            accessibilityLabel="Export search results"
                            accessibilityHint="Export search results as a file"
                          >
                            <BookOpen size={16} color={Colors.neutral[600]} />
                          </TouchableOpacity>
                        </>
                      )}
                      {searchHistory.length > 0 && (
                        <TouchableOpacity
                          style={styles.clearHistoryButton}
                          onPress={clearSearchHistory}
                          accessibilityLabel="Clear search history"
                          accessibilityHint="Remove all previous search queries from history"
                        >
                          <Text style={styles.clearHistoryText}>Clear History</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  <FlatList
                    data={searchResults}
                    renderItem={renderSearchResultItem}
                    keyExtractor={(item, index) => `search-${index}`}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                      styles.searchResultsList,
                      { paddingBottom: tabBarHeight + Spacing['4xl'] }
                    ]}
                  />
                </View>
              ) : searchText.length > 0 ? (
                <View style={styles.noResultsContainer}>
                  <BookOpen size={48} color={Colors.neutral[400]} />
                  <Text style={styles.noResultsTitle}>No Results Found</Text>
                  <Text style={styles.noResultsSubtitle}>
                    Try adjusting your search terms or filters
                  </Text>
                  {searchHistory.length > 0 && (
                    <TouchableOpacity
                      style={styles.tryRecentButton}
                      onPress={() => {
                        const recentSearch = searchHistory[0];
                        if (recentSearch) {
                          setSearchText(recentSearch.query);
                          handleSearch(recentSearch.query);
                        }
                      }}
                    >
                      <Text style={styles.tryRecentText}>Try Recent Search</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.searchPromptContainer}>
                  <Search size={48} color={Colors.neutral[400]} />
                  <Text style={styles.searchPromptTitle}>Search the Bible</Text>
                  <Text style={styles.searchPromptSubtitle}>
                    Enter keywords to find verses and passages
                  </Text>

                  {/* Popular searches */}
                  <View style={styles.popularSearchesContainer}>
                    <Text style={styles.popularSearchesTitle}>Popular searches:</Text>
                    <View style={styles.popularSearchesGrid}>
                      {['love', 'faith', 'hope', 'peace', 'grace', 'wisdom'].map((term, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.popularSearchItem}
                          onPress={() => handleSuggestionSelect(term)}
                        >
                          <Text style={styles.popularSearchText}>{term}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

        </Animated.View>
      </Animated.View>

      {/* Offline Manager Modal */}
      <OfflineBibleManager
        visible={showOfflineManager}
        onClose={() => setShowOfflineManager(false)}
        bibleId={selectedBible}
        books={books}
      />

      {/* Advanced Search Modal */}
      {renderAdvancedSearchModal()}
    </SafeAreaView>
  );
}

// Helper function to get responsive styles based on screen width
const getResponsiveStyles = (screenWidth: number) => {
  const isSmallScreen = screenWidth < Breakpoints.tablet;
  const isLargeScreen = screenWidth >= Breakpoints.desktop;

  return {
    isSmallScreen,
    isLargeScreen,
    modernStyles: StyleSheet.create({
      modernVerseContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Spacing.lg,
        padding: Spacing.md,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
        ...Shadows.sm,
      },
      verseNumberBadge: {
        width: 32,
        height: 32,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.primary[100],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.sm,
      },
      verseNumberText: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.bold,
        color: Colors.primary[600],
      },
      verseContentWrapper: {
        flex: 1,
      },
      modernVerseText: {
        fontSize: isSmallScreen ? 16 : 18,
        lineHeight: isSmallScreen ? 22 : 24,
        color: Colors.neutral[800],
        marginBottom: Spacing.sm,
      },
      verseDivider: {
        height: 1,
        backgroundColor: Colors.neutral[100],
        marginTop: Spacing.sm,
      },
      modernFallbackText: {
        fontSize: isSmallScreen ? 16 : 18,
        lineHeight: isSmallScreen ? 22 : 24,
        color: Colors.neutral[800],
        padding: Spacing.md,
      },
    }),
    styles: StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: Colors.neutral[50],
      },
      content: {
        flex: 1,
      },
      hero: {
        paddingBottom: isSmallScreen ? Spacing.xl : Spacing.lg,
        minHeight: isSmallScreen ? 120 : 100,
      },
      heroGradient: {
        paddingHorizontal: isSmallScreen ? Spacing.md : Spacing.lg,
        paddingVertical: isSmallScreen ? Spacing.lg : Spacing.lg,
        marginHorizontal: isSmallScreen ? Spacing.md : Spacing.lg,
        borderRadius: BorderRadius.xl,
        minHeight: isSmallScreen ? 80 : 70,
      },
      heroContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: isSmallScreen ? 60 : 50,
      },
      heroTextBlock: {
        flex: 1,
        justifyContent: 'center',
      },
      heroTitle: {
        fontSize: isSmallScreen ? Typography.sizes['2xl'] : Typography.sizes['3xl'],
        fontWeight: Typography.weights.bold,
        color: Colors.neutral[900],
      },
      heroSubtitle: {
        fontSize: isSmallScreen ? Typography.sizes.lg : Typography.sizes.xl,
        color: Colors.neutral[900],
        lineHeight: Typography.lineHeights.normal,
        marginTop: isSmallScreen ? Spacing.xs : 0,
        fontWeight: Typography.weights.semiBold,
        opacity: 1,
        textShadowColor: 'rgba(255, 255, 255, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
      heroActionButton: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
      },
      mainContent: {
        flex: 1,
        paddingHorizontal: Spacing.lg,
      },
      testamentContainer: {
        flexDirection: 'row',
        marginBottom: Spacing.lg,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xs,
        ...Shadows.sm,
      },
      testamentButton: {
        flex: 1,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
      },
      activeTestamentButton: {
        backgroundColor: Colors.primary[50],
      },
      testamentText: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
        color: Colors.neutral[600],
      },
      activeTestamentText: {
        color: Colors.primary[600],
        fontWeight: Typography.weights.semiBold,
      },
      listContainer: {
        paddingTop: Spacing.md,
      },
      bookItem: {
        marginBottom: Spacing.sm,
      },
      bookCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        ...Shadows.sm,
      },
      bookIcon: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
      },
      bookInfo: {
        flex: 1,
      },
      bookName: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semiBold,
        color: Colors.neutral[900],
        marginBottom: Spacing.xs,
      },
      bookDetails: {
        fontSize: Typography.sizes.sm,
        color: Colors.neutral[600],
      },
      bookHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.xs,
      },
      offlineIndicatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.success[100],
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
      },
      offlineIndicatorText: {
        fontSize: Typography.sizes.xs,
        color: Colors.success[700],
        fontWeight: Typography.weights.medium,
        marginLeft: 2,
      },
      chaptersGrid: {
        paddingTop: Spacing.md,
      },
      chapterItem: {
        flex: 1,
        margin: Spacing.xs,
        width: isSmallScreen ? '33.33%' : isLargeScreen ? '20%' : '25%',
        paddingHorizontal: Spacing.sm,
        paddingVertical: isSmallScreen ? Spacing.sm : Spacing.xs
      },
      
      chapterCard: {
        backgroundColor: Colors.white,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        ...Shadows.sm,
        minHeight: 80,
        justifyContent: 'center',
      },
      selectedChapterCard: {
        backgroundColor: Colors.primary[50],
        borderWidth: 2,
        borderColor: Colors.primary[200],
      },
      chapterNumber: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.bold,
        color: Colors.neutral[900],
        marginBottom: Spacing.xs,
      },
      selectedChapterNumber: {
        color: Colors.primary[600],
      },
      chapterVerses: {
        fontSize: Typography.sizes.xs,
        color: Colors.neutral[500],
        textAlign: 'center',
      },
      verseContainer: {
        flex: 1,
        paddingHorizontal: Spacing.md,
      },
      versesWrapper: {
        paddingBottom: Spacing.xl,
         paddingHorizontal: isSmallScreen ? Spacing.md : Spacing.lg,
        paddingVertical: Spacing.md,
      },
      chapterHeader: {
        marginBottom: Spacing.lg,
      },
      chapterHeaderGradient: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
      },
      chapterTitle: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.bold,
        color: Colors.neutral[900],
        marginBottom: Spacing.xs,
      },
      chapterSubtitle: {
        fontSize: Typography.sizes.sm,
        color: Colors.neutral[600],
      },
      fallbackTextContainer: {
        padding: Spacing.lg,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.lg,
        ...Shadows.sm,
      },
      loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing['4xl'],
      },
      loadingText: {
        fontSize: Typography.sizes.lg,
        color: Colors.neutral[600],
        marginTop: Spacing.md,
      },
      emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing['4xl'],
      },
      emptyTitle: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.semiBold,
        color: Colors.neutral[700],
        marginTop: Spacing.md,
        marginBottom: Spacing.sm,
      },
      emptySubtitle: {
        fontSize: Typography.sizes.base,
        color: Colors.neutral[500],
        textAlign: 'center',
      },
      offlineIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.warning[100],
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        marginHorizontal: Spacing.lg,
        borderRadius: BorderRadius.md,
        marginTop: Spacing.xs,
      },
      offlineText: {
        fontSize: Typography.sizes.sm,
        color: Colors.warning[700],
        fontWeight: Typography.weights.medium,
        marginLeft: Spacing.xs,
      },
      // Enhanced search styles
      searchView: {
        flex: 1,
      },
      searchContainer: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        margin: Spacing.lg,
        padding: Spacing.md,
        ...Shadows.sm,
      },
      searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.neutral[50],
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.md,
      },
      searchIcon: {
        marginRight: Spacing.sm,
      },
      searchInput: {
        flex: 1,
        paddingVertical: Spacing.md,
        fontSize: Typography.sizes.base,
        color: Colors.neutral[800],
      },
      clearButton: {
        padding: Spacing.xs,
        marginLeft: Spacing.sm,
      },
      suggestionsContainer: {
        backgroundColor: Colors.neutral[50],
        borderRadius: BorderRadius.md,
        marginTop: Spacing.sm,
      },
      suggestionItem: {
        padding: Spacing.md,
      },
      suggestionText: {
        fontSize: Typography.sizes.base,
        color: Colors.neutral[700],
      },
      searchControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.md,
      },
      advancedSearchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.primary[50],
        borderRadius: BorderRadius.md,
      },
      advancedSearchText: {
        fontSize: Typography.sizes.sm,
        color: Colors.primary[600],
        marginLeft: Spacing.xs,
        fontWeight: Typography.weights.medium,
      },
      historyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.neutral[100],
        borderRadius: BorderRadius.md,
      },
      historyText: {
        fontSize: Typography.sizes.sm,
        color: Colors.neutral[600],
        marginLeft: Spacing.xs,
        fontWeight: Typography.weights.medium,
      },
      searchLoadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing['4xl'],
      },
      searchLoadingText: {
        fontSize: Typography.sizes.lg,
        color: Colors.neutral[600],
        marginTop: Spacing.md,
      },
      searchResultsContainer: {
        flex: 1,
      },
      searchResultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.neutral[50],
      },
      searchResultsActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
      },
      searchActionButton: {
        padding: Spacing.sm,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
        ...Shadows.sm,
      },
      searchResultsCount: {
        fontSize: Typography.sizes.sm,
        color: Colors.neutral[600],
        fontWeight: Typography.weights.medium,
      },
      clearHistoryButton: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
      },
      clearHistoryText: {
        fontSize: Typography.sizes.xs,
        color: Colors.neutral[500],
      },
      searchResultsList: {
        padding: Spacing.lg,
      },
      searchResultItem: {
        backgroundColor: Colors.white,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.sm,
        ...Shadows.sm,
      },
      searchResultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
      },
      searchResultReference: {
        fontSize: Typography.sizes.sm,
        color: Colors.primary[600],
        fontWeight: Typography.weights.semiBold,
      },
      bookmarkButton: {
        padding: Spacing.xs,
      },
      searchResultContent: {
        flex: 1,
      },
      searchResultText: {
        fontSize: Typography.sizes.base,
        lineHeight: Typography.lineHeights.relaxed,
        color: Colors.neutral[800],
      },
      highlightedText: {
        backgroundColor: Colors.warning[100],
        fontWeight: Typography.weights.semiBold,
        color: Colors.warning[800],
      },
      noResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing['4xl'],
        paddingHorizontal: Spacing.lg,
      },
      noResultsTitle: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.semiBold,
        color: Colors.neutral[700],
        marginTop: Spacing.md,
        marginBottom: Spacing.sm,
      },
      noResultsSubtitle: {
        fontSize: Typography.sizes.base,
        color: Colors.neutral[500],
        textAlign: 'center',
        marginBottom: Spacing.lg,
      },
      tryRecentButton: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.primary[500],
        borderRadius: BorderRadius.md,
      },
      tryRecentText: {
        fontSize: Typography.sizes.base,
        color: Colors.white,
        fontWeight: Typography.weights.medium,
      },
      searchPromptContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing['4xl'],
        paddingHorizontal: Spacing.lg,
      },
      searchPromptTitle: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.semiBold,
        color: Colors.neutral[700],
        marginTop: Spacing.md,
        marginBottom: Spacing.sm,
      },
      searchPromptSubtitle: {
        fontSize: Typography.sizes.base,
        color: Colors.neutral[500],
        textAlign: 'center',
        marginBottom: Spacing.xl,
      },
      popularSearchesContainer: {
        alignItems: 'center',
      },
      popularSearchesTitle: {
        fontSize: Typography.sizes.sm,
        color: Colors.neutral[600],
        marginBottom: Spacing.md,
        fontWeight: Typography.weights.medium,
      },
      popularSearchesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: Spacing.sm,
      },
      popularSearchItem: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.neutral[100],
        borderRadius: BorderRadius.md,
      },
      popularSearchText: {
        fontSize: Typography.sizes.sm,
        color: Colors.neutral[700],
        fontWeight: Typography.weights.medium,
      },
      // Advanced Search Modal Styles
      advancedSearchContainer: {
        flex: 1,
        backgroundColor: Colors.neutral[50],
      },
      advancedSearchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.neutral[200],
      },
      advancedSearchBackButton: {
        padding: Spacing.sm,
      },
      advancedSearchTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semiBold,
        color: Colors.neutral[900],
      },
      advancedSearchApplyButton: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.primary[500],
        borderRadius: BorderRadius.md,
      },
      advancedSearchApplyText: {
        fontSize: Typography.sizes.base,
        color: Colors.white,
        fontWeight: Typography.weights.medium,
      },
      advancedSearchContent: {
        flex: 1,
        padding: Spacing.lg,
      },
      advancedSearchSection: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        ...Shadows.sm,
      },
      advancedSearchSectionTitle: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semiBold,
        color: Colors.neutral[900],
        marginBottom: Spacing.md,
      },
      advancedSearchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.neutral[50],
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
      },
      advancedSearchIcon: {
        marginRight: Spacing.sm,
      },
      advancedSearchInput: {
        flex: 1,
        paddingVertical: Spacing.md,
        fontSize: Typography.sizes.base,
        color: Colors.neutral[800],
      },
      advancedSearchOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
      },
      advancedSearchOption: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.neutral[100],
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.neutral[200],
      },
      advancedSearchOptionSelected: {
        backgroundColor: Colors.primary[50],
        borderColor: Colors.primary[200],
      },
      advancedSearchOptionText: {
        fontSize: Typography.sizes.sm,
        color: Colors.neutral[700],
        fontWeight: Typography.weights.medium,
      },
      advancedSearchOptionTextSelected: {
        color: Colors.primary[600],
      },
      chapterRangeContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: Spacing.md,
      },
      chapterRangeInput: {
        flex: 1,
      },
      chapterRangeLabel: {
        fontSize: Typography.sizes.xs,
        color: Colors.neutral[600],
        marginBottom: Spacing.xs,
        fontWeight: Typography.weights.medium,
      },
      chapterRangeTextInput: {
        backgroundColor: Colors.neutral[50],
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        fontSize: Typography.sizes.base,
        color: Colors.neutral[800],
        textAlign: 'center',
      },
      chapterRangeSeparator: {
        fontSize: Typography.sizes.base,
        color: Colors.neutral[500],
        marginBottom: Spacing.lg,
      },
      searchHistoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
      },
      clearAllText: {
        fontSize: Typography.sizes.sm,
        color: Colors.warning[600],
        fontWeight: Typography.weights.medium,
      },
      searchHistoryList: {
        gap: Spacing.sm,
      },
      searchHistoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: Colors.neutral[50],
        borderRadius: BorderRadius.md,
      },
      searchHistoryContent: {
        flex: 1,
        marginLeft: Spacing.md,
      },
      searchHistoryQuery: {
        fontSize: Typography.sizes.base,
        color: Colors.neutral[800],
        fontWeight: Typography.weights.medium,
      },
      searchHistoryResults: {
        fontSize: Typography.sizes.sm,
        color: Colors.neutral[500],
        marginTop: 2,
      },
    })
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bookName: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.medium,
        color: Colors.neutral[900],
      },
      bookDetails: {
        fontSize: Typography.sizes.sm,
        color: Colors.neutral[500],
      },
      chapterCard: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.neutral[50],
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
      },
      selectedChapterCard: {
        backgroundColor: Colors.primary[100],
      },
      chapterNumber: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.medium,
        color: Colors.neutral[700],
      },
      selectedChapterNumber: {
        color: Colors.primary[900],
      },
      chapterVerses: {
        fontSize: Typography.sizes.sm,
        color: Colors.neutral[500],
      },
      loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.xl,
      },
      loadingText: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.medium,
        color: Colors.neutral[500],
        marginTop: Spacing.md,
      },
      emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.xl,
      },
      emptyTitle: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.bold,
        color: Colors.neutral[700],
        marginTop: Spacing.md,
      },
      emptySubtitle: {
        fontSize: Typography.sizes.base,
        color: Colors.neutral[500],
        marginTop: Spacing.sm,
        textAlign: 'center',
        paddingHorizontal: Spacing.xl,
      },
      verseContainer: {
        flex: 1,
      },
      chapterHeader: {
        marginBottom: Spacing.md,
      },
      chapterHeaderGradient: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
      },
      chapterTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
        color: Colors.neutral[900],
      },
      chapterSubtitle: {
        fontSize: Typography.sizes.sm,
        color: Colors.neutral[500],
      },
      mainContent: {
        flex: 1,
      },
      listContainer: {
        padding: Spacing.md,
      },
      chaptersGrid: {
        padding: Spacing.md,
      },
      fallbackTextContainer: {
        padding: Spacing.lg,
      },
      // Offline indicator styles - moved to responsive styles above
    });
