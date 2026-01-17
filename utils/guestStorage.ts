// Local storage utilities for guest user data
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const GUEST_PRAYERS_KEY = 'guest_prayers';
const GUEST_MOODS_KEY = 'guest_moods';
const GUEST_DREAMS_KEY = 'guest_dreams';
const GUEST_NOTES_KEY = 'guest_notes';
const GUEST_USER_ID_KEY = 'guest_user_id';

// Types for guest data
export interface GuestPrayer {
  id: string;
  title: string;
  description: string | null;
  status: 'active' | 'answered' | 'paused' | 'archived';
  category: 'personal' | 'family' | 'health' | 'work' | 'spiritual' | 'community' | 'world' | 'other' | 'relationships' | 'finances' | 'gratitude';
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
  // Optional verse fields to mirror Supabase schema
  verse_reference?: string | null;
  verse_text?: string | null;
  verse_explanation?: string | null;
  verse_application?: string | null;
  verse_mood_alignment?: string | null;
}

export interface GuestDream {
  id: string;
  title: string;
  description: string;
  mood: string;
  date: string;
  interpretation?: string;
  biblical_insights?: string[];
  spiritual_meaning?: string;
  symbols?: Array<{
    symbol: string;
    meaning: string;
    bibleVerse?: string;
  }>;
  prayer?: string;
  significance?: 'low' | 'medium' | 'high';
  is_analyzed: boolean;
  created_at: string;
  updated_at: string;
}

export interface GuestNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: 'reflection' | 'prayer' | 'study' | 'journal' | 'insight' | 'gratitude' | 'other';
  tags: string[];
  is_private: boolean;
  is_favorite: boolean;
  mood_rating?: number;
  bible_reference?: string;
  background_color?: string;
  created_at: string;
  updated_at: string;
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
    const moods = moodsJson ? JSON.parse(moodsJson) : [];
    // Sort by created_at timestamp in descending order (newest first)
    return moods.sort((a: GuestMoodEntry, b: GuestMoodEntry) => b.created_at - a.created_at);
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

// Guest Dreams Storage
export const getGuestDreams = async (): Promise<GuestDream[]> => {
  try {
    const dreamsJson = await AsyncStorage.getItem(GUEST_DREAMS_KEY);
    const dreams = dreamsJson ? JSON.parse(dreamsJson) : [];
    // Sort by created_at timestamp in descending order (newest first)
    return dreams.sort((a: GuestDream, b: GuestDream) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error('Error getting guest dreams:', error);
    return [];
  }
};

export const saveGuestDream = async (dream: Omit<GuestDream, 'id'>): Promise<GuestDream> => {
  try {
    const dreams = await getGuestDreams();
    const newDream: GuestDream = {
      ...dream,
      id: `dream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const updatedDreams = [newDream, ...dreams];
    await AsyncStorage.setItem(GUEST_DREAMS_KEY, JSON.stringify(updatedDreams));
    return newDream;
  } catch (error) {
    console.error('Error saving guest dream:', error);
    throw error;
  }
};

export const updateGuestDream = async (id: string, updates: Partial<GuestDream>): Promise<GuestDream | null> => {
  try {
    const dreams = await getGuestDreams();
    const dreamIndex = dreams.findIndex(d => d.id === id);

    if (dreamIndex === -1) return null;

    const updatedDream = {
      ...dreams[dreamIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    dreams[dreamIndex] = updatedDream;
    await AsyncStorage.setItem(GUEST_DREAMS_KEY, JSON.stringify(dreams));
    return updatedDream;
  } catch (error) {
    console.error('Error updating guest dream:', error);
    throw error;
  }
};

export const deleteGuestDream = async (id: string): Promise<boolean> => {
  try {
    const dreams = await getGuestDreams();
    const filteredDreams = dreams.filter(d => d.id !== id);
    await AsyncStorage.setItem(GUEST_DREAMS_KEY, JSON.stringify(filteredDreams));
    return true;
  } catch (error) {
    console.error('Error deleting guest dream:', error);
    return false;
  }
};

// Guest Notes Storage
export const getGuestNotes = async (): Promise<GuestNote[]> => {
  try {
    const notesJson = await AsyncStorage.getItem(GUEST_NOTES_KEY);
    const notes = notesJson ? JSON.parse(notesJson) : [];
    // Sort by updated_at timestamp in descending order (newest first)
    return notes.sort((a: GuestNote, b: GuestNote) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  } catch (error) {
    console.error('Error getting guest notes:', error);
    return [];
  }
};

export const saveGuestNote = async (note: Omit<GuestNote, 'id' | 'created_at' | 'updated_at'>): Promise<GuestNote> => {
  try {
    const notes = await getGuestNotes();
    const now = new Date().toISOString();
    const newNote: GuestNote = {
      ...note,
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: now,
      updated_at: now,
    };

    const updatedNotes = [newNote, ...notes];
    await AsyncStorage.setItem(GUEST_NOTES_KEY, JSON.stringify(updatedNotes));
    return newNote;
  } catch (error) {
    console.error('Error saving guest note:', error);
    throw error;
  }
};

export const updateGuestNote = async (id: string, updates: Partial<Omit<GuestNote, 'id' | 'created_at'>>): Promise<GuestNote | null> => {
  try {
    const notes = await getGuestNotes();
    const noteIndex = notes.findIndex(n => n.id === id);

    if (noteIndex === -1) return null;

    const updatedNote = {
      ...notes[noteIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    notes[noteIndex] = updatedNote;
    await AsyncStorage.setItem(GUEST_NOTES_KEY, JSON.stringify(notes));
    return updatedNote;
  } catch (error) {
    console.error('Error updating guest note:', error);
    throw error;
  }
};

export const deleteGuestNote = async (id: string): Promise<boolean> => {
  try {
    const notes = await getGuestNotes();
    const filteredNotes = notes.filter(n => n.id !== id);
    await AsyncStorage.setItem(GUEST_NOTES_KEY, JSON.stringify(filteredNotes));
    return true;
  } catch (error) {
    console.error('Error deleting guest note:', error);
    return false;
  }
};

// Clear all guest data (useful for when guest signs up)
export const clearGuestData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([GUEST_PRAYERS_KEY, GUEST_MOODS_KEY, GUEST_DREAMS_KEY, GUEST_NOTES_KEY, GUEST_USER_ID_KEY]);
  } catch (error) {
    console.error('Error clearing guest data:', error);
  }
};