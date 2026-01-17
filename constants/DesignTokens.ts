/**
 * Modern Design System Tokens - Enhanced Christian App Theme
 * Following iOS 18 and Material You design principles with vibrant, attractive colors
 */

export const Colors = {
  // Primary Brand Colors - Prayer Tracker Colors
  primary: {
    50: '#FDF2F8',
    100: '#FCE7F3',
    200: '#FBCFE8',
    300: '#F9A8D4',
    400: '#F472B6',
    500: '#EC4899', // Primary - Pink (matching prayer tracker)
    600: '#DB2777',
    700: '#BE185D',
    800: '#9D174D',
    900: '#831843',
    950: '#500724',
  },

  // Secondary Colors - Prayer Tracker Colors
  secondary: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6', // Secondary - Purple (matching prayer tracker)
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
    950: '#2E1065',
  },

  // Accent Colors - Prayer Tracker Colors
  accent: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Accent - Golden Yellow (matching prayer tracker)
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    950: '#451A03',
  },

  // Neutral Colors - Warm & Inviting
  neutral: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A8A8',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
    950: '#0C0A09',
  },

  // Faith Colors - Prayer Tracker Colors
  faith: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E', // Faith Green (matching prayer tracker)
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  peace: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Peace Blue (calm, serenity)
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  hope: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Hope Yellow (matching prayer tracker)
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  love: {
    50: '#FDF2F8',
    100: '#FCE7F3',
    200: '#FBCFE8',
    300: '#F9A8D4',
    400: '#F472B6',
    500: '#EC4899', // Love Pink (matching prayer tracker)
    600: '#DB2777',
    700: '#BE185D',
    800: '#9D174D',
    900: '#831843',
  },

  // Semantic Colors - Prayer Tracker Colors
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E', // Success Green (matching prayer tracker)
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
    500: '#F59E0B', // Warning Yellow (matching prayer tracker)
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

  // Border colors
  border: {
    primary: '#E7E5E4',
    secondary: '#D6D3D1',
    subtle: '#F5F5F4',
    strong: '#A8A29E',
  },

  // Card Colors - Prayer Tracker Colors
  cardColors: {
    primaryPink: '#EC4899',
    secondaryPurple: '#8B5CF6',
    goldenLight: '#F59E0B',
    successGreen: '#22C55E',
    peaceBlue: '#3B82F6',
    lovePink: '#EC4899',
    sunrise: '#FDE68A',
    hopeYellow: '#FCD34D',
    royalty: '#A855F7',
    divineGold: '#FBBF24',
    blessed: '#86EFAC',
    serene: '#93C5FD',
    spirit: '#C4B5FD',
    grace: '#FCE7F3',
    glory: '#FCD34D',
  },

  // Gradients - Prayer Tracker Colors
  gradients: {
    // Primary gradients matching prayer tracker
    primary: ['#EC4899', '#DB2777', '#BE185D'] as const, // Primary Pink
    secondary: ['#8B5CF6', '#7C3AED', '#6D28D9'] as const, // Secondary Purple
    golden: ['#F59E0B', '#D97706', '#B45309'] as const, // Golden Yellow
    faith: ['#22C55E', '#16A34A', '#15803D'] as const, // Success Green
    
    // Combined gradients using prayer tracker colors
    love: ['#EC4899', '#F9A8D4', '#FDF2F8'] as const, // Love and compassion
    spirit: ['#8B5CF6', '#C4B5FD', '#F5F3FF'] as const, // Spiritual purple
    hope: ['#F59E0B', '#FDE68A', '#FFFBEB'] as const, // Hopeful warmth
    peace: ['#3B82F6', '#93C5FD', '#EFF6FF'] as const, // Peaceful blues
    success: ['#22C55E', '#86EFAC', '#F0FDF4'] as const, // Success greens
    
    // Modern gradients using prayer tracker colors
    main: ['#FDF2F8', '#F5F3FF', '#FFFBEB'] as const, // Soft prayer colors
    softGlow: ['#FDF2F8', '#FDE68A', '#F5F3FF'] as const, // Gentle warmth
    
    // Modern Enhanced Gradients using prayer tracker colors
    modern: ['#EC4899', '#8B5CF6'] as const, // Pink to Purple
    glass: ['rgba(255, 255, 255, 0.25)', 'rgba(253, 242, 248, 0.1)'] as const,
    cardGradient: ['rgba(255, 255, 255, 0.9)', 'rgba(253, 242, 248, 0.7)'] as const,
    overlay: ['rgba(236, 72, 153, 0.1)', 'rgba(168, 168, 168, 0.05)'] as const,
    premium: ['#EC4899', '#8B5CF6', '#F59E0B'] as const, // Premium gradient
    ethereal: ['#F5F3FF', '#FDF2F8'] as const, // Ethereal purple-pink
    cosmic: ['#EC4899', '#8B5CF6', '#F59E0B', '#22C55E'] as const, // Cosmic
    aurora: ['#F5F3FF', '#FDF2F8', '#FDE68A'] as const, // Aurora
    etherealSunset: ['#EC4899', '#8B5CF6', '#F59E0B', '#22C55E'] as const,
    spiritualLight: ['#F0F9FF', '#FDF2F8', '#FEF7ED'] as const, // Spiritual light gradient
    
    // Card gradients for different features using prayer tracker colors
    card: {
      blue: ['#3B82F6', '#2563EB'] as const,
      purple: ['#8B5CF6', '#7C3AED'] as const, // Prayer tracker purple
      gold: ['#F59E0B', '#D97706'] as const, // Prayer tracker gold
      green: ['#22C55E', '#16A34A'] as const, // Prayer tracker green
      pink: ['#EC4899', '#DB2777'] as const, // Prayer tracker pink
    },
    
    // ACCENT GRADIENTS - Prayer Tracker Colors
    accent: {
      primary: ['#EC4899', '#BE185D'] as const, // Primary pink
      secondary: ['#8B5CF6', '#6D28D9'] as const, // Secondary purple
      success: ['#22C55E', '#15803D'] as const, // Success green
      warning: ['#F59E0B', '#B45309'] as const, // Warning yellow
      danger: ['#EF4444', '#B91C1C'] as const, // Error red
      info: ['#3B82F6', '#1E40AF'] as const, // Info blue
    },
  },

  // ENHANCED GLASS & CARD EFFECTS - Prayer Tracker Colors
  glass: {
    light: 'rgba(253, 242, 248, 0.15)',
    medium: 'rgba(253, 242, 248, 0.25)',
    heavy: 'rgba(253, 242, 248, 0.35)',
    dark: 'rgba(168, 168, 168, 0.1)',

    // Prayer tracker frosted glass effects
    frost: 'rgba(255, 255, 255, 0.4)',
    crystal: 'rgba(253, 242, 248, 0.3)',

    // Enhanced card backgrounds using prayer tracker colors
    card: 'rgba(255, 255, 255, 0.9)',
    cardDark: 'rgba(253, 242, 248, 0.95)',
    cardSoft: 'rgba(255, 255, 255, 0.8)',

    // Overlay effects using prayer tracker colors
    overlay: 'rgba(236, 72, 153, 0.2)',
    overlayLight: 'rgba(168, 168, 168, 0.05)',

    // Card variants using prayer tracker colors
    blue: 'rgba(59, 130, 246, 0.9)',
    purple: 'rgba(139, 92, 246, 0.9)', // Prayer tracker purple
    gold: 'rgba(245, 158, 11, 0.9)', // Prayer tracker gold
    green: 'rgba(34, 197, 94, 0.9)', // Prayer tracker green
    pink: 'rgba(236, 72, 153, 0.9)', // Prayer tracker pink
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
  // Calming spring animations for wellness-focused UI
  spring: {
    tension: 280,
    friction: 18,
    mass: 0.8,
  },
  fastSpring: {
    tension: 320,
    friction: 20,
    mass: 0.7,
  },
  slowSpring: {
    tension: 240,
    friction: 16,
    mass: 0.9,
  },
  gentleSpring: {
    tension: 200,
    friction: 14,
    mass: 1.0,
  },
  
  // Enhanced timing animations
  timing: {
    instant: 80,
    fast: 180,
    normal: 280,
    slow: 450,
    slower: 650,
    gentle: 800,
  },
  
  // Page transition animations
  pageTransitions: {
    slide: {
      duration: 350,
      easing: 'ease-in-out',
    },
    fade: {
      duration: 280,
      easing: 'ease-out',
    },
    scale: {
      duration: 320,
      easing: 'ease-out',
    },
    // Calming page transitions
    calmSlide: {
      duration: 400,
      easing: 'ease-in-out',
    },
    softFade: {
      duration: 350,
      easing: 'ease-out',
    },
    gentleScale: {
      duration: 380,
      easing: 'ease-out',
    },
  },
  
  // Button interaction animations
  button: {
    press: {
      scale: 0.96,
      duration: 120,
    },
    release: {
      scale: 1.0,
      duration: 200,
    },
    hover: {
      scale: 1.02,
      duration: 200,
    },
    // Calming button animations
    gentlePress: {
      scale: 0.98,
      duration: 150,
    },
    softRelease: {
      scale: 1.0,
      duration: 250,
    },
  },
  
  // List and grid animations
  list: {
    item: {
      duration: 280,
      delay: 50,
      easing: 'ease-out',
    },
    stagger: {
      duration: 320,
      delay: 80,
      easing: 'ease-out',
    },
    // Calming list animations
    gentleItem: {
      duration: 350,
      delay: 60,
      easing: 'ease-out',
    },
    softStagger: {
      duration: 400,
      delay: 100,
      easing: 'ease-in-out',
    },
  },
  
  // Modal and sheet animations
  modal: {
    entrance: {
      scale: 0.9,
      opacity: 0,
      duration: 280,
    },
    exit: {
      scale: 0.9,
      opacity: 0,
      duration: 250,
    },
    // Calming modal animations
    softEntrance: {
      scale: 0.95,
      opacity: 0,
      duration: 350,
    },
    gentleExit: {
      scale: 0.95,
      opacity: 0,
      duration: 300,
    },
  },
  
  // Micro-interactions
  micro: {
    feedback: {
      scale: 1.05,
      duration: 150,
    },
    notification: {
      translateY: -20,
      opacity: 0,
      duration: 300,
    },
    // Calming micro-interactions
    gentleFeedback: {
      scale: 1.02,
      duration: 200,
    },
    softNotification: {
      translateY: -15,
      opacity: 0,
      duration: 350,
    },
  },
  
  // Card animations
  card: {
    hover: {
      translateY: -4,
      scale: 1.02,
      duration: 200,
    },
    press: {
      scale: 0.98,
      duration: 120,
    },
    // Calming card animations
    gentleHover: {
      translateY: -2,
      scale: 1.01,
      duration: 250,
    },
    softPress: {
      scale: 0.99,
      duration: 180,
    },
  },
  
  // Enhanced Modern Animations for Wellness UI
  modern: {
    spring: {
      tension: 300,
      friction: 18,
      mass: 0.8,
    },
    bounce: {
      tension: 280,
      friction: 12,
      mass: 0.9,
    },
    smooth: {
      tension: 250,
      friction: 16,
      mass: 1.0,
    },
    gentle: {
      tension: 200,
      friction: 14,
      mass: 1.1,
    },
  },
  
  // Comprehensive duration system
  duration: {
    instant: 80,
    quick: 120,
    fast: 180,
    normal: 280,
    slow: 450,
    slower: 650,
    gentle: 800,
    calm: 1000,
  },
  
  // Easing functions for smooth animations
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    // Custom easing for calming effects
    gentle: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    soft: 'cubic-bezier(0.23, 1, 0.32, 1)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    calm: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  },
  
  // Stagger animation configurations
  stagger: {
    small: {
      delay: 50,
      duration: 280,
    },
    medium: {
      delay: 80,
      duration: 320,
    },
    large: {
      delay: 120,
      duration: 380,
    },
    // Calming stagger animations
    gentle: {
      delay: 100,
      duration: 400,
    },
    soft: {
      delay: 150,
      duration: 450,
    },
  },
  
  // Entrance animations for components
  entrance: {
    fadeIn: {
      opacity: { from: 0, to: 1 },
      duration: 350,
      easing: 'ease-out',
    },
    slideUp: {
      translateY: { from: 20, to: 0 },
      opacity: { from: 0, to: 1 },
      duration: 400,
      easing: 'ease-out',
    },
    slideDown: {
      translateY: { from: -20, to: 0 },
      opacity: { from: 0, to: 1 },
      duration: 400,
      easing: 'ease-out',
    },
    scaleIn: {
      scale: { from: 0.9, to: 1 },
      opacity: { from: 0, to: 1 },
      duration: 350,
      easing: 'ease-out',
    },
    // Calming entrance animations
    gentleFade: {
      opacity: { from: 0, to: 1 },
      duration: 450,
      easing: 'gentle',
    },
    softSlideUp: {
      translateY: { from: 30, to: 0 },
      opacity: { from: 0, to: 1 },
      duration: 500,
      easing: 'soft',
    },
    calmScale: {
      scale: { from: 0.95, to: 1 },
      opacity: { from: 0, to: 1 },
      duration: 480,
      easing: 'calm',
    },
  },
  
  // Exit animations for components
  exit: {
    fadeOut: {
      opacity: { from: 1, to: 0 },
      duration: 250,
      easing: 'ease-in',
    },
    slideUp: {
      translateY: { from: 0, to: -20 },
      opacity: { from: 1, to: 0 },
      duration: 300,
      easing: 'ease-in',
    },
    slideDown: {
      translateY: { from: 0, to: 20 },
      opacity: { from: 1, to: 0 },
      duration: 300,
      easing: 'ease-in',
    },
    scaleOut: {
      scale: { from: 1, to: 0.9 },
      opacity: { from: 1, to: 0 },
      duration: 280,
      easing: 'ease-in',
    },
    // Calming exit animations
    gentleFade: {
      opacity: { from: 1, to: 0 },
      duration: 350,
      easing: 'gentle',
    },
    softSlideDown: {
      translateY: { from: 0, to: 30 },
      opacity: { from: 1, to: 0 },
      duration: 400,
      easing: 'soft',
    },
    calmScale: {
      scale: { from: 1, to: 0.95 },
      opacity: { from: 1, to: 0 },
      duration: 380,
      easing: 'calm',
    },
  },
};

export const Breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1440,
};
