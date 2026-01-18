/**
 * Enhanced Bible Quiz Screen with Advanced Randomization
 * Uses the new enhanced quiz system for better question distribution
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';
import {
  ArrowLeft,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Target,
  Award,
  TrendingUp,
  Zap,
  Play,
  Brain,
  RefreshCw,
} from 'lucide-react-native';
import { useEnhancedQuiz } from '@/hooks/useEnhancedQuiz';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  currentStreak: number;
  score: number;
  timeElapsed: number;
}

export default function BibleQuizEnhancedScreen() {
  const {
    quizState,
    startQuiz,
    answerQuestion,
    nextQuestion,
    completeQuiz,
    getCurrentQuestion,
    getProgress,
    stats,
    loading
  } = useEnhancedQuiz();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;

  // State
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [quizStats, setQuizStats] = useState<QuizStats>({
    totalQuestions: 0,
    correctAnswers: 0,
    currentStreak: 0,
    score: 0,
    timeElapsed: 0,
  });
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionData, setCompletionData] = useState<any>(null);

  const currentQuestion = getCurrentQuestion();
  const progress = getProgress();

  // Debug logging
  useEffect(() => {
    console.log('Enhanced Quiz state:', {
      questionsCount: quizState.questions.length,
      currentIndex: quizState.currentQuestionIndex,
      isActive: quizState.isActive,
      currentQuestion: currentQuestion?.question,
      gameMode: quizState.gameMode
    });
  }, [quizState.questions.length, quizState.currentQuestionIndex, quizState.isActive, currentQuestion, quizState.gameMode]);

  // Initialize quiz
  useEffect(() => {
    initializeQuiz();
  }, []);

  // Entry animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentQuestion]);

  // Progress animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress.percentage / 100,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress.percentage]);

  // Timer effect
  useEffect(() => {
    if (!quizState.isActive || showResult) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quizState.isActive, showResult, currentQuestion, timeRemaining]);

  const initializeQuiz = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setStartTime(Date.now());
      console.log('Initializing enhanced quiz...');

      // Use enhanced quiz with learning optimization
      await startQuiz({
        gameMode: 'learning', // Use learning mode for better question variety
        questionCount: 15,
        timePerQuestion: 30
      });

      setTimeRemaining(30);
      setQuizStats({
        totalQuestions: 15,
        correctAnswers: 0,
        currentStreak: 0,
        score: 0,
        timeElapsed: 0,
      });
    } catch (err) {
      console.error('Error initializing enhanced quiz:', err);
      setError('Failed to load quiz questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeout = () => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(-1); // -1 indicates timeout
    setShowResult(true);

    setTimeout(() => {
      handleNextQuestion();
    }, 2000);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null || !quizState.isActive) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const isCorrect = answerIndex === currentQuestion?.correctAnswer;
    const timeBonus = Math.floor((timeRemaining / 30) * 50);
    const basePoints = isCorrect ? 100 : 0;
    const totalPoints = basePoints + (isCorrect ? timeBonus : 0);

    // Update local stats
    setQuizStats(prev => ({
      ...prev,
      totalQuestions: prev.totalQuestions + 1,
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      currentStreak: isCorrect ? prev.currentStreak + 1 : 0,
      score: prev.score + totalPoints,
      timeElapsed: Math.floor((Date.now() - startTime) / 1000),
    }));

    // Animate score
    Animated.spring(scoreAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start(() => {
      scoreAnim.setValue(0);
    });

    // Answer question in enhanced system
    answerQuestion(answerIndex);

    // Auto proceed after showing result
    setTimeout(() => {
      handleNextQuestion();
    }, 2500);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeRemaining(30);

    console.log('handleNextQuestion called:', {
      progressCurrent: progress.current,
      progressTotal: progress.total,
      quizStateIsCompleted: quizState.isCompleted,
      currentQuestionIndex: quizState.currentQuestionIndex,
      questionsLength: quizState.questions.length
    });

    if (progress.current >= progress.total || quizState.isCompleted) {
      console.log('Quiz completed, calling handleQuizComplete');
      handleQuizComplete();
    } else {
      console.log('Moving to next question');
      nextQuestion();

      // Reset animations for next question
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.9);

      // Restart entry animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleQuizComplete = async () => {
    const finalScore = quizStats.score;
    const accuracy = Math.round((quizStats.correctAnswers / quizStats.totalQuestions) * 100);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    await completeQuiz(finalScore, timeTaken);

    const getGradeInfo = () => {
      if (accuracy >= 90) return { grade: 'A+', color: '#10B981', emoji: '🏆', message: 'Outstanding!' };
      if (accuracy >= 80) return { grade: 'A', color: '#059669', emoji: '🌟', message: 'Excellent!' };
      if (accuracy >= 70) return { grade: 'B', color: '#0D9488', emoji: '👏', message: 'Great job!' };
      if (accuracy >= 60) return { grade: 'C', color: '#F59E0B', emoji: '👍', message: 'Good work!' };
      return { grade: 'D', color: '#EF4444', emoji: '📚', message: 'Keep studying!' };
    };

    const getLevelInfo = () => {
      const currentLevel = stats.currentLevel;
      const nextLevel = currentLevel < 6 ? currentLevel + 1 : currentLevel;
      const progressToNext = ((stats.totalScore % 1000) / 1000) * 100;

      return {
        currentLevel,
        nextLevel,
        progressToNext,
        isLevelUp: finalScore >= 100
      };
    };

    const gradeInfo = getGradeInfo();
    const levelInfo = getLevelInfo();

    const completionData = {
      finalScore,
      accuracy,
      gradeInfo,
      levelInfo,
      quizStats,
      timeTaken,
      enhancedFeatures: {
        questionVariety: 'Advanced randomization prevents repetition',
        learningOptimized: 'Questions tailored to your performance',
        persistentTracking: 'Progress saved across sessions'
      }
    };

    setCompletionData(completionData);
    setShowCompletionModal(true);
  };

  const getAnswerStyle = (index: number) => {
    if (!showResult) return styles.optionButton;

    if (index === currentQuestion?.correctAnswer) {
      return [styles.optionButton, styles.correctOption];
    }

    if (selectedAnswer === index && selectedAnswer !== currentQuestion?.correctAnswer) {
      return [styles.optionButton, styles.incorrectOption];
    }

    return [styles.optionButton, styles.disabledOption];
  };

  const getAnswerTextStyle = (index: number) => {
    if (!showResult) return styles.optionText;

    if (index === currentQuestion?.correctAnswer) {
      return [styles.optionText, styles.correctText];
    }

    if (selectedAnswer === index && selectedAnswer !== currentQuestion?.correctAnswer) {
      return [styles.optionText, styles.incorrectText];
    }

    return [styles.optionText, styles.disabledText];
  };

  const renderResultIcon = (index: number) => {
    if (!showResult) return null;

    if (index === currentQuestion?.correctAnswer) {
      return <CheckCircle size={24} color="#10B981" />;
    }

    if (selectedAnswer === index && selectedAnswer !== currentQuestion?.correctAnswer) {
      return <XCircle size={24} color="#EF4444" />;
    }

    return null;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={Colors.gradients.spiritualLight}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <Brain size={48} color={Colors.primary[600]} />
          <Text style={styles.loadingText}>Loading Enhanced Quiz...</Text>
          <Text style={styles.loadingSubtext}>Using advanced randomization for better learning</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={Colors.gradients.spiritualLight}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={initializeQuiz}>
            <RefreshCw size={20} color="white" />
            <Text style={styles.retryButtonText}>Retry Enhanced Quiz</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQuestion || quizState.isCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={Colors.gradients.spiritualLight}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {quizState.isCompleted ? 'Enhanced Quiz completed!' : 'No questions available. Please try again.'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={initializeQuiz}>
            <Text style={styles.retryButtonText}>Play Enhanced Quiz Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Enhanced features indicator
  const renderEnhancedFeatures = () => (
    <View style={styles.enhancedFeatures}>
      <View style={styles.featureBadge}>
        <Brain size={16} color={Colors.success[600]} />
        <Text style={styles.featureText}>Smart Randomization</Text>
      </View>
      <View style={styles.featureBadge}>
        <TrendingUp size={16} color={Colors.success[600]} />
        <Text style={styles.featureText}>Learning Optimized</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <LinearGradient
        colors={Colors.gradients.spiritualLight}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/')}
        >
          <ArrowLeft size={24} color={Colors.neutral[600]} />
        </TouchableOpacity>

        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>Enhanced Bible Quiz</Text>
          {renderEnhancedFeatures()}
        </View>

        <View style={styles.headerStats}>
          <Trophy size={20} color={Colors.warning[500]} />
          <Text style={styles.headerScore}>{stats.totalScore}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {progress.current} / {progress.total}
        </Text>
      </View>

      {/* Question Card */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          style={[
            styles.questionCard,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <LinearGradient
            colors={Colors.gradients.primary}
            style={styles.questionGradient}
          >
            <View style={styles.questionHeader}>
              <View style={styles.questionMeta}>
                <Text style={styles.difficultyBadge}>
                  {currentQuestion.difficulty.toUpperCase()}
                </Text>
                <Text style={styles.categoryBadge}>
                  {currentQuestion.category}
                </Text>
              </View>
              <View style={styles.timerContainer}>
                <Clock size={20} color="white" />
                <Text style={styles.timerText}>{timeRemaining}s</Text>
              </View>
            </View>

            <Text style={styles.questionText}>{currentQuestion.question}</Text>

            {currentQuestion.verse && (
              <View style={styles.verseContainer}>
                <Text style={styles.verseText}>{currentQuestion.verse}</Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options?.map((option: string, index: number) => (
            <Animated.View
              key={index}
              style={[
                getAnswerStyle(index),
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 50],
                        outputRange: [0, index * 10]
                      })
                    }
                  ]
                }
              ]}
            >
              <TouchableOpacity
                style={styles.optionTouchable}
                onPress={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionLeft}>
                    <View style={styles.optionLetter}>
                      <Text style={styles.optionLetterText}>
                        {String.fromCharCode(65 + index)}
                      </Text>
                    </View>
                    <Text style={getAnswerTextStyle(index)}>{option}</Text>
                  </View>
                  {renderResultIcon(index)}
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>



        {/* Current Stats */}
        <View style={styles.currentStats}>
          <View style={styles.statCard}>
            <Text style={styles.statCardLabel}>Score</Text>
            <Text style={styles.statCardValue}>{quizStats.score}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statCardLabel}>Streak</Text>
            <Text style={styles.statCardValue}>{quizStats.currentStreak}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statCardLabel}>Correct</Text>
            <Text style={styles.statCardValue}>{quizStats.correctAnswers}/{quizStats.totalQuestions}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 10 : (StatusBar.currentHeight || 0) + 10,
    paddingBottom: Spacing.md,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  headerScore: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.warning[500],
  },
  enhancedFeatures: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.success[50],
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  featureText: {
    fontSize: Typography.sizes.xs,
    color: Colors.success[700],
    fontWeight: Typography.weights.medium,
  },
  progressContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.full,
  },
  progressText: {
    textAlign: 'center',
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    marginTop: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  questionCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    ...Shadows.lg,
  },
  questionGradient: {
    padding: Spacing.xl,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  questionMeta: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  difficultyBadge: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  categoryBadge: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  timerText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: 'white',
  },
  questionText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: 'white',
    lineHeight: Typography.lineHeights.relaxed,
    marginBottom: Spacing.md,
  },
  verseContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  verseText: {
    fontSize: Typography.sizes.sm,
    color: 'white',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  optionsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  optionButton: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  optionTouchable: {
    padding: Spacing.lg,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.primary[600],
  },
  optionText: {
    fontSize: Typography.sizes.lg,
    color: Colors.neutral[700],
    flex: 1,
  },
  correctOption: {
    backgroundColor: Colors.success[50],
    borderColor: Colors.success[200],
    borderWidth: 2,
  },
  incorrectOption: {
    backgroundColor: Colors.error[50],
    borderColor: Colors.error[200],
    borderWidth: 2,
  },
  disabledOption: {
    opacity: 0.7,
  },
  correctText: {
    color: Colors.success[700],
    fontWeight: Typography.weights.bold,
  },
  incorrectText: {
    color: Colors.error[700],
    fontWeight: Typography.weights.bold,
  },
  disabledText: {
    color: Colors.neutral[500],
  },
  extraTimeContainer: {
    marginBottom: Spacing.lg,
  },
  extraTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.warning[500],
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  extraTimeText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: 'white',
  },
  currentStats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statCardLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    marginBottom: Spacing.xs,
  },
  statCardValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary[600],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[700],
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  loadingSubtext: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: Typography.sizes.lg,
    color: Colors.error[600],
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary[500],
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  retryButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: 'white',
  },
});