/**
 * Advanced Quiz Randomization System
 * Ensures questions are truly random and don't repeat across game levels
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuizQuestion, QuizCategory } from '@/constants/QuizQuestions';

// Storage keys for persistent tracking
const STORAGE_KEYS = {
  USED_QUESTIONS: '@quiz_used_questions',
  LEVEL_PROGRESS: '@quiz_level_progress',
  QUESTION_STATS: '@quiz_question_stats'
};

export interface QuestionStats {
  timesUsed: number;
  lastUsed: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: QuizCategory;
  correctAnswers: number;
  totalAnswers: number;
}

export interface LevelProgress {
  level: number;
  questionsUsed: Set<string>;
  lastPlayed: number;
  averageScore: number;
}

export interface RandomizationConfig {
  maxReuseCount: number;
  cooldownPeriod: number; // in milliseconds
  levelDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  categoryDistribution: Record<QuizCategory, number>;
}

// Default configuration
const DEFAULT_CONFIG: RandomizationConfig = {
  maxReuseCount: 3,
  cooldownPeriod: 24 * 60 * 60 * 1000, // 24 hours
  levelDistribution: {
    easy: 0.4,
    medium: 0.4,
    hard: 0.2
  },
  categoryDistribution: {
    characters: 0.15,
    stories: 0.15,
    verses: 0.15,
    geography: 0.1,
    miracles: 0.1,
    parables: 0.1,
    prophecy: 0.1,
    wisdom: 0.1,
    history: 0.05,
    general: 0.05
  }
};

/**
 * Fisher-Yates shuffle algorithm for true randomness
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Weighted random selection based on question usage statistics
 */
export const getWeightedRandomQuestions = (
  questions: QuizQuestion[],
  count: number,
  usedQuestionIds: Set<string>,
  questionStats: Record<string, QuestionStats>,
  config: RandomizationConfig = DEFAULT_CONFIG
): QuizQuestion[] => {
  const now = Date.now();
  
  // Calculate weights for each question
  const weightedQuestions = questions.map(question => {
    const stats = questionStats[question.id] || {
      timesUsed: 0,
      lastUsed: 0,
      difficulty: question.difficulty,
      category: question.category,
      correctAnswers: 0,
      totalAnswers: 0
    };

    // Base weight (higher for less used questions)
    let weight = 1 / (stats.timesUsed + 1);

    // Penalty for recent usage
    if (now - stats.lastUsed < config.cooldownPeriod) {
      const cooldownFactor = (config.cooldownPeriod - (now - stats.lastUsed)) / config.cooldownPeriod;
      weight *= (1 - cooldownFactor * 0.8); // Reduce weight by up to 80%
    }

    // Bonus for questions with good accuracy (encourage learning)
    if (stats.totalAnswers > 0) {
      const accuracy = stats.correctAnswers / stats.totalAnswers;
      if (accuracy < 0.5) {
        weight *= 1.2; // Show more questions the user struggles with
      }
    }

    // Apply level distribution weights
    weight *= config.levelDistribution[question.difficulty];

    // Apply category distribution weights
    weight *= config.categoryDistribution[question.category];

    return { question, weight };
  });

  // Sort by weight (descending)
  weightedQuestions.sort((a, b) => b.weight - a.weight);

  // Select top questions, ensuring no duplicates and respecting count
  const selectedQuestions: QuizQuestion[] = [];
  const usedIds = new Set(usedQuestionIds);

  for (const { question } of weightedQuestions) {
    if (selectedQuestions.length >= count) break;
    
    // Skip if already used in current session or exceeded max reuse
    if (!usedIds.has(question.id)) {
      const stats = questionStats[question.id];
      if (!stats || stats.timesUsed < config.maxReuseCount) {
        selectedQuestions.push(question);
        usedIds.add(question.id);
      }
    }
  }

  // If we don't have enough questions, include some previously used ones
  if (selectedQuestions.length < count) {
    const remainingCount = count - selectedQuestions.length;
    const availableQuestions = questions.filter(q => 
      !selectedQuestions.some(sq => sq.id === q.id)
    );

    // Sort by least recently used
    availableQuestions.sort((a, b) => {
      const statsA = questionStats[a.id] || { lastUsed: 0 };
      const statsB = questionStats[b.id] || { lastUsed: 0 };
      return statsA.lastUsed - statsB.lastUsed;
    });

    selectedQuestions.push(...availableQuestions.slice(0, remainingCount));
  }

  // Final shuffle to ensure randomness
  return shuffleArray(selectedQuestions);
};

/**
 * Get questions optimized for a specific level
 */
export const getQuestionsForLevelWithRandomization = (
  questions: QuizQuestion[],
  level: number,
  count: number,
  usedQuestionIds: Set<string>,
  questionStats: Record<string, QuestionStats>
): QuizQuestion[] => {
  // Adjust configuration based on level
  const levelConfig: RandomizationConfig = {
    ...DEFAULT_CONFIG,
    levelDistribution: getLevelDistribution(level),
    maxReuseCount: Math.max(1, 4 - Math.floor(level / 2)) // Reduce reuse as level increases
  };

  // Filter questions by appropriate difficulty for the level
  const levelQuestions = questions.filter(question => 
    isQuestionAppropriateForLevel(question, level)
  );

  return getWeightedRandomQuestions(
    levelQuestions,
    count,
    usedQuestionIds,
    questionStats,
    levelConfig
  );
};

