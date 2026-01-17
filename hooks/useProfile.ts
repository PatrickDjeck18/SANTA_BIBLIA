import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Profile {
  full_name: string | null;
  journey_start_date: string | null;
}

const PROFILE_STORAGE_KEY = 'user_profile_local';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const storedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);

      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      } else {
        // Create default local profile
        const defaultProfile: Profile = {
          full_name: 'Guest User',
          journey_start_date: new Date().toISOString().split('T')[0],
        };
        await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(defaultProfile));
        setProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error fetching local profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    try {
      const currentProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      const parsedProfile = currentProfile ? JSON.parse(currentProfile) : {};

      const newProfile = {
        ...parsedProfile,
        ...updates,
      };

      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
      setProfile(newProfile);
      return { data: newProfile, error: null };
    } catch (error: any) {
      console.error('Error updating local profile:', error);
      return { error: error.message || 'Failed to update profile' };
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile,
  };
}