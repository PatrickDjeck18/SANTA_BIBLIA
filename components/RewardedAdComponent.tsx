import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Platform, TouchableOpacity } from 'react-native';
import { ADS_CONFIG } from '../lib/adsConfig';
import { useAds } from '../hooks/useAds';
import { AdManager } from '../lib/adMobService';
import { attService } from '../lib/attService';

interface RewardedAdComponentProps {
  placement: 'bible_chat' | 'quiz' | 'dream';
  onRewardEarned?: (reward: any) => void;
  onAdFailed?: (error: any) => void;
  onAdClosed?: () => void;
  buttonText?: string;
  disabled?: boolean;
}

const RewardedAdComponent: React.FC<RewardedAdComponentProps> = ({
  placement,
  onRewardEarned,
  onAdFailed,
  onAdClosed,
  buttonText = "Watch Ad",
  disabled = false,
}) => {
  const { showAds } = useAds();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdReady, setIsAdReady] = useState(false);

  const showRewardedAd = async () => {
    if (!showAds) {
      console.log('Ads disabled, skipping rewarded ad');
      return;
    }

    if (disabled || isLoading) {
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
        ios: ADS_CONFIG.ADMOB.IOS_REWARDED_ID,
        android: ADS_CONFIG.ADMOB.REWARDED_ID,
        default: ADS_CONFIG.ADMOB.REWARDED_ID,
      });

      const rewarded = AdManager.getRewarded(adId || ADS_CONFIG.ADMOB.REWARDED_ID);
      const result = await rewarded.showAd();

      if (result.success) {
        onRewardEarned?.(result.reward);
      } else {
        const errorMsg = 'Failed to show rewarded ad';
        setError(errorMsg);
        onAdFailed?.(errorMsg);
      }
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      const errorMsg = 'Error loading rewarded ad';
      setError(errorMsg);
      onAdFailed?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if ad is ready
  useEffect(() => {
    const checkAdReady = async () => {
      try {
        if (!AdManager.isAvailable()) {
          setIsAdReady(false);
          return;
        }

        const adId = Platform.select({
          ios: ADS_CONFIG.ADMOB.IOS_REWARDED_ID,
          android: ADS_CONFIG.ADMOB.REWARDED_ID,
          default: ADS_CONFIG.ADMOB.REWARDED_ID,
        });

        const rewarded = AdManager.getRewarded(adId || ADS_CONFIG.ADMOB.REWARDED_ID);
        // Note: The actual implementation would need to check if the ad is loaded
        // This is a simplified version
        setIsAdReady(true);
      } catch (error) {
        console.error('Error checking ad readiness:', error);
        setIsAdReady(false);
      }
    };

    checkAdReady();
  }, []);

  if (!showAds) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          (disabled || isLoading || !isAdReady) && styles.buttonDisabled,
        ]}
        onPress={showRewardedAd}
        disabled={disabled || isLoading || !isAdReady}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>
            {isAdReady ? buttonText : 'Preparing ad...'}
          </Text>
        )}
      </TouchableOpacity>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#fff',
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default RewardedAdComponent;
