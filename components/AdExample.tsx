import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Alert } from 'react-native';
import BannerAdComponent from './BannerAd';
import InterstitialAdComponent from './InterstitialAdComponent';
import RewardedAdComponent from './RewardedAdComponent';
import { useAds } from '../hooks/useAds';

/**
 * Example component showing how to use all ad types
 * This is for demonstration purposes - integrate these patterns into your actual screens
 */
const AdExample: React.FC = () => {
  const { showInterstitialAd, showRewardedAd } = useAds();
  const [interstitialResult, setInterstitialResult] = useState<string>('');
  const [rewardedResult, setRewardedResult] = useState<string>('');

  const handleInterstitialAd = async () => {
    try {
      const success = await showInterstitialAd('home');
      setInterstitialResult(success ? 'Interstitial ad shown successfully' : 'Failed to show interstitial ad');
    } catch (error) {
      setInterstitialResult(`Error: ${error}`);
    }
  };

  const handleRewardedAd = async () => {
    try {
      const result = await showRewardedAd('bible_chat');
      if (result.success) {
        setRewardedResult(`Reward earned: ${JSON.stringify(result.reward)}`);
        Alert.alert('Reward Earned!', 'You have earned a reward for watching the ad.');
      } else {
        setRewardedResult('Failed to earn reward');
      }
    } catch (error) {
      setRewardedResult(`Error: ${error}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>AdMob Integration Example</Text>
      
      {/* Banner Ad Example */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Banner Ad</Text>
        <BannerAdComponent placement="home" />
      </View>

      {/* Interstitial Ad Example */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interstitial Ad</Text>
        <InterstitialAdComponent 
          placement="home"
          onAdShown={() => setInterstitialResult('Interstitial ad shown')}
          onAdFailed={(error) => setInterstitialResult(`Failed: ${error}`)}
        />
        <Text style={styles.resultText}>{interstitialResult}</Text>
      </View>

      {/* Rewarded Ad Example */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rewarded Ad</Text>
        <RewardedAdComponent 
          placement="bible_chat"
          buttonText="Watch Ad for Reward"
          onRewardEarned={(reward) => {
            setRewardedResult(`Reward earned: ${JSON.stringify(reward)}`);
            Alert.alert('Reward Earned!', 'You have earned a reward for watching the ad.');
          }}
          onAdFailed={(error) => setRewardedResult(`Failed: ${error}`)}
        />
        <Text style={styles.resultText}>{rewardedResult}</Text>
      </View>

      {/* Programmatic Ad Examples */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Programmatic Ad Control</Text>
        <Text style={styles.description}>
          You can also control ads programmatically using the useAds hook:
        </Text>
        <Text style={styles.codeText}>
          {`const { showInterstitialAd, showRewardedAd } = useAds();

// Show interstitial ad
await showInterstitialAd('home');

// Show rewarded ad
const result = await showRewardedAd('bible_chat');`}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 4,
    color: '#333',
  },
  resultText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default AdExample;
