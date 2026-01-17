/**
 * Animation Utilities for Daily Bread App
 * Calming & Wellness-focused animations
 */

import { Animated, Easing, LayoutAnimation, Platform } from 'react-native';
import { Animations as DesignAnimations } from './DesignTokens';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && LayoutAnimation.configureNext) {
  LayoutAnimation.configureNext({
    duration: 300,
    create: {
      type: LayoutAnimation.Types.spring,
      property: LayoutAnimation.Properties.opacity,
      springDamping: 0.4,
    },
    update: {
      type: LayoutAnimation.Types.spring,
      property: LayoutAnimation.Properties.opacity,
      springDamping: 0.6,
    },
    delete: {
      type: LayoutAnimation.Types.spring,
      property: LayoutAnimation.Properties.opacity,
      springDamping: 0.4,
    },
  });
}

export class AnimationUtils {
  
  // Create animated value with custom config
  static createAnimatedValue(initialValue: number = 0): Animated.Value {
    return new Animated.Value(initialValue);
  }

  // Spring animation wrapper
  static spring(
    animatedValue: Animated.Value,
    config: Partial<Animated.SpringAnimationConfig> = {}
  ): Animated.CompositeAnimation {
    return Animated.spring(animatedValue, {
      tension: DesignAnimations.spring.tension,
      friction: DesignAnimations.spring.friction,
      mass: DesignAnimations.spring.mass,
      useNativeDriver: true,
      toValue: 1,
      ...config,
    });
  }

  // Timing animation wrapper
  static timing(
    animatedValue: Animated.Value,
    config: Partial<Animated.TimingAnimationConfig> = {}
  ): Animated.CompositeAnimation {
    return Animated.timing(animatedValue, {
      duration: DesignAnimations.timing.normal,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
      toValue: 1,
      ...config,
    });
  }

  // Fade animation
  static fadeIn(
    animatedValue: Animated.Value,
    duration?: number
  ): Animated.CompositeAnimation {
    return this.timing(animatedValue, {
      toValue: 1,
      duration: duration || DesignAnimations.entrance.gentleFade.duration,
    });
  }

  static fadeOut(
    animatedValue: Animated.Value,
    duration?: number
  ): Animated.CompositeAnimation {
    return this.timing(animatedValue, {
      toValue: 0,
      duration: duration || DesignAnimations.exit.gentleFade.duration,
    });
  }

  // Slide animations
  static slideUp(
    animatedValue: Animated.Value,
    toValue: number = 0,
    duration?: number
  ): Animated.CompositeAnimation {
    return this.timing(animatedValue, {
      toValue,
      duration: duration || DesignAnimations.entrance.softSlideUp.duration,
    });
  }

  static slideDown(
    animatedValue: Animated.Value,
    toValue: number = 0,
    duration?: number
  ): Animated.CompositeAnimation {
    return this.timing(animatedValue, {
      toValue,
      duration: duration || DesignAnimations.exit.softSlideDown.duration,
    });
  }

  // Scale animations
  static scaleIn(
    animatedValue: Animated.Value,
    toValue: number = 1
  ): Animated.CompositeAnimation {
    return this.spring(animatedValue, {
      toValue,
      tension: DesignAnimations.modern.gentle.tension,
      friction: DesignAnimations.modern.gentle.friction,
    });
  }

  static scaleOut(
    animatedValue: Animated.Value,
    toValue: number = 0.95
  ): Animated.CompositeAnimation {
    return this.timing(animatedValue, {
      toValue,
    });
  }

  // Button press animation
  static buttonPress(animatedValue: Animated.Value): Animated.CompositeAnimation {
    return this.timing(animatedValue, {
      toValue: DesignAnimations.button.gentlePress.scale,
      duration: DesignAnimations.button.gentlePress.duration,
    });
  }

  static buttonRelease(animatedValue: Animated.Value): Animated.CompositeAnimation {
    return this.spring(animatedValue, {
      toValue: 1,
      tension: 150,
      friction: 20,
    });
  }

  // Card hover animation
  static cardHover(animatedValue: Animated.Value): Animated.CompositeAnimation {
    return this.spring(animatedValue, {
      toValue: 1,
      tension: 200,
      friction: 15,
    });
  }

  // Notification animation
  static notificationSlide(
    animatedValue: Animated.Value,
    toValue: number = 0
  ): Animated.CompositeAnimation {
    return this.timing(animatedValue, {
      toValue,
      duration: DesignAnimations.micro.softNotification.duration,
    });
  }

  // Page transition animations
  static pageTransition(
    animatedValue: Animated.Value,
    direction: 'in' | 'out' = 'in'
  ): Animated.CompositeAnimation {
    const isIn = direction === 'in';
    return this.timing(animatedValue, {
      toValue: isIn ? 0 : 1,
      duration: isIn 
        ? DesignAnimations.pageTransitions.calmSlide.duration
        : DesignAnimations.pageTransitions.softFade.duration,
    });
  }

  // Modal animations
  static modalEnter(
    animatedValue: Animated.Value,
    scaleValue: Animated.Value
  ): Animated.CompositeAnimation {
    return Animated.parallel([
      this.fadeIn(animatedValue, DesignAnimations.modal.softEntrance.duration),
      this.scaleIn(scaleValue, 1),
    ]);
  }

