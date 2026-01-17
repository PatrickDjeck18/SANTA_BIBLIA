// Modern Button Components
// Premium styled buttons with gradients and animations

import React, { useRef } from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    Animated,
    ViewStyle,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useModernTheme } from '@/hooks/useModernTheme';
import { Spacing, BorderRadius, Typography, Shadows } from '@/constants/DesignTokens';
import * as Haptics from 'expo-haptics';

interface ModernButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    gradient?: readonly [string, string, ...string[]];
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
    haptic?: boolean;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    gradient,
    icon,
    iconPosition = 'left',
    disabled = false,
    loading = false,
    fullWidth = false,
    style,
    haptic = true,
}) => {
    const theme = useModernTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;

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

    const handlePress = () => {
        if (haptic) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
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
            paddingHorizontal: Spacing.xl,
            fontSize: Typography.sizes.base,
            iconSize: 20,
        },
        large: {
            paddingVertical: Spacing.lg,
            paddingHorizontal: Spacing['2xl'],
            fontSize: Typography.sizes.lg,
            iconSize: 24,
        },
    };

    const currentSize = sizeStyles[size];
    const defaultGradient = gradient || theme.gradients.primary;

    const getButtonStyle = () => {
        switch (variant) {
            case 'primary':
                return {};
            case 'secondary':
                return {
                    backgroundColor: theme.colors.secondaryLight,
                };
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderColor: theme.colors.accent,
                };
            case 'ghost':
                return {
                    backgroundColor: 'transparent',
                };
            default:
                return {};
        }
    };

    const getTextColor = () => {
        switch (variant) {
            case 'primary':
                return '#FFFFFF';
            case 'secondary':
                return theme.colors.secondary;
            case 'outline':
                return theme.colors.accent;
            case 'ghost':
                return theme.colors.accent;
            default:
                return '#FFFFFF';
        }
    };

    const buttonContent = (
        <>
            {loading ? (
                <ActivityIndicator color={getTextColor()} size="small" />
            ) : (
                <>
                    {icon && iconPosition === 'left' && (
                        <Animated.View style={{ marginRight: Spacing.sm }}>
                            {icon}
                        </Animated.View>
                    )}
                    <Text style={[
                        styles.buttonText,
                        { color: getTextColor(), fontSize: currentSize.fontSize }
                    ]}>
                        {title}
                    </Text>
                    {icon && iconPosition === 'right' && (
                        <Animated.View style={{ marginLeft: Spacing.sm }}>
                            {icon}
                        </Animated.View>
                    )}
                </>
            )}
        </>
    );

    const containerStyle = [
        styles.buttonContainer,
        {
            paddingVertical: currentSize.paddingVertical,
            paddingHorizontal: currentSize.paddingHorizontal,
        },
        getButtonStyle(),
        fullWidth && { width: '100%' as const },
        disabled && styles.disabled,
    ];

    return (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
            <TouchableOpacity
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
                activeOpacity={0.9}
            >
                {variant === 'primary' ? (
                    <LinearGradient
                        colors={defaultGradient}
                        style={[containerStyle, styles.gradientButton]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {buttonContent}
                    </LinearGradient>
                ) : (
                    <Animated.View style={containerStyle}>
                        {buttonContent}
                    </Animated.View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

// Floating Action Button
interface FABProps {
    icon: React.ReactNode;
    onPress: () => void;
    gradient?: readonly [string, string, ...string[]];
    size?: 'small' | 'medium' | 'large';
    style?: ViewStyle;
}

export const FloatingActionButton: React.FC<FABProps> = ({
    icon,
    onPress,
    gradient,
    size = 'medium',
    style,
}) => {
    const theme = useModernTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const defaultGradient = gradient || theme.gradients.primary;

    const sizeValues = {
        small: 48,
        medium: 56,
        large: 64,
    };

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.9,
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

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
    };

    const fabSize = sizeValues[size];

    return (
        <Animated.View style={[
            styles.fabContainer,
            { transform: [{ scale: scaleAnim }] },
            style,
        ]}>
            <TouchableOpacity
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={defaultGradient}
                    style={[
                        styles.fab,
                        { width: fabSize, height: fabSize, borderRadius: fabSize / 2 }
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {icon}
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

// Icon Button
interface IconButtonProps {
    icon: React.ReactNode;
    onPress: () => void;
    variant?: 'filled' | 'outline' | 'ghost';
    size?: number;
    color?: string;
    backgroundColor?: string;
    style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
    icon,
    onPress,
    variant = 'ghost',
    size = 44,
    color,
    backgroundColor,
    style,
}) => {
    const theme = useModernTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.9,
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

    const getStyle = () => {
        switch (variant) {
            case 'filled':
                return {
                    backgroundColor: backgroundColor || theme.colors.accent,
                };
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: color || theme.colors.border,
                };
            case 'ghost':
                return {
                    backgroundColor: 'transparent',
                };
            default:
                return {};
        }
    };

    return (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
            <TouchableOpacity
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onPress();
                }}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[
                    styles.iconButton,
                    { width: size, height: size, borderRadius: size / 2 },
                    getStyle(),
                ]}
            >
                {icon}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.full,
    },
    gradientButton: {
        ...Shadows.md,
    },
    buttonText: {
        fontWeight: '600',
    },
    disabled: {
        opacity: 0.5,
    },
    fabContainer: {
        ...Shadows.lg,
    },
    fab: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
