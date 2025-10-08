/**
 * Test file for Quiz Randomization System
 * Demonstrates the enhanced question randomization functionality
 */

import { 
  shuffleArray, 
  getWeightedRandomQuestions,
  loadQuestionStats,
  saveQuestionStats,
  resetQuestionTracking 
} from './quizRandomization';
import { QUIZ_QUESTIONS } from '@/constants/QuizQuestions';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

describe('Quiz Randomization System', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('shuffleArray', () => {
    it('should shuffle an array randomly', () => {
      const originalArray = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(originalArray);
      
      // Should have same elements
      expect(shuffled.sort()).toEqual(originalArray.sort());
      
      // Should not be in same order (high probability test)
      expect(shuffled).not.toEqual(originalArray);
    });

    it('should handle empty arrays', () => {
      expect(shuffleArray([])).toEqual([]);
    });

    it('should handle single element arrays', () => {
      expect(shuffleArray([1])).toEqual([1]);
    });
  });

  describe('getWeightedRandomQuestions', () => {
    it('should return correct number of questions', () => {
      const questions = QUIZ_QUESTIONS.slice(0, 10); // Use first 10 questions for testing
      const result = getWeightedRandomQuestions(questions, 5, new Set(), {});
      
      expect(result).toHaveLength(5);
    });

    it('should respect used question IDs', () => {
      const questions = QUIZ_QUESTIONS.slice(0, 10);
      const usedIds = new Set([questions[0].id, questions[1].id]);
      const result = getWeightedRandomQuestions(questions, 5, usedIds, {});
      
      // Should not include used questions
      result.forEach(question => {
        expect(usedIds.has(question.id)).toBe(false);
      });
    });

    it('should handle when not enough questions available', () => {
      const questions = QUIZ_QUESTIONS.slice(0, 3);
      const usedIds = new Set([questions[0].id, questions[1].id]);
      const result = getWeightedRandomQuestions(questions, 5, usedIds, {});
      
      // Should return available questions (1 in this case)
      expect(result.length).toBeLessThanOrEqual(3);
    });

    it('should prioritize less used questions', () => {
      const questions = QUIZ_QUESTIONS.slice(0, 5);
      const questionStats = {
        [questions[0].id]: { timesUsed: 5, lastUsed: Date.now(), difficulty: 'easy', category: 'characters', correctAnswers: 3, totalAnswers: 5 },
        [questions[1].id]: { timesUsed: 1, lastUsed: Date.now(), difficulty: 'easy', category: 'characters', correctAnswers: 1, totalAnswers: 1 },
      };
      
      const result = getWeightedRandomQuestions(questions, 3, new Set(), questionStats);
      
      // Question with lower usage should be prioritized
      const selectedIds = result.map(q => q.id);
      expect(selectedIds).toContain(questions[1].id); // Less used question
    });
  });

  describe('Question Statistics', () => {
    it('should load empty stats when no data exists', async () => {
      const stats = await loadQuestionStats();
      expect(stats).toEqual({});
    });

    it('should save and load question stats correctly', async () => {
      const testStats = {
        'test-question-1': {
          timesUsed: 3,
          lastUsed: Date.now(),
          difficulty: 'easy',
          category: 'characters',
          correctAnswers: 2,
          totalAnswers: 3
        }
      };

      await saveQuestionStats(testStats);
      const loadedStats = await loadQuestionStats();
      
      expect(loadedStats).toEqual(testStats);
    });

    it('should reset question tracking', async () => {
      await resetQuestionTracking();
      // Should not throw errors
      expect(true).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large question sets efficiently', () => {
      const largeQuestionSet = Array.from({ length: 1000 }, (_, i) => ({
        id: `q${i}`,
        question: `Question ${i}`,
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        category: 'characters',
        difficulty: 'easy' as const,
        testament: 'old' as const
      }));

      const startTime = Date.now();
      const result = getWeightedRandomQuestions(largeQuestionSet, 50, new Set(), {});
      const endTime = Date.now();

      expect(result).toHaveLength(50);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should maintain question variety across multiple calls', () => {
      const questions = QUIZ_QUESTIONS.slice(0, 100);
      const usedIds = new Set();
      const questionStats = {};

      // Get multiple sets of questions
      const set1 = getWeightedRandomQuestions(questions, 10, usedIds, questionStats);
      const set2 = getWeightedRandomQuestions(questions, 10, usedIds, questionStats);
      const set3 = getWeightedRandomQuestions(questions, 10, usedIds, questionStats);

      // Check that sets are different (high probability)
      const allQuestions = [...set1, ...set2, ...set3];
      const uniqueQuestions = new Set(allQuestions.map(q => q.id));

      // Should have good variety (not all the same questions)
      expect(uniqueQuestions.size).toBeGreaterThan(15);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero count request', () => {
      const result = getWeightedRandomQuestions(QUIZ_QUESTIONS.slice(0, 10), 0, new Set(), {});
      expect(result).toHaveLength(0);
    });

    it('should handle negative count request', () => {
      const result = getWeightedRandomQuestions(QUIZ_QUESTIONS.slice(0, 10), -5, new Set(), {});
      expect(result).toHaveLength(0);
    });

    it('should handle empty question array', () => {
      const result = getWeightedRandomQuestions([], 5, new Set(), {});
      expect(result).toHaveLength(0);
    });

    it('should handle undefined question stats gracefully', () => {
      const questions = QUIZ_QUESTIONS.slice(0, 5);
      const result = getWeightedRandomQuestions(questions, 3, new Set(), undefined as any);
      
      expect(result).toHaveLength(3);
      // Should not throw errors with undefined stats
    });
  });
});

