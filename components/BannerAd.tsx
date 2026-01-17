import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform, Text } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { ADS_CONFIG } from '../lib/adsConfig';
import { useAds } from '../hooks/useAds';
import { AdManager } from '../lib/adMobService';
import { attService } from '../lib/attService';

interface BannerAdComponentProps {
  placement: 'home' | 'bible' | 'prayer' | 'mood' | 'quiz' | 'dream' | 'notes';
  size?: BannerAdSize;
}

const BannerAdComponent: React.FC<BannerAdComponentProps> = ({
  placement,
  size
}) => {
  const { showAds } = useAds();
  const [adUnitId, setAdUnitId] = useState(TestIds.BANNER);
  const [isAdMobAvailable, setIsAdMobAvailable] = useState(true);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adFailed, setAdFailed] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      // Check if AdMob is available on this platform
      const available = AdManager.isAvailable();
      setIsAdMobAvailable(available);

      if (!available) {
        console.warn('AdMob not available on this platform');
        return;
      }

      // Use test ID in development, platform-specific ID in production
      const adId = __DEV__ ? TestIds.BANNER : Platform.select({
        ios: ADS_CONFIG.ADMOB.IOS_BANNER_ID,
        android: ADS_CONFIG.ADMOB.BANNER_ID,
        default: ADS_CONFIG.ADMOB.BANNER_ID,
      });
      setAdUnitId(adId || TestIds.BANNER);
    } catch (error) {
      console.error('Error initializing BannerAd:', error);
      setHasError(true);
    }
  }, []);

  // Use standard banner size (320x50) for a compact appearance
  const getBannerSize = () => {
    if (size) return size;
    // Use standard BANNER size (320x50) for both platforms for consistent compact size
    return BannerAdSize.BANNER;
  };

  // Don't render if there was an error initializing
  if (hasError) {
    return null;
  }

  // Don't render if AdMob is not available or ads are disabled
  if (!showAds || !isAdMobAvailable) {
    return null;
  }

  // Don't show ads if user is premium
  if (!showAds) {
    return null;
  }

  // Wrap the BannerAd in try-catch for rendering safety
  try {
    return (
      <View style={styles.container}>
        <BannerAd
          unitId={adUnitId}
          size={getBannerSize()}
          requestOptions={{
            requestNonPersonalizedAdsOnly: attService.getNonPersonalizedAdsSetting(),
            keywords: ['bible', 'prayer', 'christian', 'faith', 'religion'],
          }}
          onAdLoaded={() => {
            console.log(`Banner ad loaded for ${placement}`);
            setAdLoaded(true);
            setAdFailed(false);
          }}
          onAdFailedToLoad={(error: any) => {
            console.error(`Banner ad failed for ${placement}:`, error);
            setAdFailed(true);
            setAdLoaded(false);
            // Log additional iOS-specific error information
            if (Platform.OS === 'ios' && error?.code) {
              console.error(`iOS AdMob error code: ${error.code}`);
            }
          }}
          onAdOpened={() => {
            console.log(`Banner ad opened for ${placement}`);
          }}
          onAdClosed={() => {
            console.log(`Banner ad closed for ${placement}`);
          }}
        />

        {/* Fallback content when ad fails to load */}
        {adFailed && !adLoaded && (
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackText}>Advertisement</Text>
          </View>
        )}
      </View>
    );
  } catch (renderError) {
    console.error('Error rendering BannerAd:', renderError);
    return null;
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 4,
    minHeight: 50, // Standard banner height
    width: '100%',
  },
  fallbackContainer: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    width: 320,
  },
  fallbackText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default BannerAdComponent;