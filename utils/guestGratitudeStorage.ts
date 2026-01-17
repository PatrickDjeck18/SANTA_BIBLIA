import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GuestGratitudeEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood_rating: number;
  tags: string[];
  is_private: boolean;
  is_favorite: boolean;
  background_color?: string;
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = '@gratitude_entries';

// Generate a unique ID
const generateId = (): string => {
  return `gratitude_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get all gratitude entries from local storage
export async function getGuestGratitudeEntries(): Promise<GuestGratitudeEntry[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting guest gratitude entries:', error);
    return [];
  }
}

// Save a gratitude entry to local storage
export async function saveGuestGratitudeEntry(entryData: Omit<GuestGratitudeEntry, 'id' | 'created_at' | 'updated_at'>): Promise<GuestGratitudeEntry> {
  try {
    const entries = await getGuestGratitudeEntries();
    const now = new Date().toISOString();
    
    const newEntry: GuestGratitudeEntry = {
      id: entryData.id || generateId(), // Use provided ID if available (from Firebase)
      ...entryData,
      created_at: entryData.created_at || now,
      updated_at: entryData.updated_at || now,
    };
    
    // Check if entry already exists (for Firebase sync)
    const existingIndex = entries.findIndex(entry => entry.id === newEntry.id);
    if (existingIndex >= 0) {
      entries[existingIndex] = newEntry;
    } else {
      entries.unshift(newEntry); // Add to beginning for newest first
    }
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    
    return newEntry;
  } catch (error) {
    console.error('Error saving guest gratitude entry:', error);
    throw error;
  }
}

// Update a gratitude entry in local storage
export async function updateGuestGratitudeEntry(
  entryId: string, 
  updateData: Partial<Omit<GuestGratitudeEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<GuestGratitudeEntry | null> {
  try {
    const entries = await getGuestGratitudeEntries();
    const entryIndex = entries.findIndex(entry => entry.id === entryId);
    
    if (entryIndex === -1) {
      console.error('Gratitude entry not found:', entryId);
      return null;
    }
    
    const updatedEntry: GuestGratitudeEntry = {
      ...entries[entryIndex],
      ...updateData,
      updated_at: updateData.updated_at || new Date().toISOString(),
    };
    
    entries[entryIndex] = updatedEntry;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    
    return updatedEntry;
  } catch (error) {
    console.error('Error updating guest gratitude entry:', error);
    throw error;
  }
}

// Delete a gratitude entry from local storage
export async function deleteGuestGratitudeEntry(entryId: string): Promise<boolean> {
  try {
    const entries = await getGuestGratitudeEntries();
    const filteredEntries = entries.filter(entry => entry.id !== entryId);
    
    if (filteredEntries.length === entries.length) {
      console.error('Gratitude entry not found for deletion:', entryId);
      return false;
    }
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEntries));
    return true;
  } catch (error) {
    console.error('Error deleting guest gratitude entry:', error);
    return false;
  }
}

// Clear all gratitude entries (useful for testing or reset)
export async function clearAllGuestGratitudeEntries(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing guest gratitude entries:', error);
    throw error;
  }
}
