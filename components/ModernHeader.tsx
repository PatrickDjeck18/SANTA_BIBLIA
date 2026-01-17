import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Dimensions,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Menu,
  User,
  Bell,
  Settings,
  Search,
  MoreVertical,
  Download,
  Volume2,
  VolumeX
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';
import * as Speech from 'expo-speech';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Enhanced responsive breakpoints for better mobile support
const isVerySmallScreen = screenWidth < 360; // Extra small phones (iPhone SE, etc.)
const isSmallScreen = screenWidth >= 360 && screenWidth < 375; // iPhone 12 mini, etc.
const isMediumScreen = screenWidth >= 375 && screenWidth < 414; // iPhone 12/13/14
const isLargeScreen = screenWidth >= 414; // iPhone Plus, Pro Max, etc.
const isLandscape = screenWidth > screenHeight; // Landscape orientation
const isTablet = screenWidth >= 768; // iPad and larger tablets

// Additional mobile-specific breakpoints for better optimization
const isExtraSmallScreen = screenWidth < 320; // Very small devices
const isCompactScreen = screenWidth < 390; // Compact devices
const isWideScreen = screenWidth >= 430; // Wide phones and small tablets

// Enhanced mobile-first responsive design with better touch targets
const getMobileOptimizedSpacing = (verySmall: number, small: number, medium: number, large: number) => {
  // More aggressive spacing reduction for very small screens and landscape
  const multiplier = isExtraSmallScreen ? 0.5 : (isVerySmallScreen ? 0.6 : (isLandscape ? 0.7 : 1.0));

  if (isExtraSmallScreen) return Math.max(verySmall * multiplier, 2); // Minimum 2px for extra small
  if (isVerySmallScreen) return Math.max(verySmall * multiplier, 3); // Minimum 3px
  if (isSmallScreen) return small * multiplier;
  if (isMediumScreen) return medium * multiplier;
  return large * multiplier;
};

const getMobileOptimizedFontSize = (verySmall: number, small: number, medium: number, large: number) => {
  // More aggressive font size reduction for very small screens and landscape
  const multiplier = isExtraSmallScreen ? 0.7 : (isVerySmallScreen ? 0.75 : (isLandscape ? 0.85 : 1.0));

  if (isExtraSmallScreen) return Math.max(verySmall * multiplier, 10); // Minimum 10px for extra small
  if (isVerySmallScreen) return Math.max(verySmall * multiplier, 11); // Minimum 11px
  if (isSmallScreen) return small * multiplier;
  if (isMediumScreen) return medium * multiplier;
  return large * multiplier;
};

// Enhanced responsive spacing function with better mobile optimization
const getResponsiveSpacing = (verySmall: number, small: number, medium: number, large: number) => {
  // Reduce spacing in landscape mode and very small screens for better fit
  const multiplier = isLandscape ? 0.75 : (isVerySmallScreen ? 0.8 : 1.0);

  if (isVerySmallScreen) return Math.max(verySmall * multiplier, 2); // Minimum 2px
  if (isSmallScreen) return small * multiplier;
  if (isMediumScreen) return medium * multiplier;
  return large * multiplier;
};

// Enhanced responsive font sizing for better mobile readability
const getResponsiveFontSize = (verySmall: number, small: number, medium: number, large: number) => {
  // Reduce font size in landscape mode and very small screens
  const multiplier = isLandscape ? 0.85 : (isVerySmallScreen ? 0.8 : 1.0);

  if (isVerySmallScreen) return Math.max(verySmall * multiplier, 10); // Minimum 10px
  if (isSmallScreen) return small * multiplier;
  if (isMediumScreen) return medium * multiplier;
  return large * multiplier;
};

