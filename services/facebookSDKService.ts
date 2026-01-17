/**
 * Facebook SDK Service
 * Handles Meta Ads integration and app event tracking
 * 
 * NOTE: This SDK only works in native builds (EAS Build).
 * It will gracefully fail in Expo Go development mode.
 */

import { Platform } from 'react-native';

// Track if we're in a native environment where Facebook SDK works
let isNativeEnvironment = false;
let Settings: any = null;
let AppEventsLogger: any = null;

// Try to import and validate Facebook SDK (will fail in Expo Go)
try {
    const fbsdk = require('react-native-fbsdk-next');
    Settings = fbsdk.Settings;
    AppEventsLogger = fbsdk.AppEventsLogger;

    // Check if the native modules are actually available (not null)
    // In Expo Go, the modules are imported but the native implementations are null
    if (Settings && AppEventsLogger &&
        typeof Settings.initializeSDK === 'function' &&
        typeof AppEventsLogger.logEvent === 'function') {
        isNativeEnvironment = true;
    }
} catch (error) {
    // Expected in Expo Go - silently ignore
    console.log('📱 Facebook SDK: Not available (expected in Expo Go)');
}

/**
 * Check if Facebook SDK is available and functional
 */
export const isFacebookSDKAvailable = (): boolean => {
    return isNativeEnvironment;
};

/**
 * Initialize Facebook SDK
 * Call this in your app's entry point (e.g., _layout.tsx)
 */
export const initializeFacebookSDK = async (): Promise<void> => {
    if (!isFacebookSDKAvailable()) {
        // Silently skip in Expo Go - this is expected behavior
        if (__DEV__) {
            console.log('📱 Facebook SDK: Skipping initialization (not in native build)');
        }
        return;
    }

    try {
        // Initialize the SDK
        if (Settings?.initializeSDK) {
            await Settings.initializeSDK();
        }

        // Enable advertiser ID collection (for better ad targeting)
        if (Settings?.setAdvertiserIDCollectionEnabled) {
            Settings.setAdvertiserIDCollectionEnabled(true);
        }

        // Enable auto-logging of app events
        if (Settings?.setAutoLogAppEventsEnabled) {
            Settings.setAutoLogAppEventsEnabled(true);
        }

        console.log('✅ Facebook SDK initialized successfully');
    } catch (error) {
        // Only log errors in production builds where SDK should work
        if (!__DEV__) {
            console.error('❌ Error initializing Facebook SDK:', error);
        }
    }
};

/**
 * Log app install event (typically called once on first launch)
 */
export const logAppInstall = async (): Promise<void> => {
    if (!isFacebookSDKAvailable()) return;

    try {
        AppEventsLogger.logEvent(AppEventsLogger.AppEvents.CompletedRegistration);
    } catch (error) {
        if (!__DEV__) {
            console.error('Error logging app install:', error);
        }
    }
};

/**
 * Log a custom event
 * @param eventName - Name of the event
 * @param params - Optional parameters to include with the event
 */
export const logEvent = (eventName: string, params?: Record<string, any>): void => {
    if (!isFacebookSDKAvailable()) return;

    try {
        if (params) {
            AppEventsLogger.logEvent(eventName, params);
        } else {
            AppEventsLogger.logEvent(eventName);
        }
        if (__DEV__) {
            console.log(`📊 Facebook event logged: ${eventName}`);
        }
    } catch (error) {
        if (!__DEV__) {
            console.error(`Error logging Facebook event ${eventName}:`, error);
        }
    }
};

/**
 * Log a purchase event (for tracking in-app purchases)
 * @param purchaseAmount - Amount of the purchase
 * @param currency - Currency code (e.g., 'USD')
 * @param params - Optional additional parameters
 */
