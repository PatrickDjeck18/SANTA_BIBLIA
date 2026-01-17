// Modern Mood Entry Card with Enhanced Scripture Integration
// Contemporary design with glass morphism and modern aesthetics

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  X, 
  BookOpen, 
  Heart,
  Sparkles,
  ChevronRight,
  Calendar,
  Clock,
  Lightbulb
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';
import ScriptureSuggestion from './ScriptureSuggestion';

interface ModernMoodEntryCardProps {
  isVisible: boolean;
  onClose: () => void;
  onAddMood: (mood: string, rating: number, influences: string[], note: string) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;
const isMediumScreen = screenWidth >= 375 && screenWidth < 414;

export const ModernMoodEntryCard: React.FC<ModernMoodEntryCardProps> = ({
  isVisible,
  onClose,
  onAddMood,
}) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [showScripture, setShowScripture] = useState(false);
  const [slideAnim] = useState(new Animated.Value(screenHeight));
  const [fadeAnim] = useState(new Animated.Value(0));

  // Enhanced mood categories with modern design
  const moodCategories = {
    positive: {
      title: 'Positive Vibes',
      icon: '✨',
      gradient: ['#FDE68A', '#F59E0B', '#D97706'] as const,
      moods: [
        { id: 'positive_001_blessed', label: '🙏 Blessed', color: '#FFD700', emoji: '🙏' },
        { id: 'positive_002_happy', label: '😊 Happy', color: '#10B981', emoji: '😊' },
        { id: 'positive_003_joyful', label: '😄 Joyful', color: '#22C55E', emoji: '😄' },
        { id: 'positive_004_grateful', label: '🙏 Grateful', color: '#84CC16', emoji: '🙏' },
        { id: 'positive_005_excited', label: '🤩 Excited', color: '#F59E0B', emoji: '🤩' },
        { id: 'positive_006_loved', label: '💕 Loved', color: '#EC4899', emoji: '💕' },
        { id: 'positive_007_proud', label: '🏆 Proud', color: '#10B981', emoji: '🏆' },
      ]
    },
    calm: {
      title: 'Peaceful',
      icon: '🧘',
      gradient: ['#93C5FD', '#3B82F6', '#1D4ED8'] as const,
      moods: [
        { id: 'calm_001_peaceful', label: '😇 Peaceful', color: '#06B6D4', emoji: '😇' },
        { id: 'calm_002_calm', label: '😌 Calm', color: '#3B82F6', emoji: '😌' },
        { id: 'calm_003_content', label: '😊 Content', color: '#8B5CF6', emoji: '😊' },
        { id: 'calm_004_prayerful', label: '🙏 Prayerful', color: '#8B5CF6', emoji: '🙏' },
      ]
    },
    energetic: {
      title: 'Energized',
      icon: '⚡',
      gradient: ['#A78BFA', '#8B5CF6', '#7C3AED'] as const,
      moods: [
        { id: 'energetic_001_motivated', label: '💪 Motivated', color: '#10B981', emoji: '💪' },
        { id: 'energetic_002_focused', label: '🎯 Focused', color: '#3B82F6', emoji: '🎯' },
        { id: 'energetic_003_creative', label: '🎨 Creative', color: '#8B5CF6', emoji: '🎨' },
        { id: 'energetic_004_inspired', label: '✨ Inspired', color: '#EC4899', emoji: '✨' },
        { id: 'energetic_005_accomplished', label: '🎉 Accomplished', color: '#22C55E', emoji: '🎉' },
      ]
    },
    challenging: {
      title: 'Challenging',
      icon: '💭',
      gradient: ['#FCA5A5', '#EF4444', '#DC2626'] as const,
      moods: [
        { id: 'challenging_001_sad', label: '😔 Sad', color: '#6B7280', emoji: '😔' },
        { id: 'challenging_002_anxious', label: '😰 Anxious', color: '#8B5CF6', emoji: '😰' },
        { id: 'challenging_003_stressed', label: '😓 Stressed', color: '#EC4899', emoji: '😓' },
        { id: 'challenging_004_angry', label: '😠 Angry', color: '#EF4444', emoji: '😠' },
        { id: 'challenging_005_frustrated', label: '😤 Frustrated', color: '#F97316', emoji: '😤' },
        { id: 'challenging_006_tired', label: '😴 Tired', color: '#A855F7', emoji: '😴' },
        { id: 'challenging_007_lonely', label: '🥺 Lonely', color: '#6B7280', emoji: '🥺' },
        { id: 'challenging_008_confused', label: '😕 Confused', color: '#F59E0B', emoji: '😕' },
        { id: 'challenging_009_fearful', label: '😨 Fearful', color: '#DC2626', emoji: '😨' },
      ]
    },
    spiritual: {
      title: 'Spiritual',
      icon: '🕊️',
      gradient: ['#C4B5FD', '#A78BFA', '#8B5CF6'] as const,
      moods: [
        { id: 'spiritual_001_inspired', label: '✨ Inspired', color: '#A78BFA', emoji: '✨' },
        { id: 'spiritual_002_connected', label: '🔗 Connected', color: '#6EE7B7', emoji: '🔗' },
        { id: 'spiritual_003_faithful', label: '✝️ Faithful', color: '#F472B6', emoji: '✝️' },
      ]
    },
    curious: {
      title: 'Curious',
      icon: '🤔',
      gradient: ['#5EEAD4', '#14B8A6', '#0F766E'] as const,
      moods: [
        { id: 'curious_001_curious', label: '🤔 Curious', color: '#14B8A6', emoji: '🤔' },
        { id: 'curious_002_surprised', label: '😲 Surprised', color: '#FBBF24', emoji: '😲' },
        { id: 'curious_003_hopeful', label: '🌟 Hopeful', color: '#FBBF24', emoji: '🌟' },
      ]
    },
  };

