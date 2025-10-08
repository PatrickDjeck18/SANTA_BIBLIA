import { useState, useEffect, useCallback, useMemo } from 'react';
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

export function useNotesSimple() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchNotes = useCallback(async () => {
    if (!user?.uid) {
      console.log('❌ No user ID for fetching notes');
      setNotes([]);
      setLoading(false);
      return;
    }

    console.log('📖 Fetching notes for user:', user.uid);

    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.uid)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase error fetching notes:', error);
        console.error('❌ Fetch error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('✅ Notes fetched successfully:', data?.length || 0, 'notes');
      setNotes(data || []);
      setLoading(false);
    } catch (err: any) {
      console.error('❌ Error fetching notes:', err);
      setError(err.message || 'Failed to load notes');
      setLoading(false);
    }
  }, [user?.uid]);

  // Real-time listener for notes
  useEffect(() => {
    if (!user?.uid) {
      setNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Subscribe to notes changes
    const notesSubscription = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${user.uid}`,
        },
        (payload) => {
          console.log('Notes change received:', payload);
          fetchNotes();
        }
      )
      .subscribe();

    // Initial fetch
    fetchNotes();

    return () => {
      notesSubscription.unsubscribe();
    };
  }, [user?.uid, fetchNotes]);

  // Create a new note
  const createNote = useCallback(async (noteData: CreateNoteData): Promise<Note | null> => {
    if (!user?.uid) {
      console.error('❌ User not authenticated for note creation');
      setError('User not authenticated');
      return null;
    }

    console.log('📝 Creating note with data:', noteData);
    console.log('👤 User ID:', user.uid);

    try {
      setError(null);

      // First, ensure profile exists
      console.log('🔍 Ensuring profile exists for user:', user.uid);
      
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.uid)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking profile:', checkError);
      }

      if (!existingProfile) {
        console.log('👤 Creating profile for user:', user.uid);
        
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.uid,
            full_name: user?.displayName || null,
            email: user?.email || null,
          });

        if (profileError) {
          console.error('❌ Error creating profile:', profileError);
          // Continue anyway - maybe the constraint will be removed
        } else {
          console.log('✅ Profile created successfully');
        }
      } else {
        console.log('✅ Profile already exists');
      }

      // Now try to create the note
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

      if (error) {
        console.error('❌ Supabase error creating note:', error);
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // If it's a foreign key error, provide helpful message
        if (error.code === '23503') {
          console.error('❌ Foreign key constraint error. Please run the SQL script to fix this.');
          setError('Database constraint error. Please contact support or run the fix script.');
        }
        
        throw error;
      }

      console.log('✅ Note created successfully:', data);
      return data;
    } catch (err: any) {
      console.error('❌ Error creating note:', err);
      setError(err.message || 'Failed to create note');
      return null;
    }
  }, [user?.uid, user?.displayName, user?.email]);

  // Update an existing note
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

  // Delete a note
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

  // Client-side filtering functions
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
    fetchNotes();
  }, [fetchNotes]);

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    searchNotes,
    getNotesByCategory,
    getFavoriteNotes,
    getNotesStats,
    toggleFavorite,
    refetch,
  };
}
