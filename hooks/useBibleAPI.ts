import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Local storage keys
const STORAGE_KEYS = {
  CACHED_PASSAGES: 'bible_cached_passages',
  BOOKMARKS: 'bible_bookmarks',
  READING_PROGRESS: 'bible_reading_progress',
  RECENT_CHAPTERS: 'bible_recent_chapters',
  OFFLINE_BOOKS: 'bible_offline_books', // Store books for offline access
  OFFLINE_CHAPTERS: 'bible_offline_chapters', // Store chapters for offline access
};

// Simple cache to prevent excessive storage reads
const storageCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5000; // 5 seconds cache

// Request debouncing to prevent duplicate API calls
const pendingRequests = new Map<string, Promise<any>>();
const requestDebounceTime = 2000; // 2 seconds debounce

// Request queuing system to batch API calls
const requestQueue: Array<{ endpoint: string; resolve: Function; reject: Function }> = [];
let isProcessingQueue = false;
const QUEUE_BATCH_SIZE = 10; // Process up to 10 requests at once (increased from 5)
const QUEUE_DELAY = 100; // 100ms delay between batches (reduced from 500ms)

// Local storage helper functions using AsyncStorage
const getFromStorage = async (key: string) => {
  try {
    // Check cache first (silent - no logging for performance)
    const cached = storageCache.get(key);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return cached.data;
    }

    const item = await AsyncStorage.getItem(key);
    const result = item ? JSON.parse(item) : null;

    // Cache the result
    storageCache.set(key, { data: result, timestamp: Date.now() });

    return result;
  } catch (error) {
    console.error('❌ Error reading from storage:', error);
    return null;
  }
};

const setToStorage = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    // Update cache with new data
    storageCache.set(key, { data: value, timestamp: Date.now() });
  } catch (error) {
    console.error('Error writing to storage:', error);
  }
};

const API_BASE_URL = 'https://api.scripture.api.bible/v1';
const API_KEY = '1f8f911243f0c1333ccb4ffffea4efb8';

// Fallback Bible data when API is unavailable
const FALLBACK_BIBLES = [
  {
    id: 'de4e12af7f28f599-02',
    name: 'King James Version',
    englishName: 'King James Version',
    shortName: 'KJV',
    language: 'en',
    languageName: 'English',
    textDirection: 'ltr' as const,
    availableFormats: ['json'] as const,
    numberOfBooks: 66,
    totalNumberOfChapters: 1189,
    totalNumberOfVerses: 31102
  }
];

const FALLBACK_BOOKS = [
  { id: 'GEN', name: 'Genesis', order: 1, numberOfChapters: 50, testament: 'old' },
  { id: 'EXO', name: 'Exodus', order: 2, numberOfChapters: 40, testament: 'old' },
  { id: 'LEV', name: 'Leviticus', order: 3, numberOfChapters: 27, testament: 'old' },
  { id: 'NUM', name: 'Numbers', order: 4, numberOfChapters: 36, testament: 'old' },
  { id: 'DEU', name: 'Deuteronomy', order: 5, numberOfChapters: 34, testament: 'old' },
  { id: 'JOS', name: 'Joshua', order: 6, numberOfChapters: 24, testament: 'old' },
  { id: 'JDG', name: 'Judges', order: 7, numberOfChapters: 21, testament: 'old' },
  { id: 'RUT', name: 'Ruth', order: 8, numberOfChapters: 4, testament: 'old' },
  { id: '1SA', name: '1 Samuel', order: 9, numberOfChapters: 31, testament: 'old' },
  { id: '2SA', name: '2 Samuel', order: 10, numberOfChapters: 24, testament: 'old' },
  { id: '1KI', name: '1 Kings', order: 11, numberOfChapters: 22, testament: 'old' },
  { id: '2KI', name: '2 Kings', order: 12, numberOfChapters: 25, testament: 'old' },
  { id: '1CH', name: '1 Chronicles', order: 13, numberOfChapters: 29, testament: 'old' },
  { id: '2CH', name: '2 Chronicles', order: 14, numberOfChapters: 36, testament: 'old' },
  { id: 'EZR', name: 'Ezra', order: 15, numberOfChapters: 10, testament: 'old' },
  { id: 'NEH', name: 'Nehemiah', order: 16, numberOfChapters: 13, testament: 'old' },
  { id: 'EST', name: 'Esther', order: 17, numberOfChapters: 10, testament: 'old' },
  { id: 'JOB', name: 'Job', order: 18, numberOfChapters: 42, testament: 'old' },
  { id: 'PSA', name: 'Psalms', order: 19, numberOfChapters: 150, testament: 'old' },
  { id: 'PRO', name: 'Proverbs', order: 20, numberOfChapters: 31, testament: 'old' },
  { id: 'ECC', name: 'Ecclesiastes', order: 21, numberOfChapters: 12, testament: 'old' },
  { id: 'SNG', name: 'Song of Songs', order: 22, numberOfChapters: 8, testament: 'old' },
  { id: 'ISA', name: 'Isaiah', order: 23, numberOfChapters: 66, testament: 'old' },
  { id: 'JER', name: 'Jeremiah', order: 24, numberOfChapters: 52, testament: 'old' },
  { id: 'LAM', name: 'Lamentations', order: 25, numberOfChapters: 5, testament: 'old' },
  { id: 'EZK', name: 'Ezekiel', order: 26, numberOfChapters: 48, testament: 'old' },
  { id: 'DAN', name: 'Daniel', order: 27, numberOfChapters: 12, testament: 'old' },
  { id: 'HOS', name: 'Hosea', order: 28, numberOfChapters: 14, testament: 'old' },
  { id: 'JOL', name: 'Joel', order: 29, numberOfChapters: 3, testament: 'old' },
  { id: 'AMO', name: 'Amos', order: 30, numberOfChapters: 9, testament: 'old' },
  { id: 'OBA', name: 'Obadiah', order: 31, numberOfChapters: 1, testament: 'old' },
  { id: 'JON', name: 'Jonah', order: 32, numberOfChapters: 4, testament: 'old' },
  { id: 'MIC', name: 'Micah', order: 33, numberOfChapters: 7, testament: 'old' },
  { id: 'NAH', name: 'Nahum', order: 34, numberOfChapters: 3, testament: 'old' },
  { id: 'HAB', name: 'Habakkuk', order: 35, numberOfChapters: 3, testament: 'old' },
  { id: 'ZEP', name: 'Zephaniah', order: 36, numberOfChapters: 3, testament: 'old' },
  { id: 'HAG', name: 'Haggai', order: 37, numberOfChapters: 2, testament: 'old' },
  { id: 'ZEC', name: 'Zechariah', order: 38, numberOfChapters: 14, testament: 'old' },
  { id: 'MAL', name: 'Malachi', order: 39, numberOfChapters: 4, testament: 'old' },
  { id: 'MAT', name: 'Matthew', order: 40, numberOfChapters: 28, testament: 'new' },
  { id: 'MRK', name: 'Mark', order: 41, numberOfChapters: 16, testament: 'new' },
  { id: 'LUK', name: 'Luke', order: 42, numberOfChapters: 24, testament: 'new' },
  { id: 'JHN', name: 'John', order: 43, numberOfChapters: 21, testament: 'new' },
  { id: 'ACT', name: 'Acts', order: 44, numberOfChapters: 28, testament: 'new' },
  { id: 'ROM', name: 'Romans', order: 45, numberOfChapters: 16, testament: 'new' },
  { id: '1CO', name: '1 Corinthians', order: 46, numberOfChapters: 16, testament: 'new' },
  { id: '2CO', name: '2 Corinthians', order: 47, numberOfChapters: 13, testament: 'new' },
  { id: 'GAL', name: 'Galatians', order: 48, numberOfChapters: 6, testament: 'new' },
  { id: 'EPH', name: 'Ephesians', order: 49, numberOfChapters: 6, testament: 'new' },
  { id: 'PHP', name: 'Philippians', order: 50, numberOfChapters: 4, testament: 'new' },
  { id: 'COL', name: 'Colossians', order: 51, numberOfChapters: 4, testament: 'new' },
  { id: '1TH', name: '1 Thessalonians', order: 52, numberOfChapters: 5, testament: 'new' },
  { id: '2TH', name: '2 Thessalonians', order: 53, numberOfChapters: 3, testament: 'new' },
  { id: '1TI', name: '1 Timothy', order: 54, numberOfChapters: 6, testament: 'new' },
  { id: '2TI', name: '2 Timothy', order: 55, numberOfChapters: 4, testament: 'new' },
  { id: 'TIT', name: 'Titus', order: 56, numberOfChapters: 3, testament: 'new' },
  { id: 'PHM', name: 'Philemon', order: 57, numberOfChapters: 1, testament: 'new' },
  { id: 'HEB', name: 'Hebrews', order: 58, numberOfChapters: 13, testament: 'new' },
  { id: 'JAS', name: 'James', order: 59, numberOfChapters: 5, testament: 'new' },
  { id: '1PE', name: '1 Peter', order: 60, numberOfChapters: 5, testament: 'new' },
  { id: '2PE', name: '2 Peter', order: 61, numberOfChapters: 3, testament: 'new' },
  { id: '1JN', name: '1 John', order: 62, numberOfChapters: 5, testament: 'new' },
  { id: '2JN', name: '2 John', order: 63, numberOfChapters: 1, testament: 'new' },
  { id: '3JN', name: '3 John', order: 64, numberOfChapters: 1, testament: 'new' },
  { id: 'JUD', name: 'Jude', order: 65, numberOfChapters: 1, testament: 'new' },
  { id: 'REV', name: 'Revelation', order: 66, numberOfChapters: 22, testament: 'new' }
];

