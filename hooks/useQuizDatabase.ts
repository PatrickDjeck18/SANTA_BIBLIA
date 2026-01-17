import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENHANCED_MEMORIZATION_QUESTIONS, MemorizationQuestion } from '@/constants/QuizQuestionsEnhanced';

export interface DatabaseQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  testament: 'old' | 'new';
  book_reference: string;
  verse_reference: string;
  verse: string;
  created_at: string;
  updated_at: string;
}

export interface QuizState {
  questions: DatabaseQuizQuestion[];
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
  gameMode: 'timed' | 'mixed' | 'easy';
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  category: string | 'mixed';
  testament: 'old' | 'new' | 'both';
  totalScore: number;
}

export interface QuizStats {
  totalGamesPlayed: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  bestStreak: number;
  averageScore: number;
  totalScore: number;
  currentStreak: number;
  longestStreak: number;
  averageAccuracy: number;
  currentLevel: number;
  totalPoints: number;
  achievements: string[];
  categoryStats: Record<string, {
    played: number;
    correct: number;
    accuracy: number;
    best_score: number;
  }>;
  difficultyStats: Record<string, {
    played: number;
    correct: number;
    accuracy: number;
    best_score: number;
  }>;
  timeSpent: number;
}

const INITIAL_QUIZ_STATE: QuizState = {
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  totalQuestions: 200,
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

const STATS_STORAGE_KEY = '@quiz_stats';

export const useQuizDatabase = () => {
  const [quizState, setQuizState] = useState<QuizState>(INITIAL_QUIZ_STATE);
  const [stats, setStats] = useState<QuizStats>({
    totalGamesPlayed: 0,
    totalQuestionsAnswered: 0,
    totalCorrectAnswers: 0,
    bestStreak: 0,
    averageScore: 0,
    totalScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageAccuracy: 0,
    currentLevel: 1,
    totalPoints: 0,
    achievements: [],
    categoryStats: {},
    difficultyStats: {
      easy: { played: 0, correct: 0, accuracy: 0, best_score: 0 },
      medium: { played: 0, correct: 0, accuracy: 0, best_score: 0 },
      hard: { played: 0, correct: 0, accuracy: 0, best_score: 0 }
    },
    timeSpent: 0
  });
  const [loading, setLoading] = useState(false);

  // Load user stats from AsyncStorage
  const loadUserStats = useCallback(async () => {
    try {
      const storedStats = await AsyncStorage.getItem(STATS_STORAGE_KEY);
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  }, []);

  // Load user stats on mount
  useEffect(() => {
    loadUserStats();
  }, [loadUserStats]);

  // Transform MemorizationQuestion to DatabaseQuizQuestion
  const transformQuestion = (q: MemorizationQuestion): DatabaseQuizQuestion => {
    return {
      id: q.id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      category: q.category,
      difficulty: q.difficulty,
      testament: q.testament,
      book_reference: q.verse.split(' ')[0], // Simple approx
      verse_reference: q.verse,
      verse: q.verse,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  };

  // Fetch questions from local constant
  const fetchQuestions = async (options: {
    limit?: number;
  } = {}) => {
    setLoading(true);
    try {
      // Simulate async delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const allQuestions = ENHANCED_MEMORIZATION_QUESTIONS;

      // Shuffle
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);

      const limitCount = options.limit || 15;
      const selected = shuffled.slice(0, Math.min(limitCount, shuffled.length));

      return selected.map(transformQuestion);
    } catch (error) {
      console.error('Error fetching questions:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Start a new quiz
  const startQuiz = useCallback(async (options: {
    questionCount?: number;
    timePerQuestion?: number;
  } = {}) => {
    const {
      questionCount = 10,
      timePerQuestion = 30
    } = options;

    const questions = await fetchQuestions({
      limit: questionCount
    });

    if (questions.length === 0) {
      console.error('No questions found');
      return;
    }

    setQuizState({
      ...INITIAL_QUIZ_STATE,
      questions,
      totalQuestions: questions.length,
      timeRemaining: timePerQuestion,
      isActive: true,
      gameMode: 'mixed', // Default for now
      difficulty: 'mixed',
      category: 'mixed',
      testament: 'both',
      totalScore: stats.totalScore
    });
  }, [stats.totalScore]);

  // Answer a question
  const answerQuestion = useCallback((answerIndex: number) => {
    if (!quizState.isActive || quizState.selectedAnswer !== null) return;

    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    // Calculate points
    let points = 0;
    if (isCorrect) {
      const basePoints = currentQuestion.difficulty === 'easy' ? 100 :
        currentQuestion.difficulty === 'medium' ? 150 : 200;
      const timeBonus = quizState.gameMode === 'timed'
        ? Math.floor((quizState.timeRemaining / 30) * 20)
        : 0;
      points = basePoints + timeBonus;
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
      const isLastQuestion = nextIndex >= prev.questions.length;

      if (isLastQuestion) {
        return {
          ...prev,
          isCompleted: true,
          isActive: false,
          showExplanation: false
        };
      }

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

  // Reset quiz
  const resetQuiz = useCallback(() => {
    setQuizState(INITIAL_QUIZ_STATE);
  }, []);

  // Complete quiz and save results locally
  const completeQuiz = useCallback(async (finalScore: number, timeTaken?: number) => {
    try {
      const totalQuestions = quizState.questions.length;
      const accuracy = totalQuestions > 0 ? (quizState.correctAnswers / totalQuestions) * 100 : 0;
      const currentLevel = Math.floor(Math.max(stats.totalScore, finalScore) / 250) + 1;

      const timeToAdd = timeTaken || 600; // Use provided time or default fallback

      // Update stats state
      const updatedStats: QuizStats = {
        ...stats,
        totalGamesPlayed: stats.totalGamesPlayed + 1,
        totalQuestionsAnswered: stats.totalQuestionsAnswered + totalQuestions,
        totalCorrectAnswers: stats.totalCorrectAnswers + quizState.correctAnswers,
        bestStreak: Math.max(stats.bestStreak, quizState.streak),
        averageScore: ((stats.averageScore * stats.totalGamesPlayed) + accuracy) / (stats.totalGamesPlayed + 1),
        totalScore: Math.max(stats.totalScore, finalScore),
        currentStreak: quizState.streak,
        longestStreak: Math.max(stats.longestStreak, quizState.streak),
        averageAccuracy: ((stats.averageAccuracy * stats.totalGamesPlayed) + accuracy) / (stats.totalGamesPlayed + 1),
        currentLevel: Math.max(stats.currentLevel, currentLevel),
        totalPoints: Math.max(stats.totalPoints, finalScore),
        // Simple update for categories/difficulty, complex logic omitted for brevity but can be added
        timeSpent: stats.timeSpent + timeToAdd
      };

      setStats(updatedStats);
      await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(updatedStats));

    } catch (error) {
      console.error('Error completing quiz:', error);
    }
  }, [quizState, stats]);

  // Get current question
  const getCurrentQuestion = useCallback((): DatabaseQuizQuestion | null => {
    if (quizState.questions.length === 0 || quizState.currentQuestionIndex >= quizState.questions.length) {
      return null;
    }
    return quizState.questions[quizState.currentQuestionIndex];
  }, [quizState.questions, quizState.currentQuestionIndex]);

  // Get quiz progress
  const getProgress = useCallback(() => {
    return {
      current: quizState.currentQuestionIndex + 1,
      total: quizState.questions.length,
      percentage: quizState.questions.length > 0
        ? ((quizState.currentQuestionIndex + 1) / quizState.questions.length) * 100
        : 0
    };
  }, [quizState.currentQuestionIndex, quizState.questions.length]);

  // Get accuracy percentage
  const getAccuracy = useCallback(() => {
    const totalAnswered = quizState.correctAnswers + quizState.wrongAnswers;
    return totalAnswered > 0 ? (quizState.correctAnswers / totalAnswered) * 100 : 0;
  }, [quizState.correctAnswers, quizState.wrongAnswers]);

  // Get grade based on score
  const getGrade = useCallback(() => {
    const accuracy = getAccuracy();
    if (accuracy >= 90) return { grade: 'A+', color: '#10B981', message: 'Excellent!' };
    if (accuracy >= 80) return { grade: 'A', color: '#059669', message: 'Great job!' };
    if (accuracy >= 70) return { grade: 'B', color: '#0D9488', message: 'Good work!' };
    if (accuracy >= 60) return { grade: 'C', color: '#F59E0B', message: 'Keep studying!' };
    return { grade: 'D', color: '#EF4444', message: 'Need more practice!' };
  }, [getAccuracy]);

  // Manual refresh function (reloads stats)
  const refreshStats = useCallback(async () => {
    await loadUserStats();
  }, [loadUserStats]);

  return {
    quizState,
    stats,
    loading,
    startQuiz,
    answerQuestion,
    nextQuestion,
    resetQuiz,
    completeQuiz,
    refreshStats,
    getCurrentQuestion,
    getProgress,
    getAccuracy,
    getGrade,
    isQuizActive: quizState.isActive,
    isQuizCompleted: quizState.isCompleted,
    currentQuestion: getCurrentQuestion(),
    progress: getProgress(),
    accuracy: getAccuracy(),
    grade: getGrade()
  };
};