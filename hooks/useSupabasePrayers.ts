import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { Prayer } from '@/lib/supabase';

export function useSupabasePrayers() {
  const { user, isGuest } = useAuth();
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrayers = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('prayers')
        .select('*')
        .order('created_at', { ascending: false });

      // For authenticated users, filter by user_id
      // For guests, get prayers with null user_id
      if (user && !isGuest) {
        query = query.eq('user_id', user.uid);
      } else {
        query = query.is('user_id', null);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setPrayers(data || []);
    } catch (e: any) {
      console.error('🔴 Error fetching prayers:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayers();
  }, [user, isGuest]);

  const addPrayer = async (prayerData: Omit<Prayer, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const prayerWithMetadata = {
        ...prayerData,
        user_id: user && !isGuest ? user.uid : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        prayer_count: prayerData.prayer_count || 0,
        answered_prayer_count: prayerData.answered_prayer_count || 0,
      };

      const { data, error: insertError } = await supabase
        .from('prayers')
        .insert([prayerWithMetadata])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      const newPrayer = data as Prayer;
      setPrayers(prev => [newPrayer, ...prev]);
      return { data: newPrayer, error: null };
    } catch (e: any) {
      console.error('Error adding prayer:', e);
      return { error: e.message };
    }
  };

  const updatePrayer = async (id: string, updates: Partial<Prayer>) => {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error: updateError } = await supabase
        .from('prayers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      const updatedPrayer = data as Prayer;
      setPrayers(prev => prev.map(p => p.id === id ? updatedPrayer : p));
      return { data: updatedPrayer, error: null };
    } catch (e: any) {
      console.error('Error updating prayer:', e);
      return { error: e.message };
    }
  };

  const deletePrayer = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('prayers')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      setPrayers(prev => prev.filter(p => p.id !== id));
      return { error: null };
    } catch (e: any) {
      console.error('Error deleting prayer:', e);
      return { error: e.message };
    }
  };

  const markPrayerAsPrayed = async (id: string) => {
    try {
      const prayer = prayers.find(p => p.id === id);
      if (!prayer) return { error: 'Prayer not found' };

      const updates = {
        last_prayed_at: new Date().toISOString(),
        prayer_count: (prayer.prayer_count || 0) + 1,
      };

      return await updatePrayer(id, updates);
    } catch (e: any) {
      console.error('Error marking prayer as prayed:', e);
      return { error: e.message };
    }
  };

  const markPrayerAsAnswered = async (id: string, answeredNotes: string) => {
    try {
      const prayer = prayers.find(p => p.id === id);
      if (!prayer) return { error: 'Prayer not found' };

      const updates = {
        status: 'answered' as const,
        answered_at: new Date().toISOString(),
        answered_notes: answeredNotes || null,
        answered_prayer_count: (prayer.answered_prayer_count || 0) + 1,
      };

      return await updatePrayer(id, updates);
    } catch (e: any) {
      console.error('Error marking prayer as answered:', e);
      return { error: e.message };
    }
  };

  // Helper functions
  const getActivePrayers = () => prayers.filter(p => p.status === 'active');
  const getAnsweredPrayers = () => prayers.filter(p => p.status === 'answered');
  const getPausedPrayers = () => prayers.filter(p => p.status === 'paused');
  const getArchivedPrayers = () => prayers.filter(p => p.status === 'archived');
  const getPrayersByCategory = (category: Prayer['category']) => prayers.filter(p => p.category === category);
  const getPrayersByPriority = (priority: Prayer['priority']) => prayers.filter(p => p.priority === priority);
  const getPrayersByFrequency = (frequency: Prayer['frequency']) => prayers.filter(p => p.frequency === frequency);

  const getThisWeekPrayers = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return prayers.filter(p => new Date(p.created_at) >= weekAgo);
  };

  const getTodayPrayers = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return prayers.filter(p => {
      const prayerDate = new Date(p.created_at);
      prayerDate.setHours(0, 0, 0, 0);
      return prayerDate.getTime() === today.getTime();
    });
  };

  const calculateCurrentStreak = () => {
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
  };

  const getPrayerStats = () => {
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
  };

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