// Rate limiting configuration - Optimized for better performance while respecting API limits
const RATE_LIMIT = {
  requestsPerMinute: 50, // Increased from 20 to 50
  requestsPerHour: 500, // Increased from 200 to 500
  cooldownMs: 500, // Reduced from 3 seconds to 500ms for faster loading
};

// API timeout configuration
const API_TIMEOUT = 15000; // 15 seconds timeout

interface Bible {
  id: string;
  name: string;
  englishName: string;
  shortName: string;
  website: string;
  licenseUrl: string;
  language: string;
  languageName: string;
  languageEnglishName: string;
  textDirection: 'ltr' | 'rtl';
  availableFormats: ('json' | 'usfm')[];
  numberOfBooks: number;
  totalNumberOfChapters: number;
  totalNumberOfVerses: number;
  numberOfApocryphalBooks?: number;
  totalNumberOfApocryphalChapters?: number;
  totalNumberOfApocryphalVerses?: number;
}

interface Book {
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

interface Verse {
  id: string;
  orgId: string;
  bibleId: string;
  bookId: string;
  chapterId: string;
  verse: string;
  text: string;
}

interface Passage {
  id: string;
  translationId: string;
  bookId: string;
  chapterNumber: number;
  content: string;
  reference: string;
  verseCount: number;
}

interface SearchResult {
  id: string;
  translationId: string;
  bookId: string;
  chapterNumber: number;
  verseNumber: number;
  text: string;
  reference: string;
}

interface APIError {
  code: string;
  message: string;
  details?: string;
}

export function useBibleAPI() {
  const [bibles, setBibles] = useState<Bible[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<APIChapter[]>([]);
  const [currentPassage, setCurrentPassage] = useState<Passage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [processingBookId, setProcessingBookId] = useState<string | null>(null);
  const [processingPassageId, setProcessingPassageId] = useState<string | null>(null);
  const [processingBibleId, setProcessingBibleId] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState({
    remaining: RATE_LIMIT.requestsPerMinute,
    resetTime: Date.now() + 60000,
  });

  // New state for enhanced features
  const [bookmarks, setBookmarks] = useState<Array<{
    id: string;
    reference: string;
    content: string;
    timestamp: number;
    bibleId: string;
  }>>([]);
  const [readingProgress, setReadingProgress] = useState<{
    [bookId: string]: {
      lastChapter: number;
      lastVerse: number;
      timestamp: number;
    };
  }>({});
  const [cachedPassages, setCachedPassages] = useState<{
    [passageId: string]: {
      content: string;
      timestamp: number;
      bibleId: string;
      bookId: string;
      chapterNumber: number;
      reference: string;
    };
  }>({});
  const [recentChapters, setRecentChapters] = useState<Array<{
    bookId: string;
    chapterNumber: number;
    bookName: string;
    timestamp: number;
    bibleId: string;
  }>>([]);

  // Optimize data loading from storage - load only essential data initially
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        // Load essential data first
        const [storedBookmarks, storedProgress, storedCache, storedRecent] = await Promise.all([
          getFromStorage(STORAGE_KEYS.BOOKMARKS),
          getFromStorage(STORAGE_KEYS.READING_PROGRESS),
          getFromStorage(STORAGE_KEYS.CACHED_PASSAGES),
          getFromStorage(STORAGE_KEYS.RECENT_CHAPTERS)
        ]);

        if (storedBookmarks) setBookmarks(storedBookmarks);
        if (storedProgress) setReadingProgress(storedProgress);
        if (storedCache) setCachedPassages(storedCache);
        if (storedRecent) setRecentChapters(storedRecent);

        // Load offline data separately to prevent blocking
        setTimeout(async () => {
          try {
            const [storedOfflineBooks, storedOfflineChapters] = await Promise.all([
              getFromStorage(STORAGE_KEYS.OFFLINE_BOOKS),
              getFromStorage(STORAGE_KEYS.OFFLINE_CHAPTERS)
            ]);

            if (__DEV__) {
              console.log('📖 Loaded offline data:', {
                passages: Object.keys(storedCache || {}).length,
                books: (storedOfflineBooks || []).length,
                chapters: (storedOfflineChapters || []).length
              });
            }
          } catch (error) {
            console.error('Error loading offline data:', error);
          }
        }, 100);

      } catch (error) {
        console.error('Error loading stored data:', error);
      }
    };

