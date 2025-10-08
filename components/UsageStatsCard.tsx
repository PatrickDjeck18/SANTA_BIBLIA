import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart3, TrendingUp, Clock } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';

interface UsageData {
  label: string;
  value: number;
  color: string;
}

interface UsageStatsCardProps {
  title: string;
  subtitle?: string;
  totalTime: string;
  data: UsageData[];
  style?: ViewStyle;
}

export const UsageStatsCard: React.FC<UsageStatsCardProps> = ({
  title,
  subtitle,
  totalTime,
  data,
  style,
}) => {
  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={Colors.gradients.card.blue}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <BarChart3 size={24} color={Colors.white} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            <View style={styles.totalTimeContainer}>
              <Clock size={16} color={Colors.white} />
              <Text style={styles.totalTime}>{totalTime}</Text>
            </View>
          </View>

          <View style={styles.chartContainer}>
            {data.map((item, index) => (
              <View key={item.label} style={styles.chartItem}>
                <View style={styles.chartLabel}>
                  <Text style={styles.chartLabelText}>{item.label}</Text>
                  <Text style={styles.chartValueText}>{item.value}h</Text>
                </View>
                <View style={styles.chartBar}>
                  <View
                    style={[
                      styles.chartBarFill,
                      {
                        width: `${(item.value / maxValue) * 100}%`,
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <TrendingUp size={16} color={Colors.white} />
            <Text style={styles.footerText}>Usage Trend</Text>
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
  totalTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  totalTime: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semiBold,
    color: Colors.white,
  } as TextStyle,
  chartContainer: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  chartItem: {
    marginBottom: Spacing.md,
  },
  chartLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  chartLabelText: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.9)',
  } as TextStyle,
  chartValueText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
    color: Colors.white,
  } as TextStyle,
  chartBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  chartBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  footerText: {
    fontSize: Typography.sizes.sm,
    color: Colors.white,
  } as TextStyle,
});

export default UsageStatsCard;