/**
 * Enhanced Memory Management for Bible Screen
 * This utility helps prevent freezing by managing memory usage efficiently
 */

import { useCallback, useEffect, useRef } from 'react';

// Memory management configuration
const MEMORY_CONFIG = {
  MAX_CACHE_SIZE: 30, // Reduced from 50 to prevent memory issues
  CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
  MAX_AGE: 15 * 60 * 1000, // 15 minutes
  LOW_MEMORY_THRESHOLD: 0.7, // 70% memory usage
};

interface CacheItem {
  data: any;
  timestamp: number;
  accessCount: number;
  size: number;
}

interface MemoryStats {
  totalItems: number;
  totalSize: number;
  memoryUsage: number;
  oldestItem: number;
  newestItem: number;
}

export class BibleMemoryManager {
  private static instance: BibleMemoryManager;
  private passageCache: Map<string, CacheItem> = new Map();
  private bookCache: Map<string, CacheItem> = new Map();
  private chapterCache: Map<string, CacheItem> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isLowMemory: boolean = false;

  private constructor() {
    this.startPeriodicCleanup();
    this.monitorMemoryUsage();
  }

  static getInstance(): BibleMemoryManager {
    if (!BibleMemoryManager.instance) {
      BibleMemoryManager.instance = new BibleMemoryManager();
    }
    return BibleMemoryManager.instance;
  }

  // Monitor memory usage and adjust behavior accordingly
  private monitorMemoryUsage(): void {
    const checkMemory = () => {
      try {
        const stats = this.getMemoryStats();
        this.isLowMemory = stats.memoryUsage > MEMORY_CONFIG.LOW_MEMORY_THRESHOLD;
        
        if (this.isLowMemory) {
          console.warn('⚠️ Low memory detected, clearing old cache items');
          this.aggressiveCleanup();
        }
      } catch (error) {
        console.error('Memory monitoring error:', error);
      }
    };

    // Check memory every 30 seconds
    setInterval(checkMemory, 30 * 1000);
  }