/**
 * Determine if a question is appropriate for a given level
 */
const isQuestionAppropriateForLevel = (question: QuizQuestion, level: number): boolean => {
  switch (level) {
    case 1: // Seeker - Only easy questions
      return question.difficulty === 'easy';
    case 2: // Student - Mostly easy, some medium
      return question.difficulty === 'easy' || 
             (question.difficulty === 'medium' && Math.random() < 0.3);
    case 3: // Disciple - Balanced mix
      return question.difficulty === 'easy' || question.difficulty === 'medium';
    case 4: // Teacher - Mostly medium, some hard
      return question.difficulty === 'medium' || 
             (question.difficulty === 'hard' && Math.random() < 0.3);
    case 5: // Scholar - Balanced medium/hard
      return question.difficulty === 'medium' || question.difficulty === 'hard';
    case 6: // Master - Only hard questions
      return question.difficulty === 'hard';
    default:
      return true;
  }
};

/**
 * Get difficulty distribution based on level
 */
const getLevelDistribution = (level: number): { easy: number; medium: number; hard: number } => {
  switch (level) {
    case 1: return { easy: 1.0, medium: 0.0, hard: 0.0 };
    case 2: return { easy: 0.7, medium: 0.3, hard: 0.0 };
    case 3: return { easy: 0.4, medium: 0.6, hard: 0.0 };
    case 4: return { easy: 0.2, medium: 0.6, hard: 0.2 };
    case 5: return { easy: 0.1, medium: 0.5, hard: 0.4 };
    case 6: return { easy: 0.0, medium: 0.3, hard: 0.7 };
    default: return DEFAULT_CONFIG.levelDistribution;
  }
};

/**
 * Load question statistics from storage
 */
export const loadQuestionStats = async (): Promise<Record<string, QuestionStats>> => {
  try {
    const statsJson = await AsyncStorage.getItem(STORAGE_KEYS.QUESTION_STATS);
    return statsJson ? JSON.parse(statsJson) : {};
  } catch (error) {
    console.error('Error loading question stats:', error);
    return {};
  }
};

/**
 * Save question statistics to storage
 */
export const saveQuestionStats = async (stats: Record<string, QuestionStats>): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.QUESTION_STATS, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving question stats:', error);
  }
};

/**
 * Update statistics when a question is used
 */
export const updateQuestionStats = async (
  questionId: string,
  question: QuizQuestion,
  wasCorrect: boolean
): Promise<void> => {
  const stats = await loadQuestionStats();
  
  const currentStats = stats[questionId] || {
    timesUsed: 0,
    lastUsed: 0,
    difficulty: question.difficulty,
    category: question.category,
    correctAnswers: 0,
    totalAnswers: 0
  };

  stats[questionId] = {
    ...currentStats,
    timesUsed: currentStats.timesUsed + 1,
    lastUsed: Date.now(),
    correctAnswers: currentStats.correctAnswers + (wasCorrect ? 1 : 0),
    totalAnswers: currentStats.totalAnswers + 1
  };

  await saveQuestionStats(stats);
};

/**
 * Load used question IDs from storage
 */
export const loadUsedQuestionIds = async (): Promise<Set<string>> => {
  try {
    const usedJson = await AsyncStorage.getItem(STORAGE_KEYS.USED_QUESTIONS);
    if (usedJson) {
      const usedArray = JSON.parse(usedJson) as string[];
      return new Set(usedArray);
    }
  } catch (error) {
    console.error('Error loading used question IDs:', error);
  }
  return new Set();
};

/**
 * Save used question IDs to storage
 */
export const saveUsedQuestionIds = async (usedIds: Set<string>): Promise<void> => {
  try {
    const usedArray = Array.from(usedIds);
    await AsyncStorage.setItem(STORAGE_KEYS.USED_QUESTIONS, JSON.stringify(usedArray));
  } catch (error) {
    console.error('Error saving used question IDs:', error);
  }
};

/**
 * Reset all question tracking (for testing or user reset)
 */
export const resetQuestionTracking = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USED_QUESTIONS,
      STORAGE_KEYS.QUESTION_STATS,
      STORAGE_KEYS.LEVEL_PROGRESS
    ]);
  } catch (error) {
    console.error('Error resetting question tracking:', error);
  }
};

/**
 * Get question selection recommendations based on user performance
 */
export const getQuestionRecommendations = async (
  questions: QuizQuestion[],
  count: number = 5
): Promise<QuizQuestion[]> => {
  const stats = await loadQuestionStats();
  
  // Find questions with low accuracy that haven't been used recently
  const recommendedQuestions = questions
    .map(question => {
      const questionStats = stats[question.id];
      if (!questionStats || questionStats.totalAnswers === 0) {
        return { question, score: 10 }; // High priority for new questions
      }

      const accuracy = questionStats.correctAnswers / questionStats.totalAnswers;
      const daysSinceLastUse = (Date.now() - questionStats.lastUsed) / (24 * 60 * 60 * 1000);
      
      // Score based on low accuracy and recent non-usage
      let score = (1 - accuracy) * 5; // Higher score for lower accuracy
      score += Math.min(daysSinceLastUse / 7, 2); // Bonus for questions not used recently

      return { question, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(item => item.question);

  return recommendedQuestions;
};