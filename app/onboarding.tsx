
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
} from 'lucide-react-native';
import { useOnboarding } from '@/hooks/useOnboarding';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Feature categories for the onboarding
const featureCategories = [
  {
    id: 'bible',
    title: 'Bible Study',
    icon: Book,
    color: Colors.primary[600],
    description: 'Read Scripture, search verses, and study God\'s Word',
    questions: [
      'How often do you read the Bible?',
      'What translation do you prefer?',
      'Are you interested in reading plans?'
    ]
  },
  {
    id: 'prayer',
    title: 'Prayer Tracking',
    icon: Heart,
    color: Colors.error[500],
    description: 'Track prayer requests and answered prayers',
    questions: [
      'Do you keep a prayer journal?',
      'How many prayer requests do you typically have?',
      'Would you like prayer reminders?'
    ]
  },
  {
    id: 'mood',
    title: 'Mood Tracking',
    icon: Brain,
    color: Colors.warning[500],
    description: 'Monitor your spiritual and emotional well-being',
    questions: [
      'How often do you reflect on your mood?',
      'Are you interested in spiritual growth tracking?',
      'Would mood-based Bible verses help?'
    ]
  },
  {
    id: 'quiz',
    title: 'Bible Quiz',
    icon: Target,
    color: Colors.success[500],
    description: 'Test your biblical knowledge with interactive quizzes',
    questions: [
      'How familiar are you with the Bible?',
      'Do you enjoy learning through quizzes?',
      'What topics interest you most?'
    ]
  },
  {
    id: 'ai',
    title: 'AI Bible Chat',
    icon: MessageCircle,
    color: Colors.secondary[500],
    description: 'Ask questions and get AI-powered biblical insights',
    questions: [
      'Have you used AI for Bible study before?',
      'What questions would you ask about Scripture?',
      'Are you interested in theological discussions?'
    ]
  },
  {
    id: 'dream',
    title: 'Dream Interpretation',
    icon: Moon,
    color: Colors.primary[500],
    description: 'Get biblical insights into your dreams',
    questions: [
      'Do you remember your dreams often?',
      'Are you interested in spiritual dream interpretation?',
      'Have you sought dream meaning before?'
    ]
  },
  {
    id: 'notes',
    title: 'Spiritual Notes',
    icon: FileText,
    color: Colors.neutral[600],
    description: 'Capture insights, reflections, and study notes',
    questions: [
      'Do you take notes during Bible study?',
      'How do you organize spiritual insights?',
      'Would you use digital note-taking?'
    ]
  }
];

