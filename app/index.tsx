import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/DesignTokens';

export default function Index() {
  useEffect(() => {
    // Navigate directly to the main app - no onboarding, no auth check
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 100); // Small delay to ensure navigation is ready

    return () => clearTimeout(timer);
  }, []);

  // Show brief loading screen while navigating
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary[500]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});