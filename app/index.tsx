import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Colors } from '@/constants/DesignTokens';

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const { hasSeenOnboarding, loading: onboardingLoading } = useOnboarding();

  useEffect(() => {
    if (!authLoading && !onboardingLoading) {
      if (user) {
        // User is authenticated
        if (hasSeenOnboarding) {
          // User has seen onboarding, redirect to main app
          router.replace('/(tabs)');
        } else {
          // User hasn't seen onboarding, show onboarding first
          router.replace('/onboarding');
        }
      } else {
        // User is not authenticated
        if (hasSeenOnboarding) {
          // User has seen onboarding, redirect to login
          router.replace('/login');
        } else {
          // User hasn't seen onboarding, show onboarding first
          router.replace('/onboarding');
        }
      }
    }
  }, [user, authLoading, hasSeenOnboarding, onboardingLoading]);

  // Show loading screen while checking authentication
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