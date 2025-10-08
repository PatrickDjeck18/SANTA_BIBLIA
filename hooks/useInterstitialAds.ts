import { useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Platform } from 'react-native';
import { AdManager } from '../lib/adMobService';
import { ADS_CONFIG } from '../lib/adsConfig';
import { useAds } from './useAds';

export const useInterstitialAds = (page: string) => {
  const { showAds } = useAds();

  const showInterstitialAd = useCallback(async () => {
    if (!showAds) return true; // Skip ads if user is premium

    try {
      const adId = Platform.select({
        ios: ADS_CONFIG.ADMOB.IOS_INTERSTITIAL_ID,
        android: ADS_CONFIG.ADMOB.INTERSTITIAL_ID,
        default: ADS_CONFIG.ADMOB.INTERSTITIAL_ID,
      });
      const interstitial = AdManager.getInterstitial(adId || ADS_CONFIG.ADMOB.INTERSTITIAL_ID);
      return await interstitial.showAd();
    } catch (error) {
      console.error(`Error showing interstitial ad for ${page}:`, error);
      return false;
    }
  }, [showAds, page]);

  // Show interstitial ad when page gains focus
  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const showAdOnFocus = async () => {
        if (!mounted || !showAds) return;

        // Add a small delay to ensure the page is fully loaded
        setTimeout(async () => {
          if (mounted) {
            await showInterstitialAd();
          }
        }, 1000);
      };

      showAdOnFocus();

      return () => {
        mounted = false;
      };
    }, [showAds, showInterstitialAd])
  );

  return {
    showInterstitialAd,
  };
};