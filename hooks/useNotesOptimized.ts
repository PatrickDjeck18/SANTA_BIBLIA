import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

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

// Cache for profile existence checks
const profileCache = new Map<string, boolean>();

export function useNotesOptimized() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const { user } = useAuth();
  
  const PAGE_SIZE = 20; // Load notes in batches
  const notesRef = useRef<Note[]>([]);
  const subscriptionRef = useRef<any>(null);

  // Optimized profile check with caching
  const ensureProfile = useCallback(async (userId: string): Promise<boolean> => {
    if (profileCache.has(userId)) {
      return profileCache.get(userId)!;
    }

    try {
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingProfile) {
        profileCache.set(userId, true);
        return true;
      }

      // Create profile if it doesn't exist
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          full_name: user?.displayName || null,
          email: user?.email || null,
        });

      if (insertError) {
        console.error('Profile creation error:', insertError);
        profileCache.set(userId, false);
        return false;
      }

      profileCache.set(userId, true);
      return true;
    } catch (err) {
      console.error('Error ensuring profile:', err);
      profileCache.set(userId, false);
      return false;
    }
  }, [user?.displayName, user?.email]);

  // Optimized fetch with pagination
  const fetchNotes = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    if (!user?.uid) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      if (pageNum === 0) {
        setLoading(true);
      }

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.uid)
        .order('updated_at', { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      if (error) throw error;

      if (append) {
        const newNotes = [...notesRef.current, ...(data || [])];
        setNotes(newNotes);
        notesRef.current = newNotes;
      } else {
        setNotes(data || []);
        notesRef.current = data || [];
      }

      setHasMore((data?.length || 0) === PAGE_SIZE);
      setPage(pageNum);
    } catch (err: any) {
      console.error('Error fetching notes:', err);
      setError(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Load more notes
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchNotes(page + 1, true);
    }
  }, [loading, hasMore, page, fetchNotes]);

  // Optimized real-time subscription
  useEffect(() => {
    if (!user?.uid) {
      setNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Unsubscribe from previous subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    // Create optimized real-time subscription
    subscriptionRef.current = supabase
      .channel('notes-changes-optimized')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${user.uid}`,
        },
        (payload) => {
          console.log('Notes change received:', payload.eventType);
          
          // Optimized handling based on event type
          switch (payload.eventType) {
            case 'INSERT':
              // Add new note to the beginning
              setNotes(prev => [payload.new as Note, ...prev]);
              notesRef.current = [payload.new as Note, ...notesRef.current];
              break;
              
            case 'UPDATE':
              // Update existing note
              setNotes(prev => 
                prev.map(note => 
                  note.id === payload.new.id ? { ...note, ...payload.new } : note
                )
              );
              notesRef.current = notesRef.current.map(note => 
                note.id === payload.new.id ? { ...note, ...payload.new } : note
              );
              break;
              
            case 'DELETE':
              // Remove deleted note
              setNotes(prev => prev.filter(note => note.id !== payload.old.id));
              notesRef.current = notesRef.current.filter(note => note.id !== payload.old.id);
              break;
              
            default:
              // Fallback to full refresh for unknown events
              fetchNotes(0, false);
          }
        }
      )
      .subscribe();

    // Initial fetch
    fetchNotes(0, false);

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [user?.uid, fetchNotes]);

  // Optimized note creation
  const createNote = useCallback(async (noteData: CreateNoteData): Promise<Note | null> => {
    if (!user?.uid) {
      setError('User not authenticated');
      return null;
    }

    try {
      setError(null);

      // Ensure profile exists (cached)
      const profileExists = await ensureProfile(user.uid);
      if (!profileExists) {
        throw new Error('Failed to create or verify user profile');
      }

      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.uid,
          title: noteData.title,
          content: noteData.content,
          category: noteData.category || 'reflection',
          tags: noteData.tags || [],
          is_private: noteData.is_private ?? true,
          is_favorite: noteData.is_favorite ?? false,
          mood_rating: noteData.mood_rating || null,
          bible_reference: noteData.bible_reference || null,
          background_color: noteData.background_color || '#ffffff',
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (err: any) {
      console.error('Error creating note:', err);
      setError(err.message || 'Failed to create note');
      return null;
    }
  }, [user?.uid, ensureProfile]);

  // Optimized note update
  const updateNote = useCallback(async (noteData: UpdateNoteData): Promise<Note | null> => {
    if (!user?.uid) {
      setError('User not authenticated');
      return null;
    }

    try {
      setError(null);

      const { data, error } = await supabase
        .from('notes')
        .update({
          ...noteData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteData.id)
        .eq('user_id', user.uid)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (err: any) {
      console.error('Error updating note:', err);
      setError(err.message || 'Failed to update note');
      return null;
    }
  }, [user?.uid]);

  // Optimized note deletion
  const deleteNote = useCallback(async (noteId: string): Promise<boolean> => {
    if (!user?.uid) {
      setError('User not authenticated');
      return false;
    }

    try {
      setError(null);

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.uid);

      if (error) throw error;

      return true;
    } catch (err: any) {
      console.error('Error deleting note:', err);
      setError(err.message || 'Failed to delete note');
      return false;
    }
  }, [user?.uid]);

  // Optimized search with debouncing (implemented in component)
  const searchNotes = useCallback((
    searchTerm: string,
    category?: string,
    favoriteOnly: boolean = false
  ): Note[] => {
    let filteredNotes = notes;

    if (category) {
      filteredNotes = filteredNotes.filter(note => note.category === category);
    }
    
    if (favoriteOnly) {
      filteredNotes = filteredNotes.filter(note => note.is_favorite);
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filteredNotes = filteredNotes.filter(note =>
        note.title.toLowerCase().includes(lowerSearchTerm) ||
        note.content.toLowerCase().includes(lowerSearchTerm) ||
        note.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
      );
    }

    return filteredNotes;
  }, [notes]);

  // Memoized utility functions
  const getNotesByCategory = useCallback((category: Note['category']): Note[] => {
    return notes.filter(note => note.category === category);
  }, [notes]);

  const getFavoriteNotes = useCallback((): Note[] => {
    return notes.filter(note => note.is_favorite);
  }, [notes]);

  const getNotesStats = useMemo(() => {
    if (notes.length === 0) return null;

    const totalNotes = notes.length;
    const favoriteCount = notes.filter(note => note.is_favorite).length;
    const categoryCounts = notes.reduce((acc, note) => {
      acc[note.category] = (acc[note.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalNotes, favoriteCount, categoryCounts };
  }, [notes]);

  const toggleFavorite = useCallback(async (noteId: string): Promise<boolean> => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return false;

    const updated = await updateNote({
      id: noteId,
      is_favorite: !note.is_favorite,
    });

    return updated !== null;
  }, [notes, updateNote]);

  const refetch = useCallback(() => {
    setLoading(true);
    fetchNotes(0, false);
  }, [fetchNotes]);

  return {
    notes,
    loading,
    error,
    hasMore,
    createNote,
    updateNote,
    deleteNote,
    searchNotes,
    getNotesByCategory,
    getFavoriteNotes,
    getNotesStats,
    toggleFavorite,
    loadMore,
    refetch,
  };
}