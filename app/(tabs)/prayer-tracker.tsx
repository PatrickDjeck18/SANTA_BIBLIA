import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  StatusBar,
  SafeAreaView,
  Animated,
  Modal,
  RefreshControl,
} from 'react-native';
import { Dimensions } from 'react-native';
import {
  Bell,
  Timer,
  Pause,
  Play,
  Square,
  Flame,
  Heart,
  Clock,
  Plus,
  ChevronRight,
  Zap,
  CalendarDays,
  Filter,
  X,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';
import { Calendar } from 'react-native-calendars';
import { AppTheme } from '@/constants/AppTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ModernHeader } from '@/components/ModernHeader';
import * as Haptics from 'expo-haptics';
import { useUnifiedPrayers } from '@/hooks/useUnifiedPrayers';
import { useInterstitialAds } from '@/hooks/useInterstitialAds';

const { width: screenWidth } = Dimensions.get('window');

export default function PrayerTrackerScreen() {
  const { prayers, addPrayer, refetch, loading } = useUnifiedPrayers();
  const tabBarHeight = useBottomTabBarHeight();
  useInterstitialAds('prayer');

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Calendar state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  // Get dates with prayers
  const prayerDates = useMemo(() => {
    const dates: { [key: string]: boolean } = {};
    if (prayers) {
      prayers.forEach(prayer => {
        const date = new Date(prayer.created_at).toISOString().split('T')[0];
        dates[date] = true;
      });
    }
    return dates;
  }, [prayers]);

  // Calendar marked dates
  const markedDates = useMemo(() => {
    const marks: any = {};
    Object.keys(prayerDates).forEach((date) => {
      marks[date] = {
        marked: true,
        dotColor: '#EA580C',
        selectedColor: '#EA580C',
      };
    });

    if (selectedDate) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: '#EA580C',
      };
    }
    return marks;
  }, [prayerDates, selectedDate]);

  // Filter sessions by selected date
  const filteredSessions = useMemo(() => {
    let sessions = [...prayers].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (selectedDate) {
      sessions = sessions.filter(session => {
        const sessionDate = new Date(session.created_at).toISOString().split('T')[0];
        return sessionDate === selectedDate;
      });
    }

    // If not filtering, just return top 5 for "Recent Sessions"
    return selectedDate ? sessions : sessions.slice(0, 5);
  }, [prayers, selectedDate]);

  // Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Load timer state
  const loadTimerState = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('prayer_timer_state');
      if (stored) {
        const timerState = JSON.parse(stored);
        let seconds = timerState.seconds || 0;
        const isRunning = timerState.isRunning || false;
        const timestamp = timerState.timestamp || Date.now();

        if (isRunning) {
          const elapsed = Math.floor((Date.now() - timestamp) / 1000);
          seconds = seconds + elapsed;
        }

        setTimerSeconds(seconds);
        setIsTimerRunning(isRunning);

        if (isRunning) {
          startTimeRef.current = Date.now() - (seconds * 1000);
        }
      }
    } catch (error) {
      console.error('Error loading timer state:', error);
    }
  }, []);

  // Save timer state
  const saveTimerState = useCallback(async (seconds: number, isRunning: boolean) => {
    try {
      const timerState = { seconds, isRunning, timestamp: Date.now() };
      await AsyncStorage.setItem('prayer_timer_state', JSON.stringify(timerState));
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const sessionCount = prayers.length;
    const totalMinutes = prayers.reduce((acc, session) => {
      const duration = session.description ? parseInt(session.description.split(' ')[0]) : 0;
      return acc + (isNaN(duration) ? 0 : duration);
    }, 0);

    // Calculate streak
    let streak = 0;
    if (prayers.length > 0) {
      const sortedPrayers = [...prayers].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < sortedPrayers.length; i++) {
        const prayerDate = new Date(sortedPrayers[i].created_at);
        prayerDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today.getTime() - prayerDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === streak) {
          streak++;
        } else if (daysDiff > streak) {
          break;
        }
      }
    }

    return { sessionCount, totalMinutes, streak };
  }, [prayers]);

  // Recent sessions
  const recentSessions = useMemo(() => {
    return [...prayers]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [prayers]);

  // Timer animation
  useEffect(() => {
    if (isTimerRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isTimerRunning]);

  // Timer logic
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (isTimerRunning) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now() - (timerSeconds * 1000);
      }

      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - (startTimeRef.current || now)) / 1000);
        setTimerSeconds(elapsed);
      }, 100);
    } else {
      startTimeRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTimerRunning]);

  useFocusEffect(
    useCallback(() => {
      refetch();
      loadTimerState();
    }, [refetch, loadTimerState])
  );

  const formatTimer = (total: number) => {
    const minutes = Math.floor(Math.abs(total) / 60);
    const seconds = Math.abs(total) % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleTimer = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const willStart = !isTimerRunning;

    if (willStart) {
      startTimeRef.current = Date.now() - (timerSeconds * 1000);
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.1, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      startTimeRef.current = null;
    }

    setIsTimerRunning(willStart);
    saveTimerState(timerSeconds, willStart);
  }, [isTimerRunning, timerSeconds, saveTimerState]);

  const stopAndSave = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const currentSeconds = timerSeconds;
    setIsTimerRunning(false);
    startTimeRef.current = null;

    if (currentSeconds < 10) {
      Alert.alert('Muy Corto', 'Ora al menos 10 segundos para guardar.');
      setTimerSeconds(0);
      saveTimerState(0, false);
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const durationMin = Math.max(1, Math.round(currentSeconds / 60));

      const prayerData = {
        title: `Sesión de Oración`,
        description: `${durationMin} minutos de oración`,
        status: 'active' as const,
        category: 'personal' as const,
        priority: 'medium' as const,
        frequency: 'daily' as const,
        is_shared: false,
        is_community: false,

        // Default values for required fields
        answered_at: null,
        answered_notes: null,
        prayer_notes: null,
        gratitude_notes: null,
        reminder_time: null,
        reminder_frequency: null,
        last_prayed_at: new Date().toISOString(),
        prayer_count: 1,
        answered_prayer_count: 0,
      };

      const result = await addPrayer(prayerData);

      if (result.error) {
        Alert.alert('Error', 'Error al guardar la sesión.');
        return;
      }

      setTimerSeconds(0);
      saveTimerState(0, false);

      Alert.alert('¡Guardado! ✨', `${durationMin} ${durationMin === 1 ? 'minuto' : 'minutos'} de oración registrados.`);

    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la sesión.');
    }
  }, [timerSeconds, addPrayer, saveTimerState]);

  const resetTimer = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsTimerRunning(false);
    setTimerSeconds(0);
    startTimeRef.current = null;
    saveTimerState(0, false);
  }, [saveTimerState]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatSessionTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sessionDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    if (sessionDay.getTime() === today.getTime()) {
      return `Hoy a las ${time}`;
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (sessionDay.getTime() === yesterday.getTime()) {
      return `Ayer a las ${time}`;
    }

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Modern Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Heart size={20} color="#EA580C" />
            </View>
            <Text style={styles.headerTitle}>Diario de Oración</Text>
          </View>

          <View style={styles.headerActions}>
            <View style={styles.streakBadge}>
              <Zap size={14} color="#EA580C" fill="#EA580C" />
              <Text style={styles.streakText}>{stats.streak}</Text>
            </View>
          </View>
        </View>

        {/* Calendar Toggle */}
        <TouchableOpacity
          style={styles.viewCalendarBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowCalendar(!showCalendar);
          }}
        >
          {showCalendar ? (
            <>
              <X size={14} color="#EA580C" />
              <Text style={styles.viewCalendarText}>CERRAR CALENDARIO</Text>
            </>
          ) : (
            <>
              <CalendarDays size={14} color="#EA580C" />
              <Text style={styles.viewCalendarText}>VER CALENDARIO</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Calendar View */}
        {showCalendar ? (
          <View style={styles.calendarCard}>
            <Calendar
              markedDates={markedDates}
              onDayPress={(day) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedDate(selectedDate === day.dateString ? null : day.dateString);
              }}
              dayComponent={({ date, state }) => {
                const dateString = date?.dateString || '';
                const hasPrayer = prayerDates[dateString];
                const isSelected = selectedDate === dateString;
                const isToday = dateString === new Date().toISOString().split('T')[0];
                const isDisabled = state === 'disabled';

                return (
                  <TouchableOpacity
                    onPress={() => {
                      if (!isDisabled && date) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedDate(selectedDate === dateString ? null : dateString);
                      }
                    }}
                    style={[
                      styles.calendarDay,
                      isSelected && styles.calendarDaySelected,
                      isToday && !isSelected && styles.calendarDayToday,
                    ]}
                  >
                    {hasPrayer ? (
                      <Text style={styles.calendarEmoji}>🙏</Text>
                    ) : (
                      <View style={styles.calendarEmptyDay} />
                    )}
                    <Text
                      style={[
                        styles.calendarDayText,
                        isDisabled && styles.calendarDayTextDisabled,
                        isSelected && styles.calendarDayTextSelected,
                        isToday && !isSelected && styles.calendarDayTextToday,
                      ]}
                    >
                      {date?.day}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
                textSectionTitleColor: '#64748B',
                selectedDayBackgroundColor: '#EA580C',
                selectedDayTextColor: 'white',
                todayTextColor: '#EA580C',
                dayTextColor: '#1E293B',
                textDisabledColor: '#CBD5E1',
                dotColor: '#EA580C',
                selectedDotColor: 'white',
                arrowColor: '#EA580C',
                monthTextColor: '#1E293B',
                textDayFontSize: 15,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 13,
                textDayFontWeight: '500',
                textMonthFontWeight: '700',
                textDayHeaderFontWeight: '600',
              }}
            />
          </View>
        ) : (
          /* Week Selector */
          <View style={styles.weekSelector}>
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => {
              const currentDay = new Date().getDay();
              const uiDayIndex = currentDay === 0 ? 6 : currentDay - 1;
              const isActive = index === uiDayIndex;

              // Calculate week dates
              const today = new Date();
              const monday = new Date(today);
              monday.setDate(today.getDate() - (uiDayIndex));
              const dateNum = new Date(monday);
              dateNum.setDate(monday.getDate() + index);

              return (
                <View key={index} style={styles.dayColumn}>
                  <Text style={styles.dayText}>
                    {day}
                  </Text>
                  <View style={styles.dateCircleContainer}>
                    {isActive && <View style={styles.activeDayIndicator} />}
                    <Text style={[styles.dateText, isActive && styles.activeDateText]}>
                      {dateNum.getDate()}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EA580C"
          />
        }
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Spacing.xl + tabBarHeight + 100 }]}
      >
        {/* Main Content Card */}
        <View style={styles.mainCard}>
          {/* Stats Row */}
          <View style={styles.statsRowNew}>
            <View style={styles.statCardNew}>
              <Text style={styles.statEmojiNew}>🔥</Text>
              <Text style={styles.statValueNew}>{stats.streak}</Text>
              <Text style={styles.statLabelNew}>Racha</Text>
            </View>
            <View style={styles.statCardNew}>
              <Text style={styles.statEmojiNew}>🙏</Text>
              <Text style={styles.statValueNew}>{stats.sessionCount}</Text>
              <Text style={styles.statLabelNew}>Sesiones</Text>
            </View>
            <View style={styles.statCardNew}>
              <Text style={styles.statEmojiNew}>⏱️</Text>
              <Text style={styles.statValueNew}>{stats.totalMinutes}</Text>
              <Text style={styles.statLabelNew}>Minutos</Text>
            </View>
          </View>

          {/* Timer Card */}
          <View style={styles.timerCard}>
            <Text style={styles.sectionTitle}>Temporizador de Oración</Text>

            <View style={styles.timerContainer}>
              <Animated.View style={[
                styles.timerRingContainer,
                { transform: [{ scale: pulseAnim }] }
              ]}>
                <LinearGradient
                  colors={isTimerRunning ? ['#FFF7ED', '#FFEDD5'] : ['#F8FAFC', '#F1F5F9']}
                  style={[styles.timerCircle, isTimerRunning && styles.timerCircleActive]}
                >
                  <View style={[styles.innerRing, isTimerRunning && styles.innerRingActive]} />
                  <Text style={[styles.timerText, isTimerRunning && styles.timerTextActive]}>
                    {formatTimer(timerSeconds)}
                  </Text>
                  {isTimerRunning && (
                    <View style={styles.recordingIndicator}>
                      <View style={styles.recordingDot} />
                      <Text style={styles.recordingText}>GRABANDO</Text>
                    </View>
                  )}
                </LinearGradient>
              </Animated.View>
            </View>

            <View style={styles.timerControls}>
              {/* Reset Button (Left) */}
              <TouchableOpacity
                style={[styles.controlBtn, styles.secondaryControlBtn, { opacity: timerSeconds > 0 ? 1 : 0.5 }]}
                onPress={resetTimer}
                disabled={timerSeconds === 0}
              >
                <View style={styles.iconContainer}>
                  <Square size={20} color={Colors.neutral[500]} />
                </View>
                <Text style={styles.controlLabel}>Reiniciar</Text>
              </TouchableOpacity>

              {/* Play/Pause Button (Center, Large) */}
              <TouchableOpacity
                style={[styles.mainControlBtn, isTimerRunning && styles.mainControlBtnActive]}
                onPress={toggleTimer}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isTimerRunning ? ['#F97316', '#EA580C'] : ['#1E293B', '#0F172A']}
                  style={styles.mainControlGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                >
                  {isTimerRunning ? (
                    <Pause size={32} color={Colors.white} fill={Colors.white} />
                  ) : (
                    <Play size={32} color={Colors.white} fill={Colors.white} style={{ marginLeft: 4 }} />
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Save Button (Right) */}
              <TouchableOpacity
                style={[styles.controlBtn, styles.secondaryControlBtn, { opacity: timerSeconds > 0 ? 1 : 0.5 }]}
                onPress={stopAndSave}
                disabled={timerSeconds === 0}
              >
                <View style={[styles.iconContainer, timerSeconds > 0 && styles.saveIconContainer]}>
                  <Heart size={20} color={timerSeconds > 0 ? '#EA580C' : Colors.neutral[500]} fill={timerSeconds > 0 ? '#EA580C' : 'transparent'} />
                </View>
                <Text style={[styles.controlLabel, timerSeconds > 0 && styles.saveLabel]}>Guardar</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.timerHint}>
              {isTimerRunning ? 'Sigue orando, Dios te escucha...' : 'Toca play para iniciar tu sesión de oración'}
            </Text>
          </View>

          {/* Recent Sessions */}
          <View style={styles.sessionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {selectedDate ? 'SESIONES' : 'SESIONES RECIENTES'}
              </Text>
              {selectedDate && (
                <TouchableOpacity
                  style={styles.clearFilterBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedDate(null);
                  }}
                >
                  <Text style={styles.clearFilterText}>Limpiar Filtro</Text>
                  <X size={12} color="#64748B" />
                </TouchableOpacity>
              )}
            </View>

            {/* Empty State for Filter */}
            {selectedDate && filteredSessions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📅</Text>
                <Text style={styles.emptyTitle}>Sin sesiones encontradas</Text>
                <Text style={styles.emptySubtitle}>No hay sesiones de oración en esta fecha</Text>
              </View>
            ) : filteredSessions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🕊️</Text>
                <Text style={styles.emptyTitle}>Sin sesiones aún</Text>
                <Text style={styles.emptySubtitle}>Inicia tu primera sesión de oración arriba</Text>
              </View>
            ) : (
              filteredSessions.map((session, index) => {
                const duration = session.description ? session.description.split(' ')[0] : '0';
                return (
                  <View key={session.id || index} style={styles.sessionCard}>
                    <View style={styles.sessionIcon}>
                      <Timer size={16} color="#EA580C" />
                    </View>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionDuration}>{duration} minutos</Text>
                      <Text style={styles.sessionTime}>
                        {formatSessionTime(session.created_at)}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5EF',
  },
  headerContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: Spacing.md,
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
    gap: Spacing.md,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD8B4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
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
    color: '#EA580C',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  viewCalendarText: {
    color: '#EA580C',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: Spacing.xl,
    paddingTop: 28,
    paddingBottom: Spacing.lg,
    minHeight: 500,
    ...Shadows.md,
  },
  statsRowNew: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCardNew: {
    flex: 1,
    backgroundColor: '#FAF5EF',
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statEmojiNew: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValueNew: {
    fontSize: 22,
    fontWeight: '700',
    color: '#EA580C',
  },
  statLabelNew: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: Spacing.xl,
    paddingTop: 28,
    paddingBottom: Spacing.lg,
    ...Shadows.md,
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  heroEmoji: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FAF5EF',
    borderRadius: 16,
    padding: Spacing.md,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EA580C',
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statDivider: {
    width: 0,
  },
  timerCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: Spacing.xl,
    alignSelf: 'flex-start',
    textTransform: 'uppercase',
  },

  // New Timer Styles
  timerContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerRingContainer: {
    padding: 10,
  },
  timerCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  timerCircleActive: {
    borderColor: '#FDBA74',
    ...Shadows.md,
    shadowColor: '#EA580C',
    shadowOpacity: 0.2,
  },
  innerRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  innerRingActive: {
    borderColor: '#FED7AA',
  },
  timerText: {
    fontSize: 64,
    fontWeight: '300',
    color: '#334155',
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
    marginTop: -10,
  },
  timerTextActive: {
    color: '#EA580C',
    fontWeight: '400',
  },
  recordingIndicator: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
    letterSpacing: 0.5,
  },

  // Controls
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 20,
    marginBottom: 20,
  },
  mainControlBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    ...Shadows.md,
  },
  mainControlBtnActive: {
    ...Shadows.lg,
    shadowColor: '#EA580C',
  },
  mainControlGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtn: {
    alignItems: 'center',
    gap: 8,
    minWidth: 60,
  },
  secondaryControlBtn: {
    padding: 10,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveIconContainer: {
    backgroundColor: '#FFF7ED',
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  saveLabel: {
    color: '#EA580C',
  },
  timerHint: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Keep existing styles below
  quickActions: {
    paddingHorizontal: Spacing.xl,
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.md,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EF',
    borderRadius: 20,
    padding: 16,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EA580C',
  },
  actionInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  sessionsSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 0,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EF',
    borderRadius: 16,
    padding: 14,
    marginBottom: Spacing.sm,
  },
  sessionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFD8B4',
  },
  sessionInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  sessionDuration: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  sessionTime: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: Spacing.xs,
  },

  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: Spacing.sm,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  calendarDay: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  calendarDaySelected: {
    backgroundColor: '#EA580C',
  },
  calendarDayToday: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#EA580C',
  },
  calendarEmoji: {
    fontSize: 14,
    marginBottom: 2,
  },
  calendarEmptyDay: {
    height: 14,
    marginBottom: 2,
  },
  calendarDayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1E293B',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  calendarDayTextToday: {
    color: '#EA580C',
    fontWeight: '700',
  },
  calendarDayTextDisabled: {
    color: '#CBD5E1',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  clearFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  clearFilterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
});

