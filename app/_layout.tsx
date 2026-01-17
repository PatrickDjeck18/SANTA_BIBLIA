// 1. Polyfill the crypto module at the very top of the file
import 'react-native-get-random-values';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useMemo } from 'react';
import { AdManager } from '../lib/adMobService';
import { useATT } from '../hooks/useATT';
import { useAdMob } from '../hooks/useAdMob';
import { Platform, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SubscriptionProvider } from '../context/SubscriptionContext';
import { requestNotificationPermissions } from '../lib/notificationService';
import { useAppRating } from '../hooks/useAppRating';
import ErrorBoundary from '../components/ErrorBoundary';
import * as SplashScreen from 'expo-splash-screen';
import { initializeFacebookSDK, logEvent, FacebookEvents } from '../services/facebookSDKService';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

// Safe wrapper hook for ATT - wraps the result, not the hook call
function useSafeATT() {
  const attResult = useATT();

  // Return safe defaults if anything is undefined
  return useMemo(() => ({
    shouldShowDialog: attResult?.shouldShowDialog ?? false,
    showPermissionDialog: attResult?.showPermissionDialog ?? (() => Promise.resolve(false)),
    isLoading: attResult?.isLoading ?? false,
    status: attResult?.status ?? 'denied',
    canShowAds: attResult?.canShowAds ?? true,
    isAuthorized: attResult?.isAuthorized ?? false,
  }), [attResult]);
}

// Safe wrapper hook for AdMob
function useSafeAdMob() {
  const adMobResult = useAdMob();

  // Return safe defaults if anything is undefined
  return useMemo(() => ({
    isInitialized: adMobResult?.isInitialized ?? false,
    isInitializing: adMobResult?.isInitializing ?? false,
    error: adMobResult?.error ?? null,
  }), [adMobResult]);
}

// Loading screen component
function LoadingScreen() {
  return (
    <View style={loadingStyles.container}>
      <ActivityIndicator size="large" color="#6366f1" />
      <Text style={loadingStyles.text}>Loading...</Text>
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#ffffff',
    marginTop: 16,
    fontSize: 16,
  },
});

function RootLayoutContent() {
  const [isReady, setIsReady] = useState(false);
  const attState = useSafeATT();
  const adMobState = useSafeAdMob();

  // Initialize app rating logic - wrapped in its own component/hook
  useAppRating();

  // Set app as ready after a short delay to ensure everything is loaded
  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsReady(true);
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('Error hiding splash screen:', e);
      }
    }, 500); // Increased delay slightly to ensure stability
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Initialize AdMob on app start with proper error handling
    const initializeAdMob = async () => {
      try {
        console.log('🚀 Starting AdMob initialization...');

        // Check if AdMob is available on this platform
        if (!AdManager.isAvailable()) {
          console.warn('⚠️ AdMob is not available on this platform');
          return;
        }

        // Add a small delay to ensure the app is fully loaded
        await new Promise(resolve => setTimeout(resolve, 500));

        // Initialize AdMob with timeout protection
        const initPromise = AdManager.initialize();
        const timeoutPromise = new Promise<boolean>((_, reject) =>
          setTimeout(() => reject(new Error('AdMob init timeout')), 15000)
        );

        const success = await Promise.race([initPromise, timeoutPromise]).catch(() => false);

        if (success) {
          console.log('✅ AdMob initialized successfully');
          console.log(`📱 Platform: ${Platform.OS}`);
          console.log(`🎯 AdMob ready for ${Platform.OS} platform`);
        } else {
          console.warn('⚠️ AdMob initialization failed or timed out');
        }

      } catch (error) {
        console.error('❌ Failed to initialize AdMob:', error);
        // Don't crash the app if ad initialization fails
      }
    };

    // Initialize immediately on app start
    initializeAdMob();

    // Initialize Facebook SDK for Meta Ads tracking
    const initFacebookSDK = async () => {
      try {
        console.log('🔵 Starting Facebook SDK initialization...');
        await initializeFacebookSDK();
        // Log app launch event
        logEvent('app_launched');
        console.log('✅ Facebook SDK initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Facebook SDK:', error);
        // Don't crash the app if Facebook SDK initialization fails
      }
    };
    initFacebookSDK();

    // Cleanup on unmount
    return () => {
      try {
        AdManager.destroyAll();
        console.log('🧹 AdMob cleanup completed');
      } catch (error) {
        console.error('Error during AdMob cleanup:', error);
      }
    };
  }, []);

  // Log AdMob status changes
  useEffect(() => {
    if (adMobState.isInitialized) {
      console.log('✅ AdMob is ready for use');
    } else if (adMobState.isInitializing) {
      console.log('⏳ AdMob is initializing...');
    } else if (adMobState.error) {
      console.error('❌ AdMob initialization error:', adMobState.error);
    }
  }, [adMobState.isInitialized, adMobState.isInitializing, adMobState.error]);

  // Handle ATT permission dialog
  useEffect(() => {
    if (attState.shouldShowDialog && !attState.isLoading) {
      try {
        attState.showPermissionDialog();
      } catch (error) {
        console.error('Error showing ATT dialog:', error);
      }
    }
  }, [attState.shouldShowDialog, attState.isLoading, attState.showPermissionDialog]);

  // Initialize notification permissions and enable by default on first launch
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Request notification permissions (this is safe to call multiple times)
        const hasPermission = await requestNotificationPermissions();

        if (!hasPermission) {
          console.log('⚠️ Notification permissions not granted, skipping auto-enable');
          return;
        }

        // Import notification service functions
        const {
          getNotificationPreferences,
          hasNotificationPreferencesBeenSet,
          scheduleMorningNotification,
        } = await import('../lib/notificationService');

        // Check if this is the first launch (no preferences saved)
        const hasBeenSet = await hasNotificationPreferencesBeenSet();
        const preferences = await getNotificationPreferences();

        // If first launch and preferences default to enabled, schedule notifications
        if (!hasBeenSet && preferences.enabled) {
          console.log('🌅 First launch: Enabling morning notifications by default');
          await scheduleMorningNotification(preferences.hour, preferences.minute);
          console.log('✅ Morning notifications enabled by default');
        } else if (preferences.enabled) {
          // If notifications are already enabled, ensure they're scheduled
          await scheduleMorningNotification(preferences.hour, preferences.minute);
          console.log('✅ Morning notifications initialized');
        }
      } catch (error) {
        console.error('❌ Error initializing notifications:', error);
        // Don't crash the app if notification initialization fails
      }
    };

    // Initialize notifications after a short delay to avoid blocking app startup
    const timer = setTimeout(initializeNotifications, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Show loading screen until ready
  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <SubscriptionProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="add-prayer" />
          <Stack.Screen name="edit-prayer" />
          <Stack.Screen name="prayer-journal" />
          <Stack.Screen name="note-taker" />
          <Stack.Screen name="dream-interpretation" />
          <Stack.Screen name="privacy-policy" />
          <Stack.Screen name="terms-of-service" />
          <Stack.Screen name="dream-result" />
          <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
          <Stack.Screen name="bible-study-notes" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </SubscriptionProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <RootLayoutContent />
    </ErrorBoundary>
  );
}