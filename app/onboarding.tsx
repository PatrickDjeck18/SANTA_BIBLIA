import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Animated,
  ScrollView,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';
import {
  Book,
  Heart,
  Brain,
  MessageCircle,
  Moon,
  FileText,
  ChevronRight,
  Check,
  Sparkles,
  Target,
  Zap,
  User,
  Star,
  ArrowRight,
  Smile,
  TrendingUp,
  Shield,
  Award,
  Clock,
  BookOpen,
  Bot,
  Compass,
  Gem,
} from 'lucide-react-native';
import { useOnboarding } from '@/hooks/useOnboarding';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Enhanced mobile responsiveness helpers
const isVerySmallScreen = screenWidth < 360;
const isSmallScreen = screenWidth >= 360 && screenWidth < 375;
const isMediumScreen = screenWidth >= 375 && screenWidth < 414;
const isLargeScreen = screenWidth >= 414;
const isTablet = screenWidth >= 768;
const isLandscape = screenWidth > screenHeight;
const isCompactMode = isVerySmallScreen || (isSmallScreen && screenHeight < 700);
const needsCompactLayout = isCompactMode || isLandscape;
const hasNotch = Platform.OS === 'ios' && (screenHeight > 800);

const getResponsiveSpacing = (verySmall: number, small: number, medium: number, large: number) => {
  const multiplier = isLandscape ? 0.6 : (needsCompactLayout ? 0.7 : 1.0);
  if (isVerySmallScreen) return verySmall * multiplier;
  if (isSmallScreen) return small * multiplier;
  if (isMediumScreen) return medium * multiplier;
  return large * multiplier;
};

const getResponsiveFontSize = (verySmall: number, small: number, medium: number, large: number) => {
  const multiplier = isLandscape ? 0.8 : (needsCompactLayout ? 0.85 : 1.0);
  if (isVerySmallScreen) return verySmall * multiplier;
  if (isSmallScreen) return small * multiplier;
  if (isMediumScreen) return medium * multiplier;
  return large * multiplier;
};

const getMobileTouchTarget = () => {
  if (isVerySmallScreen) return 44;
  return 52;
};

// Onboarding preferences interface
interface OnboardingPreferences {
  selectedFeatures: string[];
  bibleReadingFrequency?: string;
  prayerFrequency?: string;
  moodTrackingInterest?: string;
  quizLevel?: string;
  aiUsage?: string;
  dreamInterest?: string;
  notesUsage?: string;
  spiritualGoals?: string[];
  completedAt: string;
}

// Feature categories with emotional benefits and questions
const featureCategories = [
  {
    id: 'bible',
    title: 'Bible Study',
    icon: Book,
    color: Colors.primary[600],
    gradient: Colors.gradients.primary,
    benefit: 'Transform your daily walk with Scripture',
    emotional: 'Find peace and guidance in God\'s Word',
    questions: [
      {
        id: 'frequency',
        question: 'How often do you read the Bible?',
        type: 'single',
        options: [
          { value: 'daily', label: 'Daily', benefit: 'Build a powerful daily habit' },
          { value: 'few-times-week', label: 'Few times a week', benefit: 'Create a consistent rhythm' },
          { value: 'weekly', label: 'Weekly', benefit: 'Start a meaningful journey' },
          { value: 'occasionally', label: 'Occasionally', benefit: 'Rediscover the joy of Scripture' },
          { value: 'never', label: 'I\'m new to this', benefit: 'Begin your spiritual adventure' },
        ],
      },
      {
        id: 'translation',
        question: 'What translation do you prefer?',
        type: 'single',
        options: [
          { value: 'niv', label: 'NIV (New International Version)', benefit: 'Clear, modern translation for daily reading' },
          { value: 'nlt', label: 'NLT (New Living Translation)', benefit: 'Easy-to-understand language for deeper insights' },
          { value: 'esv', label: 'ESV (English Standard Version)', benefit: 'Word-for-word accuracy for serious study' },
          { value: 'kjv', label: 'KJV (King James Version)', benefit: 'Timeless, poetic language that resonates' },
          { value: 'no-preference', label: 'No preference', benefit: 'We\'ll choose the best version for you' },
        ],
      },
    ],
  },
  {
    id: 'prayer',
    title: 'Prayer Tracking',
    icon: Heart,
    color: Colors.error[500],
    gradient: ['#DC2626', '#EF4444', '#F87171'],
    benefit: 'See God\'s faithfulness through answered prayers',
    emotional: 'Experience the power of prayer in your life',
    questions: [
      {
        id: 'frequency',
        question: 'How often do you pray?',
        type: 'single',
        options: [
          { value: 'multiple-daily', label: 'Multiple times daily', benefit: 'Deepen your prayer life' },
          { value: 'daily', label: 'Daily', benefit: 'Stay connected with God' },
          { value: 'few-times-week', label: 'Few times a week', benefit: 'Build a prayer habit' },
          { value: 'weekly', label: 'Weekly', benefit: 'Start your prayer journey' },
          { value: 'learning', label: 'I\'m learning', benefit: 'Discover the power of prayer' },
        ],
      },
      {
        id: 'requests',
        question: 'Do you keep track of prayer requests?',
        type: 'single',
        options: [
          { value: 'yes-active', label: 'Yes, actively', benefit: 'See prayers answered' },
          { value: 'yes-sometimes', label: 'Yes, sometimes', benefit: 'Stay organized' },
          { value: 'no-want', label: 'No, but I want to', benefit: 'Start tracking today' },
          { value: 'no', label: 'No', benefit: 'Experience the benefits' },
        ],
      },
    ],
  },
  {
    id: 'mood',
    title: 'Mood Tracking',
    icon: Brain,
    color: Colors.warning[500],
    gradient: ['#059669', '#10B981', '#34D399'],
    benefit: 'Connect your emotional well-being with spiritual growth',
    emotional: 'Find peace and balance in your daily life',
    questions: [
      {
        id: 'interest',
        question: 'How important is emotional well-being to you?',
        type: 'single',
        options: [
          { value: 'very', label: 'Very important', benefit: 'Track your spiritual wellness' },
          { value: 'somewhat', label: 'Somewhat important', benefit: 'Discover patterns' },
          { value: 'curious', label: 'Curious about it', benefit: 'Explore connections' },
          { value: 'not-sure', label: 'Not sure', benefit: 'Learn more' },
        ],
      },
    ],
  },
  {
    id: 'quiz',
    title: 'Bible Quiz',
    icon: Target,
    color: Colors.success[500],
    gradient: ['#7C3AED', '#8B5CF6', '#A78BFA'],
    benefit: 'Grow in knowledge and deepen your understanding',
    emotional: 'Feel confident in your biblical knowledge',
    questions: [
      {
        id: 'level',
        question: 'How familiar are you with the Bible?',
        type: 'single',
        options: [
          { value: 'expert', label: 'Very familiar', benefit: 'Challenge yourself' },
          { value: 'intermediate', label: 'Somewhat familiar', benefit: 'Test your knowledge' },
          { value: 'beginner', label: 'Just starting', benefit: 'Learn as you go' },
          { value: 'curious', label: 'Curious to learn', benefit: 'Begin your journey' },
        ],
      },
    ],
  },
  {
    id: 'ai',
    title: 'AI Bible Chat',
    icon: MessageCircle,
    color: Colors.secondary[500],
    gradient: ['#DB2777', '#EC4899', '#F472B6'],
    benefit: 'Get instant answers to your spiritual questions',
    emotional: 'Never feel alone in your search for truth',
    questions: [
      {
        id: 'usage',
        question: 'Have you used AI for Bible study?',
        type: 'single',
        options: [
          { value: 'yes-regularly', label: 'Yes, regularly', benefit: 'Enhance your study' },
          { value: 'yes-occasionally', label: 'Yes, occasionally', benefit: 'Explore deeper' },
          { value: 'no-interest', label: 'No, but interested', benefit: 'Discover AI insights' },
          { value: 'no', label: 'No', benefit: 'Try something new' },
        ],
      },
    ],
  },
  {
    id: 'dream',
    title: 'Dream Interpretation',
    icon: Moon,
    color: Colors.primary[500],
    gradient: ['#6366F1', '#8B5CF6', '#A78BFA'],
    benefit: 'Understand the spiritual meaning of your dreams',
    emotional: 'Find clarity in your life\'s mysteries',
    questions: [
      {
        id: 'interest',
        question: 'Do you remember your dreams often?',
        type: 'single',
        options: [
          { value: 'yes-daily', label: 'Yes, almost daily', benefit: 'Unlock their meaning' },
          { value: 'yes-regularly', label: 'Yes, regularly', benefit: 'Discover insights' },
          { value: 'sometimes', label: 'Sometimes', benefit: 'Explore interpretation' },
          { value: 'rarely', label: 'Rarely', benefit: 'Learn more' },
        ],
      },
    ],
  },
  {
    id: 'gratitude',
    title: 'Gratitude Journal',
    icon: Star,
    color: '#F59E0B',
    gradient: ['#D97706', '#F59E0B', '#FBBF24'],
    benefit: 'Cultivate a heart of gratitude and joy',
    emotional: 'Discover more joy in everyday blessings',
    questions: [
      {
        id: 'practice',
        question: 'Do you practice gratitude?',
        type: 'single',
        options: [
          { value: 'daily', label: 'Yes, daily', benefit: 'Deepen your practice' },
          { value: 'regularly', label: 'Yes, regularly', benefit: 'Stay consistent' },
          { value: 'sometimes', label: 'Sometimes', benefit: 'Build the habit' },
          { value: 'want-to', label: 'Want to start', benefit: 'Begin your journey' },
        ],
      },
    ],
  },
  {
    id: 'notes',
    title: 'Spiritual Notes',
    icon: FileText,
    color: Colors.neutral[600],
    gradient: ['#6366F1', '#8B5CF6', '#78716C'],
    benefit: 'Capture insights and revelations',
    emotional: 'Never lose a moment of divine inspiration',
    questions: [
      {
        id: 'usage',
        question: 'Do you take notes during Bible study?',
        type: 'single',
        options: [
          { value: 'always', label: 'Always', benefit: 'Organize better' },
          { value: 'often', label: 'Often', benefit: 'Enhance your notes' },
          { value: 'sometimes', label: 'Sometimes', benefit: 'Capture more insights' },
          { value: 'never', label: 'Never', benefit: 'Start documenting' },
        ],
      },
    ],
  },
];