  // Start periodic cleanup
  private startPeriodicCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldItems();
    }, MEMORY_CONFIG.CLEANUP_INTERVAL);
  }

  // Stop periodic cleanup
  private stopPeriodicCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  // Calculate item size (approximate)
  private calculateSize(item: any): number {
    try {
      return JSON.stringify(item).length;
    } catch {
      return 1000; // Default size if calculation fails
    }
  }

  // Cache passage with enhanced memory management
  setPassage(key: string, passage: any): void {
    if (this.isLowMemory) {
      // Skip caching in low memory situations
      return;
    }

    this.manageCacheSize();
    const item: CacheItem = {
      data: passage,
      timestamp: Date.now(),
      accessCount: 0,
      size: this.calculateSize(passage),
    };
    this.passageCache.set(key, item);
  }

  // Get passage from cache
  getPassage(key: string): any {
    const item = this.passageCache.get(key);
    if (item) {
      item.accessCount++;
      item.timestamp = Date.now(); // Update access time
      return item.data;
    }
    return null;
  }

  // Cache book with enhanced memory management
  setBook(key: string, book: any): void {
    if (this.isLowMemory) {
      return;
    }

    this.manageCacheSize();
    const item: CacheItem = {
      data: book,
      timestamp: Date.now(),
      accessCount: 0,
      size: this.calculateSize(book),
    };
    this.bookCache.set(key, item);
  }

  // Get book from cache
  getBook(key: string): any {
    const item = this.bookCache.get(key);
    if (item) {
      item.accessCount++;
      item.timestamp = Date.now();
      return item.data;
    }
    return null;
  }

  // Cache chapter with enhanced memory management
  setChapter(key: string, chapter: any): void {
    if (this.isLowMemory) {
      return;
    }

    this.manageCacheSize();
    const item: CacheItem = {
      data: chapter,
      timestamp: Date.now(),
      accessCount: 0,
      size: this.calculateSize(chapter),
    };
    this.chapterCache.set(key, item);
  }

  // Get chapter from cache
  getChapter(key: string): any {
    const item = this.chapterCache.get(key);
    if (item) {
      item.accessCount++;
      item.timestamp = Date.now();
      return item.data;
    }
    return null;
  }

  // Enhanced cache size management
  private manageCacheSize(): void {
    const totalSize = this.passageCache.size + this.bookCache.size + this.chapterCache.size;
    
    if (totalSize >= MEMORY_CONFIG.MAX_CACHE_SIZE) {
      this.evictLeastRecentlyUsed();
    }
  }

  // Evict least recently used items
  private evictLeastRecentlyUsed(): void {
    const allItems: Array<{ key: string; item: CacheItem; type: 'passage' | 'book' | 'chapter' }> = [];

    // Collect all items
    this.passageCache.forEach((item, key) => {
      allItems.push({ key, item, type: 'passage' });
    });
    this.bookCache.forEach((item, key) => {
      allItems.push({ key, item, type: 'book' });
    });
    this.chapterCache.forEach((item, key) => {
      allItems.push({ key, item, type: 'chapter' });
    });

    // Sort by access count and timestamp (least used first)
    allItems.sort((a, b) => {
      const scoreA = a.item.accessCount * 0.3 + (Date.now() - a.item.timestamp) * 0.7;
      const scoreB = b.item.accessCount * 0.3 + (Date.now() - b.item.timestamp) * 0.7;
      return scoreA - scoreB;
    });

    // Remove 25% of least used items
    const itemsToRemove = Math.ceil(allItems.length * 0.25);
    for (let i = 0; i < itemsToRemove && i < allItems.length; i++) {
      const { key, type } = allItems[i];
      
      switch (type) {
        case 'passage':
          this.passageCache.delete(key);
          break;
        case 'book':
          this.bookCache.delete(key);
          break;
        case 'chapter':
          this.chapterCache.delete(key);
          break;
      }
    }
  }

  // Clean up old items
  cleanupOldItems(maxAge: number = MEMORY_CONFIG.MAX_AGE): void {
    const now = Date.now();
    const cutoffTime = now - maxAge;

    // Clean passages
    for (const [key, item] of this.passageCache.entries()) {
      if (item.timestamp < cutoffTime) {
        this.passageCache.delete(key);
      }
    }

    // Clean books
    for (const [key, item] of this.bookCache.entries()) {
      if (item.timestamp < cutoffTime) {
        this.bookCache.delete(key);
      }
    }

    // Clean chapters
    for (const [key, item] of this.chapterCache.entries()) {
      if (item.timestamp < cutoffTime) {
        this.chapterCache.delete(key);
      }
    }
  }

  // Aggressive cleanup for low memory situations
  private aggressiveCleanup(): void {
    // Remove 50% of items
    const totalItems = this.passageCache.size + this.bookCache.size + this.chapterCache.size;
    const itemsToRemove = Math.ceil(totalItems * 0.5);
    
    const allItems: Array<{ key: string; item: CacheItem; type: 'passage' | 'book' | 'chapter' }> = [];
    
    this.passageCache.forEach((item, key) => {
      allItems.push({ key, item, type: 'passage' });
    });
    this.bookCache.forEach((item, key) => {
      allItems.push({ key, item, type: 'book' });
    });
    this.chapterCache.forEach((item, key) => {
      allItems.push({ key, item, type: 'chapter' });
    });

    // Sort by access count (least accessed first)
    allItems.sort((a, b) => a.item.accessCount - b.item.accessCount);

    // Remove least accessed items
    for (let i = 0; i < itemsToRemove && i < allItems.length; i++) {
      const { key, type } = allItems[i];
      
      switch (type) {
        case 'passage':
          this.passageCache.delete(key);
          break;
        case 'book':
          this.bookCache.delete(key);
          break;
        case 'chapter':
          this.chapterCache.delete(key);
          break;
      }
    }
  }

  // Clear all caches
  clearAll(): void {
    this.passageCache.clear();
    this.bookCache.clear();
    this.chapterCache.clear();
  }

  // Get memory statistics
  getMemoryStats(): MemoryStats {
    const allItems: CacheItem[] = [
      ...Array.from(this.passageCache.values()),
      ...Array.from(this.bookCache.values()),
      ...Array.from(this.chapterCache.values()),
    ];

    const totalSize = allItems.reduce((sum, item) => sum + item.size, 0);
    const timestamps = allItems.map(item => item.timestamp);
    
    return {
      totalItems: allItems.length,
      totalSize,
      memoryUsage: totalSize / (1024 * 1024), // Convert to MB
      oldestItem: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestItem: timestamps.length > 0 ? Math.max(...timestamps) : 0,
    };
  }

  // Force garbage collection
  forceGarbageCollection(): void {
    if (global.gc) {
      global.gc();
    }
    
    // Clear all caches
    this.clearAll();
  }

  // Destroy instance and cleanup
  destroy(): void {
    this.stopPeriodicCleanup();
    this.clearAll();
    BibleMemoryManager.instance = null as any;
  }
}

