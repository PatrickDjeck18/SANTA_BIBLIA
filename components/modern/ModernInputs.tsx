// Modern Input Components
// Styled text inputs and form elements

import React, { useState, useRef } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    ViewStyle,
    TextInputProps,
} from 'react-native';
import { useModernTheme } from '@/hooks/useModernTheme';
import { Spacing, BorderRadius, Typography } from '@/constants/DesignTokens';
import { Eye, EyeOff, X, Search } from 'lucide-react-native';

interface ModernInputProps extends TextInputProps {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    showClearButton?: boolean;
    containerStyle?: ViewStyle;
}

export const ModernInput: React.FC<ModernInputProps> = ({
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    showClearButton = false,
    containerStyle,
    value,
    onChangeText,
    secureTextEntry,
    ...props
}) => {
    const theme = useModernTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const focusAnim = useRef(new Animated.Value(0)).current;

    const handleFocus = () => {
        setIsFocused(true);
        Animated.timing(focusAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
        }).start();
        props.onFocus && props.onFocus({} as any);
    };

    const handleBlur = () => {
        setIsFocused(false);
        Animated.timing(focusAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
        props.onBlur && props.onBlur({} as any);
    };

    const borderColor = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.colors.border, theme.colors.accent],
    });

    const showPassword = secureTextEntry && !isPasswordVisible;

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
            )}

            <Animated.View style={[
                styles.inputContainer,
                {
                    backgroundColor: theme.colors.surface,
                    borderColor: error ? theme.colors.error : borderColor,
                },
                isFocused && styles.inputFocused,
            ]}>
                {leftIcon && (
                    <View style={styles.leftIcon}>{leftIcon}</View>
                )}

                <TextInput
                    {...props}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    secureTextEntry={showPassword}
                    style={[
                        styles.input,
                        { color: theme.colors.text },
                        leftIcon && { paddingLeft: 0 },
                        (rightIcon || showClearButton || secureTextEntry) && { paddingRight: 0 },
                    ]}
                    placeholderTextColor={theme.colors.textMuted}
                />

                {showClearButton && value && value.length > 0 && (
                    <TouchableOpacity
                        onPress={() => onChangeText && onChangeText('')}
                        style={styles.clearButton}
                    >
                        <X size={18} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                )}

                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        style={styles.eyeButton}
                    >
                        {isPasswordVisible ? (
                            <EyeOff size={20} color={theme.colors.textMuted} />
                        ) : (
                            <Eye size={20} color={theme.colors.textMuted} />
                        )}
                    </TouchableOpacity>
                )}

                {rightIcon && !secureTextEntry && !showClearButton && (
                    <View style={styles.rightIcon}>{rightIcon}</View>
                )}
            </Animated.View>

            {(error || hint) && (
                <Text style={[
                    styles.helperText,
                    { color: error ? theme.colors.error : theme.colors.textMuted }
                ]}>
                    {error || hint}
                </Text>
            )}
        </View>
    );
};

// Search Input with specialized styling
interface SearchInputProps extends Omit<ModernInputProps, 'leftIcon'> {
    onSearch?: (query: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
    onSearch,
    onChangeText,
    value,
    ...props
}) => {
    const theme = useModernTheme();

    const handleChangeText = (text: string) => {
        onChangeText && onChangeText(text);
        onSearch && onSearch(text);
    };

    return (
        <ModernInput
            {...props}
            value={value}
            onChangeText={handleChangeText}
            leftIcon={<Search size={20} color={theme.colors.textMuted} />}
            showClearButton
            placeholder={props.placeholder || 'Search...'}
            returnKeyType="search"
        />
    );
};

// Text Area for multi-line input
interface TextAreaProps extends ModernInputProps {
    minHeight?: number;
    maxHeight?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({
    minHeight = 100,
    maxHeight = 200,
    ...props
}) => {
    const theme = useModernTheme();
    const [height, setHeight] = useState(minHeight);

    return (
        <ModernInput
            {...props}
            multiline
            textAlignVertical="top"
            style={[
                { minHeight, maxHeight: maxHeight, height: Math.min(Math.max(height, minHeight), maxHeight) },
                props.style,
            ]}
            onContentSizeChange={(e) => {
                setHeight(e.nativeEvent.contentSize.height);
            }}
        />
    );
};

// Chip/Tag Input
interface ChipProps {
    label: string;
    selected?: boolean;
    onPress?: () => void;
    onRemove?: () => void;
    color?: string;
    style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
    label,
    selected = false,
    onPress,
    onRemove,
    color,
    style,
}) => {
    const theme = useModernTheme();
    const chipColor = color || theme.colors.accent;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={[
                styles.chip,
                {
                    backgroundColor: selected ? chipColor : theme.colors.surface,
                    borderColor: selected ? chipColor : theme.colors.border,
                },
                style,
            ]}
        >
            <Text style={[
                styles.chipText,
                { color: selected ? '#FFFFFF' : theme.colors.text }
            ]}>
                {label}
            </Text>
            {onRemove && (
                <TouchableOpacity onPress={onRemove} style={styles.chipRemove}>
                    <X size={14} color={selected ? '#FFFFFF' : theme.colors.textMuted} />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
};

// Chip Group
interface ChipGroupProps {
    options: { value: string; label: string }[];
    selected: string | string[];
    onSelect: (value: string) => void;
    multiple?: boolean;
    color?: string;
    style?: ViewStyle;
}

export const ChipGroup: React.FC<ChipGroupProps> = ({
    options,
    selected,
    onSelect,
    multiple = false,
    color,
    style,
}) => {
    const isSelected = (value: string) => {
        if (Array.isArray(selected)) {
            return selected.includes(value);
        }
        return selected === value;
    };

    return (
        <View style={[styles.chipGroup, style]}>
            {options.map((option) => (
                <Chip
                    key={option.value}
                    label={option.label}
                    selected={isSelected(option.value)}
                    onPress={() => onSelect(option.value)}
                    color={color}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: Typography.sizes.sm,
        fontWeight: '600',
        marginBottom: Spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
    },
    inputFocused: {
        borderWidth: 2,
    },
    input: {
        flex: 1,
        fontSize: Typography.sizes.base,
        paddingVertical: Spacing.md,
    },
    leftIcon: {
        marginRight: Spacing.sm,
    },
    rightIcon: {
        marginLeft: Spacing.sm,
    },
    clearButton: {
        padding: Spacing.xs,
        marginLeft: Spacing.xs,
    },
    eyeButton: {
        padding: Spacing.xs,
        marginLeft: Spacing.xs,
    },
    helperText: {
        fontSize: Typography.sizes.sm,
        marginTop: Spacing.xs,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        marginRight: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    chipText: {
        fontSize: Typography.sizes.sm,
        fontWeight: '500',
    },
    chipRemove: {
        marginLeft: Spacing.xs,
    },
    chipGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
});
