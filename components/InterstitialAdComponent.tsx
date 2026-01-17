import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Platform } from 'react-native';
import { ADS_CONFIG } from '../lib/adsConfig';
import { useAds } from '../hooks/useAds';
import { AdManager } from '../lib/adMobService';
import { attService } from '../lib/attService';

interface InterstitialAdComponentProps {
  placement: 'home' | 'bible' | 'prayer' | 'mood' | 'quiz' | 'dream' | 'notes';
  onAdShown?: () => void;
  onAdFailed?: (error: any) => void;
  onAdClosed?: () => void;
}

const InterstitialAdComponent: React.FC<InterstitialAdComponentProps> = ({
  placement,
  onAdShown,
  onAdFailed,
  onAdClosed,
}) => {
  const { showAds } = useAds();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showInterstitialAd = async () => {
    if (!showAds) {
      console.log('Ads disabled, skipping interstitial');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Check if AdMob is available
      if (!AdManager.isAvailable()) {
        console.warn('AdMob not available on this platform');
        setError('AdMob not available');
        return;
      }

      // Check ATT status
      const attResult = attService.getCurrentStatus();
      if (!attResult.canShowAds) {
        console.warn('Cannot show ads due to ATT restrictions');
        setError('Cannot show ads');
        return;
      }

      const adId = Platform.select({
        ios: ADS_CONFIG.ADMOB.IOS_INTERSTITIAL_ID,
        android: ADS_CONFIG.ADMOB.INTERSTITIAL_ID,
        default: ADS_CONFIG.ADMOB.INTERSTITIAL_ID,
      });

      const interstitial = AdManager.getInterstitial(adId || ADS_CONFIG.ADMOB.INTERSTITIAL_ID);
      const success = await interstitial.showAd();

      if (success) {
        onAdShown?.();
      } else {
        const errorMsg = 'Failed to show interstitial ad';
        setError(errorMsg);
        onAdFailed?.(errorMsg);
      }
    } catch (error) {
      console.error('Error showing interstitial ad:', error);
      const errorMsg = 'Error loading interstitial ad';
      setError(errorMsg);
      onAdFailed?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-show ad when component mounts (if needed)
  useEffect(() => {
    // You can add logic here to auto-show ads based on certain conditions
    // For now, we'll just prepare the ad
  }, []);

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#666" />
          <Text style={styles.loadingText}>Loading ad...</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
  },
  errorContainer: {
    padding: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default InterstitialAdComponent;
