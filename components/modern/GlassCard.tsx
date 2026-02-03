// GlassCard Component
// Frosted glass effect card with backdrop blur support

import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    ViewStyle,
    TextStyle,
    Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useModernTheme } from '@/hooks/useModernTheme';
import { Spacing, BorderRadius, Shadows, Typography } from '@/constants/DesignTokens';

// =============================================================================
// GLASS CARD - Primary container with frosted glass effect
// =============================================================================

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    contentStyle?: ViewStyle;
    onPress?: () => void;
    intensity?: 'light' | 'medium' | 'heavy';
    gradientOverlay?: boolean;
    gradientColors?: readonly [string, string, ...string[]];
    border?: boolean;
    shadow?: boolean;
    animated?: boolean;
    delay?: number;
    testID?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    style,
    contentStyle,
    onPress,
    intensity = 'medium',
    gradientOverlay = false,
    gradientColors,
    border = true,
    shadow = true,
    animated = true,
    delay = 0,
    testID,
}) => {
    const theme = useModernTheme();
    const fadeAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
    const scaleAnim = useRef(new Animated.Value(animated ? 0.95 : 1)).current;

    const intensityMap = {
        light: theme.colors.isDark ? 20 : 40,
        medium: theme.colors.isDark ? 40 : 60,
        heavy: theme.colors.isDark ? 60 : 80,
    };

    useEffect(() => {
        if (animated) {
            const timer = setTimeout(() => {
                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.spring(scaleAnim, {
                        toValue: 1,
                        tension: 80,
                        friction: 12,
                        useNativeDriver: true,
                    }),
                ]).start();
            }, delay);
            return () => clearTimeout(timer);
        }
    }, [delay, animated]);

    const cardContent = (
        <Animated.View
            testID={testID}
            style={[
                styles.glassCard,
                {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                },
                shadow && Shadows.md,
                border && {
                    borderWidth: 1,
                    borderColor: theme.colors.isDark
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(255, 255, 255, 0.5)',
                },
                style,
            ]}
        >
            {/* Blur Background */}
            <BlurView
                intensity={intensityMap[intensity]}
                tint={theme.colors.isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
            />

            {/* Optional Gradient Overlay */}
            {gradientOverlay && gradientColors && (
                <LinearGradient
                    colors={gradientColors}
                    style={[StyleSheet.absoluteFill, { opacity: 0.15 }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            )}

            {/* Content */}
            <View style={[styles.content, contentStyle]}>
                {children}
            </View>
        </Animated.View>
    );

    if (onPress) {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.9}
                style={{ width: '100%' }}
            >
                {cardContent}
            </TouchableOpacity>
        );
    }

    return cardContent;
};

// =============================================================================
// GLASS BUTTON - Glass-style button with press animation
// =============================================================================

