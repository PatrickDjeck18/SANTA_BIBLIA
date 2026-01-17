import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getGuestGratitudeEntries,
  saveGuestGratitudeEntry,
  updateGuestGratitudeEntry,
  deleteGuestGratitudeEntry,
  GuestGratitudeEntry
} from '@/utils/guestGratitudeStorage';

export interface GratitudeEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood_rating: number; // 1-5 scale
  tags: string[];
  is_private: boolean;
  is_favorite: boolean;
  background_color?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGratitudeEntryData {
  title: string;
  content: string;
  mood_rating: number;
  tags?: string[];
  is_private?: boolean;
  is_favorite?: boolean;
  background_color?: string;
}

export interface UpdateGratitudeEntryData extends Partial<CreateGratitudeEntryData> {
  id: string;
}

export function useGratitudeJournal() {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  const PAGE_SIZE = 20;

  // Optimized fetch with pagination
  const fetchEntries = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch from local storage
      const allEntries = await getGuestGratitudeEntries();

      // Sort entries by created_at (newest first)
      const sortedEntries = allEntries.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });

      // Apply pagination
      const startIndex = pageNum * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;
      const newEntries = sortedEntries.slice(startIndex, endIndex);

      if (append) {
        setEntries(prev => [...prev, ...newEntries]);
      } else {
        setEntries(newEntries);
      }

      setHasMore(endIndex < sortedEntries.length);
      setPage(pageNum);

    } catch (err: any) {
      console.error('Error fetching entries:', err);
      setError('Failed to load entries');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchEntries(page + 1, true);
    }
  }, [loading, hasMore, page, fetchEntries]);

  const refetch = useCallback(() => {
    setPage(0);
    fetchEntries(0, false);
  }, [fetchEntries]);

  const createEntry = useCallback(async (entryData: CreateGratitudeEntryData): Promise<GratitudeEntry | null> => {
    try {
      console.log('Creating local gratitude entry');

      const newEntry: GuestGratitudeEntry = {
        id: Date.now().toString(),
        ...entryData,
        user_id: 'guest',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: entryData.tags || [],
        is_private: entryData.is_private || false,
        is_favorite: entryData.is_favorite || false,
        background_color: entryData.background_color || '#FFFFFF',
      };

      await saveGuestGratitudeEntry(newEntry);

      setEntries(prev => [newEntry, ...prev]);
      console.log('Successfully created local gratitude entry:', newEntry);
      return newEntry;
    } catch (err: any) {
      console.error('Error creating gratitude entry:', err);
      setError('Failed to create entry');
      return null;
    }
  }, []);

  const updateEntry = useCallback(async (entryData: UpdateGratitudeEntryData): Promise<GratitudeEntry | null> => {
    try {
      // Get current entry to merge
      const currentEntry = entries.find(e => e.id === entryData.id);
      if (!currentEntry) return null;

      const updatedEntry: GuestGratitudeEntry = {
        ...currentEntry,
        ...entryData,
        updated_at: new Date().toISOString(),
        user_id: 'guest', // Ensure user_id remains guest
      };

      await updateGuestGratitudeEntry(entryData.id, updatedEntry);

      setEntries(prev => prev.map(entry =>
        entry.id === entryData.id ? updatedEntry : entry
      ));

      return updatedEntry;
    } catch (err) {
      console.error('Error updating entry:', err);
      setError('Failed to update entry');
      return null;
    }
  }, [entries]);

  const deleteEntry = useCallback(async (entryId: string): Promise<boolean> => {
    try {
      await deleteGuestGratitudeEntry(entryId);
      setEntries(prev => prev.filter(entry => entry.id !== entryId));
      return true;
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError('Failed to delete entry');
      return false;
    }
  }, []);

  // Load entries on mount
  useEffect(() => {
    fetchEntries(0, false);
  }, [fetchEntries]);

  return {
    entries,
    loading,
    error,
    refetch,
    createEntry,
    updateEntry,
    deleteEntry,
    loadMore,
    hasMore,
  };
}
