// Simplified Bible Verse Service for Mood-Aligned Scripture Recommendations
// Optimized for stability and performance

export interface BibleVerse {
  id: string;
  reference: string;
  text: string;
  category: string;
  moodTags: string[];
  themes: string[];
  translation: string;
  book: string;
  chapter: number;
  verse: number;
  isOT: boolean;
  comfort: number; // 1-10 scale for comfort level
  encouragement: number; // 1-10 scale for encouragement level
  strength: number; // 1-10 scale for strength/empowerment level
  peace: number; // 1-10 scale for peace level
}

export interface VerseRecommendation {
  verse: BibleVerse;
  relevanceScore: number;
  reason: string;
  aiInsight?: string;
}

export class BibleVerseService {
  private static verses: BibleVerse[] = [
    // PEACE AND COMFORT VERSES
    {
      id: 'peace_001',
      reference: 'Philippians 4:6-7',
      text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
      category: 'Peace',
      moodTags: ['anxious', 'worried', 'stressed', 'calm', 'peaceful'],
      themes: ['peace', 'anxiety', 'prayer', 'protection'],
      translation: 'NIV',
      book: 'Philippians',
      chapter: 4,
      verse: 6,
      isOT: false,
      comfort: 9,
      encouragement: 8,
      strength: 7,
      peace: 10,
    },
    {
      id: 'comfort_001',
      reference: 'Psalm 34:18',
      text: 'The Lord is close to the brokenhearted and saves those who are crushed in spirit.',
      category: 'Comfort',
      moodTags: ['sad', 'lonely', 'hurt', 'broken', 'healing'],
      themes: ['comfort', 'closeness', 'salvation', 'brokenness'],
      translation: 'NIV',
      book: 'Psalms',
      chapter: 34,
      verse: 18,
      isOT: true,
      comfort: 10,
      encouragement: 9,
      strength: 6,
      peace: 8,
    },
    {
      id: 'joy_001',
      reference: 'Nehemiah 8:10',
      text: 'Do not grieve, for the joy of the Lord is your strength.',
      category: 'Joy',
      moodTags: ['sad', 'tired', 'weak', 'joyful', 'happy'],
      themes: ['joy', 'strength', 'grief', 'celebration'],
      translation: 'NIV',
      book: 'Nehemiah',
      chapter: 8,
      verse: 10,
      isOT: true,
      comfort: 7,
      encouragement: 10,
      strength: 9,
      peace: 6,
    },
    {
      id: 'strength_001',
      reference: 'Isaiah 40:31',
      text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
      category: 'Strength',
      moodTags: ['tired', 'weak', 'weary', 'motivated', 'energetic'],
      themes: ['strength', 'hope', 'endurance', 'renewal'],
      translation: 'NIV',
      book: 'Isaiah',
      chapter: 40,
      verse: 31,
      isOT: true,
      comfort: 6,
      encouragement: 9,
      strength: 10,
      peace: 7,
    },
    {
      id: 'hope_001',
      reference: 'Jeremiah 29:11',
      text: 'For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, to give you hope and a future.',
      category: 'Hope',
      moodTags: ['hopeful', 'confused', 'lost', 'future', 'direction'],
      themes: ['hope', 'plans', 'future', 'prosperity'],
      translation: 'NIV',
      book: 'Jeremiah',
      chapter: 29,
      verse: 11,
      isOT: true,
      comfort: 8,
      encouragement: 10,
      strength: 7,
      peace: 8,
    },
    {
      id: 'love_001',
      reference: 'Romans 8:38-39',
      text: 'For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord.',
      category: 'Love',
      moodTags: ['loved', 'lonely', 'rejected', 'cared for', 'connected'],
      themes: ['love', 'security', 'eternal', 'relationship'],
      translation: 'NIV',
      book: 'Romans',
      chapter: 8,
      verse: 38,
      isOT: false,
      comfort: 10,
      encouragement: 9,
      strength: 8,
      peace: 9,
    },
    {
      id: 'wisdom_001',
      reference: 'James 1:5',
      text: 'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.',
      category: 'Wisdom',
      moodTags: ['confused', 'uncertain', 'seeking', 'decision', 'clarity'],
      themes: ['wisdom', 'guidance', 'asking', 'generosity'],
      translation: 'NIV',
      book: 'James',
      chapter: 1,
      verse: 5,
      isOT: false,
      comfort: 7,
      encouragement: 8,
      strength: 6,
      peace: 8,
    },
    {
      id: 'courage_001',
      reference: 'Joshua 1:9',
      text: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.',
      category: 'Courage',
      moodTags: ['fearful', 'afraid', 'courageous', 'brave', 'confident'],
      themes: ['courage', 'strength', 'presence', 'command'],
      translation: 'NIV',
      book: 'Joshua',
      chapter: 1,
      verse: 9,
      isOT: true,
      comfort: 6,
      encouragement: 10,
      strength: 9,
      peace: 7,
    },
    {
      id: 'faith_001',
      reference: 'Matthew 17:20',
      text: 'He replied, "Because you have so little faith. Truly I tell you, if you have faith as small as a mustard seed, you can say to this mountain, \'Move from here to there,\' and it will move. Nothing will be impossible for you."',
      category: 'Faith',
      moodTags: ['faithful', 'doubt', 'believing', 'trust', 'disbelief'],
      themes: ['faith', 'power', 'possibility', 'mustard seed'],
      translation: 'NIV',
      book: 'Matthew',
      chapter: 17,
      verse: 20,
      isOT: false,
      comfort: 7,
      encouragement: 9,
      strength: 8,
      peace: 8,
    },
    {
      id: 'guidance_001',
      reference: 'Psalm 119:105',
      text: 'Your word is a lamp for my feet, a light on my path.',
      category: 'Guidance',
      moodTags: ['confused', 'seeking', 'direction', 'lost', 'guided'],
      themes: ['guidance', 'word', 'light', 'path'],
      translation: 'NIV',
      book: 'Psalms',
      chapter: 119,
      verse: 105,
      isOT: true,
      comfort: 7,
      encouragement: 8,
      strength: 6,
      peace: 9,
    },
    {
      id: 'forgiveness_001',
      reference: '1 John 1:9',
      text: 'If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness.',
      category: 'Forgiveness',
      moodTags: ['guilty', 'ashamed', 'forgiven', 'cleansed', 'restored'],
      themes: ['forgiveness', 'confession', 'faithfulness', 'purification'],
      translation: 'NIV',
      book: '1 John',
      chapter: 1,
      verse: 9,
      isOT: false,
      comfort: 10,
      encouragement: 9,
      strength: 7,
      peace: 9,
    },
    {
      id: 'healing_001',
      reference: 'Jeremiah 17:14',
      text: 'Heal me, Lord, and I will be healed; save me and I will be saved, for you are the one I praise.',
      category: 'Healing',
      moodTags: ['healing', 'hurt', 'wounded', 'restored', 'healthy'],
      themes: ['healing', 'salvation', 'praise', 'restoration'],
      translation: 'NIV',
      book: 'Jeremiah',
      chapter: 17,
      verse: 14,
      isOT: true,
      comfort: 9,
      encouragement: 8,
      strength: 7,
      peace: 8,
    },
    {
      id: 'provision_001',
      reference: 'Philippians 4:19',
      text: 'And my God will meet all your needs according to the riches of his glory in Christ Jesus.',
      category: 'Provision',
      moodTags: ['worried', 'lacking', 'provided', 'supplied', 'cared for'],
      themes: ['provision', 'needs', 'riches', 'glory'],
      translation: 'NIV',
      book: 'Philippians',
      chapter: 4,
      verse: 19,
      isOT: false,
      comfort: 9,
      encouragement: 9,
      strength: 7,
      peace: 8,
    },
    {
      id: 'care_001',
      reference: '1 Peter 5:7',
      text: 'Cast all your anxiety on him because he cares for you.',
      category: 'Care',
      moodTags: ['anxious', 'worried', 'cared for', 'burdened', 'supported'],
      themes: ['care', 'anxiety', 'casting', 'burdens'],
      translation: 'NIV',
      book: '1 Peter',
      chapter: 5,
      verse: 7,
      isOT: false,
      comfort: 10,
      encouragement: 8,
      strength: 6,
      peace: 9,
    },
    {
      id: 'connection_001',
      reference: 'Matthew 28:20',
      text: 'And surely I am with you always, to the very end of the age.',
      category: 'Connection',
      moodTags: ['lonely', 'connected', 'present', 'abandoned', 'accompanied'],
      themes: ['presence', 'always', 'endurance', 'companionship'],
      translation: 'NIV',
      book: 'Matthew',
      chapter: 28,
      verse: 20,
      isOT: false,
      comfort: 9,
      encouragement: 8,
      strength: 7,
      peace: 10,
    },
  ];

