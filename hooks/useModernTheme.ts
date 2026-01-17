// Modern Theme Hook
// Provides consistent theming for light and dark modes across the app

import { useColorScheme } from 'react-native';

export interface ThemeColors {
    // Base colors
    background: string;
    surface: string;
    card: string;
    cardGlass: string;

    // Text colors
    text: string;
    textSecondary: string;
    textMuted: string;

    // Border and dividers
    border: string;
    divider: string;

    // Accent colors
    accent: string;
    accentLight: string;
    accentDark: string;

    // Status colors
    success: string;
    successLight: string;
    warning: string;
    warningLight: string;
    error: string;
    errorLight: string;
    info: string;
    infoLight: string;

    // Feature colors
    primary: string;
    primaryLight: string;
    secondary: string;
    secondaryLight: string;

    // Special
    overlay: string;
    shadow: string;

    // Mode
    isDark: boolean;
}

export interface ThemeGradients {
    primary: readonly [string, string, string];
    secondary: readonly [string, string, string];
    accent: readonly [string, string, string];
    success: readonly [string, string, string];
    warning: readonly [string, string, string];
    error: readonly [string, string, string];
    info: readonly [string, string, string];
    hero: readonly [string, string, string];
    card: readonly [string, string];
    glass: readonly [string, string];
}

export interface Theme {
    colors: ThemeColors;
    gradients: ThemeGradients;
}

const lightTheme: Theme = {
    colors: {
        // Base
        background: '#F8FAFC',
        surface: '#FFFFFF',
        card: '#FFFFFF',
        cardGlass: 'rgba(255, 255, 255, 0.9)',

        // Text
        text: '#1E293B',
        textSecondary: '#475569',
        textMuted: '#94A3B8',

        // Borders
        border: 'rgba(0, 0, 0, 0.08)',
        divider: 'rgba(0, 0, 0, 0.06)',

        // Accent
        accent: '#8B5CF6',
        accentLight: '#A78BFA',
        accentDark: '#7C3AED',

        // Status
        success: '#10B981',
        successLight: '#D1FAE5',
        warning: '#F59E0B',
        warningLight: '#FEF3C7',
        error: '#EF4444',
        errorLight: '#FEE2E2',
        info: '#3B82F6',
        infoLight: '#DBEAFE',

        // Feature
        primary: '#EC4899',
        primaryLight: '#FCE7F3',
        secondary: '#8B5CF6',
        secondaryLight: '#EDE9FE',

        // Special
        overlay: 'rgba(0, 0, 0, 0.5)',
        shadow: 'rgba(0, 0, 0, 0.1)',

        isDark: false,
    },
    gradients: {
        primary: ['#EC4899', '#DB2777', '#BE185D'],
        secondary: ['#8B5CF6', '#7C3AED', '#6D28D9'],
        accent: ['#A78BFA', '#8B5CF6', '#7C3AED'],
        success: ['#10B981', '#059669', '#047857'],
        warning: ['#F59E0B', '#D97706', '#B45309'],
        error: ['#EF4444', '#DC2626', '#B91C1C'],
        info: ['#3B82F6', '#2563EB', '#1D4ED8'],
        hero: ['#8B5CF6', '#7C3AED', '#6D28D9'],
        card: ['#FFFFFF', '#F8FAFC'],
        glass: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)'],
    },
};

const darkTheme: Theme = {
    colors: {
        // Base
        background: '#0F0F1A',
        surface: '#1A1A2E',
        card: '#1E1E2E',
        cardGlass: 'rgba(30, 30, 46, 0.9)',

        // Text
        text: '#F1F5F9',
        textSecondary: '#CBD5E1',
        textMuted: '#64748B',

        // Borders
        border: 'rgba(255, 255, 255, 0.1)',
        divider: 'rgba(255, 255, 255, 0.06)',

        // Accent
        accent: '#A78BFA',
        accentLight: '#C4B5FD',
        accentDark: '#8B5CF6',

        // Status
        success: '#34D399',
        successLight: 'rgba(52, 211, 153, 0.2)',
        warning: '#FBBF24',
        warningLight: 'rgba(251, 191, 36, 0.2)',
        error: '#F87171',
        errorLight: 'rgba(248, 113, 113, 0.2)',
        info: '#60A5FA',
        infoLight: 'rgba(96, 165, 250, 0.2)',

        // Feature
        primary: '#F472B6',
        primaryLight: 'rgba(244, 114, 182, 0.2)',
        secondary: '#A78BFA',
        secondaryLight: 'rgba(167, 139, 250, 0.2)',

        // Special
        overlay: 'rgba(0, 0, 0, 0.7)',
        shadow: 'rgba(0, 0, 0, 0.3)',

        isDark: true,
    },
    gradients: {
        primary: ['#F472B6', '#EC4899', '#DB2777'],
        secondary: ['#A78BFA', '#8B5CF6', '#7C3AED'],
        accent: ['#C4B5FD', '#A78BFA', '#8B5CF6'],
        success: ['#34D399', '#10B981', '#059669'],
        warning: ['#FBBF24', '#F59E0B', '#D97706'],
        error: ['#F87171', '#EF4444', '#DC2626'],
        info: ['#60A5FA', '#3B82F6', '#2563EB'],
        hero: ['#312E81', '#1E1B4B', '#0F0F1A'],
        card: ['#1E1E2E', '#1A1A2E'],
        glass: ['rgba(30,30,46,0.9)', 'rgba(26,26,46,0.7)'],
    },
};

/**
 * Hook to get the current theme based on system color scheme
 */
export function useModernTheme(): Theme {
    const colorScheme = useColorScheme();
    return colorScheme === 'dark' ? darkTheme : lightTheme;
}

/**
 * Get theme colors directly (for non-hook contexts)
 */
export function getTheme(isDark: boolean): Theme {
    return isDark ? darkTheme : lightTheme;
}

/**
 * Pre-defined gradient presets for common UI elements
 */
export const GradientPresets = {
    // Mood colors
    mood: {
        happy: ['#FCD34D', '#F59E0B', '#D97706'] as const,
        calm: ['#8B5CF6', '#7C3AED', '#6D28D9'] as const,
        sad: ['#60A5FA', '#3B82F6', '#2563EB'] as const,
        anxious: ['#F472B6', '#EC4899', '#DB2777'] as const,
        grateful: ['#34D399', '#10B981', '#059669'] as const,
        energetic: ['#FB923C', '#F97316', '#EA580C'] as const,
    },

    // Feature colors
    features: {
        bible: ['#8B5CF6', '#7C3AED', '#6D28D9'] as const,
        prayer: ['#EC4899', '#DB2777', '#BE185D'] as const,
        mood: ['#F97316', '#EA580C', '#C2410C'] as const,
        gratitude: ['#F59E0B', '#D97706', '#B45309'] as const,
        quiz: ['#8B5CF6', '#7C3AED', '#6D28D9'] as const,
    },

    // Time-based hero gradients
    timeOfDay: {
        morning: ['#FEF3C7', '#FDE68A', '#FCD34D'] as const,
        afternoon: ['#DBEAFE', '#BFDBFE', '#93C5FD'] as const,
        evening: ['#E0E7FF', '#C7D2FE', '#A5B4FC'] as const,
        night: ['#1E1B4B', '#312E81', '#4338CA'] as const,
    },
};

export { lightTheme, darkTheme };
