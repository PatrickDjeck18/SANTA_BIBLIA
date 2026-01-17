/**
 * Unified App Theme - "Daily Bread" Warm Design System
 * A warm, cream/beige paper-like theme with orange accents
 * This theme provides consistent styling across all screens
 */

export const AppTheme = {
    // Core Background Colors (Warm Cream/Beige)
    background: {
        primary: '#FDF8F3',     // Main cream background
        secondary: '#FAF5EF',   // Slightly warmer cream
        tertiary: '#F5EFE6',    // Paper-like beige
        card: '#FFFFFF',        // White cards
        cardGlass: 'rgba(255, 255, 255, 0.85)',
        overlay: 'rgba(253, 248, 243, 0.95)',
    },

    // Accent Colors (Orange Focus)
    accent: {
        primary: '#F97316',     // Bright Orange (main accent)
        secondary: '#EA580C',   // Darker Orange
        tertiary: '#C2410C',    // Deep Orange
        light: '#FED7AA',       // Light Orange tint
        ultraLight: '#FFF7ED',  // Very light orange tint
    },

    // Text Colors
    text: {
        primary: '#1E293B',     // Dark slate for main text
        secondary: '#64748B',   // Muted gray for secondary text
        tertiary: '#94A3B8',    // Light gray for hints
        inverse: '#FFFFFF',     // White text on dark backgrounds
        accent: '#EA580C',      // Orange accent text
    },

    // Border Colors
    border: {
        light: 'rgba(0, 0, 0, 0.06)',
        medium: 'rgba(0, 0, 0, 0.1)',
        accent: '#F97316',
    },

    // Button Colors
    button: {
        primary: {
            background: '#1C1917',  // Dark charcoal
            text: '#FFFFFF',
        },
        secondary: {
            background: '#FFF7ED',
            text: '#EA580C',
        },
        accent: {
            gradient: ['#F97316', '#EA580C'] as readonly [string, string],
            text: '#FFFFFF',
        },
        success: {
            background: '#10B981',
            text: '#FFFFFF',
        },
        danger: {
            background: '#EF4444',
            text: '#FFFFFF',
        },
    },

    // Card Styles
    card: {
        background: '#FFFFFF',
        borderRadius: 20,
        shadow: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 6,
        },
    },

    // Header Cards (Orange-tinted)
    headerCard: {
        background: '#FFF7ED',
        titleColor: '#1E293B',
        subtitleColor: '#64748B',
    },

    // Gradient Colors
    gradients: {
        // Background gradients (warm cream)
        background: ['#FDF8F3', '#FAF5EF', '#F5EFE6'] as readonly [string, string, string],
        backgroundSoft: ['#FFFFFF', '#FDF8F3'] as readonly [string, string],

        // Card gradients
        card: ['#FFFFFF', '#FAFAFA'] as readonly [string, string],
        cardWarm: ['#FFFFFF', '#FFF7ED'] as readonly [string, string],

        // Accent gradients (Orange)
        accent: ['#F97316', '#EA580C'] as readonly [string, string],
        accentLight: ['#FED7AA', '#FDBA74'] as readonly [string, string],

        // Success/Action gradients
        success: ['#10B981', '#059669'] as readonly [string, string],
        warning: ['#F59E0B', '#D97706'] as readonly [string, string],
        danger: ['#EF4444', '#DC2626'] as readonly [string, string],
        info: ['#3B82F6', '#2563EB'] as readonly [string, string],
        purple: ['#8B5CF6', '#7C3AED'] as readonly [string, string],

        // Hero section gradients
        hero: ['#F97316', '#EA580C', '#C2410C'] as readonly [string, string, string],
        heroSoft: ['#FED7AA', '#FDBA74', '#FB923C'] as readonly [string, string, string],
    },

    // Status Colors
    status: {
        active: {
            background: '#DBEAFE',
            text: '#1D4ED8',
            icon: '#3B82F6',
        },
        answered: {
            background: '#D1FAE5',
            text: '#047857',
            icon: '#10B981',
        },
        pending: {
            background: '#FEF3C7',
            text: '#B45309',
            icon: '#F59E0B',
        },
    },

    // Icon Colors
    icon: {
        primary: '#F97316',     // Orange for primary icons
        secondary: '#64748B',   // Gray for secondary icons
        active: '#10B981',      // Green for active/success
        inactive: '#CBD5E1',    // Light gray for inactive
    },

    // Tab Bar
    tabBar: {
        background: '#FFFFFF',
        activeIcon: '#F97316',
        inactiveIcon: '#94A3B8',
        activeText: '#F97316',
        inactiveText: '#94A3B8',
        border: 'rgba(0, 0, 0, 0.05)',
    },

    // Calendar/Day Selector
    calendar: {
        selectedDay: {
            background: '#F97316',
            text: '#FFFFFF',
        },
        today: {
            background: '#FFF7ED',
            text: '#EA580C',
        },
        default: {
            background: 'transparent',
            text: '#64748B',
        },
    },

    // Stats Cards
    stats: {
        cardBackground: '#FFFFFF',
        iconBackground: {
            primary: ['#F97316', '#EA580C'] as readonly [string, string],
            secondary: ['#8B5CF6', '#7C3AED'] as readonly [string, string],
            success: ['#10B981', '#059669'] as readonly [string, string],
            warning: ['#F59E0B', '#D97706'] as readonly [string, string],
        },
    },

    // Input Fields
    input: {
        background: '#FFFFFF',
        border: '#E5E7EB',
        borderFocus: '#F97316',
        placeholder: '#9CA3AF',
        text: '#1E293B',
    },

    // Special Elements
    special: {
        quoteCard: {
            background: '#FFF7ED',
            border: '#FED7AA',
            text: '#92400E',
        },
        verseCard: {
            background: '#FFFBEB',
            border: '#FDE68A',
            text: '#B45309',
        },
    },
};

// Helper to get theme shadow
export const getThemeShadow = (size: 'sm' | 'md' | 'lg' = 'md') => {
    const shadows = {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 6,
        },
        lg: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 20,
            elevation: 10,
        },
    };
    return shadows[size];
};

// Common text styles
export const ThemeText = {
    heading1: {
        fontSize: 28,
        fontWeight: '800' as const,
        color: AppTheme.text.primary,
        letterSpacing: -0.5,
    },
    heading2: {
        fontSize: 24,
        fontWeight: '700' as const,
        color: AppTheme.text.primary,
        letterSpacing: -0.3,
    },
    heading3: {
        fontSize: 20,
        fontWeight: '600' as const,
        color: AppTheme.text.primary,
    },
    body: {
        fontSize: 16,
        fontWeight: '400' as const,
        color: AppTheme.text.primary,
        lineHeight: 24,
    },
    bodyMuted: {
        fontSize: 16,
        fontWeight: '400' as const,
        color: AppTheme.text.secondary,
        lineHeight: 24,
    },
    caption: {
        fontSize: 14,
        fontWeight: '500' as const,
        color: AppTheme.text.tertiary,
    },
    label: {
        fontSize: 12,
        fontWeight: '600' as const,
        color: AppTheme.text.secondary,
        textTransform: 'uppercase' as const,
        letterSpacing: 0.5,
    },
};

export default AppTheme;