  /**
   * Get verse recommendations for a specific mood
   */
  static getVersesForMood(moodType: string, intensity: number = 5, count: number = 3): VerseRecommendation[] {
    try {
      // Normalize mood type for matching
      const normalizedMood = moodType.toLowerCase().trim();
      
      // Find verses that match the mood
      const matchingVerses = this.verses.filter(verse => {
        return verse.moodTags.some(tag => 
          normalizedMood.includes(tag) || tag.includes(normalizedMood)
        );
      });

      // If no specific matches, get general comfort verses
      if (matchingVerses.length === 0) {
        const generalVerses = this.verses.filter(verse => 
          ['Peace', 'Comfort', 'Hope', 'Love'].includes(verse.category)
        );
        return this.rankVerses(generalVerses, intensity, count);
      }

      return this.rankVerses(matchingVerses, intensity, count);
    } catch (error) {
      console.error('Error getting verses for mood:', error);
      return this.getFallbackVerses(count);
    }
  }

  /**
   * Get enhanced verse with AI insights
   */
  static async getEnhancedVerseForMood(moodType: string, intensity: number = 5, notes?: string): Promise<VerseRecommendation | null> {
    try {
      const recommendations = this.getVersesForMood(moodType, intensity, 1);
      if (recommendations.length === 0) return null;

      const verse = recommendations[0];
      
      // Add AI insight (simplified for now)
      verse.aiInsight = this.generateAIInsight(verse.verse, moodType, intensity);
      
      return verse;
    } catch (error) {
      console.error('Error getting enhanced verse:', error);
      return null;
    }
  }

