import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Prayer type definition for local storage
export interface LocalPrayer {
  id: string;
  title: string;
  description: string | null;
  status: 'active' | 'answered' | 'paused' | 'archived';
  category: 'personal' | 'family' | 'health' | 'work' | 'spiritual' | 'community' | 'relationships' | 'finances' | 'world' | 'gratitude' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';
  is_shared: boolean;
  is_community: boolean;
  answered_at: string | null;
  answered_notes: string | null;
  prayer_notes: string | null;
  gratitude_notes: string | null;
  reminder_time: string | null;
  reminder_frequency: 'daily' | 'weekly' | 'custom' | 'monthly' | null;
  last_prayed_at: string | null;
  prayer_count: number;
  answered_prayer_count: number;
  created_at: string;
  updated_at: string;
}

const PRAYERS_STORAGE_KEY = '@daily_bread_prayers';

export function useUnifiedPrayers() {
  const [prayers, setPrayers] = useState<LocalPrayer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load prayers from AsyncStorage
  const fetchPrayers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const storedPrayers = await AsyncStorage.getItem(PRAYERS_STORAGE_KEY);
      if (storedPrayers) {
        const parsedPrayers = JSON.parse(storedPrayers) as LocalPrayer[];
        // Sort by created_at descending
        parsedPrayers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setPrayers(parsedPrayers);
      } else {
        setPrayers([]);
      }
      console.log('✅ Prayers loaded from local storage:', storedPrayers ? JSON.parse(storedPrayers).length : 0);
    } catch (e: any) {
      console.error('🔴 Error fetching prayers from local storage:', e);
      setError(e.message);
      setPrayers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save prayers to AsyncStorage
  const savePrayersToStorage = useCallback(async (updatedPrayers: LocalPrayer[]) => {
    try {
      await AsyncStorage.setItem(PRAYERS_STORAGE_KEY, JSON.stringify(updatedPrayers));
      console.log('✅ Prayers saved to local storage:', updatedPrayers.length);
    } catch (e: any) {
      console.error('🔴 Error saving prayers to local storage:', e);
    }
  }, []);

  // Load prayers on mount
  useEffect(() => {
    fetchPrayers();
  }, [fetchPrayers]);

  // Add a new prayer
  const addPrayer = useCallback(async (prayerData: Omit<LocalPrayer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newPrayer: LocalPrayer = {
        ...prayerData,
        id: `prayer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        prayer_count: prayerData.prayer_count || 0,
        answered_prayer_count: prayerData.answered_prayer_count || 0,
      };

      const updatedPrayers = [newPrayer, ...prayers];
      setPrayers(updatedPrayers);
      await savePrayersToStorage(updatedPrayers);

      console.log('✅ Prayer added:', newPrayer.title);
      return { data: newPrayer, error: null };
    } catch (e: any) {
      console.error('Error adding prayer:', e);
      return { error: e.message };
    }
  }, [prayers, savePrayersToStorage]);

  // Update a prayer
  const updatePrayer = useCallback(async (id: string, updates: Partial<LocalPrayer>) => {
    try {
      const updatedPrayers = prayers.map(p => {
        if (p.id === id) {
          return {
            ...p,
            ...updates,
            updated_at: new Date().toISOString(),
          };
        }
        return p;
      });

      const updatedPrayer = updatedPrayers.find(p => p.id === id);
      if (!updatedPrayer) {
        return { error: 'Prayer not found' };
      }

      setPrayers(updatedPrayers);
      await savePrayersToStorage(updatedPrayers);

      console.log('✅ Prayer updated:', id);
      return { data: updatedPrayer, error: null };
    } catch (e: any) {
      console.error('Error updating prayer:', e);
      return { error: e.message };
    }
  }, [prayers, savePrayersToStorage]);

  // Delete a prayer
  const deletePrayer = useCallback(async (id: string) => {
    try {
      const updatedPrayers = prayers.filter(p => p.id !== id);
      setPrayers(updatedPrayers);
      await savePrayersToStorage(updatedPrayers);

      console.log('✅ Prayer deleted:', id);
      return { error: null };
    } catch (e: any) {
      console.error('Error deleting prayer:', e);
      return { error: e.message };
    }
  }, [prayers, savePrayersToStorage]);

  // Mark prayer as prayed
  const markPrayerAsPrayed = useCallback(async (id: string) => {
    const prayer = prayers.find(p => p.id === id);
    if (!prayer) return { error: 'Prayer not found' };

    const updates = {
      last_prayed_at: new Date().toISOString(),
      prayer_count: (prayer.prayer_count || 0) + 1,
    };

    return await updatePrayer(id, updates);
  }, [prayers, updatePrayer]);

  // Mark prayer as answered
  const markPrayerAsAnswered = useCallback(async (id: string, answeredNotes: string) => {
    const prayer = prayers.find(p => p.id === id);
    if (!prayer) return { error: 'Prayer not found' };

    const updates = {
      status: 'answered' as const,
      answered_at: new Date().toISOString(),
      answered_notes: answeredNotes || null,
      answered_prayer_count: (prayer.answered_prayer_count || 0) + 1,
    };

    return await updatePrayer(id, updates);
  }, [prayers, updatePrayer]);

  // Helper functions
  const getActivePrayers = useCallback(() => prayers.filter(p => p.status === 'active'), [prayers]);
  const getAnsweredPrayers = useCallback(() => prayers.filter(p => p.status === 'answered'), [prayers]);
  const getPausedPrayers = useCallback(() => prayers.filter(p => p.status === 'paused'), [prayers]);
  const getArchivedPrayers = useCallback(() => prayers.filter(p => p.status === 'archived'), [prayers]);
  const getPrayersByCategory = useCallback((category: LocalPrayer['category']) => prayers.filter(p => p.category === category), [prayers]);
  const getPrayersByPriority = useCallback((priority: LocalPrayer['priority']) => prayers.filter(p => p.priority === priority), [prayers]);
  const getPrayersByFrequency = useCallback((frequency: LocalPrayer['frequency']) => prayers.filter(p => p.frequency === frequency), [prayers]);

  const getThisWeekPrayers = useCallback(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return prayers.filter(p => new Date(p.created_at) >= weekAgo);
  }, [prayers]);

  const getTodayPrayers = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return prayers.filter(p => {
      const prayerDate = new Date(p.created_at);
      prayerDate.setHours(0, 0, 0, 0);
      return prayerDate.getTime() === today.getTime();
    });
  }, [prayers]);

  const calculateCurrentStreak = useCallback(() => {
    if (prayers.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = new Date(today);

    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];

      const hasActivity = prayers.some(prayer => {
        const createdDate = prayer.created_at.split('T')[0];
        const prayedDate = prayer.last_prayed_at?.split('T')[0];
        const answeredDate = prayer.answered_at?.split('T')[0];

        return createdDate === dateStr || prayedDate === dateStr || answeredDate === dateStr;
      });

      if (hasActivity) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [prayers]);

  const getPrayerStats = useCallback(() => {
    const total = prayers.length;
    const active = getActivePrayers().length;
    const answered = getAnsweredPrayers().length;
    const paused = getPausedPrayers().length;
    const archived = getArchivedPrayers().length;

    const totalPrayerCount = prayers.reduce((sum, p) => sum + (p.prayer_count || 0), 0);
    const totalAnsweredCount = prayers.reduce((sum, p) => sum + (p.answered_prayer_count || 0), 0);

    const categoryStats = prayers.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityStats = prayers.reduce((acc, p) => {
      acc[p.priority] = (acc[p.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const currentStreak = calculateCurrentStreak();

    return {
      total,
      active,
      answered,
      paused,
      archived,
      totalPrayerCount,
      totalAnsweredCount,
      categoryStats,
      priorityStats,
      answerRate: total > 0 ? (answered / total) * 100 : 0,
      currentStreak,
    };
  }, [prayers, getActivePrayers, getAnsweredPrayers, getPausedPrayers, getArchivedPrayers, calculateCurrentStreak]);

  return {
    prayers,
    loading,
    error,
    addPrayer,
    updatePrayer,
    deletePrayer,
    markPrayerAsPrayed,
    markPrayerAsAnswered,
    getActivePrayers,
    getAnsweredPrayers,
    getPausedPrayers,
    getArchivedPrayers,
    getPrayersByCategory,
    getPrayersByPriority,
    getPrayersByFrequency,
    getThisWeekPrayers,
    getTodayPrayers,
    getPrayerStats,
    refetch: fetchPrayers,
  };
}