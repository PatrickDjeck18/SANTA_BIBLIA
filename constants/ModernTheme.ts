/**
 * Modern Design System - Daily Bread App
 * A comprehensive, modern design system with glassmorphism effects,
 * refined color palette, and enhanced animations.
 * 
 * @version 2.0.0
 */

import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// =============================================================================
// COLOR PALETTE
// =============================================================================

export const Colors = {
  // Primary - Warm Spiritual Orange
  primary: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316', // Main accent
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
    950: '#431407',
  },

  // Secondary - Spiritual Purple
  secondary: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
    700: '#7C3AED',
    800: '#6B21A8',
    900: '#581C87',
    950: '#3B0764',
  },

  // Success - Hope Green
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

  // Warning - Faith Gold
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

  // Error - Alert Red
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

  // Info - Peace Blue
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Neutral - Warm Grays
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

  // Light Mode Surfaces
  light: {
    background: '#FDF8F3',      // Warm cream
    surface: '#FFFFFF',
    surfaceVariant: '#FAF5EF',
    surfaceElevated: '#FFFFFF',
    surfaceGlass: 'rgba(255, 255, 255, 0.72)',
    surfaceGlassBorder: 'rgba(255, 255, 255, 0.5)',
    surfaceGlassDark: 'rgba(0, 0, 0, 0.04)',
  },

  // Dark Mode Surfaces
  dark: {
    background: '#0F0F1A',      // Deep spiritual dark
    surface: '#1A1A2E',
    surfaceVariant: '#252540',
    surfaceElevated: '#2D2D4A',
    surfaceGlass: 'rgba(26, 26, 46, 0.72)',
    surfaceGlassBorder: 'rgba(255, 255, 255, 0.1)',
    surfaceGlassDark: 'rgba(0, 0, 0, 0.3)',
  },

  // Text Colors
  text: {
    light: {
      primary: '#1E293B',
      secondary: '#64748B',
      tertiary: '#94A3B8',
      inverse: '#FFFFFF',
      disabled: '#CBD5E1',
    },