  useEffect(() => {
    if (isVisible) {
      // Reset form
      setSelectedMood(null);
      setSelectedMoodId(null);
      setNotes('');
      setIntensity(5);
      setShowScripture(false);
      
      // Animate in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const handleMoodSelect = (mood: any, categoryKey: string) => {
    setSelectedMood(mood.id);
    setSelectedMoodId(mood.id);
    setShowScripture(true);
  };

  const handleAddMood = () => {
    if (!selectedMood) {
      Alert.alert('Please Select a Mood', 'Choose how you\'re feeling to continue');
      return;
    }

    const moodData = Object.values(moodCategories)
      .flatMap(category => category.moods)
      .find(mood => mood.id === selectedMood);
    
    if (!moodData) {
      Alert.alert('Error', 'Invalid mood selected');
      return;
    }

    const moodLabel = moodData.label.split(' ').slice(1).join(' ');
    onAddMood(moodLabel, intensity, [], notes.trim());
    onClose();
  };

  const getMoodEmoji = (moodId: string) => {
    for (const category of Object.values(moodCategories)) {
      const mood = category.moods.find(m => m.id === moodId);
      if (mood) return mood.emoji;
    }
    return '😊';
  };

  const getCategoryGradient = (categoryKey: string) => {
    const category = moodCategories[categoryKey as keyof typeof moodCategories];
    return category?.gradient || ['#F3F4F6', '#E5E7EB', '#D1D5DB'];
  };

  return (
    <View style={styles.overlay}>
      <Animated.View 
        style={[
          styles.container,
          {
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          }
        ]}
      >
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        {/* Modern Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[Colors.white, Colors.primary[50]]}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIcon}>
                  <Calendar size={24} color={Colors.primary[600]} />
                </View>
                <View>
                  <Text style={styles.headerTitle}>How are you feeling?</Text>
                  <Text style={styles.headerSubtitle}>Share your emotions and find peace</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <X size={24} color={Colors.neutral[600]} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Main Content */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Mood Categories */}
          {Object.entries(moodCategories).map(([key, category]) => (
            <View key={key} style={styles.categorySection}>
              <LinearGradient
                colors={category.gradient}
                style={styles.categoryHeader}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.categoryTitle}>
                  {category.icon} {category.title}
                </Text>
              </LinearGradient>
              
              <View style={styles.moodGrid}>
                {category.moods.map((mood) => (
                  <TouchableOpacity
                    key={mood.id}
                    style={[
                      styles.moodCard,
                      selectedMood === mood.id && styles.selectedMoodCard
                    ]}
                    onPress={() => handleMoodSelect(mood, key)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[
                        selectedMood === mood.id ? Colors.primary[500] : Colors.white,
                        selectedMood === mood.id ? Colors.primary[600] : Colors.neutral[50]
                      ]}
                      style={styles.moodCardGradient}
                    >
                      <Text style={[
                        styles.moodEmoji,
                        selectedMood === mood.id && styles.selectedMoodEmoji
                      ]}>
                        {mood.emoji}
                      </Text>
                      <Text style={[
                        styles.moodLabel,
                        selectedMood === mood.id && styles.selectedMoodLabel
                      ]}>
                        {mood.label.split(' ').slice(1).join(' ')}
                      </Text>
                      {selectedMood === mood.id && (
                        <View style={styles.selectedIndicator}>
                          <Heart size={16} color={Colors.white} fill={Colors.white} />
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Intensity Selector */}
          {selectedMood && (
            <View style={styles.intensitySection}>
              <View style={styles.intensityHeader}>
                <Text style={styles.intensityTitle}>How intense is this feeling?</Text>
                <Text style={styles.intensitySubtitle}>Rate from gentle to overwhelming</Text>
              </View>
              
              <View style={styles.intensityContainer}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.intensityDot,
                      intensity === value && styles.selectedIntensityDot
                    ]}
                    onPress={() => setIntensity(value)}
                    activeOpacity={0.7}
                  >
                    {intensity === value && (
                      <View style={styles.intensityInnerDot} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.intensityLabels}>
                <Text style={styles.intensityLabelLeft}>Gentle</Text>
                <Text style={styles.intensityLabelRight}>Intense</Text>
              </View>
            </View>
          )}

          {/* Enhanced Scripture Section */}
          {showScripture && selectedMoodId && (
            <View style={styles.scriptureSection}>
              <View style={styles.scriptureHeader}>
                <LinearGradient
                  colors={Colors.gradients.primary}
                  style={styles.scriptureGradient}
                >
                  <View style={styles.scriptureHeaderContent}>
                    <View style={styles.scriptureHeaderLeft}>
                      <BookOpen size={24} color={Colors.white} />
                      <View>
                        <Text style={styles.scriptureTitle}>Scripture for your mood</Text>
                        <Text style={styles.scriptureSubtitle}>
                          {getMoodEmoji(selectedMoodId)} Personalized spiritual guidance
                        </Text>
                      </View>
                    </View>
                    <Sparkles size={20} color={Colors.white} />
                  </View>
                </LinearGradient>
              </View>
              
              <ScriptureSuggestion
                moodType={(() => {
                  const moodData = Object.values(moodCategories)
                    .flatMap(category => category.moods)
                    .find(mood => mood.id === selectedMoodId);
                  return moodData ? moodData.label.split(' ').slice(1).join(' ') : 'Peaceful';
                })()}
                intensity={intensity}
                notes={notes}
                isCompact={true}
                showAIInsight={true}
              />
            </View>
          )}

          {/* Notes Section */}
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>What's on your heart?</Text>
            <Text style={styles.notesSubtitle}>Share your thoughts, prayers, or simply what you feel</Text>
            
            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                placeholder="Tell God what's in your heart, reflect on your day, or simply write what you feel..."
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
                placeholderTextColor={Colors.neutral[400]}
                returnKeyType="done"
                blurOnSubmit={true}
              />
              {notes.length > 0 && (
                <View style={styles.notesHint}>
                  <Lightbulb size={16} color={Colors.primary[500]} />
                  <Text style={styles.notesHintText}>
                    {notes.length} characters
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              !selectedMood && styles.submitButtonDisabled
            ]}
            onPress={handleAddMood}
            disabled={!selectedMood}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={selectedMood ? Colors.gradients.primary : [Colors.neutral[300], Colors.neutral[400]]}
              style={styles.submitButtonGradient}
            >
              <Text style={styles.submitButtonText}>
                {selectedMood ? '✨ Save Mood & Find Peace' : 'Select a mood to continue'}
              </Text>
              {selectedMood && <ChevronRight size={20} color={Colors.white} />}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '92%',
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius['3xl'],
    borderTopRightRadius: BorderRadius['3xl'],
    overflow: 'hidden',
    ...Shadows['2xl'],
  },
  header: {
    borderTopLeftRadius: BorderRadius['3xl'],
    borderTopRightRadius: BorderRadius['3xl'],
  },
  headerGradient: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    ...Shadows.md,
  },
  headerTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
  },
  headerSubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    marginTop: 2,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Spacing['2xl'],
    paddingHorizontal: Spacing.lg,
  },
  categorySection: {
    marginBottom: Spacing.xl,
  },
  categoryHeader: {
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  categoryTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
    textAlign: 'center',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodCard: {
    width: '48%',
    marginBottom: Spacing.sm,
  },
  selectedMoodCard: {
    transform: [{ scale: 1.02 }],
    borderColor: Colors.primary[500],
    ...Shadows.lg,
  },
  moodCardGradient: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    minHeight: 80,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  selectedMoodEmoji: {
    filter: 'brightness(0) invert(1)',
  },
  moodLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[700],
    textAlign: 'center',
  },
  selectedMoodLabel: {
    color: Colors.white,
  },
  selectedIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  intensitySection: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  intensityHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  intensityTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[900],
    marginBottom: 2,
  },
  intensitySubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
  },
  intensityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  intensityDot: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral[200],
  },
  selectedIntensityDot: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
    ...Shadows.sm,
  },
  intensityInnerDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
  },
  intensityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  intensityLabelLeft: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[500],
    fontWeight: '500',
  },
  intensityLabelRight: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[500],
    fontWeight: '500',
  },
  scriptureSection: {
    marginBottom: Spacing.xl,
  },
  scriptureHeader: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  scriptureGradient: {
    padding: Spacing.md,
  },
  scriptureHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scriptureHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scriptureTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
    marginLeft: Spacing.sm,
  },
  scriptureSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    marginLeft: Spacing.sm,
    opacity: 0.9,
  },
  notesSection: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  notesTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[900],
    marginBottom: 2,
  },
  notesSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    marginBottom: Spacing.md,
  },
  textAreaContainer: {
    position: 'relative',
  },
  textArea: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: Typography.sizes.base,
    color: Colors.neutral[900],
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    ...Shadows.sm,
  },
  notesHint: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 8,
    right: 12,
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  notesHintText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary[500],
    marginLeft: 4,
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  submitButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
    marginRight: Spacing.sm,
  },
});

export default ModernMoodEntryCard;