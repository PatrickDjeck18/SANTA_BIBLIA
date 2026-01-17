/**
 * Performance utilities for the Bible screen
 * These utilities help optimize memory usage and prevent performance issues
 */

import { useRef, useCallback, useEffect } from 'react';

// Debounce utility to prevent excessive function calls
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

// Throttle utility to limit function execution frequency
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef<number>(0);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        lastRun.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  ) as T;

  return throttledCallback;
};

// Memory management utilities
export class MemoryManager {
  private static instance: MemoryManager;
  private cache: Map<string, any> = new Map();
  private maxCacheSize: number = 100;
  private accessCount: Map<string, number> = new Map();

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  // Set cache with size limit
  set(key: string, value: any): void {
    // If cache is full, remove least recently used item
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(key, value);
    this.accessCount.set(key, 1);
  }

  // Get from cache
  get(key: string): any {
    const value = this.cache.get(key);
    if (value) {
      const count = this.accessCount.get(key) || 0;
      this.accessCount.set(key, count + 1);
    }
    return value;
  }

  // Remove least recently used item
  private evictLeastRecentlyUsed(): void {
    let leastUsedKey = '';
    let minCount = Infinity;

    for (const [key, count] of this.accessCount.entries()) {
      if (count < minCount) {
        minCount = count;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
      this.accessCount.delete(leastUsedKey);
    }
  }

  // Clear cache
  clear(): void {
    this.cache.clear();
    this.accessCount.clear();
  }

  // Get cache size
  getSize(): number {
    return this.cache.size;
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Start timing
  startTiming(label: string): void {
    const startTime = performance.now();
    this.metrics.set(`${label}_start`, [startTime]);
  }

  // End timing and record
  endTiming(label: string): number {
    const endTime = performance.now();
    const startTime = this.metrics.get(`${label}_start`)?.[0];
    
    if (startTime) {
      const duration = endTime - startTime;
      const existingTimes = this.metrics.get(label) || [];
      this.metrics.set(label, [...existingTimes, duration]);
      this.metrics.delete(`${label}_start`);
      return duration;
    }
    
    return 0;
  }

  // Get average time for a label
  getAverageTime(label: string): number {
    const times = this.metrics.get(label) || [];
    if (times.length === 0) return 0;
    
    const sum = times.reduce((acc, time) => acc + time, 0);
    return sum / times.length;
  }

  // Get all metrics
  getAllMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    
    for (const [label, times] of this.metrics.entries()) {
      if (!label.endsWith('_start')) {
        result[label] = this.getAverageTime(label);
      }
    }
    
    return result;
  }

  // Clear metrics
  clear(): void {
    this.metrics.clear();
  }
}

// Hook for performance monitoring
export const usePerformanceMonitor = (label: string) => {
  const monitor = PerformanceMonitor.getInstance();

  const startTiming = useCallback(() => {
    monitor.startTiming(label);
  }, [label, monitor]);

  const endTiming = useCallback(() => {
    return monitor.endTiming(label);
  }, [label, monitor]);

  return { startTiming, endTiming };
};

// Hook for memory management
export const useMemoryManager = () => {
  const memoryManager = MemoryManager.getInstance();

  const setCache = useCallback((key: string, value: any) => {
    memoryManager.set(key, value);
  }, [memoryManager]);

  const getCache = useCallback((key: string) => {
    return memoryManager.get(key);
  }, [memoryManager]);

  const clearCache = useCallback(() => {
    memoryManager.clear();
  }, [memoryManager]);

  return { setCache, getCache, clearCache };
};

// Utility to check if device has low memory
export const isLowMemoryDevice = (): boolean => {
  // This is a simplified check - in a real app you'd use device-specific APIs
  const totalMemory = (global as any).performance?.memory?.totalJSHeapSize || 0;
  const usedMemory = (global as any).performance?.memory?.usedJSHeapSize || 0;
  
  // If we're using more than 80% of available memory, consider it low memory
  return usedMemory / totalMemory > 0.8;
};

// Utility to optimize images and reduce memory usage
export const optimizeForMemory = () => {
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }

  // Clear any unused caches
  const memoryManager = MemoryManager.getInstance();
  if (memoryManager.getSize() > 50) {
    memoryManager.clear();
  }
};

// Utility to batch operations for better performance
export const batchOperations = <T>(
  operations: (() => Promise<T>)[],
  batchSize: number = 5
): Promise<T[]> => {
  const results: T[] = [];
  
  const processBatch = async (batch: (() => Promise<T>)[]) => {
    const batchResults = await Promise.all(batch.map(op => op()));
    results.push(...batchResults);
  };

  const processAllBatches = async () => {
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      await processBatch(batch);
      
      // Small delay between batches to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  };

  return processAllBatches().then(() => results);
};
