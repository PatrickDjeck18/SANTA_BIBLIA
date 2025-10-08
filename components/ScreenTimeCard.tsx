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
import { Clock, Smartphone, Play, Pause, Settings } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';

interface ScreenTimeCardProps {
  title: string;
  subtitle?: string;
  timeLimit: string;
  currentTime: string;
  isActive?: boolean;
  onToggle?: () => void;
  onSettings?: () => void;
  style?: ViewStyle;
}

export const ScreenTimeCard: React.FC<ScreenTimeCardProps> = ({
  title,
  subtitle,
  timeLimit,
  currentTime,
  isActive = true,
  onToggle,
  onSettings,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={Colors.gradients.main}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Smartphone size={24} color={Colors.white} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            <View style={styles.headerActions}>
              {onSettings && (
                <TouchableOpacity onPress={onSettings} style={styles.settingsButton}>
                  <Settings size={20} color={Colors.white} />
                </TouchableOpacity>
              )}
              {onToggle && (
                <TouchableOpacity onPress={onToggle} style={styles.toggleButton}>
                  {isActive ? (
                    <Pause size={20} color={Colors.white} />
                  ) : (
                    <Play size={20} color={Colors.white} />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.timeContainer}>
            <View style={styles.timeDisplay}>
              <Text style={styles.currentTime}>{currentTime}</Text>
              <Text style={styles.timeLabel}>Current</Text>
            </View>
            <View style={styles.timeDivider} />
            <View style={styles.timeDisplay}>
              <Text style={styles.timeLimit}>{timeLimit}</Text>
              <Text style={styles.timeLabel}>Limit</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.progressText}>Screen Time Today</Text>
          </View>
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
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  timeDisplay: {
    alignItems: 'center',
    flex: 1,
  },
  currentTime: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.white,
    marginBottom: 2,
  } as TextStyle,
  timeLimit: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.semiBold,
    color: Colors.white,
    marginBottom: 2,
  } as TextStyle,
  timeLabel: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.7)',
  } as TextStyle,
  timeDivider: {
    width: 2,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: Spacing.lg,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    width: '65%',
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 3,
  },
  progressText: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  } as TextStyle,
});

export default ScreenTimeCard;