// Local storage utilities for guest user data
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const GUEST_PRAYERS_KEY = 'guest_prayers';
const GUEST_MOODS_KEY = 'guest_moods';
const GUEST_USER_ID_KEY = 'guest_user_id';

// Types for guest data
export interface GuestPrayer {
  id: string;
  title: string;
  description: string | null;
  status: 'active' | 'answered' | 'paused' | 'archived';
  category: 'personal' | 'family' | 'health' | 'work' | 'spiritual' | 'community' | 'world' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  is_shared: boolean;
  is_community: boolean;
  answered_at: string | null;
  answered_notes: string | null;
  prayer_notes: string | null;
  gratitude_notes: string | null;
  reminder_time: string | null;
  reminder_frequency: 'daily' | 'weekly' | 'monthly' | 'custom' | null;
  last_prayed_at: string | null;
  prayer_count: number;
  answered_prayer_count: number;
  created_at: string;
  updated_at: string;
}

export interface GuestMoodEntry {
  id: string;
  entry_date: string;
  mood_type: string;
  intensity_rating: number;
  emoji: string;
  note: string | null;
  created_at: number;
  updated_at: number;
  mood_id?: string;
}

// Generate a unique guest user ID
export const getGuestUserId = async (): Promise<string> => {
  try {
    let guestId = await AsyncStorage.getItem(GUEST_USER_ID_KEY);
    if (!guestId) {
      guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(GUEST_USER_ID_KEY, guestId);
    }
    return guestId;
  } catch (error) {
    console.error('Error getting guest user ID:', error);
    // Fallback to a simple ID if storage fails
    return `guest_${Date.now()}`;
  }
};

// Guest Prayers Storage
export const getGuestPrayers = async (): Promise<GuestPrayer[]> => {
  try {
    const prayersJson = await AsyncStorage.getItem(GUEST_PRAYERS_KEY);
    return prayersJson ? JSON.parse(prayersJson) : [];
  } catch (error) {
    console.error('Error getting guest prayers:', error);
    return [];
  }
};

export const saveGuestPrayer = async (prayer: Omit<GuestPrayer, 'id'>): Promise<GuestPrayer> => {
  try {
    const prayers = await getGuestPrayers();
    const newPrayer: GuestPrayer = {
      ...prayer,
      id: `prayer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    const updatedPrayers = [newPrayer, ...prayers];
    await AsyncStorage.setItem(GUEST_PRAYERS_KEY, JSON.stringify(updatedPrayers));
    return newPrayer;
  } catch (error) {
    console.error('Error saving guest prayer:', error);
    throw error;
  }
};

export const updateGuestPrayer = async (id: string, updates: Partial<GuestPrayer>): Promise<GuestPrayer | null> => {
  try {
    const prayers = await getGuestPrayers();
    const prayerIndex = prayers.findIndex(p => p.id === id);
    
    if (prayerIndex === -1) return null;
    
    const updatedPrayer = {
      ...prayers[prayerIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    prayers[prayerIndex] = updatedPrayer;
    await AsyncStorage.setItem(GUEST_PRAYERS_KEY, JSON.stringify(prayers));
    return updatedPrayer;
  } catch (error) {
    console.error('Error updating guest prayer:', error);
    throw error;
  }
};

export const deleteGuestPrayer = async (id: string): Promise<boolean> => {
  try {
    const prayers = await getGuestPrayers();
    const filteredPrayers = prayers.filter(p => p.id !== id);
    await AsyncStorage.setItem(GUEST_PRAYERS_KEY, JSON.stringify(filteredPrayers));
    return true;
  } catch (error) {
    console.error('Error deleting guest prayer:', error);
    return false;
  }
};

// Guest Moods Storage
export const getGuestMoods = async (): Promise<GuestMoodEntry[]> => {
  try {
    const moodsJson = await AsyncStorage.getItem(GUEST_MOODS_KEY);
    return moodsJson ? JSON.parse(moodsJson) : [];
  } catch (error) {
    console.error('Error getting guest moods:', error);
    return [];
  }
};

export const saveGuestMood = async (mood: Omit<GuestMoodEntry, 'id'>): Promise<GuestMoodEntry> => {
  try {
    const moods = await getGuestMoods();
    const newMood: GuestMoodEntry = {
      ...mood,
      id: `mood_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    const updatedMoods = [newMood, ...moods];
    await AsyncStorage.setItem(GUEST_MOODS_KEY, JSON.stringify(updatedMoods));
    return newMood;
  } catch (error) {
    console.error('Error saving guest mood:', error);
    throw error;
  }
};

export const updateGuestMood = async (id: string, updates: Partial<GuestMoodEntry>): Promise<GuestMoodEntry | null> => {
  try {
    const moods = await getGuestMoods();
    const moodIndex = moods.findIndex(m => m.id === id);
    
    if (moodIndex === -1) return null;
    
    const updatedMood = {
      ...moods[moodIndex],
      ...updates,
      updated_at: Date.now(),
    };
    
    moods[moodIndex] = updatedMood;
    await AsyncStorage.setItem(GUEST_MOODS_KEY, JSON.stringify(moods));
    return updatedMood;
  } catch (error) {
    console.error('Error updating guest mood:', error);
    throw error;
  }
};

export const deleteGuestMood = async (id: string): Promise<boolean> => {
  try {
    const moods = await getGuestMoods();
    const filteredMoods = moods.filter(m => m.id !== id);
    await AsyncStorage.setItem(GUEST_MOODS_KEY, JSON.stringify(filteredMoods));
    return true;
  } catch (error) {
    console.error('Error deleting guest mood:', error);
    return false;
  }
};

// Clear all guest data (useful for when guest signs up)
export const clearGuestData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([GUEST_PRAYERS_KEY, GUEST_MOODS_KEY, GUEST_USER_ID_KEY]);
  } catch (error) {
    console.error('Error clearing guest data:', error);
  }
};