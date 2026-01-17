import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NOTIFICATION_STORAGE_KEY = '@bible_kjv_morning_notification';
const NOTIFICATION_TIME_KEY = '@bible_kjv_notification_time';

export interface NotificationPreferences {
  enabled: boolean;
  hour: number; // 0-23
  minute: number; // 0-59
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted');
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('morning-reminder', {
        name: 'Morning Bible Reminder',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#8B5CF6',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Get notification preferences from storage
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Default: Enabled at 8:00 AM (for first launch)
    return { enabled: true, hour: 8, minute: 0 };
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    // Default: Enabled at 8:00 AM (for first launch)
    return { enabled: true, hour: 8, minute: 0 };
  }
}

/**
 * Check if notification preferences have been set (not first launch)
 */
export async function hasNotificationPreferencesBeenSet(): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
    return stored !== null;
  } catch (error) {
    console.error('Error checking notification preferences:', error);
    return false;
  }
}

/**
 * Save notification preferences to storage
 */
export async function saveNotificationPreferences(
  preferences: NotificationPreferences
): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving notification preferences:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling notifications:', error);
  }
}

/**
 * Schedule daily morning notification
 */
export async function scheduleMorningNotification(
  hour: number = 8,
  minute: number = 0
): Promise<string | null> {
  try {
    // Cancel existing notifications first
    await cancelAllNotifications();

    // Request permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Cannot schedule notification: permissions not granted');
      return null;
    }

    // Get current date and set target time
    const now = new Date();
    const scheduledDate = new Date();
    scheduledDate.setHours(hour, minute, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (scheduledDate <= now) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }

    // Get daily verse text (you can customize this)
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌅 Good Morning!',
        body: 'Start your day with God\'s word. Read today\'s Bible verse and prayer.',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: {
          type: 'morning_reminder',
          timestamp: Date.now(),
        },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
        channelId: Platform.OS === 'android' ? 'morning-reminder' : undefined,
      },
    });

    console.log(`Morning notification scheduled for ${hour}:${minute.toString().padStart(2, '0')}`);
    
    // Save preferences
    await saveNotificationPreferences({ enabled: true, hour, minute });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling morning notification:', error);
    return null;
  }
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Check if notifications are enabled
 */
export async function isNotificationEnabled(): Promise<boolean> {
  try {
    const preferences = await getNotificationPreferences();
    return preferences.enabled;
  } catch (error) {
    console.error('Error checking notification status:', error);
    return false;
  }
}

/**
 * Enable morning notifications
 */
export async function enableMorningNotifications(
  hour: number = 8,
  minute: number = 0
): Promise<boolean> {
  try {
    const notificationId = await scheduleMorningNotification(hour, minute);
    return notificationId !== null;
  } catch (error) {
    console.error('Error enabling morning notifications:', error);
    return false;
  }
}

/**
 * Disable morning notifications
 */
export async function disableMorningNotifications(): Promise<void> {
  try {
    await cancelAllNotifications();
    await saveNotificationPreferences({ enabled: false, hour: 8, minute: 0 });
    console.log('Morning notifications disabled');
  } catch (error) {
    console.error('Error disabling morning notifications:', error);
  }
}

/**
 * Update notification time
 */
export async function updateNotificationTime(
  hour: number,
  minute: number
): Promise<boolean> {
  try {
    const preferences = await getNotificationPreferences();
    if (preferences.enabled) {
      // Reschedule with new time
      return await enableMorningNotifications(hour, minute);
    } else {
      // Just update the preferences
      await saveNotificationPreferences({ enabled: false, hour, minute });
      return true;
    }
  } catch (error) {
    console.error('Error updating notification time:', error);
    return false;
  }
}