interface ModernHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  variant?: 'default' | 'simple' | 'compact' | 'transparent';
  showProfileButton?: boolean;
  showSettingsButton?: boolean;
  showNotificationButton?: boolean;
  showSearchButton?: boolean;
  showMenuButton?: boolean;
  showOfflineButton?: boolean;
  showReaderButton?: boolean;
  onProfilePress?: () => void;
  onSettingsPress?: () => void;
  onNotificationPress?: () => void;
  onSearchPress?: () => void;
  onMenuPress?: () => void;
  onOfflinePress?: () => void;
  onReaderPress?: () => void;
  gradientColors?: readonly [string, string, ...string[]];
  badgeCount?: number;
  transparent?: boolean;
  sticky?: boolean;
  rightActions?: React.ReactNode; // Support for custom right actions like add button
  readerText?: string; // Custom text to read aloud (defaults to title + subtitle)
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  variant = 'default',
  showProfileButton = false,
  showSettingsButton = false,
  showNotificationButton = false,
  showSearchButton = false,
  showMenuButton = false,
  showOfflineButton = false,
  showReaderButton = true,
  onProfilePress,
  onSettingsPress,
  onNotificationPress,
  onSearchPress,
  onMenuPress,
  onOfflinePress,
  onReaderPress,
  gradientColors = Colors.gradients.spiritualLight || ['#fdfcfb', '#e2d1c3', '#c9d6ff'],
  badgeCount,
  transparent = false,
  sticky = false,
  rightActions,
  readerText,
}) => {
  const [isReading, setIsReading] = useState(false);

  // Text-to-speech functionality
  const handleReaderPress = async () => {
    try {
      if (isReading) {
        // Stop current speech
        Speech.stop();
        setIsReading(false);
        return;
      }

      // Prepare text to read
      const textToRead = readerText || `${title}${subtitle ? `. ${subtitle}` : ''}`;

      if (!textToRead.trim()) {
        Alert.alert('No Content', 'No text available to read aloud.');
        return;
      }

      // Start reading
      setIsReading(true);

      await Speech.speak(textToRead, {
        language: 'en',
        pitch: 1.0,
        rate: 0.8,
        onDone: () => {
          setIsReading(false);
        },
        onStopped: () => {
          setIsReading(false);
        },
        onError: (error) => {
          console.error('Speech error:', error);
          setIsReading(false);
          Alert.alert('Speech Error', 'Unable to read text aloud. Please check your device settings.');
        }
      });

      // Call custom handler if provided
      if (onReaderPress) {
        onReaderPress();
      }
    } catch (error) {
      console.error('Reader error:', error);
      setIsReading(false);
      Alert.alert('Error', 'Unable to read text aloud. Please check your device settings.');
    }
  };

  // Clean up speech when component unmounts
  useEffect(() => {
    return () => {
      if (isReading) {
        Speech.stop();
      }
    };
  }, [isReading]);
  const renderDefaultHeader = () => (
    <View style={[styles.hero, sticky && styles.stickyHeader]}>
      <View style={styles.heroSolidBackground}>
        <View style={styles.heroContent}>
          {/* Back button */}
          {showBackButton && (
            <TouchableOpacity
              style={styles.heroActionButton}
              onPress={onBackPress}
            >
              <ArrowLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          <View style={styles.heroTextBlock}>
            <Text style={styles.heroTitle}>{title}</Text>
            {subtitle && <Text style={styles.heroSubtitle}>{subtitle}</Text>}
          </View>

          <View style={styles.heroActions}>
            {showReaderButton && (
              <TouchableOpacity
                style={[styles.heroActionButton, isReading && styles.readerButtonActive]}
                onPress={handleReaderPress}
              >
                {isReading ? (
                  <VolumeX size={20} color="#FFFFFF" />
                ) : (
                  <Volume2 size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            )}
            {showOfflineButton && (
              <TouchableOpacity
                style={styles.heroActionButton}
                onPress={onOfflinePress}
              >
                <Download size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            {showSearchButton && (
              <TouchableOpacity
                style={styles.heroActionButton}
                onPress={onSearchPress}
              >
                <Search size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            {showNotificationButton && (
              <TouchableOpacity
                style={styles.heroActionButton}
                onPress={onNotificationPress}
              >
                <Bell size={20} color="#FFFFFF" />
                {badgeCount !== undefined && badgeCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badgeCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            {showProfileButton && (
              <TouchableOpacity
                style={styles.heroActionButton}
                onPress={onProfilePress}
              >
                <User size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            {showSettingsButton && (
              <TouchableOpacity
                style={styles.heroActionButton}
                onPress={onSettingsPress}
              >
                <Settings size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            {showMenuButton && (
              <TouchableOpacity
                style={styles.heroActionButton}
                onPress={onMenuPress}
              >
                <MoreVertical size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  const renderSimpleHeader = () => (
    <View style={[styles.simpleHeader, sticky && styles.stickyHeader, transparent && styles.transparentHeader]}>
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
          {showReaderButton && (
            <TouchableOpacity
              style={[styles.simpleActionButton, isReading && styles.readerButtonActive]}
              onPress={handleReaderPress}
            >
              {isReading ? (
                <VolumeX size={20} color={Colors.neutral[600]} />
              ) : (
                <Volume2 size={20} color={Colors.neutral[600]} />
              )}
            </TouchableOpacity>
          )}
          {showSearchButton && (
            <TouchableOpacity
              style={styles.simpleActionButton}
              onPress={onSearchPress}
            >
              <Search size={20} color={Colors.neutral[600]} />
            </TouchableOpacity>
          )}
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
          {showSettingsButton && (
            <TouchableOpacity
              style={styles.simpleActionButton}
              onPress={onSettingsPress}
            >
              <Settings size={20} color={Colors.neutral[600]} />
            </TouchableOpacity>
          )}
          {showMenuButton && (
            <TouchableOpacity
              style={styles.simpleActionButton}
              onPress={onMenuPress}
            >
              <Menu size={20} color={Colors.neutral[600]} />
            </TouchableOpacity>
          )}
          {rightActions}
        </View>
      </View>
    </View>
  );

  const renderCompactHeader = () => (
    <View style={[
      styles.compactHeader,
      sticky && styles.stickyHeader,
      transparent && styles.transparentHeader,
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

  const renderTransparentHeader = () => (
    <View style={[styles.transparentHeader, sticky && styles.stickyHeader]}>
      <View style={styles.transparentHeaderContent}>
        <View style={styles.transparentHeaderLeft}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.transparentBackButton}
              onPress={onBackPress}
            >
              <ArrowLeft size={20} color={Colors.white} />
            </TouchableOpacity>
          )}
          <Text
            style={styles.transparentHeaderTitle}
            numberOfLines={isVerySmallScreen ? 1 : 2}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
        </View>
        <View style={styles.transparentHeaderActions}>
          {showReaderButton && (
            <TouchableOpacity
              style={[styles.transparentActionButton, isReading && styles.readerButtonActive]}
              onPress={handleReaderPress}
            >
              {isReading ? (
                <VolumeX size={20} color={Colors.white} />
              ) : (
                <Volume2 size={20} color={Colors.white} />
              )}
            </TouchableOpacity>
          )}
          {showSearchButton && (
            <TouchableOpacity
              style={styles.transparentActionButton}
              onPress={onSearchPress}
            >
              <Search size={20} color={Colors.white} />
            </TouchableOpacity>
          )}
          {showNotificationButton && (
            <TouchableOpacity
              style={styles.transparentActionButton}
              onPress={onNotificationPress}
            >
              <Bell size={20} color={Colors.white} />
              {badgeCount !== undefined && badgeCount > 0 && (
                <View style={styles.transparentBadge}>
                  <Text style={styles.transparentBadgeText}>{badgeCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  switch (variant) {
    case 'simple':
      return renderSimpleHeader();
    case 'compact':
      return renderCompactHeader();
    case 'transparent':
      return renderTransparentHeader();
    default:
      return renderDefaultHeader();
  }
};

const styles = StyleSheet.create({
  // Default hero header styles
  hero: {
    paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0) + getResponsiveSpacing(Spacing['2xl'], Spacing['3xl'], Spacing['4xl'], Spacing['5xl']),
    paddingBottom: getResponsiveSpacing(Spacing.xs, Spacing.sm, Spacing.md, Spacing.lg),
    backgroundColor: '#0A0A0F', // Modern dark background
  },
  heroSolidBackground: {
    paddingHorizontal: getResponsiveSpacing(Spacing.sm, Spacing.md, Spacing.lg, Spacing.xl),
    paddingVertical: getResponsiveSpacing(Spacing.xs, Spacing.sm, Spacing.md, Spacing.lg),
    backgroundColor: '#1A1A2E', // Modern dark surface
    borderRadius: 0,
    marginHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    ...Shadows.md,
  },
  heroGradient: {
    paddingHorizontal: getResponsiveSpacing(Spacing.sm, Spacing.md, Spacing.lg, Spacing.xl),
    paddingVertical: getResponsiveSpacing(Spacing.xs, Spacing.sm, Spacing.md, Spacing.lg),
    borderRadius: 0,
    marginHorizontal: 0,
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
    color: '#FFFFFF', // White text for dark theme
    marginBottom: 2,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: getResponsiveFontSize(Typography.sizes.xs, Typography.sizes.sm, Typography.sizes.base, Typography.sizes.lg),
    color: 'rgba(255,255,255,0.7)', // Subtle white for dark theme
    lineHeight: Typography.lineHeights.base,
    textAlign: 'center',
  },
  heroActions: {
    flexDirection: 'row',
    gap: getResponsiveSpacing(Spacing.sm, Spacing.md, Spacing.md, Spacing.lg),
    alignItems: 'center',
  },
  heroActionButton: {
    padding: getResponsiveSpacing(Spacing.xs, Spacing.xs, Spacing.sm, Spacing.md),
    backgroundColor: 'rgba(124, 58, 237, 0.2)', // Modern purple accent
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    minWidth: getResponsiveSpacing(44, 48, 52, 56),
    minHeight: getResponsiveSpacing(44, 48, 52, 56),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...(isExtraSmallScreen && {
      minWidth: 40,
      minHeight: 40,
    }),
    ...(isVerySmallScreen && {
      minWidth: 42,
      minHeight: 42,
    }),
  },
  badge: {
    position: 'absolute',
    top: getResponsiveSpacing(-6, -8, -8, -10),
    right: getResponsiveSpacing(-6, -8, -8, -10),
    backgroundColor: '#EC4899', // Pink accent
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

  // Simple header styles - Enhanced for mobile
  simpleHeader: {
    paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0) + getMobileOptimizedSpacing(Spacing.md, Spacing.lg, Spacing.xl, Spacing['2xl']),
    paddingBottom: getMobileOptimizedSpacing(Spacing.sm, Spacing.md, Spacing.lg, Spacing.xl), // Increased bottom padding
    backgroundColor: 'transparent',
    minHeight: getMobileOptimizedSpacing(80, 90, 100, 110), // Increased minimum header height to accommodate Notes text
    // Better mobile support
    maxHeight: isLandscape ? getMobileOptimizedSpacing(90, 100, 110, 120) : undefined,
    // Enhanced mobile support for very small screens
    ...(isExtraSmallScreen && {
      paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0) + getMobileOptimizedSpacing(Spacing.sm, Spacing.md, Spacing.lg, Spacing.xl),
      paddingBottom: getMobileOptimizedSpacing(Spacing.sm, Spacing.md, Spacing.lg, Spacing.xl), // Increased bottom padding
      minHeight: getMobileOptimizedSpacing(70, 80, 90, 100), // Increased minimum height
    }),
  },
  simpleHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getMobileOptimizedSpacing(Spacing.sm, Spacing.md, Spacing.lg, Spacing.xl),
    minHeight: getMobileOptimizedSpacing(60, 70, 80, 90), // Increased minimum height to accommodate Notes text
    // Better mobile layout
    flexWrap: isVerySmallScreen ? 'wrap' : 'nowrap',
    gap: isVerySmallScreen ? getMobileOptimizedSpacing(Spacing.xs, Spacing.sm, Spacing.md, Spacing.lg) : 0,
    // Enhanced mobile layout flexibility
    ...(isExtraSmallScreen && {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: getMobileOptimizedSpacing(Spacing.xs, Spacing.sm, Spacing.md, Spacing.lg),
    }),
    ...(isLandscape && {
      flexWrap: 'nowrap',
      gap: getMobileOptimizedSpacing(Spacing.xs, Spacing.sm, Spacing.md, Spacing.lg),
    }),
  },
  simpleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getMobileOptimizedSpacing(Spacing.sm, Spacing.md, Spacing.lg, Spacing.xl),
    flex: 1, // Allow text to take available space
    marginRight: getMobileOptimizedSpacing(Spacing.sm, Spacing.md, Spacing.lg, Spacing.xl),
    // Better mobile text handling
    minWidth: 0, // Allow text to shrink properly
    flexShrink: 1, // Allow shrinking on very small screens
  },
  simpleBackButton: {
    padding: getResponsiveSpacing(Spacing.sm, Spacing.sm, Spacing.md, Spacing.md), // Minimum 44px touch target
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: getResponsiveSpacing(40, 44, 48, 52),
    minHeight: getResponsiveSpacing(40, 44, 48, 52),
  },
  simpleHeaderTitle: {
    fontSize: getMobileOptimizedFontSize(Typography.sizes.lg, Typography.sizes.xl, Typography.sizes['2xl'], Typography.sizes['3xl']),
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
    flex: 1, // Allow title to take available space
    // Better mobile text handling
    minWidth: 0, // Allow text to shrink properly
    flexShrink: 1, // Allow shrinking on very small screens
    // Enhanced mobile text optimization
    lineHeight: getMobileOptimizedFontSize(18, 20, 22, 24),
    textAlign: 'left', // Left align when next to back button
    ...(isExtraSmallScreen && {
      fontSize: Math.max(getMobileOptimizedFontSize(Typography.sizes.sm, Typography.sizes.base, Typography.sizes.lg, Typography.sizes.xl), 12),
      lineHeight: 16,
    }),
    ...(isLandscape && {
      lineHeight: getMobileOptimizedFontSize(16, 18, 20, 22),
    }),
  },
  simpleHeaderSubtitle: {
    fontSize: getMobileOptimizedFontSize(Typography.sizes.xs, Typography.sizes.sm, Typography.sizes.base, Typography.sizes.lg),
    color: Colors.neutral[700],
    marginTop: 2,
    flex: 1, // Allow subtitle to take available space
    // Better mobile text handling
    minWidth: 0, // Allow text to shrink properly
    flexShrink: 1, // Allow shrinking on very small screens
    // Enhanced mobile text optimization
    lineHeight: getMobileOptimizedFontSize(14, 16, 18, 20),
    textAlign: 'center',
    ...(isExtraSmallScreen && {
      fontSize: Math.max(getMobileOptimizedFontSize(Typography.sizes.xs, Typography.sizes.xs, Typography.sizes.sm, Typography.sizes.base), 10),
      lineHeight: 14,
    }),
    ...(isLandscape && {
      lineHeight: getMobileOptimizedFontSize(12, 14, 16, 18),
    }),
  },
  simpleHeaderActions: {
    flexDirection: 'row',
    gap: getMobileOptimizedSpacing(Spacing.xs, Spacing.sm, Spacing.md, Spacing.md),
    alignItems: 'center',
    flexShrink: 0, // Prevent actions from shrinking
    // Better mobile layout
    flexWrap: isVerySmallScreen ? 'wrap' : 'nowrap',
    justifyContent: isVerySmallScreen ? 'flex-end' : 'flex-start',
    // Enhanced mobile layout flexibility
    ...(isExtraSmallScreen && {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: getMobileOptimizedSpacing(Spacing.xs, Spacing.xs, Spacing.sm, Spacing.sm),
    }),
    ...(isLandscape && {
      flexDirection: 'row',
      flexWrap: 'nowrap',
      gap: getMobileOptimizedSpacing(Spacing.xs, Spacing.sm, Spacing.md, Spacing.md),
    }),
  },
  simpleActionButton: {
    padding: getMobileOptimizedSpacing(Spacing.sm, Spacing.sm, Spacing.md, Spacing.md), // Minimum 44px touch target
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minWidth: getMobileOptimizedSpacing(44, 48, 52, 56), // Enhanced minimum touch target
    minHeight: getMobileOptimizedSpacing(44, 48, 52, 56), // Enhanced minimum touch target
    flexShrink: 0, // Prevent buttons from shrinking
    // Better mobile button styling
    elevation: 2, // Android shadow
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Enhanced mobile touch targets with fallbacks
    ...(isExtraSmallScreen && {
      minWidth: 40,
      minHeight: 40,
      padding: getMobileOptimizedSpacing(Spacing.xs, Spacing.xs, Spacing.sm, Spacing.sm),
    }),
    ...(isVerySmallScreen && {
      minWidth: 42,
      minHeight: 42,
    }),
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

  // Compact header styles - Enhanced for mobile
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
    paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0) + getResponsiveSpacing(Spacing.xs, Spacing.sm, Spacing.md, Spacing.lg),
    paddingBottom: getResponsiveSpacing(Spacing.xs, Spacing.xs, Spacing.xs, Spacing.sm),
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
    fontSize: getMobileOptimizedFontSize(Typography.sizes.base, Typography.sizes.lg, Typography.sizes.xl, Typography.sizes['2xl']),
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[800],
    flex: 1,
    // Better mobile text handling
    minWidth: 0, // Allow text to shrink properly
    flexShrink: 1, // Allow shrinking on very small screens
    textAlign: 'center',
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
    minWidth: getMobileOptimizedSpacing(44, 48, 52, 56), // Enhanced minimum touch target
    minHeight: getMobileOptimizedSpacing(44, 48, 52, 56), // Enhanced minimum touch target
    flexShrink: 0, // Prevent button from shrinking
    // Better mobile button styling
    elevation: 1, // Android shadow
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  compactBackButtonSmall: {
    padding: getResponsiveSpacing(Spacing.xs, Spacing.sm, Spacing.sm, Spacing.md),
    minWidth: getResponsiveSpacing(36, 40, 44, 48),
    minHeight: getResponsiveSpacing(36, 40, 44, 48),
  },

  // Transparent header styles
  transparentHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0) + getResponsiveSpacing(Spacing.md, Spacing.lg, Spacing.xl, Spacing['2xl']),
    paddingBottom: getResponsiveSpacing(Spacing.xs, Spacing.sm, Spacing.md, Spacing.lg),
    backgroundColor: 'transparent',
    // Better mobile support
    minHeight: getMobileOptimizedSpacing(60, 70, 80, 90),
    maxHeight: isLandscape ? getMobileOptimizedSpacing(70, 80, 90, 100) : undefined,
  },
  transparentHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(Spacing.sm, Spacing.md, Spacing.lg, Spacing.xl),
    // Better mobile layout
    flexWrap: isVerySmallScreen ? 'wrap' : 'nowrap',
    gap: isVerySmallScreen ? getMobileOptimizedSpacing(Spacing.xs, Spacing.sm, Spacing.md, Spacing.lg) : 0,
    minHeight: getMobileOptimizedSpacing(44, 48, 52, 56), // Minimum touch target height
  },
  transparentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing(Spacing.sm, Spacing.md, Spacing.lg, Spacing.xl),
    flex: 1, // Allow text to take available space
    minWidth: 0, // Allow text to shrink properly
    flexShrink: 1, // Allow shrinking on very small screens
  },
  transparentBackButton: {
    padding: getResponsiveSpacing(Spacing.sm, Spacing.sm, Spacing.md, Spacing.md), // Minimum 44px touch target
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: getResponsiveSpacing(40, 44, 48, 52),
    minHeight: getResponsiveSpacing(40, 44, 48, 52),
  },
  transparentHeaderTitle: {
    fontSize: getResponsiveFontSize(Typography.sizes.xl, Typography.sizes['2xl'], Typography.sizes['3xl'], Typography.sizes['4xl']),
    fontWeight: Typography.weights.bold,
    color: Colors.white,
    flex: 1, // Allow title to take available space
    // Better mobile text handling
    minWidth: 0, // Allow text to shrink properly
    flexShrink: 1, // Allow shrinking on very small screens
    textAlign: 'center',
  },
  transparentHeaderActions: {
    flexDirection: 'row',
    gap: getResponsiveSpacing(Spacing.xs, Spacing.sm, Spacing.md, Spacing.md),
    alignItems: 'center',
    flexShrink: 0, // Prevent actions from shrinking
    // Better mobile layout
    flexWrap: isVerySmallScreen ? 'wrap' : 'nowrap',
    justifyContent: isVerySmallScreen ? 'flex-end' : 'flex-start',
  },
  transparentActionButton: {
    padding: getResponsiveSpacing(Spacing.sm, Spacing.sm, Spacing.md, Spacing.md), // Minimum 44px touch target
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minWidth: getResponsiveSpacing(44, 48, 52, 56), // Enhanced minimum touch target
    minHeight: getResponsiveSpacing(44, 48, 52, 56), // Enhanced minimum touch target
    flexShrink: 0, // Prevent buttons from shrinking
    // Better mobile button styling
    elevation: 1, // Android shadow
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  transparentBadge: {
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
  transparentBadgeText: {
    fontSize: getResponsiveFontSize(Typography.sizes.xs, Typography.sizes.xs, Typography.sizes.sm, Typography.sizes.sm),
    fontWeight: Typography.weights.bold,
    color: 'white',
  },

  // Sticky header styles
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 8, // Enhanced elevation for better visibility on mobile
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: getResponsiveSpacing(2, 2, 3, 4),
    },
    shadowOpacity: 0.15,
    shadowRadius: getResponsiveSpacing(3, 4, 5, 6),
  },

  // Reader button active state
  readerButtonActive: {
    backgroundColor: Colors.primary[100],
    borderWidth: 2,
    borderColor: Colors.primary[300],
    elevation: 4,
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});