import { useAuth } from './useAuth';
import { usePrayers } from './usePrayers';
import { useGuestPrayers } from './useGuestPrayers';
import { useEffect, useState } from 'react';

export function useUnifiedPrayers() {
  const { user, isGuest, loading: authLoading } = useAuth();
  const [isReady, setIsReady] = useState(false);
  
  // Wait for auth to be ready
  useEffect(() => {
    if (!authLoading) {
      setIsReady(true);
    }
  }, [authLoading]);
  
  // Use the appropriate hook based on user type
  if (!isReady) {
    // Return a default state while loading
    return {
      prayers: [],
      loading: true,
      saving: false,
      addPrayer: async () => ({ data: null, error: 'Loading' }),
      updatePrayer: async () => ({ data: null, error: 'Loading' }),
      deletePrayer: async () => ({ data: null, error: 'Loading' }),
      refetch: async () => {},
    };
  }
  
  if (user && !isGuest) {
    return usePrayers();
  } else {
    return useGuestPrayers();
  }
}