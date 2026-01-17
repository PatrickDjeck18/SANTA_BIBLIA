import React from 'react';
import { StyleSheet, StatusBar, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/DesignTokens';

interface BackgroundGradientProps {
  children?: React.ReactNode;
  style?: any;
  variant?: 'default' | 'solid' | 'solidDark' | 'modern' | 'glass' | 'ethereal' | 'cosmic' | 'light' | 'warm';
  opacity?: number;
}

// Modern solid color backgrounds (no gradients)
const solidColors = {
  default: '#0A0A0F',     // Deep dark modern
  solidDark: '#0A0A0F',   // Same deep dark
  solid: '#1A1A2E',       // Slightly lighter dark
  light: '#F5F5F7',       // Light mode solid
};

const BackgroundGradient: React.FC<BackgroundGradientProps> = ({
  children,
  style,
  variant = 'default',
  opacity = 1
}) => {
  // For solid color variants, simply return a View with solid background
  if (variant === 'default' || variant === 'solid' || variant === 'solidDark' || variant === 'light') {
    const bgColor = variant === 'light' ? solidColors.light : (variant === 'solid' ? solidColors.solid : solidColors.default);
    return (
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            top: -(StatusBar.currentHeight ?? 0),
            height: '100%',
            backgroundColor: bgColor,
            opacity,
          },
          style
        ]}
      >
        {children}
      </View>
    );
  }

  // For gradient variants, use LinearGradient
  const getGradientColors = () => {
    switch (variant) {
      case 'modern':
        return Colors.gradients.modern || ['#667eea', '#764ba2'];
      case 'glass':
        return Colors.gradients.glass || ['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.1)'];
      case 'ethereal':
        return Colors.gradients.ethereal || ['#a8edea', '#fed6e3'];
      case 'cosmic':
        return Colors.gradients.cosmic || ['#667eea', '#764ba2', '#f093fb', '#f5576c'];
      case 'warm':
        return ['#FDF8F3', '#FAF5EF', '#F5EFE6']; // Warm cream gradient
      default:
        return Colors.gradients.spiritualLight || ['#F8E1F4', '#E8D5F2', '#D8C9F0'];
    }
  };

  const gradientColors = getGradientColors();

  // Safety check to ensure gradientColors is an array
  if (!Array.isArray(gradientColors) || gradientColors.length === 0) {
    console.warn('Invalid gradient colors for variant:', variant, 'Using fallback');
    return (
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: solidColors.default }, style]}>
        {children}
      </View>
    );
  }

  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        {
          top: -(StatusBar.currentHeight ?? 0),
          height: '100%',
          backgroundColor: 'transparent',
        },
        style
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          StyleSheet.absoluteFillObject,
          { opacity }
        ]}
      >
        <View style={StyleSheet.absoluteFillObject}>
          {children}
        </View>
      </LinearGradient>
    </View>
  );
};

export default BackgroundGradient;