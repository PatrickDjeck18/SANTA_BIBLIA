import { MobileAds, AdEventType, TestIds, InterstitialAd, RewardedAd } from 'react-native-google-mobile-ads';
import { ADS_CONFIG } from './adsConfig';
import { attService } from './attService';
import { Platform } from 'react-native';

// Initialize AdMob
export const initializeAdMob = async () => {
  try {
    console.log('🔧 Initializing AdMob service...');

    // Skip on web platform
    if (Platform.OS === 'web') {
      console.log('⚠️ AdMob not supported on web platform');
      return false;
    }

    // Check if AdMob is available on this platform
    if (!MobileAds) {
      console.warn('⚠️ AdMob is not available on this platform');
      return false;
    }

    // Initialize ATT service first with error handling (iOS only)
    if (Platform.OS === 'ios') {
      try {
        console.log('🔐 Initializing ATT service...');
        await attService.initialize();
        console.log('✅ ATT service initialized');
      } catch (attError) {
        console.warn('⚠️ ATT initialization failed, continuing without ATT:', attError);
      }
    }

    // Initialize MobileAds with timeout and additional error handling
    console.log('📱 Initializing MobileAds...');

    let mobileAdsInstance;
    try {
      mobileAdsInstance = MobileAds();
    } catch (instanceError) {
      console.error('❌ Failed to get MobileAds instance:', instanceError);
      return false;
    }

    if (!mobileAdsInstance) {
      console.warn('⚠️ MobileAds instance is null');
      return false;
    }

    const initPromise = mobileAdsInstance.initialize();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AdMob initialization timeout')), 10000)
    );

    await Promise.race([initPromise, timeoutPromise]);
    console.log('✅ AdMob initialized successfully');

    return true;
  } catch (error) {
    console.error('❌ Error initializing AdMob:', error);
    // Don't throw error to prevent app crash
    return false;
  }
};

// Banner Ad Component Props
export interface BannerAdProps {
  unitId: string;
  size?: string;
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: any) => void;
}

// Interstitial Ad Service
export class InterstitialAdService {
  private interstitial: any = null;
  private isLoading: boolean = false;
  private loadTimeout: number | null = null;

  constructor(private unitId: string) {
    this.loadInterstitial();
  }

  private async loadInterstitial() {
    if (this.isLoading || this.interstitial?.loaded) return;

    try {
      this.isLoading = true;

      // Clean up existing ad instance
      if (this.interstitial) {
        if (typeof this.interstitial.destroy === 'function') {
          this.interstitial.destroy();
        }
        this.interstitial = null;
      }

      this.interstitial = InterstitialAd.createForAdRequest(
        __DEV__ ? TestIds.INTERSTITIAL : this.unitId,
        {
          requestNonPersonalizedAdsOnly: attService.getNonPersonalizedAdsSetting(),
          keywords: ['bible', 'prayer', 'christian', 'faith', 'religion'],
        }
      );

      // Set up load timeout
      this.loadTimeout = setTimeout(() => {
        this.isLoading = false;
        if (this.interstitial && !this.interstitial.loaded) {
          console.warn('Interstitial ad load timeout');
        }
      }, 10000);

      // Preload the ad
      await this.interstitial.load();
      this.isLoading = false;
      if (this.loadTimeout) {
        clearTimeout(this.loadTimeout);
        this.loadTimeout = null;
      }
    } catch (error) {
      this.isLoading = false;
      if (this.loadTimeout) {
        clearTimeout(this.loadTimeout);
        this.loadTimeout = null;
      }
      console.error('Error loading interstitial ad:', error);
      this.interstitial = null;
    }
  }

