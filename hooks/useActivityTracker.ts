import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Key
const TRACKER_STORAGE_KEY = '@activity_tracker_log';

// Assuming these interfaces are defined elsewhere or can be used directly
export interface ActivityCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  target_daily: number;
}

export interface TrackerActivity {
  id: string;
  category_id: string;
  completed: boolean;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  activity_date: string; // Add simple date string for easier local filtering
}

export interface TodayActivity extends ActivityCategory {
  category_id: string;
  completed: boolean;
  completed_at: string | null;
  notes: string | null;
  dailyActivityId: string | null;
}

export interface WeeklyProgress {
  day_name: string;
  date: string;
  completed_count: number;
  total_count: number;
  percentage: number;
}

export interface Achievement {
  achievement_name: string;
  achievement_description: string;
  achievement_icon: string;
  achievement_color: string;
  requirement_type: string;
  requirement_value: number;
  current_progress: number;
  unlocked: boolean;
  progress_percentage: number;
}

export interface ActivityStats {
  total_activities: number;
  completed_activities: number;
  pending_activities: number;
  completion_percentage: number;
  current_streak: number;
}

export function useActivityTracker() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayActivities, setTodayActivities] = useState<TodayActivity[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);

  // Hardcoded activity categories
  const activityCategories: ActivityCategory[] = [
    { id: 'cat1', name: 'Prayer', description: 'Daily prayer', icon: '🙏', color: '#FFDDC1', target_daily: 1 },
    { id: 'cat2', name: 'Bible Reading', description: 'Read a chapter from the Bible', icon: '📖', color: '#C1FFD2', target_daily: 1 },
    { id: 'cat3', name: 'Devotional', description: 'Complete a daily devotional', icon: '✍️', color: '#C1D3FF', target_daily: 1 },
  ];

  // Helper to get local data
  const getStoredActivities = async (): Promise<TrackerActivity[]> => {
    try {
      const data = await AsyncStorage.getItem(TRACKER_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading tracker data:', e);
      return [];
    }
  };

  const saveStoredActivities = async (activities: TrackerActivity[]) => {
    try {
      await AsyncStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(activities));
    } catch (e) {
      console.error('Error saving tracker data:', e);
    }
  };

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const todayDate = new Date().toISOString().split('T')[0];
      const allActivities = await getStoredActivities();

      // 1. Process today's activities
      const todayRecords = allActivities.filter(a => a.activity_date === todayDate);
      const todayMap = new Map<string, TrackerActivity>();
      todayRecords.forEach(r => todayMap.set(r.category_id, r));

      const combinedTodayActivities: TodayActivity[] = activityCategories.map(category => {
        const record = todayMap.get(category.id);
        return {
          ...category,
          category_id: category.id,
          completed: record?.completed || false,
          completed_at: record?.completed_at || null,
          notes: record?.notes || null,
          dailyActivityId: record?.id || null
        };
      });
      setTodayActivities(combinedTodayActivities);

      // 2. Fetch weekly progress
      const weeklyProgressData: WeeklyProgress[] = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        const dayActivities = allActivities.filter(a => a.activity_date === dateStr && a.completed);
        const count = dayActivities.length;
        const total = activityCategories.length; // Assuming static total per day for simplicity

        weeklyProgressData.push({
          day_name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          date: dateStr,
          completed_count: count,
          total_count: total,
          percentage: (count / total) * 100,
        });
      }
      setWeeklyProgress(weeklyProgressData);

      // 3. Calculate stats
      const totalActivitiesRecorded = allActivities.length; // This logic might need refinement if 'total' implies 'potential'
      // But based on original code, it seemed to just sum up.
      // Re-reading original: "totalActivities = allActivities.length". It query 'daily_activities'. only created ones exist there.
      // So if I only create them when interact, total is interaction count.
      // Let's stick to completed count for stats.
      const completedCount = allActivities.filter(a => a.completed).length;

      // Streak Calculation
      let currentStreak = 0;
      const datesWithCompletion = [...new Set(allActivities.filter(a => a.completed).map(a => a.activity_date))].sort().reverse();

      // Strict streak: checks if *all* categories were completed
      // Or maybe just *any*? Original checked: "isCompletedDay = dailyCompletions.length === activityCategories.length"
      const fullyCompletedDates = new Set<string>();
      const groupedByDate: Record<string, number> = {};
      allActivities.forEach(a => {
        if (a.completed) {
          groupedByDate[a.activity_date] = (groupedByDate[a.activity_date] || 0) + 1;
        }
      });

      Object.entries(groupedByDate).forEach(([date, count]) => {
        if (count >= activityCategories.length) fullyCompletedDates.add(date);
      });

      const sortedCompletedDates = Array.from(fullyCompletedDates).sort().reverse();

      if (sortedCompletedDates.length > 0) {
        // Check if today is completed
        const todayStr = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Simple iteration
        let checkDate = new Date();
        // If today is not fully completed, streak might still be valid from yesterday?
        // Usually streaks include today if completed, or up effectively to yesterday.
        // Let's just iterate back from today/yesterday.

        let streak = 0;
        // Start check from date of last full completion.
        // If last full completion was today => streak 1+.
        // If last full completion was yesterday => streak 1+.
        // If last full completion was 2 days ago => streak 0.

        // Simplified check:
        // Iterate days backwards
        for (let i = 0; i < 365; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dStr = d.toISOString().split('T')[0];

          if (fullyCompletedDates.has(dStr)) {
            streak++;
          } else {
            // If today is incomplete, don't break streak yet?
            // Only break if yesterday was incomplete (and today is incomplete).
            if (i === 0) continue; // Skip today if incomplete
            break;
          }
        }
        currentStreak = streak;
      }

      setStats({
        total_activities: completedCount, // Placeholder logic
        completed_activities: completedCount,
        pending_activities: 0,
        completion_percentage: 0,
        current_streak: currentStreak,
      });

      // 4. Achievements
      const mockAchievements: Achievement[] = [
        {
          achievement_name: 'First Step',
          achievement_description: 'Complete one activity',
          achievement_icon: '🥇',
          achievement_color: 'gold',
          requirement_type: 'total_activities',
          requirement_value: 1,
          current_progress: completedCount,
          unlocked: completedCount >= 1,
          progress_percentage: Math.min(100, (completedCount / 1) * 100),
        },
        {
          achievement_name: 'Ten Done',
          achievement_description: 'Complete 10 activities',
          achievement_icon: '🔟',
          achievement_color: 'silver',
          requirement_type: 'total_activities',
          requirement_value: 10,
          current_progress: completedCount,
          unlocked: completedCount >= 10,
          progress_percentage: Math.min(100, (completedCount / 10) * 100),
        },
        {
          achievement_name: 'Consistent Christian',
          achievement_description: 'Complete 7 days in a row',
          achievement_icon: '🔥',
          achievement_color: 'red',
          requirement_type: 'streak',
          requirement_value: 7,
          current_progress: currentStreak,
          unlocked: currentStreak >= 7,
          progress_percentage: Math.min(100, (currentStreak / 7) * 100),
        },
      ];
      setAchievements(mockAchievements);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark activity as completed
  const markActivityCompleted = async (categoryId: string, notes?: string) => {
    try {
      setLoading(true);
      const todayDate = new Date().toISOString().split('T')[0];
      const allActivities = await getStoredActivities();

      // Check if already exists for today
      const existingIndex = allActivities.findIndex(a =>
        a.category_id === categoryId && a.activity_date === todayDate
      );

      const timestamp = new Date().toISOString();

      if (existingIndex >= 0) {
        // Update
        allActivities[existingIndex].completed = true;
        allActivities[existingIndex].completed_at = timestamp;
        allActivities[existingIndex].notes = notes || allActivities[existingIndex].notes;
        allActivities[existingIndex].updated_at = timestamp;
      } else {
        // Create
        allActivities.push({
          id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          category_id: categoryId,
          completed: true,
          completed_at: timestamp,
          notes: notes || null,
          created_at: timestamp,
          updated_at: timestamp,
          activity_date: todayDate
        });
      }

      await saveStoredActivities(allActivities);
      await fetchData();
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Mark activity as incomplete
  const markActivityIncomplete = async (categoryId: string) => {
    try {
      setLoading(true);
      const todayDate = new Date().toISOString().split('T')[0];
      const allActivities = await getStoredActivities();

      const existingIndex = allActivities.findIndex(a =>
        a.category_id === categoryId && a.activity_date === todayDate
      );

      if (existingIndex >= 0) {
        allActivities[existingIndex].completed = false;
        allActivities[existingIndex].completed_at = null;
        allActivities[existingIndex].updated_at = new Date().toISOString();
        await saveStoredActivities(allActivities);
        await fetchData();
      }

      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Get goal percentage for today
  const getGoalPercentage = () => {
    if (!todayActivities.length) return 0;
    const completed = todayActivities.filter(activity => activity.completed).length;
    return Math.round((completed / todayActivities.length) * 100);
  };

  // Get current streak
  const getCurrentStreak = () => {
    return stats?.current_streak || 0;
  };

  // Initialize data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    loading,
    error,
    todayActivities,
    weeklyProgress,
    achievements,
    stats,
    getGoalPercentage,
    getCurrentStreak,
    markActivityCompleted,
    markActivityIncomplete,
    refreshData: fetchData,
  };
}