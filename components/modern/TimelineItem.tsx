// TimelineItem Component
// Connected timeline items for prayer and mood history

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
import { useModernTheme } from '@/hooks/useModernTheme';
import { Spacing, BorderRadius, Typography } from '@/constants/DesignTokens';
import { ChevronRight } from 'lucide-react-native';

// =============================================================================
// TIMELINE ITEM - Connected list item with timeline dots
// =============================================================================

interface TimelineItemProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    timestamp?: Date;
    duration?: string;
    gradient?: readonly [string, string, ...string[]];
    color?: string;
    isFirst?: boolean;
    isLast?: boolean;
    showConnector?: boolean;
    onPress?: () => void;
    onLongPress?: () => void;
    animated?: boolean;
    delay?: number;
    badge?: string;
    status?: 'completed' | 'in-progress' | 'pending' | 'cancelled';
    style?: ViewStyle;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
    icon,
    title,
    subtitle,
    timestamp,
    duration,
    gradient,
    color,
    isFirst = false,
    isLast = false,
    showConnector = true,
    onPress,
    onLongPress,
    animated = true,
    delay = 0,
    badge,
    status = 'completed',
    style,
}) => {
    const theme = useModernTheme();
    const fadeAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
    const slideAnim = useRef(new Animated.Value(animated ? 20 : 0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const itemColor = color || theme.colors.accent;
    const itemGradient = gradient || [itemColor, itemColor];

    useEffect(() => {
        if (animated) {
            const timer = setTimeout(() => {
                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.spring(slideAnim, {
                        toValue: 0,
                        tension: 80,
                        friction: 12,
                        useNativeDriver: true,
                    }),
                ]).start();
            }, delay);
            return () => clearTimeout(timer);
        }
    }, [delay, animated]);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.98,
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

    const formatTimestamp = (date: Date) => {
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const minutes = Math.floor(diffInHours * 60);
            return `${minutes}m ago`;
        } else if (diffInHours < 24) {
            const hours = Math.floor(diffInHours);
            return `${hours}h ago`;
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            });
        }
    };

    const statusColors = {
        completed: theme.colors.success,
        'in-progress': theme.colors.warning,
        pending: theme.colors.textMuted,
        cancelled: theme.colors.error,
    };

    const content = (
        <Animated.View
            style={[
                styles.timelineContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                },
                style,
            ]}
        >
            {/* Timeline Connector */}
            {showConnector && (
                <View style={styles.connectorContainer}>
                    {!isFirst && (
                        <View
                            style={[
                                styles.connectorTop,
                                { backgroundColor: theme.colors.divider },
                            ]}
                        />
                    )}
                    <View
                        style={[
                            styles.timelineDot,
                            {
                                backgroundColor: statusColors[status],
                                borderColor: theme.colors.background,
                            },
                        ]}
                    >
                        {status === 'in-progress' && (
                            <View style={styles.pulseDot} />
                        )}
                    </View>
                    {!isLast && (
                        <View
                            style={[
                                styles.connectorBottom,
                                { backgroundColor: theme.colors.divider },
                            ]}
                        />
                    )}
                </View>
            )}

            {/* Content Card */}
            <View
                style={[
                    styles.contentCard,
                    {
                        backgroundColor: theme.colors.cardGlass,
                        borderColor: theme.colors.border,
                    },
                ]}
            >
                {/* Icon Container */}
                {gradient ? (
                    <LinearGradient
                        colors={itemGradient}
                        style={styles.iconContainer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {icon}
                    </LinearGradient>
                ) : (
                    <View
                        style={[
                            styles.iconContainer,
                            { backgroundColor: `${itemColor}20` },
                        ]}
                    >
                        {icon}
                    </View>
                )}

                {/* Text Content */}
                <View style={styles.textContent}>
                    <View style={styles.titleRow}>
                        <Text
                            style={[styles.title, { color: theme.colors.text }]}
                            numberOfLines={1}
                        >
                            {title}
                        </Text>
                        {badge && (
                            <View
                                style={[
                                    styles.badge,
                                    { backgroundColor: itemColor },
                                ]}
                            >
                                <Text style={styles.badgeText}>{badge}</Text>
                            </View>
                        )}
                    </View>

                    {subtitle && (
                        <Text
                            style={[
                                styles.subtitle,
                                { color: theme.colors.textMuted },
                            ]}
                            numberOfLines={1}
                        >
                            {subtitle}
                        </Text>
                    )}

                    {/* Metadata Row */}
                    <View style={styles.metadataRow}>
                        {timestamp && (
                            <Text
                                style={[
                                    styles.timestamp,
                                    { color: theme.colors.textMuted },
                                ]}
                            >
                                {formatTimestamp(timestamp)}
                            </Text>
                        )}
                        {duration && (
                            <>
                                <Text
                                    style={[
                                        styles.dot,
                                        { color: theme.colors.textMuted },
                                    ]}
                                >
                                    •
                                </Text>
                                <Text
                                    style={[
                                        styles.duration,
                                        { color: theme.colors.textMuted },
                                    ]}
                                >
                                    {duration}
                                </Text>
                            </>
                        )}
                    </View>
                </View>

                {/* Arrow Indicator */}
                {onPress && (
                    <View style={styles.arrowContainer}>
                        <ChevronRight
                            size={20}
                            color={theme.colors.textMuted}
                        />
                    </View>
                )}
            </View>
        </Animated.View>
    );

    if (onPress || onLongPress) {
        return (
            <TouchableOpacity
                onPress={onPress}
                onLongPress={onLongPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
                delayLongPress={500}
            >
                {content}
            </TouchableOpacity>
        );
    }

    return content;
};

// =============================================================================
// TIMELINE HEADER - Section header for timeline groups
// =============================================================================

