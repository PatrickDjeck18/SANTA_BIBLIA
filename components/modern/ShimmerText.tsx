// ShimmerText Component
// Animated shimmer effects for loading states

import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    ViewStyle,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useModernTheme } from '@/hooks/useModernTheme';
import { Spacing, BorderRadius, Typography, Shadows } from '@/constants/DesignTokens';

const { width: screenWidth } = Dimensions.get('window');

// =============================================================================
// SHIMMER TEXT - Text with shimmer loading animation
// =============================================================================

interface ShimmerTextProps {
    children?: React.ReactNode;
    width?: number | string;
    height?: number;
    style?: ViewStyle;
    shimmerColors?: readonly [string, string, string];
    duration?: number;
    delay?: number;
}

export const ShimmerText: React.FC<ShimmerTextProps> = ({
    children,
    width = 200,
    height = 20,
    style,
    shimmerColors,
    duration = 1500,
    delay = 0,
}) => {
    const theme = useModernTheme();
    const shimmerAnim = useRef(new Animated.Value(-screenWidth)).current;

    const defaultColors: readonly [string, string, string] = theme.colors.isDark
        ? ['#1A1A2E', '#2A2A4E', '#1A1A2E']
        : ['#F1F5F9', '#E2E8F0', '#F1F5F9'];

    const colors = shimmerColors || defaultColors;

    useEffect(() => {
        const startAnimation = () => {
            shimmerAnim.setValue(-screenWidth);
            Animated.timing(shimmerAnim, {
                toValue: screenWidth,
                duration,
                delay,
                useNativeDriver: true,
            }).start(() => {
                startAnimation();
            });
        };

        startAnimation();
    }, [duration, delay]);

    const translateX = shimmerAnim.interpolate({
        inputRange: [-screenWidth, screenWidth],
        outputRange: [-screenWidth, screenWidth],
    });

    return (
        <View
            style={[
                styles.shimmerContainer,
                {
                    width: width as any,
                    height,
                    backgroundColor: theme.colors.isDark ? '#1A1A2E' : '#F1F5F9',
                    borderRadius: height / 2,
                },
                style,
            ]}
        >
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    {
                        transform: [{ translateX }],
                    },
                ]}
            >
                <LinearGradient
                    colors={colors}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                />
            </Animated.View>
            {children && (
                <View style={styles.shimmerContent}>
                    {children}
                </View>
            )}
        </View>
    );
};

// =============================================================================
// SKELETON CARD - Loading placeholder card
// =============================================================================

interface SkeletonCardProps {
    lines?: number;
    hasImage?: boolean;
    imageHeight?: number;
    style?: ViewStyle;
    animated?: boolean;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
    lines = 3,
    hasImage = true,
    imageHeight = 150,
    style,
    animated = true,
}) => {
    const theme = useModernTheme();

    return (
        <View
            style={[
                styles.skeletonCard,
                {
                    backgroundColor: theme.colors.cardGlass,
                    borderColor: theme.colors.border,
                },
                style,
            ]}
        >
            {hasImage && (
                <ShimmerText
                    width="100%"
                    height={imageHeight}
                    style={{
                        marginBottom: Spacing.md,
                        borderRadius: BorderRadius.lg,
                    }}
                    duration={animated ? 1500 : 0}
                />
            )}
            <View style={styles.skeletonContent}>
                <ShimmerText
                    width="70%"
                    height={20}
                    style={styles.skeletonLine}
                    duration={animated ? 1500 : 0}
                    delay={100}
                />
                {Array.from({ length: lines - 1 }).map((_, index) => (
                    <ShimmerText
                        key={index}
                        width={`${85 - index * 15}%`}
                        height={14}
                        style={styles.skeletonLine}
                        duration={animated ? 1500 : 0}
                        delay={200 + index * 100}
                    />
                ))}
            </View>
        </View>
    );
};

// =============================================================================
// SKELETON LIST - Multiple skeleton cards for list loading
// =============================================================================

