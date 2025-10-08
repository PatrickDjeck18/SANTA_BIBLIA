
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Animations } from '@/constants/DesignTokens';
import { 
  Trophy, 
  Star, 
  Award, 
  Crown, 
  Flame, 
  Zap, 
  Target, 
  Clock, 
  BookOpen,
  CheckCircle,
  Shield,
  Heart,
  TrendingUp,
  Users,
  Book,
  Calendar
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  category: 'progress' | 'performance' | 'dedication' | 'mastery';
  requirement: number;
  currentProgress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  points: number;
}

interface AchievementSystemProps {
  stats: any; // QuizStats from useQuizDatabase
  onAchievementUnlocked?: (achievement: Achievement) => void;
}

export const AchievementSystem: React.FC<AchievementSystemProps> = ({ 
  stats, 
  onAchievementUnlocked 
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);
  const [scaleAnim] = useState(new Animated.Value(1));

  // Define all achievements
  const allAchievements: Omit<Achievement, 'currentProgress' | 'unlocked' | 'unlockedAt'>[] = [
    // Progress Achievements
    {
      id: 'first_quiz',
      title: 'First Steps',
      description: 'Complete your first Bible quiz',
      icon: BookOpen,
      color: Colors.primary[500],
      category: 'progress',
      requirement: 1,
      points: 10
    },
    {
      id: 'quiz_enthusiast',
      title: 'Quiz Enthusiast',
      description: 'Complete 10 quizzes',
      icon: Book,
      color: Colors.primary[600],
      category: 'progress',
      requirement: 10,
      points: 25
    },
    {
      id: 'quiz_master',
      title: 'Quiz Master',
      description: 'Complete 50 quizzes',
      icon: Crown,
      color: Colors.primary[700],
      category: 'progress',
      requirement: 50,
      points: 50
    },
    {
      id: 'bible_scholar',
      title: 'Bible Scholar',
      description: 'Complete 100 quizzes',
      icon: Trophy,
      color: Colors.primary[800],
      category: 'progress',
      requirement: 100,
      points: 100
    },

    // Performance Achievements
    {
      id: 'perfect_score',
      title: 'Perfect Score',
      description: 'Get 100% accuracy in a quiz',
      icon: Target,
      color: Colors.success[500],
      category: 'performance',
      requirement: 1,
      points: 20
    },
    {
      id: 'streak_5',
      title: 'Hot Streak',
      description: 'Answer 5 questions correctly in a row',
      icon: Flame,
      color: Colors.error[500],
      category: 'performance',
      requirement: 5,
      points: 15
    },
    {
      id: 'streak_10',
      title: 'On Fire',
      description: 'Answer 10 questions correctly in a row',
      icon: Zap,
      color: Colors.error[600],
      category: 'performance',
      requirement: 10,
      points: 30
    },
    {
      id: 'accuracy_90',
      title: 'Consistent Performer',
      description: 'Maintain 90%+ accuracy across 10 quizzes',
      icon: TrendingUp,
      color: Colors.success[600],
      category: 'performance',
      requirement: 90,
      points: 40
    },

    // Dedication Achievements
    {
      id: 'daily_player',
      title: 'Daily Player',
      description: 'Play quizzes for 7 consecutive days',
      icon: Calendar,
      color: Colors.secondary[500],
      category: 'dedication',
      requirement: 7,
      points: 25
    },
    {
      id: 'time_invested',
      title: 'Time Invested',
      description: 'Spend 1 hour total in quizzes',
      icon: Clock,
      color: Colors.secondary[600],
      category: 'dedication',
      requirement: 3600, // 1 hour in seconds
      points: 30
    },
    {
      id: 'serious_student',
      title: 'Serious Student',
      description: 'Spend 10 hours total in quizzes',
      icon: Shield,
      color: Colors.secondary[700],
      category: 'dedication',
      requirement: 36000, // 10 hours in seconds
      points: 75
    },

    // Mastery Achievements
    {
      id: 'category_master',
      title: 'Category Master',
      description: 'Achieve 90%+ accuracy in all categories',
      icon: Star,
      color: Colors.warning[500],
      category: 'mastery',
      requirement: 90,
      points: 50
    },
    {
      id: 'level_6',
      title: 'Bible Master',
      description: 'Reach Level 6 (Master)',
      icon: Crown,
      color: Colors.cardColors.purple,
      category: 'mastery',
      requirement: 6,
      points: 100
    },
    {
      id: 'points_1000',
      title: 'Point Collector',
      description: 'Earn 1000 total points',
      icon: Award,
      color: Colors.warning[600],
      category: 'mastery',
      requirement: 1000,
      points: 60
    },
    {
      id: 'points_5000',
      title: 'Point Champion',
      description: 'Earn 5000 total points',
      icon: Trophy,
      color: Colors.warning[700],
      category: 'mastery',
      requirement: 5000,
      points: 150
    }
  ];

  // Calculate achievement progress based on stats
  const calculateAchievementProgress = (achievement: Omit<Achievement, 'currentProgress' | 'unlocked' | 'unlockedAt'>): Achievement => {
    let currentProgress = 0;
    let unlocked = false;

    switch (achievement.id) {
      case 'first_quiz':
      case 'quiz_enthusiast':
      case 'quiz_master':
      case 'bible_scholar':
        currentProgress = stats.totalGamesPlayed || 0;
        unlocked = currentProgress >= achievement.requirement;
        break;

      case 'perfect_score':
        currentProgress = stats.perfectScores || 0;
        unlocked = currentProgress >= achievement.requirement;
        break;

      case 'streak_5':
      case 'streak_10':
        currentProgress = stats.bestStreak || 0;
        unlocked = currentProgress >= achievement.requirement;
        break;

      case 'accuracy_90':
        currentProgress = stats.averageAccuracy || 0;
        unlocked = currentProgress >= achievement.requirement;
        break;

      case 'daily_player':
        currentProgress = stats.consecutiveDays || 0;
        unlocked = currentProgress >= achievement.requirement;
        break;

      case 'time_invested':
      case 'serious_student':
        currentProgress = stats.timeSpent || 0;
        unlocked = currentProgress >= achievement.requirement;
        break;

      case 'category_master':
        const categoryAccuracies = Object.values(stats.categoryStats || {}).map((cat: any) => cat.accuracy || 0);
        currentProgress = categoryAccuracies.length > 0 ? Math.min(...categoryAccuracies) : 0;
        unlocked = currentProgress >= achievement.requirement;
        break;

      case 'level_6':
        currentProgress = stats.currentLevel || 1;
        unlocked = currentProgress >= achievement.requirement;
        break;

      case 'points_1000':
      case 'points_5000':
        currentProgress = stats.totalPoints || 0;
        unlocked = currentProgress >= achievement.requirement;
        break;

      default:
        currentProgress = 0;
        unlocked = false;
    }

    return {
      ...achievement,
      currentProgress: Math.min(currentProgress, achievement.requirement),
      unlocked,
      unlockedAt: unlocked ? new Date() : undefined
    };
  };

  useEffect(() => {
    const updatedAchievements = allAchievements.map(calculateAchievementProgress);
    
    // Check for newly unlocked achievements
    const newlyUnlockedIds = updatedAchievements
      .filter(ach => ach.unlocked && !achievements.find(a => a.id === ach.id && a.unlocked))
      .map(ach => ach.id);

    if (newlyUnlockedIds.length > 0) {
      setNewlyUnlocked(newlyUnlockedIds);
      
      // Trigger celebration animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Notify parent component
      newlyUnlockedIds.forEach(achievementId => {
        const achievement = updatedAchievements.find(a => a.id === achievementId);
        if (achievement && onAchievementUnlocked) {
          onAchievementUnlocked(achievement);
        }
      });
    }

    setAchievements(updatedAchievements);
  }, [stats]);

  const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
    const progressPercentage = (achievement.currentProgress / achievement.requirement) * 100;
    const isNewlyUnlocked = newlyUnlocked.includes(achievement.id);

    return (
      <Animated.View 
        style={[
          styles.achievementCard,
          isNewlyUnlocked && { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <View style={[styles.achievementIcon, { backgroundColor: `${achievement.color}20` }]}>
          <achievement.icon size={24} color={achievement.color} />
        </View>
        
        <View style={styles.achievementContent}>
          <View style={styles.achievementHeader}>
            <Text style={styles.achievementTitle}>{achievement.title}</Text>
            {achievement.unlocked && (
              <View style={[styles.pointsBadge, { backgroundColor: achievement.color }]}>
                <Text style={styles.pointsText}>+{achievement.points}</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.achievementDescription}>{achievement.description}</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${progressPercentage}%`,
                    backgroundColor: achievement.color
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {achievement.unlocked ? 'Unlocked!' : `${achievement.currentProgress}/${achievement.requirement}`}
            </Text>
          </View>
        </View>

        {achievement.unlocked && (
          <View style={[styles.unlockedBadge, { backgroundColor: achievement.color }]}>
            <CheckCircle size={16} color="white" />
          </View>
        )}
      </Animated.View>
    );
  };

  const categoryIcons = {
    progress: BookOpen,
    performance: Target,
    dedication: Clock,
    mastery: Crown
  };

  const categoryColors = {
    progress: Colors.primary[500],
    performance: Colors.success[500],
    dedication: Colors.secondary[500],
    mastery: Colors.warning[500]
  };

  const categories = ['progress', 'performance', 'dedication', 'mastery'] as const;
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number]>('progress');

  const filteredAchievements = achievements.filter(ach => ach.category === selectedCategory);
  const unlockedCount = achievements.filter(ach => ach.unlocked).length;
  const totalPoints = achievements.filter(ach => ach.unlocked).reduce((sum, ach) => sum + ach.points, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.statsOverview}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{unlockedCount}</Text>
            <Text style={styles.statLabel}>Unlocked</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{achievements.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalPoints}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
        contentContainerStyle={styles.categoryFilterContent}
      >
        {categories.map(category => {
          const Icon = categoryIcons[category];
          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && [
                  styles.categoryButtonActive,
                  { backgroundColor: `${categoryColors[category]}20` }
                ]
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Icon 
                size={20} 
                color={selectedCategory === category ? categoryColors[category] : Colors.neutral[500]} 
              />
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && { color: categoryColors[category] }
              ]}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Achievements List */}
      <ScrollView style={styles.achievementsList}>
        {filteredAchievements.map(achievement => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
        
        {filteredAchievements.length === 0 && (
          <View style={styles.emptyState}>
            <Award size={48} color={Colors.neutral[300]} />
            <Text style={styles.emptyStateText}>No achievements in this category yet</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: 'white',
    ...Shadows.sm,
  },
  statsOverview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: 'bold',
    color: Colors.neutral[800],
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[500],
    marginTop: 4,
  },
  categoryFilter: {
    backgroundColor: 'white',
    ...Shadows.xs,
  },
  categoryFilterContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[100],
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary[50],
  },
  categoryButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '500',
    color: Colors.neutral[500],
  },
  achievementsList: {
    flex: 1,
    padding: Spacing.md,
  },
  achievementCard: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.sm,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  achievementContent: {
    flex: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.neutral[800],
    flex: 1,
  },
  pointsBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  pointsText: {
    fontSize: Typography.sizes.xs,
    fontWeight: 'bold',
    color: 'white',
  },
  achievementDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    marginBottom: Spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  progressText: {
    fontSize: Typography.sizes.xs,
    color: Colors.neutral[500],
    minWidth: 60,
    textAlign: 'right',
  },
  unlockedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: 'white',
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  emptyStateText: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[500],
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
