import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Shield,
  Clock,
  Smartphone,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Settings,
  Activity
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';

interface ColorfulCardProps {
  title: string;
  subtitle?: string;
  value?: string;
  icon?: React.ReactNode;
  color?: 'orange' | 'green' | 'blue' | 'purple' | 'pink' | 'red' | 'teal';
  variant?: 'default' | 'gradient' | 'solid';
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  badge?: string;
}

const iconMap = {
  shield: Shield,
  clock: Clock,
  smartphone: Smartphone,
  mapPin: MapPin,
  alert: AlertTriangle,
  check: CheckCircle,
  settings: Settings,
  activity: Activity,
};

export const ColorfulCard: React.FC<ColorfulCardProps> = ({
  title,
  subtitle,
  value,
  icon,
  color = 'blue',
  variant = 'gradient',
  onPress,
  style,
  disabled = false,
  badge,
}) => {
  const cardColors = {
    orange: {
      gradient: Colors.gradients.card.orange,
      solid: Colors.cardColors.orange,
    },
    green: {
      gradient: Colors.gradients.card.green,
      solid: Colors.cardColors.green,
    },
    blue: {
      gradient: Colors.gradients.card.blue,
      solid: Colors.cardColors.blue,
    },
    purple: {
      gradient: Colors.gradients.card.purple,
      solid: Colors.cardColors.purple,
    },
    pink: {
      gradient: Colors.gradients.card.pink,
      solid: Colors.cardColors.pink,
    },
    red: {
      gradient: ['#FF3B30', '#FF453A'] as const,
      solid: Colors.cardColors.red,
    },
    teal: {
      gradient: ['#5AC8FA', '#64D2FF'] as const,
      solid: Colors.cardColors.teal,
    },
  };

  const cardColor = cardColors[color];

  const CardContent = () => (
    <View style={[styles.card, style]}>
      {variant === 'gradient' ? (
        <LinearGradient
          colors={cardColor.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              {icon && <View style={styles.iconContainer}>{icon}</View>}
              {badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              )}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
              {value && <Text style={styles.value}>{value}</Text>}
            </View>
          </View>
        </LinearGradient>
      ) : (
        <View style={[styles.solidBackground, { backgroundColor: cardColor.solid }]}>
          <View style={styles.content}>
            <View style={styles.header}>
              {icon && <View style={styles.iconContainer}>{icon}</View>}
              {badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              )}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
              {value && <Text style={styles.value}>{value}</Text>}
            </View>
          </View>
        </View>
      )}
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
  },
  gradientBackground: {
    padding: Spacing.lg,
  },
  solidBackground: {
    padding: Spacing.lg,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[700],
  } as TextStyle,
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semiBold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  } as TextStyle,
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: Spacing.xs,
  } as TextStyle,
  value: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  } as TextStyle,
});

export default ColorfulCard;