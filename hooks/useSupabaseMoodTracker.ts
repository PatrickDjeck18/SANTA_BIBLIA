import { useEffect, useState, useMemo, useCallback } from 'react';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { emitMoodEntrySaved } from '@/lib/eventEmitter';

// --- Supabase Data Models ---
export interface MoodEntry {
  id: string;
  user_id: string;
  entry_date: string;
  mood_id: string | null;
  mood_type: string | null;
  intensity_rating: number;
  emoji: string;
  note: string | null;
  verse_reference?: string | null;
  verse_text?: string | null;
  verse_explanation?: string | null;
  verse_application?: string | null;
  verse_mood_alignment?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MoodOption {
  id: string;
  name: string;
  label: string;
  emoji: string;
  description: string | null;
  color_gradient: string[];
  category_name: string;
  category_display_name: string;
  category_color: string;
}

export interface WeeklyMoodData {
  date: string;
  mood: string | null;
  mood_id: string | null;
  rating: number | null;
  emoji: string | null;
}

export interface MoodStats {
  totalEntries: number;
  currentStreak: number;
  averageWeekly: number;
  todaysMood: MoodEntry | null;
  weeklyData: WeeklyMoodData[];
  monthlyTrend: MoodEntry[];
}

export function useSupabaseMoodTracker() {
  const { user } = useAuth();
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [moodOptions, setMoodOptions] = useState<MoodOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load mood options - using hardcoded options for now
  useEffect(() => {
    const loadMoodOptions = async () => {
      try {
        // Use hardcoded mood options since we don't have the moods table set up
        const hardcodedMoodOptions: MoodOption[] = [
          { id: 'positive_001_blessed', name: 'Blessed', label: '🙏 Blessed', emoji: '🙏', description: null, color_gradient: ['#F59E0B', '#D97706', '#B45309'], category_name: 'positive', category_display_name: 'Positive', category_color: '#22C55E' },
          { id: 'positive_002_happy', name: 'Happy', label: '😊 Happy', emoji: '😊', description: null, color_gradient: ['#22C55E', '#16A34A', '#15803D'], category_name: 'positive', category_display_name: 'Positive', category_color: '#22C55E' },
          { id: 'positive_003_joyful', name: 'Joyful', label: '😄 Joyful', emoji: '😄', description: null, color_gradient: ['#22C55E', '#16A34A', '#15803D'], category_name: 'positive', category_display_name: 'Positive', category_color: '#22C55E' },
          { id: 'positive_004_grateful', name: 'Grateful', label: '🙏 Grateful', emoji: '🙏', description: null, color_gradient: ['#22C55E', '#16A34A', '#15803D'], category_name: 'positive', category_display_name: 'Positive', category_color: '#22C55E' },
          { id: 'positive_005_excited', name: 'Excited', label: '🤩 Excited', emoji: '🤩', description: null, color_gradient: ['#F59E0B', '#D97706', '#B45309'], category_name: 'positive', category_display_name: 'Positive', category_color: '#22C55E' },
          { id: 'positive_006_loved', name: 'Loved', label: '💕 Loved', emoji: '💕', description: null, color_gradient: ['#EC4899', '#DB2777', '#BE185D'], category_name: 'positive', category_display_name: 'Positive', category_color: '#22C55E' },
          { id: 'positive_007_proud', name: 'Proud', label: '🏆 Proud', emoji: '🏆', description: null, color_gradient: ['#22C55E', '#16A34A', '#15803D'], category_name: 'positive', category_display_name: 'Positive', category_color: '#22C55E' },
          { id: 'calm_001_peaceful', name: 'Peaceful', label: '😇 Peaceful', emoji: '😇', description: null, color_gradient: ['#8B5CF6', '#7C3AED', '#6D28D9'], category_name: 'calm', category_display_name: 'Calm', category_color: '#8B5CF6' },
          { id: 'calm_002_calm', name: 'Calm', label: '😌 Calm', emoji: '😌', description: null, color_gradient: ['#8B5CF6', '#7C3AED', '#6D28D9'], category_name: 'calm', category_display_name: 'Calm', category_color: '#8B5CF6' },
          { id: 'calm_003_content', name: 'Content', label: '😊 Content', emoji: '😊', description: null, color_gradient: ['#8B5CF6', '#7C3AED', '#6D28D9'], category_name: 'calm', category_display_name: 'Calm', category_color: '#8B5CF6' },
          { id: 'calm_004_prayerful', name: 'Prayerful', label: '🙏 Prayerful', emoji: '🙏', description: null, color_gradient: ['#8B5CF6', '#7C3AED', '#6D28D9'], category_name: 'calm', category_display_name: 'Calm', category_color: '#8B5CF6' },
          { id: 'energetic_001_motivated', name: 'Motivated', label: '💪 Motivated', emoji: '💪', description: null, color_gradient: ['#22C55E', '#16A34A', '#15803D'], category_name: 'energetic', category_display_name: 'Energetic', category_color: '#22C55E' },
          { id: 'energetic_002_focused', name: 'Focused', label: '🎯 Focused', emoji: '🎯', description: null, color_gradient: ['#8B5CF6', '#7C3AED', '#6D28D9'], category_name: 'energetic', category_display_name: 'Energetic', category_color: '#22C55E' },
          { id: 'energetic_003_creative', name: 'Creative', label: '🎨 Creative', emoji: '🎨', description: null, color_gradient: ['#8B5CF6', '#7C3AED', '#6D28D9'], category_name: 'energetic', category_display_name: 'Energetic', category_color: '#22C55E' },
          { id: 'energetic_004_inspired', name: 'Inspired', label: '✨ Inspired', emoji: '✨', description: null, color_gradient: ['#EC4899', '#DB2777', '#BE185D'], category_name: 'energetic', category_display_name: 'Energetic', category_color: '#22C55E' },
          { id: 'energetic_005_accomplished', name: 'Accomplished', label: '🎉 Accomplished', emoji: '🎉', description: null, color_gradient: ['#22C55E', '#16A34A', '#15803D'], category_name: 'energetic', category_display_name: 'Energetic', category_color: '#22C55E' },
          { id: 'challenging_001_sad', name: 'Sad', label: '😢 Sad', emoji: '😢', description: null, color_gradient: ['#8B5CF6', '#7C3AED', '#6D28D9'], category_name: 'challenging', category_display_name: 'Challenging', category_color: '#8B5CF6' },
          { id: 'challenging_002_worried', name: 'Worried', label: '😟 Worried', emoji: '😟', description: null, color_gradient: ['#8B5CF6', '#7C3AED', '#6D28D9'], category_name: 'challenging', category_display_name: 'Challenging', category_color: '#8B5CF6' },
          { id: 'challenging_003_stressed', name: 'Stressed', label: '😤 Stressed', emoji: '😤', description: null, color_gradient: ['#EC4899', '#DB2777', '#BE185D'], category_name: 'challenging', category_display_name: 'Challenging', category_color: '#8B5CF6' },
          { id: 'challenging_004_anxious', name: 'Anxious', label: '😰 Anxious', emoji: '😰', description: null, color_gradient: ['#EF4444', '#DC2626', '#B91C1C'], category_name: 'challenging', category_display_name: 'Challenging', category_color: '#8B5CF6' },
          { id: 'challenging_005_frustrated', name: 'Frustrated', label: '😠 Frustrated', emoji: '😠', description: null, color_gradient: ['#F59E0B', '#D97706', '#B45309'], category_name: 'challenging', category_display_name: 'Challenging', category_color: '#8B5CF6' },
          { id: 'challenging_006_lonely', name: 'Lonely', label: '😔 Lonely', emoji: '😔', description: null, color_gradient: ['#8B5CF6', '#7C3AED', '#6D28D9'], category_name: 'challenging', category_display_name: 'Challenging', category_color: '#8B5CF6' },
          { id: 'challenging_007_overwhelmed', name: 'Overwhelmed', label: '😵 Overwhelmed', emoji: '😵', description: null, color_gradient: ['#8B5CF6', '#7C3AED', '#6D28D9'], category_name: 'challenging', category_display_name: 'Challenging', category_color: '#8B5CF6' },
          { id: 'challenging_008_confused', name: 'Confused', label: '😕 Confused', emoji: '😕', description: null, color_gradient: ['#F59E0B', '#D97706', '#B45309'], category_name: 'challenging', category_display_name: 'Challenging', category_color: '#8B5CF6' },
          { id: 'curious_001_curious', name: 'Curious', label: '🤔 Curious', emoji: '🤔', description: null, color_gradient: ['#F59E0B', '#D97706', '#B45309'], category_name: 'curious', category_display_name: 'Curious', category_color: '#F59E0B' },
          { id: 'curious_002_surprised', name: 'Surprised', label: '😮 Surprised', emoji: '😮', description: null, color_gradient: ['#F59E0B', '#D97706', '#B45309'], category_name: 'curious', category_display_name: 'Curious', category_color: '#F59E0B' },
          { id: 'curious_003_hopeful', name: 'Hopeful', label: '🌟 Hopeful', emoji: '🌟', description: null, color_gradient: ['#F59E0B', '#D97706', '#B45309'], category_name: 'curious', category_display_name: 'Curious', category_color: '#F59E0B' },
          { id: 'spiritual_001_connected', name: 'Connected', label: '🤝 Connected', emoji: '🤝', description: null, color_gradient: ['#22C55E', '#16A34A', '#15803D'], category_name: 'spiritual', category_display_name: 'Spiritual', category_color: '#8B5CF6' },
          { id: 'spiritual_002_faithful', name: 'Faithful', label: '✝️ Faithful', emoji: '✝️', description: null, color_gradient: ['#EC4899', '#DB2777', '#BE185D'], category_name: 'spiritual', category_display_name: 'Spiritual', category_color: '#8B5CF6' },
          { id: 'spiritual_003_reflective', name: 'Reflective', label: '🤲 Reflective', emoji: '🤲', description: null, color_gradient: ['#8B5CF6', '#7C3AED', '#6D28D9'], category_name: 'spiritual', category_display_name: 'Spiritual', category_color: '#8B5CF6' },
          { id: 'health_001_healthy', name: 'Healthy', label: '💚 Healthy', emoji: '💚', description: null, color_gradient: ['#22C55E', '#16A34A', '#15803D'], category_name: 'health', category_display_name: 'Health', category_color: '#22C55E' },
          { id: 'health_002_rested', name: 'Rested', label: '😴 Rested', emoji: '😴', description: null, color_gradient: ['#8B5CF6', '#7C3AED', '#6D28D9'], category_name: 'health', category_display_name: 'Health', category_color: '#22C55E' },
          { id: 'health_003_balanced', name: 'Balanced', label: '⚖️ Balanced', emoji: '⚖️', description: null, color_gradient: ['#EC4899', '#DB2777', '#BE185D'], category_name: 'health', category_display_name: 'Health', category_color: '#22C55E' }
        ];

        setMoodOptions(hardcodedMoodOptions);
        console.log('🔴 SUPABASE MOOD: Loaded hardcoded mood options:', hardcodedMoodOptions.length);
      } catch (error) {
        console.error('Error loading mood options:', error);
      }
    };

    loadMoodOptions();
  }, []);

  // Real-time listener for mood entries
  useEffect(() => {
    if (!user || !user.uid) {
      console.log('🔴 SUPABASE MOOD: No user or user.uid, clearing entries');
      setMoodEntries([]);
      setLoading(false);
      return;
    }

    console.log('🔴 SUPABASE MOOD: User authenticated:', user.uid);
    setLoading(true);
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const subscription = supabase
      .channel('mood_entries_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mood_entries',
          filter: `user_id=eq.${user.uid}`
        },
        async (payload) => {
          console.log('🔴 SUPABASE MOOD: Real-time update:', payload);

          // Reload all mood entries - use direct table query instead of view
          const queryPromise = supabase
            .from('mood_entries')
            .select('*')
            .eq('user_id', user.uid)
            .order('created_at', { ascending: false });
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Real-time reload timeout')), 5000)
          );
          const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
            
          // Log verse data for debugging
          if (data && data.length > 0) {
            console.log('🔴 SUPABASE MOOD: Real-time verse data check:', data.slice(0, 2).map((entry: any) => ({
              id: entry.id,
              hasVerse: !!(entry.verse_reference && entry.verse_text),
              verse_reference: entry.verse_reference
            })));
          }

        if (error) {
          console.error('Error reloading mood entries:', error);
          // If timeout, don't update entries
          if (error.message === 'Real-time reload timeout') {
            console.warn('🔴 SUPABASE MOOD: Real-time reload timed out, keeping existing data');
          }
          return;
        }

        console.log('🔴 SUPABASE MOOD: Reloaded entries:', data?.length);
        if (data && data.length > 0) {
          console.log('🔴 SUPABASE MOOD: Sample entry timestamps:', data.slice(0, 3).map((entry: any) => ({
            id: entry.id,
            created_at: entry.created_at,
            created_at_type: typeof entry.created_at,
            mood_type: entry.mood_type
          })));
        }
        setMoodEntries((data as MoodEntry[]) || []);
        }
      )
      .subscribe();

    // Initial load
    const loadMoodEntries = async () => {
      try {
        console.log('🔴 SUPABASE MOOD: Loading mood entries for user:', user.uid);
        const queryPromise = supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', user.uid)
          .order('created_at', { ascending: false });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Mood entries query timeout')), 10000)
        );
        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
          
        // Log verse data for debugging
        if (data && data.length > 0) {
          console.log('🔴 SUPABASE MOOD: Verse data check:', data.slice(0, 2).map((entry: any) => ({
            id: entry.id,
            hasVerse: !!(entry.verse_reference && entry.verse_text),
            verse_reference: entry.verse_reference,
            verse_text_length: entry.verse_text?.length || 0
          })));
        }

        if (error) {
          console.error('Error loading mood entries:', error);
          setMoodEntries([]);
        } else {
          console.log('🔴 SUPABASE MOOD: Initial load entries:', data?.length);
          if (data && data.length > 0) {
            console.log('🔴 SUPABASE MOOD: Initial sample timestamps:', data.slice(0, 3).map((entry: any) => ({
              id: entry.id,
              created_at: entry.created_at,
              created_at_type: typeof entry.created_at,
              mood_type: entry.mood_type
            })));
          }
          setMoodEntries((data as MoodEntry[]) || []);
        }
      } catch (error: any) {
        console.error('Error loading mood entries:', error);
        // If timeout or network error, set empty entries but don't fail completely
        if (error.message === 'Mood entries query timeout') {
          console.warn('🔴 SUPABASE MOOD: Query timed out, using empty entries');
        }
        setMoodEntries([]);
      } finally {
        setLoading(false);
      }
    };

