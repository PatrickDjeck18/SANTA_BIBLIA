export interface MoodEntry {
  id: string;
  mood_id: string;
  mood_type: string;
  emoji: string;
  notes: string;
  created_at: string;
}

export interface MoodAnalysis {
  overallPattern: string;
  spiritualInsights: string;
  biblicalWisdom: string;
  improvementSuggestions: string;
  recommendedScriptures: Array<{
    reference: string;
    text: string;
    relevance: string;
  }>;
  trendPrediction: string;
  verseRecommendations?: Array<{
    verse: {
      reference: string;
      text: string;
      category: string;
    };
    relevanceScore: number;
    reason: string;
    aiInsight?: string;
  }>;
}

import { config } from '../config';
import BibleVerseService, { VerseRecommendation } from './bibleVerseService';

export interface MoodAnalysisRequest {
  moodHistory: MoodEntry[];
  currentMood?: string;
  notes?: string;
  userDemographics?: {
    age?: number;
    gender?: string;
    spiritualBackground?: string;
  };
}

export class MoodAnalysisService {

  static async analyzeMoodPatterns(request: MoodAnalysisRequest): Promise<MoodAnalysis> {
    try {
      // Get Bible verse recommendations first
      const verseRecommendations = this.getBibleVerseRecommendations(request);
      
      // If no API key, return enhanced analysis with verse recommendations
      if (!config.deepseek.apiKey) {
        const basicAnalysis = this.getBasicAnalysis(request);
        return {
          ...basicAnalysis,
          verseRecommendations
        };
      }

      const systemPrompt = `You are a Christian mental health and spiritual wellness AI assistant. Analyze mood patterns and provide:

1. OVERALL PATTERN: Identify emotional trends and patterns
2. SPIRITUAL INSIGHTS: Connect emotions to spiritual growth opportunities
3. BIBLICAL WISDOM: Provide relevant biblical perspectives
4. IMPROVEMENT SUGGESTIONS: Practical, faith-based suggestions
5. SCRIPTURE RECOMMENDATIONS: 2-3 relevant Bible verses with explanations
6. TREND PREDICTION: Gentle guidance on potential emotional patterns

Guidelines:
- Be compassionate and non-judgmental
- Use Scripture appropriately and contextually
- Focus on hope and growth
- Keep responses concise (max 3 paragraphs per section)
- Use modern, accessible language
- Emphasize God's grace and love
- Reference the specific mood patterns and verses provided`;

      const userPrompt = this.buildEnhancedUserPrompt(request, verseRecommendations);

      const response = await fetch(config.deepseek.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.deepseek.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          max_tokens: 1200,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      const analysisText = data.choices[0]?.message?.content;

      if (!analysisText) {
        const basicAnalysis = this.getBasicAnalysis(request);
        return {
          ...basicAnalysis,
          verseRecommendations
        };
      }

      return this.parseAnalysisResponse(analysisText, request, verseRecommendations);

    } catch (error) {
      console.error('Mood analysis error:', error);
      const basicAnalysis = this.getBasicAnalysis(request);
      const verseRecommendations = this.getBibleVerseRecommendations(request);
      return {
        ...basicAnalysis,
        verseRecommendations
      };
    }
  }

  /**
   * Get Bible verse recommendations based on mood analysis
   */
  private static getBibleVerseRecommendations(request: MoodAnalysisRequest): Array<{
    verse: {
      reference: string;
      text: string;
      category: string;
    };
    relevanceScore: number;
    reason: string;
    aiInsight?: string;
  }> {
    try {
      const { moodHistory, currentMood } = request;
      
      // Get the most recent mood for recommendations
      const recentMood = currentMood || (moodHistory.length > 0 ? moodHistory[0].mood_type : 'Peaceful');
      const intensity = 5; // Default intensity
      
      // Get verse recommendations from Bible service
      const recommendations = BibleVerseService.getVersesForMood(recentMood, intensity, 3);
      
      return recommendations.map(rec => ({
        verse: {
          reference: rec.verse.reference,
          text: rec.verse.text,
          category: rec.verse.category
        },
        relevanceScore: rec.relevanceScore,
        reason: rec.reason,
        aiInsight: rec.reason // Use reason as AI insight for now
      }));
    } catch (error) {
      console.error('Error getting verse recommendations:', error);
      return [];
    }
  }

  private static buildUserPrompt(request: MoodAnalysisRequest): string {
    const { moodHistory, currentMood, notes, userDemographics } = request;
    
    let prompt = `Analyze my mood patterns and provide spiritual guidance:\n\n`;

    // Current mood context
    if (currentMood) {
      prompt += `Current Mood: ${currentMood}\n`;
    }
    if (notes) {
      prompt += `Current Notes: ${notes}\n`;
    }

    // Mood history summary
    if (moodHistory.length > 0) {
      prompt += `\nMood History (last ${moodHistory.length} entries):\n`;
      moodHistory.slice(0, 10).forEach((entry, index) => {
        const date = new Date(entry.created_at).toLocaleDateString();
        prompt += `${index + 1}. ${entry.mood_type} - ${date}`;
        if (entry.notes) prompt += ` - "${entry.notes}"`;
        prompt += '\n';
      });
    }

    // User context
    if (userDemographics) {
      prompt += `\nUser Context: `;
      if (userDemographics.age) prompt += `Age ${userDemographics.age}, `;
      if (userDemographics.gender) prompt += `${userDemographics.gender}, `;
      if (userDemographics.spiritualBackground) {
        prompt += `Spiritual background: ${userDemographics.spiritualBackground}`;
      }
      prompt += '\n';
    }

    prompt += `\nPlease provide a comprehensive analysis with spiritual insights and practical suggestions.`;

    return prompt;
  }

  private static buildEnhancedUserPrompt(
    request: MoodAnalysisRequest,
    verseRecommendations: any[]
  ): string {
    const basePrompt = this.buildUserPrompt(request);
    
    if (verseRecommendations.length > 0) {
      const versesText = verseRecommendations.map((rec, index) =>
        `${index + 1}. ${rec.verse.reference}: "${rec.verse.text}" (${rec.reason})`
      ).join('\n');
      
      return `${basePrompt}\n\nRecommended Scriptures:\n${versesText}\n\nPlease reference and build upon these scripture recommendations in your analysis.`;
    }
    
    return basePrompt;
  }

  private static parseAnalysisResponse(
    text: string,
    request: MoodAnalysisRequest,
    verseRecommendations?: any[]
  ): MoodAnalysis {
    // Simple parsing logic - in a real implementation, you might use more sophisticated parsing
    // or structure the AI response with specific sections
    
    const sections = text.split('\n\n');
    
    return {
      overallPattern: sections[0] || 'Analyzing your mood patterns...',
      spiritualInsights: sections[1] || 'Looking for spiritual connections...',
      biblicalWisdom: sections[2] || 'Seeking biblical wisdom...',
      improvementSuggestions: sections[3] || 'Preparing suggestions...',
      recommendedScriptures: this.extractScriptures(text),
      trendPrediction: sections[4] || 'Observing trends...',
      verseRecommendations
    };
  }

  private static extractScriptures(text: string): Array<{reference: string; text: string; relevance: string}> {
    // Simple scripture extraction - would be enhanced in production
    const scriptureRegex = /([1-3]?\s?[A-Za-z]+\s\d+:\d+)/g;
    const matches = text.match(scriptureRegex);
    
    if (!matches) {
      return [
        {
          reference: 'Philippians 4:6-7',
          text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
          relevance: 'Peace in anxiety'
        }
      ];
    }

    return matches.slice(0, 3).map(ref => ({
      reference: ref,
      text: 'Scripture text would be retrieved from Bible API',
      relevance: 'Relevant to your current emotional state'
    }));
  }

  private static getBasicAnalysis(request: MoodAnalysisRequest): MoodAnalysis {
    const positiveCount = request.moodHistory.filter(entry =>
      ['Happy', 'Joyful', 'Peaceful', 'Grateful'].includes(entry.mood_type)
    ).length;

    const negativeCount = request.moodHistory.filter(entry =>
      ['Sad', 'Anxious', 'Stressed', 'Angry'].includes(entry.mood_type)
    ).length;

    const positivityRatio = request.moodHistory.length > 0 ?
      (positiveCount / request.moodHistory.length) * 100 : 0;

    // Get verse recommendations for basic analysis
    const verseRecommendations = this.getBibleVerseRecommendations(request);

    return {
      overallPattern: `You've recorded ${request.moodHistory.length} mood entries with ${positivityRatio.toFixed(0)}% positive moods.`,
      spiritualInsights: 'Every emotion is an opportunity for spiritual growth and connection with God.',
      biblicalWisdom: 'The Psalms show us that God welcomes all our emotions - joy, sorrow, fear, and hope.',
      improvementSuggestions: 'Consider journaling your feelings alongside Scripture. Practice gratitude daily.',
      recommendedScriptures: [
        {
          reference: 'Psalm 34:18',
          text: 'The Lord is close to the brokenhearted and saves those who are crushed in spirit.',
          relevance: 'Comfort in difficult emotions'
        },
        {
          reference: 'Philippians 4:4-7',
          text: 'Rejoice in the Lord always. I will say it again: Rejoice! Let your gentleness be evident to all. The Lord is near.',
          relevance: 'Peace and rejoicing'
        }
      ],
      trendPrediction: 'Continue tracking to see patterns emerge. Your awareness is the first step toward growth.',
      verseRecommendations
    };
  }

  // Real-time mood suggestion based on current context
  static async getRealTimeSuggestion(currentContext: {
    timeOfDay: string;
    recentActivities?: string[];
    currentLocation?: string;
    weather?: string;
  }): Promise<string> {
    try {
      if (!config.deepseek.apiKey) {
        return 'Take a moment to breathe and connect with God. Consider reading a Psalm that matches your current mood.';
      }

      const prompt = `Based on this context, suggest a quick mood improvement activity (1-2 sentences):
Time: ${currentContext.timeOfDay}
Activities: ${currentContext.recentActivities?.join(', ') || 'unknown'}
Location: ${currentContext.currentLocation || 'unknown'}
Weather: ${currentContext.weather || 'unknown'}

Provide a brief, practical, faith-based suggestion.`;

      const response = await fetch(config.deepseek.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.deepseek.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a Christian wellness coach. Provide brief, practical mood improvement suggestions with spiritual elements. Keep responses to 1-2 sentences.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 100,
          temperature: 0.8,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0]?.message?.content || 'Take a moment to pray and reflect.';
      }

      return 'Take a moment to breathe and connect with God.';

    } catch (error) {
      console.error('Real-time suggestion error:', error);
      return 'Practice gratitude and remember God\'s faithfulness in this moment.';
    }
  }
}