interface TimelineHeaderProps {
    title?: string;
    count?: number;
    date?: Date;
    style?: ViewStyle;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({
    title,
    count,
    date,
    style,
}) => {
    const theme = useModernTheme();

    const formatDate = (date: Date) => {
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const isYesterday =
            new Date(now.setDate(now.getDate() - 1)).toDateString() ===
            date.toDateString();

        if (isToday) return 'Today';
        if (isYesterday) return 'Yesterday';

        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <View style={[styles.headerContainer, style]}>
            <View style={styles.headerLine} />
            <View
                style={[
                    styles.headerContent,
                    { backgroundColor: theme.colors.divider },
                ]}
            >
                <Text
                    style={[styles.headerTitle, { color: theme.colors.text }]}
                >
                    {date ? formatDate(date) : title}
                </Text>
                {count !== undefined && (
                    <View
                        style={[
                            styles.headerBadge,
                            { backgroundColor: theme.colors.accent },
                        ]}
                    >
                        <Text style={styles.headerBadgeText}>{count}</Text>
                    </View>
                )}
            </View>
            <View style={styles.headerLine} />
        </View>
    );
};

// =============================================================================
// TIMELINE EMPTY STATE - When no timeline items exist
// =============================================================================

interface TimelineEmptyProps {
    icon: React.ReactNode;
    title: string;
    message: string;
    action?: {
        label: string;
        onPress: () => void;
    };
    style?: ViewStyle;
}

export const TimelineEmpty: React.FC<TimelineEmptyProps> = ({
    icon,
    title,
    message,
    action,
    style,
}) => {
    const theme = useModernTheme();

    return (
        <View style={[styles.emptyContainer, style]}>
            <View
                style={[
                    styles.emptyIcon,
                    { backgroundColor: theme.colors.divider },
                ]}
            >
                {icon}
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                {title}
            </Text>
            <Text
                style={[
                    styles.emptyMessage,
                    { color: theme.colors.textMuted },
                ]}
            >
                {message}
            </Text>
            {action && (
                <TouchableOpacity
                    onPress={action.onPress}
                    style={[
                        styles.emptyAction,
                        { backgroundColor: theme.colors.accent },
                    ]}
                >
                    <Text style={styles.emptyActionText}>{action.label}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

// =============================================================================
// ACTIVITY TIMELINE - Complete timeline with grouped items
// =============================================================================

interface ActivityGroup {
    date: Date;
    items: Array<{
        id: string;
        icon: React.ReactNode;
        title: string;
        subtitle?: string;
        timestamp: Date;
        duration?: string;
        gradient?: readonly [string, string, ...string[]];
        color?: string;
        badge?: string;
        status?: 'completed' | 'in-progress' | 'pending' | 'cancelled';
    }>;
}

interface ActivityTimelineProps {
    groups: ActivityGroup[];
    onItemPress?: (id: string) => void;
    onItemLongPress?: (id: string) => void;
    emptyState?: {
        icon: React.ReactNode;
        title: string;
        message: string;
        action?: {
            label: string;
            onPress: () => void;
        };
    };
    style?: ViewStyle;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
    groups,
    onItemPress,
    onItemLongPress,
    emptyState,
    style,
}) => {
    if (groups.length === 0 && emptyState) {
        return <TimelineEmpty {...emptyState} style={style} />;
    }

    return (
        <View style={style}>
            {groups.map((group, groupIndex) => (
                <View key={group.date.toISOString()}>
                    <TimelineHeader
                        date={group.date}
                        count={group.items.length}
                    />
                    {group.items.map((item, itemIndex) => (
                        <TimelineItem
                            key={item.id}
                            icon={item.icon}
                            title={item.title}
                            subtitle={item.subtitle}
                            timestamp={item.timestamp}
                            duration={item.duration}
                            gradient={item.gradient}
                            color={item.color}
                            badge={item.badge}
                            status={item.status}
                            isFirst={itemIndex === 0}
                            isLast={itemIndex === group.items.length - 1}
                            onPress={() => onItemPress?.(item.id)}
                            onLongPress={() => onItemLongPress?.(item.id)}
                            delay={groupIndex * 100 + itemIndex * 50}
                        />
                    ))}
                </View>
            ))}
        </View>
    );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
    // Timeline Item
    timelineContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Spacing.md,
    },
    connectorContainer: {
        width: 32,
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    connectorTop: {
        width: 2,
        height: 20,
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pulseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FFFFFF',
    },
    connectorBottom: {
        width: 2,
        flex: 1,
        minHeight: 60,
    },
    contentCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        marginLeft: Spacing.sm,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    textContent: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    title: {
        fontSize: Typography.sizes.base,
        fontWeight: '600',
        flex: 1,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: BorderRadius.full,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: Typography.sizes.sm,
        marginTop: 2,
    },
    metadataRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.xs,
        gap: Spacing.xs,
    },
    timestamp: {
        fontSize: Typography.sizes.xs,
    },
    dot: {
        fontSize: Typography.sizes.xs,
    },
    duration: {
        fontSize: Typography.sizes.xs,
    },
    arrowContainer: {
        marginLeft: Spacing.sm,
    },

    // Timeline Header
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.lg,
        paddingHorizontal: Spacing.md,
    },
    headerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'transparent',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        gap: Spacing.xs,
    },
    headerTitle: {
        fontSize: Typography.sizes.sm,
        fontWeight: '600',
    },
    headerBadge: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    // Empty State
    emptyContainer: {
        alignItems: 'center',
        padding: Spacing['2xl'],
    },
    emptyIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    emptyTitle: {
        fontSize: Typography.sizes.xl,
        fontWeight: '700',
        marginBottom: Spacing.sm,
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
        color: '#FFFFFF',
    },
});
