// MoodOrb Component
// Animated mood indicator with gradient orb and pulse effects

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

// Mood type definition
export type MoodType =
    | 'happy'
    | 'calm'
    | 'sad'
    | 'anxious'
    | 'grateful'
    | 'energetic'
    | 'peaceful'
    | 'hopeful'
    | 'loved'
    | 'tired';

interface MoodConfig {
    emoji: string;
    label: string;
    gradient: readonly [string, string, ...string[]];
    description: string;
}

export const MoodConfigs: Record<MoodType, MoodConfig> = {
    happy: {
        emoji: '😊',
        label: 'Happy',
        gradient: ['#FCD34D', '#F59E0B', '#D97706'],
        description: 'Feeling joyful and content',
    },
    calm: {
        emoji: '😌',
        label: 'Calm',
        gradient: ['#8B5CF6', '#7C3AED', '#6D28D9'],
        description: 'Peaceful and relaxed',
    },
    sad: {
        emoji: '😢',
        label: 'Sad',
        gradient: ['#60A5FA', '#3B82F6', '#2563EB'],
        description: 'Feeling down or blue',
    },
    anxious: {
        emoji: '😰',
        label: 'Anxious',
        gradient: ['#F472B6', '#EC4899', '#DB2777'],
        description: 'Worried or stressed',
    },
    grateful: {
        emoji: '🙏',
        label: 'Grateful',
        gradient: ['#34D399', '#10B981', '#059669'],
        description: 'Thankful and blessed',
    },
    energetic: {
        emoji: '⚡',
        label: 'Energetic',
        gradient: ['#FB923C', '#F97316', '#EA580C'],
        description: 'Full of energy and drive',
    },
    peaceful: {
        emoji: '🕊️',
        label: 'Peaceful',
        gradient: ['#93C5FD', '#60A5FA', '#3B82F6'],
        description: 'Serene and tranquil',
    },
    hopeful: {
        emoji: '🌅',
        label: 'Hopeful',
        gradient: ['#FBBF24', '#F59E0B', '#D97706'],
        description: 'Optimistic about the future',
    },
    loved: {
        emoji: '❤️',
        label: 'Loved',
        gradient: ['#F472B6', '#EC4899', '#DB2777'],
        description: 'Feeling cherished',
    },
    tired: {
        emoji: '😴',
        label: 'Tired',
        gradient: ['#A78BFA', '#8B5CF6', '#7C3AED'],
        description: 'Needing rest and renewal',
    },
};

// =============================================================================
// MOOD ORB - Animated gradient orb for mood selection
// =============================================================================

interface MoodOrbProps {
    mood: MoodType;
    size?: 'small' | 'medium' | 'large' | 'xlarge';
    animated?: boolean;
    pulse?: boolean;
    selected?: boolean;
    onPress?: () => void;
    showLabel?: boolean;
    style?: ViewStyle;
}

export const MoodOrb: React.FC<MoodOrbProps> = ({
    mood,
    size = 'medium',
    animated = true,
    pulse = false,
    selected = false,
    onPress,
    showLabel = false,
    style,
}) => {
    const theme = useModernTheme();
    const config = MoodConfigs[mood];
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;

    const sizeMap = {
        small: { orb: 48, emoji: 24, label: Typography.sizes.xs },
        medium: { orb: 72, emoji: 36, label: Typography.sizes.sm },
        large: { orb: 96, emoji: 48, label: Typography.sizes.base },
        xlarge: { orb: 120, emoji: 64, label: Typography.sizes.lg },
    };

    const currentSize = sizeMap[size];

    useEffect(() => {
        if (animated) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();
        }
    }, [animated]);

    useEffect(() => {
        if (pulse) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.15,
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
        }
    }, [pulse]);

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

    const orbContent = (
        <Animated.View
            style={[
                styles.orbContainer,
                {
                    opacity: fadeAnim,
                    transform: [
                        { scale: Animated.multiply(scaleAnim, pulse ? pulseAnim : 1) },
                    ],
                },
                style,
            ]}
        >
            {/* Outer glow for selected state */}
            {selected && (
                <View
                    style={[
                        styles.orbGlow,
                        {
                            width: currentSize.orb + 16,
                            height: currentSize.orb + 16,
                            backgroundColor: `${config.gradient[0]}40`,
                        },
                    ]}
                />
            )}

            {/* Main orb gradient */}
            <LinearGradient
                colors={config.gradient}
                style={[
                    styles.orb,
                    {
                        width: currentSize.orb,
                        height: currentSize.orb,
                        borderRadius: currentSize.orb / 2,
                    },
                    selected && styles.orbSelected,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Text style={[styles.emoji, { fontSize: currentSize.emoji }]}>
                    {config.emoji}
                </Text>
            </LinearGradient>

            {/* Label */}
            {showLabel && (
                <Text
                    style={[
                        styles.orbLabel,
                        {
                            fontSize: currentSize.label,
                            color: selected ? config.gradient[1] : theme.colors.text,
                            fontWeight: selected ? '700' : '500',
                        },
                    ]}
                >
                    {config.label}
                </Text>
            )}
        </Animated.View>
    );

    if (onPress) {
        return (
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.8}
                style={styles.touchable}
            >
                {orbContent}
            </TouchableOpacity>
        );
    }

    return orbContent;
};

