/**
 * Enhanced Quiz Hook with Advanced Randomization
 * Combines Supabase integration with advanced question randomization
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabase';
import { QuizQuestion, QuizCategory } from '@/constants/QuizQuestions';
import {
  getEnhancedRandomQuestions,
  getEnhancedQuestionsForLevel,
  getLearningOptimizedQuestions,
  getBalancedMixedQuestions,
  trackQuestionUsage,
  resetQuestionTracking
} from '@/constants/QuizQuestionsEnhanced';
import { LEVEL_SYSTEM, getCurrentLevel, getNextLevel } from '@/constants/QuizQuestions';

export interface QuizState {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  score: number;
  totalQuestions: number;
  timeRemaining: number;
  isActive: boolean;
  isCompleted: boolean;
  selectedAnswer: number | null;
  showExplanation: boolean;
  streak: number;
  correctAnswers: number;
  wrongAnswers: number;
  gameMode: 'timed' | 'endless' | 'category' | 'mixed' | 'level' | 'learning';
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  category: QuizCategory | 'mixed';
  testament: 'old' | 'new' | 'both';
  currentLevel?: number;
  totalScore: number;
}

export interface QuizStats {
  totalGamesPlayed: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  bestStreak: number;
  averageScore: number;
  totalScore: number;
  currentLevel: number;
  favoriteCategory: QuizCategory;
  totalTimeSpentSeconds: number;
  categoryStats: Record<QuizCategory, {
    played: number;
    correct: number;
    accuracy: number;
  }>;
  difficultyStats: {
    easy: { played: number; correct: number; accuracy: number };
    medium: { played: number; correct: number; accuracy: number };
    hard: { played: number; correct: number; accuracy: number };
  };
}

const INITIAL_QUIZ_STATE: QuizState = {
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  totalQuestions: 20,
  timeRemaining: 30,
  isActive: false,
  isCompleted: false,
  selectedAnswer: null,
  showExplanation: false,
  streak: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  gameMode: 'mixed',
  difficulty: 'mixed',
  category: 'mixed',
  testament: 'both',
  totalScore: 0
};

export const useEnhancedQuiz = () => {
  const { user } = useAuth();
  const [quizState, setQuizState] = useState<QuizState>(INITIAL_QUIZ_STATE);
  const [stats, setStats] = useState<QuizStats>({
    totalGamesPlayed: 0,
    totalQuestionsAnswered: 0,
    totalCorrectAnswers: 0,
    bestStreak: 0,
    averageScore: 0,
    totalScore: 0,
    currentLevel: 1,
    favoriteCategory: 'mixed' as QuizCategory,
    totalTimeSpentSeconds: 0,
    categoryStats: {} as any,
    difficultyStats: {
      easy: { played: 0, correct: 0, accuracy: 0 },
      medium: { played: 0, correct: 0, accuracy: 0 },
      hard: { played: 0, correct: 0, accuracy: 0 }
    }
  });
  const [loading, setLoading] = useState(false);

  // Load user stats from Supabase on mount
  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      if (!user) return;

      const { data: userStats, error } = await supabase
        .from('user_quiz_stats')
        .select('*')
        .eq('user_id', user.uid)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user stats:', error);
        return;
      }

      if (userStats) {
        const currentLevel = getCurrentLevel(userStats.best_score || 0);
        
        const newStats: QuizStats = {
          totalGamesPlayed: userStats.total_sessions || 0,
          totalQuestionsAnswered: userStats.total_questions_answered || 0,
          totalCorrectAnswers: userStats.total_correct_answers || 0,
          bestStreak: userStats.longest_streak || 0,
          averageScore: userStats.total_questions_answered > 0
            ? (userStats.total_correct_answers / userStats.total_questions_answered) * 100
            : 0,
          totalScore: userStats.best_score || 0,
          currentLevel: currentLevel.level,
          favoriteCategory: userStats.favorite_category || 'mixed',
          totalTimeSpentSeconds: userStats.total_time_spent_seconds || 0,
          categoryStats: userStats.category_stats || {},
          difficultyStats: userStats.difficulty_stats || {
            easy: { played: 0, correct: 0, accuracy: 0 },
            medium: { played: 0, correct: 0, accuracy: 0 },
            hard: { played: 0, correct: 0, accuracy: 0 }
          }
        };
        setStats(newStats);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  // Start a new quiz with enhanced randomization
  const startQuiz = useCallback(async (options: {
    gameMode?: 'timed' | 'endless' | 'category' | 'mixed' | 'level' | 'learning';
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
    category?: QuizCategory | 'mixed';
    testament?: 'old' | 'new' | 'both';
    questionCount?: number;
    timePerQuestion?: number;
    level?: number;
    focusAreas?: {
      categories?: QuizCategory[];
      difficulties?: ('easy' | 'medium' | 'hard')[];
    };
  } = {}) => {
    const {
      gameMode = 'mixed',
      difficulty = 'mixed',
      category = 'mixed',
      testament = 'both',
      questionCount = 20,
      timePerQuestion = 30,
      level,
      focusAreas
    } = options;

    try {
      setLoading(true);

      let questions: QuizQuestion[] = [];

      // Use appropriate question selection based on game mode
      switch (gameMode) {
        case 'learning':
          questions = await getLearningOptimizedQuestions(
            questionCount,
            focusAreas
          );
          break;
        
        case 'level':
          if (level !== undefined) {
            questions = await getEnhancedQuestionsForLevel(level, {
              category: category !== 'mixed' ? category : undefined,
              testament
            });
          } else {
            questions = await getEnhancedRandomQuestions(
              questionCount,
              {
                difficulty: difficulty !== 'mixed' ? difficulty : undefined,
                category: category !== 'mixed' ? category : undefined,
                testament
              }
            );
          }
          break;
        
        case 'endless':
          questions = await getEnhancedRandomQuestions(
            50,
            {
              difficulty: difficulty !== 'mixed' ? difficulty : undefined,
              category: category !== 'mixed' ? category : undefined,
              testament
            },
            level
          );
          break;
        
        default:
          questions = await getEnhancedRandomQuestions(
            questionCount,
            {
              difficulty: difficulty !== 'mixed' ? difficulty : undefined,
              category: category !== 'mixed' ? category : undefined,
              testament
            },
            level
          );
      }

      console.log(`Starting enhanced quiz with ${questions.length} questions`);

      setQuizState({
        ...INITIAL_QUIZ_STATE,
        questions,
        totalQuestions: gameMode === 'endless' ? questions.length : questionCount,
        timeRemaining: timePerQuestion,
        isActive: true,
        gameMode,
        difficulty,
        category,
        testament,
        currentLevel: level,
        totalScore: stats.totalScore
      });
    } catch (error) {
      console.error('Error starting enhanced quiz:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [stats.totalScore]);

  // Answer a question with enhanced tracking
  const answerQuestion = useCallback(async (answerIndex: number) => {
    if (!quizState.isActive || quizState.selectedAnswer !== null || quizState.isCompleted) return;

    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    if (!currentQuestion) return;

    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    // Calculate points based on difficulty and time
    let points = 0;
    if (isCorrect) {
      const basePoints = currentQuestion.difficulty === 'easy' ? 100 :
                        currentQuestion.difficulty === 'medium' ? 150 : 200;
      const timeBonus = quizState.gameMode === 'timed'
        ? Math.floor((quizState.timeRemaining / 30) * 20)
        : 0;
      points = basePoints + timeBonus;
    }

    // Track question usage with enhanced system
    try {
      await trackQuestionUsage(currentQuestion.id, currentQuestion, isCorrect);
    } catch (error) {
      console.warn('Enhanced question tracking failed (non-critical):', error);
    }

    setQuizState(prev => ({
      ...prev,
      selectedAnswer: answerIndex,
      score: prev.score + points,
      streak: isCorrect ? prev.streak + 1 : 0,
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      wrongAnswers: prev.wrongAnswers + (isCorrect ? 0 : 1),
      showExplanation: true,
      isActive: false
    }));
  }, [quizState.isActive, quizState.selectedAnswer, quizState.currentQuestionIndex, quizState.questions, quizState.timeRemaining, quizState.gameMode]);

  // Move to next question
  const nextQuestion = useCallback(() => {
    setQuizState(prev => {
      const nextIndex = prev.currentQuestionIndex + 1;
      const isLastQuestion = nextIndex >= prev.totalQuestions;

      if (isLastQuestion) {
        // Quiz completed
        return {
          ...prev,
          isCompleted: true,
          showExplanation: false
        };
      }

      // Move to next question
      return {
        ...prev,
        currentQuestionIndex: nextIndex,
        selectedAnswer: null,
        showExplanation: false,
        isActive: true,
        timeRemaining: prev.gameMode === 'timed' ? 30 : prev.timeRemaining
      };
    });
  }, []);

  // Complete quiz and save results
  const completeQuiz = useCallback(async (finalScore: number, timeTaken: number) => {
    try {
      if (!user) return;

      const sessionData = {
        user_id: user.uid,
        questions_answered: quizState.totalQuestions,
        correct_answers: quizState.correctAnswers,
        wrong_answers: quizState.wrongAnswers,
        total_score: finalScore,
        category: quizState.category,
        difficulty: quizState.difficulty,
        time_taken_seconds: timeTaken,
        completed_at: new Date().toISOString(),
        game_mode: quizState.gameMode
      };

      // Save quiz session
      const { error: sessionError } = await supabase
        .from('quiz_sessions')
        .insert([sessionData]);

      if (sessionError) {
        console.error('Error saving quiz session:', sessionError);
      }

      // Update user stats - only save highest score
      const newTotalSessions = stats.totalGamesPlayed + 1;
      const newTotalQuestions = stats.totalQuestionsAnswered + quizState.totalQuestions;
      const newTotalCorrect = stats.totalCorrectAnswers + quizState.correctAnswers;
      const newTotalScore = Math.max(stats.totalScore, finalScore); // Only keep highest score
      const newCurrentStreak = quizState.streak > stats.bestStreak ? quizState.streak : stats.bestStreak;
      const newLongestStreak = Math.max(stats.bestStreak, quizState.streak);
      const newTotalTime = stats.totalTimeSpentSeconds + timeTaken;

      // Update category stats
      const categoryKey = quizState.category as QuizCategory;
      const currentCategoryStats = stats.categoryStats[categoryKey] || { played: 0, correct: 0, accuracy: 0 };
      const newCategoryStats = {
        ...stats.categoryStats,
        [categoryKey]: {
          played: currentCategoryStats.played + 1,
          correct: currentCategoryStats.correct + quizState.correctAnswers,
          accuracy: ((currentCategoryStats.correct + quizState.correctAnswers) / (currentCategoryStats.played + 1)) * 100
        }
      };

      // Update difficulty stats
      const difficultyKey = quizState.difficulty;
      const currentDifficultyStats = stats.difficultyStats[difficultyKey as keyof typeof stats.difficultyStats] || { played: 0, correct: 0, accuracy: 0 };
      const newDifficultyStats = {
        ...stats.difficultyStats,
        [difficultyKey]: {
          played: currentDifficultyStats.played + 1,
          correct: currentDifficultyStats.correct + quizState.correctAnswers,
          accuracy: ((currentDifficultyStats.correct + quizState.correctAnswers) / (currentDifficultyStats.played + 1)) * 100
        }
      };

      // Update local stats - only update score if it's higher
      setStats(prev => ({
        ...prev,
        totalGamesPlayed: newTotalSessions,
        totalQuestionsAnswered: newTotalQuestions,
        totalCorrectAnswers: newTotalCorrect,
        totalScore: newTotalScore, // This will only increase, never decrease
        bestStreak: newLongestStreak,
        currentLevel: getCurrentLevel(newTotalScore).level,
        favoriteCategory: categoryKey,
        totalTimeSpentSeconds: newTotalTime,
        categoryStats: newCategoryStats,
        difficultyStats: newDifficultyStats
      }));

      console.log('Enhanced quiz results saved successfully');
    } catch (error) {
      console.error('Error saving enhanced quiz results:', error);
    }
  }, [user, quizState, stats]);

  // Get current question
  const getCurrentQuestion = useCallback(() => {
    if (quizState.questions.length === 0 || quizState.currentQuestionIndex >= quizState.totalQuestions) {
      return null;
    }
    return quizState.questions[quizState.currentQuestionIndex];
  }, [quizState.questions, quizState.currentQuestionIndex, quizState.totalQuestions]);

  // Get progress
  const getProgress = useCallback(() => {
    const current = quizState.currentQuestionIndex + 1;
    const total = quizState.totalQuestions;
    const percentage = (current / total) * 100;

    return {
      current,
      total,
      percentage: Math.min(100, Math.max(0, percentage))
    };
  }, [quizState.currentQuestionIndex, quizState.totalQuestions]);

  // Reset user progress (clear tracking)
  const resetUserProgress = useCallback(async () => {
    try {
      await resetQuestionTracking();
      console.log('Enhanced question tracking reset successfully');
    } catch (error) {
      console.error('Error resetting enhanced question tracking:', error);
      throw error;
    }
  }, []);

  return {
    quizState,
    stats,
    loading,
    startQuiz,
    answerQuestion,
    nextQuestion,
    completeQuiz,
    getCurrentQuestion,
    getProgress,
    loadUserStats,
    resetUserProgress
  };
};