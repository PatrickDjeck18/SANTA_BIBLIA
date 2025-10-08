import { useEffect, useState, useMemo, useCallback } from 'react';
import { GuestMoodEntry, getGuestMoods, saveGuestMood, updateGuestMood, deleteGuestMood } from '@/utils/guestStorage';

// Types matching the original useMoodTracker
export interface MoodOption {
  emoji: string;
  label: string;
  color: string;
  value: number;
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
  todaysMood: GuestMoodEntry | null;
  weeklyData: WeeklyMoodData[];
  monthlyTrend: GuestMoodEntry[];
}

export function useGuestMoodTracker() {
  const [moodEntries, setMoodEntries] = useState<GuestMoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Same mood options as the original hook
  const moodOptions: MoodOption[] = [
    { emoji: '😢', label: 'Sad', color: '#6B7280', value: 2 },
    { emoji: '😟', label: 'Worried', color: '#F59E0B', value: 4 },
    { emoji: '😐', label: 'Neutral', color: '#9CA3AF', value: 5 },
    { emoji: '😊', label: 'Happy', color: '#8B5CF6', value: 7 },
    { emoji: '😄', label: 'Joyful', color: '#F97316', value: 9 },
    { emoji: '😰', label: 'Anxious', color: '#EF4444', value: 3 },
    { emoji: '😌', label: 'Peaceful', color: '#10B981', value: 6 },
    { emoji: '🤩', label: 'Excited', color: '#EC4899', value: 8 },
    { emoji: '😴', label: 'Calm', color: '#06B6D4', value: 5 },
    { emoji: '😤', label: 'Stressed', color: '#DC2626', value: 4 },
    { emoji: '🙏', label: 'Blessed', color: '#FFD700', value: 9 },
    { emoji: '🙏', label: 'Grateful', color: '#84CC16', value: 8 },
    { emoji: '💕', label: 'Loved', color: '#EC4899', value: 8 },
    { emoji: '🏆', label: 'Proud', color: '#10B981', value: 8 },
    { emoji: '😇', label: 'Peaceful', color: '#06B6D4', value: 7 },
    { emoji: '😌', label: 'Calm', color: '#3B82F6', value: 6 },
    { emoji: '😊', label: 'Content', color: '#8B5CF6', value: 6 },
    { emoji: '🙏', label: 'Prayerful', color: '#8B5CF6', value: 7 },
    { emoji: '💪', label: 'Motivated', color: '#10B981', value: 8 },
    { emoji: '🎯', label: 'Focused', color: '#3B82F6', value: 7 },
    { emoji: '🎨', label: 'Creative', color: '#8B5CF6', value: 7 },
    { emoji: '✨', label: 'Energetic Inspired', color: '#EC4899', value: 8 },
    { emoji: '🎉', label: 'Accomplished', color: '#22C55E', value: 9 },
    { emoji: '😔', label: 'Sad', color: '#6B7280', value: 2 },
    { emoji: '😰', label: 'Anxious', color: '#8B5CF6', value: 3 },
    { emoji: '😓', label: 'Stressed', color: '#EC4899', value: 3 },
    { emoji: '😠', label: 'Angry', color: '#EF4444', value: 2 },
    { emoji: '😤', label: 'Frustrated', color: '#F97316', value: 3 },
    { emoji: '😴', label: 'Tired', color: '#A855F7', value: 4 },
    { emoji: '🥺', label: 'Lonely', color: '#6B7280', value: 3 },
    { emoji: '😕', label: 'Confused', color: '#F59E0B', value: 4 },
    { emoji: '😨', label: 'Fearful', color: '#DC2626', value: 2 },
    { emoji: '🤔', label: 'Curious', color: '#14B8A6', value: 5 },
    { emoji: '😲', label: 'Surprised', color: '#FBBF24', value: 7 },
    { emoji: '🌟', label: 'Hopeful', color: '#FBBF24', value: 7 },
    { emoji: '✨', label: 'Spiritual Inspired', color: '#A78BFA', value: 8 },
    { emoji: '🔗', label: 'Connected', color: '#6EE7B7', value: 7 },
    { emoji: '✝️', label: 'Faithful', color: '#F472B6', value: 7 },
    { emoji: '🍎', label: 'Healthy', color: '#6EE7B7', value: 7 },
    { emoji: '😴', label: 'Rested', color: '#A78BFA', value: 7 },
    { emoji: '🧘', label: 'Balanced', color: '#F472B6', value: 6 },
  ];

  const fetchMoods = async () => {
    setLoading(true);
    try {
      const guestMoods = await getGuestMoods();
      setMoodEntries(guestMoods);
    } catch (error) {
      console.error('🔴 Error fetching guest moods:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoods();
  }, []);

  const saveMoodEntry = useCallback(async (
    mood: string,
    rating: number,
    influences: string[],
    note: string
  ): Promise<{ data: GuestMoodEntry | null; error: any }> => {
    console.log('🔴 GUEST MOOD: saveMoodEntry called with:', { mood, rating, influences, note });

    try {
      setSaving(true);
      const today = new Date().toISOString().split('T')[0];
      console.log('🔴 GUEST MOOD: Today date:', today);
      
      const moodData = moodOptions.find(m => m.label === mood);
      if (!moodData) {
        console.log('🔴 GUEST MOOD: Invalid mood selected:', mood);
        return { data: null, error: 'Invalid mood selected' };
      }
      console.log('🔴 GUEST MOOD: Found mood data:', moodData);

      // Mood ID mapping (simplified for guest users)
      const moodIdMapping: Record<string, string> = {
        'Blessed': 'positive_001_blessed',
        'Happy': 'positive_002_happy',
        'Joyful': 'positive_003_joyful',
        'Grateful': 'positive_004_grateful',
        'Excited': 'positive_005_excited',
        'Loved': 'positive_006_loved',
        'Proud': 'positive_007_proud',
        'Peaceful': 'calm_001_peaceful',
        'Calm': 'calm_002_calm',
        'Content': 'calm_003_content',
        'Prayerful': 'calm_004_prayerful',
        'Motivated': 'energetic_001_motivated',
        'Focused': 'energetic_002_focused',
        'Creative': 'energetic_003_creative',
        'Energetic Inspired': 'energetic_004_inspired',
        'Spiritual Inspired': 'spiritual_001_inspired',
        'Accomplished': 'energetic_005_accomplished',
        'Sad': 'challenging_001_sad',
        'Anxious': 'challenging_002_anxious',
        'Stressed': 'challenging_003_stressed',
        'Angry': 'challenging_004_angry',
        'Frustrated': 'challenging_005_frustrated',
        'Tired': 'challenging_006_tired',
        'Lonely': 'challenging_007_lonely',
        'Confused': 'challenging_008_confused',
        'Curious': 'curious_001_curious',
        'Surprised': 'curious_002_surprised',
        'Hopeful': 'curious_003_hopeful',
        'Connected': 'spiritual_002_connected',
        'Faithful': 'spiritual_003_faithful',
        'Healthy': 'health_001_healthy',
        'Rested': 'health_002_rested',
        'Balanced': 'health_003_balanced'
      };

      const moodId = moodIdMapping[mood] || moodData.label;

      // Check if user already has a mood entry for today
      const existingEntry = moodEntries.find(e => e.entry_date === today);
      
      let result;
      if (existingEntry) {
        // Update existing entry
        console.log('🔴 GUEST MOOD: Updating existing mood entry');
        const entryData = {
          mood_type: mood,
          mood_id: moodId,
          intensity_rating: rating,
          emoji: moodData.emoji,
          note: note || null,
          updated_at: Date.now(),
        };
        
        const updatedMood = await updateGuestMood(existingEntry.id, entryData);
        if (!updatedMood) {
          return { data: null, error: 'Failed to update mood entry' };
        }
        result = updatedMood;
      } else {
        // Create new entry
        console.log('🔴 GUEST MOOD: Creating new mood entry');
        const entryData = {
          entry_date: today,
          mood_type: mood,
          mood_id: moodId,
          intensity_rating: rating,
          emoji: moodData.emoji,
          note: note || null,
          created_at: Date.now(),
          updated_at: Date.now(),
        };
        
        const newMood = await saveGuestMood(entryData);
        result = newMood;
      }
      
      // Refresh the mood entries
      await fetchMoods();
      return { data: result, error: null };
    } catch (error) {
      console.error('Error saving guest mood entry:', error);
      return { data: null, error };
    } finally {
      setSaving(false);
    }
  }, [moodEntries, moodOptions]);

  const deleteMoodEntry = useCallback(async (entryId: string): Promise<{ error: any }> => {
    try {
      const success = await deleteGuestMood(entryId);
      if (!success) {
        return { error: 'Failed to delete mood entry' };
      }
      
      // Refresh the mood entries
      await fetchMoods();
      return { error: null };
    } catch (error) {
      console.error('Error deleting guest mood entry:', error);
      return { error };
    }
  }, []);

  const getTodaysMood = useCallback((): GuestMoodEntry | null => {
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

  const getMonthlyTrend = useCallback((): GuestMoodEntry[] => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateFilter = thirtyDaysAgo.toISOString().split('T')[0];
    
    return moodEntries.filter(entry => entry.entry_date >= dateFilter);
  }, [moodEntries]);

  const moodStats: MoodStats = useMemo(() => {
    const todaysMood = getTodaysMood();
    const weeklyData = getWeeklyMoodData();
    const monthlyTrend = getMonthlyTrend();
    const averageWeekly = getAverageWeeklyMood();
    const currentStreak = getCurrentStreak();

    return {
      totalEntries: moodEntries?.length || 0,
      currentStreak,
      averageWeekly,
      todaysMood,
      weeklyData,
      monthlyTrend,
    };
  }, [moodEntries, getTodaysMood, getWeeklyMoodData, getMonthlyTrend, getAverageWeeklyMood, getCurrentStreak]);

  const refetch = useCallback(async () => {
    await fetchMoods();
  }, []);

  return {
    moodStats,
    loading,
    saving,
    moodOptions,
    saveMoodEntry,
    deleteMoodEntry,
    refetch,
  };
}