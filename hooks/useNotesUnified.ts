import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getGuestNotes,
  saveGuestNote,
  updateGuestNote,
  deleteGuestNote,
  GuestNote
} from '@/utils/guestStorage';

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: 'reflection' | 'prayer' | 'study' | 'journal' | 'insight' | 'gratitude' | 'other';
  tags: string[];
  is_private: boolean;
  is_favorite: boolean;
  mood_rating?: number;
  bible_reference?: string;
  background_color?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
  category?: Note['category'];
  tags?: string[];
  is_private?: boolean;
  is_favorite?: boolean;
  mood_rating?: number;
  bible_reference?: string;
  background_color?: string;
}

export interface UpdateNoteData extends Partial<CreateNoteData> {
  id: string;
}

export function useNotesUnified() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const PAGE_SIZE = 20;

  // Optimized fetch with pagination
  const fetchNotes = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    try {
      setError(null);
      setLoading(true);

      // Load from local storage
      const guestNotes = await getGuestNotes();

      // Convert and Sort (Newest first)
      const sortedNotes = guestNotes.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const startIndex = pageNum * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;
      const paginatedNotes = sortedNotes.slice(startIndex, endIndex);

      // Convert GuestNote to Note format
      const convertedNotes: Note[] = paginatedNotes.map(guestNote => ({
        id: guestNote.id,
        user_id: guestNote.user_id,
        title: guestNote.title,
        content: guestNote.content,
        category: guestNote.category,
        tags: guestNote.tags,
        is_private: guestNote.is_private,
        is_favorite: guestNote.is_favorite,
        mood_rating: guestNote.mood_rating,
        bible_reference: guestNote.bible_reference,
        background_color: guestNote.background_color,
        created_at: guestNote.created_at,
        updated_at: guestNote.updated_at,
      }));

      if (append) {
        setNotes(prev => [...prev, ...convertedNotes]);
      } else {
        setNotes(convertedNotes);
      }

      setHasMore(endIndex < guestNotes.length);
      setPage(pageNum);

    } catch (err) {
      console.error('Error in fetchNotes:', err);
      setError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load more notes
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchNotes(page + 1, true);
    }
  }, [loading, hasMore, page, fetchNotes]);

  // Refetch notes
  const refetch = useCallback(() => {
    setPage(0);
    fetchNotes(0, false);
  }, [fetchNotes]);

  // Create note
  const createNote = useCallback(async (noteData: CreateNoteData): Promise<Note | null> => {
    try {
      // Save to local storage
      const guestNoteData = {
        user_id: 'guest',
        title: noteData.title,
        content: noteData.content,
        category: noteData.category || 'reflection',
        tags: noteData.tags || [],
        is_private: noteData.is_private !== false,
        is_favorite: noteData.is_favorite || false,
        mood_rating: noteData.mood_rating,
        bible_reference: noteData.bible_reference,
        background_color: noteData.background_color || '#FFFFFF',
      };

      const savedNote = await saveGuestNote(guestNoteData);

      // Convert to Note format
      const note: Note = {
        id: savedNote.id,
        user_id: savedNote.user_id,
        title: savedNote.title,
        content: savedNote.content,
        category: savedNote.category,
        tags: savedNote.tags,
        is_private: savedNote.is_private,
        is_favorite: savedNote.is_favorite,
        mood_rating: savedNote.mood_rating,
        bible_reference: savedNote.bible_reference,
        background_color: savedNote.background_color,
        created_at: savedNote.created_at,
        updated_at: savedNote.updated_at,
      };

      // Update local state
      setNotes(prev => [note, ...prev]);
      return note;
    } catch (err) {
      console.error('Error creating note:', err);
      return null;
    }
  }, []);

  // Update note
  const updateNote = useCallback(async (noteData: UpdateNoteData): Promise<Note | null> => {
    try {
      // Update in local storage
      const updateData = {
        title: noteData.title,
        content: noteData.content,
        category: noteData.category,
        tags: noteData.tags,
        is_private: noteData.is_private,
        is_favorite: noteData.is_favorite,
        mood_rating: noteData.mood_rating,
        bible_reference: noteData.bible_reference,
        background_color: noteData.background_color,
      };

      const updatedNote = await updateGuestNote(noteData.id, updateData);
      if (!updatedNote) {
        console.error('Note not found');
        return null;
      }

      // Convert to Note format
      const note: Note = {
        id: updatedNote.id,
        user_id: updatedNote.user_id,
        title: updatedNote.title,
        content: updatedNote.content,
        category: updatedNote.category,
        tags: updatedNote.tags,
        is_private: updatedNote.is_private,
        is_favorite: updatedNote.is_favorite,
        mood_rating: updatedNote.mood_rating,
        bible_reference: updatedNote.bible_reference,
        background_color: updatedNote.background_color,
        created_at: updatedNote.created_at,
        updated_at: updatedNote.updated_at,
      };

      // Update local state
      setNotes(prev => prev.map(n => n.id === noteData.id ? note : n));
      return note;

    } catch (err) {
      console.error('Error updating note:', err);
      return null;
    }
  }, []);

  // Delete note
  const deleteNote = useCallback(async (noteId: string): Promise<boolean> => {
    try {
      // Delete from local storage
      const success = await deleteGuestNote(noteId);
      if (success) {
        // Update local state
        setNotes(prev => prev.filter(n => n.id !== noteId));
      }
      return success;
    } catch (err) {
      console.error('Error deleting note:', err);
      return false;
    }
  }, []);

  // Load notes on mount
  useEffect(() => {
    fetchNotes(0, false);
  }, [fetchNotes]);

  return {
    notes,
    loading,
    error,
    refetch,
    createNote,
    updateNote,
    deleteNote,
    loadMore,
    hasMore,
  };
}