  /**
   * Get verse by category
   */
  static getVersesByCategory(category: string, count: number = 5): VerseRecommendation[] {
    try {
      const categoryVerses = this.verses.filter(verse => 
        verse.category.toLowerCase() === category.toLowerCase()
      );
      
      return this.rankVerses(categoryVerses, 5, count);
    } catch (error) {
      console.error('Error getting verses by category:', error);
      return this.getFallbackVerses(count);
    }
  }

  /**
   * Get random verse
   */
  static getRandomVerse(): VerseRecommendation {
    try {
      const randomIndex = Math.floor(Math.random() * this.verses.length);
      const verse = this.verses[randomIndex];
      
      return {
        verse,
        relevanceScore: 7.0,
        reason: 'Random selection for daily inspiration',
        aiInsight: this.generateAIInsight(verse, 'random', 5)
      };
    } catch (error) {
      console.error('Error getting random verse:', error);
      // Return a fallback verse
      return {
        verse: this.verses[0],
        relevanceScore: 5.0,
        reason: 'Fallback verse',
        aiInsight: 'This verse offers comfort and hope for your journey.'
      };
    }
  }

  /**
   * Search verses by text content
   */
  static searchVerses(query: string, count: number = 10): VerseRecommendation[] {
    try {
      const searchQuery = query.toLowerCase().trim();
      if (!searchQuery) return this.getFallbackVerses(count);

      const matchingVerses = this.verses.filter(verse => 
        verse.text.toLowerCase().includes(searchQuery) ||
        verse.reference.toLowerCase().includes(searchQuery) ||
        verse.themes.some(theme => theme.toLowerCase().includes(searchQuery))
      );

      return this.rankVerses(matchingVerses, 5, count);
    } catch (error) {
      console.error('Error searching verses:', error);
      return this.getFallbackVerses(count);
    }
  }

