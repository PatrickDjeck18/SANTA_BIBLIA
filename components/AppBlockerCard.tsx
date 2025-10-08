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
import { Shield, Clock, Smartphone, Settings, ToggleLeft, ToggleRight } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';

interface AppBlockerCardProps {
  title: string;
  subtitle?: string;
  appsBlocked: number;
  websitesBlocked: number;
  isEnabled?: boolean;
  onToggle?: () => void;
  onManage?: () => void;
  style?: ViewStyle;
}

export const AppBlockerCard: React.FC<AppBlockerCardProps> = ({
  title,
  subtitle,
  appsBlocked,
  websitesBlocked,
  isEnabled = true,
  onToggle,
  onManage,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={Colors.gradients.card.orange}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Shield size={24} color={Colors.white} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            <View style={styles.headerActions}>
              {onToggle && (
                <TouchableOpacity onPress={onToggle} style={styles.toggleButton}>
                  {isEnabled ? (
                    <ToggleRight size={24} color={Colors.white} />
                  ) : (
                    <ToggleLeft size={24} color={Colors.white} />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Smartphone size={20} color={Colors.white} />
              <Text style={styles.statNumber}>{appsBlocked}</Text>
              <Text style={styles.statLabel}>Apps</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Clock size={20} color={Colors.white} />
              <Text style={styles.statNumber}>{websitesBlocked}</Text>
              <Text style={styles.statLabel}>Websites</Text>
            </View>
          </View>

          {onManage && (
            <TouchableOpacity onPress={onManage} style={styles.manageButton}>
              <Settings size={16} color={Colors.white} />
              <Text style={styles.manageButtonText}>Manage</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  gradientBackground: {
    padding: Spacing.lg,
  },
  content: {
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semiBold,
    color: Colors.white,
    marginBottom: 2,
  } as TextStyle,
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  } as TextStyle,
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  toggleButton: {
    width: 48,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.white,
    marginTop: Spacing.xs,
    marginBottom: 2,
  } as TextStyle,
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  } as TextStyle,
  statDivider: {
    width: 2,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: Spacing.lg,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  manageButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semiBold,
    color: Colors.white,
  } as TextStyle,
});

export default AppBlockerCard;