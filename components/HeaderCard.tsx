import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Bookmark, Menu, User, Bell, Settings } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Enhanced responsive breakpoints for better mobile support
const isVerySmallScreen = screenWidth < 360; // Extra small phones
const isSmallScreen = screenWidth >= 360 && screenWidth < 375;
const isMediumScreen = screenWidth >= 375 && screenWidth < 414;
const isLargeScreen = screenWidth >= 414;
const isLandscape = screenWidth > screenHeight; // Landscape orientation

// Enhanced responsive spacing function with better mobile optimization
const getResponsiveSpacing = (verySmall: number, small: number, medium: number, large: number) => {
  // Reduce spacing in landscape mode for better fit
  const multiplier = isLandscape ? 0.8 : 1.0;

  if (isVerySmallScreen) return verySmall * multiplier;
  if (isSmallScreen) return small * multiplier;
  if (isMediumScreen) return medium * multiplier;
  return large * multiplier;
};

// Enhanced responsive font sizing for better mobile readability
const getResponsiveFontSize = (verySmall: number, small: number, medium: number, large: number) => {
  // Reduce font size in landscape mode and very small screens
  const multiplier = (isLandscape || isVerySmallScreen) ? 0.9 : 1.0;

  if (isVerySmallScreen) return verySmall * multiplier;
  if (isSmallScreen) return small * multiplier;
  if (isMediumScreen) return medium * multiplier;
  return large * multiplier;
};

interface HeaderCardProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightActions?: React.ReactNode;
  gradientColors?: readonly [string, string, ...string[]];
  badgeCount?: number;
  variant?: 'default' | 'simple' | 'compact';
  showProfileButton?: boolean;
  showNotificationButton?: boolean;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
  onMenuPress?: () => void;
  userName?: string;
  userAvatar?: string;
}

