import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';
import { Svg, Path } from 'react-native-svg';


interface SocialLoginButtonProps {
  provider: 'facebook';
  onPress: () => void;
  disabled?: boolean;
  style?: any;
}

export default function SocialLoginButton({
  provider,
  onPress,
  disabled = false,
  style,
}: SocialLoginButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (!disabled) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.96,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  const getProviderConfig = () => {
    switch (provider) {
      case 'facebook':
        return {
          colors: ['#1877f2', '#166fe5'] as const,
          textColor: '#ffffff',
          borderColor: '#1877f2',
          text: 'Continue with Facebook',
          shadowColor: '#1877f2',
          useCustomIcon: false,
        };
      default:
        return {
          colors: ['#ffffff', '#f8f9fa'] as const,
          textColor: '#1f2937',
          borderColor: '#e5e7eb',
          text: 'Continue',
          shadowColor: '#6b7280',
          useCustomIcon: false,
        };
    }
  };

  const config = getProviderConfig();
  
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.9}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={config.text}
      accessibilityState={{
        disabled: disabled,
      }}
    >
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Glow Effect */}
        <Animated.View
          style={[
            styles.glowEffect,
            {
              opacity: glowOpacity,
              shadowColor: disabled ? Colors.neutral[400] : config.shadowColor,
            },
          ]}
        />

        {/* Button Background */}
        <LinearGradient
          colors={disabled ? ['#f3f4f6', '#e5e7eb'] as const : config.colors}
          style={[
            styles.gradient,
            {
              borderColor: disabled ? Colors.neutral[300] : config.borderColor,
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {/* Button Content */}
          <View style={styles.content}>
            {/* Provider Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>
                {provider === 'facebook' ? '📘' : '🔗'}
              </Text>
            </View>

            {/* Button Text */}
            <Text
              style={[
                styles.text,
                {
                  color: disabled ? Colors.neutral[400] : config.textColor,
                },
              ]}
            >
              {config.text}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  buttonContainer: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: BorderRadius.xl + 2,
    ...Shadows.md,
  },
  gradient: {
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    ...Shadows.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  iconContainer: {
    marginRight: Spacing.md,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  text: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
});