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
  // More aggressive font size reduction for very small screens and landscape
  const multiplier = isVerySmallScreen ? 0.75 : (isLandscape ? 0.85 : 1.0);
  
  if (isVerySmallScreen) return Math.max(verySmall * multiplier, 11); // Minimum 11px
  if (isSmallScreen) return small * multiplier;
  if (isMediumScreen) return medium * multiplier;
  return large * multiplier;
};

// Enhanced mobile-optimized spacing function
const getMobileOptimizedSpacing = (verySmall: number, small: number, medium: number, large: number) => {
  // Reduce spacing in landscape mode and very small screens
  const multiplier = (isLandscape || isVerySmallScreen) ? 0.8 : 1.0;

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
            <Text 
              style={styles.heroTitle}
              numberOfLines={isVerySmallScreen ? 1 : 2}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
            {subtitle && (
              <Text 
                style={styles.heroSubtitle}
                numberOfLines={isVerySmallScreen ? 1 : 2}
                ellipsizeMode="tail"
              >
                {subtitle}
              </Text>
            )}
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
          <Text 
            style={styles.simpleHeaderTitle}
            numberOfLines={isVerySmallScreen ? 1 : 2}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
        </View>
        {subtitle && (
          <Text 
            style={styles.simpleHeaderSubtitle}
            numberOfLines={isVerySmallScreen ? 1 : 2}
            ellipsizeMode="tail"
          >
            {subtitle}
          </Text>
        )}
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
    <View style={[
      styles.compactHeader,
      isVerySmallScreen && styles.compactHeaderSmall
    ]}>
      <View style={styles.compactHeaderContent}>
        <Text 
          style={[
            styles.compactHeaderTitle,
            isVerySmallScreen && styles.compactHeaderTitleSmall
          ]}
          numberOfLines={isVerySmallScreen ? 1 : 2}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        {showBackButton && (
          <TouchableOpacity
            style={[
              styles.compactBackButton,
              isVerySmallScreen && styles.compactBackButtonSmall
            ]}
            onPress={onBackPress}
          >
            <ArrowLeft size={isVerySmallScreen ? 16 : 18} color={Colors.primary[600]} />
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
  // Default hero header styles - Enhanced for mobile
  hero: {
    paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0) + getMobileOptimizedSpacing(Spacing['3xl'], Spacing['4xl'], Spacing['5xl'], Spacing['6xl']), // Increased top padding
    paddingBottom: getMobileOptimizedSpacing(Spacing.lg, Spacing.xl, Spacing['2xl'], Spacing['3xl']), // Significantly increased bottom padding
    minHeight: getMobileOptimizedSpacing(160, 180, 200, 220), // Much larger minimum height for mobile
    // Better mobile support
    maxHeight: isLandscape ? getMobileOptimizedSpacing(180, 200, 220, 240) : undefined,
    // Enhanced mobile support for very small screens
    ...(isVerySmallScreen && {
      paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0) + getMobileOptimizedSpacing(Spacing['2xl'], Spacing['3xl'], Spacing['4xl'], Spacing['5xl']),
      paddingBottom: getMobileOptimizedSpacing(Spacing.md, Spacing.lg, Spacing.xl, Spacing['2xl']),
      minHeight: getMobileOptimizedSpacing(140, 160, 180, 200),
    }),
  },
  heroGradient: {
    paddingHorizontal: getMobileOptimizedSpacing(Spacing.md, Spacing.lg, Spacing.xl, Spacing['2xl']), // Increased horizontal padding
    paddingVertical: getMobileOptimizedSpacing(Spacing.lg, Spacing.xl, Spacing['2xl'], Spacing['3xl']), // Significantly increased vertical padding
    borderRadius: BorderRadius.lg,
    marginHorizontal: getMobileOptimizedSpacing(1, 2, 4, 6),
    minHeight: getMobileOptimizedSpacing(100, 120, 140, 160), // Added minimum height for gradient
    ...Shadows.md,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: getMobileOptimizedSpacing(100, 120, 140, 160), // Significantly increased minimum height for content
    // Better mobile layout
    flexWrap: isVerySmallScreen ? 'wrap' : 'nowrap',
    gap: isVerySmallScreen ? getMobileOptimizedSpacing(Spacing.xs, Spacing.sm, Spacing.md, Spacing.lg) : 0,
    // Enhanced mobile support
    paddingVertical: getMobileOptimizedSpacing(Spacing.sm, Spacing.md, Spacing.lg, Spacing.xl), // Added vertical padding
  },
  heroTextBlock: {
    flex: 1,
    // Better mobile text handling
    minWidth: 0, // Allow text to shrink properly
    flexShrink: 1, // Allow shrinking on very small screens
    minHeight: getMobileOptimizedSpacing(60, 70, 80, 90), // Added minimum height for text block
    justifyContent: 'center', // Center text vertically
    paddingVertical: getMobileOptimizedSpacing(Spacing.sm, Spacing.md, Spacing.lg, Spacing.xl), // Added vertical padding
  },
  heroTitle: {
    fontSize: getResponsiveFontSize(Typography.sizes.xl, Typography.sizes['2xl'], Typography.sizes['3xl'], Typography.sizes['4xl']),
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
    marginBottom: 2,
    // Better mobile text handling
    minWidth: 0, // Allow text to shrink properly
    flexShrink: 1, // Allow shrinking on very small screens
  },
  heroSubtitle: {
    fontSize: getResponsiveFontSize(Typography.sizes.sm, Typography.sizes.base, Typography.sizes.lg, Typography.sizes.xl), // Increased font size
    color: Colors.neutral[600],
    lineHeight: getResponsiveFontSize(18, 20, 22, 24), // Increased line height for better readability
    marginTop: getMobileOptimizedSpacing(Spacing.xs, Spacing.sm, Spacing.md, Spacing.lg), // Added top margin
    // Better mobile text handling
    minWidth: 0, // Allow text to shrink properly
    flexShrink: 1, // Allow shrinking on very small screens
    // Enhanced mobile support
    ...(isVerySmallScreen && {
      fontSize: Math.max(getResponsiveFontSize(Typography.sizes.xs, Typography.sizes.sm, Typography.sizes.base, Typography.sizes.lg), 12),
      lineHeight: 16,
    }),
  },
  heroActions: {
    flexDirection: 'row',
    gap: getMobileOptimizedSpacing(Spacing.sm, Spacing.md, Spacing.md, Spacing.lg),
    alignItems: 'center',
    // Better mobile layout
    flexShrink: 0, // Prevent actions from shrinking
  },
  heroActionButton: {
    padding: getMobileOptimizedSpacing(Spacing.xs, Spacing.xs, Spacing.sm, Spacing.md),
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.md,
    minWidth: getMobileOptimizedSpacing(40, 44, 48, 52), // Minimum 44px for mobile accessibility
    minHeight: getMobileOptimizedSpacing(40, 44, 48, 52), // Minimum 44px for mobile accessibility
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
    paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0) + getMobileOptimizedSpacing(Spacing.md, Spacing.lg, Spacing.xl, Spacing['2xl']),
    paddingBottom: getMobileOptimizedSpacing(Spacing.xs, Spacing.sm, Spacing.md, Spacing.lg),
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    ...Shadows.sm,
  },
  simpleHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getMobileOptimizedSpacing(Spacing.sm, Spacing.md, Spacing.lg, Spacing.xl),
    // Better mobile layout
    flexWrap: isVerySmallScreen ? 'wrap' : 'nowrap',
    gap: isVerySmallScreen ? getMobileOptimizedSpacing(Spacing.xs, Spacing.sm, Spacing.md, Spacing.lg) : 0,
  },
  simpleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getMobileOptimizedSpacing(Spacing.sm, Spacing.md, Spacing.lg, Spacing.xl),
    flex: 1,
    // Better mobile text handling
    minWidth: 0, // Allow text to shrink properly
  },
  simpleHeaderTextBlock: {
    flex: 1,
    // Better mobile text handling
    minWidth: 0, // Allow text to shrink properly
    flexShrink: 1, // Allow shrinking on very small screens
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
    // Better mobile text handling
    minWidth: 0, // Allow text to shrink properly
    flexShrink: 1, // Allow shrinking on very small screens
  },
  simpleHeaderSubtitle: {
    fontSize: getResponsiveFontSize(Typography.sizes.xs, Typography.sizes.sm, Typography.sizes.base, Typography.sizes.lg),
    color: Colors.neutral[600],
    marginTop: 2,
    // Better mobile text handling
    minWidth: 0, // Allow text to shrink properly
    flexShrink: 1, // Allow shrinking on very small screens
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
    paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0) + getMobileOptimizedSpacing(Spacing.sm, Spacing.md, Spacing.lg, Spacing.xl),
    paddingBottom: getMobileOptimizedSpacing(Spacing.xs, Spacing.xs, Spacing.sm, Spacing.md),
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    minHeight: getMobileOptimizedSpacing(50, 60, 70, 80), // Ensure minimum header height
    // Better mobile support
    maxHeight: isLandscape ? getMobileOptimizedSpacing(60, 70, 80, 90) : undefined,
  },
  compactHeaderSmall: {
    paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0) + getMobileOptimizedSpacing(Spacing.xs, Spacing.sm, Spacing.md, Spacing.lg),
    paddingBottom: getMobileOptimizedSpacing(Spacing.xs, Spacing.xs, Spacing.xs, Spacing.sm),
  },
  compactHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getMobileOptimizedSpacing(Spacing.sm, Spacing.md, Spacing.lg, Spacing.xl),
    minHeight: getMobileOptimizedSpacing(44, 48, 52, 56), // Minimum touch target height
    // Better mobile layout
    flexWrap: isVerySmallScreen ? 'wrap' : 'nowrap',
    gap: isVerySmallScreen ? getMobileOptimizedSpacing(Spacing.xs, Spacing.sm, Spacing.md, Spacing.lg) : 0,
  },
  compactHeaderTitle: {
    fontSize: getResponsiveFontSize(Typography.sizes.base, Typography.sizes.lg, Typography.sizes.xl, Typography.sizes['2xl']),
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[800],
    flex: 1,
    // Better mobile text handling
    minWidth: 0, // Allow text to shrink properly
    flexShrink: 1, // Allow shrinking on very small screens
  },
  compactHeaderTitleSmall: {
    fontSize: getResponsiveFontSize(Typography.sizes.sm, Typography.sizes.base, Typography.sizes.lg, Typography.sizes.xl),
  },
  compactBackButton: {
    padding: getMobileOptimizedSpacing(Spacing.sm, Spacing.sm, Spacing.md, Spacing.md), // Minimum 44px touch target
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: getMobileOptimizedSpacing(40, 44, 48, 52),
    minHeight: getMobileOptimizedSpacing(40, 44, 48, 52),
  },
  compactBackButtonSmall: {
    padding: getMobileOptimizedSpacing(Spacing.xs, Spacing.sm, Spacing.sm, Spacing.md),
    minWidth: getMobileOptimizedSpacing(36, 40, 44, 48),
    minHeight: getMobileOptimizedSpacing(36, 40, 44, 48),
  },
});
