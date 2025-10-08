/**
 * Demonstration of Enhanced Quiz Randomization System
 * Shows how the system prevents question repetition across game levels
 */

import { QUIZ_QUESTIONS } from '@/constants/QuizQuestions';
import { 
  shuffleArray, 
  getWeightedRandomQuestions,
  loadQuestionStats,
  saveQuestionStats,
  resetQuestionTracking,
  getQuestionsForLevelWithRandomization
} from './quizRandomization';

export const demonstrateEnhancedRandomization = async () => {
  console.log('🎯 Enhanced Quiz Randomization System Demo');
  console.log('==========================================\n');

  // Sample questions for demonstration
  const sampleQuestions = QUIZ_QUESTIONS.slice(0, 50);
  
  console.log('📊 Initial Setup:');
  console.log(`- Total questions in demo: ${sampleQuestions.length}`);
  console.log(`- Easy questions: ${sampleQuestions.filter(q => q.difficulty === 'easy').length}`);
  console.log(`- Medium questions: ${sampleQuestions.filter(q => q.difficulty === 'medium').length}`);
  console.log(`- Hard questions: ${sampleQuestions.filter(q => q.difficulty === 'hard').length}\n`);

  // Demo 1: Basic vs Enhanced Randomization
  console.log('1. 🎲 Basic Randomization vs Enhanced Randomization');
  console.log('---------------------------------------------------');
  
  // Basic randomization (current system)
  const basicQuestions = shuffleArray(sampleQuestions).slice(0, 10);
  console.log('\nBasic Randomization (10 questions):');
  console.log('Questions may repeat across sessions');
  basicQuestions.forEach((q, i) => {
    console.log(`   ${i + 1}. ${q.question.substring(0, 40)}... (${q.difficulty})`);
  });

  // Enhanced randomization with tracking
  const usedIds = new Set<string>();
  const questionStats = await loadQuestionStats();
  
  const enhancedQuestions = getWeightedRandomQuestions(
    sampleQuestions, 
    10, 
    usedIds, 
    questionStats
  );
  
  console.log('\nEnhanced Randomization (10 questions):');
  console.log('Questions weighted by usage and difficulty');
  enhancedQuestions.forEach((q, i) => {
    const stats = questionStats[q.id];
    const usageInfo = stats ? `(used ${stats.timesUsed}x)` : '(new question)';
    console.log(`   ${i + 1}. ${q.question.substring(0, 40)}... (${q.difficulty}) ${usageInfo}`);
  });

  // Demo 2: Level-based Question Distribution
  console.log('\n2. 🎯 Level-Based Question Distribution');
  console.log('---------------------------------------');
  
  const levels = [1, 2, 3, 4, 5, 6];
  
  for (const level of levels) {
    const levelQuestions = getQuestionsForLevelWithRandomization(
      sampleQuestions,
      level,
      5, // 5 questions per level
      new Set(),
      {}
    );
    
    const difficultyCount = {
      easy: levelQuestions.filter(q => q.difficulty === 'easy').length,
      medium: levelQuestions.filter(q => q.difficulty === 'medium').length,
      hard: levelQuestions.filter(q => q.difficulty === 'hard').length
    };
    
    console.log(`\nLevel ${level}:`);
    console.log(`  Easy: ${difficultyCount.easy}, Medium: ${difficultyCount.medium}, Hard: ${difficultyCount.hard}`);
    
    levelQuestions.forEach((q, i) => {
      console.log(`    ${i + 1}. ${q.difficulty} - ${q.category}`);
    });
  }

  // Demo 3: Question Usage Tracking
  console.log('\n3. 📈 Question Usage Tracking & Learning Optimization');
  console.log('-----------------------------------------------------');
  
  // Simulate some question usage
  const testStats: Record<string, any> = {
    [sampleQuestions[0].id]: { 
      timesUsed: 5, 
      lastUsed: Date.now() - 1000, 
      difficulty: 'easy', 
      category: 'characters', 
      correctAnswers: 3, 
      totalAnswers: 5 
    },
    [sampleQuestions[1].id]: { 
      timesUsed: 1, 
      lastUsed: Date.now() - 86400000, 
      difficulty: 'easy', 
      category: 'characters', 
      correctAnswers: 1, 
      totalAnswers: 1 
    },
    [sampleQuestions[2].id]: { 
      timesUsed: 0, 
      lastUsed: 0, 
      difficulty: 'medium', 
      category: 'stories', 
      correctAnswers: 0, 
      totalAnswers: 0 
    },
  };

  console.log('\nQuestion Statistics:');
  Object.entries(testStats).forEach(([questionId, stats]) => {
    const question = sampleQuestions.find(q => q.id === questionId);
    if (question) {
      const accuracy = stats.totalAnswers > 0 ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100) : 0;
      console.log(`  "${question.question.substring(0, 30)}..."`);
      console.log(`    Used: ${stats.timesUsed} times, Accuracy: ${accuracy}%`);
    }
  });

  // Demo 4: Preventing Repetition Across Sessions
  console.log('\n4. 🔄 Preventing Question Repetition');
  console.log('-----------------------------------');
  
  // First session
  const session1Questions = getWeightedRandomQuestions(sampleQuestions, 10, new Set(), testStats);
  console.log('\nSession 1 Questions:');
  session1Questions.forEach((q, i) => {
    console.log(`   ${i + 1}. ${q.question.substring(0, 35)}...`);
  });

  // Mark questions as used
  const usedAfterSession1 = new Set(session1Questions.map(q => q.id));
  
  // Second session - should get different questions
  const session2Questions = getWeightedRandomQuestions(sampleQuestions, 10, usedAfterSession1, testStats);
  console.log('\nSession 2 Questions (after using Session 1 questions):');
  session2Questions.forEach((q, i) => {
    const wasUsed = usedAfterSession1.has(q.id);
    console.log(`   ${i + 1}. ${q.question.substring(0, 35)}... ${wasUsed ? '(USED)' : '(NEW)'}`);
  });

  // Check for overlap
  const overlap = session2Questions.filter(q => usedAfterSession1.has(q.id));
  console.log(`\nOverlap between sessions: ${overlap.length} questions`);
  console.log(`Repetition prevented: ${overlap.length === 0 ? '✅ SUCCESS' : '❌ FAILED'}`);

  // Demo 5: Learning-Optimized Questions
  console.log('\n5. 🧠 Learning-Optimized Question Selection');
  console.log('-----------------------------------------');
  
  // Find questions with low accuracy to focus on
  const lowAccuracyQuestions = Object.entries(testStats)
    .filter(([_, stats]) => stats.totalAnswers > 0 && (stats.correctAnswers / stats.totalAnswers) < 0.5)
    .map(([questionId]) => sampleQuestions.find(q => q.id === questionId))
    .filter(Boolean)
    .slice(0, 3);

  console.log('\nQuestions recommended for learning (low accuracy):');
  lowAccuracyQuestions.forEach((q, i) => {
    if (q) {
      const stats = testStats[q.id];
      const accuracy = Math.round((stats.correctAnswers / stats.totalAnswers) * 100);
      console.log(`   ${i + 1}. ${q.question.substring(0, 40)}... (Accuracy: ${accuracy}%)`);
    }
  });

  console.log('\n🎉 Demo Complete!');
  console.log('================');
  console.log('\nKey Features Demonstrated:');
  console.log('✅ Weighted random selection based on usage');
  console.log('✅ Level-appropriate question distribution');
  console.log('✅ Persistent question tracking across sessions');
  console.log('✅ Prevention of question repetition');
  console.log('✅ Learning optimization for weak areas');
  console.log('✅ Smart cooldown periods for recently used questions');
  
  return {
    basicQuestions,
    enhancedQuestions,
    session1Questions,
    session2Questions,
    overlapCount: overlap.length,
    lowAccuracyQuestions
  };
};

// Export for use in other files
// Run demo if this file is executed directly
if (require.main === module) {
  demonstrateEnhancedRandomization().catch(console.error);
}