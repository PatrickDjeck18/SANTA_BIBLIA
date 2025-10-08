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

  // Load mood options from the moods table
  useEffect(() => {
    const loadMoodOptions = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_all_active_moods');

        if (error) {
          console.error('Error loading mood options:', error);
          return;
        }

        setMoodOptions(data || []);
      } catch (error) {
        console.error('Error loading mood options:', error);
      }
    };

    loadMoodOptions();
  }, []);

  // Real-time listener for mood entries
  useEffect(() => {
    if (!user) {
      setMoodEntries([]);
      setLoading(false);
      return;
    }

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
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('🔴 SUPABASE MOOD: Real-time update:', payload);

          // Reload all mood entries
          const { data, error } = await supabase
            .from('mood_entries_with_details')
            .select('*')
            .eq('user_id', user.id)
            .gte('entry_date', ninetyDaysAgo.toISOString().split('T')[0])
            .order('entry_date', { ascending: false });

          if (error) {
            console.error('Error reloading mood entries:', error);
            return;
          }

          setMoodEntries((data as MoodEntry[]) || []);
        }
      )
      .subscribe();

    // Initial load
    const loadMoodEntries = async () => {
      try {
        const { data, error } = await supabase
          .from('mood_entries_with_details')
          .select('*')
          .eq('user_id', user.id)
          .gte('entry_date', ninetyDaysAgo.toISOString().split('T')[0])
          .order('entry_date', { ascending: false });

        if (error) {
          console.error('Error loading mood entries:', error);
          setMoodEntries([]);
        } else {
          setMoodEntries((data as MoodEntry[]) || []);
        }
      } catch (error) {
        console.error('Error loading mood entries:', error);
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
    note: string
  ): Promise<{ data: MoodEntry | null; error: any }> => {
    console.log('🔴 SUPABASE MOOD: saveMoodEntry called with:', { mood, rating, influences, note });

    if (!user) {
      console.log('🔴 SUPABASE MOOD: User not authenticated');
      return { data: null, error: 'User not authenticated' };
    }

    try {
      setSaving(true);
      const today = new Date().toISOString().split('T')[0];
      console.log('🔴 SUPABASE MOOD: Today date:', today);

      // Find the mood by name or label
      const { data: moodData, error: moodError } = await supabase
        .rpc('get_mood_by_name_or_id', { mood_input: mood });

      if (moodError || !moodData || moodData.length === 0) {
        console.log('🔴 SUPABASE MOOD: Invalid mood selected:', mood);
        return { data: null, error: 'Invalid mood selected' };
      }

      console.log('🔴 SUPABASE MOOD: Found mood data:', moodData[0]);

      // Check if user already has a mood entry for today
      const { data: existingEntries, error: existingError } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('entry_date', today);

      if (existingError) {
        console.error('Error checking existing entries:', existingError);
        return { data: null, error: existingError };
      }

      let result: MoodEntry;

      if (existingEntries && existingEntries.length > 0) {
        // Update existing entry
        console.log('🔴 SUPABASE MOOD: Updating existing mood entry');
        const existingEntry = existingEntries[0];

        const { data: updatedData, error: updateError } = await supabase
          .from('mood_entries')
          .update({
            mood_id: moodData[0].id,
            mood_type: moodData[0].label,
            intensity_rating: rating,
            emoji: moodData[0].emoji,
            note: note || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingEntry.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating mood entry:', updateError);
          return { data: null, error: updateError };
        }

        result = updatedData as MoodEntry;
        console.log('🔴 SUPABASE MOOD: Updated existing entry:', result);
      } else {
        // Create new entry
        console.log('🔴 SUPABASE MOOD: Creating new mood entry');
        const { data: newData, error: insertError } = await supabase
          .from('mood_entries')
          .insert({
            user_id: user.id,
            entry_date: today,
            mood_id: moodData[0].id,
            mood_type: moodData[0].label,
            intensity_rating: rating,
            emoji: moodData[0].emoji,
            note: note || null,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating mood entry:', insertError);
          return { data: null, error: insertError };
        }

        result = newData as MoodEntry;
        console.log('🔴 SUPABASE MOOD: Created new entry:', result);
      }

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
        .eq('user_id', user.id);

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
    if (!user) return;

    setLoading(true);
    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data, error } = await supabase
        .from('mood_entries_with_details')
        .select('*')
        .eq('user_id', user.id)
        .gte('entry_date', ninetyDaysAgo.toISOString().split('T')[0])
        .order('entry_date', { ascending: false });

      if (error) {
        console.error('Error refetching mood entries:', error);
      } else {
        setMoodEntries((data as MoodEntry[]) || []);
      }
    } catch (error) {
      console.error('Error refetching mood entries:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

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