    loadMoodEntries();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const saveMoodEntry = useCallback(async (
    mood: string,
    rating: number,
    influences: string[],
    note: string,
    verse?: {
      reference: string;
      text: string;
      explanation: string;
      application?: string;
      moodAlignment?: string;
    }
  ): Promise<{ data: MoodEntry | null; error: any }> => {
    console.log('🔴 SUPABASE MOOD: saveMoodEntry called with:', { mood, rating, influences, note, verse });
    console.log('🔴 SUPABASE MOOD: User:', user);
    console.log('🔴 SUPABASE MOOD: Supabase client:', supabase);

    if (!user) {
      console.log('🔴 SUPABASE MOOD: User not authenticated');
      return { data: null, error: 'User not authenticated' };
    }

    try {
      setSaving(true);
      const today = new Date().toISOString().split('T')[0];
      console.log('🔴 SUPABASE MOOD: Today date:', today);

      // For now, use a simple mood mapping since we don't have the moods table set up
      const moodMapping: Record<string, { id: string; emoji: string; label: string }> = {
        'Blessed': { id: 'positive_001_blessed', emoji: '🙏', label: 'Blessed' },
        'Happy': { id: 'positive_002_happy', emoji: '😊', label: 'Happy' },
        'Joyful': { id: 'positive_003_joyful', emoji: '😄', label: 'Joyful' },
        'Grateful': { id: 'positive_004_grateful', emoji: '🙏', label: 'Grateful' },
        'Excited': { id: 'positive_005_excited', emoji: '🤩', label: 'Excited' },
        'Loved': { id: 'positive_006_loved', emoji: '💕', label: 'Loved' },
        'Proud': { id: 'positive_007_proud', emoji: '🏆', label: 'Proud' },
        'Peaceful': { id: 'calm_001_peaceful', emoji: '😇', label: 'Peaceful' },
        'Calm': { id: 'calm_002_calm', emoji: '😌', label: 'Calm' },
        'Content': { id: 'calm_003_content', emoji: '😊', label: 'Content' },
        'Prayerful': { id: 'calm_004_prayerful', emoji: '🙏', label: 'Prayerful' },
        'Motivated': { id: 'energetic_001_motivated', emoji: '💪', label: 'Motivated' },
        'Focused': { id: 'energetic_002_focused', emoji: '🎯', label: 'Focused' },
        'Creative': { id: 'energetic_003_creative', emoji: '🎨', label: 'Creative' },
        'Inspired': { id: 'energetic_004_inspired', emoji: '✨', label: 'Inspired' },
        'Accomplished': { id: 'energetic_005_accomplished', emoji: '🎉', label: 'Accomplished' },
        'Sad': { id: 'challenging_001_sad', emoji: '😢', label: 'Sad' },
        'Worried': { id: 'challenging_002_worried', emoji: '😟', label: 'Worried' },
        'Stressed': { id: 'challenging_003_stressed', emoji: '😤', label: 'Stressed' },
        'Anxious': { id: 'challenging_004_anxious', emoji: '😰', label: 'Anxious' },
        'Frustrated': { id: 'challenging_005_frustrated', emoji: '😠', label: 'Frustrated' },
        'Lonely': { id: 'challenging_006_lonely', emoji: '😔', label: 'Lonely' },
        'Overwhelmed': { id: 'challenging_007_overwhelmed', emoji: '😵', label: 'Overwhelmed' },
        'Confused': { id: 'challenging_008_confused', emoji: '😕', label: 'Confused' },
        'Curious': { id: 'curious_001_curious', emoji: '🤔', label: 'Curious' },
        'Surprised': { id: 'curious_002_surprised', emoji: '😮', label: 'Surprised' },
        'Hopeful': { id: 'curious_003_hopeful', emoji: '🌟', label: 'Hopeful' },
        'Connected': { id: 'spiritual_001_connected', emoji: '🤝', label: 'Connected' },
        'Faithful': { id: 'spiritual_002_faithful', emoji: '✝️', label: 'Faithful' },
        'Reflective': { id: 'spiritual_003_reflective', emoji: '🤲', label: 'Reflective' },
        'Healthy': { id: 'health_001_healthy', emoji: '💚', label: 'Healthy' },
        'Rested': { id: 'health_002_rested', emoji: '😴', label: 'Rested' },
        'Balanced': { id: 'health_003_balanced', emoji: '⚖️', label: 'Balanced' }
      };

      const moodData = moodMapping[mood];
      if (!moodData) {
        console.log('🔴 SUPABASE MOOD: Invalid mood selected:', mood);
        return { data: null, error: 'Invalid mood selected' };
      }

      console.log('🔴 SUPABASE MOOD: Found mood data:', moodData);

      // Always create new entry to allow multiple moods per day
      console.log('🔴 SUPABASE MOOD: Creating new mood entry');
      // Add a small delay to ensure unique timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      const currentTime = new Date().toISOString();
      // Build insert object - only include verse fields if verse is provided
      const insertData: any = {
        user_id: user.uid,
        entry_date: today,
        mood_id: moodData.id,
        mood_type: moodData.label,
        intensity_rating: rating,
        emoji: moodData.emoji,
        note: note || null,
        created_at: currentTime,
        updated_at: currentTime,
      };

      // Only add verse fields if verse is provided
      if (verse) {
        insertData.verse_reference = verse.reference || null;
        insertData.verse_text = verse.text || null;
        insertData.verse_explanation = verse.explanation || null;
        insertData.verse_application = verse.application || null;
        insertData.verse_mood_alignment = verse.moodAlignment || null;
        console.log('🔴 SUPABASE MOOD: Adding verse data to insert:', {
          reference: verse.reference,
          textLength: verse.text?.length,
          hasExplanation: !!verse.explanation
        });
      } else {
        console.log('🔴 SUPABASE MOOD: No verse data provided');
      }

      console.log('🔴 SUPABASE MOOD: Insert data being sent:', {
        ...insertData,
        verse_text: insertData.verse_text ? `${insertData.verse_text.substring(0, 50)}...` : null
      });

      // Explicitly select all fields including verse fields
      const { data: newData, error: insertError } = await supabase
        .from('mood_entries')
        .insert(insertData)
        .select('*, verse_reference, verse_text, verse_explanation, verse_application, verse_mood_alignment')
        .single();
        
      console.log('🔴 SUPABASE MOOD: Insert response:', {
        success: !!newData,
        error: insertError?.message,
        returnedData: newData ? {
          id: newData.id,
          verse_reference: (newData as any).verse_reference,
          verse_text: (newData as any).verse_text?.substring(0, 50)
        } : null
      });

      if (insertError) {
        console.error('🔴 SUPABASE MOOD: Error creating mood entry:', insertError);
        console.error('🔴 SUPABASE MOOD: Insert error details:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        });
        
        // If error is about missing columns, try inserting without verse fields
        if (insertError.message && (
          insertError.message.includes('verse_reference') ||
          insertError.message.includes('verse_text') ||
          insertError.message.includes('column') ||
          insertError.code === '42703' // undefined_column
        )) {
          console.error('❌ SUPABASE MOOD: VERSE COLUMNS DO NOT EXIST IN DATABASE!');
          console.error('❌ SUPABASE MOOD: Verse data was provided but cannot be saved:', {
            reference: verse?.reference,
            textLength: verse?.text?.length,
            explanation: verse?.explanation?.substring(0, 50)
          });
          console.error('❌ SUPABASE MOOD: Please run the migration: supabase/migrations/20250101000000_add_verse_to_mood_entries.sql');
          
          // Save without verse fields as fallback
          const insertDataWithoutVerse = { ...insertData };
          delete insertDataWithoutVerse.verse_reference;
          delete insertDataWithoutVerse.verse_text;
          delete insertDataWithoutVerse.verse_explanation;
          delete insertDataWithoutVerse.verse_application;
          delete insertDataWithoutVerse.verse_mood_alignment;
          
          const { data: retryData, error: retryError } = await supabase
            .from('mood_entries')
            .insert(insertDataWithoutVerse)
            .select()
            .single();
            
          if (retryError) {
            console.error('🔴 SUPABASE MOOD: Retry also failed:', retryError);
            return { data: null, error: retryError };
          }
          
          // Return error message indicating verse wasn't saved
          const errorMessage = 'Mood saved, but verse was not saved because database columns are missing. Please run the migration.';
          console.warn('⚠️ SUPABASE MOOD: Mood saved without verse fields');
          return { 
            data: retryData as MoodEntry, 
            error: { message: errorMessage, code: 'MIGRATION_NEEDED' } as any
          };
        }
        
        return { data: null, error: insertError };
      }

      const result = newData as MoodEntry;
      console.log('🔴 SUPABASE MOOD: Created new entry:', {
        id: result.id,
        mood_type: result.mood_type,
        verse_reference: (result as any).verse_reference,
        verse_text: (result as any).verse_text ? `${(result as any).verse_text.substring(0, 50)}...` : null,
        hasVerse: !!(result as any).verse_reference && !!(result as any).verse_text
      });

      // Handle influences if provided
      if (influences.length > 0) {
        await handleInfluences(result.id, influences);
      }

      // Emit event for real-time updates
      emitMoodEntrySaved(result);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('moodEntrySaved', {
          detail: { moodEntry: result, timestamp: Date.now() }
        }));
      }

      return { data: result, error: null };
    } catch (error) {
      console.error('Error saving mood entry:', error);
      return { data: null, error };
    } finally {
      setSaving(false);
    }
  }, [user]);

  const handleInfluences = async (moodEntryId: string, influences: string[]) => {
    // Delete existing influences
    const { error: deleteError } = await supabase
      .from('mood_influences')
      .delete()
      .eq('mood_entry_id', moodEntryId);

    if (deleteError) {
      console.error('Error deleting existing influences:', deleteError);
      return;
    }

    // Insert new influences
    if (influences.length > 0) {
      const influenceInserts = influences.map(influence => ({
        mood_entry_id: moodEntryId,
        influence_name: influence,
        influence_category: getInfluenceCategory(influence),
      }));

      const { error: insertError } = await supabase
        .from('mood_influences')
        .insert(influenceInserts);

      if (insertError) {
        console.error('Error inserting influences:', insertError);
      }
    }
  };

  const getInfluenceCategory = (influence: string): string => {
    const spiritual = ['Prayer Time', 'Bible Reading', 'Worship', 'Church', 'Meditation', 'Fellowship'];
    const social = ['Family', 'Friends', 'Relationships', 'Community'];
    const physical = ['Health', 'Exercise', 'Sleep', 'Nutrition'];
    const emotional = ['Gratitude', 'Achievement', 'Challenges', 'Stress', 'Anxiety'];
    const environmental = ['Weather', 'Nature', 'Travel'];
    const work = ['Work', 'School', 'Finances', 'Career'];

    if (spiritual.includes(influence)) return 'spiritual';
    if (social.includes(influence)) return 'social';
    if (physical.includes(influence)) return 'physical';
    if (emotional.includes(influence)) return 'emotional';
    if (environmental.includes(influence)) return 'environmental';
    if (work.includes(influence)) return 'work';

    return 'other';
  };

  const deleteMoodEntry = useCallback(async (entryId: string): Promise<{ error: any }> => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('mood_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user.uid);

      if (error) {
        console.error('Error deleting mood entry:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Error deleting mood entry:', error);
      return { error };
    }
  }, [user]);

  const getTodaysMood = useCallback((): MoodEntry | null => {
    const today = new Date().toISOString().split('T')[0];
    return moodEntries.find(entry => entry.entry_date === today) || null;
  }, [moodEntries]);

  const getWeeklyMoodData = useCallback((): WeeklyMoodData[] => {
    const weekData: WeeklyMoodData[] = [];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateString = date.toISOString().split('T')[0];

      const entry = moodEntries.find(e => e.entry_date === dateString);
      weekData.push({
        date: dateString,
        mood: entry?.mood_type || null,
        mood_id: entry?.mood_id || null,
        rating: entry?.intensity_rating || null,
        emoji: entry?.emoji || null,
      });
    }
    return weekData;
  }, [moodEntries]);

  const getAverageWeeklyMood = useCallback((): number => {
    const weekData = getWeeklyMoodData();
    const validRatings = weekData.filter(d => d.rating !== null).map(d => d.rating!);
    if (validRatings.length === 0) return 0;
    const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
    const average = Math.round((sum / validRatings.length) * 10) / 10;
    return average;
  }, [getWeeklyMoodData]);

  const getCurrentStreak = useCallback((): number => {
    let streak = 0;
    const sortedEntries = [...moodEntries].sort((a, b) =>
      new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
    );
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date(today);

    for (const entry of sortedEntries) {
      const entryDate = currentDate.toISOString().split('T')[0];
      if (entry.entry_date === entryDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [moodEntries]);

  const getMonthlyTrend = useCallback((): MoodEntry[] => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return moodEntries.filter(entry => new Date(entry.entry_date) >= thirtyDaysAgo);
  }, [moodEntries]);

  const moodStats: MoodStats = useMemo(() => {
    return {
      totalEntries: moodEntries.length,
      currentStreak: getCurrentStreak(),
      averageWeekly: getAverageWeeklyMood(),
      todaysMood: getTodaysMood(),
      weeklyData: getWeeklyMoodData(),
      monthlyTrend: getMonthlyTrend(),
    };
  }, [moodEntries, getCurrentStreak, getAverageWeeklyMood, getTodaysMood, getWeeklyMoodData, getMonthlyTrend]);

  const refetch = useCallback(async () => {
    if (!user || !user.uid) {
      console.log('🔴 SUPABASE MOOD: No user or user.uid for refetch');
      return;
    }

    // Prevent multiple simultaneous refetches
    if (loading) {
      console.log('🔴 SUPABASE MOOD: Already loading, skipping refetch');
      return;
    }

    setLoading(true);
    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      console.log('🔴 SUPABASE MOOD: Refetching mood entries for user:', user.uid);
      const queryPromise = supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.uid)
        .gte('entry_date', ninetyDaysAgo.toISOString().split('T')[0])
        .order('created_at', { ascending: false });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Refetch query timeout')), 10000)
      );
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error refetching mood entries:', error);
        throw error;
      } else {
        setMoodEntries((data as MoodEntry[]) || []);
        console.log('🔴 SUPABASE MOOD: Refetch completed successfully');
      }
    } catch (error: any) {
      console.error('Error refetching mood entries:', error);
      // If timeout, don't throw but log warning
      if (error.message === 'Refetch query timeout') {
        console.warn('🔴 SUPABASE MOOD: Refetch timed out, keeping existing data');
      } else {
        // Don't throw the error to prevent crashes
      }
    } finally {
      setLoading(false);
    }
  }, [user, loading]);

  return {
    moodEntries,
    loading,
    saving,
    moodOptions,
    saveMoodEntry,
    deleteMoodEntry,
    moodStats,
    refetch,
  };
}