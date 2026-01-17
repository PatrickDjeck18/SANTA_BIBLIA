import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Minimal app user - local storage only, no authentication required
export type AppUser = {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  isGuest?: boolean;
};

// AsyncStorage keys
const AUTH_USER_KEY = '@auth_user';
const LOCAL_USER_ID_KEY = '@local_user_id';

// Get or create a persistent local user ID
async function getOrCreateLocalUserId(): Promise<string> {
  try {
    let userId = await AsyncStorage.getItem(LOCAL_USER_ID_KEY);
    if (!userId) {
      userId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(LOCAL_USER_ID_KEY, userId);
    }
    return userId;
  } catch (error) {
    console.error('Error getting local user ID:', error);
    return `local_${Date.now()}`;
  }
}

// Save user data to AsyncStorage
async function saveAuthState(user: AppUser | null) {
  try {
    if (user) {
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(AUTH_USER_KEY);
    }
  } catch (error) {
    console.error('Error saving auth state:', error);
  }
}

// Load user data from AsyncStorage
async function loadAuthState(): Promise<AppUser | null> {
  try {
    const userData = await AsyncStorage.getItem(AUTH_USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error loading auth state:', error);
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Always authenticated as local user
  const isAuthenticated = true;
  const isGuest = true;

  // Initialize local user immediately
  useEffect(() => {
    let isMounted = true;

    const initializeLocalUser = async () => {
      try {
        // Try to load existing user first
        let storedUser = await loadAuthState();

        if (!storedUser) {
          // Create new local user
          const userId = await getOrCreateLocalUserId();
          storedUser = {
            uid: userId,
            email: null,
            displayName: null,
            isGuest: true,
          };
          await saveAuthState(storedUser);
        }

        if (isMounted) {
          setUser(storedUser);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing local user:', error);
        // Create fallback user
        const fallbackUser: AppUser = {
          uid: `local_${Date.now()}`,
          email: null,
          displayName: 'User',
          isGuest: true,
        };
        if (isMounted) {
          setUser(fallbackUser);
          setLoading(false);
        }
      }
    };

    initializeLocalUser();

    return () => {
      isMounted = false;
    };
  }, []);

  // No-op functions for backward compatibility (optional, or just remove them if not used heavily)
  // We are removing them as per request "remove all authentication".
  // Consumer components might break if they destructure these, so I should check.
  // Ideally, I should remove them from the return object and update consumers.

  return {
    user,
    isAuthenticated,
    isGuest,
    loading,
    // Provide empty functions for now if we want to avoid immediate crash before updating consumers,
    // but the request implies removing them. I'll remove them and fix consumers.
  };
}