export const HeaderCard: React.FC<HeaderCardProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  rightActions,
  gradientColors = Colors.gradients.spiritualLight || ['#fdfcfb', '#e2d1c3', '#c9d6ff'],
  badgeCount,
  variant = 'default',
  showProfileButton = false,
  showNotificationButton = false,
  onProfilePress,
  onNotificationPress,
  onMenuPress,
  userName,
  userAvatar,
}) => {
  const renderDefaultHeader = () => (
    <View style={styles.hero}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGradient}
      >
        <View style={styles.heroContent}>
          {/* Back button */}
          {showBackButton && (
            <TouchableOpacity
              style={styles.heroActionButton}
              onPress={onBackPress}
            >
              <ArrowLeft size={20} color={Colors.primary[600]} />
            </TouchableOpacity>
          )}

          <View style={styles.heroTextBlock}>
            <Text style={styles.heroTitle}>{title}</Text>
            {subtitle && <Text style={styles.heroSubtitle}>{subtitle}</Text>}
          </View>

          <View style={styles.heroActions}>
            {rightActions}
            {badgeCount !== undefined && badgeCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badgeCount}</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderSimpleHeader = () => (
    <View style={styles.simpleHeader}>
      <View style={styles.simpleHeaderContent}>
        <View style={styles.simpleHeaderLeft}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.simpleBackButton}
              onPress={onBackPress}
            >
              <ArrowLeft size={20} color={Colors.primary[600]} />
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.simpleHeaderTitle}>{title}</Text>
            {subtitle && <Text style={styles.simpleHeaderSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        <View style={styles.simpleHeaderActions}>
          {showNotificationButton && (
            <TouchableOpacity
              style={styles.simpleActionButton}
              onPress={onNotificationPress}
            >
              <Bell size={20} color={Colors.neutral[600]} />
              {badgeCount !== undefined && badgeCount > 0 && (
                <View style={styles.simpleBadge}>
                  <Text style={styles.simpleBadgeText}>{badgeCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          {showProfileButton && (
            <TouchableOpacity
              style={styles.simpleActionButton}
              onPress={onProfilePress}
            >
              <User size={20} color={Colors.neutral[600]} />
            </TouchableOpacity>
          )}
          {onMenuPress && (
            <TouchableOpacity
              style={styles.simpleActionButton}
              onPress={onMenuPress}
            >
              <Menu size={20} color={Colors.neutral[600]} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderCompactHeader = () => (
    <View style={styles.compactHeader}>
      <View style={styles.compactHeaderContent}>
        <Text style={styles.compactHeaderTitle}>{title}</Text>
        {showBackButton && (
          <TouchableOpacity
            style={styles.compactBackButton}
            onPress={onBackPress}
          >
            <ArrowLeft size={18} color={Colors.primary[600]} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  switch (variant) {
    case 'simple':
      return renderSimpleHeader();
    case 'compact':
      return renderCompactHeader();
    default:
      return renderDefaultHeader();
  }
};

const styles = StyleSheet.create({
  // Default hero header styles
  hero: {
    paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0) + getResponsiveSpacing(Spacing['2xl'], Spacing['3xl'], Spacing['4xl'], Spacing['5xl']),
    paddingBottom: getResponsiveSpacing(Spacing.xs, Spacing.sm, Spacing.md, Spacing.lg),
  },
  heroGradient: {
    paddingHorizontal: getResponsiveSpacing(Spacing.sm, Spacing.md, Spacing.lg, Spacing.xl),
    paddingVertical: getResponsiveSpacing(Spacing.xs, Spacing.sm, Spacing.md, Spacing.lg),
    borderRadius: BorderRadius.lg,
    marginHorizontal: getResponsiveSpacing(1, 2, 4, 6),
    ...Shadows.md,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTextBlock: {
    flex: 1,
  },
  heroTitle: {
    fontSize: getResponsiveFontSize(Typography.sizes.xl, Typography.sizes['2xl'], Typography.sizes['3xl'], Typography.sizes['4xl']),
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: getResponsiveFontSize(Typography.sizes.xs, Typography.sizes.sm, Typography.sizes.base, Typography.sizes.lg),
    color: Colors.neutral[600],
    lineHeight: Typography.lineHeights.base,
  },
  heroActions: {
    flexDirection: 'row',
    gap: getResponsiveSpacing(Spacing.sm, Spacing.md, Spacing.md, Spacing.lg),
    alignItems: 'center',
  },
  heroActionButton: {
    padding: getResponsiveSpacing(Spacing.xs, Spacing.xs, Spacing.sm, Spacing.md),
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.md,
    minWidth: getResponsiveSpacing(40, 44, 48, 52), // Minimum 44px for mobile accessibility
    minHeight: getResponsiveSpacing(40, 44, 48, 52), // Minimum 44px for mobile accessibility
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: getResponsiveSpacing(-6, -8, -8, -10),
    right: getResponsiveSpacing(-6, -8, -8, -10),
    backgroundColor: Colors.error[500],
    borderRadius: BorderRadius.full,
    minWidth: getResponsiveSpacing(18, 20, 22, 24),
    height: getResponsiveSpacing(18, 20, 22, 24),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: getResponsiveSpacing(3, 4, 4, 5),
  },
  badgeText: {
    fontSize: getResponsiveFontSize(Typography.sizes.xs, Typography.sizes.xs, Typography.sizes.sm, Typography.sizes.sm),
    fontWeight: Typography.weights.bold,
    color: 'white',
  },

  // Simple header styles
  simpleHeader: {
    paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0) + getResponsiveSpacing(Spacing.md, Spacing.lg, Spacing.xl, Spacing['2xl']),
    paddingBottom: getResponsiveSpacing(Spacing.xs, Spacing.sm, Spacing.md, Spacing.lg),
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    ...Shadows.sm,
  },
  simpleHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(Spacing.sm, Spacing.md, Spacing.lg, Spacing.xl),
  },
  simpleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing(Spacing.sm, Spacing.md, Spacing.lg, Spacing.xl),
  },
  simpleBackButton: {
    padding: getResponsiveSpacing(Spacing.sm, Spacing.sm, Spacing.md, Spacing.md), // Minimum 44px touch target
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: getResponsiveSpacing(40, 44, 48, 52),
    minHeight: getResponsiveSpacing(40, 44, 48, 52),
  },
  simpleHeaderTitle: {
    fontSize: getResponsiveFontSize(Typography.sizes.xl, Typography.sizes['2xl'], Typography.sizes['3xl'], Typography.sizes['4xl']),
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
  },
  simpleHeaderSubtitle: {
    fontSize: getResponsiveFontSize(Typography.sizes.xs, Typography.sizes.sm, Typography.sizes.base, Typography.sizes.lg),
    color: Colors.neutral[600],
    marginTop: 2,
  },
  simpleHeaderActions: {
    flexDirection: 'row',
    gap: getResponsiveSpacing(Spacing.xs, Spacing.sm, Spacing.md, Spacing.md),
    alignItems: 'center',
  },
  simpleActionButton: {
    padding: getResponsiveSpacing(Spacing.sm, Spacing.sm, Spacing.md, Spacing.md), // Minimum 44px touch target
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minWidth: getResponsiveSpacing(40, 44, 48, 52),
    minHeight: getResponsiveSpacing(40, 44, 48, 52),
  },
  simpleBadge: {
    position: 'absolute',
    top: getResponsiveSpacing(-3, -4, -4, -5),
    right: getResponsiveSpacing(-3, -4, -4, -5),
    backgroundColor: Colors.error[500],
    borderRadius: BorderRadius.full,
    minWidth: getResponsiveSpacing(16, 18, 20, 22),
    height: getResponsiveSpacing(16, 18, 20, 22),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: getResponsiveSpacing(3, 4, 4, 5),
  },
  simpleBadgeText: {
    fontSize: getResponsiveFontSize(Typography.sizes.xs, Typography.sizes.xs, Typography.sizes.sm, Typography.sizes.sm),
    fontWeight: Typography.weights.bold,
    color: 'white',
  },

  // Compact header styles
  compactHeader: {
    paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0) + getResponsiveSpacing(Spacing.sm, Spacing.md, Spacing.lg, Spacing.xl),
    paddingBottom: getResponsiveSpacing(Spacing.xs, Spacing.xs, Spacing.sm, Spacing.md),
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  compactHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(Spacing.sm, Spacing.md, Spacing.lg, Spacing.xl),
  },
  compactHeaderTitle: {
    fontSize: getResponsiveFontSize(Typography.sizes.base, Typography.sizes.lg, Typography.sizes.xl, Typography.sizes['2xl']),
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[800],
  },
  compactBackButton: {
    padding: getResponsiveSpacing(Spacing.sm, Spacing.sm, Spacing.md, Spacing.md), // Minimum 44px touch target
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: getResponsiveSpacing(40, 44, 48, 52),
    minHeight: getResponsiveSpacing(40, 44, 48, 52),
  },
});
