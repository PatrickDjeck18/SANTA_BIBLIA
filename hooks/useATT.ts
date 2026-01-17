import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { attService, ATTResult } from '../lib/attService';

export interface ATTState {
  status: string;
  canShowAds: boolean;
  isAuthorized: boolean;
  isLoading: boolean;
  shouldShowDialog: boolean;
}

export const useATT = () => {
  const [attState, setAttState] = useState<ATTState>({
    status: 'not-determined',
    canShowAds: true,
    isAuthorized: false,
    isLoading: true,
    shouldShowDialog: false,
  });

  // Initialize ATT service
  const initializeATT = useCallback(async () => {
    try {
      setAttState(prev => ({ ...prev, isLoading: true }));
      
      const result = await attService.initialize();
      
      setAttState({
        status: result.status,
        canShowAds: result.canShowAds,
        isAuthorized: result.isAuthorized,
        isLoading: false,
        shouldShowDialog: attService.shouldShowATTDialog(),
      });
    } catch (error) {
      console.error('Error initializing ATT:', error);
      // Set a safe default state instead of crashing
      setAttState({
        status: 'denied',
        canShowAds: true,
        isAuthorized: false,
        isLoading: false,
        shouldShowDialog: false,
      });
    }
  }, []);

  // Request permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setAttState(prev => ({ ...prev, isLoading: true }));
      
      const result = await attService.requestPermission();
      
      setAttState({
        status: result.status,
        canShowAds: result.canShowAds,
        isAuthorized: result.isAuthorized,
        isLoading: false,
        shouldShowDialog: false,
      });
      
      return result.isAuthorized;
    } catch (error) {
      console.error('Error requesting ATT permission:', error);
      setAttState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  // Show permission dialog (now uses native iOS ATT dialog)
  const showPermissionDialog = useCallback(async (): Promise<boolean> => {
    try {
      setAttState(prev => ({ ...prev, isLoading: true }));
      
      // This will now trigger the native iOS ATT permission dialog
      const result = await attService.requestPermission();
      
      setAttState({
        status: result.status,
        canShowAds: result.canShowAds,
        isAuthorized: result.isAuthorized,
        isLoading: false,
        shouldShowDialog: false,
      });
      
      return result.isAuthorized;
    } catch (error) {
      console.error('Error showing ATT dialog:', error);
      setAttState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (Platform.OS === 'ios') {
      initializeATT();
    } else {
      // Non-iOS platforms don't need ATT
      setAttState({
        status: 'authorized',
        canShowAds: true,
        isAuthorized: true,
        isLoading: false,
        shouldShowDialog: false,
      });
    }
  }, [initializeATT]);

  return {
    ...attState,
    requestPermission,
    showPermissionDialog,
    initializeATT,
  };
};