// Welcome screen component
const WelcomeScreen = ({ onNext }: { onNext: () => void }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.screen}>
      <Animated.View 
        style={[
          styles.welcomeContent,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <LinearGradient
          colors={Colors.gradients.main}
          style={styles.welcomeIcon}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Sparkles size={60} color="white" />
        </LinearGradient>
        
        <Text style={styles.welcomeTitle}>Welcome to Daily Bread</Text>
        <Text style={styles.welcomeSubtitle}>
          Your personal spiritual companion for Bible study, prayer tracking, and spiritual growth
        </Text>
        
        <Text style={styles.welcomeDescription}>
          Let's personalize your experience by learning about your spiritual journey and preferences.
        </Text>
      </Animated.View>

      <TouchableOpacity style={styles.nextButton} onPress={onNext}>
        <LinearGradient
          colors={Colors.gradients.primary}
          style={styles.nextButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.nextButtonText}>Get Started</Text>
          <ChevronRight size={20} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

// Feature selection screen component
const FeatureSelectionScreen = ({ 
  selectedFeatures, 
  onToggleFeature, 
  onNext 
}: { 
  selectedFeatures: string[];
  onToggleFeature: (featureId: string) => void;
  onNext: () => void;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.screen}>
      <Animated.View style={[styles.featureHeader, { opacity: fadeAnim }]}>
        <Text style={styles.featureTitle}>What interests you most?</Text>
        <Text style={styles.featureSubtitle}>
          Select the features that align with your spiritual journey
        </Text>
      </Animated.View>

      <ScrollView 
        style={styles.featureScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.featureGrid}
      >
        {featureCategories.map((feature, index) => (
          <Animated.View
            key={feature.id}
            style={[
              styles.featureCard,
              {
                opacity: fadeAnim,
                transform: [{
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20 + (index * 10), 0],
                  })
                }]
              }
            ]}
          >
            <TouchableOpacity
              style={[
                styles.featureButton,
                selectedFeatures.includes(feature.id) && styles.featureButtonSelected
              ]}
              onPress={() => onToggleFeature(feature.id)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={selectedFeatures.includes(feature.id) 
                  ? [feature.color, feature.color + 'CC'] 
                  : ['#FFFFFF', '#F8FAFC']}
                style={styles.featureGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.featureIconContainer}>
                  <feature.icon 
                    size={32} 
                    color={selectedFeatures.includes(feature.id) ? 'white' : feature.color} 
                  />
                  {selectedFeatures.includes(feature.id) && (
                    <View style={styles.featureCheck}>
                      <Check size={16} color="white" />
                    </View>
                  )}
                </View>
                
                <Text style={[
                  styles.featureCardTitle,
                  selectedFeatures.includes(feature.id) && styles.featureCardTitleSelected
                ]}>
                  {feature.title}
                </Text>
                
                <Text style={[
                  styles.featureCardDescription,
                  selectedFeatures.includes(feature.id) && styles.featureCardDescriptionSelected
                ]}>
                  {feature.description}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={[
          styles.nextButton,
          selectedFeatures.length === 0 && styles.nextButtonDisabled
        ]} 
        onPress={onNext}
        disabled={selectedFeatures.length === 0}
      >
        <LinearGradient
          colors={selectedFeatures.length === 0 
            ? [Colors.neutral[300], Colors.neutral[400]] 
            : Colors.gradients.primary}
          style={styles.nextButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.nextButtonText}>
            Continue ({selectedFeatures.length} selected)
          </Text>
          <ChevronRight size={20} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};


// Completion screen component
const CompletionScreen = ({
  selectedFeatures,
  onComplete
}: {
  selectedFeatures: string[];
  onComplete: () => void;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const selectedFeaturesData = selectedFeatures.map(id => 
    featureCategories.find(f => f.id === id)
  ).filter(Boolean);

  return (
    <View style={styles.screen}>
      <Animated.View 
        style={[
          styles.completionContent,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}
      >
        <LinearGradient
          colors={Colors.gradients.primary}
          style={styles.completionIcon}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Check size={50} color="white" />
        </LinearGradient>
        
        <Text style={styles.completionTitle}>Perfect! Your spiritual journey is personalized</Text>
        <Text style={styles.completionSubtitle}>
          Based on your preferences, we've customized Daily Bread for you
        </Text>

        <View style={styles.featuresSummary}>
          <Text style={styles.featuresSummaryTitle}>Your selected features:</Text>
          {selectedFeaturesData.map((feature, index) => (
            <View key={feature?.id} style={styles.featureSummaryItem}>
              <View style={[styles.featureSummaryIcon, { backgroundColor: feature?.color + '20' }]}>
                {feature && <feature.icon size={20} color={feature.color} />}
              </View>
              <Text style={styles.featureSummaryText}>{feature?.title}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.completionNote}>
          You can always adjust these settings later in the app preferences.
        </Text>
      </Animated.View>

      <TouchableOpacity style={styles.completeButton} onPress={onComplete}>
        <LinearGradient
          colors={Colors.gradients.primary}
          style={styles.completeButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.completeButtonText}>Start Your Journey</Text>
          <Zap size={20} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const { completeOnboarding } = useOnboarding();

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleComplete = async () => {
    // Save onboarding preferences
    const onboardingData = {
      selectedFeatures,
      completedAt: new Date().toISOString()
    };

    // You can save this to AsyncStorage or your backend
    console.log('Onboarding completed:', onboardingData);

    await completeOnboarding();

    // Check if user is authenticated to determine where to redirect
    // For now, redirect to main app since onboarding completion means they're ready to use the app
    router.replace('/(tabs)');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeScreen onNext={() => setCurrentStep(1)} />;
      case 1:
        return (
          <FeatureSelectionScreen
            selectedFeatures={selectedFeatures}
            onToggleFeature={toggleFeature}
            onNext={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <CompletionScreen
            selectedFeatures={selectedFeatures}
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
    // Handle landscape orientation better
    paddingHorizontal: screenWidth > screenHeight ? Spacing.xl : 0,
  },
  screen: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Spacing.xl,
    maxWidth: 600, // Prevent content from being too wide on tablets
    alignSelf: 'center',
    width: '100%',
  },
  
  // Welcome Screen Styles
  welcomeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Spacing['4xl'],
  },
  welcomeIcon: {
    width: Math.min(120, screenWidth * 0.25), // Responsive size based on screen width
    height: Math.min(120, screenWidth * 0.25),
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['3xl'],
    ...Shadows.lg,
  },
  welcomeTitle: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: Typography.sizes['4xl'] * 1.2,
  },
  welcomeSubtitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[700],
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: Typography.sizes.xl * 1.4,
  },
  welcomeDescription: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: Typography.sizes.base * 1.6,
  },
  
  // Feature Selection Styles
  featureHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  featureTitle: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  featureSubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: Typography.sizes.base * 1.4,
  },
  featureScroll: {
    flex: 1,
    marginBottom: Spacing.xl,
  },
  featureGrid: {
    gap: Spacing.lg,
    paddingBottom: Spacing.lg,
    // Responsive grid - single column on small screens, multiple on larger screens
    flexDirection: screenWidth < 600 ? 'column' : 'row',
    flexWrap: screenWidth < 600 ? 'nowrap' : 'wrap',
  },
  featureCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
    minHeight: 140, // Ensure minimum height for better touch targets
  },
  featureButton: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  featureButtonSelected: {
    transform: [{ scale: 0.98 }],
  },
  featureGradient: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    minHeight: 140, // Ensure minimum height for better touch targets
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  featureCheck: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.success[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  featureCardTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
    marginBottom: Spacing.xs,
  },
  featureCardTitleSelected: {
    color: 'white',
  },
  featureCardDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    lineHeight: Typography.sizes.sm * 1.4,
  },
  featureCardDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  
  
  // Completion Screen Styles
  completionContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Spacing['4xl'],
  },
  completionIcon: {
    width: Math.min(100, screenWidth * 0.2), // Responsive size based on screen width
    height: Math.min(100, screenWidth * 0.2),
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['3xl'],
    ...Shadows.lg,
  },
  completionTitle: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: Typography.sizes['3xl'] * 1.2,
  },
  completionSubtitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
    lineHeight: Typography.sizes.lg * 1.4,
  },
  featuresSummary: {
    width: '100%',
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  featuresSummaryTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[700],
    marginBottom: Spacing.md,
  },
  featureSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  featureSummaryIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureSummaryText: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[700],
  },
  completionNote: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[500],
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Button Styles
  nextButton: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
    minHeight: 56, // Ensure minimum touch target size for accessibility
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    minHeight: 56, // Ensure minimum touch target size
  },
  nextButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semiBold,
    color: 'white',
  },
  
  completeButton: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
    minHeight: 56, // Ensure minimum touch target size for accessibility
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    minHeight: 56, // Ensure minimum touch target size
  },
  completeButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semiBold,
    color: 'white',
  },
});
