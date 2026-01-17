/**
 * AnimatedWrapper Component
 * Provides smooth, calming animations for all screen elements
 */

import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { AnimationUtils, useAnimation, triggerLayoutAnimation } from '../constants/Animations';
import { Colors } from '../constants/DesignTokens';

interface AnimatedWrapperProps {
  children: React.ReactNode;
  animationType?: 'fade' | 'slideUp' | 'slideDown' | 'scale' | 'gentleFade' | 'softSlideUp' | 'calmScale';
  delay?: number;
  duration?: number;
  style?: ViewStyle;
  triggerOnMount?: boolean;
  triggerOnLayout?: boolean;
}

export const AnimatedWrapper: React.FC<AnimatedWrapperProps> = ({
  children,
  animationType = 'softSlideUp',
  delay = 0,
  duration,
  style,
  triggerOnMount = true,
  triggerOnLayout = false,
}) => {
  const { animatedValue, fadeIn, slideUp, scaleIn } = useAnimation(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (triggerOnMount && !hasAnimated.current) {
      hasAnimated.current = true;
      setTimeout(() => {
        switch (animationType) {
          case 'fade':
          case 'gentleFade':
            fadeIn(duration);
            break;
          case 'slideUp':
          case 'softSlideUp':
            slideUp(0, duration);
            break;
          case 'scale':
          case 'calmScale':
            scaleIn(1, duration);
            break;
          default:
            slideUp(0, duration);
        }
      }, delay);
    }
  }, [animationType, delay, duration, fadeIn, slideUp, scaleIn, triggerOnMount]);

  const handleLayout = () => {
    if (triggerOnLayout && !hasAnimated.current) {
      hasAnimated.current = true;
      triggerLayoutAnimation('gentle');
    }
  };

  const getAnimatedStyle = () => {
    switch (animationType) {
      case 'fade':
      case 'gentleFade':
        return {
          opacity: animatedValue,
        };
      case 'slideUp':
      case 'softSlideUp':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        };
      case 'slideDown':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        };
      case 'scale':
      case 'calmScale':
        return {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              }),
            },
          ],
        };
      default:
        return {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        };
    }
  };

  return (
    <Animated.View
      style={[getAnimatedStyle(), style]}
      onLayout={handleLayout}
    >
      {children}
    </Animated.View>
  );
};

interface StaggeredListProps {
  children: React.ReactNode[];
  animationType?: 'fade' | 'slideUp' | 'scale';
  staggerDelay?: number;
  containerStyle?: ViewStyle;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  animationType = 'slideUp',
  staggerDelay = 100,
  containerStyle,
}) => {
  const animatedValues = useRef(children.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    children.forEach((_, index) => {
      setTimeout(() => {
        const animatedValue = animatedValues[index];
        switch (animationType) {
          case 'fade':
            AnimationUtils.fadeIn(animatedValue).start();
            break;
          case 'scale':
            AnimationUtils.scaleIn(animatedValue).start();
            break;
          case 'slideUp':
          default:
            AnimationUtils.slideUp(animatedValue).start();
            break;
        }
      }, index * staggerDelay);
    });
  }, [animationType, staggerDelay, animatedValues]);

  return (
    <>
      {children.map((child, index) => (
        <Animated.View
          key={index}
          style={[
            {
              opacity: animatedValues[index],
              transform: [
                {
                  translateY: animationType === 'slideUp' 
                    ? animatedValues[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      })
                    : 0,
                },
                {
                  scale: animationType === 'scale'
                    ? animatedValues[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                      })
                    : 1,
                },
              ],
            },
          ]}
        >
          {child}
        </Animated.View>
      ))}
    </>
  );
};

interface AnimatedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  hoverable?: boolean;
  pressable?: boolean;
  onPress?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  style,
  hoverable = true,
  pressable = true,
  onPress,
}) => {
  const { animatedValue, buttonPress, buttonRelease } = useAnimation(1);

  const handlePressIn = () => {
    if (pressable) {
      buttonPress();
    }
  };

  const handlePressOut = () => {
    if (pressable) {
      buttonRelease();
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const getCardStyle = () => {
    return {
      transform: [
        {
          scale: animatedValue,
        },
        {
          translateY: hoverable 
            ? animatedValue.interpolate({
                inputRange: [0.98, 1, 1.01],
                outputRange: [2, 0, -2],
                extrapolate: 'clamp',
              })
            : 0,
        },
      ],
    };
  };

  return (
    <Animated.View
      style={[
        {
          backgroundColor: Colors.glass.card,
          borderRadius: 16,
          padding: 20,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2,
        },
        getCardStyle(),
        style,
      ]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePress}
      onTouchCancel={handlePressOut}
      onTouchEnd={handlePress}
    >
      {children}
    </Animated.View>
  );
};

interface AnimatedButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onPress,
  style,
  disabled = false,
  variant = 'primary',
}) => {
  const { animatedValue, buttonPress, buttonRelease } = useAnimation(1);

  const handlePress = () => {
    buttonPress();
    setTimeout(() => {
      buttonRelease();
      if (onPress) {
        onPress();
      }
    }, 150);
  };

  const getButtonStyle = () => {
    const baseStyle = {
      transform: [{ scale: animatedValue }],
      opacity: disabled ? 0.6 : 1,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: Colors.primary[500],
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: Colors.secondary[500],
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: Colors.primary[500],
        };
      default:
        return baseStyle;
    }
  };

  return (
    <Animated.View
      style={[
        {
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
        },
        getButtonStyle(),
        style,
      ]}
      onTouchStart={handlePress}
    >
      {children}
    </Animated.View>
  );
};

export default AnimatedWrapper;