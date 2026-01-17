import { Platform, Alert } from 'react-native';
import { requestTrackingPermission, getTrackingStatus, TrackingStatus } from 'react-native-tracking-transparency';

export interface ATTResult {
  status: TrackingStatus;
  canShowAds: boolean;
  isAuthorized: boolean;
}

export class ATTService {
  private static instance: ATTService;
  private trackingStatus: TrackingStatus | null = null;
  private hasRequestedPermission = false;

  static getInstance(): ATTService {
    if (!ATTService.instance) {
      ATTService.instance = new ATTService();
    }
    return ATTService.instance;
  }

  /**
   * Initialize ATT service and check current status
   */
  async initialize(): Promise<ATTResult> {
    try {
      // Only run on iOS
      if (Platform.OS !== 'ios') {
        return {
          status: 'authorized' as TrackingStatus,
          canShowAds: true,
          isAuthorized: true,
        };
      }

      // Add a small delay to ensure the app is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      // Wrap the tracking status call in try-catch for iPad compatibility
      let trackingStatus: TrackingStatus;
      try {
        trackingStatus = await getTrackingStatus();
      } catch (trackingError) {
        console.warn('Could not get tracking status, defaulting to denied:', trackingError);
        trackingStatus = 'denied' as TrackingStatus;
      }

      this.trackingStatus = trackingStatus;

      return {
        status: this.trackingStatus,
        canShowAds: this.canShowAds(),
        isAuthorized: this.trackingStatus === 'authorized',
      };
    } catch (error) {
      console.error('Error initializing ATT service:', error);
      // Return a safe default instead of crashing
      this.trackingStatus = 'denied' as TrackingStatus;
      return {
        status: 'denied' as TrackingStatus,
        canShowAds: true, // Allow ads even if ATT fails
        isAuthorized: false,
      };
    }
  }

  /**
   * Request tracking permission from user using native iOS ATT dialog
   */
  async requestPermission(): Promise<ATTResult> {
    try {
      // Only run on iOS
      if (Platform.OS !== 'ios') {
        return {
          status: 'authorized' as TrackingStatus,
          canShowAds: true,
          isAuthorized: true,
        };
      }

      // Check current status first with error handling
      let currentStatus: TrackingStatus;
      try {
        currentStatus = await getTrackingStatus();
      } catch (statusError) {
        console.warn('Could not get tracking status:', statusError);
        currentStatus = 'not-determined' as TrackingStatus;
      }

      // If already determined, return current status
      if (currentStatus !== 'not-determined') {
        this.trackingStatus = currentStatus;
        this.hasRequestedPermission = true;
        return {
          status: this.trackingStatus,
          canShowAds: this.canShowAds(),
          isAuthorized: this.trackingStatus === 'authorized',
        };
      }

      // Request permission using native iOS ATT dialog with error handling
      console.log('Requesting ATT permission with native dialog...');
      try {
        this.trackingStatus = await requestTrackingPermission();
      } catch (permissionError) {
        console.warn('Could not request tracking permission:', permissionError);
        this.trackingStatus = 'denied' as TrackingStatus;
      }
      this.hasRequestedPermission = true;

      console.log('ATT permission result:', this.trackingStatus);

      return {
        status: this.trackingStatus,
        canShowAds: this.canShowAds(),
        isAuthorized: this.trackingStatus === 'authorized',
      };
    } catch (error) {
      console.error('Error requesting ATT permission:', error);
      this.trackingStatus = 'denied' as TrackingStatus;
      this.hasRequestedPermission = true;
      return {
        status: 'denied' as TrackingStatus,
        canShowAds: true, // Changed to true to allow non-personalized ads
        isAuthorized: false,
      };
    }
  }

  /**
   * Get current tracking status
   */
  getCurrentStatus(): ATTResult {
    return {
      status: this.trackingStatus || 'denied',
      canShowAds: this.canShowAds(),
      isAuthorized: this.trackingStatus === 'authorized',
    };
  }

  /**
   * Check if ads can be shown based on tracking status
   */
  private canShowAds(): boolean {
    if (Platform.OS !== 'ios') return true;

    // Can show ads if authorized or if status is not-determined (will show non-personalized ads)
    return this.trackingStatus === 'authorized' ||
      this.trackingStatus === 'not-determined' ||
      this.trackingStatus === 'restricted';
  }

  /**
   * Request permission using native iOS ATT dialog
   * This method now directly calls the native permission request
   */
  async showPermissionDialog(): Promise<boolean> {
    const result = await this.requestPermission();
    return result.isAuthorized;
  }

  /**
   * Check if we should show the ATT dialog
   */
  shouldShowATTDialog(): boolean {
    if (Platform.OS !== 'ios') return false;
    return this.trackingStatus === 'not-determined';
  }

  /**
   * Get personalized ads setting for AdMob requests
   */
  getPersonalizedAdsSetting(): boolean {
    if (Platform.OS !== 'ios') return true;
    return this.trackingStatus === 'authorized';
  }

  /**
   * Get non-personalized ads setting for AdMob requests
   */
  getNonPersonalizedAdsSetting(): boolean {
    if (Platform.OS !== 'ios') return false;
    return this.trackingStatus !== 'authorized';
  }
}

// Export singleton instance
export const attService = ATTService.getInstance();
