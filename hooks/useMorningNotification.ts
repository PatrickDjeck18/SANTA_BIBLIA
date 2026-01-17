import { useState, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  requestNotificationPermissions,
  getNotificationPreferences,
  enableMorningNotifications,
  disableMorningNotifications,
  updateNotificationTime,
  isNotificationEnabled,
  getAllScheduledNotifications,
  NotificationPreferences,
} from '../lib/notificationService';

export function useMorningNotification() {
  const [isEnabled, setIsEnabled] = useState(true); // Default to enabled
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true, // Default to enabled
    hour: 8,
    minute: 0,
  });
  const [hasPermission, setHasPermission] = useState(false);

  // Load notification status on mount
  useEffect(() => {
    loadNotificationStatus();
  }, []);

  // Check for notification permissions and status
  const loadNotificationStatus = useCallback(async () => {
    try {
      setIsLoading(true);

      // Check permissions
      const { status } = await Notifications.getPermissionsAsync();
      setHasPermission(status === 'granted');

      // Load preferences
      const prefs = await getNotificationPreferences();
      setPreferences(prefs);
      setIsEnabled(prefs.enabled);

      // Verify if notification is actually scheduled
      if (prefs.enabled) {
        const scheduled = await getAllScheduledNotifications();
        if (scheduled.length === 0) {
          // Preferences say enabled but no notification scheduled, reschedule it
          await enableMorningNotifications(prefs.hour, prefs.minute);
        }
      }
    } catch (error) {
      console.error('Error loading notification status:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Request permissions and enable notifications
  const enableNotifications = useCallback(async (hour: number = 8, minute: number = 0) => {
    try {
      setIsLoading(true);

      // Request permissions first
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Permissions Required',
          'Please enable notifications in your device settings to receive morning reminders.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Notifications.openSettingsAsync();
                }
              },
            },
          ]
        );
        setIsLoading(false);
        return false;
      }

      // Schedule notification
      // Check if notifications were already enabled (to avoid showing alert on auto-enable)
      const wasAlreadyEnabled = isEnabled;
      const success = await enableMorningNotifications(hour, minute);
      if (success) {
        setPreferences({ enabled: true, hour, minute });
        setIsEnabled(true);
        setHasPermission(true);
        // Only show alert if user manually enabled (was not enabled before)
        if (!wasAlreadyEnabled) {
          Alert.alert(
            'Notifications Enabled',
            `You'll receive a daily reminder at ${hour}:${minute.toString().padStart(2, '0')} AM`
          );
        }
        return true;
      } else {
        Alert.alert('Error', 'Failed to enable notifications. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      Alert.alert('Error', 'Failed to enable notifications. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Disable notifications
  const disableNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      await disableMorningNotifications();
      setPreferences((prev) => ({ ...prev, enabled: false }));
      setIsEnabled(false);
      Alert.alert('Notifications Disabled', 'Morning reminders have been turned off.');
    } catch (error) {
      console.error('Error disabling notifications:', error);
      Alert.alert('Error', 'Failed to disable notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update notification time
  const updateTime = useCallback(async (hour: number, minute: number) => {
    try {
      setIsLoading(true);
      const success = await updateNotificationTime(hour, minute);
      if (success) {
        setPreferences((prev) => ({ ...prev, hour, minute }));
        if (isEnabled) {
          Alert.alert(
            'Time Updated',
            `Notification time updated to ${hour}:${minute.toString().padStart(2, '0')} AM`
          );
        }
        return true;
      } else {
        Alert.alert('Error', 'Failed to update notification time. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Error updating notification time:', error);
      Alert.alert('Error', 'Failed to update notification time. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isEnabled]);

  // Toggle notifications
  const toggleNotifications = useCallback(async () => {
    if (isEnabled) {
      await disableNotifications();
    } else {
      await enableNotifications(preferences.hour, preferences.minute);
    }
  }, [isEnabled, preferences.hour, preferences.minute, enableNotifications, disableNotifications]);

  return {
    isEnabled,
    isLoading,
    preferences,
    hasPermission,
    enableNotifications,
    disableNotifications,
    updateTime,
    toggleNotifications,
    loadNotificationStatus,
  };
}