export const logPurchase = (
    purchaseAmount: number,
    currency: string = 'USD',
    params?: Record<string, any>
): void => {
    if (!isFacebookSDKAvailable()) return;

    try {
        AppEventsLogger.logPurchase(purchaseAmount, currency, params);
    } catch (error) {
        if (!__DEV__) {
            console.error('Error logging Facebook purchase:', error);
        }
    }
};

/**
 * Log screen view event
 * @param screenName - Name of the screen being viewed
 */
export const logScreenView = (screenName: string): void => {
    logEvent('screen_view', { screen_name: screenName });
};

/**
 * Log content view event (e.g., viewing a Bible chapter)
 * @param contentId - ID of the content
 * @param contentType - Type of content
 */
export const logContentView = (contentId: string, contentType: string): void => {
    if (!isFacebookSDKAvailable()) return;

    try {
        AppEventsLogger.logEvent(AppEventsLogger.AppEvents.ViewedContent, {
            [AppEventsLogger.AppEventParams.ContentID]: contentId,
            [AppEventsLogger.AppEventParams.ContentType]: contentType,
        });
    } catch (error) {
        // Silently fail
    }
};

/**
 * Log search event
 * @param searchString - The search query
 * @param success - Whether the search returned results
 */
export const logSearch = (searchString: string, success: boolean): void => {
    if (!isFacebookSDKAvailable()) return;

    try {
        AppEventsLogger.logEvent(AppEventsLogger.AppEvents.Searched, {
            [AppEventsLogger.AppEventParams.SearchString]: searchString,
            [AppEventsLogger.AppEventParams.Success]: success ? 1 : 0,
        });
    } catch (error) {
        // Silently fail
    }
};

/**
 * Log subscription start event
 * @param subscriptionType - Type of subscription (e.g., 'weekly', 'monthly', 'yearly')
 */
export const logSubscriptionStart = (subscriptionType: string): void => {
    if (!isFacebookSDKAvailable()) return;

    try {
        AppEventsLogger.logEvent(AppEventsLogger.AppEvents.Subscribe, {
            subscription_type: subscriptionType,
        });
    } catch (error) {
        // Silently fail
    }
};

/**
 * Set user data for better ad targeting (optional, privacy-conscious)
 * Only set data you have explicit user consent for
 */
export const setUserData = (userData: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'm' | 'f';
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
}): void => {
    if (!isFacebookSDKAvailable()) return;

    try {
        if (Settings?.setUserData) {
            Settings.setUserData(userData);
        }
    } catch (error) {
        // Silently fail
    }
};

/**
 * Clear user data
 */
export const clearUserData = (): void => {
    if (!isFacebookSDKAvailable()) return;

    try {
        if (Settings?.setUserData) {
            Settings.setUserData({});
        }
    } catch (error) {
        // Silently fail
    }
};

// Pre-defined event names for common actions
export const FacebookEvents = {
    // Standard events
    ACHIEVED_LEVEL: 'fb_mobile_level_achieved',
    COMPLETED_TUTORIAL: 'fb_mobile_tutorial_completion',
    UNLOCKED_ACHIEVEMENT: 'fb_mobile_achievement_unlocked',

    // Custom app events
    BIBLE_CHAPTER_READ: 'bible_chapter_read',
    DAILY_VERSE_VIEWED: 'daily_verse_viewed',
    PRAYER_COMPLETED: 'prayer_completed',
    MOOD_LOGGED: 'mood_logged',
    GRATITUDE_ENTRY_ADDED: 'gratitude_entry_added',
    QUIZ_COMPLETED: 'quiz_completed',
    NOTES_CREATED: 'notes_created',
    AUDIO_PLAYED: 'audio_played',
    SHARE_CONTENT: 'share_content',
};

export default {
    isFacebookSDKAvailable,
    initializeFacebookSDK,
    logAppInstall,
    logEvent,
    logPurchase,
    logScreenView,
    logContentView,
    logSearch,
    logSubscriptionStart,
    setUserData,
    clearUserData,
    FacebookEvents,
};