// React hook for Bible memory management
export const useBibleMemoryManager = () => {
  const memoryManager = BibleMemoryManager.getInstance();
  const cleanupRef = useRef<NodeJS.Timeout | null>(null);

  // Set passage with automatic cleanup
  const setPassage = useCallback((key: string, passage: any) => {
    memoryManager.setPassage(key, passage);
  }, [memoryManager]);

  // Get passage from cache
  const getPassage = useCallback((key: string) => {
    return memoryManager.getPassage(key);
  }, [memoryManager]);

  // Set book with automatic cleanup
  const setBook = useCallback((key: string, book: any) => {
    memoryManager.setBook(key, book);
  }, [memoryManager]);

  // Get book from cache
  const getBook = useCallback((key: string) => {
    return memoryManager.getBook(key);
  }, [memoryManager]);

  // Set chapter with automatic cleanup
  const setChapter = useCallback((key: string, chapter: any) => {
    memoryManager.setChapter(key, chapter);
  }, [memoryManager]);

  // Get chapter from cache
  const getChapter = useCallback((key: string) => {
    return memoryManager.getChapter(key);
  }, [memoryManager]);

  // Clear all caches
  const clearAll = useCallback(() => {
    memoryManager.clearAll();
  }, [memoryManager]);

  // Get memory statistics
  const getStats = useCallback(() => {
    return memoryManager.getMemoryStats();
  }, [memoryManager]);

  // Cleanup old items
  const cleanupOldItems = useCallback((maxAge?: number) => {
    memoryManager.cleanupOldItems(maxAge);
  }, [memoryManager]);

  // Force garbage collection
  const forceGarbageCollection = useCallback(() => {
    memoryManager.forceGarbageCollection();
  }, [memoryManager]);

  // Setup automatic cleanup on component mount
  useEffect(() => {
    // Cleanup every 2 minutes
    cleanupRef.current = setInterval(() => {
      memoryManager.cleanupOldItems();
    }, 2 * 60 * 1000);

    return () => {
      if (cleanupRef.current) {
        clearInterval(cleanupRef.current);
      }
    };
  }, [memoryManager]);

  return {
    setPassage,
    getPassage,
    setBook,
    getBook,
    setChapter,
    getChapter,
    clearAll,
    getStats,
    cleanupOldItems,
    forceGarbageCollection,
  };
};

// Utility function to check if device has low memory
export const isLowMemoryDevice = (): boolean => {
  try {
    const memoryManager = BibleMemoryManager.getInstance();
    const stats = memoryManager.getMemoryStats();
    
    // Consider low memory if using more than 50MB
    return stats.memoryUsage > 50;
  } catch {
    return false;
  }
};

// Utility function to optimize memory usage
export const optimizeBibleMemory = (): void => {
  const memoryManager = BibleMemoryManager.getInstance();
  
  // Force cleanup of old items
  memoryManager.cleanupOldItems(5 * 60 * 1000); // 5 minutes
  
  // Force garbage collection
  memoryManager.forceGarbageCollection();
  
  console.log('🧹 Bible memory optimized');
};

export default BibleMemoryManager;
