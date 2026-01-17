// Modern UI Components
// Reusable components with consistent modern styling

import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import { useModernTheme, Theme } from '@/hooks/useModernTheme';
import { Spacing, BorderRadius, Shadows, Typography } from '@/constants/DesignTokens';

// =============================================================================
// HERO SECTION - Large gradient header with decorations
// =============================================================================

interface HeroSectionProps {
    title: string;
    subtitle?: string;
    badge?: {
        icon: React.ReactNode;
        text: string;
    };
    gradient?: readonly [string, string, ...string[]];
    icon?: React.ReactNode;
    children?: React.ReactNode;
    style?: ViewStyle;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
    title,
    subtitle,
    badge,
    gradient,
    icon,
    children,
    style,
}) => {
    const theme = useModernTheme();
    const defaultGradient = theme.gradients.hero;
    const colors = gradient || defaultGradient;

    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 12, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <Animated.View style={[
            styles.heroContainer,
            { transform: [{ scale: scaleAnim }], opacity: fadeAnim },
            style,
        ]}>
            <LinearGradient
                colors={colors}
                style={styles.heroGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Decorative circles */}
                <View style={styles.heroDecorations}>
                    <View style={[styles.decorCircle1, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
                    <View style={[styles.decorCircle2, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
                </View>

                <View style={styles.heroContent}>
                    {badge && (
                        <View style={styles.heroBadge}>
                            {badge.icon}
                            <Text style={styles.heroBadgeText}>{badge.text}</Text>
                        </View>
                    )}

                    <Text style={styles.heroTitle}>{title}</Text>

                    {subtitle && (
                        <Text style={styles.heroSubtitle}>{subtitle}</Text>
                    )}

                    {children}
                </View>

                {icon && (
                    <View style={styles.heroIconContainer}>
                        {icon}
                    </View>
                )}
            </LinearGradient>
        </Animated.View>
    );
};

// =============================================================================
// MODERN CARD - Glass-morphism card with optional gradient border
// =============================================================================

interface ModernCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    onPress?: () => void;
    gradient?: boolean;
    gradientColors?: readonly [string, string, ...string[]];
    animated?: boolean;
    delay?: number;
}

export const ModernCard: React.FC<ModernCardProps> = ({
    children,
    style,
    onPress,
    gradient = false,
    gradientColors,
    animated = true,
    delay = 0,
}) => {
    const theme = useModernTheme();
    const fadeAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
    const slideAnim = useRef(new Animated.Value(animated ? 20 : 0)).current;

    useEffect(() => {
        if (animated) {
            const timer = setTimeout(() => {
                Animated.parallel([
                    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
                    Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
                ]).start();
            }, delay);
            return () => clearTimeout(timer);
        }
    }, [delay, animated]);

    const cardStyle = [
        styles.modernCard,
        {
            backgroundColor: theme.colors.cardGlass,
            borderColor: theme.colors.border,
        },
        style,
    ];

    const content = (
        <Animated.View style={[
            cardStyle,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
            {gradient && gradientColors ? (
                <LinearGradient
                    colors={gradientColors}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            ) : null}
            {children}
        </Animated.View>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
                {content}
            </TouchableOpacity>
        );
    }

    return content;
};

// =============================================================================
// STAT CARD - Compact stat display with icon and gradient
// =============================================================================

interface StatCardProps {
    icon: React.ReactNode;
    value: string | number;
    label: string;
    gradient: readonly [string, string, ...string[]];
    delay?: number;
    style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
    icon,
    value,
    label,
    gradient,
    delay = 0,
    style,
}) => {
    const theme = useModernTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
            ]).start();
        }, delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <Animated.View style={[
            styles.statCard,
            {
                backgroundColor: theme.colors.cardGlass,
                borderColor: theme.colors.border,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
            },
            style,
        ]}>
            <LinearGradient
                colors={gradient}
                style={styles.statIconBg}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {icon}
            </LinearGradient>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>{label}</Text>
        </Animated.View>
    );
};

// =============================================================================
// ACTION CARD - Horizontal card with icon, text, and arrow
// =============================================================================

interface ActionCardProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    onPress: () => void;
    gradient: readonly [string, string, ...string[]];
    badge?: string;
    delay?: number;
    style?: ViewStyle;
}

export const ActionCard: React.FC<ActionCardProps> = ({
    icon,
    title,
    subtitle,
    onPress,
    gradient,
    badge,
    delay = 0,
    style,
}) => {
    const theme = useModernTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
            ]).start();
        }, delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <Animated.View style={[
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            style,
        ]}>
            <TouchableOpacity
                style={[
                    styles.actionCard,
                    {
                        backgroundColor: theme.colors.cardGlass,
                        borderColor: theme.colors.border,
                    }
                ]}
                onPress={onPress}
                activeOpacity={0.85}
            >
                <LinearGradient
                    colors={gradient}
                    style={styles.actionIconBg}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {icon}
                </LinearGradient>

                <View style={styles.actionContent}>
                    <View style={styles.actionTitleRow}>
                        <Text style={[styles.actionTitle, { color: theme.colors.text }]}>{title}</Text>
                        {badge && (
                            <View style={styles.actionBadge}>
                                <Text style={styles.actionBadgeText}>{badge}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={[styles.actionSubtitle, { color: theme.colors.textMuted }]} numberOfLines={1}>
                        {subtitle}
                    </Text>
                </View>

                <View style={[styles.actionArrow, { backgroundColor: theme.colors.secondaryLight }]}>
                    <ChevronRight size={20} color={theme.colors.accent} />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

// =============================================================================
// SECTION HEADER - Styled section title
// =============================================================================

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    action?: {
        label: string;
        onPress: () => void;
    };
    style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    subtitle,
    action,
    style,
}) => {
    const theme = useModernTheme();

    return (
        <View style={[styles.sectionHeader, style]}>
            <View style={styles.sectionHeaderLeft}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
                {subtitle && (
                    <Text style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text>
                )}
            </View>
            {action && (
                <TouchableOpacity onPress={action.onPress} style={styles.sectionAction}>
                    <Text style={[styles.sectionActionText, { color: theme.colors.accent }]}>{action.label}</Text>
                    <ChevronRight size={16} color={theme.colors.accent} />
                </TouchableOpacity>
            )}
        </View>
    );
};

