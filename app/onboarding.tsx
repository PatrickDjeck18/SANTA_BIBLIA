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
    title: 'Estudio Bíblico',
    icon: Book,
    color: Colors.primary[600],
    gradient: Colors.gradients.primary,
    benefit: 'Transforma tu caminar diario con las Escrituras',
    emotional: 'Encuentra paz y guía en la Palabra de Dios',
    questions: [
      {
        id: 'frequency',
        question: '¿Con qué frecuencia lees la Biblia?',
        type: 'single',
        options: [
          { value: 'daily', label: 'Diariamente', benefit: 'Construye un hábito poderoso' },
          { value: 'few-times-week', label: 'Algunas veces por semana', benefit: 'Crea un ritmo constante' },
          { value: 'weekly', label: 'Semanalmente', benefit: 'Comienza un viaje significativo' },
          { value: 'occasionally', label: 'Ocasionalmente', benefit: 'Redescubre el gozo de las Escrituras' },
          { value: 'never', label: 'Soy nuevo en esto', benefit: 'Comienza tu aventura espiritual' },
        ],
      },
      {
        id: 'translation',
        question: '¿Qué traducción prefieres?',
        type: 'single',
        options: [
          { value: 'niv', label: 'NVI (Nueva Versión Internacional)', benefit: 'Traducción clara y moderna' },
          { value: 'nlt', label: 'NTV (Nueva Traducción Viviente)', benefit: 'Lenguaje fácil de entender' },
          { value: 'esv', label: 'RVR (Reina Valera 1960)', benefit: 'Traducción clásica y poética' },
          { value: 'kjv', label: 'LBLA (La Biblia de las Américas)', benefit: 'Precisión palabra por palabra' },
          { value: 'no-preference', label: 'Sin preferencia', benefit: 'Elegiremos la mejor para ti' },
        ],
      },
    ],
  },
  {
    id: 'prayer',
    title: 'Seguimiento de Oración',
    icon: Heart,
    color: Colors.error[500],
    gradient: ['#DC2626', '#EF4444', '#F87171'],
    benefit: 'Ve la fidelidad de Dios a través de oraciones contestadas',
    emotional: 'Experimenta el poder de la oración en tu vida',
    questions: [
      {
        id: 'frequency',
        question: '¿Con qué frecuencia oras?',
        type: 'single',
        options: [
          { value: 'multiple-daily', label: 'Varias veces al día', benefit: 'Profundiza tu vida de oración' },
          { value: 'daily', label: 'Diariamente', benefit: 'Mantente conectado con Dios' },
          { value: 'few-times-week', label: 'Algunas veces por semana', benefit: 'Construye un hábito de oración' },
          { value: 'weekly', label: 'Semanalmente', benefit: 'Comienza tu viaje de oración' },
          { value: 'learning', label: 'Estoy aprendiendo', benefit: 'Descubre el poder de la oración' },
        ],
      },
      {
        id: 'requests',
        question: '¿Llevas un registro de peticiones de oración?',
        type: 'single',
        options: [
          { value: 'yes-active', label: 'Sí, activamente', benefit: 'Ve oraciones contestadas' },
          { value: 'yes-sometimes', label: 'Sí, a veces', benefit: 'Mantente organizado' },
          { value: 'no-want', label: 'No, pero quiero', benefit: 'Empieza a registrar hoy' },
          { value: 'no', label: 'No', benefit: 'Experimenta los beneficios' },
        ],
      },
    ],
  },
  {
    id: 'mood',
    title: 'Registro de Ánimo',
    icon: Brain,
    color: Colors.warning[500],
    gradient: ['#059669', '#10B981', '#34D399'],
    benefit: 'Conecta tu bienestar emocional con el crecimiento espiritual',
    emotional: 'Encuentra paz y equilibrio en tu vida diaria',
    questions: [
      {
        id: 'interest',
        question: '¿Qué tan importante es el bienestar emocional para ti?',
        type: 'single',
        options: [
          { value: 'very', label: 'Muy importante', benefit: 'Rastrea tu bienestar espiritual' },
          { value: 'somewhat', label: 'Algo importante', benefit: 'Descubre patrones' },
          { value: 'curious', label: 'Curioso al respecto', benefit: 'Explora conexiones' },
          { value: 'not-sure', label: 'No estoy seguro', benefit: 'Aprende más' },
        ],
      },
    ],
  },
  {
    id: 'quiz',
    title: 'Quiz Bíblico',
    icon: Target,
    color: Colors.success[500],
    gradient: ['#7C3AED', '#8B5CF6', '#A78BFA'],
    benefit: 'Crece en conocimiento y profundiza tu entendimiento',
    emotional: 'Siéntete confiado en tu conocimiento bíblico',
    questions: [
      {
        id: 'level',
        question: '¿Qué tan familiarizado estás con la Biblia?',
        type: 'single',
        options: [
          { value: 'expert', label: 'Muy familiarizado', benefit: 'Desafíate a ti mismo' },
          { value: 'intermediate', label: 'Algo familiarizado', benefit: 'Prueba tu conocimiento' },
          { value: 'beginner', label: 'Recién empezando', benefit: 'Aprende mientras avanzas' },
          { value: 'curious', label: 'Curioso por aprender', benefit: 'Comienza tu viaje' },
        ],
      },
    ],
  },
  {
    id: 'ai',
    title: 'Chat Bíblico IA',
    icon: MessageCircle,
    color: Colors.secondary[500],
    gradient: ['#DB2777', '#EC4899', '#F472B6'],
    benefit: 'Obtén respuestas instantáneas a tus preguntas espirituales',
    emotional: 'Nunca te sientas solo en tu búsqueda de la verdad',
    questions: [
      {
        id: 'usage',
        question: '¿Has usado IA para el estudio bíblico?',
        type: 'single',
        options: [
          { value: 'yes-regularly', label: 'Sí, regularmente', benefit: 'Mejora tu estudio' },
          { value: 'yes-occasionally', label: 'Sí, ocasionalmente', benefit: 'Explora más profundo' },
          { value: 'no-interest', label: 'No, pero interesado', benefit: 'Descubre perspicacias de IA' },
          { value: 'no', label: 'No', benefit: 'Prueba algo nuevo' },
        ],
      },
    ],
  },
  {
    id: 'dream',
    title: 'Interpretación de Sueños',
    icon: Moon,
    color: Colors.primary[500],
    gradient: ['#6366F1', '#8B5CF6', '#A78BFA'],
    benefit: 'Entiende el significado espiritual de tus sueños',
    emotional: 'Encuentra claridad en los misterios de tu vida',
    questions: [
      {
        id: 'interest',
        question: '¿Recuerdas tus sueños a menudo?',
        type: 'single',
        options: [
          { value: 'yes-daily', label: 'Sí, casi a diario', benefit: 'Desbloquea su significado' },
          { value: 'yes-regularly', label: 'Sí, regularmente', benefit: 'Descubre ideas' },
          { value: 'sometimes', label: 'A veces', benefit: 'Explora la interpretación' },
          { value: 'rarely', label: 'Raramente', benefit: 'Aprende más' },
        ],
      },
    ],
  },
  {
    id: 'gratitude',
    title: 'Diario de Gratitud',
    icon: Star,
    color: '#F59E0B',
    gradient: ['#D97706', '#F59E0B', '#FBBF24'],
    benefit: 'Cultiva un corazón de gratitud y alegría',
    emotional: 'Descubre más alegría en las bendiciones diarias',
    questions: [
      {
        id: 'practice',
        question: '¿Practicas la gratitud?',
        type: 'single',
        options: [
          { value: 'daily', label: 'Sí, diariamente', benefit: 'Profundiza tu práctica' },
          { value: 'regularly', label: 'Sí, regularmente', benefit: 'Mantente constante' },
          { value: 'sometimes', label: 'A veces', benefit: 'Construye el hábito' },
          { value: 'want-to', label: 'Quiero empezar', benefit: 'Comienza tu viaje' },
        ],
      },
    ],
  },
  {
    id: 'notes',
    title: 'Notas Espirituales',
    icon: FileText,
    color: Colors.neutral[600],
    gradient: ['#6366F1', '#8B5CF6', '#78716C'],
    benefit: 'Captura ideas y revelaciones',
    emotional: 'Nunca pierdas un momento de inspiración divina',
    questions: [
      {
        id: 'usage',
        question: '¿Tomas notas durante el estudio bíblico?',
        type: 'single',
        options: [
          { value: 'always', label: 'Siempre', benefit: 'Organiza mejor' },
          { value: 'often', label: 'Frecuentemente', benefit: 'Mejora tus notas' },
          { value: 'sometimes', label: 'A veces', benefit: 'Captura más ideas' },
          { value: 'never', label: 'Nunca', benefit: 'Empieza a documentar' },
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
      title: "De la Ansiedad a la Paz Absoluta",
      subtitle: "El 92% de los usuarios reportan sentirse más tranquilos en la primera semana",
      benefit: "Transforma tus pensamientos ansiosos en la paz perfecta de Dios",
      emoji: "🕊️"
    },
    {
      title: "Rompe con la Soledad para Siempre",
      subtitle: "Usuarios descubren la presencia de Dios en el 94% de los momentos",
      benefit: "Nunca te sientas solo cuando sabes que Él siempre está contigo",
      emoji: "💫"
    },
    {
      title: "Mira Milagros Suceder Diariamente",
      subtitle: "Rastrea oraciones contestadas que te dejarán asombrado",
      benefit: "Ve la fidelidad de Dios desarrollarse de maneras increíbles",
      emoji: "🌱"
    },
    {
      title: "Construye una Confianza Inquebrantable",
      subtitle: "Usuarios reportan un aumento del 89% en la fortaleza de su fe",
      benefit: "Enfronta los desafíos de la vida con coraje sobrenatural",
      emoji: "⚡"
    }
  ];

  // Enhanced benefits with compelling emotional impact
  const benefits = [
    {
      icon: Heart,
      text: 'Siente el amor abrumador de Dios sobre tus pensamientos ansiosos',
      color: Colors.error[500],
      description: 'Experimenta paz instantánea cuando la vida se siente abrumadora'
    },
    {
      icon: TrendingUp,
      text: 'Mira cómo tu fe se transforma de dispersa a FUERTE diariamente',
      color: Colors.success[500],
      description: 'Construye una confianza inquebrantable en Sus promesas'
    },
    {
      icon: Shield,
      text: 'Descubre una fuerza sobrenatural que nunca supiste que existía',
      color: Colors.primary[600],
      description: 'Enfrenta situaciones imposibles con coraje divino'
    },
    {
      icon: Award,
      text: 'Celebra oraciones contestadas que te dejarán asombrado',
      color: Colors.warning[500],
      description: 'Documenta milagros que atesorarás para siempre'
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
            Tu Viaje hacia una Fe Más Profunda Comienza Aquí
          </Text>

          <Text style={styles.welcomeSubtitle}>
            Más que una app—es tu compañero espiritual personal diseñado para transformar tu relación con Dios
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
            <Text style={styles.featuresPreviewTitle}>✨ Herramientas Poderosas para tu Crecimiento Espiritual</Text>
            <View style={styles.featuresList}>
              {[
                {
                  icon: BookOpen,
                  title: 'Planes de Lectura',
                  description: 'Escritura diaria personalizada',
                  color: Colors.primary[600]
                },
                {
                  icon: Heart,
                  title: 'Seguimiento de Oración',
                  description: 'Ve la fidelidad de Dios',
                  color: Colors.error[500]
                },
                {
                  icon: Brain,
                  title: 'Ánimo y Bienestar',
                  description: 'Conecta alma y espíritu',
                  color: Colors.warning[500]
                },
                {
                  icon: Target,
                  title: 'Quizzes Bíblicos',
                  description: 'Prueba y crece tu conocimiento',
                  color: Colors.success[500]
                },
                {
                  icon: Bot,
                  title: 'Chat Bíblico IA',
                  description: 'Guía espiritual instantánea',
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
            <Text style={styles.socialProofTitle}>Únete a miles transformando su fe</Text>
            <View style={styles.socialProofStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>50,000+</Text>
                <Text style={styles.statLabel}>Vidas Tocadas</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>1M+</Text>
                <Text style={styles.statLabel}>Oraciones</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>98%</Text>
                <Text style={styles.statLabel}>Más Cerca de Dios</Text>
              </View>
            </View>
          </View>

          <Text style={styles.welcomeDescription}>
            En solo 2 minutos, personalizaremos Santa Biblia para que coincida con tu viaje espiritual y metas únicas.
            Esto no es solo configuración—es el comienzo de tu transformación. ✨
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
          <Text style={styles.nextButtonText}>Comenzar Mi Transformación</Text>
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
      bible: "💫 Usuarios que completan planes de lectura bíblica diariamente reportan un 85% más de satisfacción espiritual",
      prayer: "🙏 Personas que rastrean oraciones ven un 73% más de oraciones contestadas en 30 días",
      mood: "🧠 El seguimiento del ánimo revela que las prácticas espirituales mejoran el bienestar emocional en un 67%",
      quiz: "🎯 Participantes de quizzes bíblicos aumentan su conocimiento de las escrituras en un 45% en solo 2 semanas",
      ai: "🤖 El chat bíblico con IA proporciona ideas personalizadas que profundizan el entendimiento en un 89%",
      dream: "🌙 La interpretación de sueños ayuda a los usuarios a encontrar significado y guía en el 91% de los casos",
      gratitude: "✨ La práctica diaria de gratitud aumenta la alegría y el contentamiento en un 78%",
      notes: "📝 Las notas de estudio ayudan a los usuarios a retener ideas espirituales 3 veces más tiempo",
    };
    return insights[featureId as keyof typeof insights] || "✨ Esta característica transformará tu viaje espiritual";
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
          {currentFeatureIndex + 1} de {featureCategories.length} • {Math.round(((currentFeatureIndex + 1) / featureCategories.length) * 100)}% Completo
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
            <Text style={styles.featurePreviewTitle}>Lo que experimentarás:</Text>
            {selectedFeatures.includes(currentFeature.id) ? (
              <View style={styles.activeFeatureBadge}>
                <currentFeature.icon size={16} color="white" />
                <Text style={styles.activeFeatureText}>Habilitado para tu viaje</Text>
              </View>
            ) : (
              <View style={styles.disabledFeatureBadge}>
                <Text style={styles.disabledFeatureText}>Opcional - ¡pero altamente recomendado!</Text>
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
          <Text style={styles.motivationTitle}>¡Vas muy bien! 🌟</Text>
          <Text style={styles.motivationText}>
            Cada respuesta nos ayuda a personalizar tu viaje espiritual. Ya casi terminamos de crear tu experiencia perfecta.
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
          <Text style={styles.skipButtonText}>Saltar por ahora</Text>
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
                ? '✨ Completar Mi Viaje'
                : 'Continuar Mi Viaje'}
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
      messages.push("🌅 Tu rutina diaria de lectura bíblica transformará tus mañanas");
    }
    if (answers.prayer?.frequency === 'multiple-daily' || answers.prayer?.frequency === 'daily') {
      messages.push("🙏 Tu vida de oración se profundizará con un seguimiento constante");
    }
    if (answers.mood?.interest === 'very') {
      messages.push("🧠 Descubrirás conexiones poderosas entre tu bienestar espiritual y emocional");
    }
    if (answers.ai?.usage === 'no-interest') {
      messages.push("🤖 ¡Prepárate para asombrarte con ideas bíblicas impulsadas por IA!");
    }

    return messages.length > 0 ? messages : [
      "✨ Cada característica ha sido personalizada solo para tu viaje espiritual",
      "🎯 Tus preferencias únicas guiarán tu crecimiento diario",
      "💫 Mira cómo Santa Biblia se adapta a tu ritmo y horario"
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
            ¡Bienvenido a Tu Nueva Vida! 🎉
          </Text>

          <Text style={styles.completionSubtitle}>
            {hasStrongFoundation
              ? "¡Has construido una base increíble para el crecimiento espiritual!"
              : "Tu compañero espiritual personalizado está listo para transformar tu viaje de fe"
            }
          </Text>

          {/* Completion Achievement */}
          <View style={styles.achievementCard}>
            <Text style={styles.achievementTitle}>🎯 ¡Configuración Completa!</Text>
            <Text style={styles.achievementStats}>
              {featureCount} características poderosas habilitadas • {completionPercentage}% personalizado
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
              <Text style={styles.personalizedBenefitsTitle}>✨ Tus Beneficios Personalizados:</Text>
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
              <Text style={styles.summaryTitle}>Tus Características Personalizadas</Text>
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
                      ✨ Optimizado para tu viaje
                    </Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          </View>

          {/* Enhanced Next Steps with Emotional Impact */}
          <View style={styles.nextStepsCard}>
            <Text style={styles.nextStepsTitle}>🚀 Tu Transformación Comienza Ahora</Text>
            <Text style={styles.nextStepsSubtitle}>
              Aquí está lo que hace tu viaje especial:
            </Text>
            <View style={styles.nextStepsList}>
              <View style={styles.nextStepItem}>
                <Compass size={24} color={Colors.primary[600]} />
                <View style={styles.nextStepContent}>
                  <Text style={styles.nextStepTitle}>Explora Tu Panel</Text>
                  <Text style={styles.nextStepDescription}>
                    Todo está organizado solo para ti
                  </Text>
                </View>
              </View>
              <View style={styles.nextStepItem}>
                <Clock size={24} color={Colors.warning[500]} />
                <View style={styles.nextStepContent}>
                  <Text style={styles.nextStepTitle}>Inicia Tu Primera Lectura</Text>
                  <Text style={styles.nextStepDescription}>
                    Tu plan bíblico personalizado te espera
                  </Text>
                </View>
              </View>
              <View style={styles.nextStepItem}>
                <Star size={24} color={Colors.success[500]} />
                <View style={styles.nextStepContent}>
                  <Text style={styles.nextStepTitle}>Rastrea Tu Crecimiento</Text>
                  <Text style={styles.nextStepDescription}>
                    Mira cómo tu fe florece diariamente
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Encouragement Message */}
          <View style={styles.encouragementCard}>
            <Text style={styles.encouragementTitle}>💪 ¡Tu Viaje de Fe Se Volvió REAL!</Text>
            <Text style={styles.encouragementText}>
              No solo descargaste una app hoy - comenzaste una transformación.
              Cada respuesta que diste fue una declaración de tu compromiso con el crecimiento.
              Prepárate para presenciar la fidelidad de Dios de maneras que te dejarán sin palabras.
              ¡Tu avance espiritual comienza AHORA! 🚀
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
          <Text style={styles.completeButtonText}>Comenzar Mi Transformación</Text>
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
