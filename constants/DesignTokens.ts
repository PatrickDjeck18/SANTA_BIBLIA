/**
 * Modern Design System Tokens
 * Following iOS 18 and Material You design principles
 */

export const Colors = {
  // Primary Brand Colors - Vibrant Pink/Purple Theme
  primary: {
    50: '#FDF2F8',
    100: '#FCE7F3',
    200: '#FBCFE8',
    300: '#F9A8D4',
    400: '#F472B6',
    500: '#EC4899', // Primary - Vibrant Pink
    600: '#DB2777',
    700: '#BE185D',
    800: '#9D174D',
    900: '#831843',
    950: '#500724',
  },

  // Secondary Colors - Purple Accent
  secondary: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6', // Secondary - Purple
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
    950: '#2E1065',
  },

  // Neutral Colors - Warm Grays
  neutral: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
    950: '#0C0A09',
  },

  // Semantic Colors
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Basic colors
  white: '#FFFFFF',
  black: '#000000',

  // Colorful Card Colors - Matching screenshot vibrant design
  cardColors: {
    orange: '#FF9500',
    yellow: '#FFCC00',
    green: '#34C759',
    blue: '#007AFF',
    purple: '#AF52DE',
    pink: '#FF2D70',
    red: '#FF3B30',
    teal: '#5AC8FA',
  },

  // Modern Vibrant Gradients - Matching screenshot colorful design
  gradients: {
    primary: ['#EC4899', '#DB2777', '#BE185D'] as const,
    secondary: ['#8B5CF6', '#7C3AED', '#6D28D9'] as const,
    warm: ['#FF9500', '#FFCC00', '#FF3B30'] as const,
    sunset: ['#FF2D70', '#EC4899', '#FF9500'] as const,
    ocean: ['#007AFF', '#5AC8FA', '#34C759'] as const,
    purple: ['#8B5CF6', '#A78BFA', '#C4B5FD'] as const,
    spiritual: ['#EC4899', '#8B5CF6', '#FF9500'] as const,
    // New colorful gradients inspired by screenshot
    colorful: ['#FF6B6B', '#4ECDC4', '#45B7D1'] as const,
    vibrant: ['#FF9500', '#FF2D70', '#8B5CF6'] as const,
    nature: ['#34C759', '#5AC8FA', '#007AFF'] as const,
    fire: ['#FF3B30', '#FF9500', '#FFCC00'] as const,
    ice: ['#5AC8FA', '#007AFF', '#5856D6'] as const,
    dawn: ['#FFCC00', '#FF9500', '#FF3B30'] as const,
    forest: ['#34C759', '#30D158', '#32D74B'] as const,
    royal: ['#8B5CF6', '#7C3AED', '#6D28D9'] as const,
    success: ['#22C55E', '#16A34A', '#15803D'] as const,
    // Main background gradient matching screenshot
    main: ['#F8E1F4', '#E8D5F2', '#D8C9F0'] as const,
    softGlow: ['#F0D9FF', '#E8D5F2', '#D8C9F0'] as const,
    // Keep spiritualLight for backward compatibility
    spiritualLight: ['#F8E1F4', '#E8D5F2', '#D8C9F0'] as const,
    divineMorning: ['#F0F2F5', '#E0E5EA', '#D0D8E0'] as const,
    lightGrey: ['#F9FAFB', '#F7F8F9', '#F5F6F7'] as const,
    // Card gradients for different features
    card: {
      orange: ['#FF9500', '#FF8C00'] as const,
      green: ['#34C759', '#30D158'] as const,
      blue: ['#007AFF', '#005ADB'] as const,
      purple: ['#8B5CF6', '#7C3AED'] as const,
      pink: ['#FF2D70', '#FF1B5E'] as const,
    },
    
    // ACCENT GRADIENTS - For buttons and highlights
    accent: {
      primary: ['#667eea', '#764ba2'] as const,
      secondary: ['#f093fb', '#f5576c'] as const,
      success: ['#11998e', '#38ef7d'] as const,
      warning: ['#FFB75E', '#ED8F03'] as const,
      danger: ['#FF416C', '#FF4B2B'] as const,
      info: ['#667eea', '#764ba2'] as const,
    },
  },

  // COLORFUL GLASS & CARD EFFECTS - Matching screenshot vibrant design
  glass: {
    light: 'rgba(255, 255, 255, 0.15)',
    medium: 'rgba(255, 255, 255, 0.25)',
    heavy: 'rgba(255, 255, 255, 0.35)',
    dark: 'rgba(0, 0, 0, 0.1)',

    // Colorful frosted glass effects
    frost: 'rgba(255, 255, 255, 0.4)',
    crystal: 'rgba(255, 255, 255, 0.3)',

    // Enhanced colorful card backgrounds
    card: 'rgba(255, 255, 255, 0.9)',
    cardDark: 'rgba(255, 255, 255, 0.95)',
    cardSoft: 'rgba(255, 255, 255, 0.8)',

    // Colorful overlay effects
    overlay: 'rgba(0, 0, 0, 0.2)',
    overlayLight: 'rgba(0, 0, 0, 0.05)',

    // Colorful card variants
    orange: 'rgba(255, 149, 0, 0.9)',
    green: 'rgba(52, 199, 89, 0.9)',
    blue: 'rgba(0, 122, 255, 0.9)',
    purple: 'rgba(139, 92, 246, 0.9)',
    pink: 'rgba(255, 45, 112, 0.9)',
  },
};

export const Typography = {
  // Modern Font Weights
  weights: {
    thin: '100' as const,
    extraLight: '200' as const,
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
    black: '900' as const,
  },

  // Font Sizes - Modern Mobile Design
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 19,
    '2xl': 22,
    '3xl': 26,
    '4xl': 30,
    '5xl': 36,
    '6xl': 42,
    '7xl': 48,
    '8xl': 54,
    '9xl': 62,
  },

  // Line Heights
  lineHeights: {
    base: 1,
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
};

export const Spacing = {
  // Modern 4px base unit system with generous spacing
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
  '7xl': 96,
  '8xl': 120,
  '9xl': 160,
};

export const BorderRadius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  full: 9999,
};

export const Shadows = {
  // Modern shadow system
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
  },
};

export const Animations = {
  // Modern spring animations
  spring: {
    tension: 300,
    friction: 20,
  },
  fastSpring: {
    tension: 400,
    friction: 25,
  },
  slowSpring: {
    tension: 200,
    friction: 15,
  },
  
  // Timing animations
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
};

export const Breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1440,
};
