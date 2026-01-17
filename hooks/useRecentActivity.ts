import { useState, useEffect, useCallback } from 'react';
import {
  getGuestPrayers,
  getGuestMoods,
  getGuestDreams,
  getGuestNotes,
} from '@/utils/guestStorage';

export interface RecentActivity {
  id: string;
  type: 'bible_reading' | 'prayer' | 'mood' | 'quiz' | 'dream_journal' | 'note' | 'dream';
  title: string;
  description?: string;
  timestamp: string;
  icon: string;
  color: string;
  route: string;
}

export function useRecentActivity() {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentActivities = useCallback(async () => {
    try {
      setLoading(true);
      const allActivities: RecentActivity[] = [];

      // Fetch all local data
      const [prayers, moods, dreams, notes] = await Promise.all([
        getGuestPrayers(),
        getGuestMoods(),
        getGuestDreams(),
        getGuestNotes(),
      ]);

      // Transform Prayers
      prayers.forEach(prayer => {
        allActivities.push({
          id: prayer.id,
          type: 'prayer',
          title: 'Added new prayer request',
          description: prayer.title,
          timestamp: prayer.created_at,
          icon: '🙏',
          color: '#EF4444',
          route: '/(tabs)/prayer-tracker',
        });
      });

      // Transform Moods
      moods.forEach(mood => {
        allActivities.push({
          id: mood.id,
          type: 'mood',
          title: 'Updated mood tracker',
          description: `Rating: ${mood.intensity_rating}/5`,
          timestamp: new Date(mood.created_at).toISOString(), // Mood created_at is number
          icon: '😊',
          color: '#10B981',
          route: '/(tabs)/mood-tracker',
        });
      });

      // Transform Dreams
      dreams.forEach(dream => {
        allActivities.push({
          id: dream.id,
          type: 'dream',
          title: 'Added dream journal entry',
          description: dream.title || 'Dream entry',
          timestamp: dream.created_at,
          icon: '☁️',
          color: '#F59E0B',
          route: '/dream-interpretation',
        });
      });

      // Transform Notes
      notes.forEach(note => {
        allActivities.push({
          id: note.id,
          type: 'note',
          title: 'Added new note',
          description: note.title || 'Untitled note',
          timestamp: note.created_at,
          icon: '📝',
          color: '#8B5CF6',
          route: '/note-taker',
        });
      });

      // Sort by timestamp descending
      allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Take top 5
      setActivities(allActivities.slice(0, 5));

    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentActivities();
  }, [fetchRecentActivities]);

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMs = now.getTime() - activityTime.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return activityTime.toLocaleDateString();
    }
  };

  return {
    activities,
    loading,
    formatTimeAgo,
    refresh: fetchRecentActivities,
  };
}