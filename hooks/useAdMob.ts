import { useState, useEffect } from 'react';
import { AdManager } from '../lib/adMobService';

export interface AdMobStatus {
  isInitialized: boolean;
  isInitializing: boolean;
  error: string | null;
}

export function useAdMob(): AdMobStatus {
  const [status, setStatus] = useState<AdMobStatus>({
    isInitialized: false,
    isInitializing: false,
    error: null,
  });

  useEffect(() => {
    // Check if AdMob is already initialized
    const checkInitialization = async () => {
      try {
        const isInitialized = AdManager.getInitializationStatus();
        const initializationPromise = AdManager.getInitializationPromise();
        
        if (isInitialized) {
          setStatus({
            isInitialized: true,
            isInitializing: false,
            error: null,
          });
        } else if (initializationPromise) {
          setStatus(prev => ({
            ...prev,
            isInitializing: true,
            error: null,
          }));
          
          // Wait for initialization to complete
          const result = await initializationPromise;
          setStatus({
            isInitialized: result,
            isInitializing: false,
            error: result ? null : 'AdMob initialization failed',
          });
        } else {
          // Try to initialize if not already done
          setStatus(prev => ({
            ...prev,
            isInitializing: true,
            error: null,
          }));
          
          const result = await AdManager.initialize();
          setStatus({
            isInitialized: result,
            isInitializing: false,
            error: result ? null : 'AdMob initialization failed',
          });
        }
      } catch (error) {
        console.error('Error checking AdMob status:', error);
        setStatus({
          isInitialized: false,
          isInitializing: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    };

    checkInitialization();
  }, []);

  return status;
}

// Hook for getting AdMob initialization status without triggering initialization
export function useAdMobStatus(): boolean {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      const status = AdManager.getInitializationStatus();
      setIsInitialized(status);
    };

    checkStatus();
    
    // Check status periodically
    const interval = setInterval(checkStatus, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return isInitialized;
}
