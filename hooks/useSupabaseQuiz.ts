import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabase';
import { COLLECTIONS } from '@/lib/firestore';
import { trackQuestionUsage } from '@/constants/QuizQuestionsEnhanced';
import { QuizQuestion as StandardQuizQuestion, QuizCategory, LEVEL_SYSTEM, getCurrentLevel, QUIZ_QUESTIONS } from '@/constants/QuizQuestions';
import { getQuestionsForLevelWithRandomization, loadQuestionStats } from '@/utils/quizRandomization';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: QuizCategory; // Fix type to match QuizCategory
  difficulty: 'easy' | 'medium' | 'hard';
  verse?: string;
  explanation?: string;
  testament?: 'old' | 'new' | 'both';
}

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
  gameMode: 'timed' | 'endless' | 'category' | 'mixed' | 'level';
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
  favoriteCategory: string;
  totalTimeSpentSeconds: number;
  categoryStats: Record<string, { played: number; correct: number; accuracy: number }>;
  difficultyStats: {
    easy: { played: number; correct: number; accuracy: number };
    medium: { played: number; correct: number; accuracy: number };
    hard: { played: number; correct: number; accuracy: number };
  };
}

export interface QuizSession {
  id?: string;
  userId: string;
  questionsAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalScore: number;
  category: string;
  difficulty: string;
  timeTakenSeconds: number;
  completedAt: string;
  createdAt?: string;
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

export const useSupabaseQuiz = () => {
  const { user } = useAuth();
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
    favoriteCategory: 'mixed',
    totalTimeSpentSeconds: 0,
    categoryStats: {},
    difficultyStats: {
      easy: { played: 0, correct: 0, accuracy: 0 },
      medium: { played: 0, correct: 0, accuracy: 0 },
      hard: { played: 0, correct: 0, accuracy: 0 }
    }
  });
  const [loading, setLoading] = useState(false);
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(new Set());

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
        const newStats: QuizStats = {
          totalGamesPlayed: userStats.total_sessions || 0,
          totalQuestionsAnswered: userStats.total_questions_answered || 0,
          totalCorrectAnswers: userStats.total_correct_answers || 0,
          bestStreak: userStats.longest_streak || 0,
          averageScore: userStats.total_questions_answered > 0
            ? (userStats.total_correct_answers / userStats.total_questions_answered) * 100
            : 0,
          totalScore: userStats.best_score || 0,
          currentStreak: userStats.current_streak || 0,
          longestStreak: userStats.longest_streak || 0,
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

  // Shuffle array utility function
  const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Generate fallback questions with randomization
  const generateFallbackQuestions = (count: number): QuizQuestion[] => {
    const baseQuestions = [
      {
        id: '1',
        question: 'In the beginning God created the _____ and the earth.',
        options: ['heavens', 'world', 'universe', 'cosmos'],
        correctAnswer: 0,
        category: 'general' as QuizCategory,
        difficulty: 'easy' as const,
        verse: 'Genesis 1:1',
        explanation: 'Genesis 1:1 - The foundational verse of the Bible.'
      },
      {
        id: '2',
        question: 'For God so loved the world, that he gave his only begotten _____.',
        options: ['Son', 'Child', 'One', 'Beloved'],
        correctAnswer: 0,
        category: 'verses' as QuizCategory,
        difficulty: 'easy' as const,
        verse: 'John 3:16',
        explanation: 'John 3:16 - Most famous Bible verse.'
      },
      {
        id: '3',
        question: 'The Lord is my _____; I shall not want.',
        options: ['shepherd', 'guide', 'protector', 'keeper'],
        correctAnswer: 0,
        category: 'verses' as QuizCategory,
        difficulty: 'easy' as const,
        verse: 'Psalm 23:1',
        explanation: 'Psalm 23:1 - Most famous Psalm verse.'
      },
      {
        id: '4',
        question: 'And God said, Let there be _____: and there was light.',
        options: ['light', 'day', 'sun', 'brightness'],
        correctAnswer: 0,
        category: 'Bible',
        difficulty: 'easy' as const,
        verse: 'Genesis 1:3',
        explanation: 'Genesis 1:3 - God speaks light into existence.'
      },
      {
        id: '5',
        question: 'So God created man in his own _____.',
        options: ['image', 'likeness', 'form', 'spirit'],
        correctAnswer: 0,
        category: 'Bible',
        difficulty: 'easy' as const,
        verse: 'Genesis 1:27',
        explanation: 'Genesis 1:27 - Humanity created in God\'s image.'
      },
      {
        id: '6',
        question: 'Trust in the LORD with all thine _____.',
        options: ['heart', 'soul', 'mind', 'strength'],
        correctAnswer: 0,
        category: 'Bible',
        difficulty: 'easy' as const,
        verse: 'Proverbs 3:5',
        explanation: 'Proverbs 3:5 - Key to divine guidance.'
      },
      {
        id: '7',
        question: 'I can do all things through _____ which strengtheneth me.',
        options: ['Christ', 'God', 'Jesus', 'the Lord'],
        correctAnswer: 0,
        category: 'Bible',
        difficulty: 'easy' as const,
        verse: 'Philippians 4:13',
        explanation: 'Philippians 4:13 - Strength in Christ.'
      },
      {
        id: '8',
        question: 'For all have sinned, and come short of the _____ of God.',
        options: ['glory', 'standard', 'perfection', 'holiness'],
        correctAnswer: 0,
        category: 'Bible',
        difficulty: 'easy' as const,
        verse: 'Romans 3:23',
        explanation: 'Romans 3:23 - Universal sinfulness.'
      },
      {
        id: '9',
        question: 'Be still, and know that I am _____.',
        options: ['God', 'Lord', 'Almighty', 'Jehovah'],
        correctAnswer: 0,
        category: 'Bible',
        difficulty: 'easy' as const,
        verse: 'Psalm 46:10',
        explanation: 'Psalm 46:10 - Command to trust in God.'
      },
      {
        id: '10',
        question: 'The fear of the LORD is the beginning of _____.',
        options: ['knowledge', 'wisdom', 'understanding', 'learning'],
        correctAnswer: 0,
        category: 'Bible',
        difficulty: 'easy' as const,
        verse: 'Proverbs 1:7',
        explanation: 'Proverbs 1:7 - Foundation of wisdom.'
      },
      {
        id: '11',
        question: 'Create in me a clean _____.',
        options: ['heart', 'spirit', 'mind', 'soul'],
        correctAnswer: 0,
        category: 'Bible',
        difficulty: 'easy' as const,
        verse: 'Psalm 51:10',
        explanation: 'Psalm 51:10 - David\'s prayer for cleansing.'
      },
      {
        id: '12',
        question: 'For the wages of sin is _____.',
        options: ['death', 'hell', 'judgment', 'condemnation'],
        correctAnswer: 0,
        category: 'Bible',
        difficulty: 'easy' as const,
        verse: 'Romans 6:23',
        explanation: 'Romans 6:23 - Consequence of sin.'
      },
      {
        id: '13',
        question: 'But the gift of God is eternal _____ through Jesus Christ our Lord.',
        options: ['life', 'salvation', 'hope', 'peace'],
        correctAnswer: 0,
        category: 'Bible',
        difficulty: 'easy' as const,
        verse: 'Romans 6:23',
        explanation: 'Romans 6:23 - God\'s free gift.'
      },
      {
        id: '14',
        question: 'And we know that all things work together for good to them that love _____.',
        options: ['God', 'the Lord', 'Christ', 'Jesus'],
        correctAnswer: 0,
        category: 'Bible',
        difficulty: 'easy' as const,
        verse: 'Romans 8:28',
        explanation: 'Romans 8:28 - God\'s sovereign plan.'
      },
      {
        id: '15',
        question: 'If God be for us, who can be _____ us?',
        options: ['against', 'opposed to', 'contrary to', 'resisting'],
        correctAnswer: 0,
        category: 'Bible',
        difficulty: 'easy' as const,
        verse: 'Romans 8:31',
        explanation: 'Romans 8:31 - Confidence in God\'s protection.'
      }
    ];

    // Use current timestamp as seed for randomization
    const seed = Date.now();
    const randomIndex = Math.floor((seed / 1000) % baseQuestions.length);

    // Get a subset of questions starting from the random index
    const selectedQuestions = [];
    for (let i = 0; i < Math.min(count, baseQuestions.length); i++) {
      const questionIndex = (randomIndex + i) % baseQuestions.length;
      selectedQuestions.push(baseQuestions[questionIndex]);
    }

    // Shuffle options for each question and update correct answers
    return selectedQuestions.map((q, index) => {
      const shuffledOptions = shuffleArray(q.options);
      const correctAnswerIndex = shuffledOptions.indexOf(q.options[q.correctAnswer]);

      return {
        ...q,
        id: `${q.id}_${index}`, // Make IDs unique
        options: shuffledOptions,
        correctAnswer: correctAnswerIndex,
        category: q.category as QuizCategory // Ensure proper type
      };
    });
  };

  // Fetch questions from Supabase
  const fetchQuestions = async (options: {
    count?: number;
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
    category?: string | 'mixed';
  } = {}): Promise<QuizQuestion[]> => {
    const { count = 20, difficulty = 'mixed', category = 'mixed' } = options;

    try {
      // First, get the list of question IDs that the user has already answered
      let currentUsedQuestionIds: string[] = Array.from(usedQuestionIds);

      if (user) {
        try {
          const { data: usedQuestions, error: usedError } = await supabase
            .from('user_used_questions')
            .select('question_id')
            .eq('user_id', user.uid);

          if (!usedError && usedQuestions) {
            currentUsedQuestionIds = usedQuestions.map(uq => uq.question_id.toString());
            console.log(`Found ${currentUsedQuestionIds.length} previously used questions`);
          } else if (usedError) {
            // If table doesn't exist (42P01), this is expected - just log and continue
            if (usedError.code === '42P01') {
              console.log('user_used_questions table not found - using local tracking');
            } else {
              console.warn('Could not fetch used questions:', usedError.message);
            }
          }
        } catch (error) {
          console.warn('Error fetching used questions (non-critical):', error);
        }
      }

      // Try to fetch questions from database
      let data: any[] | null = null;
      let error: any = null;

      try {
        let query = supabase
          .from('quiz_questions')
          .select('*');

        // Apply filters
        if (difficulty !== 'mixed') {
          query = query.eq('difficulty', difficulty);
        }

        if (category !== 'mixed') {
          query = query.eq('category', category);
        }

        // Exclude questions that have been used by this user
        if (currentUsedQuestionIds.length > 0) {
          query = query.not('id', 'in', `(${currentUsedQuestionIds.join(',')})`);
        }

        // Order randomly and limit results
        query = query.order('random()').limit(count);

        console.log('Executing Supabase query:', query);
        const result = await query;
        data = result.data;
        error = result.error;

        console.log('Query result:', { data: data?.length || 0, error });
      } catch (queryError) {
        console.error('Error executing query:', queryError);
        error = queryError;
      }

      if (error) {
        console.error('Error fetching questions:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });

        // If table doesn't exist, provide a helpful error message
        if (error.code === '42P01') {
          throw new Error('Quiz questions table not found. Please run the database migration first.');
        }

        throw new Error(`Failed to load quiz questions: ${error.message}`);
      }

      // If no data returned, try fallback approaches
      if (!data || data.length === 0) {
        console.warn('No unused questions found in database');

        // If we have used questions, try to get some questions that have been used before
        if (currentUsedQuestionIds.length > 0) {
          console.log('Trying to fetch some previously used questions as fallback...');

          try {
            let fallbackQuery = supabase
              .from('quiz_questions')
              .select('*');

            // Apply filters
            if (difficulty !== 'mixed') {
              fallbackQuery = fallbackQuery.eq('difficulty', difficulty);
            }

            if (category !== 'mixed') {
              fallbackQuery = fallbackQuery.eq('category', category);
            }

            // Get a smaller subset of previously used questions
            fallbackQuery = fallbackQuery.order('random()').limit(Math.min(count, 10));

            const fallbackResult = await fallbackQuery;
            data = fallbackResult.data;
            error = fallbackResult.error;

            if (error) {
              throw new Error('No quiz questions available. All questions have been used and fallback failed.');
            }

            if (data && data.length > 0) {
              console.log(`Using ${data.length} previously used questions as fallback`);
            } else {
              throw new Error('No quiz questions available. All questions have been exhausted.');
            }
          } catch (fallbackError) {
            console.error('Fallback query failed:', fallbackError);
            throw fallbackError;
          }
        } else {
          throw new Error('No quiz questions found in the database. Please ensure the migration has been run and questions have been inserted.');
        }
      }

      console.log(`Successfully fetched ${data.length} questions from Supabase`);

      // Transform data to match QuizQuestion interface with shuffled options
      const questions: QuizQuestion[] = (data || []).map((q: any) => {
        const options = [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean);

        // correct_answer in SQL is stored as an index (0-3)
        const correctAnswerIndex = Math.max(0, Math.min(3, Number(q.correct_answer)));

        // Shuffle the options array and remap the correct index
        const shuffledOptions = shuffleArray(options);
        const newCorrectAnswerIndex = shuffledOptions.indexOf(options[correctAnswerIndex]);

        return {
          id: q.id.toString(),
          question: q.question,
          options: shuffledOptions,
          correctAnswer: newCorrectAnswerIndex >= 0 ? newCorrectAnswerIndex : 0,
          category: q.category,
          difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
          verse: q.book_reference && q.verse_reference ? `${q.book_reference} ${q.verse_reference}` : undefined,
          explanation: q.explanation
        };
      });

      return questions;
    } catch (error) {
      console.error('Error fetching questions from Supabase:', error);

      // Fallback: Return generated questions with randomization
      console.log('Using generated fallback questions...');
      return generateFallbackQuestions(options.count || 20);
    }
  };

  // Start a new quiz
  const startQuiz = useCallback(async (options: {
    gameMode?: 'timed' | 'endless' | 'category' | 'mixed' | 'level';
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
    category?: string | 'mixed';
    testament?: 'old' | 'new' | 'both';
    questionCount?: number;
    timePerQuestion?: number;
  } = {}) => {
    const {
      gameMode = 'mixed',
      difficulty = 'mixed',
      category = 'mixed',
      testament = 'both',
      questionCount = 20,
      timePerQuestion = 30
    } = options;

    try {
      setLoading(true);

      let questions: QuizQuestion[] = [];
      let finalQuestionCount = questionCount;
      let finalTimePerQuestion = timePerQuestion;

      // Handle level-based quiz
      if (gameMode === 'level') {
        const currentLevel = getCurrentLevel(stats.totalScore);
        console.log(`Starting level ${currentLevel.level} quiz for user with score ${stats.totalScore}`);

        // Prefer fetching from Supabase to use SQL questions
        try {
          // Allow an override to reduce questions per quiz
          const desiredCount = Math.min(currentLevel.questionsCount, finalQuestionCount || currentLevel.questionsCount);

          let levelQuery = supabase
            .from('quiz_questions')
            .select('*');

          // Apply difficulty from level config unless mixed
          if (currentLevel.difficulty && currentLevel.difficulty !== 'mixed') {
            levelQuery = levelQuery.eq('difficulty', currentLevel.difficulty);
          }

          // Exclude used questions if available
          const usedIds = Array.from(usedQuestionIds);
          if (usedIds.length > 0) {
            levelQuery = levelQuery.not('id', 'in', `(${usedIds.join(',')})`);
          }

          levelQuery = levelQuery.order('random()').limit(desiredCount);

          const levelResult = await levelQuery;
          if (levelResult.error) {
            throw levelResult.error;
          }

          const levelData = levelResult.data || [];

          // Map Supabase rows to QuizQuestion
          questions = levelData.map((q: any) => {
            const options = [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean);
            const correctIdx = Math.max(0, Math.min(3, Number(q.correct_answer)));
            const shuffledOptions = shuffleArray(options);
            const newCorrect = shuffledOptions.indexOf(options[correctIdx]);

            return {
              id: q.id.toString(),
              question: q.question,
              options: shuffledOptions,
              correctAnswer: newCorrect >= 0 ? newCorrect : 0,
              category: q.category,
              difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
              verse: q.book_reference && q.verse_reference ? `${q.book_reference} ${q.verse_reference}` : undefined,
              explanation: q.explanation
            } as QuizQuestion;
          });

          // If not enough, fall back to in-memory randomization enhancer
          if (questions.length < desiredCount) {
            const questionStats = await loadQuestionStats();
            const fallback = getQuestionsForLevelWithRandomization(
              QUIZ_QUESTIONS,
              currentLevel.level,
              desiredCount - questions.length,
              usedQuestionIds,
              questionStats
            );
            questions = [...questions, ...fallback];
          }
        } catch (levelFetchError) {
          console.warn('Level-mode Supabase fetch failed; using in-memory fallback:', levelFetchError);
          const questionStats = await loadQuestionStats();
          const desiredCount = Math.min(currentLevel.questionsCount, finalQuestionCount || currentLevel.questionsCount);
          questions = getQuestionsForLevelWithRandomization(
            QUIZ_QUESTIONS,
            currentLevel.level,
            desiredCount,
            usedQuestionIds,
            questionStats
          );
        }

        // Respect desired question count
        finalQuestionCount = Math.min(currentLevel.questionsCount, finalQuestionCount || currentLevel.questionsCount);
        finalTimePerQuestion = currentLevel.timePerQuestion;
      } else {
        // Fetch questions from Supabase for other modes
        questions = await fetchQuestions({
          count: gameMode === 'endless' ? 50 : questionCount,
          difficulty,
          category
        });
      }

      console.log(`Starting quiz with ${questions.length} questions from Supabase`);

      setQuizState({
        ...INITIAL_QUIZ_STATE,
        questions,
        totalQuestions: gameMode === 'endless' ? questions.length : finalQuestionCount,
        timeRemaining: finalTimePerQuestion,
        isActive: true,
        gameMode,
        difficulty,
        category,
        testament,
        totalScore: stats.totalScore
      });
    } catch (error) {
      console.error('Error starting quiz:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [stats.totalScore, usedQuestionIds]);

  // Answer a question
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

    // Track the used question using enhanced randomization system
    if (currentQuestion.id) {
      try {
        // Convert to standard QuizQuestion format for tracking
        const standardQuestion: StandardQuizQuestion = {
          ...currentQuestion,
          category: currentQuestion.category as QuizCategory,
          testament: currentQuestion.testament || 'both'
        };
        await trackQuestionUsage(currentQuestion.id, standardQuestion, isCorrect);
        console.log('Enhanced question tracking successful:', currentQuestion.id);
      } catch (error) {
        console.warn('Enhanced question tracking failed (non-critical):', error);
        
        // Fallback to local tracking
        setUsedQuestionIds(prev => {
          const newSet = new Set(prev);
          newSet.add(currentQuestion.id);
          return newSet;
        });
      }
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
  }, [quizState.isActive, quizState.selectedAnswer, quizState.currentQuestionIndex, quizState.questions, quizState.timeRemaining, quizState.gameMode, user]);

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

  // Reset quiz
  const resetQuiz = useCallback(() => {
    setQuizState(INITIAL_QUIZ_STATE);
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
        completed_at: new Date().toISOString()
      };

      // Save quiz session
      const { error: sessionError } = await supabase
        .from('quiz_sessions')
        .insert([sessionData]);

      if (sessionError) {
        console.error('Error saving quiz session:', sessionError);
      }

      // Get current user stats
      const { data: userStats, error: statsError } = await supabase
        .from('user_quiz_stats')
        .select('*')
        .eq('user_id', user.uid)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        console.error('Error fetching user stats:', statsError);
      }

      // Update user stats
      const newTotalSessions = stats.totalGamesPlayed + 1;
      const newTotalQuestions = stats.totalQuestionsAnswered + quizState.totalQuestions;
      const newTotalCorrect = stats.totalCorrectAnswers + quizState.correctAnswers;
      const newTotalScore = Math.max(stats.totalScore, finalScore);
      const newCurrentStreak = quizState.streak > stats.currentStreak ? quizState.streak : stats.currentStreak;
      const newLongestStreak = Math.max(stats.longestStreak, quizState.streak);
      const newTotalTime = stats.totalTimeSpentSeconds + timeTaken;

      // Update category stats
      const categoryKey = quizState.category;
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

      const updatedStats = {
        total_sessions: newTotalSessions,
        total_questions_answered: newTotalQuestions,
        total_correct_answers: newTotalCorrect,
        best_score: newTotalScore,
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        favorite_category: categoryKey,
        total_time_spent_seconds: newTotalTime,
        category_stats: newCategoryStats,
        difficulty_stats: newDifficultyStats,
        updated_at: new Date().toISOString()
      };

      // Save updated stats
      if (userStats) {
        const { error: updateError } = await supabase
          .from('user_quiz_stats')
          .update(updatedStats)
          .eq('user_id', user.uid);

        if (updateError) {
          console.error('Error updating user stats:', updateError);
        }
      } else {
        const { error: createError } = await supabase
          .from('user_quiz_stats')
          .insert([{
            user_id: user.uid,
            ...updatedStats
          }]);

        if (createError) {
          console.error('Error creating user stats:', createError);
        }
      }

      // Update local stats
      setStats(prev => ({
        ...prev,
        totalGamesPlayed: newTotalSessions,
        totalQuestionsAnswered: newTotalQuestions,
        totalCorrectAnswers: newTotalCorrect,
        totalScore: newTotalScore,
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        favoriteCategory: categoryKey,
        totalTimeSpentSeconds: newTotalTime,
        categoryStats: newCategoryStats,
        difficultyStats: newDifficultyStats
      }));

      console.log('Quiz results saved successfully');
    } catch (error) {
      console.error('Error saving quiz results:', error);
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

  // Reset user progress (clear used questions)
  const resetUserProgress = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_used_questions')
        .delete()
        .eq('user_id', user.uid);

      if (error) {
        // If table doesn't exist, this is expected - just log and continue
        if (error.code === '42P01') {
          console.log('user_used_questions table not found - nothing to reset');
        } else {
          console.error('Error resetting user progress:', error);
          throw error;
        }
      } else {
        console.log('User progress reset successfully');
      }

      // Also clear local state
      setUsedQuestionIds(new Set());
    } catch (error) {
      console.error('Error resetting user progress:', error);
      throw error;
    }
  }, [user]);

  return {
    quizState,
    stats,
    loading,
    startQuiz,
    answerQuestion,
    nextQuestion,
    resetQuiz,
    completeQuiz,
    getCurrentQuestion,
    getProgress,
    loadUserStats,
    resetUserProgress
  };
};