  static modalExit(
    animatedValue: Animated.Value,
    scaleValue: Animated.Value
  ): Animated.CompositeAnimation {
    return Animated.parallel([
      this.fadeOut(animatedValue, DesignAnimations.modal.gentleExit.duration),
      this.scaleOut(scaleValue, 0.95),
    ]);
  }

  // Loading animation
  static loadingSpin(animatedValue: Animated.Value): Animated.CompositeAnimation {
    return Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
  }

  // Breathing animation for wellness UI
  static breathing(
    animatedValue: Animated.Value,
    minScale: number = 0.95,
    maxScale: number = 1.05
  ): Animated.CompositeAnimation {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: maxScale,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: minScale,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
  }

  // Gentle bounce animation
  static gentleBounce(animatedValue: Animated.Value): Animated.CompositeAnimation {
    return Animated.sequence([
      this.spring(animatedValue, {
        toValue: 1.05,
        tension: 200,
        friction: 8,
      }),
      this.spring(animatedValue, {
        toValue: 1,
        tension: 150,
        friction: 12,
      }),
    ]);
  }

  // Pulse animation for attention
  static pulse(
    animatedValue: Animated.Value,
    scale: number = 1.1
  ): Animated.CompositeAnimation {
    return Animated.loop(
      Animated.sequence([
        this.timing(animatedValue, {
          toValue: scale,
          duration: 1000,
        }),
        this.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
        }),
      ])
    );
  }

  // Shimmer effect for loading states
  static shimmer(animatedValue: Animated.Value): Animated.CompositeAnimation {
    return Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
  }
}

// Hooks for React components
export const useAnimation = (initialValue: number = 0) => {
  const animatedValue = AnimationUtils.createAnimatedValue(initialValue);
  
  const fadeIn = (duration?: number) => {
    AnimationUtils.fadeIn(animatedValue, duration).start();
  };

  const fadeOut = (duration?: number) => {
    AnimationUtils.fadeOut(animatedValue, duration).start();
  };

  const slideUp = (toValue?: number, duration?: number) => {
    AnimationUtils.slideUp(animatedValue, toValue, duration).start();
  };

  const scaleIn = (toValue?: number) => {
    AnimationUtils.scaleIn(animatedValue, toValue).start();
  };

  const buttonPress = () => {
    AnimationUtils.buttonPress(animatedValue).start();
  };

  const buttonRelease = () => {
    AnimationUtils.buttonRelease(animatedValue).start();
  };

  return {
    animatedValue,
    fadeIn,
    fadeOut,
    slideUp,
    scaleIn,
    buttonPress,
    buttonRelease,
  };
};

// Staggered animation hook for lists
export const useStaggeredAnimation = (itemCount: number, animationType: string = 'fade') => {
  const animatedValues = Array.from({ length: itemCount }, () => 
    AnimationUtils.createAnimatedValue(0)
  );

  const startStaggeredAnimation = () => {
    animatedValues.forEach((animatedValue, index) => {
      const delay = DesignAnimations.stagger.gentle.delay * index;
      setTimeout(() => {
        switch (animationType) {
          case 'fade':
            AnimationUtils.fadeIn(animatedValue).start();
            break;
          case 'slideUp':
            AnimationUtils.slideUp(animatedValue).start();
            break;
          case 'scale':
            AnimationUtils.scaleIn(animatedValue).start();
            break;
          default:
            AnimationUtils.fadeIn(animatedValue).start();
        }
      }, delay);
    });
  };

  return {
    animatedValues,
    startStaggeredAnimation,
  };
};

// Layout Animation configuration
export const LayoutAnimationConfig = {
  // Gentle layout animation
  gentle: {
    duration: 400,
    create: {
      type: LayoutAnimation.Types.spring,
      property: LayoutAnimation.Properties.opacity,
      springDamping: 0.6,
    },
    update: {
      type: LayoutAnimation.Types.spring,
      property: LayoutAnimation.Properties.opacity,
      springDamping: 0.6,
    },
    delete: {
      type: LayoutAnimation.Types.spring,
      property: LayoutAnimation.Properties.opacity,
      springDamping: 0.6,
    },
  },

  // Soft layout animation
  soft: {
    duration: 350,
    create: {
      type: LayoutAnimation.Types.spring,
      property: LayoutAnimation.Properties.opacity,
      springDamping: 0.7,
    },
    update: {
      type: LayoutAnimation.Types.spring,
      property: LayoutAnimation.Properties.opacity,
      springDamping: 0.7,
    },
    delete: {
      type: LayoutAnimation.Types.spring,
      property: LayoutAnimation.Properties.opacity,
      springDamping: 0.7,
    },
  },
};

// Helper function to trigger layout animations
export const triggerLayoutAnimation = (type: 'gentle' | 'soft' = 'gentle') => {
  if (LayoutAnimation.configureNext) {
    LayoutAnimation.configureNext(LayoutAnimationConfig[type]);
  }
};

export default AnimationUtils;