interface SkeletonListProps {
    count?: number;
    lines?: number;
    hasImage?: boolean;
    imageHeight?: number;
    style?: ViewStyle;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
    count = 3,
    lines = 3,
    hasImage = true,
    imageHeight = 150,
    style,
}) => {
    return (
        <View style={style}>
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonCard
                    key={index}
                    lines={lines}
                    hasImage={hasImage}
                    imageHeight={imageHeight}
                    style={{ marginBottom: Spacing.md }}
                />
            ))}
        </View>
    );
};

// =============================================================================
// SKELETON AVATAR - Circular loading placeholder
// =============================================================================

interface SkeletonAvatarProps {
    size?: number;
    style?: ViewStyle;
}

export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
    size = 48,
    style,
}) => {
    return (
        <ShimmerText
            width={size}
            height={size}
            style={{
                borderRadius: size / 2,
                overflow: 'hidden',
                ...(style as object),
            }}
        />
    );
};

// =============================================================================
// SKELETON ROW - Horizontal row of skeleton elements
// =============================================================================

interface SkeletonRowProps {
    items?: number;
    itemWidth?: number;
    itemHeight?: number;
    spacing?: number;
    style?: ViewStyle;
}

export const SkeletonRow: React.FC<SkeletonRowProps> = ({
    items = 4,
    itemWidth = 80,
    itemHeight = 80,
    spacing = Spacing.md,
    style,
}) => {
    return (
        <View style={[styles.skeletonRow, { gap: spacing }, style]}>
            {Array.from({ length: items }).map((_, index) => (
                <ShimmerText
                    key={index}
                    width={itemWidth}
                    height={itemHeight}
                    style={{ borderRadius: BorderRadius.lg }}
                    delay={index * 100}
                />
            ))}
        </View>
    );
};

// =============================================================================
// PULSE DOT - Animated pulsing dot for loading indicators
// =============================================================================

interface PulseDotProps {
    size?: number;
    color?: string;
    style?: ViewStyle;
    delay?: number;
}

export const PulseDot: React.FC<PulseDotProps> = ({
    size = 12,
    color,
    style,
    delay = 0,
}) => {
    const theme = useModernTheme();
    const dotColor = color || theme.colors.accent;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.5,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }, delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <View style={[styles.pulseContainer, style]}>
            <Animated.View
                style={[
                    styles.pulseDot,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: dotColor,
                        transform: [{ scale: pulseAnim }],
                        opacity: pulseAnim.interpolate({
                            inputRange: [1, 1.5],
                            outputRange: [1, 0.5],
                        }),
                    },
                ]}
            />
        </View>
    );
};

// =============================================================================
// LOADING OVERLAY - Full screen loading overlay with shimmer
// =============================================================================

interface LoadingOverlayProps {
    visible: boolean;
    message?: string;
    style?: ViewStyle;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    visible,
    message = 'Loading...',
    style,
}) => {
    const theme = useModernTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: visible ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.overlay,
                {
                    backgroundColor: theme.colors.overlay,
                    opacity: fadeAnim,
                },
                style,
            ]}
        >
            <View
                style={[
                    styles.overlayContent,
                    { backgroundColor: theme.colors.card },
                ]}
            >
                <View style={styles.spinnerContainer}>
                    <PulseDot size={16} />
                    <PulseDot size={16} delay={200} />
                    <PulseDot size={16} delay={400} />
                </View>
                <Text style={[styles.overlayMessage, { color: theme.colors.text }]}>
                    {message}
                </Text>
            </View>
        </Animated.View>
    );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
    // Shimmer Text
    shimmerContainer: {
        overflow: 'hidden',
        position: 'relative',
    },
    shimmerContent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Skeleton Card
    skeletonCard: {
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        padding: Spacing.md,
        overflow: 'hidden',
    },
    skeletonImage: {
        marginBottom: Spacing.md,
    },
    skeletonContent: {
        gap: Spacing.sm,
    },
    skeletonLine: {
        borderRadius: BorderRadius.sm,
    },

    // Skeleton Row
    skeletonRow: {
        flexDirection: 'row',
    },

    // Pulse Dot
    pulseContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    pulseDot: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },

    // Loading Overlay
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    overlayContent: {
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        ...Shadows.lg,
    },
    spinnerContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    overlayMessage: {
        fontSize: Typography.sizes.base,
        fontWeight: '500',
    },
});
