import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define activity goals
const DAILY_GOALS = {
  bible_reading_minutes: 15,
  prayer_minutes: 10,
  devotional_completed: true,
  mood_rating: 1, // Just needs to be set
};

const ACTIVITY_STORAGE_KEY = '@daily_activities';

// Define the data types
export interface DailyActivity {
  id?: string;
  user_id: string; // Keep for interface compatibility, but will be 'guest'
  activity_date: string;
  bible_reading_minutes: number;
  prayer_minutes: number;
  devotional_completed: boolean;
  mood_rating: number | null;
  activities_completed: number;
  goal_percentage: number;
  created_at: string;
  updated_at: string;
}

export function useDailyActivity() {
  const [todayActivity, setTodayActivity] = useState<DailyActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [weeklyProgress, setWeeklyProgress] = useState<DailyActivity[]>([]);

  // Fetches today's activity, creating it if it doesn't exist
  const fetchTodayActivity = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const storedData = await AsyncStorage.getItem(ACTIVITY_STORAGE_KEY);
      const activities: DailyActivity[] = storedData ? JSON.parse(storedData) : [];

      const todayItem = activities.find(a => a.activity_date === today);

      if (todayItem) {
        setTodayActivity(todayItem);
      } else {
        // Create today's activity if it doesn't exist
        const newActivityData: DailyActivity = {
          id: `activity_${today}_${Date.now()}`,
          user_id: 'guest',
          activity_date: today,
          bible_reading_minutes: 0,
          prayer_minutes: 0,
          devotional_completed: false,
          mood_rating: null,
          activities_completed: 0,
          goal_percentage: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const updatedActivities = [...activities, newActivityData];
        await AsyncStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(updatedActivities));
        setTodayActivity(newActivityData);
      }
    } catch (error) {
      console.error('Error fetching/creating daily activity:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetches the last 7 days of activity
  const fetchWeeklyProgress = useCallback(async () => {
    try {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
      const todayStr = today.toISOString().split('T')[0];

      const storedData = await AsyncStorage.getItem(ACTIVITY_STORAGE_KEY);
      const activities: DailyActivity[] = storedData ? JSON.parse(storedData) : [];

      // Filter for last 7 days
      const weeklyData = activities.filter(a =>
        a.activity_date >= sevenDaysAgoStr &&
        a.activity_date <= todayStr
      ).sort((a, b) => a.activity_date.localeCompare(b.activity_date));

      setWeeklyProgress(weeklyData);
    } catch (error) {
      console.error('Error fetching weekly progress:', error);
    }
  }, []);

  useEffect(() => {
    fetchTodayActivity();
    fetchWeeklyProgress();
  }, [fetchTodayActivity, fetchWeeklyProgress]);

  const updateTodayActivity = useCallback(async (updates: Partial<DailyActivity>) => {
    if (!todayActivity) return { error: 'No activity found' };

    try {
      const storedData = await AsyncStorage.getItem(ACTIVITY_STORAGE_KEY);
      const activities: DailyActivity[] = storedData ? JSON.parse(storedData) : [];

      const updatedActivity = { ...todayActivity, ...updates };
      const activitiesCompleted = calculateActivitiesCompleted(updatedActivity);

      const finalActivity: DailyActivity = {
        ...updatedActivity,
        activities_completed: activitiesCompleted,
        goal_percentage: Math.round((activitiesCompleted / 4) * 100),
        updated_at: new Date().toISOString(),
      };

      const activityIndex = activities.findIndex(a => a.activity_date === finalActivity.activity_date);

      let newActivities;
      if (activityIndex >= 0) {
        newActivities = [...activities];
        newActivities[activityIndex] = finalActivity;
      } else {
        newActivities = [...activities, finalActivity];
      }

      await AsyncStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(newActivities));
      setTodayActivity(finalActivity);

      // Update weekly progress as well if needed, or just let the next fetch handle it
      // For immediate UI update in streaks:
      setWeeklyProgress(prev => {
        const idx = prev.findIndex(p => p.activity_date === finalActivity.activity_date);
        if (idx >= 0) {
          const newProg = [...prev];
          newProg[idx] = finalActivity;
          return newProg;
        }
        return [...prev, finalActivity]; // Should be in sync
      });

      return { data: finalActivity, error: null };
    } catch (error) {
      console.error('Error updating daily activity:', error);
      return { error };
    }
  }, [todayActivity]);

  const calculateActivitiesCompleted = (activity: DailyActivity) => {
    const goals = [
      activity.bible_reading_minutes >= DAILY_GOALS.bible_reading_minutes,
      activity.prayer_minutes >= DAILY_GOALS.prayer_minutes,
      activity.devotional_completed === DAILY_GOALS.devotional_completed,
      activity.mood_rating !== null,
    ];
    return goals.filter(Boolean).length;
  };

  const calculateGoalPercentage = () => {
    if (!todayActivity) return 0;
    return todayActivity.goal_percentage || 0;
  };

  const getWeeklyStats = () => {
    if (weeklyProgress.length === 0) return { averagePercentage: 0, totalDays: 0, completedDays: 0 };
    const totalDays = weeklyProgress.length;
    const completedDays = weeklyProgress.filter(day => day.goal_percentage >= 100).length;
    const totalPercentage = weeklyProgress.reduce((sum, day) => sum + (day.goal_percentage || 0), 0);
    const averagePercentage = totalDays > 0 ? Math.round(totalPercentage / totalDays) : 0;
    return { averagePercentage, totalDays, completedDays };
  };

  const getTodayGoals = () => {
    if (!todayActivity) return [];
    return [
      {
        id: 'bible_reading',
        title: 'Bible Reading',
        target: `${DAILY_GOALS.bible_reading_minutes} minutes`,
        current: todayActivity.bible_reading_minutes,
        completed: todayActivity.bible_reading_minutes >= DAILY_GOALS.bible_reading_minutes,
        icon: '📖',
        color: '#3B82F6',
      },
      {
        id: 'prayer',
        title: 'Prayer Time',
        target: `${DAILY_GOALS.prayer_minutes} minutes`,
        current: todayActivity.prayer_minutes,
        completed: todayActivity.prayer_minutes >= DAILY_GOALS.prayer_minutes,
        icon: '🙏',
        color: '#10B981',
      },
      {
        id: 'devotional',
        title: 'Devotional',
        target: 'Complete daily reading',
        current: todayActivity.devotional_completed ? 1 : 0,
        completed: todayActivity.devotional_completed,
        icon: '📚',
        color: '#F59E0B',
      },
      {
        id: 'mood',
        title: 'Mood Check',
        target: 'Record your mood',
        current: todayActivity.mood_rating ? 1 : 0,
        completed: todayActivity.mood_rating !== null,
        icon: '😊',
        color: '#EC4899',
      },
    ];
  };

  const updateBibleReading = async (minutes: number) => {
    return await updateTodayActivity({ bible_reading_minutes: minutes });
  };

  const updatePrayerTime = async (minutes: number) => {
    return await updateTodayActivity({ prayer_minutes: minutes });
  };

  const markDevotionalComplete = async () => {
    return await updateTodayActivity({ devotional_completed: true });
  };

  const updateMoodRating = async (rating: number) => {
    return await updateTodayActivity({ mood_rating: rating });
  };

  const getCurrentStreak = () => {
    if (weeklyProgress.length === 0) return 0;
    let streak = 0;
    const sortedDays = [...weeklyProgress].sort((a, b) => b.activity_date.localeCompare(a.activity_date)); // Newest first
    for (const day of sortedDays) {
      if (day.goal_percentage >= 100) {
        streak++;
      } else {
        // If it's today and not completed yet, don't break streak if yesterday was completed
        // But the logic here is simple counting. 
        // If strictly consecutive days:
        // We need to check gaps.
        // For simplicity, let's just count completed entries in the sorted list, but a gap breaks it.
        break;
      }
    }
    // Note: The original logic in the file might have been simplistic too. 
    // This assumes the list contains consecutive days. FetchWeeklyProgress fetches range. 
    // If a day is missing (no activity record), it won't be in the list, so streak calc might need to handle gaps if we want "true" streak.
    // However, existing logic just iterated. Let's keep it simple as user requested migration, not logic overhaul.
    return streak;
  };

  const refetch = useCallback(() => {
    return Promise.all([fetchTodayActivity(), fetchWeeklyProgress()]);
  }, [fetchTodayActivity, fetchWeeklyProgress]);

  return {
    todayActivity,
    weeklyProgress,
    loading,
    updateTodayActivity,
    calculateGoalPercentage,
    getWeeklyStats,
    getTodayGoals,
    getCurrentStreak,
    updateBibleReading,
    updatePrayerTime,
    markDevotionalComplete,
    updateMoodRating,
    refetch,
  };
}