// =============================================================================
// MOOD GRID - Grid of mood orbs for selection
// =============================================================================

interface MoodGridProps {
    selectedMood?: MoodType;
    onSelect: (mood: MoodType) => void;
    columns?: number;
    size?: 'small' | 'medium' | 'large';
    animated?: boolean;
    style?: ViewStyle;
}

export const MoodGrid: React.FC<MoodGridProps> = ({
    selectedMood,
    onSelect,
    columns = 5,
    size = 'medium',
    animated = true,
    style,
}) => {
    const theme = useModernTheme();
    const moods = Object.keys(MoodConfigs) as MoodType[];

    return (
        <View style={[styles.gridContainer, style]}>
            <View style={[styles.grid, { gap: Spacing.md }]}>
                {moods.map((mood, index) => (
                    <MoodOrb
                        key={mood}
                        mood={mood}
                        size={size}
                        animated={animated}
                        selected={selectedMood === mood}
                        onPress={() => onSelect(mood)}
                        showLabel
                        style={{
                            opacity: animated ? 0 : 1,
                            transform: [{ translateY: animated ? 20 : 0 }],
                        }}
                    />
                ))}
            </View>
        </View>
    );
};

// =============================================================================
// MOOD SLIDER - Horizontal scrollable mood selector
// =============================================================================

interface MoodSliderProps {
    selectedMood?: MoodType;
    onSelect: (mood: MoodType) => void;
    size?: 'small' | 'medium' | 'large';
    showAll?: boolean;
}

export const MoodSlider: React.FC<MoodSliderProps> = ({
    selectedMood,
    onSelect,
    size = 'medium',
    showAll = false,
}) => {
    const moods = Object.keys(MoodConfigs) as MoodType[];
    const displayMoods = showAll ? moods : moods.slice(0, 6);

    return (
        <View style={styles.sliderContainer}>
            {displayMoods.map((mood) => (
                <MoodOrb
                    key={mood}
                    mood={mood}
                    size={size}
                    selected={selectedMood === mood}
                    onPress={() => onSelect(mood)}
                    showLabel
                    style={styles.sliderItem}
                />
            ))}
        </View>
    );
};

// =============================================================================
// MOOD CARD - Card displaying mood with details
// =============================================================================

interface MoodCardProps {
    mood: MoodType;
    timestamp?: Date;
    note?: string;
    onPress?: () => void;
    style?: ViewStyle;
}

