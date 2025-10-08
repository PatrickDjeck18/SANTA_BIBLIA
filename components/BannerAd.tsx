import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { ADS_CONFIG } from '../lib/adsConfig';
import { useAds } from '../hooks/useAds';
import { AdManager } from '../lib/adMobService';

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

  useEffect(() => {
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
  }, []);

  // Use platform-specific banner sizes for better compatibility
  const getBannerSize = () => {
    if (size) return size;

    if (Platform.OS === 'ios') {
      return BannerAdSize.BANNER; // Standard banner size for iOS
    } else {
      return BannerAdSize.ANCHORED_ADAPTIVE_BANNER; // Adaptive for Android
    }
  };

  // Don't render if AdMob is not available or ads are disabled
  if (!showAds || !isAdMobAvailable) {
    return null;
  }

  // Don't show ads if user is premium
  if (!showAds) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={getBannerSize()}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
          keywords: ['bible', 'prayer', 'christian', 'faith', 'religion'],
          // iOS-specific request options
          ...(Platform.OS === 'ios' && {
            requestNonPersonalizedAdsOnly: true,
          }),
        }}
        onAdLoaded={() => {
          console.log(`Banner ad loaded for ${placement}`);
        }}
        onAdFailedToLoad={(error: any) => {
          console.error(`Banner ad failed for ${placement}:`, error);
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 8,
  },
});

export default BannerAdComponent;