  async showAd(): Promise<boolean> {
    try {
      if (!this.interstitial) {
        await this.loadInterstitial();
        return false;
      }

      return new Promise((resolve) => {
        let resolved = false;

        const cleanup = () => {
          if (resolved) return;
          resolved = true;
          if (unsubscribeLoaded) unsubscribeLoaded();
          if (unsubscribeError) unsubscribeError();
          if (unsubscribeClosed) unsubscribeClosed();
        };

        const unsubscribeLoaded = this.interstitial.addAdEventListener(
          AdEventType.LOADED,
          () => {
            if (!resolved) {
              this.interstitial.show();
              resolve(true);
            }
            cleanup();
          }
        );

        const unsubscribeError = this.interstitial.addAdEventListener(
          AdEventType.ERROR,
          (error: any) => {
            console.error('Interstitial ad error:', error);
            if (!resolved) {
              resolve(false);
            }
            cleanup();
          }
        );

        const unsubscribeClosed = this.interstitial.addAdEventListener(
          AdEventType.CLOSED,
          () => {
            cleanup();
          }
        );

        // If ad is already loaded, show it immediately
        if (this.interstitial.loaded) {
          this.interstitial.show();
          resolve(true);
          cleanup();
        } else {
          // Load the ad if not loaded
          this.interstitial.load();
        }

        // Timeout after 8 seconds
        setTimeout(() => {
          if (!resolved) {
            resolve(false);
            cleanup();
          }
        }, 8000);
      });
    } catch (error) {
      console.error('Error showing interstitial ad:', error);
      return false;
    }
  }

  // Clean up resources
  destroy() {
    if (this.interstitial) {
      try {
        if (typeof this.interstitial.destroy === 'function') {
          this.interstitial.destroy();
        }
      } catch (error) {
        console.error('Error destroying interstitial ad:', error);
      }
      this.interstitial = null;
    }
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
      this.loadTimeout = null;
    }
    this.isLoading = false;
  }
}

// Rewarded Ad Service
export class RewardedAdService {
  private rewarded: any = null;
  private isLoading: boolean = false;
  private loadTimeout: number | null = null;

  constructor(private unitId: string) {
    this.loadRewarded();
  }

  private async loadRewarded() {
    if (this.isLoading || this.rewarded?.loaded) return;

    try {
      this.isLoading = true;

      // Check if AdMob is available
      if (!MobileAds) {
        console.warn('AdMob not available on this platform');
        this.isLoading = false;
        return;
      }

      // Clean up existing ad instance
      if (this.rewarded) {
        if (typeof this.rewarded.destroy === 'function') {
          this.rewarded.destroy();
        }
        this.rewarded = null;
      }

      this.rewarded = RewardedAd.createForAdRequest(
        __DEV__ ? TestIds.REWARDED : this.unitId,
        {
          requestNonPersonalizedAdsOnly: attService.getNonPersonalizedAdsSetting(),
          keywords: ['bible', 'prayer', 'christian', 'faith', 'religion'],
        }
      );

      // Set up load timeout
      this.loadTimeout = setTimeout(() => {
        this.isLoading = false;
        if (this.rewarded && !this.rewarded.loaded) {
          console.warn('Rewarded ad load timeout');
        }
      }, 15000) as any;

      // Preload the ad
      await this.rewarded.load();
      this.isLoading = false;
      if (this.loadTimeout) {
        clearTimeout(this.loadTimeout);
        this.loadTimeout = null;
      }
    } catch (error) {
      this.isLoading = false;
      if (this.loadTimeout) {
        clearTimeout(this.loadTimeout);
        this.loadTimeout = null;
      }
      console.error('Error loading rewarded ad:', error);
      this.rewarded = null;
    }
  }