export const MoodCard: React.FC<MoodCardProps> = ({
    mood,
    timestamp,
    note,
    onPress,
    style,
}) => {
    const theme = useModernTheme();
    const config = MoodConfigs[mood];

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            style={[
                styles.moodCard,
                {
                    backgroundColor: theme.colors.cardGlass,
                    borderColor: `${config.gradient[0]}30`,
                },
                style,
            ]}
        >
            {/* Mood gradient header */}
            <LinearGradient
                colors={config.gradient}
                style={styles.moodCardHeader}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Text style={styles.moodCardEmoji}>{config.emoji}</Text>
                <Text style={styles.moodCardLabel}>{config.label}</Text>
            </LinearGradient>

            {/* Content */}
            <View style={styles.moodCardContent}>
                <Text style={[styles.moodDescription, { color: theme.colors.textMuted }]}>
                    {config.description}
                </Text>

                {timestamp && (
                    <Text style={[styles.moodTime, { color: theme.colors.textMuted }]}>
                        {formatTime(timestamp)}
                    </Text>
                )}

                {note && (
                    <Text
                        style={[styles.moodNote, { color: theme.colors.text }]}
                        numberOfLines={2}
                    >
                        "{note}"
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

// =============================================================================
// MOOD SUMMARY - Compact summary of mood streak/insights
// =============================================================================

interface MoodSummaryProps {
    currentStreak: number;
    topMoods: { mood: MoodType; count: number }[];
    totalEntries: number;
    style?: ViewStyle;
}

export const MoodSummary: React.FC<MoodSummaryProps> = ({
    currentStreak,
    topMoods,
    totalEntries,
    style,
}) => {
    const theme = useModernTheme();

    return (
        <View
            style={[
                styles.moodSummary,
                {
                    backgroundColor: theme.colors.cardGlass,
                    borderColor: theme.colors.border,
                },
                style,
            ]}
        >
            {/* Streak */}
            <View style={styles.summarySection}>
                <Text style={[styles.summaryNumber, { color: theme.colors.accent }]}>
                    {currentStreak}
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>
                    Day Streak
                </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

            {/* Top Mood */}
            <View style={styles.summarySection}>
                {topMoods.length > 0 && topMoods[0].mood in MoodConfigs && (
                    <>
                        <Text style={styles.summaryEmoji}>
                            {MoodConfigs[topMoods[0].mood]?.emoji || '😊'}
                        </Text>
                        <Text
                            style={[styles.summaryLabel, { color: theme.colors.textMuted }]}
                        >
                            Top Mood
                        </Text>
                    </>
                )}
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

            {/* Total Entries */}
            <View style={styles.summarySection}>
                <Text style={[styles.summaryNumber, { color: theme.colors.success }]}>
                    {totalEntries}
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>
                    Entries
                </Text>
            </View>
        </View>
    );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
    // Mood Orb
    touchable: {
        alignItems: 'center',
    },
    orbContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    orb: {
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.md,
    },
    orbGlow: {
        position: 'absolute',
        borderRadius: 999,
    },
    orbSelected: {
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    emoji: {
        textAlign: 'center',
    },
    orbLabel: {
        marginTop: Spacing.xs,
        fontWeight: '500',
    },

    // Mood Grid
    gridContainer: {
        width: '100%',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },

    // Mood Slider
    sliderContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        gap: Spacing.lg,
    },
    sliderItem: {
        marginRight: Spacing.sm,
    },

    // Mood Card
    moodCard: {
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        overflow: 'hidden',
        ...Shadows.sm,
    },
    moodCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    moodCardEmoji: {
        fontSize: 24,
    },
    moodCardLabel: {
        fontSize: Typography.sizes.lg,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    moodCardContent: {
        padding: Spacing.md,
    },
    moodDescription: {
        fontSize: Typography.sizes.sm,
        marginBottom: Spacing.xs,
    },
    moodTime: {
        fontSize: Typography.sizes.xs,
        marginBottom: Spacing.sm,
    },
    moodNote: {
        fontSize: Typography.sizes.base,
        fontStyle: 'italic',
        lineHeight: 20,
    },

    // Mood Summary
    moodSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        ...Shadows.sm,
    },
    summarySection: {
        alignItems: 'center',
        flex: 1,
    },
    summaryNumber: {
        fontSize: Typography.sizes['2xl'],
        fontWeight: '700',
    },
    summaryEmoji: {
        fontSize: 28,
    },
    summaryLabel: {
        fontSize: Typography.sizes.xs,
        fontWeight: '500',
        marginTop: Spacing.xs,
    },
    divider: {
        width: 1,
        height: 40,
    },
});

// Import Shadows from DesignTokens
import { Shadows } from '@/constants/DesignTokens';