interface GlassButtonProps {
    title: string;
    onPress: () => void;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    size?: 'small' | 'medium' | 'large';
    intensity?: 'light' | 'medium' | 'heavy';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
    title,
    onPress,
    icon,
    iconPosition = 'left',
    size = 'medium',
    intensity = 'medium',
    disabled = false,
    loading = false,
    fullWidth = false,
    style,
    textStyle,
}) => {
    const theme = useModernTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const intensityMap = {
        light: theme.colors.isDark ? 15 : 30,
        medium: theme.colors.isDark ? 30 : 50,
        heavy: theme.colors.isDark ? 50 : 70,
    };

    const sizeStyles = {
        small: {
            paddingVertical: Spacing.sm,
            paddingHorizontal: Spacing.md,
            fontSize: Typography.sizes.sm,
            iconSize: 16,
        },
        medium: {
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.lg,
            fontSize: Typography.sizes.base,
            iconSize: 20,
        },
        large: {
            paddingVertical: Spacing.lg,
            paddingHorizontal: Spacing.xl,
            fontSize: Typography.sizes.lg,
            iconSize: 24,
        },
    };

    const currentSize = sizeStyles[size];

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View
            style={[
                { transform: [{ scale: scaleAnim }] },
                fullWidth && { width: '100%' },
                style,
            ]}
        >
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
                activeOpacity={0.8}
                style={[
                    styles.glassButton,
                    {
                        paddingVertical: currentSize.paddingVertical,
                        paddingHorizontal: currentSize.paddingHorizontal,
                        borderColor: theme.colors.isDark
                            ? 'rgba(255, 255, 255, 0.2)'
                            : 'rgba(255, 255, 255, 0.6)',
                    },
                    disabled && styles.disabled,
                ]}
            >
                <BlurView
                    intensity={intensityMap[intensity]}
                    tint={theme.colors.isDark ? 'dark' : 'light'}
                    style={StyleSheet.absoluteFill}
                />

                {icon && iconPosition === 'left' && (
                    <View style={styles.iconLeft}>{icon}</View>
                )}

                <Text
                    style={[
                        styles.buttonText,
                        {
                            fontSize: currentSize.fontSize,
                            color: theme.colors.text,
                        },
                        textStyle,
                    ]}
                >
                    {title}
                </Text>

                {icon && iconPosition === 'right' && (
                    <View style={styles.iconRight}>{icon}</View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

// =============================================================================
// FLOATING PILL - Quick actions pill shape button
// =============================================================================

interface FloatingPillProps {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    color?: string;
    active?: boolean;
    style?: ViewStyle;
}

export const FloatingPill: React.FC<FloatingPillProps> = ({
    icon,
    label,
    onPress,
    color,
    active = false,
    style,
}) => {
    const theme = useModernTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const pillColor = color || theme.colors.accent;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.92,
            tension: 400,
            friction: 12,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 400,
            friction: 12,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View
            style={[
                styles.pillContainer,
                { transform: [{ scale: scaleAnim }] },
                style,
            ]}
        >
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
                style={[
                    styles.floatingPill,
                    {
                        backgroundColor: active
                            ? pillColor
                            : theme.colors.cardGlass,
                        borderColor: active
                            ? pillColor
                            : theme.colors.border,
                    },
                ]}
            >
                <View
                    style={[
                        styles.pillIcon,
                        {
                            backgroundColor: active
                                ? 'rgba(255, 255, 255, 0.2)'
                                : `${pillColor}20`,
                        },
                    ]}
                >
                    {icon}
                </View>
                <Text
                    style={[
                        styles.pillLabel,
                        {
                            color: active ? '#FFFFFF' : theme.colors.text,
                        },
                    ]}
                >
                    {label}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

// =============================================================================
// STAT BADGE - Compact stats display with icon
// =============================================================================

interface StatBadgeProps {
    icon: React.ReactNode;
    value: string | number;
    label: string;
    color?: string;
    size?: 'small' | 'medium' | 'large';
    style?: ViewStyle;
}

export const StatBadge: React.FC<StatBadgeProps> = ({
    icon,
    value,
    label,
    color,
    size = 'medium',
    style,
}) => {
    const theme = useModernTheme();
    const badgeColor = color || theme.colors.accent;

    const sizeStyles = {
        small: {
            container: { padding: Spacing.sm },
            icon: { width: 28, height: 28 },
            value: { fontSize: Typography.sizes.lg },
            label: { fontSize: Typography.sizes.xs },
        },
        medium: {
            container: { padding: Spacing.md },
            icon: { width: 36, height: 36 },
            value: { fontSize: Typography.sizes.xl },
            label: { fontSize: Typography.sizes.sm },
        },
        large: {
            container: { padding: Spacing.lg },
            icon: { width: 44, height: 44 },
            value: { fontSize: Typography.sizes['2xl'] },
            label: { fontSize: Typography.sizes.base },
        },
    };

    const currentSize = sizeStyles[size];

    return (
        <View
            style={[
                styles.statBadge,
                {
                    backgroundColor: `${badgeColor}15`,
                    borderColor: `${badgeColor}30`,
                },
                currentSize.container,
                style,
            ]}
        >
            <View
                style={[
                    styles.badgeIcon,
                    {
                        backgroundColor: badgeColor,
                        ...currentSize.icon,
                    },
                ]}
            >
                {icon}
            </View>
            <Text
                style={[
                    styles.badgeValue,
                    { color: theme.colors.text, ...currentSize.value },
                ]}
            >
                {value}
            </Text>
            <Text
                style={[
                    styles.badgeLabel,
                    { color: theme.colors.textMuted, ...currentSize.label },
                ]}
            >
                {label}
            </Text>
        </View>
    );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
    // Glass Card
    glassCard: {
        borderRadius: BorderRadius['2xl'],
        overflow: 'hidden',
        position: 'relative',
    },
    content: {
        padding: Spacing.lg,
        position: 'relative',
        zIndex: 1,
    },

    // Glass Button
    glassButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        overflow: 'hidden',
        position: 'relative',
    },
    buttonText: {
        fontWeight: '600',
    },
    iconLeft: {
        marginRight: Spacing.sm,
    },
    iconRight: {
        marginLeft: Spacing.sm,
    },
    disabled: {
        opacity: 0.5,
    },

    // Floating Pill
    pillContainer: {
        ...Shadows.md,
    },
    floatingPill: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.sm,
        paddingRight: Spacing.md,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
    },
    pillIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
    },
    pillLabel: {
        fontSize: Typography.sizes.sm,
        fontWeight: '600',
    },

    // Stat Badge
    statBadge: {
        alignItems: 'center',
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        minWidth: 80,
    },
    badgeIcon: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.sm,
    },
    badgeValue: {
        fontWeight: '700',
        marginBottom: 2,
    },
    badgeLabel: {
        fontWeight: '500',
    },
});
