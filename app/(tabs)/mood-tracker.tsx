import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,

  Modal,
  StatusBar,
  Animated,
  Platform,
  TouchableWithoutFeedback,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar } from 'react-native-calendars';
import {
  Plus,
  Trash2,
  Clock,
  Smile,
  TrendingUp,
  X,
  Filter,
  CalendarDays,
  Zap,
} from 'lucide-react-native';
import { Svg, Path, Circle, Line, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/DesignTokens';
import { AppTheme } from '@/constants/AppTheme';
import { router } from 'expo-router';
import { useUnifiedMoodTracker } from '../../hooks/useUnifiedMoodTracker';
import { emitMoodEntrySaved } from '../../lib/eventEmitter';
import { useInterstitialAds } from '@/hooks/useInterstitialAds';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import AddMoodModal from '@/components/AddMoodModal';
import { ModernHeader } from '@/components/ModernHeader';
import * as Haptics from 'expo-haptics';



// Simplified mood colors mapping
const moodColors: { [key: string]: { color: string; gradient: readonly [string, string] } } = {
  'Happy': { color: '#22C55E', gradient: ['#22C55E', '#16A34A'] as const },
  'Grateful': { color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'] as const },
  'Calm': { color: '#06B6D4', gradient: ['#06B6D4', '#0891B2'] as const },
  'Excited': { color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] as const },
  'Loved': { color: '#EC4899', gradient: ['#EC4899', '#DB2777'] as const },
  'Peaceful': { color: '#A78BFA', gradient: ['#A78BFA', '#8B5CF6'] as const },
  'Motivated': { color: '#10B981', gradient: ['#10B981', '#059669'] as const },
  'Blessed': { color: '#FBBF24', gradient: ['#FBBF24', '#F59E0B'] as const },
  'Sad': { color: '#6B7280', gradient: ['#6B7280', '#4B5563'] as const },
  'Anxious': { color: '#F472B6', gradient: ['#F472B6', '#EC4899'] as const },
  'Tired': { color: '#94A3B8', gradient: ['#94A3B8', '#64748B'] as const },
  'Stressed': { color: '#EF4444', gradient: ['#EF4444', '#DC2626'] as const },
};

const moodEmojis: { [key: string]: string } = {
  'Happy': '😊',
  'Grateful': '🙏',
  'Calm': '😌',
  'Excited': '🤩',
  'Loved': '💕',
  'Peaceful': '😇',
  'Motivated': '💪',
  'Blessed': '✨',
  'Sad': '😔',
  'Anxious': '😰',
  'Tired': '😴',
  'Stressed': '😓',
};

const moodVerses: { [key: string]: { text: string; reference: string } } = {
  'Happy': { text: "A merry heart doeth good like a medicine: but a broken spirit drieth the bones.", reference: "Proverbs 17:22" },
  'Grateful': { text: "In every thing give thanks: for this is the will of God in Christ Jesus concerning you.", reference: "1 Thessalonians 5:18" },
  'Calm': { text: "Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you.", reference: "John 14:27" },
  'Excited': { text: "This is the day which the LORD hath made; we will rejoice and be glad in it.", reference: "Psalm 118:24" },
  'Loved': { text: "We love him, because he first loved us.", reference: "1 John 4:19" },
  'Peaceful': { text: "Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.", reference: "Isaiah 26:3" },
  'Motivated': { text: "I can do all things through Christ which strengtheneth me.", reference: "Philippians 4:13" },
  'Blessed': { text: "Blessed be the God and Father of our Lord Jesus Christ, who hath blessed us with all spiritual blessings.", reference: "Ephesians 1:3" },
  'Sad': { text: "The LORD is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.", reference: "Psalm 34:18" },
  'Anxious': { text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.", reference: "Philippians 4:6" },
  'Tired': { text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.", reference: "Matthew 11:28" },
  'Stressed': { text: "Cast thy burden upon the LORD, and he shall sustain thee: he shall never suffer the righteous to be moved.", reference: "Psalm 55:22" },
};

interface MoodEntry {
  id: string;
  mood_id: string;
  mood_type: string;
  emoji: string;
  notes: string;
  created_at: any;
  intensity_rating?: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const MoodChart = ({ data }: { data: MoodEntry[] }) => {
  const { width } = useWindowDimensions();
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  // Map moods to numeric values for the chart (1-5 scale roughly)
  const getMoodValue = (mood: string) => {
    // Positive moods
    if (['Excited', 'Happy', 'Blessed', 'Joy', 'Happiness', 'Delight', 'Triumph', 'Exhilaration', 'Enthusiasm'].includes(mood)) return 5;
    if (['Loved', 'Motivated', 'Love', 'Tenderness', 'Admiration', 'Infatuation', 'Enchantment', 'Bliss'].includes(mood)) return 4.5;
    if (['Grateful', 'Peaceful', 'Gratitude', 'Hope', 'Interest', 'Curiosity', 'Anticipation', 'Pride', 'Compassion'].includes(mood)) return 4;
    if (['Calm', 'Content', 'Serene', 'Relaxed'].includes(mood)) return 3.5;
    // Neutral
    if (['Boredom', 'Detachment'].includes(mood)) return 3;
    // Negative moods
    if (['Tired', 'Exhausted'].includes(mood)) return 2.5;
    if (['Stressed', 'Anxious', 'Worry', 'Nervousness', 'Bitterness', 'Longing', 'Disappointment', 'Regret'].includes(mood)) return 2;
    if (['Sad', 'Sadness', 'Grief', 'Pity', 'Alienation', 'Shock', 'Fear', 'Anxiety', 'Dread', 'Panic'].includes(mood)) return 1.5;
    if (['Despair', 'Helplessness', 'Hopelessness'].includes(mood)) return 1;
    return 3;
  };

  // Filter data based on period
  const getFilteredData = () => {
    const now = new Date();
    const filtered = data.filter(entry => {
      const entryDate = new Date(entry.created_at);
      if (period === 'weekly') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return entryDate >= weekAgo;
      } else {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return entryDate >= monthAgo;
      }
    });
    return [...filtered].slice(0, period === 'weekly' ? 7 : 30).reverse();
  };

  const chartData = getFilteredData();

  if (chartData.length < 2) {
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Tendencias de Ánimo</Text>
          <View style={styles.periodToggle}>
            <TouchableOpacity
              style={[styles.periodTab, period === 'weekly' && styles.periodTabActive]}
              onPress={() => setPeriod('weekly')}
            >
              <Text style={[styles.periodTabText, period === 'weekly' && styles.periodTabTextActive]}>Semana</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.periodTab, period === 'monthly' && styles.periodTabActive]}
              onPress={() => setPeriod('monthly')}
            >
              <Text style={[styles.periodTabText, period === 'monthly' && styles.periodTabTextActive]}>Mes</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.chartEmptyState}>
          <Text style={styles.chartEmptyEmoji}>📊</Text>
          <Text style={styles.chartEmptyText}>Registra al menos 2 estados de ánimo para ver tendencias</Text>
        </View>
      </View>
    );
  }

  const chartHeight = 140;
  const chartWidth = width - 48;
  const padding = 25;

  const xStep = (chartWidth - (padding * 2)) / (Math.max(chartData.length - 1, 1));
  const yMax = 5.5;
  const yMin = 0.5;
  const yRange = yMax - yMin;

  const points = chartData.map((entry, index) => {
    const x = padding + (index * xStep);
    const value = getMoodValue(entry.mood_type);
    const y = chartHeight - padding - ((value - yMin) / yRange) * (chartHeight - (padding * 2));
    return { x, y, value, mood: entry.mood_type, emoji: entry.emoji };
  });

  // Create smooth bezier path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  points.slice(1).forEach((p, i) => {
    const prev = points[i];
    const cp1x = prev.x + (p.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (p.x - prev.x) / 2;
    const cp2y = p.y;
    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.y}`;
  });

  // Gradient area
  const fillPath = `${pathD} L ${points[points.length - 1].x} ${chartHeight - 10} L ${points[0].x} ${chartHeight - 10} Z`;

  // Calculate average mood
  const avgMood = points.reduce((sum, p) => sum + p.value, 0) / points.length;
  const avgMoodLabel = avgMood >= 4 ? 'Excelente' : avgMood >= 3 ? 'Bien' : avgMood >= 2 ? 'Regular' : 'Bajo';
  const avgMoodColor = avgMood >= 4 ? '#22C55E' : avgMood >= 3 ? '#F59E0B' : avgMood >= 2 ? '#94A3B8' : '#EF4444';

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartHeader}>
        <View>
          <Text style={styles.chartTitle}>Tendencias de Ánimo</Text>
          <View style={styles.avgMoodRow}>
            <View style={[styles.avgMoodDot, { backgroundColor: avgMoodColor }]} />
            <Text style={styles.avgMoodText}>Prom: {avgMoodLabel}</Text>
          </View>
        </View>
        <View style={styles.periodToggle}>
          <TouchableOpacity
            style={[styles.periodTab, period === 'weekly' && styles.periodTabActive]}
            onPress={() => setPeriod('weekly')}
          >
            <Text style={[styles.periodTabText, period === 'weekly' && styles.periodTabTextActive]}>Semana</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodTab, period === 'monthly' && styles.periodTabActive]}
            onPress={() => setPeriod('monthly')}
          >
            <Text style={[styles.periodTabText, period === 'monthly' && styles.periodTabTextActive]}>Mes</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Svg width={chartWidth} height={chartHeight}>
        <Defs>
          <SvgLinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#8B5CF6" stopOpacity="0.3" />
            <Stop offset="1" stopColor="#8B5CF6" stopOpacity="0" />
          </SvgLinearGradient>
        </Defs>
        {/* Horizontal grid lines */}
        {[1, 2, 3, 4].map((_, i) => (
          <Line
            key={i}
            x1={padding}
            y1={padding + (i * (chartHeight - padding * 2) / 4)}
            x2={chartWidth - padding}
            y2={padding + (i * (chartHeight - padding * 2) / 4)}
            stroke="#E2E8F0"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        ))}
        {/* Fill Area */}
        <Path d={fillPath} fill="url(#chartGradient)" />
        {/* Line */}
        <Path d={pathD} stroke="#8B5CF6" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Dots */}
        {points.map((p, i) => (
          <Circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="6"
            fill="#FFFFFF"
            stroke="#8B5CF6"
            strokeWidth="3"
          />
        ))}
      </Svg>
      {/* Emoji indicators below chart */}
      <View style={[styles.chartEmojiRow, { width: chartWidth, paddingHorizontal: padding - 10 }]}>
        {points.slice(0, 7).map((p, i) => (
          <Text key={i} style={styles.chartEmojiItem}>{p.emoji || '😊'}</Text>
        ))}
      </View>
    </View>
  );
};


export default function MoodTrackerScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const moodTracker = useUnifiedMoodTracker();
  const { saveMoodEntry, deleteMoodEntry, refetch, moodStats, loading: moodLoading } = moodTracker;
  const moodEntries = (moodTracker as any).moodEntries || [];
  const { showInterstitialAd } = useInterstitialAds('mood');
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  // Initial loading state handler
  useEffect(() => {
    if (!moodLoading) {
      setInitialLoading(false);
    }
  }, [moodLoading]);

  // Process mood entries
  const processedMoodHistory = useMemo(() => {
    if (moodEntries && moodEntries.length > 0) {
      const historyEntries = moodEntries.map((entry: any) => {
        let createdDate;
        if (entry.created_at) {
          if (typeof entry.created_at === 'number') {
            createdDate = new Date(entry.created_at);
          } else if (typeof entry.created_at === 'string') {
            createdDate = new Date(entry.created_at);
          } else if (entry.created_at instanceof Date) {
            createdDate = entry.created_at;
          } else {
            createdDate = new Date(entry.created_at);
          }
        } else if (entry.entry_date) {
          createdDate = new Date(entry.entry_date);
        } else {
          createdDate = new Date();
        }

        return {
          id: entry.id || `mood-${Date.now()}-${Math.random()}`,
          mood_id: entry.mood_id || 'calm',
          mood_type: entry.mood_type || 'Unknown',
          emoji: entry.emoji || moodEmojis[entry.mood_type] || '😊',
          notes: entry.note || entry.notes || '',
          created_at: createdDate,
          intensity_rating: entry.intensity_rating || null,
        };
      });

      return historyEntries.sort((a: any, b: any) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });
    }
    return [];
  }, [moodEntries]);

  useEffect(() => {
    setMoodHistory(processedMoodHistory);
  }, [processedMoodHistory]);

  const getMoodColor = (moodType: string) => {
    return moodColors[moodType] || { color: '#6B7280', gradient: ['#6B7280', '#4B5563'] as const };
  };

  // Get unique dates with moods
  const moodDates = useMemo(() => {
    const dateMap: { [key: string]: { emoji: string; color: string } } = {};
    moodHistory.forEach(entry => {
      const date = new Date(entry.created_at).toISOString().split('T')[0];
      // Only set if not already set (since we iterate newest to oldest, this keeps the latest)
      if (!dateMap[date]) {
        const moodData = getMoodColor(entry.mood_type);
        const emoji = entry.emoji || moodEmojis[entry.mood_type] || '😊';
        dateMap[date] = { emoji, color: moodData.color };
      }
    });
    return dateMap;
  }, [moodHistory]);

  // Calendar marked dates
  const markedDates = useMemo(() => {
    const marks: any = {};
    Object.entries(moodDates).forEach(([date, data]) => {
      marks[date] = {
        marked: true,
        dotColor: data.color,
        selectedColor: data.color,
      };
    });
    if (selectedDate) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: AppTheme.calendar.selectedDay.background,
      };
    }
    return marks;
  }, [moodDates, selectedDate]);

  // Filter mood history by selected date
  const filteredMoodHistory = useMemo(() => {
    if (!selectedDate) return moodHistory;

    return moodHistory.filter(entry => {
      if (!entry.created_at) return false;
      const entryDateObj = new Date(entry.created_at);
      const entryYear = entryDateObj.getFullYear();
      const entryMonth = String(entryDateObj.getMonth() + 1).padStart(2, '0');
      const entryDay = String(entryDateObj.getDate()).padStart(2, '0');
      const entryDateStr = `${entryYear}-${entryMonth}-${entryDay}`;
      return entryDateStr === selectedDate;
    });
  }, [moodHistory, selectedDate]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const deleteMood = async (id: string) => {
    setEntryToDelete(id);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!entryToDelete) {
      cancelDelete();
      return;
    }

    try {
      const { error } = await deleteMoodEntry(entryToDelete);
      if (error) {
        throw new Error(error.message || 'Failed to delete mood entry');
      }
      Alert.alert('Éxito', 'Estado de ánimo eliminado');
      setDeleteModalVisible(false);
      setEntryToDelete(null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al eliminar');
      setDeleteModalVisible(false);
      setEntryToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setEntryToDelete(null);
  };

  // Get mood stats
  const stats = useMemo(() => {
    const today = new Date();
    const last7Days = moodHistory.filter(entry => {
      const entryDate = new Date(entry.created_at);
      const diffTime = today.getTime() - entryDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    });

    const moodCounts: { [key: string]: number } = {};
    last7Days.forEach(entry => {
      moodCounts[entry.mood_type] = (moodCounts[entry.mood_type] || 0) + 1;
    });

    let topMood = 'Happy';
    let topCount = 0;
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > topCount) {
        topMood = mood;
        topCount = count;
      }
    });

    return {
      total: moodHistory.length,
      thisWeek: last7Days.length,
      topMood,
      streak: Math.min(last7Days.length, 7),
    };
  }, [moodHistory]);

  // Mood Entry Card Component
  const MoodCard = useCallback(({ entry }: { entry: MoodEntry }) => {
    const moodData = getMoodColor(entry.mood_type);
    const emoji = entry.emoji || moodEmojis[entry.mood_type] || '😊';
    const verse = moodVerses[entry.mood_type];

    const formatTime = (date: any) => {
      const d = new Date(date);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const entryDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const isToday = entryDay.getTime() === today.getTime();

      const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      if (isToday) {
        return `Hoy a las ${time}`;
      }

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (entryDay.getTime() === yesterday.getTime()) {
        return `Ayer a las ${time}`;
      }

      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ` at ${time}`;
    };

    return (
      <View style={styles.moodCard}>
        <View style={styles.moodCardContent}>
          <LinearGradient
            colors={moodData.gradient}
            style={styles.moodBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.moodBadgeEmoji}>{emoji}</Text>
          </LinearGradient>

          <View style={styles.moodInfo}>
            <Text style={styles.moodType}>{entry.mood_type}</Text>
            <View style={styles.moodMeta}>
              <Clock size={12} color={Colors.neutral[400]} />
              <Text style={styles.moodTime}>{formatTime(entry.created_at)}</Text>
            </View>

            {/* Linked Verse */}
            {verse && (
              <View style={styles.verseContainer}>
                <Text style={styles.verseText}>"{verse.text}"</Text>
                <Text style={styles.verseReference}>- {verse.reference}</Text>
              </View>
            )}

            {entry.notes && (
              <Text style={styles.moodNotes} numberOfLines={2}>
                "{entry.notes}"
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => deleteMood(entry.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 size={18} color={Colors.error[500]} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }, []);

  if (initialLoading || (moodLoading && moodHistory.length === 0)) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppTheme.accent.primary} />
          <Text style={styles.loadingText}>Cargando tu viaje emocional...</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Modern Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Smile size={20} color="#EA580C" />
            </View>
            <Text style={styles.headerTitle}>Diario de Ánimo</Text>
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

        {/* Calendar View OR Week Selector */}
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
                const moodData = moodDates[dateString];
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
                    {moodData ? (
                      <Text style={styles.calendarEmoji}>{moodData.emoji}</Text>
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
              monday.setDate(today.getDate() - uiDayIndex);
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
            colors={['#EA580C']}
          />
        }
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Spacing.xl + tabBarHeight + 100 }]}
      >
        {/* Main Content Card */}
        <View style={styles.mainCard}>
          {/* Stats Row */}
          <View style={styles.statsRowNew}>
            <View style={styles.statCardNew}>
              <Text style={styles.statEmojiNew}>{moodEmojis[stats.topMood] || '😊'}</Text>
              <Text style={styles.statValueNew}>{stats.total}</Text>
              <Text style={styles.statLabelNew}>Total</Text>
            </View>
            <View style={styles.statCardNew}>
              <Text style={styles.statEmojiNew}>🔥</Text>
              <Text style={styles.statValueNew}>{stats.streak}</Text>
              <Text style={styles.statLabelNew}>Racha</Text>
            </View>
            <View style={styles.statCardNew}>
              <Text style={styles.statEmojiNew}>📊</Text>
              <Text style={styles.statValueNew}>{stats.thisWeek}</Text>
              <Text style={styles.statLabelNew}>Esta Semana</Text>
            </View>
          </View>

          {/* Mood Chart */}
          {!selectedDate && moodHistory.length >= 2 && (
            <MoodChart data={moodHistory} />
          )}



          {/* Filter Banner */}
          {selectedDate && (
            <View style={styles.filterBanner}>
              <Filter size={16} color="#EA580C" />
              <Text style={styles.filterText}>
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </Text>
              <TouchableOpacity
                style={styles.clearFilter}
                onPress={() => setSelectedDate(null)}
              >
                <X size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* Mood History */}
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>
              {selectedDate ? 'ÁNIMOS DEL DÍA SELECCIONADO' : 'ÁNIMOS RECIENTES'}
            </Text>

            {filteredMoodHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>
                  {selectedDate ? '📅' : '✨'}
                </Text>
                <Text style={styles.emptyTitle}>
                  {selectedDate ? 'Sin ánimos este día' : 'Comienza Tu Viaje'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {selectedDate
                    ? 'Intenta seleccionar otra fecha'
                    : 'Toca + para registrar tu primer estado de ánimo'}
                </Text>
                {selectedDate && (
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => setSelectedDate(null)}
                  >
                    <Text style={styles.emptyButtonText}>Mostrar Todo</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              filteredMoodHistory.map((entry) => (
                <MoodCard key={entry.id} entry={entry} />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setModalVisible(true);
        }}
        activeOpacity={0.9}
      >
        <View style={styles.fabGradient}>
          <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
        </View>
      </TouchableOpacity>

      {/* Add Mood Modal */}
      <AddMoodModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddMood={async (mood, rating, influences, note, emoji) => {
          try {
            const { data: savedEntry, error } = await saveMoodEntry(
              mood,
              rating,
              influences,
              note,
              emoji
            );

            if (error) {
              throw new Error(error.message || 'Failed to save mood');
            }

            if (savedEntry) {
              Alert.alert('Success', 'Mood saved! 🎉');
              setModalVisible(false);
              await refetch();
              emitMoodEntrySaved(savedEntry);
            }
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to save');
          }
        }}
      />

      {/* Delete Modal */}
      <Modal
        visible={deleteModalVisible}
        animationType="fade"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={cancelDelete}
      >
        <TouchableWithoutFeedback onPress={cancelDelete}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <View style={styles.deleteModal}>
                <View style={styles.deleteIcon}>
                  <Trash2 size={32} color="#EF4444" />
                </View>
                <Text style={styles.deleteTitle}>Delete Mood?</Text>
                <Text style={styles.deleteMessage}>
                  This action cannot be undone.
                </Text>
                <View style={styles.deleteButtons}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={cancelDelete}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmBtn} onPress={confirmDelete}>
                    <Text style={styles.confirmBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    alignSelf: 'flex-end',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
  },
  viewCalendarText: {
    color: '#EA580C',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF5EF',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: '#64748B',
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: Spacing.md,
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
    gap: Spacing.md,
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  heroEmoji: {
    fontSize: 40,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  heroStats: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  heroStat: {
    flex: 1,
    backgroundColor: '#FAF5EF',
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: 'center',
  },
  heroStatNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#EA580C',
  },
  heroStatLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 0,
  },
  calendarToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FAF5EF',
    borderRadius: 16,
    padding: Spacing.md,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  calendarToggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EA580C',
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    marginHorizontal: 0,
    ...Shadows.sm,
  },
  filterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  filterText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#EA580C',
  },
  clearFilter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historySection: {
    paddingHorizontal: Spacing.sm,
    backgroundColor: '#FFFFFF',
    paddingTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
  },
  moodCard: {
    backgroundColor: '#FAF5EF',
    borderRadius: 20,
    marginBottom: Spacing.sm,
  },
  moodCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  moodBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodBadgeEmoji: {
    fontSize: 22,
  },
  moodInfo: {
    flex: 1,
  },
  moodType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  moodMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  moodTime: {
    fontSize: 13,
    color: '#64748B',
  },
  moodNotes: {
    fontSize: 13,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 4,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
    paddingHorizontal: Spacing.lg,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    backgroundColor: '#1E293B',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 16,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EA580C',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // New Styles
  verseContainer: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  verseText: {
    fontSize: 13,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  verseReference: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    textAlign: 'right',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 8,
    marginBottom: 20,
    borderRadius: 24,
    padding: 20,
    paddingBottom: 16,
    ...Shadows.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  avgMoodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  avgMoodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  avgMoodText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  periodToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  periodTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  periodTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  periodTabTextActive: {
    color: '#8B5CF6',
  },
  chartEmptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  chartEmptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  chartEmptyText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  chartEmojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  chartEmojiItem: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: Spacing.xl,
    margin: Spacing.lg,
    width: '85%',
    maxWidth: 340,
    alignItems: 'center',
  },
  deleteIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  deleteTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: Spacing.sm,
  },
  deleteMessage: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  deleteButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#FAF5EF',
    paddingVertical: Spacing.md,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: Spacing.md,
    borderRadius: 16,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Calendar Day Styles
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
});