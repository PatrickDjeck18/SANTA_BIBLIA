import { useThemeContext } from '@/contexts/ThemeContext';

export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  surfaceSecondary: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Border colors
  border: string;
  borderLight: string;
  
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Neutral colors
  neutral50: string;
  neutral100: string;
  neutral200: string;
  neutral300: string;
  neutral400: string;
  neutral500: string;
  neutral600: string;
  neutral700: string;
  neutral800: string;
  neutral900: string;
  
  // Special colors
  white: string;
  black: string;
}

export const useTheme = () => {
  const { theme, themeMode, setThemeMode, toggleTheme, isDark } = useThemeContext();

  const colors: ThemeColors = {
    // Background colors
    background: isDark ? '#0F0F0F' : '#FFFFFF',
    surface: isDark ? '#1A1A1A' : '#F9FAFB',
    surfaceSecondary: isDark ? '#242424' : '#FFFFFF',
    
    // Text colors
    text: isDark ? '#F9FAFB' : '#111827',
    textSecondary: isDark ? '#9CA3AF' : '#6B7280',
    textTertiary: isDark ? '#6B7280' : '#9CA3AF',
    
    // Border colors
    border: isDark ? '#2A2A2A' : '#E5E7EB',
    borderLight: isDark ? '#1F1F1F' : '#F3F4F6',
    
    // Primary colors
    primary: isDark ? '#8B5CF6' : '#8B5CF6',
    primaryLight: isDark ? '#A78BFA' : '#A78BFA',
    primaryDark: isDark ? '#7C3AED' : '#7C3AED',
    
    // Status colors
    success: isDark ? '#22C55E' : '#10B981',
    warning: isDark ? '#F59E0B' : '#F59E0B',
    error: isDark ? '#EF4444' : '#EF4444',
    info: isDark ? '#3B82F6' : '#3B82F6',
    
    // Neutral colors
    neutral50: isDark ? '#0F0F0F' : '#F9FAFB',
    neutral100: isDark ? '#1A1A1A' : '#F3F4F6',
    neutral200: isDark ? '#242424' : '#E5E7EB',
    neutral300: isDark ? '#2A2A2A' : '#D1D5DB',
    neutral400: isDark ? '#404040' : '#9CA3AF',
    neutral500: isDark ? '#575757' : '#6B7280',
    neutral600: isDark ? '#6B7280' : '#4B5563',
    neutral700: isDark ? '#9CA3AF' : '#374151',
    neutral800: isDark ? '#D1D5DB' : '#1F2937',
    neutral900: isDark ? '#F9FAFB' : '#111827',
    
    // Special colors
    white: '#FFFFFF',
    black: '#000000',
  };

  return {
    colors,
    theme,
    themeMode,
    setThemeMode,
    toggleTheme,
    isDark,
  };
};