    loadStoredData();
  }, []);

  // Optimize data saving to storage - debounce to prevent excessive writes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setToStorage(STORAGE_KEYS.BOOKMARKS, bookmarks);
    }, 1000); // Increased debounce time
    return () => clearTimeout(timeoutId);
  }, [bookmarks]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setToStorage(STORAGE_KEYS.READING_PROGRESS, readingProgress);
    }, 1000); // Increased debounce time
    return () => clearTimeout(timeoutId);
  }, [readingProgress]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setToStorage(STORAGE_KEYS.CACHED_PASSAGES, cachedPassages);
    }, 2000); // Longer delay for cached passages as they're larger
    return () => clearTimeout(timeoutId);
  }, [cachedPassages]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setToStorage(STORAGE_KEYS.RECENT_CHAPTERS, recentChapters);
    }, 1000); // Increased debounce time
    return () => clearTimeout(timeoutId);
  }, [recentChapters]);


  // Define clearOldCache function before using it
  const clearOldCache = async () => {
    try {
      const now = Date.now();
      const thirtyDaysAgo = 30 * 24 * 60 * 60 * 1000; // 30 days for passages
      const ninetyDaysAgo = 90 * 24 * 60 * 60 * 1000; // 90 days for books/chapters

      // Clean up old cached passages
      const newCachedPassages = Object.fromEntries(
        Object.entries(cachedPassages).filter(([_, passage]) =>
          (now - passage.timestamp) < thirtyDaysAgo
        )
      );

      if (Object.keys(newCachedPassages).length !== Object.keys(cachedPassages).length) {
        setCachedPassages(newCachedPassages);
        console.log(`🧹 Cleaned up ${Object.keys(cachedPassages).length - Object.keys(newCachedPassages).length} old cached passages`);
      }

      // Clean up old recent chapters (keep only last 50)
      if (recentChapters.length > 50) {
        const sortedChapters = recentChapters
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 50);
        setRecentChapters(sortedChapters);
        console.log(`🧹 Cleaned up ${recentChapters.length - 50} old recent chapters`);
      }

      // Clear old offline books and chapters
      try {
        const offlineBooks = await getFromStorage(STORAGE_KEYS.OFFLINE_BOOKS) || [];
        const filteredBooks = offlineBooks.filter((book: any) =>
          (now - book.savedAt) < ninetyDaysAgo
        );
        await setToStorage(STORAGE_KEYS.OFFLINE_BOOKS, filteredBooks);

        const offlineChapters = await getFromStorage(STORAGE_KEYS.OFFLINE_CHAPTERS) || [];
        const filteredChapters = offlineChapters.filter((chapter: any) =>
          (now - chapter.savedAt) < ninetyDaysAgo
        );
        await setToStorage(STORAGE_KEYS.OFFLINE_CHAPTERS, filteredChapters);

        console.log('🧹 Cache cleanup completed:', {
          passages: Object.keys(newCachedPassages).length,
          books: filteredBooks.length,
          chapters: filteredChapters.length
        });
      } catch (error) {
        console.error('Error during offline cache cleanup:', error);
      }

    } catch (error) {
      console.error('Error clearing old cache:', error);
    }
  };

  // Optimize cache cleanup - run less frequently and with better memory management
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      try {
        clearOldCache();
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      } catch (error) {
        console.error('Error during cache cleanup:', error);
      }
    }, 6 * 60 * 60 * 1000); // Clean up every 6 hours instead of 24

    return () => clearInterval(cleanupInterval);
  }, [clearOldCache]);

  // Monitor chapters state changes - minimal logging for production
  useEffect(() => {
    // Only log in development mode
    if (__DEV__ && chapters.length > 0) {
      console.log('Chapters loaded:', chapters.length);
    }
  }, [chapters]);

  // Check online status
  useEffect(() => {
    const checkOnlineStatus = async () => {
      const netInfo = await NetInfo.fetch();
      setIsOnline(netInfo.isConnected || false);
    };

    checkOnlineStatus();
    const unsubscribe = NetInfo.addEventListener((netInfo: any) => {
      setIsOnline(netInfo.isConnected || false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Rate limiting helper
  const checkRateLimit = (): boolean => {
    const now = Date.now();
    if (now > rateLimitInfo.resetTime) {
      setRateLimitInfo({
        remaining: RATE_LIMIT.requestsPerMinute,
        resetTime: now + 60000,
      });
      return true;
    }

    if (rateLimitInfo.remaining <= 0) {
      return false;
    }

    setRateLimitInfo(prev => ({
      ...prev,
      remaining: prev.remaining - 1,
    }));

    return true;
  };

  // Queue processing function
  const processQueue = async () => {
    if (isProcessingQueue || requestQueue.length === 0) return;

    isProcessingQueue = true;
    console.log(`🔄 Processing queue with ${requestQueue.length} requests`);

    while (requestQueue.length > 0) {
      const batch = requestQueue.splice(0, QUEUE_BATCH_SIZE);
      console.log(`📦 Processing batch of ${batch.length} requests`);

      // Process batch in parallel
      const promises = batch.map(async ({ endpoint, resolve, reject }) => {
        try {
          const result = await makeDirectAPIRequest(endpoint);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      await Promise.allSettled(promises);

      // Add delay between batches
      if (requestQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, QUEUE_DELAY));
      }
    }

    isProcessingQueue = false;
  };

  // Direct API request without queuing (used by queue processor)
  const makeDirectAPIRequest = async (endpoint: string) => {
    console.log(`🌐 Making direct API request to: ${API_BASE_URL}${endpoint}`);

    // Check rate limiting
    if (!checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please wait before making another request.');
    }

    // Check online status
    if (!isOnline) {
      throw new Error('You are currently offline. Please check your internet connection.');
    }

    // Add delay to respect rate limiting
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT.cooldownMs));

    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ API request timed out, aborting...');
      controller.abort();
    }, API_TIMEOUT);

    try {
      console.log(`🌐 Making API request to: ${API_BASE_URL}${endpoint}`);
      console.log(`🔑 Using API key: ${API_KEY.substring(0, 8)}...`);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`📡 API Response status: ${response.status}`);

      if (!response.ok) {
        const errorDataResponse = await response.json().catch(() => ({}));
        const apiError = {
          status: response.status,
          statusText: response.statusText,
          ...errorDataResponse,
        };
        throw apiError;
      }

      const data = await response.json();
      return data;
    } catch (fetchError) {
      clearTimeout(timeoutId);

      // Handle timeout specifically
      if (fetchError.name === 'AbortError') {
        throw new Error(`Request timed out after ${API_TIMEOUT / 1000} seconds. Please check your internet connection and try again.`);
      }

      throw fetchError;
    }
  };

  // Enhanced error handling
  const handleAPIError = (error: any, context: string): APIError => {
    console.error(`API Error in ${context}:`, error);

    if (error.status === 429) {
      return {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Rate limit exceeded. Please wait a moment before trying again.',
        details: 'You\'ve made too many requests. Please slow down.'
      };
    }

    if (error.status === 401) {
      return {
        code: 'UNAUTHORIZED',
        message: 'Bible service is temporarily unavailable.',
        details: 'The Bible API is currently experiencing authentication issues. Please try again later.'
      };
    }

    if (error.status === 403) {
      return {
        code: 'FORBIDDEN',
        message: 'Access denied. Check your API permissions.',
        details: 'Your API key may not have access to this resource.'
      };
    }

    if (error.status >= 500) {
      return {
        code: 'SERVER_ERROR',
        message: 'Bible API service is temporarily unavailable.',
        details: 'Please try again later.'
      };
    }

    if (!isOnline) {
      return {
        code: 'OFFLINE',
        message: 'You\'re currently offline.',
        details: 'Please check your internet connection and try again.'
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred.',
      details: error.message || 'Please try again later.'
    };
  };

  const makeAPIRequest = async (endpoint: string) => {
    // Check for pending request with same endpoint (debouncing)
    const requestKey = endpoint;
    if (pendingRequests.has(requestKey)) {
      console.log(`🔄 Request already pending for ${endpoint}, returning existing promise`);
      return await pendingRequests.get(requestKey);
    }

    // Create the request promise using queue system
    const requestPromise = new Promise((resolve, reject) => {
      // Add to queue
      requestQueue.push({ endpoint, resolve, reject });
      console.log(`📝 Added request to queue: ${endpoint} (queue size: ${requestQueue.length})`);

      // Start processing queue if not already processing
      if (!isProcessingQueue) {
        processQueue();
      }
    });

    // Store the promise in pending requests
    pendingRequests.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } catch (error) {
      const apiError = handleAPIError(error, endpoint);
      setError(apiError.message);
      throw apiError;
    } finally {
      // Remove from pending requests when done
      pendingRequests.delete(requestKey);
    }
  };

  const fetchBibles = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching bibles from API...');
      const data = await makeAPIRequest('/bibles');
      console.log('✅ Bibles fetched successfully:', data.data?.length || 0, 'bibles');
      setBibles(data.data || []);
    } catch (error) {
      const apiError = error as APIError;
      console.error('❌ Error fetching bibles:', apiError);

      // Use fallback data when API fails
      if (apiError.code === 'UNAUTHORIZED' || apiError.code === 'SERVER_ERROR') {
        console.log('📚 Using fallback Bible data due to API error');
        setBibles(FALLBACK_BIBLES);
        setError(null); // Clear error since we have fallback data
      } else {
        setError(apiError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async (bibleId: string) => {
    // Prevent duplicate calls for the same Bible
    if (processingBibleId === bibleId) {
      console.log('🔄 Already processing books for Bible:', bibleId, 'skipping duplicate call');
      return;
    }

    try {
      setProcessingBibleId(bibleId);
      setLoading(true);
      setError(null);
      console.log('📚 Fetching books for Bible:', bibleId);

      // First, set books from static data immediately for instant UI response
      const { BIBLE_BOOKS } = require('@/constants/BibleBooks');
      const staticBooks = createStaticBookList(bibleId);
      setBooks(staticBooks);
      console.log(`📚 Set ${staticBooks.length} static books immediately`);

      // Then try to enhance with API data in the background
      try {
        const data = await makeAPIRequest(`/bibles/${bibleId}/books`);
        console.log('📊 API Response for books:', data);

        if (data.data && Array.isArray(data.data)) {
          // Normalize and exclude apocryphal books when explicitly marked
          const apiBooks: Book[] = (data.data as Book[])
            .filter((book: Book) => book.isApocryphal !== true);

          console.log(`📖 Fetched ${apiBooks.length} non-apocryphal books from API`);

          const apiBooksById = new Map<string, Book>();
          for (const b of apiBooks) {
            apiBooksById.set(b.id, b);
          }

          // Build enhanced list with API data where available
          const enhancedBooks: Book[] = staticBooks.map((staticBook: Book) => {
            const apiBook = apiBooksById.get(staticBook.id);
            if (apiBook) {
              return {
                ...staticBook,
                ...apiBook,
                translationId: bibleId,
                // Use API data for enhanced fields
                numberOfChapters: apiBook.numberOfChapters || staticBook.numberOfChapters,
                totalNumberOfVerses: apiBook.totalNumberOfVerses || 0,
                firstChapterApiLink: apiBook.firstChapterApiLink || '',
                lastChapterApiLink: apiBook.lastChapterApiLink || '',
              } as Book;
            }
            return staticBook;
          });

          console.log(`✅ Enhanced ${enhancedBooks.length} books with API data`);
          setBooks(enhancedBooks);
        }
      } catch (apiError) {
        console.log('⚠️ API enhancement failed, using static data:', apiError);
        // Static data is already set, so we continue with that
      }
    } catch (error) {
      const apiError = error as APIError;
      console.error('❌ Error fetching books:', apiError);

      // Use fallback data when API fails
      if (apiError.code === 'UNAUTHORIZED' || apiError.code === 'SERVER_ERROR') {
        console.log('📚 Using fallback books data due to API error');
        setBooks(FALLBACK_BOOKS);
        setError(null); // Clear error since we have fallback data
      } else {
        setError(apiError.message);
        // Fallback to static book list if API fails
        console.log('📚 Using fallback static book list');
        const fallbackBooks = createStaticBookList(bibleId);
        setBooks(fallbackBooks);
      }
    } finally {
      setLoading(false);
      setProcessingBibleId(null);
    }
  };

  // Helper function to create a static book list as fallback
  const createStaticBookList = (bibleId: string): Book[] => {
    // Import the static book list from constants
    const { BIBLE_BOOKS } = require('@/constants/BibleBooks');

    // Use the order from the static data instead of index
    return BIBLE_BOOKS.map((book: any) => ({
      id: book.id,
      translationId: bibleId,
      name: book.name,
      commonName: book.name,
      title: book.name,
      order: book.order,
      numberOfChapters: book.chapters,
      firstChapterApiLink: '',
      lastChapterApiLink: '',
      totalNumberOfVerses: 0,
      isApocryphal: false
    }));
  };

  const fetchChapters = async (bibleId: string, bookId: string) => {
    // Prevent duplicate calls for the same book
    if (processingBookId === bookId) {
      console.log('🔄 Already processing chapters for book:', bookId, 'skipping duplicate call');
      return;
    }

    try {
      console.log('🔍 fetchChapters called with:', { bibleId, bookId });
      setProcessingBookId(bookId);
      setLoading(true);
      setError(null);

      // First, create static chapter list immediately for instant UI response
      const { BIBLE_BOOKS } = require('@/constants/BibleBooks');
      const staticBook = BIBLE_BOOKS.find((b: any) => b.id === bookId);

      if (staticBook) {
        const staticChapters: APIChapter[] = [];
        for (let i = 1; i <= staticBook.chapters; i++) {
          staticChapters.push({
            id: `${bookId}-${i}`,
            translationId: bibleId,
            bookId: bookId,
            chapterNumber: i,
            numberOfVerses: 0,
            verses: []
          });
        }
        setChapters(staticChapters);
        console.log(`📚 Set ${staticChapters.length} static chapters immediately`);
      }

      // Then try to enhance with API data in the background
      try {
        const chaptersData = await makeAPIRequest(`/bibles/${bibleId}/books/${bookId}/chapters`);
        if (chaptersData.data && chaptersData.data.length > 0) {
          console.log('📚 API chapters found:', chaptersData.data.length);

          // Map API chapters to ensure they have the correct structure
          const mappedChapters: APIChapter[] = chaptersData.data.map((chapter: any, index: number) => {
            // Extract chapter number from various possible sources
            let chapterNumber = chapter.chapterNumber;

            // If chapterNumber is not available, try to extract it from the id or other fields
            if (!chapterNumber || isNaN(chapterNumber)) {
              // Try to extract from id (e.g., "GEN.1" -> 1)
              if (chapter.id && typeof chapter.id === 'string') {
                const match = chapter.id.match(/\.(\d+)$/);
                if (match) {
                  chapterNumber = parseInt(match[1]);
                }
              }

              // If still no chapter number, use the index + 1 as fallback
              if (!chapterNumber || isNaN(chapterNumber)) {
                chapterNumber = index + 1;
                console.warn('⚠️ Using index as fallback for chapter number:', { index, chapterNumber, chapterId: chapter.id });
              }
            }

            return {
              id: chapter.id || `${bookId}-${chapterNumber}`,
              translationId: bibleId,
              bookId: bookId,
              chapterNumber: chapterNumber,
              numberOfVerses: chapter.numberOfVerses || 0,
              verses: chapter.verses || []
            };
          });

          // Validate that all chapters have valid chapter numbers
          const validChapters = mappedChapters.filter(chapter =>
            chapter.chapterNumber && typeof chapter.chapterNumber === 'number' && !isNaN(chapter.chapterNumber)
          );

          // Remove duplicate chapters by chapter number
          const uniqueChapters = validChapters.filter((chapter, index, self) =>
            index === self.findIndex(c => c.chapterNumber === chapter.chapterNumber)
          );

          if (uniqueChapters.length > 0) {
            console.log('📚 Enhanced chapters with API data:', uniqueChapters.length);
            setChapters(uniqueChapters);
            return;
          }
        }
      } catch (apiError) {
        console.log('⚠️ API chapters not available, using static data:', apiError);
        // Static data is already set, so we continue with that
      }

    } catch (error) {
      const apiError = error as APIError;
      setError(apiError.message);
      console.error('Error fetching chapters:', apiError);
    } finally {
      setLoading(false);
      setProcessingBookId(null);
    }
  };

  // New function to create static chapters from BibleBooks data
  const createStaticChapters = (bookId: string, bibleId: string) => {
    try {
      // Import BibleBooks dynamically to avoid circular dependencies
      const { BIBLE_BOOKS } = require('../constants/BibleBooks');
      const staticBook = BIBLE_BOOKS.find((b: any) => b.id === bookId);

      if (!staticBook) {
        console.error('❌ Static book not found:', bookId);
        return;
      }

      console.log('📖 Creating static chapters for', staticBook.name, 'with', staticBook.chapters, 'chapters');

      const chapterList: APIChapter[] = [];
      for (let i = 1; i <= staticBook.chapters; i++) {
        chapterList.push({
          id: `${bookId}-${i}`,
          translationId: bibleId,
          bookId: bookId,
          chapterNumber: i,
          numberOfVerses: 0,
          verses: []
        });
      }

      console.log('📚 Created', chapterList.length, 'static chapter objects');
      console.log('📚 First few static chapters:', chapterList.slice(0, 3));

      setChapters(chapterList);
    } catch (error) {
      console.error('Error creating static chapters:', error);
    }
  };

  // Helper function to fetch passage from API silently (for background refresh)
  const fetchPassageFromAPI = async (bibleId: string, passageId: string, bookId: string, chapterNum: number, cacheKey: string) => {
    try {
      const data = await makeAPIRequest(`/bibles/${bibleId}/passages/${bookId}.${chapterNum}`);
      const passage: Passage = {
        id: passageId,
        translationId: bibleId,
        bookId: bookId,
        chapterNumber: chapterNum,
        content: data.data?.content || '',
        reference: data.data?.reference || `${bookId} ${chapterNum}`,
        verseCount: data.data?.verseCount || 0
      };
      setCurrentPassage(passage);

      // Update cache
      setCachedPassages(prev => ({
        ...prev,
        [cacheKey]: {
          content: passage.content,
          timestamp: Date.now(),
          bibleId: bibleId,
          bookId: bookId,
          chapterNumber: chapterNum,
          reference: passage.reference
        }
      }));
    } catch (error) {
      // Silently fail for background refresh - we already have cached data
      if (__DEV__) {
        console.log('Background refresh failed:', error);
      }
    }
  };

  const fetchPassage = async (bibleId: string, passageId: string) => {
    // Prevent multiple simultaneous requests for the same passage
    const requestKey = `${bibleId}-${passageId}`;
    if (processingPassageId === requestKey) {
      return;
    }

    // Parse passageId to get book, chapter info FIRST
    const [bookId, chapterNumber] = passageId.split('-');
    if (!bookId || !chapterNumber) {
      setError('Invalid passage ID format');
      return;
    }

    // Validate chapter number
    const chapterNum = parseInt(chapterNumber);
    if (isNaN(chapterNum) || chapterNum <= 0) {
      setError(`Invalid chapter number: ${chapterNumber}`);
      return;
    }

    // Check cache FIRST - before setting loading state for instant display
    const cacheKey = `${bibleId}-${passageId}`;
    const cachedPassage = cachedPassages[cacheKey];
    const now = Date.now();
    const cacheExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days

    if (cachedPassage && (now - cachedPassage.timestamp) < cacheExpiry) {
      // Immediately set passage from cache - NO loading state shown
      const passage: Passage = {
        id: passageId,
        translationId: bibleId,
        bookId: bookId,
        chapterNumber: chapterNum,
        content: cachedPassage.content,
        reference: cachedPassage.reference || `${bookId} ${chapterNum}`,
        verseCount: 0
      };
      setCurrentPassage(passage);
      setError(null);

      // Update reading progress
      updateReadingProgress(bookId, chapterNum, 1);
      addToRecentChapters(bookId, chapterNum, bookId, bibleId);

      // If offline or cache is fresh (< 1 day), we're done
      if (!isOnline || (now - cachedPassage.timestamp) < 24 * 60 * 60 * 1000) {
        return;
      }

      // If online and cache is > 1 day old, refresh in background silently (no loading state)
      setProcessingPassageId(requestKey);
      fetchPassageFromAPI(bibleId, passageId, bookId, chapterNum, cacheKey).finally(() => {
        setProcessingPassageId(null);
      });
      return;
    }

    // No cache available - show loading state and fetch
    try {
      setProcessingPassageId(requestKey);
      setLoading(true);
      setError(null);

      // Check offline storage for fallback content
      try {
        const offlineContent = await getFromStorage(`${STORAGE_KEYS.OFFLINE_CHAPTERS}-${passageId}`);
        if (offlineContent && offlineContent.content) {
          console.log('📱 Using offline content for:', passageId);
          const passage: Passage = {
            id: passageId,
            translationId: bibleId,
            bookId: bookId,
            chapterNumber: chapterNum,
            content: offlineContent.content,
            reference: offlineContent.reference || `${bookId} ${chapterNum}`,
            verseCount: offlineContent.verseCount || 0
          };
          setCurrentPassage(passage);
          setLoading(false);

          // Update reading progress
          updateReadingProgress(bookId, chapterNum, 1);

          // Add to recent chapters
          addToRecentChapters(bookId, chapterNum, bookId, bibleId);

          // If offline, we're done
          if (!isOnline) {
            console.log('📱 Offline mode - using offline content');
            return;
          }

          // If online, continue to fetch fresh data in background
          console.log('🌐 Online - using offline content, fetching fresh data in background');
        }
      } catch (error) {
        // No offline content available, continue to API
      }

      // If online, fetch from API (or if no cached data available)
      if (isOnline) {
        try {
          console.log('🌐 Making API request for:', `${bookId}.${chapterNum}`);
          const data = await makeAPIRequest(`/bibles/${bibleId}/passages/${bookId}.${chapterNum}`);

          // Transform the data to match our Passage interface
          const passage: Passage = {
            id: passageId,
            translationId: bibleId,
            bookId: bookId,
            chapterNumber: chapterNum,
            content: data.data?.content || '',
            reference: data.data?.reference || `${bookId} ${chapterNum}`,
            verseCount: data.data?.verseCount || 0
          };

          setCurrentPassage(passage);

          // Cache the passage with enhanced metadata
          const newCache = {
            ...cachedPassages,
            [cacheKey]: {
              content: passage.content,
              timestamp: now,
              bibleId: bibleId,
              bookId: bookId,
              chapterNumber: chapterNum,
              reference: passage.reference
            }
          };
          setCachedPassages(newCache);

        } catch (apiError) {
          // If API fails but we have cached data, use it
          if (cachedPassage) {
            console.log('⚠️ API failed, falling back to cached data');
            const passage: Passage = {
              id: passageId,
              translationId: bibleId,
              bookId: bookId,
              chapterNumber: chapterNum,
              content: cachedPassage.content,
              reference: cachedPassage.reference || `${bookId} ${chapterNum}`,
              verseCount: 0
            };
            setCurrentPassage(passage);
          } else {
            throw apiError; // Re-throw if no cached data available
          }
        }
      } else {
        // Offline mode - if no cached data, show error
        if (!cachedPassage) {
          throw new Error('You are offline and no cached data is available for this passage.');
        }
      }

      // Update reading progress
      updateReadingProgress(bookId, chapterNum, 1);

      // Add to recent chapters
      addToRecentChapters(bookId, chapterNum, bookId, bibleId);

    } catch (error) {
      const apiError = error as APIError;
      setError(apiError.message);
      console.error('Error fetching passage:', apiError);
    } finally {
      setLoading(false);
      setProcessingPassageId(null);
    }
  };

  // Helper function to update reading progress
  const updateReadingProgress = (bookId: string, chapter: number, verse: number) => {
    setReadingProgress(prev => ({
      ...prev,
      [bookId]: {
        lastChapter: chapter,
        lastVerse: verse,
        timestamp: Date.now()
      }
    }));
  };

  // Helper function to add to recent chapters
  const addToRecentChapters = (bookId: string, chapterNumber: number, bookName: string, bibleId: string) => {
    const newRecent = [
      {
        bookId,
        chapterNumber,
        bookName,
        timestamp: Date.now(),
        bibleId
      },
      ...recentChapters.filter(rc =>
        !(rc.bookId === bookId && rc.chapterNumber === chapterNumber)
      )
    ].slice(0, 10); // Keep only last 10 chapters

    setRecentChapters(newRecent);
  };

  // Bookmark management functions
  const addBookmark = (reference: string, content: string, bibleId: string) => {
    const newBookmark = {
      id: `${reference}-${Date.now()}`,
      reference,
      content: content.substring(0, 200) + (content.length > 200 ? '...' : ''), // Truncate long content
      timestamp: Date.now(),
      bibleId
    };

    setBookmarks(prev => [newBookmark, ...prev]);
    return newBookmark;
  };

  const removeBookmark = (bookmarkId: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
  };

  const isBookmarked = (reference: string) => {
    return bookmarks.some(b => b.reference === reference);
  };

  const toggleBookmark = (reference: string, content: string, bibleId: string) => {
    if (isBookmarked(reference)) {
      removeBookmark(bookmarks.find(b => b.reference === reference)?.id || '');
    } else {
      addBookmark(reference, content, bibleId);
    }
  };


  // Get reading progress for a specific book
  const getReadingProgress = (bookId: string) => {
    return readingProgress[bookId] || null;
  };

  // Get overall reading progress across all books
  const getOverallReadingProgress = () => {
    const bookIds = Object.keys(readingProgress);
    if (bookIds.length === 0) {
      return {
        completedChapters: 0,
        totalChapters: 0,
        percentage: 0
      };
    }

    let totalCompletedChapters = 0;
    let totalChapters = 0;

    // Calculate total chapters from all books (using static Bible data)
    const { BIBLE_BOOKS } = require('../constants/BibleBooks');

    bookIds.forEach(bookId => {
      const book = BIBLE_BOOKS.find((b: any) => b.id === bookId);
      if (book) {
        totalChapters += book.chapters;
        const progress = readingProgress[bookId];
        if (progress) {
          totalCompletedChapters += progress.lastChapter;
        }
      }
    });

    return {
      completedChapters: totalCompletedChapters,
      totalChapters: totalChapters,
      percentage: totalChapters > 0 ? Math.round((totalCompletedChapters / totalChapters) * 100) : 0
    };
  };

  // Get recent chapters for quick access
  const getRecentChapters = () => {
    return recentChapters.sort((a, b) => b.timestamp - a.timestamp);
  };

  // Enhanced cache management functions
  const saveBookForOffline = async (book: Book, bibleId: string) => {
    try {
      const offlineBooks = await getFromStorage(STORAGE_KEYS.OFFLINE_BOOKS) || [];
      const existingIndex = offlineBooks.findIndex((b: any) => b.id === book.id && b.bibleId === bibleId);

      if (existingIndex === -1) {
        const bookWithMetadata = {
          ...book,
          bibleId,
          savedAt: Date.now()
        };
        offlineBooks.push(bookWithMetadata);
        await setToStorage(STORAGE_KEYS.OFFLINE_BOOKS, offlineBooks);
        console.log('💾 Book saved for offline access:', book.name);
      }
    } catch (error) {
      console.error('Error saving book for offline:', error);
    }
  };

  const saveChapterForOffline = async (chapter: APIChapter, bibleId: string, bookId: string) => {
    try {
      const offlineChapters = await getFromStorage(STORAGE_KEYS.OFFLINE_CHAPTERS) || [];
      const existingIndex = offlineChapters.findIndex((c: any) =>
        c.id === chapter.id && c.bibleId === bibleId
      );

      if (existingIndex === -1) {
        const chapterWithMetadata = {
          ...chapter,
          bibleId,
          bookId,
          savedAt: Date.now()
        };
        offlineChapters.push(chapterWithMetadata);
        await setToStorage(STORAGE_KEYS.OFFLINE_CHAPTERS, offlineChapters);
        console.log('💾 Chapter saved for offline access:', `${bookId} ${chapter.chapterNumber}`);
      }
    } catch (error) {
      console.error('Error saving chapter for offline:', error);
    }
  };

  const getOfflineBooks = useCallback(async (bibleId: string): Promise<Book[]> => {
    try {
      const offlineBooks = await getFromStorage(STORAGE_KEYS.OFFLINE_BOOKS) || [];
      return offlineBooks.filter((book: any) => book.bibleId === bibleId);
    } catch (error) {
      console.error('Error getting offline books:', error);
      return [];
    }
  }, []);

  const getOfflineChapters = useCallback(async (bibleId: string, bookId: string): Promise<APIChapter[]> => {
    try {
      const offlineChapters = await getFromStorage(STORAGE_KEYS.OFFLINE_CHAPTERS) || [];
      return offlineChapters.filter((chapter: any) =>
        chapter.bibleId === bibleId && chapter.bookId === bookId
      );
    } catch (error) {
      console.error('Error getting offline chapters:', error);
      return [];
    }
  }, []);


  // New function: Bulk download entire book for offline access
  const downloadBookForOffline = async (book: Book, bibleId: string, onProgress?: (progress: number) => void) => {
    try {
      console.log('📥 Starting bulk download for book:', book.name);

      // First ensure we have the book metadata saved
      await saveBookForOffline(book, bibleId);

      // Get all chapters for this book
      const chaptersData = await makeAPIRequest(`/bibles/${bibleId}/books/${book.id}/chapters`);
      const chapters = chaptersData.data || [];

      let downloadedCount = 0;
      const totalChapters = chapters.length;

      // Download each chapter
      for (const chapter of chapters) {
        try {
          const passageId = `${book.id}-${chapter.chapterNumber}`;
          await fetchPassage(bibleId, passageId);

          // Save chapter metadata for offline access
          await saveChapterForOffline(chapter, bibleId, book.id);

          downloadedCount++;
          if (onProgress) {
            onProgress((downloadedCount / totalChapters) * 100);
          }

          // Small delay to respect rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.warn(`⚠️ Failed to download chapter ${chapter.chapterNumber}:`, error);
        }
      }

      console.log(`✅ Bulk download completed for ${book.name}: ${downloadedCount}/${totalChapters} chapters`);
      return { success: true, downloadedChapters: downloadedCount, totalChapters };
    } catch (error) {
      console.error('❌ Error during bulk download:', error);
      return { success: false, downloadedChapters: 0, totalChapters: 0 };
    }
  };

  // New function: Get offline reading statistics
  const getOfflineStats = async () => {
    try {
      const offlineBooks = await getFromStorage(STORAGE_KEYS.OFFLINE_BOOKS) || [];
      const offlineChapters = await getFromStorage(STORAGE_KEYS.OFFLINE_CHAPTERS) || [];

      // Count unique books and chapters
      const uniqueBooks = new Set(offlineBooks.map((book: any) => book.id)).size;
      const uniqueChapters = new Set(offlineChapters.map((chapter: any) => `${chapter.bookId}-${chapter.chapterNumber}`)).size;

      // Calculate storage size estimate
      const booksSize = JSON.stringify(offlineBooks).length;
      const chaptersSize = JSON.stringify(offlineChapters).length;
      const passagesSize = JSON.stringify(cachedPassages).length;
      const totalSize = booksSize + chaptersSize + passagesSize;

      return {
        booksCount: uniqueBooks,
        chaptersCount: uniqueChapters,
        passagesCount: Object.keys(cachedPassages).length,
        estimatedSize: totalSize,
        books: offlineBooks,
        chapters: offlineChapters
      };
    } catch (error) {
      console.error('Error getting offline stats:', error);
      return {
        booksCount: 0,
        chaptersCount: 0,
        passagesCount: 0,
        estimatedSize: 0,
        books: [],
        chapters: []
      };
    }
  };

  // New function: Remove book from offline storage
  const removeBookFromOffline = async (bookId: string, bibleId: string) => {
    try {
      const offlineBooks = await getFromStorage(STORAGE_KEYS.OFFLINE_BOOKS) || [];
      const filteredBooks = offlineBooks.filter((book: any) =>
        !(book.id === bookId && book.bibleId === bibleId)
      );
      await setToStorage(STORAGE_KEYS.OFFLINE_BOOKS, filteredBooks);

      // Also remove all chapters for this book
      const offlineChapters = await getFromStorage(STORAGE_KEYS.OFFLINE_CHAPTERS) || [];
      const filteredChapters = offlineChapters.filter((chapter: any) =>
        !(chapter.bookId === bookId && chapter.bibleId === bibleId)
      );
      await setToStorage(STORAGE_KEYS.OFFLINE_CHAPTERS, filteredChapters);

      // Remove cached passages for this book
      const newCache = Object.fromEntries(
        Object.entries(cachedPassages).filter(([key, _]) => {
          const [cachedBibleId, passageId] = key.split('-');
          const [cachedBookId] = passageId.split('-');
          return !(cachedBookId === bookId && cachedBibleId === bibleId);
        })
      );
      setCachedPassages(newCache);

      console.log('🗑️ Removed book from offline storage:', bookId);
      return true;
    } catch (error) {
      console.error('Error removing book from offline:', error);
      return false;
    }
  };

  // New function: Check if book is available offline
  const isBookAvailableOffline = async (bookId: string, bibleId: string): Promise<boolean> => {
    try {
      const offlineBooks = await getFromStorage(STORAGE_KEYS.OFFLINE_BOOKS) || [];
      return offlineBooks.some((book: any) => book.id === bookId && book.bibleId === bibleId);
    } catch (error) {
      console.error('Error checking offline availability:', error);
      return false;
    }
  };

  // New function: Sync reading progress when back online
  const syncOfflineProgress = async () => {
    if (!isOnline) return;

    try {
      console.log('🔄 Syncing offline reading progress...');

      // Here you could implement syncing with a remote server if needed
      // For now, we'll just ensure local storage is up to date

      const now = Date.now();
      const updatedProgress = Object.fromEntries(
        Object.entries(readingProgress).map(([bookId, progress]) => [
          bookId,
          { ...progress, lastSynced: now }
        ])
      );
      setReadingProgress(updatedProgress);

      console.log('✅ Offline progress synced');
    } catch (error) {
      console.error('Error syncing offline progress:', error);
    }
  };

  // Enhanced fetchBooks with offline support
  const fetchBooksWithOffline = useCallback(async (bibleId: string) => {
    // Prevent duplicate calls for the same Bible
    if (processingBibleId === bibleId) {
      console.log('🔄 [USEBIBLEAPI] Already processing books for Bible:', bibleId, 'skipping duplicate call');
      return;
    }

    try {
      setProcessingBibleId(bibleId);
      console.log('🔄 [USEBIBLEAPI] fetchBooksWithOffline called for Bible ID:', bibleId, 'Stack trace:', new Error().stack);
      setLoading(true);
      setError(null);

      // Check if we have offline books first
      if (!isOnline) {
        console.log('📱 Offline mode - using offline books');
        const offlineBooks = await getOfflineBooks(bibleId);
        if (offlineBooks.length > 0) {
          console.log('📚 Using offline books:', offlineBooks.length);
          setBooks(offlineBooks);
          return;
        }
      }

      // Proceed with normal API call
      console.log('🌐 Online mode - fetching books from API');
      await fetchBooks(bibleId);
      console.log('✅ Books fetched successfully');

      // Save books for offline access if online
      if (isOnline) {
        setTimeout(async () => {
          const currentBooks = books;
          console.log('💾 Saving books for offline access:', currentBooks.length);
          for (const book of currentBooks) {
            await saveBookForOffline(book, bibleId);
          }
        }, 1000);
      }

    } catch (error) {
      const apiError = error as APIError;
      setError(apiError.message);
      console.error('❌ Error fetching books with offline support:', apiError);
    } finally {
      setLoading(false);
      setProcessingBibleId(null);
    }
  }, [isOnline, processingBibleId, getOfflineBooks, fetchBooks, saveBookForOffline]);

  // Enhanced fetchChapters with offline support
  const fetchChaptersWithOffline = useCallback(async (bibleId: string, bookId: string) => {
    try {
      // Check if we have offline chapters first
      if (!isOnline) {
        console.log('📱 Offline mode - using offline chapters');
        const offlineChapters = await getOfflineChapters(bibleId, bookId);
        if (offlineChapters.length > 0) {
          setChapters(offlineChapters);
          return;
        }
      }

      // Proceed with normal API call
      await fetchChapters(bibleId, bookId);

      // Save chapters for offline access if online
      if (isOnline) {
        setTimeout(async () => {
          const currentChapters = chapters;
          for (const chapter of currentChapters) {
            await saveChapterForOffline(chapter, bibleId, bookId);
          }
        }, 1000);
      }

    } catch (error) {
      const apiError = error as APIError;
      setError(apiError.message);
      console.error('Error fetching chapters with offline support:', apiError);
    }
  }, [isOnline, getOfflineChapters, fetchChapters, chapters, saveChapterForOffline]);

  const searchVerses = async (bibleId: string, query: string, limit: number = 20, filters?: {
    bookIds?: string[];
    chapterRange?: { start: number; end: number };
    verseRange?: { start: number; end: number };
  }): Promise<SearchResult[]> => {
    try {
      setLoading(true);
      setError(null);

      // Build search query with filters
      let searchEndpoint = `/bibles/${bibleId}/search?query=${encodeURIComponent(query)}&limit=${limit}`;

      if (filters?.bookIds && filters.bookIds.length > 0) {
        searchEndpoint += `&bookIds=${filters.bookIds.join(',')}`;
      }

      // Use API.Bible search endpoint
      const searchData = await makeAPIRequest(searchEndpoint);
      const results: SearchResult[] = [];

      if (searchData.data && searchData.data.verses) {
        for (const verse of searchData.data.verses) {
          // Apply additional filters if specified
          if (filters?.chapterRange) {
            const chapterNum = parseInt(verse.reference.split(' ')[1].split(':')[0]);
            if (chapterNum < filters.chapterRange.start || chapterNum > filters.chapterRange.end) {
              continue;
            }
          }

          if (filters?.verseRange) {
            const verseNum = parseInt(verse.reference.split(' ')[1].split(':')[1]);
            if (verseNum < filters.verseRange.start || verseNum > filters.verseRange.end) {
              continue;
            }
          }

          results.push({
            id: verse.id,
            translationId: bibleId,
            bookId: verse.reference.split(' ')[0],
            chapterNumber: parseInt(verse.reference.split(' ')[1].split(':')[0]),
            verseNumber: parseInt(verse.reference.split(' ')[1].split(':')[1]),
            text: verse.text,
            reference: verse.reference
          });
        }
      }

      return results;
    } catch (error) {
      const apiError = error as APIError;
      setError(apiError.message);
      console.error('Error searching verses:', apiError);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchVerse = async (bibleId: string, verseId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Parse verseId to get book, chapter, verse info
      const [bookId, chapterNumber, verseNumber] = verseId.split('-');
      if (!bookId || !chapterNumber || !verseNumber) {
        throw new Error('Invalid verse ID format');
      }

      const data = await makeAPIRequest(`/bibles/${bibleId}/verses/${bookId}.${chapterNumber}.${verseNumber}`);

      if (!data.data) {
        throw new Error('Verse not found');
      }

      return {
        id: verseId,
        translationId: bibleId,
        bookId: bookId,
        chapterNumber: parseInt(chapterNumber),
        verseNumber: parseInt(verseNumber),
        text: data.data.text
      };
    } catch (error) {
      const apiError = error as APIError;
      setError(apiError.message);
      console.error('Error fetching verse:', apiError);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchVerseOfTheDay = async (): Promise<{ reference: string, text: string }> => {
    try {
      // Get today's date to ensure verse changes daily
      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));

      console.log('📅 Verse of the day calculation:', {
        today: today.toISOString().split('T')[0],
        dayOfYear,
        year: today.getFullYear()
      });

      // Fallback verses for each book if API fails
      const fallbackVerses = [
        { reference: 'Genesis 1:1', text: 'In the beginning God created the heavens and the earth.' },
        { reference: 'Psalm 23:1', text: 'The Lord is my shepherd, I shall not want.' },
        { reference: 'Matthew 5:3', text: 'Blessed are the poor in spirit, for theirs is the kingdom of heaven.' },
        { reference: 'John 3:16', text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
        { reference: 'Romans 8:28', text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
        { reference: 'Philippians 4:13', text: 'I can do all things through Christ who strengthens me.' },
        { reference: 'James 1:5', text: 'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.' },
        { reference: '1 Peter 3:15', text: 'But in your hearts revere Christ as Lord. Always be prepared to give an answer to everyone who asks you to give the reason for the hope that you have.' },
        { reference: '1 John 4:19', text: 'We love because he first loved us.' },
        { reference: 'Revelation 21:4', text: 'He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain, for the old order of things has passed away.' },
        { reference: 'Isaiah 40:31', text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.' },
        { reference: 'Jeremiah 29:11', text: 'For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, to give you hope and a future.' },
        { reference: 'Proverbs 3:5', text: 'Trust in the Lord with all your heart and lean not on your own understanding.' },
        { reference: 'Joshua 1:9', text: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.' },
        { reference: 'Psalm 46:10', text: 'Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.' },
        { reference: 'Matthew 11:28', text: 'Come to me, all you who are weary and burdened, and I will give you rest.' },
        { reference: 'Romans 12:2', text: 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God\'s will is—his good, pleasing and perfect will.' },
        { reference: 'Ephesians 2:8', text: 'For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God.' },
        { reference: '2 Timothy 1:7', text: 'For God has not given us a spirit of fear, but of power and of love and of a sound mind.' },
        { reference: 'Hebrews 11:1', text: 'Now faith is confidence in what we hope for and assurance about what we do not see.' },
        { reference: '1 Corinthians 13:4', text: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud.' },
        { reference: 'Galatians 5:22', text: 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness.' },
        { reference: 'Colossians 3:23', text: 'Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.' },
        { reference: '1 Thessalonians 5:16', text: 'Rejoice always, pray continually, give thanks in all circumstances; for this is God\'s will for you in Christ Jesus.' },
        { reference: 'Deuteronomy 6:5', text: 'Love the Lord your God with all your heart and with all your soul and with all your strength.' },
        { reference: 'Psalm 119:105', text: 'Your word is a lamp for my feet, a light on my path.' },
        { reference: 'Matthew 6:33', text: 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.' },
        { reference: 'John 14:6', text: 'Jesus answered, "I am the way and the truth and the life. No one comes to the Father except through me."' },
        { reference: 'Acts 1:8', text: 'But you will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth.' },
        { reference: '2 Corinthians 5:17', text: 'Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!' }
      ];

      // Use day of year to select a different verse each day
      const verseIndex = dayOfYear % fallbackVerses.length;
      const selectedVerse = fallbackVerses[verseIndex];

      console.log('📖 Selected verse for day', dayOfYear, ':', selectedVerse);
      return selectedVerse;

      /*
      // This section is commented out to avoid API errors
      // Fallback verses for each book if API fails
      const fallbackVersesByBook = {
        'GEN': { reference: 'Genesis 1:1', text: 'In the beginning God created the heavens and the earth.' },
        'PSA': { reference: 'Psalm 23:1', text: 'The Lord is my shepherd, I shall not want.' },
        'MAT': { reference: 'Matthew 5:3', text: 'Blessed are the poor in spirit, for theirs is the kingdom of heaven.' },
        'JOH': { reference: 'John 3:16', text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
        'ROM': { reference: 'Romans 8:28', text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
        'PHI': { reference: 'Philippians 4:13', text: 'I can do all things through Christ who strengthens me.' },
        'JAM': { reference: 'James 1:5', text: 'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.' },
        '1PE': { reference: '1 Peter 3:15', text: 'But in your hearts revere Christ as Lord. Always be prepared to give an answer to everyone who asks you to give the reason for the hope that you have.' },
        '1JO': { reference: '1 John 4:19', text: 'We love because he first loved us.' },
        'REV': { reference: 'Revelation 21:4', text: 'He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain, for the old order of things has passed away.' },
        'ISA': { reference: 'Isaiah 40:31', text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.' },
        'JER': { reference: 'Jeremiah 29:11', text: 'For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, to give you hope and a future.' },
        'EZE': { reference: 'Ezekiel 37:5', text: 'This is what the Sovereign Lord says to these bones: I will make breath enter you, and you will come to life.' },
        'DAN': { reference: 'Daniel 12:3', text: 'Those who are wise will shine like the brightness of the heavens, and those who lead many to righteousness, like the stars for ever and ever.' },
        'HOS': { reference: 'Hosea 6:6', text: 'For I desire mercy, not sacrifice, and acknowledgment of God rather than burnt offerings.' },
        'MIC': { reference: 'Micah 6:8', text: 'He has shown you, O mortal, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God.' },
        'ZEC': { reference: 'Zechariah 4:6', text: 'So he said to me, "This is the word of the Lord to Zerubbabel: Not by might nor by power, but by my Spirit," says the Lord Almighty.' },
        'MAL': { reference: 'Malachi 3:10', text: 'Bring the whole tithe into the storehouse, that there may be food in my house. Test me in this," says the Lord Almighty, "and see if I will not throw open the floodgates of heaven and pour out so much blessing that there will not be room enough to store it.' },
        '2TI': { reference: '2 Timothy 1:7', text: 'For God has not given us a spirit of fear, but of power and of love and of a sound mind.' },
        'HEB': { reference: 'Hebrews 11:1', text: 'Now faith is confidence in what we hope for and assurance about what we do not see.' },
        'TIT': { reference: 'Titus 2:11', text: 'For the grace of God has appeared that offers salvation to all people.' },
        '1TH': { reference: '1 Thessalonians 5:16', text: 'Rejoice always, pray continually, give thanks in all circumstances; for this is God\'s will for you in Christ Jesus.' },
        '2TH': { reference: '2 Thessalonians 3:3', text: 'But the Lord is faithful, and he will strengthen you and protect you from the evil one.' },
        '1CO': { reference: '1 Corinthians 13:4', text: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud.' },
        '2CO': { reference: '2 Corinthians 4:18', text: 'So we fix our eyes not on what is seen, but on what is unseen, since what is seen is temporary, but what is unseen is eternal.' },
        'GAL': { reference: 'Galatians 5:22', text: 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness.' },
        'EPH': { reference: 'Ephesians 6:10', text: 'Finally, be strong in the Lord and in his mighty power.' },
        'COL': { reference: 'Colossians 3:23', text: 'Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.' },
        '1TI': { reference: '1 Timothy 6:12', text: 'Fight the good fight of the faith. Take hold of the eternal life to which you were called when you made your good confession in the presence of many witnesses.' },
        '2PE': { reference: '2 Peter 1:3', text: 'His divine power has given us everything we need for a godly life through our knowledge of him who called us by his own glory and goodness.' },
        '2JO': { reference: '2 John 1:6', text: 'And this is love: that we walk in obedience to his commands. As you have heard from the beginning, his command is that you walk in love.' },
        '3JO': { reference: '3 John 1:4', text: 'I have no greater joy than to hear that my children are walking in the truth.' },
        'JUD': { reference: 'Jude 1:24', text: 'To him who is able to keep you from stumbling and to present you before his glorious presence without fault and with great joy.' },
        'EXO': { reference: 'Exodus 20:3', text: 'You shall have no other gods before me.' },
        'LEV': { reference: 'Leviticus 19:18', text: 'Do not seek revenge or bear a grudge against anyone among your people, but love your neighbor as yourself. I am the Lord.' },
        'NUM': { reference: 'Numbers 6:24', text: 'The Lord bless you and keep you.' },
        'DEU': { reference: 'Deuteronomy 6:5', text: 'Love the Lord your God with all your heart and with all your soul and with all your strength.' },
        'JOS': { reference: 'Joshua 1:9', text: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.' },
        'RUT': { reference: 'Ruth 1:16', text: 'But Ruth replied, "Don\'t urge me to leave you or to turn back from you. Where you go I will go, and where you stay I will stay. Your people will be my people and your God my God.' },
        '1SA': { reference: '1 Samuel 16:7', text: 'But the Lord said to Samuel, "Do not consider his appearance or his height, for I have rejected him. The Lord does not look at the things people look at. People look at the outward appearance, but the Lord looks at the heart.' },
        '2SA': { reference: '2 Samuel 22:2', text: 'He said: "The Lord is my rock, my fortress and my deliverer.' },
        '1KI': { reference: '1 Kings 8:27', text: 'But will God really dwell on earth? The heavens, even the highest heaven, cannot contain you. How much less this temple I have built!' },
        '2KI': { reference: '2 Kings 6:16', text: 'Don\'t be afraid," the prophet answered. "Those who are with us are more than those who are with them.' },
        '1CH': { reference: '1 Chronicles 16:8', text: 'Give praise to the Lord, proclaim his name; make known among the nations what he has done.' },
        '2CH': { reference: '2 Chronicles 7:14', text: 'If my people, who are called by my name, will humble themselves and pray and seek my face and turn from their wicked ways, then I will hear from heaven, and I will forgive their sin and will heal their land.' },
        'EZR': { reference: 'Ezra 3:11', text: 'With praise and thanksgiving they sang to the Lord: "He is good; his love toward Israel endures forever."' },
        'NEH': { reference: 'Nehemiah 8:10', text: 'Nehemiah said, "Go and enjoy choice food and sweet drinks, and send some to those who have nothing prepared. This day is holy to our Lord. Do not grieve, for the joy of the Lord is your strength.' },
        'EST': { reference: 'Esther 4:14', text: 'For if you remain silent at this time, relief and deliverance for the Jews will arise from another place, but you and your father\'s family will perish. And who knows but that you have come to your royal position for such a time as this?' },
        'JOB': { reference: 'Job 1:21', text: 'Naked I came from my mother\'s womb, and naked I will depart. The Lord gave and the Lord has taken away; may the name of the Lord be praised.' },
        'PRO': { reference: 'Proverbs 3:5', text: 'Trust in the Lord with all your heart and lean not on your own understanding.' },
        'ECC': { reference: 'Ecclesiastes 3:1', text: 'There is a time for everything, and a season for every activity under the heavens.' },
        'SON': { reference: 'Song of Songs 2:4', text: 'He has taken me to the banquet hall, and his banner over me is love.' },
        'LAM': { reference: 'Lamentations 3:23', text: 'Great is his faithfulness; his mercies begin afresh each morning.' },
        'NAH': { reference: 'Nahum 1:7', text: 'The Lord is good, a refuge in times of trouble. He cares for those who trust in him.' },
        'HAB': { reference: 'Habakkuk 2:4', text: 'See, the enemy is puffed up; his desires are not upright—but the righteous person will live by his faithfulness.' },
        'ZEP': { reference: 'Zephaniah 3:17', text: 'The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you; in his love he will no longer rebuke you, but will rejoice over you with singing.' },
        'HAG': { reference: 'Hagai 2:9', text: 'The glory of this present house will be greater than the glory of the former house," says the Lord Almighty. "And in this place I will grant peace," declares the Lord Almighty.' },
        'MAR': { reference: 'Mark 10:27', text: 'Jesus looked at them and said, "With man this is impossible, but not with God; all things are possible with God.' },
        'LUK': { reference: 'Luke 6:31', text: 'Do to others as you would have them do to you.' },
        'ACT': { reference: 'Acts 1:8', text: 'But you will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth.' },
        'GAL': { reference: 'Galatians 6:9', text: 'Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.' },
        'EPH': { reference: 'Ephesians 1:3', text: 'Praise be to the God and Father of our Lord Jesus Christ, who has blessed us in the heavenly realms with every spiritual blessing in Christ.' },
        'PHI': { reference: 'Philippians 1:6', text: 'Being confident of this, that he who began a good work in you will carry it on to completion until the day of Christ Jesus.' },
        'COL': { reference: 'Colossians 1:15', text: 'The Son is the image of the invisible God, the firstborn over all creation.' },
        '1TH': { reference: '1 Thessalonians 1:3', text: 'We remember before our God and Father your work produced by faith, your labor prompted by love, and your endurance inspired by hope in our Lord Jesus Christ.' },
        '2TI': { reference: '2 Timothy 2:15', text: 'Do your best to present yourself to God as one approved, a worker who does not need to be ashamed and who correctly handles the word of truth.' },
        'TIT': { reference: 'Titus 1:2', text: 'In the hope of eternal life, which God, who does not lie, promised before the beginning of time.' },
        'PHM': { reference: 'Philemon 1:6', text: 'I pray that your partnership with us in the faith may be effective in deepening your understanding of every good thing we share for the sake of Christ.' },
        'HEB': { reference: 'Hebrews 1:1', text: 'In the past God spoke to our ancestors through the prophets at many times and in various ways.' },
        'JAM': { reference: 'James 1:2', text: 'Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds.' },
        '1PE': { reference: '1 Peter 1:3', text: 'Praise be to the God and Father of our Lord Jesus Christ! In his great mercy he has given us new birth into a living hope through the resurrection of Jesus Christ from the dead.' },
        '2PE': { reference: '2 Peter 2:9', text: 'If this is so, then the Lord knows how to rescue the godly from trials and to hold the unrighteous for punishment on the day of judgment.' },
        '1JO': { reference: '1 John 1:9', text: 'If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness.' }
      };
      */
    } catch (error) {
      console.error('❌ Error in fetchVerseOfTheDay:', error);
      const errorFallback = {
        reference: 'Psalm 23:1',
        text: 'The Lord is my shepherd, I shall not want.'
      };
      console.log('🔄 Using error fallback verse:', errorFallback);
      return errorFallback;
    }
  };

  // New function: Compare passages across multiple translations
  const comparePassages = async (passageReference: string, bibleIds: string[]): Promise<{
    reference: string;
    translations: { bibleId: string; bibleName: string; content: string }[];
  }> => {
    try {
      setLoading(true);
      setError(null);

      const results = await Promise.all(
        bibleIds.map(async (bibleId) => {
          try {
            const data = await makeAPIRequest(`/bibles/${bibleId}/passages/${passageReference}`);
            const bible = bibles.find(b => b.id === bibleId);
            return {
              bibleId,
              bibleName: bible?.name || 'Unknown Translation',
              content: data.data?.content || 'Content not available'
            };
          } catch (error) {
            return {
              bibleId,
              bibleName: 'Unknown Translation',
              content: 'Failed to load content'
            };
          }
        })
      );

      return {
        reference: passageReference,
        translations: results
      };
    } catch (error) {
      const apiError = error as APIError;
      setError(apiError.message);
      console.error('Error comparing passages:', apiError);
      return { reference: passageReference, translations: [] };
    } finally {
      setLoading(false);
    }
  };

  // New function: Get Bible statistics
  const getBibleStats = async (bibleId: string) => {
    try {
      const data = await makeAPIRequest(`/bibles/${bibleId}`);
      return {
        totalBooks: data.data?.numberOfBooks || 0,
        totalChapters: data.data?.totalNumberOfChapters || 0,
        totalVerses: data.data?.totalNumberOfVerses || 0,
        language: data.data?.languageName || 'Unknown',
        textDirection: data.data?.textDirection || 'ltr'
      };
    } catch (error) {
      const apiError = error as APIError;
      setError(apiError.message);
      return null;
    }
  };

  return {
    bibles,
    books,
    chapters,
    currentPassage,
    loading,
    error,
    isOnline,
    rateLimitInfo,
    fetchBibles,
    fetchBooks,
    fetchChapters,
    fetchPassage,
    searchVerses,
    fetchVerse,
    fetchVerseOfTheDay,
    comparePassages,
    getBibleStats,
    clearError: () => setError(null),
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark,
    getReadingProgress,
    getOverallReadingProgress,
    getRecentChapters,
    clearOldCache,
    // Enhanced offline functionality
    saveBookForOffline,
    saveChapterForOffline,
    getOfflineBooks,
    getOfflineChapters,
    fetchBooksWithOffline,
    fetchChaptersWithOffline,
    downloadBookForOffline,
    getOfflineStats,
    removeBookFromOffline,
    isBookAvailableOffline,
    syncOfflineProgress
  };
}