// Demo function to show enhanced randomization in action
export const demonstrateEnhancedRandomization = () => {
  console.log('=== Enhanced Quiz Randomization Demo ===');

  const sampleQuestions = QUIZ_QUESTIONS.slice(0, 20);
  
  // Demo 1: Basic randomization
  console.log('\n1. Basic Randomization (5 questions):');
  const basicQuestions = shuffleArray(sampleQuestions).slice(0, 5);
  basicQuestions.forEach((q, i) => {
    console.log(`   ${i + 1}. ${q.question} (${q.difficulty}, ${q.category})`);
  });

  // Demo 2: Weighted randomization with usage tracking
  console.log('\n2. Weighted Randomization with Usage Tracking:');
  
  const questionStats = {
    [sampleQuestions[0].id]: { timesUsed: 5, lastUsed: Date.now() - 1000, difficulty: 'easy', category: 'characters', correctAnswers: 3, totalAnswers: 5 },
    [sampleQuestions[1].id]: { timesUsed: 1, lastUsed: Date.now() - 86400000, difficulty: 'easy', category: 'characters', correctAnswers: 1, totalAnswers: 1 },
    [sampleQuestions[2].id]: { timesUsed: 0, lastUsed: 0, difficulty: 'medium', category: 'stories', correctAnswers: 0, totalAnswers: 0 },
  };

  const usedIds = new Set([sampleQuestions[0].id]);
  
  const weightedQuestions = getWeightedRandomQuestions(sampleQuestions, 5, usedIds, questionStats);
  weightedQuestions.forEach((q, i) => {
    const stats = questionStats[q.id];
    const usage = stats ? `(used ${stats.timesUsed} times)` : '(never used)';
    console.log(`   ${i + 1}. ${q.question} ${usage}`);
  });

  // Demo 3: Level-based distribution
  console.log('\n3. Level-Based Question Distribution:');
  const easyQuestions = sampleQuestions.filter(q => q.difficulty === 'easy');
  const mediumQuestions = sampleQuestions.filter(q => q.difficulty === 'medium');
  const hardQuestions = sampleQuestions.filter(q => q.difficulty === 'hard');

  console.log(`   Total questions: ${sampleQuestions.length}`);
  console.log(`   Easy questions: ${easyQuestions.length} (${Math.round(easyQuestions.length / sampleQuestions.length * 100)}%)`);
  console.log(`   Medium questions: ${mediumQuestions.length} (${Math.round(mediumQuestions.length / sampleQuestions.length * 100)}%)`);
  console.log(`   Hard questions: ${hardQuestions.length} (${Math.round(hardQuestions.length / sampleQuestions.length * 100)}%)`);

  console.log('\n=== Demo Complete ===');
};

// Run demo if this file is executed directly
if (require.main === module) {
  demonstrateEnhancedRandomization();
}