  async showAd(): Promise<{ success: boolean; reward?: any }> {
    try {
      // Check if AdMob is available
      if (!MobileAds) {
        console.warn('AdMob not available on this platform');
        return { success: false };
      }

      if (!this.rewarded) {
        await this.loadRewarded();
        if (!this.rewarded) {
          return { success: false };
        }
      }

      return new Promise((resolve) => {
        let rewardEarned = false;
        let resolved = false;

        const cleanup = () => {
          if (resolved) return;
          resolved = true;
          if (unsubscribeLoaded) unsubscribeLoaded();
          if (unsubscribeRewarded) unsubscribeRewarded();
          if (unsubscribeClosed) unsubscribeClosed();
          if (unsubscribeError) unsubscribeError();
        };

        const unsubscribeLoaded = this.rewarded.addAdEventListener(
          AdEventType.LOADED,
          () => {
            if (!resolved) {
              this.rewarded.show();
            }
            // Don't cleanup here as we need other listeners
          }
        );

        // Use the correct event type for rewarded ads
        const unsubscribeRewarded = this.rewarded.addAdEventListener(
          'rewarded',
          (reward: any) => {
            rewardEarned = true;
          }
        );

        const unsubscribeClosed = this.rewarded.addAdEventListener(
          AdEventType.CLOSED,
          () => {
            if (!resolved) {
              resolve({ success: rewardEarned, reward: rewardEarned ? { type: 'reward', amount: 1 } : undefined });
            }
            cleanup();
          }
        );

        const unsubscribeError = this.rewarded.addAdEventListener(
          AdEventType.ERROR,
          (error: any) => {
            console.error('Rewarded ad error:', error);
            if (!resolved) {
              resolve({ success: false });
            }
            cleanup();
          }
        );

        // If ad is already loaded, show it immediately
        if (this.rewarded.loaded) {
          this.rewarded.show();
        } else {
          // Load the ad if not loaded
          this.rewarded.load();
        }

        // Timeout after 15 seconds
        setTimeout(() => {
          if (!resolved) {
            resolve({ success: false });
            cleanup();
          }
        }, 15000);
      });
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      return { success: false };
    }
  }

  // Clean up resources
  destroy() {
    if (this.rewarded) {
      try {
        if (typeof this.rewarded.destroy === 'function') {
          this.rewarded.destroy();
        }
      } catch (error) {
        console.error('Error destroying rewarded ad:', error);
      }
      this.rewarded = null;
    }
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
      this.loadTimeout = null;
    }
    this.isLoading = false;
  }
}

// Ad Manager for handling different ad types
export class AdManager {
  private static instances: Map<string, InterstitialAdService | RewardedAdService> = new Map();
  private static isInitialized: boolean = false;
  private static initializationPromise: Promise<boolean> | null = null;

  static async initialize(): Promise<boolean> {
    // If already initialized, return true
    if (this.isInitialized) {
      console.log('✅ AdManager already initialized');
      return true;
    }

    // If initialization is in progress, wait for it
    if (this.initializationPromise) {
      console.log('⏳ AdManager initialization in progress, waiting...');
      return this.initializationPromise;
    }

    // Start new initialization
    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private static async performInitialization(): Promise<boolean> {
    try {
      console.log('🚀 Starting AdManager initialization...');
      const success = await initializeAdMob();

      if (success) {
        this.isInitialized = true;
        console.log('✅ AdManager initialized successfully');
        return true;
      } else {
        console.warn('⚠️ AdManager initialization failed, but app will continue');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to initialize AdManager:', error);
      return false;
    } finally {
      // Clear the promise so we can retry if needed
      this.initializationPromise = null;
    }
  }

  // Check if AdManager is initialized
  static getInitializationStatus(): boolean {
    return this.isInitialized;
  }

  // Get initialization promise if in progress
  static getInitializationPromise(): Promise<boolean> | null {
    return this.initializationPromise;
  }

  static getInterstitial(unitId: string): InterstitialAdService {
    const key = `interstitial_${unitId}`;
    if (!this.instances.has(key)) {
      this.instances.set(key, new InterstitialAdService(unitId));
    }
    return this.instances.get(key) as InterstitialAdService;
  }

  static getRewarded(unitId: string): RewardedAdService {
    const key = `rewarded_${unitId}`;
    if (!this.instances.has(key)) {
      this.instances.set(key, new RewardedAdService(unitId));
    }
    return this.instances.get(key) as RewardedAdService;
  }

  // Clean up all ad instances
  static destroyAll() {
    this.instances.forEach((instance) => {
      try {
        instance.destroy();
      } catch (error) {
        console.error('Error destroying ad instance:', error);
      }
    });
    this.instances.clear();
    console.log('All ad instances destroyed');
  }

  // Check if AdMob is available on current platform
  static isAvailable(): boolean {
    try {
      return !!MobileAds;
    } catch {
      return false;
    }
  }
}