import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';

interface AppUsageCardProps {
  appName: string;
  usageTime: string;
  icon: React.ReactNode;
  color?: 'orange' | 'green' | 'blue' | 'purple' | 'pink' | 'red' | 'teal';
  isBlocked?: boolean;
  style?: ViewStyle;
}

export const AppUsageCard: React.FC<AppUsageCardProps> = ({
  appName,
  usageTime,
  icon,
  color = 'blue',
  isBlocked = false,
  style,
}) => {
  const cardColors = {
    orange: Colors.cardColors.orange,
    green: Colors.cardColors.green,
    blue: Colors.cardColors.blue,
    purple: Colors.cardColors.purple,
    pink: Colors.cardColors.pink,
    red: Colors.cardColors.red,
    teal: Colors.cardColors.teal,
  };

  const cardColor = cardColors[color];

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={[cardColor, cardColor]}
        style={styles.gradientBackground}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            {icon}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.appName}>{appName}</Text>
            <Text style={styles.usageTime}>{usageTime}</Text>
          </View>
          {isBlocked && (
            <View style={styles.blockedBadge}>
              <Text style={styles.blockedText}>Blocked</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  gradientBackground: {
    padding: Spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  appName: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semiBold,
    color: Colors.white,
    marginBottom: 2,
  } as TextStyle,
  usageTime: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  } as TextStyle,
  blockedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  blockedText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[700],
  } as TextStyle,
});

export default AppUsageCard;