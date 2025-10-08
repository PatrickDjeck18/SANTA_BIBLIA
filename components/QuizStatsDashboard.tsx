import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';
import { 
  Trophy, 
  Target, 
  Zap, 
  Clock, 
  Award, 
  TrendingUp, 
  BookOpen,
  Star,
  CheckCircle,
  XCircle,
  Crown,
  Flame,
  Heart,
  Shield
} from 'lucide-react-native';
import { QuizStats } from '@/hooks/useQuizDatabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;

interface QuizStatsDashboardProps {
  stats: QuizStats;
  onClose?: () => void;
}

export const QuizStatsDashboard: React.FC<QuizStatsDashboardProps> = ({ 
  stats, 
  onClose 
}) => {
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const getLevelInfo = (level: number) => {
    const levels = [
      { name: 'Beginner', color: Colors.success[500], icon: '🌱' },
      { name: 'Student', color: Colors.primary[500], icon: '📖' },
      { name: 'Disciple', color: Colors.secondary[500], icon: '🎓' },
      { name: 'Teacher', color: Colors.warning[500], icon: '👨‍🏫' },
      { name: 'Scholar', color: Colors.error[500], icon: '🦉' },
      { name: 'Master', color: Colors.cardColors.purple, icon: '👑' }
    ];
    
    const levelIndex = Math.min(level - 1, levels.length - 1);
    return levels[levelIndex] || levels[0];
  };

  const levelInfo = getLevelInfo(stats.currentLevel);

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    color: string;
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statGradient, { backgroundColor: `${color}15` }]}>
        <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
          <Icon size={24} color={color} />
        </View>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  const ProgressBar = ({ 
    value, 
    max, 
    color,
    label 
  }: {
    value: number;
    max: number;
    color: string;
    label: string;
  }) => {
    const percentage = Math.min((value / max) * 100, 100);
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{label}</Text>
          <Text style={[styles.progressValue, { color }]}>{value}/{max}</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${percentage}%`,
                backgroundColor: color
              }
            ]} 
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Colors.gradients.spiritualLight as readonly [string, string, string]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.levelSection}>
            <View style={[styles.levelBadge, { backgroundColor: `${levelInfo.color}20` }]}>
              <Text style={[styles.levelIcon, { color: levelInfo.color }]}>
                {levelInfo.icon}
              </Text>
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>Level {stats.currentLevel}</Text>
              <Text style={[styles.levelName, { color: levelInfo.color }]}>
                {levelInfo.name}
              </Text>
            </View>
          </View>
          
          {onClose && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Main Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Points"
            value={stats.totalPoints.toLocaleString()}
            icon={Trophy}
            color={Colors.primary[500]}
          />
          
          <StatCard
            title="Accuracy"
            value={`${Math.round(stats.averageAccuracy)}%`}
            subtitle="Average"
            icon={Target}
            color={Colors.success[500]}
          />
          
          <StatCard
            title="Games Played"
            value={stats.totalGamesPlayed}
            icon={BookOpen}
            color={Colors.secondary[500]}
          />
          
          <StatCard
            title="Best Streak"
            value={stats.bestStreak}
            subtitle="Correct in a row"
            icon={Flame}
            color={Colors.error[500]}
          />
        </View>

        {/* Progress Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress Tracking</Text>
          
          <ProgressBar
            value={stats.totalCorrectAnswers}
            max={stats.totalQuestionsAnswered}
            color={Colors.success[500]}
            label="Questions Correct"
          />
          
          <ProgressBar
            value={stats.currentStreak}
            max={Math.max(stats.bestStreak, 10)}
            color={Colors.error[500]}
            label="Current Streak"
          />
          
          <ProgressBar
            value={stats.currentLevel}
            max={6}
            color={Colors.primary[500]}
            label="Level Progress"
          />
        </View>

        {/* Category Performance */}
        {Object.keys(stats.categoryStats).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Performance</Text>
            
            {Object.entries(stats.categoryStats).map(([category, categoryStats]) => (
              <View key={category} style={styles.categoryRow}>
                <Text style={styles.categoryName}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
                <View style={styles.categoryStats}>
                  <Text style={styles.categoryStat}>
                    {Math.round(categoryStats.accuracy)}%
                  </Text>
                  <Text style={styles.categorySubstat}>
                    {categoryStats.correct}/{categoryStats.played}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Difficulty Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Difficulty Performance</Text>
          
          {Object.entries(stats.difficultyStats).map(([difficulty, difficultyStats]) => (
            <View key={difficulty} style={styles.difficultyRow}>
              <View style={styles.difficultyInfo}>
                <View 
                  style={[
                    styles.difficultyDot,
                    { 
                      backgroundColor: 
                        difficulty === 'easy' ? Colors.success[500] :
                        difficulty === 'medium' ? Colors.warning[500] :
                        Colors.error[500]
                    }
                  ]} 
                />
                <Text style={styles.difficultyName}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Text>
              </View>
              <View style={styles.difficultyStats}>
                <Text style={styles.difficultyStat}>
                  {Math.round(difficultyStats.accuracy)}%
                </Text>
                <Text style={styles.difficultySubstat}>
                  {difficultyStats.correct}/{difficultyStats.played}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Time Spent */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time Investment</Text>
          <View style={styles.timeCard}>
            <Clock size={24} color={Colors.primary[500]} />
            <Text style={styles.timeText}>
              {formatTime(stats.timeSpent)} spent learning
            </Text>
          </View>
        </View>

        {/* Achievements */}
        {stats.achievements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achievementsGrid}>
              {stats.achievements.map((achievement, index) => (
                <View key={index} style={styles.achievementBadge}>
                  <Award size={16} color={Colors.warning[500]} />
                  <Text style={styles.achievementText}>{achievement}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Motivational Quote */}
        <View style={styles.quoteSection}>
          <Text style={styles.quote}>
            "Study to show yourself approved unto God, a workman that needs not to be ashamed, rightly dividing the word of truth."
          </Text>
          <Text style={styles.quoteReference}>2 Timothy 2:15</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  levelSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  levelBadge: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelIcon: {
    fontSize: 24,
  },
  levelInfo: {
    gap: Spacing.xs,
  },
  levelTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    color: Colors.neutral[800],
  },
  levelName: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: Colors.neutral[600],
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    width: isTablet ? '48%' : '47%',
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  statGradient: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  statTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: Colors.neutral[700],
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.neutral[500],
    textAlign: 'center',
    marginTop: 2,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    color: Colors.neutral[800],
    marginBottom: Spacing.md,
  },
  progressContainer: {
    marginBottom: Spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  progressLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    fontWeight: '500',
  },
  progressValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  categoryName: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[700],
    fontWeight: '500',
  },
  categoryStats: {
    alignItems: 'flex-end',
  },
  categoryStat: {
    fontSize: Typography.sizes.sm,
    fontWeight: 'bold',
    color: Colors.neutral[800],
  },
  categorySubstat: {
    fontSize: Typography.sizes.xs,
    color: Colors.neutral[500],
  },
  difficultyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  difficultyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  difficultyDot: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
  },
  difficultyName: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[700],
    fontWeight: '500',
  },
  difficultyStats: {
    alignItems: 'flex-end',
  },
  difficultyStat: {
    fontSize: Typography.sizes.sm,
    fontWeight: 'bold',
    color: Colors.neutral[800],
  },
  difficultySubstat: {
    fontSize: Typography.sizes.xs,
    color: Colors.neutral[500],
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.md,
  },
  timeText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary[700],
    fontWeight: '500',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.warning[50],
    borderRadius: BorderRadius.full,
  },
  achievementText: {
    fontSize: Typography.sizes.xs,
    color: Colors.warning[700],
    fontWeight: '500',
  },
  quoteSection: {
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  quote: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary[700],
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  quoteReference: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary[600],
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default QuizStatsDashboard;