// =============================================================================
// FEATURE ITEM - List item with icon for feature lists
// =============================================================================

interface FeatureItemProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    delay?: number;
    style?: ViewStyle;
}

export const FeatureItem: React.FC<FeatureItemProps> = ({
    icon,
    title,
    description,
    delay = 0,
    style,
}) => {
    const theme = useModernTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        }, delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <Animated.View style={[
            styles.featureItem,
            {
                backgroundColor: theme.colors.cardGlass,
                borderColor: theme.colors.border,
                opacity: fadeAnim,
            },
            style,
        ]}>
            <View style={[styles.featureIcon, { backgroundColor: theme.colors.divider }]}>
                {icon}
            </View>
            <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: theme.colors.text }]}>{title}</Text>
                <Text style={[styles.featureDesc, { color: theme.colors.textMuted }]}>{description}</Text>
            </View>
        </Animated.View>
    );
};

// =============================================================================
// EMPTY STATE - Centered empty state with icon and message
// =============================================================================

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    message: string;
    action?: {
        label: string;
        onPress: () => void;
    };
    style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    message,
    action,
    style,
}) => {
    const theme = useModernTheme();

    return (
        <View style={[styles.emptyState, style]}>
            <View style={[styles.emptyIconBg, { backgroundColor: theme.colors.divider }]}>
                {icon}
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>{title}</Text>
            <Text style={[styles.emptyMessage, { color: theme.colors.textMuted }]}>{message}</Text>
            {action && (
                <TouchableOpacity
                    style={[styles.emptyAction, { backgroundColor: theme.colors.accent }]}
                    onPress={action.onPress}
                >
                    <Text style={styles.emptyActionText}>{action.label}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
    // Hero Section
    heroContainer: {
        marginBottom: Spacing.xl,
        borderRadius: BorderRadius['2xl'],
        overflow: 'hidden',
        ...Shadows.lg,
    },
    heroGradient: {
        padding: Spacing.xl,
        paddingTop: Spacing['2xl'],
        paddingBottom: Spacing['3xl'],
        minHeight: 180,
        position: 'relative',
    },
    heroDecorations: {
        ...StyleSheet.absoluteFillObject,
    },
    decorCircle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        top: -60,
        right: -60,
    },
    decorCircle2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        bottom: -40,
        left: -40,
    },
    heroContent: {
        zIndex: 10,
    },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        alignSelf: 'flex-start',
        marginBottom: Spacing.md,
    },
    heroBadgeText: {
        fontSize: Typography.sizes.sm,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: 'white',
        marginBottom: Spacing.sm,
    },
    heroSubtitle: {
        fontSize: Typography.sizes.base,
        color: 'rgba(255,255,255,0.8)',
        lineHeight: 22,
        maxWidth: '85%',
    },
    heroIconContainer: {
        position: 'absolute',
        right: Spacing.lg,
        bottom: Spacing.lg,
        opacity: 0.3,
    },

    // Modern Card
    modernCard: {
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        padding: Spacing.lg,
        overflow: 'hidden',
        ...Shadows.sm,
    },

    // Stat Card
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        ...Shadows.sm,
    },
    statIconBg: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: Typography.sizes.xs,
        fontWeight: '500',
    },

    // Action Card
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        ...Shadows.sm,
    },
    actionIconBg: {
        width: 52,
        height: 52,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    actionContent: {
        flex: 1,
    },
    actionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    actionTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: '600',
    },
    actionBadge: {
        backgroundColor: '#10B981',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: BorderRadius.full,
    },
    actionBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: 'white',
    },
    actionSubtitle: {
        fontSize: Typography.sizes.sm,
        marginTop: 2,
    },
    actionArrow: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Section Header
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    sectionHeaderLeft: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: Typography.sizes.xl,
        fontWeight: '700',
    },
    sectionSubtitle: {
        fontSize: Typography.sizes.sm,
        marginTop: 2,
    },
    sectionAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    sectionActionText: {
        fontSize: Typography.sizes.sm,
        fontWeight: '600',
    },

    // Feature Item
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        marginBottom: Spacing.md,
        ...Shadows.sm,
    },
    featureIcon: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: Typography.sizes.base,
        fontWeight: '600',
        marginBottom: 2,
    },
    featureDesc: {
        fontSize: Typography.sizes.sm,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        padding: Spacing['2xl'],
    },
    emptyIconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    emptyTitle: {
        fontSize: Typography.sizes.xl,
        fontWeight: '700',
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    emptyMessage: {
        fontSize: Typography.sizes.base,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.xl,
    },
    emptyAction: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.full,
    },
    emptyActionText: {
        fontSize: Typography.sizes.base,
        fontWeight: '600',
        color: 'white',
    },
});
