// Map mood label to correct mood_id from database
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


import { useEffect, useState, useMemo, useCallback } from 'react';
import { Platform } from 'react-native';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  runTransaction,
  addDoc,
} from 'firebase/firestore';
import { emitMoodEntrySaved } from '@/lib/eventEmitter';

// --- Firebase Data Models ---
export interface MoodEntry {
  id: string; // Firebase doc id
  user_id: string;
  entry_date: string;
  mood_type: string;
  intensity_rating: number;
  emoji: string;
  note: string | null;
  created_at: number;
  updated_at: number;
  mood_id?: string; // Corrected: Added mood_id to the interface
}

export interface MoodInfluence {
  id: string; // Firebase doc id
  influence_name: string;
  influence_category: string;
}

// --- Component-specific types ---
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
  todaysMood: MoodEntry | null;
  weeklyData: WeeklyMoodData[];
  monthlyTrend: MoodEntry[];
}

export function useMoodTracker() {
  const { user } = useAuth();
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    // Additional mood labels from the mood tracker screen
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
    const dateFilter = ninetyDaysAgo.toISOString().split('T')[0];

    const q = query(
      collection(db, 'mood_entries'),
      where('user_id', '==', user.uid),
      where('entry_date', '>=', dateFilter),
      orderBy('entry_date', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      console.log('🔴 MOOD: Real-time listener triggered, snapshot size:', snapshot.size);
      const fetchedEntries: MoodEntry[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as MoodEntry[];

      console.log('🔴 MOOD: Fetched entries from mood_entries:', fetchedEntries.length);
      
      if (fetchedEntries.length === 0) {
        console.log('🔴 MOOD: No data in mood_entries, trying daily_activities table');
        await fallbackToDailyActivities(user.uid, dateFilter);
      } else {
        console.log('🔴 MOOD: Setting mood entries from mood_entries table');
        setMoodEntries(fetchedEntries);
      }

      setLoading(false);
    }, (error) => {
      console.error('🔴 MOOD: Real-time update failed:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Fallback function to migrate data from daily_activities
  const fallbackToDailyActivities = useCallback(async (userId: string, dateFilter: string) => {
    try {
      const dailyActivitiesQuery = query(
        collection(db, 'daily_activities'),
        where('user_id', '==', userId),
        where('activity_date', '>=', dateFilter),
        where('activity_date', '<=', new Date().toISOString().split('T')[0]),
        orderBy('activity_date', 'desc')
      );

      const dailyActivitiesSnapshot = await getDocs(dailyActivitiesQuery);
      console.log('🔴 MOOD: Daily activities snapshot size:', dailyActivitiesSnapshot.size);
      
      if (!dailyActivitiesSnapshot.empty) {
        const convertedEntries: MoodEntry[] = dailyActivitiesSnapshot.docs
          .filter(doc => doc.data().mood_rating && doc.data().mood_rating > 0)
          .map(doc => {
            const activity = doc.data();
            const moodData = moodOptions.find(m =>
              Math.abs(m.value - activity.mood_rating) <= 1
            ) || moodOptions[2];

            console.log('🔴 MOOD: Converting daily activity to mood entry:', {
              activity_date: activity.activity_date,
              mood_rating: activity.mood_rating,
              mood_type: moodData.label
            });

            return {
              id: doc.id,
              user_id: userId,
              entry_date: activity.activity_date,
              mood_id: moodIdMapping[moodData.label] || moodData.label, // Corrected: Mapped mood_id from moodData.label
              mood_type: moodData.label,
              intensity_rating: activity.mood_rating,
              emoji: moodData.emoji,
              note: null,
              created_at: new Date(activity.created_at).getTime(),
              updated_at: new Date(activity.updated_at).getTime(),
            };
          });
        console.log('🔴 MOOD: Converted entries from daily_activities:', convertedEntries.length);
        setMoodEntries(convertedEntries);
      } else {
        console.log('🔴 MOOD: No data in daily_activities either');
        setMoodEntries([]);
      }
    } catch (error) {
      console.error('Error in fallback migration:', error);
      setMoodEntries([]);
    }
  }, []);

  const saveMoodEntry = useCallback(async (
    mood: string,
    rating: number,
    influences: string[],
    note: string
  ): Promise<{ data: MoodEntry | null; error: any }> => {
    console.log('🔴 MOOD: saveMoodEntry called with:', { mood, rating, influences, note });
    
    if (!user) {
      console.log('🔴 MOOD: User not authenticated');
      return { data: null, error: 'User not authenticated' };
    }

    try {
      setSaving(true);
      const today = new Date().toISOString().split('T')[0];
      console.log('🔴 MOOD: Today date:', today);
      
      const moodData = moodOptions.find(m => m.label === mood);
      if (!moodData) {
        console.log('🔴 MOOD: Invalid mood selected:', mood);
        return { data: null, error: 'Invalid mood selected' };
      }
      console.log('🔴 MOOD: Found mood data:', moodData);

      // Map mood label to correct mood_id from database
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
      console.log('🔴 MOOD: Mapped mood_id:', moodId);

      // Use auto-generated ID instead of custom ID to avoid conflicts
      const moodDocRef = doc(collection(db, 'mood_entries'));

      // Check if user already has a mood entry for today
      console.log('🔴 MOOD: Checking for existing mood entry for user:', user.uid, 'date:', today);
      
      const existingQuery = query(
        collection(db, 'mood_entries'),
        where('user_id', '==', user.uid),
        where('entry_date', '==', today)
      );
      
      const existingSnapshot = await getDocs(existingQuery);
      console.log('🔴 MOOD: Existing entries found:', existingSnapshot.size);
      
      let result;
      if (!existingSnapshot.empty) {
        // Update existing entry
        console.log('🔴 MOOD: Updating existing mood entry');
        const existingDoc = existingSnapshot.docs[0];
        const entryData = {
          user_id: user.uid,
          entry_date: today,
          mood_type: mood,
          mood_id: moodId,
          intensity_rating: rating,
          emoji: moodData.emoji,
          note: note || null,
          updated_at: Date.now(),
        };
        
        console.log('🔴 MOOD: Entry data to update:', entryData);
        await updateDoc(existingDoc.ref, entryData);
        result = { id: existingDoc.id, ...entryData, created_at: existingDoc.data().created_at };
        console.log('🔴 MOOD: Updated existing entry:', result);
      } else {
        // Create new entry
        console.log('🔴 MOOD: Creating new mood entry');
        const entryData = {
          user_id: user.uid,
          entry_date: today,
          mood_type: mood,
          mood_id: moodId,
          intensity_rating: rating,
          emoji: moodData.emoji,
          note: note || null,
          created_at: Date.now(),
          updated_at: Date.now(),
        };
        
        console.log('🔴 MOOD: Entry data to create:', entryData);
        const docRef = await addDoc(collection(db, 'mood_entries'), entryData);
        result = { id: docRef.id, ...entryData };
        console.log('🔴 MOOD: Created new entry:', result);
      }
      
      if (result) {
        await handleInfluences(result.id, influences);
        emitMoodEntrySaved(result);
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('moodEntrySaved', { 
            detail: { moodEntry: result, timestamp: Date.now() } 
          }));
        }
      }
      
      return { data: result, error: null };
    } catch (error) {
      console.error('Error saving mood entry:', error);
      return { data: null, error };
    } finally {
      setSaving(false);
    }
  }, [user, moodOptions]);

  const handleInfluences = async (moodEntryId: string, influences: string[]) => {
    const influencesCollectionRef = collection(db, 'mood_entries', moodEntryId, 'influences');
    
    const existingInfluences = await getDocs(influencesCollectionRef);
    const deletePromises = existingInfluences.docs.map(docSnap => deleteDoc(doc(influencesCollectionRef, docSnap.id)));
    await Promise.all(deletePromises);
    
    if (influences.length > 0) {
      const insertPromises = influences.map(influence => {
        const newInfluenceRef = doc(influencesCollectionRef);
        return setDoc(newInfluenceRef, {
          influence_name: influence,
          influence_category: getInfluenceCategory(influence),
          created_at: Date.now(),
        });
      });
      await Promise.all(insertPromises);
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
      const moodDocRef = doc(db, 'mood_entries', entryId);
      await deleteDoc(moodDocRef);
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
      totalEntries: moodEntries?.length || 0,
      currentStreak: getCurrentStreak(),
      averageWeekly: getAverageWeeklyMood(),
      todaysMood: getTodaysMood(),
      weeklyData: getWeeklyMoodData(),
      monthlyTrend: getMonthlyTrend(),
    };
  }, [moodEntries, getCurrentStreak, getAverageWeeklyMood, getTodaysMood, getWeeklyMoodData, getMonthlyTrend]);

  const getMoodInsights = useCallback(() => {
    const monthlyData = getMonthlyTrend();
    
    const moodCounts = monthlyData.reduce((acc, entry) => {
      acc[entry.mood_type] = (acc[entry.mood_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonMood = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Neutral';
    
    const avgIntensity = monthlyData.length > 0 
      ? Math.round(monthlyData.reduce((sum, entry) => sum + entry.intensity_rating, 0) / monthlyData.length * 10) / 10
      : 0;
    
    const recentEntries = monthlyData.slice(0, 7);
    const olderEntries = monthlyData.slice(-7);
    
    const recentAvg = recentEntries.length > 0 
      ? recentEntries.reduce((sum, entry) => sum + entry.intensity_rating, 0) / recentEntries.length
      : 0;
    
    const olderAvg = olderEntries.length > 0 
      ? olderEntries.reduce((sum, entry) => sum + entry.intensity_rating, 0) / olderEntries.length
      : 0;
    
    const isImproving = recentAvg > olderAvg;
    
    return isImproving;
  }, [getMonthlyTrend]);

  const refetch = useCallback(async () => {
    // This will trigger the real-time listener to refresh data
    // Since we're using onSnapshot, the data will automatically update
    // We just need to ensure the loading state is handled properly
    setLoading(true);
    // The onSnapshot listener will handle the actual data refresh
  }, []);

  const addMoodEntryToState = useCallback((newEntry?: MoodEntry) => {
    if (newEntry) {
      setMoodEntries(prev => [newEntry, ...prev]);
    }
    // Trigger a refetch to ensure data is up to date
    refetch();
  }, [refetch]);

  return {
    moodEntries,
    loading,
    saving,
    moodOptions,
    saveMoodEntry,
    deleteMoodEntry,
    moodStats,
    getMoodInsights,
    refetch,
    addMoodEntryToState,
  };
}