  /**
   * Private helper to rank and select verses
   */
  private static rankVerses(verses: BibleVerse[], intensity: number, count: number): VerseRecommendation[] {
    try {
      return verses
        .map(verse => {
          // Calculate relevance score based on mood match and intensity
          const baseScore = 5.0;
          const intensityBonus = (intensity / 10) * 3.0;
          const categoryBonus = this.getCategoryBonus(verse.category, intensity);
          const relevanceScore = Math.min(10.0, baseScore + intensityBonus + categoryBonus);

          return {
            verse,
            relevanceScore,
            reason: this.generateReason(verse, intensity),
            aiInsight: this.generateAIInsight(verse, 'general', intensity)
          };
        })
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, count);
    } catch (error) {
      console.error('Error ranking verses:', error);
      return this.getFallbackVerses(count);
    }
  }

  /**
   * Get category bonus score
   */
  private static getCategoryBonus(category: string, intensity: number): number {
    const categoryScores: Record<string, number> = {
      'Peace': Math.max(0, (6 - intensity) * 0.5), // More relevant for lower intensity
      'Comfort': 2.0,
      'Joy': Math.max(0, (intensity - 4) * 0.3), // More relevant for higher intensity
      'Strength': Math.max(0, (intensity - 5) * 0.4),
      'Hope': 1.5,
      'Love': 1.8,
      'Wisdom': 1.2,
      'Courage': Math.max(0, (intensity - 6) * 0.3),
      'Faith': 1.4,
      'Guidance': 1.3,
      'Forgiveness': 2.2,
      'Healing': 2.0,
      'Provision': 1.6,
      'Care': 2.1,
      'Connection': 1.9,
    };

    return categoryScores[category] || 1.0;
  }

  /**
   * Generate reason for verse recommendation
   */
  private static generateReason(verse: BibleVerse, intensity: number): string {
    const reasons: Record<string, string[]> = {
      'Peace': [
        'This verse speaks directly to finding calm amidst life\'s storms.',
        'God promises His peace that surpasses understanding in difficult times.',
        'Perfect for moments when anxiety threatens to overwhelm your spirit.'
      ],
      'Comfort': [
        'God draws near to those who are hurting and offers His healing presence.',
        'In your season of sorrow, find refuge in the Lord\'s tender care.',
        'The Lord holds every tear and binds up every broken heart.'
      ],
      'Joy': [
        'Your joy is not dependent on circumstances but on Christ within you.',
        'Even in difficult seasons, God gives strength to rejoice.',
        'Joy comes from the Lord and reflects His love in your life.'
      ],
      'Strength': [
        'God empowers you with strength for every challenge you face.',
        'In your weakness, God\'s power is made perfect and complete.',
        'You are stronger than you know because God\'s strength works through you.'
      ],
      'Hope': [
        'God has beautiful plans for your future, even when you cannot see them.',
        'Your hope is anchored in the unchanging character of God.',
        'In uncertain times, fix your eyes on the hope that God provides.'
      ],
      'Love': [
        'God\'s love for you is unconditional and eternal, never changing.',
        'You are deeply loved and valued beyond what you can comprehend.',
        'God\'s love surrounds you like a protective shield each day.'
      ]
    };

    const categoryReasons = reasons[verse.category] || [
      'This verse offers spiritual wisdom and divine perspective for your journey.',
      'God\'s word provides guidance and comfort for your current season.',
      'This scripture speaks to the needs of your heart today.'
    ];

    return categoryReasons[Math.floor(Math.random() * categoryReasons.length)];
  }

  /**
   * Generate AI insight (simplified version)
   */
  private static generateAIInsight(verse: BibleVerse, moodType: string, intensity: number): string {
    const insights: Record<string, string[]> = {
      'Peace': [
        'This verse reminds us that God\'s peace is not dependent on our circumstances but on His presence in our lives.',
        'In a world full of anxiety, this promise of God\'s peace is both a comfort and a choice we can make daily.',
        'God\'s peace acts as a guardian for our hearts and minds, protecting us from worry and fear.'
      ],
      'Comfort': [
        'God\'s comfort is not just emotional but spiritual, providing deep healing for wounded souls.',
        'In times of grief, remember that God holds every tear and understands every pain you feel.',
        'The comfort God offers is intimate and personal, reaching the deepest places of your heart.'
      ],
      'Joy': [
        'Your joy is not a feeling to be pursued but a fruit of the Spirit to be cultivated.',
        'Even in challenging times, joy can coexist with difficulty because it\'s rooted in God\'s love.',
        'Joy is infectious and reflects God\'s nature to those around you.'
      ],
      'Strength': [
        'God\'s strength is not just for major battles but for everyday challenges and decisions.',
        'When you feel weak, remember that God\'s power works best through surrendered hearts.',
        'Strength in God is not about personal achievement but about dependence on His capabilities.'
      ],
      'default': [
        'This verse offers both comfort and challenge, encouraging growth through adversity.',
        'God\'s word provides timeless wisdom that applies to both ancient and modern challenges.',
        'Scripture serves as both a mirror reflecting our needs and a window showing God\'s character.'
      ]
    };

    const verseInsights = insights[verse.category] || insights['default'];
    return verseInsights[Math.floor(Math.random() * verseInsights.length)];
  }

  /**
   * Get fallback verses when errors occur
   */
  private static getFallbackVerses(count: number): VerseRecommendation[] {
    try {
      const fallbackVerses = this.verses.slice(0, Math.min(count, 5)).map(verse => ({
        verse,
        relevanceScore: 6.0,
        reason: 'Timeless biblical comfort and guidance',
        aiInsight: 'This verse offers enduring wisdom for life\'s journey.'
      }));
      
      return fallbackVerses;
    } catch (error) {
      console.error('Error getting fallback verses:', error);
      // Return at least one verse to prevent crashes
      return [{
        verse: {
          id: 'fallback_001',
          reference: 'Philippians 4:6-7',
          text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
          category: 'Peace',
          moodTags: ['peaceful', 'anxious', 'worried'],
          themes: ['peace', 'prayer', 'anxiety'],
          translation: 'NIV',
          book: 'Philippians',
          chapter: 4,
          verse: 6,
          isOT: false,
          comfort: 9,
          encouragement: 8,
          strength: 7,
          peace: 10,
        },
        relevanceScore: 5.0,
        reason: 'Universal comfort for any situation',
        aiInsight: 'Peace is available to all who seek it through prayer and thanksgiving.'
      }];
    }
  }
}

export default BibleVerseService;