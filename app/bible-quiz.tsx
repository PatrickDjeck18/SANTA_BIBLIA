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
import { AppTheme } from '@/constants/AppTheme';
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
} from 'lucide-react-native';
import { useQuizDatabase } from '@/hooks/useQuizDatabase';
import { AdManager } from '../lib/adMobService';
import { ADS_CONFIG } from '../lib/adsConfig';
import BannerAd from '@/components/BannerAd';
import { useInterstitialAds } from '@/hooks/useInterstitialAds';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  currentStreak: number;
  score: number;
  timeElapsed: number;
}

// Real AdMob Rewarded Ad Service
const rewardedAdService = AdManager.getRewarded(ADS_CONFIG.ADMOB.REWARDED_ID);

export default function BibleQuizScreen() {
  const { showInterstitialAd } = useInterstitialAds('quiz');
  const {
    quizState,
    startQuiz,
    answerQuestion,
    nextQuestion,
    completeQuiz,
    getCurrentQuestion,
    getProgress,
    stats,
    loading,
  } = useQuizDatabase();

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
  const [showRewardAdButton, setShowRewardAdButton] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [extraTimeUsed, setExtraTimeUsed] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionData, setCompletionData] = useState<any>(null);

  const currentQuestion = getCurrentQuestion();
  const progress = getProgress();

  // Debug logging
  useEffect(() => {
    console.log('Quiz state:', {
      questionsCount: quizState.questions.length,
      currentIndex: quizState.currentQuestionIndex,
      isActive: quizState.isActive,
      currentQuestion: currentQuestion?.question
    });
  }, [quizState.questions.length, quizState.currentQuestionIndex, quizState.isActive, currentQuestion]);

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

    // Show reward ad button when time is running low and not already used
    if (timeRemaining <= 10 && !extraTimeUsed && !showRewardAdButton) {
      setShowRewardAdButton(true);
    }

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
  }, [quizState.isActive, showResult, currentQuestion, timeRemaining, extraTimeUsed, showRewardAdButton]);

  // Handle watching reward ad for extra time
  const handleWatchRewardAd = async () => {
    setIsAdLoading(true);
    try {
      const result = await rewardedAdService.showAd();
      if (result.success) {
        // Add 15 seconds extra time
        setTimeRemaining(prev => prev + 15);
        setExtraTimeUsed(true);
        setShowRewardAdButton(false);
        Alert.alert('Extra Time!', 'You gained 15 seconds extra time!', [{ text: 'OK' }]);
      } else {
        Alert.alert('Ad Error', 'Failed to load the ad. Please try again.', [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      Alert.alert('Ad Error', 'Failed to load the ad. Please try again.', [{ text: 'OK' }]);
    } finally {
      setIsAdLoading(false);
    }
  };

  const initializeQuiz = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setStartTime(Date.now());
      console.log('Initializing quiz...');

      // Start in level mode so questions vary by level and difficulty
      await startQuiz({
        questionCount: 10
      });
      // Reset local stats/time; actual counts/time come from level config in hook
      setTimeRemaining(30);
      setQuizStats({
        totalQuestions: 0,
        correctAnswers: 0,
        currentStreak: 0,
        score: 0,
        timeElapsed: 0,
      });
    } catch (err) {
      console.error('Error initializing quiz:', err);
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

    // Answer question in database
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
      // Import the level system to get accurate level data
      const { LEVEL_SYSTEM, getCurrentLevel, getNextLevel, getProgressToNextLevel } = require('@/constants/QuizQuestions');

      const newTotalScore = stats.totalScore + finalScore;
      const currentLevel = getCurrentLevel(newTotalScore);
      const nextLevel = getNextLevel(newTotalScore);
      const progressToNext = getProgressToNextLevel(newTotalScore);

      return {
        currentLevel: currentLevel.level,
        currentLevelData: currentLevel,
        nextLevelScore: nextLevel?.requiredScore || currentLevel.requiredScore,
        progressToNext,
        isLevelUp: nextLevel && currentLevel.level !== nextLevel.level
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
      newTotalScore: stats.totalScore + finalScore
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
          colors={AppTheme.gradients.background}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Quiz Questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={AppTheme.gradients.background}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={initializeQuiz}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQuestion || quizState.isCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={AppTheme.gradients.background}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {quizState.isCompleted ? 'Quiz completed!' : 'No questions available. Please try again.'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={initializeQuiz}>
            <Text style={styles.retryButtonText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Completion Modal Component
  const renderCompletionModal = () => {
    if (!showCompletionModal || !completionData) return null;

    const { finalScore, accuracy, gradeInfo, levelInfo, quizStats, timeTaken, newTotalScore } = completionData;

    // Get current level from the LEVEL_SYSTEM using the correct score
    const getCurrentLevelFromScore = (score: number) => {
      const { LEVEL_SYSTEM } = require('@/constants/QuizQuestions');
      let currentLevel = LEVEL_SYSTEM[0];
      for (const level of LEVEL_SYSTEM) {
        if (score >= level.requiredScore) {
          currentLevel = level;
        } else {
          break;
        }
      }
      return currentLevel;
    };

    const getNextLevelFromScore = (score: number) => {
      const { LEVEL_SYSTEM } = require('@/constants/QuizQuestions');
      const currentLevel = getCurrentLevelFromScore(score);
      const nextIndex = currentLevel.level;
      return nextIndex < LEVEL_SYSTEM.length ? LEVEL_SYSTEM[nextIndex] : null;
    };

    const currentLevelData = getCurrentLevelFromScore(newTotalScore);
    const nextLevelData = getNextLevelFromScore(newTotalScore);
    const progressToNext = levelInfo.progressToNext;
    const isLevelUp = nextLevelData && currentLevelData.level !== nextLevelData.level;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header with gradient */}
          <LinearGradient
            colors={isLevelUp
              ? [Colors.success[400], Colors.success[600]]
              : [Colors.primary[400], Colors.primary[600]]
            }
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>
              {isLevelUp ? '🎉 Level Up!' : 'Quiz Complete!'} {gradeInfo.emoji}
            </Text>
            <Text style={styles.modalSubtitle}>
              {isLevelUp ? 'Amazing progress!' : 'Great job on completing the quiz!'}
            </Text>
          </LinearGradient>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Score Summary - Mobile optimized */}
            <View style={styles.scoreSection}>
              <Text style={styles.sectionTitle}>Final Score</Text>
              <View style={styles.scoreContainer}>
                <Text style={styles.finalScore}>{finalScore}</Text>
                <Text style={styles.scoreLabel}>points earned</Text>
              </View>
            </View>

            {/* Performance Stats - Improved mobile layout */}
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Performance</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItemModal}>
                  <View style={styles.statIconContainer}>
                    <Target size={20} color={Colors.primary[600]} />
                  </View>
                  <Text style={styles.statValue}>{accuracy}%</Text>
                  <Text style={styles.statLabel}>Accuracy</Text>
                </View>
                <View style={styles.statItemModal}>
                  <View style={styles.statIconContainer}>
                    <CheckCircle size={20} color={Colors.success[600]} />
                  </View>
                  <Text style={styles.statValue}>{quizStats.correctAnswers}</Text>
                  <Text style={styles.statLabel}>Correct</Text>
                </View>
                <View style={styles.statItemModal}>
                  <View style={styles.statIconContainer}>
                    <Clock size={20} color={Colors.warning[600]} />
                  </View>
                  <Text style={styles.statValue}>{Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, '0')}</Text>
                  <Text style={styles.statLabel}>Time</Text>
                </View>
                <View style={styles.statItemModal}>
                  <View style={styles.statIconContainer}>
                    <Zap size={20} color={Colors.error[600]} />
                  </View>
                  <Text style={styles.statValue}>{quizStats.currentStreak}</Text>
                  <Text style={styles.statLabel}>Best Streak</Text>
                </View>
              </View>
            </View>

            {/* Grade Section - Mobile friendly */}
            <View style={styles.gradeSection}>
              <Text style={styles.sectionTitle}>Grade</Text>
              <View style={styles.gradeContainer}>
                <View style={[styles.gradeBadge, { backgroundColor: gradeInfo.color + '20' }]}>
                  <Text style={[styles.gradeText, { color: gradeInfo.color }]}>
                    {gradeInfo.grade}
                  </Text>
                </View>
                <Text style={styles.gradeMessage}>{gradeInfo.message}</Text>
              </View>
            </View>

            {/* Level Progress - Updated with correct data */}
            <View style={styles.levelSection}>
              <Text style={styles.sectionTitle}>Level Progress</Text>

              <View style={styles.levelInfo}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>{currentLevelData.badge}</Text>
                  <Text style={styles.levelNameText}>{currentLevelData.name}</Text>
                </View>
                <View style={styles.levelProgressContainer}>
                  <Text style={styles.levelProgressText}>
                    Level {currentLevelData.level}
                  </Text>
                  <Text style={styles.levelXPText}>
                    {newTotalScore} XP
                  </Text>
                </View>
              </View>

              <View style={styles.levelBar}>
                <View
                  style={[
                    styles.levelFill,
                    {
                      width: `${progressToNext}%`,
                      backgroundColor: isLevelUp ? Colors.success[500] : Colors.primary[500]
                    }
                  ]}
                />
              </View>

              <View style={styles.levelDetails}>
                <Text style={styles.levelDescription}>{currentLevelData.description}</Text>
                {nextLevelData && (
                  <Text style={styles.nextLevelText}>
                    {isLevelUp
                      ? `🎉 Congratulations! You've advanced to ${nextLevelData.name}!`
                      : `${nextLevelData.requiredScore - newTotalScore} XP to ${nextLevelData.name}`
                    }
                  </Text>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons - Mobile optimized */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.playAgainButton]}
              onPress={async () => {
                setShowCompletionModal(false);
                setCompletionData(null);
                // Add a small delay to show the modal closing before starting new quiz
                setTimeout(() => {
                  initializeQuiz();
                }, 300);
              }}
              activeOpacity={0.8}
            >
              <Play size={20} color={Colors.neutral[50]} />
              <Text style={styles.actionButtonText}>Play Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.menuButton]}
              onPress={() => {
                setShowCompletionModal(false);
                setCompletionData(null);
                router.replace('/');
              }}
              activeOpacity={0.8}
            >
              <ArrowLeft size={20} color={Colors.neutral[700]} />
              <Text style={styles.menuButtonText}>Back to Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Background Gradient */}
      <LinearGradient
        colors={AppTheme.gradients.background}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Completion Modal */}
      {renderCompletionModal()}

      {/* Header */}
      <View style={styles.hero}>
        <LinearGradient
          colors={AppTheme.gradients.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.heroContent}>
            <TouchableOpacity
              style={styles.heroBackButton}
              onPress={() => router.replace('/')}
            >
              <ArrowLeft size={20} color={AppTheme.accent.primary} />
            </TouchableOpacity>
            <View style={styles.heroTextBlock}>
              <Text style={styles.heroTitle}>Bible Quiz</Text>
            </View>
            <View style={styles.heroActions}>
              {/* Space for future actions */}
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.headerStats}>
        <View style={styles.statItem}>
          <Target size={16} color={AppTheme.accent.primary} />
          <Text style={styles.statText}>{progress.current}/{progress.total}</Text>
        </View>

        <View style={styles.statItem}>
          <Trophy size={16} color={Colors.warning[600]} />
          <Text style={styles.statText}>{quizStats.score}</Text>
        </View>

        <View style={styles.statItem}>
          <Clock size={16} color={timeRemaining <= 10 ? Colors.error[600] : Colors.success[600]} />
          <Text style={[styles.statText, { color: timeRemaining <= 10 ? Colors.error[600] : Colors.success[600] }]}>
            {timeRemaining}s
          </Text>
        </View>
      </View>

      {/* Banner Ad */}
      <BannerAd placement="quiz" />

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
          Question {progress.current} of {progress.total}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Question Card */}
        <Animated.View
          style={[
            styles.questionCard,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
            style={styles.cardGradient}
          >
            {/* Question */}
            <Text style={styles.questionText}>
              {currentQuestion.question}
            </Text>

            {/* Bible Reference */}
            {currentQuestion.verse && (
              <View style={styles.verseContainer}>
                <Text style={styles.verseText}>
                  {currentQuestion.verse}
                </Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        {/* Answer Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options?.map((option: string, index: number) => (
            <Animated.View
              key={index}
              style={[
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateX: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={getAnswerStyle(index)}
                onPress={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
                activeOpacity={0.8}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionLeft}>
                    <View style={styles.optionLetter}>
                      <Text style={styles.optionLetterText}>
                        {String.fromCharCode(65 + index)}
                      </Text>
                    </View>
                    <Text style={getAnswerTextStyle(index)}>
                      {option}
                    </Text>
                  </View>
                  {renderResultIcon(index)}
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Score Animation */}
        {showResult && selectedAnswer !== null && selectedAnswer !== -1 && (
          <Animated.View
            style={[
              styles.scorePopup,
              {
                opacity: scoreAnim,
                transform: [
                  {
                    scale: scoreAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                  {
                    translateY: scoreAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={selectedAnswer === currentQuestion?.correctAnswer
                ? [Colors.success[400], Colors.success[600]]
                : [Colors.error[400], Colors.error[600]]
              }
              style={styles.scorePopupGradient}
            >
              <Text style={styles.scorePopupText}>
                {selectedAnswer === currentQuestion?.correctAnswer
                  ? `+${100 + Math.floor((timeRemaining / 30) * 50)} points!`
                  : 'Try again!'
                }
              </Text>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Current Stats */}
        <View style={styles.currentStats}>
          <View style={styles.statCard}>
            <Star size={20} color={Colors.warning[600]} />
            <Text style={styles.statCardLabel}>Streak</Text>
            <Text style={styles.statCardValue}>{quizStats.currentStreak}</Text>
          </View>

          <View style={styles.statCard}>
            <TrendingUp size={20} color={Colors.success[600]} />
            <Text style={styles.statCardLabel}>Accuracy</Text>
            <Text style={styles.statCardValue}>
              {quizStats.totalQuestions > 0
                ? Math.round((quizStats.correctAnswers / quizStats.totalQuestions) * 100)
                : 0}%
            </Text>
          </View>

          <View style={styles.statCard}>
            <Award size={20} color={Colors.primary[600]} />
            <Text style={styles.statCardLabel}>Best Score</Text>
            <Text style={styles.statCardValue}>{stats.totalScore}</Text>
          </View>
        </View>

        {/* Banner Ad below stats */}
        <BannerAd placement="quiz" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[700],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0) + Spacing.md,
    paddingBottom: Spacing.md,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[700],
  },
  progressContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
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
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[500],
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  questionCard: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  cardGradient: {
    padding: Spacing.lg,
  },
  questionText: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  verseContainer: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  verseText: {
    fontSize: Typography.sizes.base,
    fontStyle: 'italic',
    color: Colors.neutral[600],
  },
  optionsContainer: {
    gap: Spacing.md,
  },
  optionButton: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    padding: Spacing.md,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  optionLetterText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.primary[600],
  },
  optionText: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
    flex: 1,
  },
  correctOption: {
    backgroundColor: Colors.success[50],
    borderColor: Colors.success[500],
  },
  correctText: {
    color: Colors.success[800],
    fontWeight: Typography.weights.bold,
  },
  incorrectOption: {
    backgroundColor: Colors.error[50],
    borderColor: Colors.error[500],
  },
  incorrectText: {
    color: Colors.error[800],
    fontWeight: Typography.weights.bold,
  },
  disabledOption: {
    backgroundColor: Colors.neutral[100],
    borderColor: Colors.neutral[200],
    opacity: 0.7,
  },
  disabledText: {
    color: Colors.neutral[500],
  },
  scorePopup: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scorePopupGradient: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    ...Shadows.lg,
  },
  scorePopupText: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[50],
  },
  currentStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: BorderRadius.lg,
  },
  statCard: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statCardLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
  },
  statCardValue: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: Typography.sizes.lg,
    color: Colors.error[700],
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retryButton: {
    backgroundColor: Colors.primary[600],
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  retryButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[50],
  },
  // Hero Header Styles
  hero: {
    paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0) + Spacing.md,
    paddingBottom: Spacing.lg,
  },
  heroGradient: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg,
    ...Shadows.md,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTextBlock: {
    flex: 1,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    lineHeight: Typography.lineHeights.base,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  heroBackButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  heroActionButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  // Reward Ad Styles
  rewardAdContainer: {
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  rewardAdButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  rewardAdGradient: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardAdContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rewardAdText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[50],
  },
  // Modal Styles - Mobile Optimized
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    paddingTop: Platform.OS === 'ios' ? 40 : 0,
  },
  modalContent: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.xl,
    width: Math.min(screenWidth * 0.95, 400), // Max width for better mobile experience
    maxHeight: screenHeight * 0.9,
    overflow: 'hidden',
    ...Shadows.xl,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.md,
  },
  modalHeader: {
    padding: Spacing.lg,
    alignItems: 'center',
    paddingBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[50],
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[100],
    textAlign: 'center',
    opacity: 0.9,
  },
  modalBody: {
    padding: Spacing.md,
    maxHeight: screenHeight * 0.6,
    paddingBottom: Spacing.sm,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[700],
    marginBottom: Spacing.md,
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  finalScore: {
    fontSize: Math.min(screenWidth * 0.15, 60), // Responsive font size
    fontWeight: Typography.weights.bold,
    color: Colors.primary[600],
    lineHeight: Math.min(screenWidth * 0.15, 60) * 1.2,
  },
  scoreLabel: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    marginTop: Spacing.xs,
  },
  statsSection: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  statItemModal: {
    width: '48%',
    backgroundColor: Colors.neutral[100],
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.xs,
    minHeight: 90,
    justifyContent: 'center',
    ...Shadows.sm,
  },
  statIconContainer: {
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.primary[600],
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  gradeSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  gradeContainer: {
    alignItems: 'center',
    width: '100%',
  },
  gradeBadge: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
    ...Shadows.md,
  },
  gradeText: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
  },
  gradeMessage: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: Typography.sizes.base * 1.4,
  },
  levelSection: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  levelBadgeText: {
    fontSize: Typography.sizes['2xl'],
  },
  levelNameText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[700],
  },
  levelProgressContainer: {
    alignItems: 'flex-end',
  },
  levelProgressText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[700],
  },
  levelXPText: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
  },
  levelBar: {
    height: 10,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  levelFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  levelDetails: {
    backgroundColor: Colors.neutral[50],
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  levelDescription: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
    textAlign: 'center',
    marginBottom: Spacing.sm,
    fontStyle: 'italic',
  },
  nextLevelText: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    textAlign: 'center',
    fontWeight: Typography.weights.medium,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.neutral[50],
    paddingBottom: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    minHeight: 52, // Better touch target for mobile
    ...Shadows.sm,
  },
  playAgainButton: {
    backgroundColor: Colors.primary[600],
  },
  menuButton: {
    backgroundColor: Colors.neutral[200],
  },
  actionButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[50],
  },
  menuButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[700],
  },
});
