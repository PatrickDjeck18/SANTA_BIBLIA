import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  StatusBar,
  useColorScheme,
  Share,
} from 'react-native';
import { router } from 'expo-router';
import { AppTheme } from '@/constants/AppTheme';
import { Colors, Shadows, BorderRadius, Spacing, Typography } from '@/constants/DesignTokens';
import { useUnifiedMoodTracker } from '@/hooks/useUnifiedMoodTracker';
import { useUnifiedPrayers } from '@/hooks/useUnifiedPrayers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Heart,
  BookOpen,
  MessageCircle,
  Feather,
  Users,
  Zap,
  ChevronRight,
  Play,
  Share as ShareIcon,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const STREAK_KEY = '@daily_bread_streak';
const LAST_VISIT_KEY = '@daily_bread_last_visit';

export default function HomeScreen() {
  const { moodEntries } = useUnifiedMoodTracker();
  const { prayers } = useUnifiedPrayers();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Streak state
  const [streakCount, setStreakCount] = useState(0);

  // Load and update streak on app open
  useEffect(() => {
    const updateStreak = async () => {
      try {
        const today = new Date().toDateString();
        const lastVisit = await AsyncStorage.getItem(LAST_VISIT_KEY);
        const savedStreak = await AsyncStorage.getItem(STREAK_KEY);
        let currentStreak = savedStreak ? parseInt(savedStreak, 10) : 0;

        if (lastVisit === today) {
          // Already visited today, just show current streak
          setStreakCount(currentStreak);
          return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        if (lastVisit === yesterdayStr) {
          // Visited yesterday, increment streak
          currentStreak += 1;
        } else if (lastVisit) {
          // Missed a day, reset streak
          currentStreak = 1;
        } else {
          // First visit ever
          currentStreak = 1;
        }

        await AsyncStorage.setItem(STREAK_KEY, currentStreak.toString());
        await AsyncStorage.setItem(LAST_VISIT_KEY, today);
        setStreakCount(currentStreak);
      } catch (error) {
        console.error('Error updating streak:', error);
        setStreakCount(1);
      }
    };

    updateStreak();
  }, []);

  const currentDayIndex = new Date().getDay(); // 0-6 Sun-Sat
  // Adjust to make Monday index 0 for the UI
  const uiDayIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  const todaysVerse = useMemo(() => ({
    text: "El Señor está conmigo; no tendré miedo.",
    reference: "Salmo 118:6"
  }), []);

  // Daily inspirational quotes with prayers from various authors
  const dailyQuotes = useMemo(() => [
    {
      quote: "Dios no puede darnos paz y felicidad aparte de Él mismo porque no existe tal cosa.",
      author: "C.S. Lewis",
      prayer: "Señor, ayúdame a encontrar mi paz y alegría solo en Ti, no en las cosas de este mundo. Amén."
    },
    {
      quote: "Ora como si todo dependiera de Dios. Trabaja como si todo dependiera de ti.",
      author: "San Agustín",
      prayer: "Padre, ayúdame a equilibrar la confianza en Ti con la acción fiel en mi vida diaria. Amén."
    },
    {
      quote: "Dios nunca dijo que el viaje sería fácil, pero dijo que la llegada valdría la pena.",
      author: "Max Lucado",
      prayer: "Señor, fortaléceme para el viaje de hoy, sabiendo que el destino vale cada paso. Amén."
    },
    {
      quote: "La fe es dar el primer paso incluso cuando no ves toda la escalera.",
      author: "Martin Luther King Jr.",
      prayer: "Dios, dame coraje para avanzar con fe, confiando en que Tú alumbrarás mi camino. Amén."
    },
    {
      quote: "Si no puedes volar, corre; si no puedes correr, camina; si no puedes caminar, gatea, pero hagas lo que hagas, tienes que seguir avanzando.",
      author: "Martin Luther King Jr.",
      prayer: "Padre, ayúdame a perseverar sin importar los obstáculos que enfrente hoy. Amén."
    },
    {
      quote: "Dios ama a cada uno de nosotros como si solo hubiera uno de nosotros.",
      author: "San Agustín",
      prayer: "Señor, déjame descansar en Tu amor personal e infinito por mí hoy. Amén."
    },
    {
      quote: "Nunca tengas miedo de confiar un futuro desconocido a un Dios conocido.",
      author: "Corrie ten Boom",
      prayer: "Jesús, entrego mis miedos sobre el mañana en Tus manos capaces. Amén."
    },
    {
      quote: "La preocupación no vacía el mañana de su dolor, vacía el hoy de su fuerza.",
      author: "Corrie ten Boom",
      prayer: "Padre, libérame de la ansiedad y lléname con Tu paz y poder hoy. Amén."
    },
    {
      quote: "La voluntad de Dios nunca te llevará donde la gracia de Dios no te pueda sostener.",
      author: "Billy Graham",
      prayer: "Señor, confío en que dondequiera que me guíes, Tu gracia me sostendrá. Amén."
    },
    {
      quote: "Dios nos ha dado dos manos, una para recibir y otra para dar.",
      author: "Billy Graham",
      prayer: "Padre, hazme generoso con todas las bendiciones que me has dado. Amén."
    },
    {
      quote: "No dejes que lo que no puedes hacer interfiera con lo que puedes hacer.",
      author: "John Wooden",
      prayer: "Dios, ayúdame a concentrarme en las habilidades que me has dado y usarlas plenamente. Amén."
    },
    {
      quote: "Dios no llama a los calificados, Él califica a los llamados.",
      author: "Mark Batterson",
      prayer: "Señor, equípame para el llamado que has puesto en mi vida. Amén."
    },
    {
      quote: "No todos podemos hacer grandes cosas. Pero podemos hacer pequeñas cosas con gran amor.",
      author: "Madre Teresa",
      prayer: "Jesús, ayúdame a mostrar Tu amor en los pequeños momentos de hoy. Amén."
    },
    {
      quote: "Si juzgas a la gente, no tienes tiempo para amarla.",
      author: "Madre Teresa",
      prayer: "Padre, reemplaza mis pensamientos críticos con compasión y comprensión. Amén."
    },
    {
      quote: "El ayer se ha ido. El mañana aún no ha llegado. Solo tenemos hoy. Comencemos.",
      author: "Madre Teresa",
      prayer: "Señor, ayúdame a vivir plenamente presente en este día que me has dado. Amén."
    },
    {
      quote: "Dios tiene un propósito para tu dolor, una razón para tu lucha y un regalo para tu fidelidad.",
      author: "Desconocido",
      prayer: "Padre, ayúdame a confiar en Tu propósito incluso cuando no entiendo mis circunstancias. Amén."
    },
    {
      quote: "Cuando pases por aguas profundas, yo estaré contigo.",
      author: "Isaías 43:2",
      prayer: "Señor, gracias por nunca dejarme, especialmente en los momentos más difíciles de la vida. Amén."
    },
    {
      quote: "La alegría no nos sucede simplemente. Tenemos que elegir la alegría y seguir eligiéndola todos los días.",
      author: "Henri Nouwen",
      prayer: "Dios, elijo la alegría hoy independientemente de mis circunstancias. Amén."
    },
    {
      quote: "Nuestro mayor temor no debería ser el fracaso, sino tener éxito en cosas en la vida que realmente no importan.",
      author: "Francis Chan",
      prayer: "Padre, alinea mis prioridades con Tus propósitos eternos. Amén."
    },
    {
      quote: "Dios es más glorificado en nosotros cuando estamos más satisfechos en Él.",
      author: "John Piper",
      prayer: "Señor, que mi satisfacción más profunda se encuentre en conocerte. Amén."
    },
    {
      quote: "Un hombre que era completamente inocente se ofreció como sacrificio por el bien de los demás. Fue un acto perfecto.",
      author: "Mahatma Gandhi",
      prayer: "Jesús, gracias por Tu sacrificio perfecto. Ayúdame a vivir sacrificándome por los demás. Amén."
    },
    {
      quote: "Dios escribe el evangelio no solo en la Biblia, sino en los árboles y las flores, en las nubes y las estrellas.",
      author: "Martin Luther",
      prayer: "Padre, abre mis ojos para ver Tu gloria en la creación hoy. Amén."
    },
    {
      quote: "No hay un solo momento en el que Dios no se presente bajo el manto de algún dolor que soportar, algún consuelo que disfrutar o algún deber que cumplir.",
      author: "Jean-Pierre de Caussade",
      prayer: "Señor, ayúdame a reconocer Tu presencia en cada momento de este día. Amén."
    },
    {
      quote: "Dios no nos da todo lo que queremos, pero sí cumple Sus promesas.",
      author: "Dietrich Bonhoeffer",
      prayer: "Padre, confío en Tus promesas incluso cuando mis oraciones no son respondidas. Amén."
    },
    {
      quote: "La vida cristiana no es un subidón constante. Tengo mis momentos de profundo desánimo.",
      author: "Billy Graham",
      prayer: "Señor, gracias porque está bien luchar. Encuéntrame en mis momentos bajos. Amén."
    },
    {
      quote: "No somos hacedores de historia. Estamos hechos por la historia.",
      author: "Martin Luther King Jr.",
      prayer: "Dios, usa mi vida como parte de Tu gran historia de redención. Amén."
    },
    {
      quote: "Sé fiel en las cosas pequeñas porque en ellas reside tu fuerza.",
      author: "Madre Teresa",
      prayer: "Padre, ayúdame a ser fiel en las pequeñas responsabilidades que me has dado. Amén."
    },
    {
      quote: "He tenido muchas cosas en mis manos y las he perdido todas; pero todo lo que he puesto en las manos de Dios, eso todavía lo poseo.",
      author: "Martin Luther",
      prayer: "Señor, pongo todo lo que es querido para mí en Tus manos fieles. Amén."
    },
    {
      quote: "La medida de una vida no es su duración, sino su donación.",
      author: "Corrie ten Boom",
      prayer: "Padre, ayúdame a vivir una vida que dé en lugar de tomar. Amén."
    },
    {
      quote: "Deja que las promesas de Dios brillen sobre tus problemas.",
      author: "Corrie ten Boom",
      prayer: "Señor, deja que Tu Palabra ilumine cada situación oscura que enfrente hoy. Amén."
    },
    {
      quote: "Una habitación sin libros es como un cuerpo sin alma.",
      author: "Marcus Tullius Cicero",
      prayer: "Dios, cultiva en mí un amor por la sabiduría y Tu Palabra. Amén."
    },
  ], []);

  const dayOfYear = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }, []);

  const todaysQuote = dailyQuotes[dayOfYear % dailyQuotes.length];

  const onShareQuote = async () => {
    try {
      const result = await Share.share({
        message: `"${todaysQuote.quote}" - ${todaysQuote.author}\n\nRead more in the Daily Bread app!`,
        title: 'Daily Inspiration',
      });
    } catch (error) {
      console.error('Error sharing quote:', error);
    }
  };

  // Calculate dates for the current week (Monday to Sunday)
  const weekDates = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date.getDate();
    });
  }, []);



  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true
      }),
    ]).start();
  }, []);

  const QuickActionCard = ({
    icon,
    title,
    subtitle,
    onPress,
    gradientColors
  }: {
    icon: React.ReactNode,
    title: string,
    subtitle: string,
    onPress: () => void,
    gradientColors: readonly [string, string, ...string[]]
  }) => (
    <TouchableOpacity
      style={styles.quickActionCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.quickActionGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.quickActionIconContainer}>
          {icon}
        </View>
        <View style={styles.quickActionContent}>
          <Text style={styles.quickActionTitle}>{title}</Text>
          <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.quickActionArrow}>
          <ChevronRight size={16} color="#FFFFFF" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <Text style={styles.greetingText}>Conecta con Dios</Text>
            </View>

            <View style={styles.headerActions}>
              <View style={styles.streakBadge}>
                <Zap size={14} color={AppTheme.accent.primary} fill={AppTheme.accent.primary} />
                <Text style={styles.streakText}>{streakCount}</Text>
              </View>
            </View>
          </View>

          {/* Week Selector */}
          <View style={styles.weekSelector}>
            {weekDays.map((day, index) => {
              const isActive = index === uiDayIndex;
              return (
                <View key={index} style={styles.dayColumn}>
                  <Text style={styles.dayText}>
                    {day}
                  </Text>
                  <View style={styles.dateCircleContainer}>
                    {isActive && <View style={styles.activeDayIndicator} />}
                    <Text style={[
                      styles.dateText,
                      isActive && styles.activeDateText
                    ]}>
                      {weekDates[index]}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Main Content Card */}
        <Animated.View style={[
          styles.mainCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <View style={styles.mainCardContent}>
            <Text style={styles.dateLabel}>
              {new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              }).toUpperCase()}
            </Text>



            <Text style={styles.sectionLabel}>DEVOCIONAL DIARIO</Text>

            {/* Quote Card */}
            <View style={styles.quoteCard}>
              <View style={styles.quoteCardHeader}>
                <View style={styles.quoteHeaderLeft}>
                  <Feather size={20} color={AppTheme.text.primary} />
                  <Text style={styles.quoteLabel}>Cita del Día</Text>
                </View>
                <TouchableOpacity onPress={onShareQuote} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <ShareIcon size={20} color={AppTheme.text.primary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.quoteIntro}>CITA DE HOY DE:</Text>
              <Text style={styles.quoteAuthor}>{todaysQuote.author}</Text>

              <Text style={styles.quoteText}>"{todaysQuote.quote}"</Text>

              <View style={styles.prayerSection}>
                <Text style={styles.prayerLabel}>🙏 ORACIÓN DE HOY</Text>
                <Text style={styles.prayerText}>{todaysQuote.prayer}</Text>
              </View>
            </View>

            {/* Daily Items List */}
            {/* Quick Actions Grid */}
            <View style={styles.quickActionsGrid}>
              <QuickActionCard
                icon={<BookOpen size={22} color="#FFFFFF" />}
                title="Santa Biblia"
                subtitle="Lee la palabra"
                onPress={() => router.push('/(tabs)/bible')}
                gradientColors={['#F97316', '#EA580C']} // Orange
              />

              <QuickActionCard
                icon={<MessageCircle size={22} color="#FFFFFF" />}
                title="Notas"
                subtitle="Tus reflexiones"
                onPress={() => router.push('/bible-study-notes')}
                gradientColors={['#8B5CF6', '#7C3AED']} // Purple
              />

              <QuickActionCard
                icon={<Users size={22} color="#FFFFFF" />}
                title="Oración"
                subtitle="Tiempo con Dios"
                onPress={() => router.push('/(tabs)/prayer-tracker')}
                gradientColors={['#10B981', '#059669']} // Emerald
              />

              <QuickActionCard
                icon={<Play size={22} color="#FFFFFF" />}
                title="Ánimo"
                subtitle="Rastreador diario"
                onPress={() => router.push('/(tabs)/mood-tracker')}
                gradientColors={['#F43F5E', '#E11D48']} // Rose
              />
            </View>

          </View>
        </Animated.View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5EF', // Matches the warm cream bg
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD8B4', // Light orange
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
  },
  greetingText: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    ...Shadows.sm,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D97706',
  },
  communityBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFD8B4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  dayColumn: {
    alignItems: 'center',
    gap: 6,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C2410C',
  },
  activeDayText: {
    color: '#C2410C',
  },
  dateCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C2410C',
    zIndex: 1,
  },
  activeDateText: {
    color: '#FFFFFF',
  },
  activeDayIndicator: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EA580C',
  },
  viewCalendarBtn: {
    marginBottom: Spacing.sm,
  },
  viewCalendarText: {
    color: '#EA580C',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Main Card Styles
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    minHeight: Dimensions.get('window').height * 0.7,
    paddingHorizontal: Spacing.md,
    paddingTop: 32,
    ...Shadows.md,
  },
  mainCardContent: {
    gap: Spacing.md,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    flex: 1,
    marginRight: Spacing.md,
    lineHeight: 34,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },

  // Quote Card
  quoteCard: {
    backgroundColor: '#FAF5EF',
    borderRadius: 24,
    padding: 24,
    marginBottom: Spacing.lg,
  },
  quoteCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quoteHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quoteLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  quoteIntro: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  quoteAuthor: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  quoteText: {
    fontSize: 17,
    fontWeight: '500',
    fontStyle: 'italic',
    color: '#475569',
    lineHeight: 26,
    marginBottom: 20,
  },
  prayerSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  prayerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: AppTheme.accent.primary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  prayerText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#475569',
    lineHeight: 22,
  },
  readButton: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  readButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 1,
  },

  // Quick Actions Grid
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: (width - (Spacing.md * 2) - 34 - 12) / 2, // 32 horizontal padding + 12 gap / 2
    borderRadius: 24,
    ...Shadows.md,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 16,
    height: 140, // Fixed height for consistency
    justifyContent: 'space-between',
  },
  quickActionIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionContent: {
    marginTop: 8,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickActionArrow: {
    position: 'absolute',
    top: 16,
    right: 16,
    opacity: 0.8,
  },

  // Remove Ads Card Styles
  removeAdsCard: {
    marginTop: Spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  removeAdsGradient: {
    padding: 20,
    position: 'relative',
  },
  removeAdsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  removeAdsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  removeAdsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeAdsTextContainer: {
    flex: 1,
  },
  removeAdsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  removeAdsSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  removeAdsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F97316',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  removeAdsButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sparkleDecor1: {
    position: 'absolute',
    top: 10,
    right: 80,
  },
  sparkleDecor2: {
    position: 'absolute',
    bottom: 12,
    left: 60,
  },
});