import { useAuth } from './useAuth';
import { useMoodTracker } from './useMoodTracker';
import { useGuestMoodTracker } from './useGuestMoodTracker';
import { useEffect, useState } from 'react';

export function useUnifiedMoodTracker() {
  const { user, isGuest, loading: authLoading } = useAuth();

  // IMPORTANT: Always call hooks unconditionally to satisfy Rules of Hooks
  const authenticatedMoodTracker = useMoodTracker();
  const guestMoodTracker = useGuestMoodTracker();

  // While auth is determining state, expose a loading shape without changing hook order
  if (authLoading) {
    return {
      moodStats: {
        totalEntries: 0,
        currentStreak: 0,
        averageWeekly: 0,
        todaysMood: null,
        weeklyData: [],
        monthlyTrend: [],
      },
      loading: true,
      saving: false,
      moodOptions: [],
      saveMoodEntry: async () => ({ data: null, error: 'Loading' }),
      deleteMoodEntry: async () => ({ error: 'Loading' }),
      refetch: async () => {},
    };
  }

  // Choose which tracker data to expose based on auth state
  return user && !isGuest ? authenticatedMoodTracker : guestMoodTracker;
}