// Modern Welcome Screen - Emotionally Driven Experience
const WelcomeScreen = ({ onNext }: { onNext: () => void }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const [benefitIndex, setBenefitIndex] = useState(0);
  const [currentStory, setCurrentStory] = useState(0);

  // Emotionally compelling transformation stories that resonate deeply
  const transformationStories = [
    {
      title: "From Anxiety to Absolute Peace",
      subtitle: "92% of users report feeling calmer within first week",
      benefit: "Transform your anxious thoughts into God's perfect peace",
      emoji: "🕊️"
    },
    {
      title: "Break Through Loneliness Forever",
      subtitle: "Users discover God's presence in 94% of daily moments",
      benefit: "Never feel alone when you know He's always with you",
      emoji: "💫"
    },
    {
      title: "Watch Miracles Happen Daily",
      subtitle: "Track answered prayers that will leave you amazed",
      benefit: "See God's faithfulness unfold in incredible ways",
      emoji: "🌱"
    },
    {
      title: "Build Unshakeable Confidence",
      subtitle: "Users report 89% increase in faith strength",
      benefit: "Face life's challenges with supernatural courage",
      emoji: "⚡"
    }
  ];

  // Enhanced benefits with compelling emotional impact
  const benefits = [
    {
      icon: Heart,
      text: 'Feel Gods overwhelming love wash over your anxious thoughts',
      color: Colors.error[500],
      description: 'Experience instant peace when life feels overwhelming'
    },
    {
      icon: TrendingUp,
      text: 'Watch your faith transform from scattered to STRONG daily',
      color: Colors.success[500],
      description: 'Build unshakeable confidence in His promises'
    },
    {
      icon: Shield,
      text: 'Discover supernatural strength you never knew existed',
      color: Colors.primary[600],
      description: 'Face impossible situations with divine courage'
    },
    {
      icon: Award,
      text: 'Celebrate answered prayers that will leave you amazed',
      color: Colors.warning[500],
      description: 'Document miracles you\'ll treasure forever'
    },
  ];

  useEffect(() => {
    // Staggered animations for more engaging entrance
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Rotate through benefits with glow effect
    const benefitInterval = setInterval(() => {
      setBenefitIndex((prev) => (prev + 1) % benefits.length);
      
      // Pulse glow animation on benefit change
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, 3000);

    // Cycle through transformation stories
    const storyInterval = setInterval(() => {
      setCurrentStory((prev) => (prev + 1) % transformationStories.length);
    }, 4000);

    return () => {
      clearInterval(benefitInterval);
      clearInterval(storyInterval);
    };
  }, []);

  const currentBenefit = benefits[benefitIndex];
  const currentTransformation = transformationStories[currentStory];

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.welcomeScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.welcomeContent,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          {/* Modern Hero Section with Glass Morphism */}
          <Animated.View style={styles.heroSection}>
            <LinearGradient
              colors={['rgba(236, 72, 153, 0.9)', 'rgba(139, 92, 246, 0.9)', 'rgba(255, 149, 0, 0.9)']}
              style={styles.heroGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.heroBackgroundEffect} />
              <View style={styles.heroIconContainer}>
                <Sparkles size={72} color="white" strokeWidth={2.5} />
                <Animated.View
                  style={[
                    styles.heroGlowEffect,
                    { opacity: glowAnim }
                  ]}
                />
              </View>
              
              {/* Floating particles effect */}
              <View style={styles.particleContainer}>
                {[...Array(6)].map((_, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.particle,
                      {
                        left: `${20 + i * 15}%`,
                        top: `${30 + (i % 2) * 40}%`,
                        animationDelay: `${i * 200}ms`,
                      }
                    ]}
                  />
                ))}
              </View>
            </LinearGradient>
          </Animated.View>
          
          {/* Transformation Story Section */}
          <Animated.View style={styles.transformationStoryCard}>
            <Text style={styles.storyEmoji}>{currentTransformation.emoji}</Text>
            <Text style={styles.transformationTitle}>{currentTransformation.title}</Text>
            <Text style={styles.transformationSubtitle}>{currentTransformation.subtitle}</Text>
            <Text style={styles.transformationBenefit}>{currentTransformation.benefit}</Text>
          </Animated.View>
          
          <Text style={styles.welcomeTitle}>
            Your Journey to Deeper Faith Starts Here
          </Text>
          
          <Text style={styles.welcomeSubtitle}>
            More than an app—it's your personal spiritual companion designed to transform your relationship with God
          </Text>

          {/* Dynamic Benefits with Enhanced Design */}
          <Animated.View style={[styles.benefitCard, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={[
                currentBenefit.color + '25',
                currentBenefit.color + '15',
                'rgba(255, 255, 255, 0.9)'
              ]}
              style={styles.benefitCardGradient}
            >
              <View style={[styles.benefitIconContainer, { backgroundColor: currentBenefit.color + '20' }]}>
                <currentBenefit.icon size={32} color={currentBenefit.color} />
              </View>
              <View style={styles.benefitContent}>
                <Text style={[styles.benefitText, { color: currentBenefit.color }]}>
                  {currentBenefit.text}
                </Text>
                <Text style={styles.benefitDescription}>
                  {currentBenefit.description}
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Interactive Features Preview with Hover Effects */}
          <View style={styles.featuresPreview}>
            <Text style={styles.featuresPreviewTitle}>✨ Powerful Tools for Your Spiritual Growth</Text>
            <View style={styles.featuresList}>
              {[
                {
                  icon: BookOpen,
                  title: 'Bible Reading Plans',
                  description: 'Personalized daily scripture',
                  color: Colors.primary[600]
                },
                {
                  icon: Heart,
                  title: 'Prayer Tracking',
                  description: 'See God\'s faithfulness unfold',
                  color: Colors.error[500]
                },
                {
                  icon: Brain,
                  title: 'Mood & Wellness',
                  description: 'Connect soul and spirit',
                  color: Colors.warning[500]
                },
                {
                  icon: Target,
                  title: 'Bible Quizzes',
                  description: 'Test and grow your knowledge',
                  color: Colors.success[500]
                },
                {
                  icon: Bot,
                  title: 'AI Bible Chat',
                  description: 'Instant spiritual guidance',
                  color: Colors.secondary[500]
                },
              ].map((feature, index) => (
                <TouchableOpacity key={index} style={styles.featurePreviewItem} activeOpacity={0.7}>
                  <LinearGradient
                    colors={[feature.color + '15', 'rgba(255, 255, 255, 0.9)']}
                    style={styles.featureGradientCard}
                  >
                    <View style={styles.featurePreviewIcon}>
                      <feature.icon size={22} color={feature.color} />
                    </View>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Social Proof Section */}
          <View style={styles.socialProofCard}>
            <Text style={styles.socialProofTitle}>Join thousands transforming their faith</Text>
            <View style={styles.socialProofStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>50,000+</Text>
                <Text style={styles.statLabel}>Lives Touched</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>1M+</Text>
                <Text style={styles.statLabel}>Prayers Tracked</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>98%</Text>
                <Text style={styles.statLabel}>Feel Closer to God</Text>
              </View>
            </View>
          </View>

          <Text style={styles.welcomeDescription}>
            In just 2 minutes, we'll personalize Daily Bread to match your unique spiritual journey and goals.
            This isn't just setup—it's the beginning of your transformation. ✨
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Enhanced CTA Button */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          onNext();
        }}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#EC4899', '#8B5CF6', '#FF9500']}
          style={styles.nextButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.nextButtonText}>Start My Transformation</Text>
          <ArrowRight size={22} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

// Enhanced Feature Questionnaire with Visual Storytelling
const FeatureQuestionnaireScreen = ({
  selectedFeatures,
  onToggleFeature,
  answers,
  onAnswer,
  onNext,
  currentFeatureIndex,
}: {
  selectedFeatures: string[];
  onToggleFeature: (featureId: string) => void;
  answers: Record<string, any>;
  onAnswer: (featureId: string, questionId: string, value: any) => void;
  onNext: () => void;
  currentFeatureIndex: number;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const [localAnswers, setLocalAnswers] = useState<Record<string, any>>(answers);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);

  const currentFeature = featureCategories[currentFeatureIndex];
  if (!currentFeature) return null;

  const currentQuestions = currentFeature.questions || [];
  const featureAnswers = localAnswers[currentFeature.id] || {};

  useEffect(() => {
    // Enhanced entrance animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Pulsing glow effect for feature icon
    const glowInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2000);

    return () => clearInterval(glowInterval);
  }, [currentFeatureIndex]);

  const handleAnswer = (questionId: string, value: any, optionIndex: number) => {
    const newAnswers = {
      ...localAnswers,
      [currentFeature.id]: {
        ...featureAnswers,
        [questionId]: value,
      },
    };
    setLocalAnswers(newAnswers);
    setSelectedOptionIndex(optionIndex);
    onAnswer(currentFeature.id, questionId, value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Trigger success animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.02,
        tension: 300,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const canContinue = currentQuestions.every((q) => featureAnswers[q.id] !== undefined);

  // User journey insights for each feature
  const getUserInsight = (featureId: string) => {
    const insights = {
      bible: "💫 Users who complete Bible reading plans daily report 85% higher spiritual satisfaction",
      prayer: "🙏 People who track prayers see 73% more answered prayers within 30 days",
      mood: "🧠 Mood tracking reveals that spiritual practices improve emotional well-being by 67%",
      quiz: "🎯 Bible quiz participants increase their scripture knowledge by 45% in just 2 weeks",
      ai: "🤖 AI-powered Bible chat provides personalized insights that deepen understanding by 89%",
      dream: "🌙 Dream interpretation helps users find meaning and guidance in 91% of cases",
      gratitude: "✨ Daily gratitude practice increases joy and contentment by 78%",
      notes: "📝 Study notes help users retain spiritual insights 3x longer",
    };
    return insights[featureId as keyof typeof insights] || "✨ This feature will transform your spiritual journey";
  };

  const insight = getUserInsight(currentFeature.id);

  return (
    <View style={styles.screen}>
      <Animated.View style={[styles.questionnaireHeader, { opacity: fadeAnim }]}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[currentFeature.color + '40', currentFeature.color]}
            style={styles.progressFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
        <Text style={styles.progressText}>
          {currentFeatureIndex + 1} of {featureCategories.length} • {Math.round(((currentFeatureIndex + 1) / featureCategories.length) * 100)}% Complete
        </Text>
      </Animated.View>

      <ScrollView
        style={styles.questionnaireScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.questionnaireContent}
      >
        {/* Enhanced Feature Header */}
        <Animated.View style={[
          styles.featureQuestionHeader,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}>
          {/* Animated Background */}
          <LinearGradient
            colors={[currentFeature.color + '20', 'rgba(255, 255, 255, 0.9)', currentFeature.color + '10']}
            style={styles.featureHeaderBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.View
              style={[
                styles.featureIconContainer,
                {
                  backgroundColor: currentFeature.color,
                  shadowColor: currentFeature.color,
                  shadowOpacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.2, 0.6],
                  }),
                }
              ]}
            >
              <currentFeature.icon size={48} color="white" />
              <Animated.View
                style={[
                  styles.featureIconGlow,
                  {
                    opacity: glowAnim,
                    backgroundColor: currentFeature.color,
                  }
                ]}
              />
            </Animated.View>
          </LinearGradient>
          
          <Text style={styles.featureQuestionTitle}>{currentFeature.title}</Text>
          <Text style={styles.featureQuestionBenefit}>{currentFeature.benefit}</Text>
          <Text style={styles.featureQuestionEmotional}>{currentFeature.emotional}</Text>
          
          {/* User Insight */}
          <View style={styles.userInsightContainer}>
            <Text style={styles.userInsight}>{insight}</Text>
          </View>
        </Animated.View>

        {/* Dynamic Feature Preview */}
        <Animated.View style={styles.featurePreviewSection}>
          <View style={styles.featurePreviewCard}>
            <Text style={styles.featurePreviewTitle}>What you'll experience:</Text>
            {selectedFeatures.includes(currentFeature.id) ? (
              <View style={styles.activeFeatureBadge}>
                <currentFeature.icon size={16} color="white" />
                <Text style={styles.activeFeatureText}>Enabled for your journey</Text>
              </View>
            ) : (
              <View style={styles.disabledFeatureBadge}>
                <Text style={styles.disabledFeatureText}>Optional - but highly recommended!</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Enhanced Questions */}
        {currentQuestions.map((question, qIndex) => (
          <Animated.View
            key={question.id}
            style={[
              styles.questionCard,
              {
                opacity: fadeAnim,
                transform: [{
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40 + (qIndex * 15), 0],
                  })
                }]
              }
            ]}
          >
            <Text style={styles.questionText}>{question.question}</Text>
            
            <View style={styles.optionsContainer}>
              {question.options.map((option, oIndex) => {
                const isSelected = featureAnswers[question.id] === option.value;
                return (
                  <TouchableOpacity
                    key={oIndex}
                    style={[
                      styles.optionButton,
                      isSelected && styles.optionButtonSelected,
                    ]}
                    onPress={() => handleAnswer(question.id, option.value, oIndex)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        isSelected
                          ? [currentFeature.gradient[0], currentFeature.gradient[1], currentFeature.gradient[2]]
                          : ['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.95)']
                      }
                      style={styles.optionGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.optionContent}>
                        <View style={styles.optionHeader}>
                          <Text
                            style={[
                              styles.optionLabel,
                              isSelected && styles.optionLabelSelected,
                            ]}
                          >
                            {option.label}
                          </Text>
                          {isSelected && (
                            <View style={styles.optionCheck}>
                              <Check size={20} color="white" />
                            </View>
                          )}
                        </View>
                        {option.benefit && (
                          <Text
                            style={[
                              styles.optionBenefit,
                              isSelected && styles.optionBenefitSelected,
                            ]}
                          >
                            ✨ {option.benefit}
                          </Text>
                        )}
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        ))}

        {/* Motivation Section */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationTitle}>You're doing great! 🌟</Text>
          <Text style={styles.motivationText}>
            Every answer helps us personalize your spiritual journey. We're almost done creating your perfect experience.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.questionnaireButtons}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onNext();
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.nextButton,
            styles.nextButtonFlex,
            !canContinue && styles.nextButtonDisabled,
            canContinue && {
              shadowColor: currentFeature.color,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }
          ]}
          onPress={() => {
            if (canContinue) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              onNext();
            }
          }}
          disabled={!canContinue}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={canContinue
              ? [currentFeature.gradient[0], currentFeature.gradient[1], currentFeature.gradient[2]]
              : [Colors.neutral[300], Colors.neutral[400]]
            }
            style={styles.nextButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.nextButtonText}>
              {currentFeatureIndex === featureCategories.length - 1
                ? '✨ Complete My Journey'
                : 'Continue My Journey'}
            </Text>
            <ChevronRight size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Enhanced Completion Screen with Immersive Experience
const CompletionScreen = ({
  selectedFeatures,
  answers,
  onComplete,
}: {
  selectedFeatures: string[];
  answers: Record<string, any>;
  onComplete: () => void;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const [showPersonalizedMessage, setShowPersonalizedMessage] = useState(false);

  useEffect(() => {
    // Enhanced celebration sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(600),
        Animated.spring(confettiAnim, {
          toValue: 1,
          tension: 300,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(200),
        Animated.timing(celebrationAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(celebrationAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Show personalized message after animation
    setTimeout(() => setShowPersonalizedMessage(true), 1200);
  }, []);

  const selectedFeaturesData = selectedFeatures.map((id) =>
    featureCategories.find((f) => f.id === id)
  ).filter(Boolean);

  // Generate personalized welcome message based on answers
  const generatePersonalizedMessage = () => {
    const messages = [];
    
    if (answers.bible?.frequency === 'daily') {
      messages.push("🌅 Your daily Bible reading routine will transform your mornings");
    }
    if (answers.prayer?.frequency === 'multiple-daily' || answers.prayer?.frequency === 'daily') {
      messages.push("🙏 Your prayer life will deepen with consistent tracking");
    }
    if (answers.mood?.interest === 'very') {
      messages.push("🧠 You'll discover powerful connections between your spiritual and emotional wellness");
    }
    if (answers.ai?.usage === 'no-interest') {
      messages.push("🤖 Get ready to be amazed by AI-powered Bible insights!");
    }
    
    return messages.length > 0 ? messages : [
      "✨ Every feature has been personalized just for your spiritual journey",
      "🎯 Your unique preferences will guide your daily growth",
      "💫 Watch as Daily Bread adapts to your rhythm and schedule"
    ];
  };

  const personalizedMessages = generatePersonalizedMessage();

  // Calculate completion percentage and benefits
  const completionPercentage = Math.round((selectedFeatures.length / featureCategories.length) * 100);
  const featureCount = selectedFeatures.length;
  const hasStrongFoundation = selectedFeatures.includes('bible') && selectedFeatures.includes('prayer');

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.completionScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.completionContent,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Enhanced Success Animation with Floating Elements */}
          <Animated.View style={styles.celebrationContainer}>
            <Animated.View
              style={[
                styles.completionIconContainer,
                {
                  transform: [
                    {
                      scale: confettiAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1.1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={['#22C55E', '#16A34A', '#15803D']}
                style={styles.completionIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Check size={56} color="white" strokeWidth={4} />
                <View style={styles.completionIconGlow} />
              </LinearGradient>
            </Animated.View>
            
            {/* Floating celebration elements */}
            {[...Array(8)].map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.celebrationParticle,
                  {
                    left: `${20 + i * 10}%`,
                    top: `${30 + (i % 2) * 40}%`,
                    transform: [{
                      scale: celebrationAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      })
                    }]
                  }
                ]}
              />
            ))}
          </Animated.View>

          <Text style={styles.completionTitle}>
            Welcome to Your New Life! 🎉
          </Text>
          
          <Text style={styles.completionSubtitle}>
            {hasStrongFoundation
              ? "You've built an incredible foundation for spiritual growth!"
              : "Your personalized spiritual companion is ready to transform your faith journey"
            }
          </Text>

          {/* Completion Achievement */}
          <View style={styles.achievementCard}>
            <Text style={styles.achievementTitle}>🎯 Setup Complete!</Text>
            <Text style={styles.achievementStats}>
              {featureCount} powerful features enabled • {completionPercentage}% personalized
            </Text>
            <View style={styles.progressRing}>
              <View style={[
                styles.progressRingFill,
                { width: `${completionPercentage}%` }
              ]} />
            </View>
          </View>

          {/* Personalized Benefits Preview */}
          {showPersonalizedMessage && (
            <Animated.View style={styles.personalizedBenefitsCard}>
              <Text style={styles.personalizedBenefitsTitle}>✨ Your Personalized Benefits:</Text>
              {personalizedMessages.map((message, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.benefitMessage,
                    {
                      opacity: celebrationAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                      transform: [{
                        translateY: celebrationAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        })
                      }]
                    }
                  ]}
                >
                  <Text style={styles.benefitMessageText}>{message}</Text>
                </Animated.View>
              ))}
            </Animated.View>
          )}

          {/* Enhanced Personalized Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Gem size={28} color={Colors.primary[600]} />
              <Text style={styles.summaryTitle}>Your Customized Features</Text>
            </View>

            <View style={styles.summaryFeatures}>
              {selectedFeaturesData.map((feature, index) => (
                <Animated.View
                  key={feature?.id}
                  style={[
                    styles.summaryFeatureItem,
                    {
                      opacity: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                      transform: [{
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20 + (index * 10), 0],
                        })
                      }]
                    }
                  ]}
                >
                  <LinearGradient
                    colors={feature?.gradient ? [feature.gradient[0], feature.gradient[1], feature.gradient[2]] : Colors.gradients.primary}
                    style={styles.summaryFeatureIcon}
                  >
                    {feature && (
                      <feature.icon size={24} color="white" />
                    )}
                  </LinearGradient>
                  <View style={styles.summaryFeatureContent}>
                    <Text style={styles.summaryFeatureTitle}>{feature?.title}</Text>
                    <Text style={styles.summaryFeatureDetails}>
                      ✨ Optimized for your journey
                    </Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          </View>

          {/* Enhanced Next Steps with Emotional Impact */}
          <View style={styles.nextStepsCard}>
            <Text style={styles.nextStepsTitle}>🚀 Your Transformation Starts Now</Text>
            <Text style={styles.nextStepsSubtitle}>
              Here's what makes your journey special:
            </Text>
            <View style={styles.nextStepsList}>
              <View style={styles.nextStepItem}>
                <Compass size={24} color={Colors.primary[600]} />
                <View style={styles.nextStepContent}>
                  <Text style={styles.nextStepTitle}>Explore Your Dashboard</Text>
                  <Text style={styles.nextStepDescription}>
                    Everything is arranged just for you
                  </Text>
                </View>
              </View>
              <View style={styles.nextStepItem}>
                <Clock size={24} color={Colors.warning[500]} />
                <View style={styles.nextStepContent}>
                  <Text style={styles.nextStepTitle}>Start Your First Reading</Text>
                  <Text style={styles.nextStepDescription}>
                    Your personalized Bible plan awaits
                  </Text>
                </View>
              </View>
              <View style={styles.nextStepItem}>
                <Star size={24} color={Colors.success[500]} />
                <View style={styles.nextStepContent}>
                  <Text style={styles.nextStepTitle}>Track Your Growth</Text>
                  <Text style={styles.nextStepDescription}>
                    Watch your faith flourish daily
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Encouragement Message */}
          <View style={styles.encouragementCard}>
            <Text style={styles.encouragementTitle}>💪 Your Faith Journey Just Got REAL!</Text>
            <Text style={styles.encouragementText}>
              You didn't just download an app today - you started a transformation.
              Every answer you gave was a declaration of your commitment to growth.
              Get ready to witness God's faithfulness in ways that'll leave you speechless.
              Your spiritual breakthrough begins NOW! 🚀
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      <TouchableOpacity
        style={styles.completeButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          // Add final celebration
          Animated.sequence([
            Animated.spring(scaleAnim, {
              toValue: 1.05,
              tension: 200,
              friction: 6,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              tension: 150,
              friction: 8,
              useNativeDriver: true,
            }),
          ]).start();
          setTimeout(() => onComplete(), 300);
        }}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#22C55E', '#16A34A', '#15803D']}
          style={styles.completeButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.completeButtonText}>Start My Transformation</Text>
          <Zap size={22} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

// Main Onboarding Component
export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const { completeOnboarding } = useOnboarding();

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId)
        ? prev.filter((id) => id !== featureId)
        : [...prev, featureId]
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAnswer = (featureId: string, questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [featureId]: {
        ...(prev[featureId] || {}),
        [questionId]: value,
      },
    }));
  };

  const handleNextQuestionnaire = () => {
    // Always go through all features in order, regardless of selection
    // User can skip features they're not interested in
    if (currentFeatureIndex < featureCategories.length - 1) {
      setCurrentFeatureIndex(currentFeatureIndex + 1);
    } else {
      setCurrentStep(2); // Go to completion
    }
  };

  const handleComplete = async () => {
    try {
      const preferences: OnboardingPreferences = {
        selectedFeatures,
        bibleReadingFrequency: answers.bible?.frequency,
        prayerFrequency: answers.prayer?.frequency,
        moodTrackingInterest: answers.mood?.interest,
        quizLevel: answers.quiz?.level,
        aiUsage: answers.ai?.usage,
        dreamInterest: answers.dream?.interest,
        notesUsage: answers.notes?.usage,
        spiritualGoals: selectedFeatures,
        completedAt: new Date().toISOString(),
      };

      // Save preferences to AsyncStorage
      await AsyncStorage.setItem('onboardingPreferences', JSON.stringify(preferences));
      console.log('Onboarding preferences saved:', preferences);

      await completeOnboarding();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving onboarding preferences:', error);
      await completeOnboarding();
      router.replace('/(tabs)');
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeScreen onNext={() => setCurrentStep(1)} />;
      case 1:
        return (
          <FeatureQuestionnaireScreen
            selectedFeatures={selectedFeatures}
            onToggleFeature={toggleFeature}
            answers={answers}
            onAnswer={handleAnswer}
            onNext={handleNextQuestionnaire}
            currentFeatureIndex={currentFeatureIndex}
          />
        );
      case 2:
        return (
          <CompletionScreen
            selectedFeatures={selectedFeatures}
            answers={answers}
            onComplete={handleComplete}
          />
        );
      default:
        return <WelcomeScreen onNext={() => setCurrentStep(1)} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {renderCurrentStep()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: isLandscape ? getResponsiveSpacing(16, 20, 24, 32) : 0,
    paddingTop: hasNotch ? getResponsiveSpacing(8, 12, 16, 20) : 0,
  },
  screen: {
    flex: 1,
    paddingHorizontal: getResponsiveSpacing(8, 12, 16, 20),
    paddingTop: Platform.OS === 'ios'
      ? (hasNotch ? getResponsiveSpacing(12, 16, 20, 24) : getResponsiveSpacing(16, 20, 24, 28))
      : getResponsiveSpacing(12, 16, 20, 24),
    paddingBottom: getResponsiveSpacing(8, 12, 16, 20),
    maxWidth: isTablet ? 600 : screenWidth,
    alignSelf: 'center',
    width: '100%',
  },

  // Welcome Screen Styles
  welcomeScrollContent: {
    flexGrow: 1,
    paddingBottom: getResponsiveSpacing(20, 24, 28, 32),
  },
  welcomeContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: getResponsiveSpacing(8, 12, 16, 20),
    paddingHorizontal: getResponsiveSpacing(4, 8, 12, 16),
  },
  heroGradient: {
    width: getResponsiveSpacing(100, 120, 140, 160),
    height: getResponsiveSpacing(100, 120, 140, 160),
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getResponsiveSpacing(16, 20, 24, 28),
    ...Shadows.xl,
  },
  heroIconContainer: {
    position: 'relative',
  },
  heroIconGlow: {
    position: 'absolute',
    width: '200%',
    height: '200%',
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    top: '-50%',
    left: '-50%',
  },
  welcomeTitle: {
    fontSize: getResponsiveFontSize(24, 28, 32, 36),
    fontWeight: Typography.weights.extraBold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(8, 12, 16, 20),
    lineHeight: getResponsiveFontSize(24, 28, 32, 36) * 1.2,
    paddingHorizontal: getResponsiveSpacing(4, 8, 12, 16),
  },
  welcomeSubtitle: {
    fontSize: getResponsiveFontSize(15, 17, 19, 21),
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[700],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(12, 16, 20, 24),
    lineHeight: getResponsiveFontSize(15, 17, 19, 21) * 1.4,
    paddingHorizontal: getResponsiveSpacing(4, 8, 12, 16),
  },
  welcomeDescription: {
    fontSize: getResponsiveFontSize(13, 15, 17, 19),
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: getResponsiveFontSize(13, 15, 17, 19) * 1.5,
    paddingHorizontal: getResponsiveSpacing(4, 8, 12, 16),
    marginTop: getResponsiveSpacing(8, 12, 16, 20),
  },
  benefitCard: {
    width: '100%',
    marginVertical: getResponsiveSpacing(12, 16, 20, 24),
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
  },
  benefitCardGradient: {
    padding: getResponsiveSpacing(16, 20, 24, 28),
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing(12, 16, 20, 24),
  },
  benefitIconContainer: {
    width: getResponsiveSpacing(48, 56, 64, 72),
    height: getResponsiveSpacing(48, 56, 64, 72),
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
    fontSize: getResponsiveFontSize(15, 17, 19, 21),
    fontWeight: Typography.weights.bold,
  },
  featuresPreview: {
    width: '100%',
    marginVertical: getResponsiveSpacing(12, 16, 20, 24),
    padding: getResponsiveSpacing(16, 20, 24, 28),
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.xl,
  },
  featuresPreviewTitle: {
    fontSize: getResponsiveFontSize(16, 18, 20, 22),
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: getResponsiveSpacing(8, 12, 16, 20),
  },
  featuresList: {
    gap: getResponsiveSpacing(8, 10, 12, 14),
  },
  featurePreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing(8, 10, 12, 14),
  },
  featurePreviewIcon: {
    width: getResponsiveSpacing(32, 36, 40, 44),
    height: getResponsiveSpacing(32, 36, 40, 44),
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featurePreviewText: {
    flex: 1,
    fontSize: getResponsiveFontSize(13, 15, 17, 19),
    color: Colors.neutral[700],
  },

  // Questionnaire Styles
  questionnaireHeader: {
    marginBottom: getResponsiveSpacing(12, 16, 20, 24),
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: getResponsiveSpacing(4, 6, 8, 10),
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary[600],
    borderRadius: BorderRadius.full,
  },
  progressText: {
    fontSize: getResponsiveFontSize(12, 14, 16, 18),
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  questionnaireScroll: {
    flex: 1,
    marginBottom: getResponsiveSpacing(8, 12, 16, 20),
  },
  questionnaireContent: {
    paddingBottom: getResponsiveSpacing(8, 12, 16, 20),
  },
  featureQuestionHeader: {
    alignItems: 'center',
    marginBottom: getResponsiveSpacing(16, 20, 24, 28),
    paddingHorizontal: getResponsiveSpacing(4, 8, 12, 16),
  },
  featureQuestionIconContainer: {
    width: getResponsiveSpacing(80, 100, 120, 140),
    height: getResponsiveSpacing(80, 100, 120, 140),
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getResponsiveSpacing(12, 16, 20, 24),
    ...Shadows.lg,
  },
  featureQuestionTitle: {
    fontSize: getResponsiveFontSize(24, 28, 32, 36),
    fontWeight: Typography.weights.extraBold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(6, 8, 12, 16),
  },
  featureQuestionBenefit: {
    fontSize: getResponsiveFontSize(16, 18, 20, 22),
    fontWeight: Typography.weights.semiBold,
    color: Colors.primary[600],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(4, 6, 8, 10),
  },
  featureQuestionEmotional: {
    fontSize: getResponsiveFontSize(14, 16, 18, 20),
    color: Colors.neutral[600],
    textAlign: 'center',
    fontStyle: 'italic',
  },
  questionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: getResponsiveSpacing(16, 20, 24, 28),
    marginBottom: getResponsiveSpacing(12, 16, 20, 24),
    ...Shadows.md,
  },
  questionText: {
    fontSize: getResponsiveFontSize(16, 18, 20, 22),
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: getResponsiveSpacing(12, 16, 20, 24),
  },
  optionsContainer: {
    gap: getResponsiveSpacing(8, 10, 12, 14),
  },
  optionButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  optionButtonSelected: {
    transform: [{ scale: 0.98 }],
  },
  optionGradient: {
    padding: getResponsiveSpacing(14, 16, 18, 20),
    borderRadius: BorderRadius.lg,
  },
  optionContent: {
    position: 'relative',
  },
  optionLabel: {
    fontSize: getResponsiveFontSize(14, 16, 18, 20),
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[800],
    marginBottom: getResponsiveSpacing(2, 3, 4, 6),
  },
  optionLabelSelected: {
    color: 'white',
  },
  optionBenefit: {
    fontSize: getResponsiveFontSize(12, 14, 16, 18),
    color: Colors.neutral[600],
    marginTop: getResponsiveSpacing(2, 3, 4, 6),
  },
  optionBenefitSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  optionCheck: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: getResponsiveSpacing(24, 28, 32, 36),
    height: getResponsiveSpacing(24, 28, 32, 36),
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },

  // Completion Screen Styles
  completionScrollContent: {
    flexGrow: 1,
    paddingBottom: getResponsiveSpacing(20, 24, 28, 32),
  },
  completionContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: getResponsiveSpacing(8, 12, 16, 20),
    paddingHorizontal: getResponsiveSpacing(4, 8, 12, 16),
  },
  completionIconContainer: {
    position: 'relative',
    marginBottom: getResponsiveSpacing(16, 20, 24, 28),
  },
  completionIcon: {
    width: getResponsiveSpacing(100, 120, 140, 160),
    height: getResponsiveSpacing(100, 120, 140, 160),
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.xl,
  },
  completionIconGlow: {
    position: 'absolute',
    width: '150%',
    height: '150%',
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    top: '-25%',
    left: '-25%',
    zIndex: -1,
  },
  completionTitle: {
    fontSize: getResponsiveFontSize(24, 28, 32, 36),
    fontWeight: Typography.weights.extraBold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(8, 12, 16, 20),
    lineHeight: getResponsiveFontSize(24, 28, 32, 36) * 1.2,
    paddingHorizontal: getResponsiveSpacing(4, 8, 12, 16),
  },
  completionSubtitle: {
    fontSize: getResponsiveFontSize(15, 17, 19, 21),
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(16, 20, 24, 28),
    lineHeight: getResponsiveFontSize(15, 17, 19, 21) * 1.4,
    paddingHorizontal: getResponsiveSpacing(4, 8, 12, 16),
  },
  summaryCard: {
    width: '100%',
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.xl,
    padding: getResponsiveSpacing(16, 20, 24, 28),
    marginBottom: getResponsiveSpacing(12, 16, 20, 24),
    ...Shadows.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing(8, 10, 12, 14),
    marginBottom: getResponsiveSpacing(12, 16, 20, 24),
  },
  summaryTitle: {
    fontSize: getResponsiveFontSize(18, 20, 22, 24),
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
  },
  summaryFeatures: {
    gap: getResponsiveSpacing(8, 10, 12, 14),
  },
  summaryFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing(12, 16, 20, 24),
    paddingVertical: getResponsiveSpacing(8, 10, 12, 14),
  },
  summaryFeatureIcon: {
    width: getResponsiveSpacing(40, 48, 56, 64),
    height: getResponsiveSpacing(40, 48, 56, 64),
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryFeatureContent: {
    flex: 1,
  },
  summaryFeatureTitle: {
    fontSize: getResponsiveFontSize(14, 16, 18, 20),
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[900],
    marginBottom: getResponsiveSpacing(2, 3, 4, 6),
  },
  summaryFeatureDetails: {
    fontSize: getResponsiveFontSize(12, 14, 16, 18),
    color: Colors.neutral[600],
  },
  nextStepsCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: getResponsiveSpacing(16, 20, 24, 28),
    ...Shadows.md,
    borderWidth: 2,
    borderColor: Colors.primary[100],
  },
  nextStepsTitle: {
    fontSize: getResponsiveFontSize(16, 18, 20, 22),
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: getResponsiveSpacing(12, 16, 20, 24),
  },
  nextStepsList: {
    gap: getResponsiveSpacing(10, 12, 14, 16),
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing(10, 12, 14, 16),
  },
  nextStepText: {
    flex: 1,
    fontSize: getResponsiveFontSize(14, 16, 18, 20),
    color: Colors.neutral[700],
  },

  // Questionnaire Button Styles
  questionnaireButtons: {
    flexDirection: 'row',
    gap: getResponsiveSpacing(8, 10, 12, 14),
    marginTop: getResponsiveSpacing(8, 12, 16, 20),
    marginBottom: getResponsiveSpacing(8, 12, 16, 20),
  },
  skipButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getResponsiveSpacing(14, 16, 18, 20),
    paddingHorizontal: getResponsiveSpacing(12, 16, 20, 24),
    minHeight: getMobileTouchTarget(),
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.neutral[300],
  },
  skipButtonText: {
    fontSize: getResponsiveFontSize(14, 16, 18, 20),
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[600],
  },
  nextButtonFlex: {
    flex: 2,
    marginTop: 0,
    marginBottom: 0,
  },
  // Button Styles
  nextButton: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
    minHeight: getMobileTouchTarget(),
    marginBottom: getResponsiveSpacing(8, 12, 16, 20),
    marginTop: getResponsiveSpacing(8, 12, 16, 20),
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getResponsiveSpacing(14, 16, 18, 20),
    paddingHorizontal: getResponsiveSpacing(16, 20, 24, 32),
    gap: getResponsiveSpacing(8, 12, 16, 20),
    minHeight: getMobileTouchTarget(),
    borderRadius: BorderRadius.xl,
  },
  nextButtonText: {
    fontSize: getResponsiveFontSize(15, 17, 19, 21),
    fontWeight: Typography.weights.bold,
    color: 'white',
  },
  completeButton: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
    minHeight: getMobileTouchTarget(),
    marginBottom: getResponsiveSpacing(8, 12, 16, 20),
    marginTop: getResponsiveSpacing(8, 12, 16, 20),
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getResponsiveSpacing(14, 16, 18, 20),
    paddingHorizontal: getResponsiveSpacing(16, 20, 24, 32),
    gap: getResponsiveSpacing(8, 12, 16, 20),
    minHeight: getMobileTouchTarget(),
    borderRadius: BorderRadius.xl,
  },
  completeButtonText: {
    fontSize: getResponsiveFontSize(15, 17, 19, 21),
    fontWeight: Typography.weights.bold,
    color: 'white',
  },

  // Modern Enhanced Welcome Screen Styles
  heroSection: {
    marginBottom: getResponsiveSpacing(20, 24, 28, 32),
    borderRadius: BorderRadius['3xl'],
    overflow: 'hidden',
  },
  heroBackgroundEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroGlowEffect: {
    position: 'absolute',
    width: '200%',
    height: '200%',
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    top: '-50%',
    left: '-50%',
    zIndex: -1,
  },
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },

  // Transformation Story Styles
  transformationStoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BorderRadius.xl,
    padding: getResponsiveSpacing(20, 24, 28, 32),
    marginBottom: getResponsiveSpacing(16, 20, 24, 28),
    alignItems: 'center',
    ...Shadows.lg,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.2)',
  },
  storyEmoji: {
    fontSize: getResponsiveFontSize(48, 56, 64, 72),
    marginBottom: getResponsiveSpacing(8, 12, 16, 20),
  },
  transformationTitle: {
    fontSize: getResponsiveFontSize(20, 22, 24, 28),
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(6, 8, 10, 12),
  },
  transformationSubtitle: {
    fontSize: getResponsiveFontSize(16, 18, 20, 22),
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(8, 12, 16, 20),
  },
  transformationBenefit: {
    fontSize: getResponsiveFontSize(14, 16, 18, 20),
    color: Colors.primary[600],
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: Typography.weights.semiBold,
  },

  // Enhanced Benefit Styles
  benefitContent: {
    flex: 1,
  },
  benefitDescription: {
    fontSize: getResponsiveFontSize(13, 14, 15, 16),
    color: Colors.neutral[500],
    marginTop: getResponsiveSpacing(4, 6, 8, 10),
  },

  // Interactive Feature Cards
  featureGradientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getResponsiveSpacing(12, 16, 20, 24),
    borderRadius: BorderRadius.lg,
    gap: getResponsiveSpacing(12, 16, 20, 24),
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: getResponsiveFontSize(15, 16, 17, 18),
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[900],
    marginBottom: getResponsiveSpacing(2, 3, 4, 6),
  },
  featureDescription: {
    fontSize: getResponsiveFontSize(12, 13, 14, 15),
    color: Colors.neutral[600],
  },

  // Social Proof Styles
  socialProofCard: {
    backgroundColor: 'rgba(248, 250, 252, 0.95)',
    borderRadius: BorderRadius.xl,
    padding: getResponsiveSpacing(16, 20, 24, 28),
    marginBottom: getResponsiveSpacing(16, 20, 24, 28),
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  socialProofTitle: {
    fontSize: getResponsiveFontSize(16, 18, 20, 22),
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(12, 16, 20, 24),
  },
  socialProofStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: getResponsiveFontSize(18, 20, 22, 24),
    fontWeight: Typography.weights.extraBold,
    color: Colors.primary[600],
    marginBottom: getResponsiveSpacing(2, 3, 4, 6),
  },
  statLabel: {
    fontSize: getResponsiveFontSize(11, 12, 13, 14),
    color: Colors.neutral[600],
    textAlign: 'center',
    fontWeight: Typography.weights.medium,
  },
  statDivider: {
    width: 1,
    height: getResponsiveSpacing(24, 28, 32, 36),
    backgroundColor: Colors.neutral[300],
    marginHorizontal: getResponsiveSpacing(8, 12, 16, 20),
  },

  // Enhanced Questionnaire Styles
  featureHeaderBackground: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    padding: getResponsiveSpacing(20, 24, 28, 32),
    marginBottom: getResponsiveSpacing(16, 20, 24, 28),
    alignItems: 'center',
    ...Shadows.lg,
  },
  featureIconContainer: {
    width: getResponsiveSpacing(100, 120, 140, 160),
    height: getResponsiveSpacing(100, 120, 140, 160),
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getResponsiveSpacing(16, 20, 24, 28),
    position: 'relative',
    ...Shadows.lg,
  },
  featureIconGlow: {
    position: 'absolute',
    width: '150%',
    height: '150%',
    borderRadius: BorderRadius.full,
    top: '-25%',
    left: '-25%',
    zIndex: -1,
  },
  userInsightContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: BorderRadius.lg,
    padding: getResponsiveSpacing(12, 16, 20, 24),
    marginTop: getResponsiveSpacing(8, 12, 16, 20),
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  userInsight: {
    fontSize: getResponsiveFontSize(13, 14, 15, 16),
    color: Colors.neutral[700],
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: getResponsiveFontSize(13, 14, 15, 16) * 1.4,
  },

  // Feature Preview Section
  featurePreviewSection: {
    marginBottom: getResponsiveSpacing(16, 20, 24, 28),
  },
  featurePreviewCard: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.lg,
    padding: getResponsiveSpacing(16, 20, 24, 28),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  featurePreviewTitle: {
    fontSize: getResponsiveFontSize(14, 16, 18, 20),
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[900],
    marginBottom: getResponsiveSpacing(8, 12, 16, 20),
  },
  activeFeatureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing(8, 10, 12, 14),
    backgroundColor: Colors.success[500],
    paddingHorizontal: getResponsiveSpacing(12, 16, 20, 24),
    paddingVertical: getResponsiveSpacing(6, 8, 10, 12),
    borderRadius: BorderRadius.lg,
  },
  activeFeatureText: {
    fontSize: getResponsiveFontSize(12, 14, 16, 18),
    fontWeight: Typography.weights.semiBold,
    color: 'white',
  },
  disabledFeatureBadge: {
    backgroundColor: Colors.neutral[200],
    paddingHorizontal: getResponsiveSpacing(12, 16, 20, 24),
    paddingVertical: getResponsiveSpacing(6, 8, 10, 12),
    borderRadius: BorderRadius.lg,
  },
  disabledFeatureText: {
    fontSize: getResponsiveFontSize(12, 14, 16, 18),
    color: Colors.neutral[600],
    fontStyle: 'italic',
  },

  // Enhanced Option Styles
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  // Motivation Card
  motivationCard: {
    backgroundColor: 'rgba(236, 72, 153, 0.05)',
    borderRadius: BorderRadius.xl,
    padding: getResponsiveSpacing(16, 20, 24, 28),
    marginBottom: getResponsiveSpacing(16, 20, 24, 28),
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.2)',
    alignItems: 'center',
  },
  motivationTitle: {
    fontSize: getResponsiveFontSize(16, 18, 20, 22),
    fontWeight: Typography.weights.bold,
    color: Colors.primary[600],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(6, 8, 10, 12),
  },
  motivationText: {
    fontSize: getResponsiveFontSize(13, 14, 15, 16),
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: getResponsiveFontSize(13, 14, 15, 16) * 1.4,
  },

  // Completion Screen Enhanced Styles
  celebrationContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getResponsiveSpacing(16, 20, 24, 28),
  },
  celebrationParticle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FFD700',
    opacity: 0.8,
  },
  achievementCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: BorderRadius.xl,
    padding: getResponsiveSpacing(16, 20, 24, 28),
    marginBottom: getResponsiveSpacing(16, 20, 24, 28),
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.success[200],
  },
  achievementTitle: {
    fontSize: getResponsiveFontSize(18, 20, 22, 24),
    fontWeight: Typography.weights.extraBold,
    color: Colors.success[600],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(6, 8, 10, 12),
  },
  achievementStats: {
    fontSize: getResponsiveFontSize(14, 16, 18, 20),
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[700],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(12, 16, 20, 24),
  },
  progressRing: {
    width: getResponsiveSpacing(60, 70, 80, 90),
    height: getResponsiveSpacing(60, 70, 80, 90),
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[200],
    overflow: 'hidden',
    marginTop: getResponsiveSpacing(8, 12, 16, 20),
  },
  progressRingFill: {
    height: '100%',
    backgroundColor: Colors.success[500],
    borderRadius: BorderRadius.full,
  },
  personalizedBenefitsCard: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.xl,
    padding: getResponsiveSpacing(16, 20, 24, 28),
    marginBottom: getResponsiveSpacing(16, 20, 24, 28),
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  personalizedBenefitsTitle: {
    fontSize: getResponsiveFontSize(16, 18, 20, 22),
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(12, 16, 20, 24),
  },
  benefitMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: BorderRadius.lg,
    padding: getResponsiveSpacing(12, 16, 20, 24),
    marginBottom: getResponsiveSpacing(8, 10, 12, 14),
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  benefitMessageText: {
    fontSize: getResponsiveFontSize(13, 14, 15, 16),
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[800],
    textAlign: 'center',
  },
  nextStepsSubtitle: {
    fontSize: getResponsiveFontSize(14, 15, 16, 18),
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(12, 16, 20, 24),
  },
  nextStepContent: {
    flex: 1,
  },
  nextStepTitle: {
    fontSize: getResponsiveFontSize(14, 16, 18, 20),
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[900],
    marginBottom: getResponsiveSpacing(2, 3, 4, 6),
  },
  nextStepDescription: {
    fontSize: getResponsiveFontSize(12, 13, 14, 15),
    color: Colors.neutral[600],
  },
  encouragementCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    borderRadius: BorderRadius.xl,
    padding: getResponsiveSpacing(16, 20, 24, 28),
    marginBottom: getResponsiveSpacing(16, 20, 24, 28),
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    alignItems: 'center',
  },
  encouragementTitle: {
    fontSize: getResponsiveFontSize(16, 18, 20, 22),
    fontWeight: Typography.weights.bold,
    color: Colors.success[600],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(8, 10, 12, 16),
  },
  encouragementText: {
    fontSize: getResponsiveFontSize(13, 14, 15, 16),
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: getResponsiveFontSize(13, 14, 15, 16) * 1.4,
  },
});
