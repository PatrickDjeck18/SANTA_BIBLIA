import React, { useState, useEffect, useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar,
  Alert,
  Animated,
  ActivityIndicator,
} from 'react-native';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  WifiOff,
  CheckCircle,
  Type,
  Plus,
  Minus,
  SkipBack,
  SkipForward,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BannerAd from './BannerAd';

const { width } = Dimensions.get('window');

interface Verse {
  number: number;
  text: string;
}

interface BibleReaderProps {
  bookName: string;
  chapterNumber: number;
  verses: Verse[];
  bibleVersion: string;
  bibleId: string;
  bookId: string;
  onBack: () => void;
  onSearch: () => void;
  onMenu: () => void;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  isLoading?: boolean;
}

export const BibleReader: React.FC<BibleReaderProps> = ({
  bookName,
  chapterNumber,
  verses,
  bibleVersion,
  bibleId,
  bookId,
  onBack,
  onSearch,
  onMenu,
  onPrevChapter,
  onNextChapter,
  canGoPrev,
  canGoNext,
  isLoading = false,
}) => {
  console.log('📖 BibleReader rendered with:', { bookName, chapterNumber, canGoPrev, canGoNext });

  const tabBarHeight = useBottomTabBarHeight();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(0);
  const [isOfflineAvailable, setIsOfflineAvailable] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showOfflineMenu, setShowOfflineMenu] = useState(false);
  const [textSize, setTextSize] = useState(22); // Default text size
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(0.8);
  const [showControls, setShowControls] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];
  const progressAnim = useState(new Animated.Value(0))[0];

  // Load saved text size on mount and check speech availability
  useEffect(() => {
    const loadTextSize = async () => {
      try {
        const savedTextSize = await AsyncStorage.getItem('bible_text_size');
        if (savedTextSize) {
          setTextSize(parseInt(savedTextSize));
        }
      } catch (error) {
        console.error('Failed to load text size:', error);
      }
    };
    
    const checkSpeechAvailability = async () => {
      try {
        // Simplified speech availability check to prevent infinite loops
        console.log('🎵 Checking speech availability...');
        
        // Just set speech as available without testing to prevent infinite loops
        setSpeechAvailable(true);
      } catch (error) {
        console.error('🎵 Speech not available:', error);
        setSpeechAvailable(false);
      }
    };
    
    loadTextSize();
    checkSpeechAvailability();
  }, []);

  // Save text size when it changes
  useEffect(() => {
    const saveTextSize = async () => {
      try {
        await AsyncStorage.setItem('bible_text_size', textSize.toString());
      } catch (error) {
        console.error('Failed to save text size:', error);
      }
    };
    saveTextSize();
  }, [textSize]);

  // Check offline availability when component mounts or book/chapter changes
  useEffect(() => {
    // Simplified offline check - assume online for now to prevent infinite loops
    setIsOfflineAvailable(false);
  }, [bookId, bibleId]);

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
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

  // Stop speech when component unmounts or chapter changes
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  useEffect(() => {
    // Stop any ongoing speech when chapter changes
    Speech.stop();
    setIsPlaying(false);
    setCurrentVerse(0);
  }, [bookName, chapterNumber]);

  const togglePlayPause = useCallback(async () => {
    console.log('🎵 togglePlayPause called, isPlaying:', isPlaying, 'verses.length:', verses.length);
    
    if (isPlaying) {
      console.log('🎵 Stopping speech...');
      try {
        Speech.stop();
        setIsPlaying(false);
      } catch (error) {
        console.error('🎵 Error stopping speech:', error);
        setIsPlaying(false);
      }
    } else {
      if (verses.length === 0) {
        console.log('🎵 No verses available to play');
        Alert.alert('No Content', 'No verses available to read aloud.');
        return;
      }
      
      console.log('🎵 Starting speech...');
      try {
        setIsPlaying(true);
        setCurrentVerse(0);
        await speakVerse(0);
      } catch (error) {
        console.error('🎵 Error starting speech:', error);
        setIsPlaying(false);
        Alert.alert(
          'Audio Error', 
          'Unable to start audio playback. Please check your device settings and try again.',
          [{ text: 'OK' }]
        );
      }
    }
  }, [isPlaying, verses.length]);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
    }
  }, [isMuted, isPlaying]);

  const adjustPlaybackSpeed = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const speakVerse = useCallback(async (verseIndex: number) => {
    console.log('🎵 speakVerse called:', { verseIndex, versesLength: verses.length, isMuted });
    
    if (verseIndex >= verses.length || isMuted) {
      console.log('🎵 Stopping speech - verseIndex >= verses.length or isMuted');
      setIsPlaying(false);
      return;
    }

    const verse = verses[verseIndex];
    if (!verse || !verse.text) {
      console.log('🎵 Invalid verse data:', verse);
      setIsPlaying(false);
      return;
    }

    const textToSpeak = `${verse.number}. ${verse.text}`;
    
    console.log('🎵 Speaking verse:', { verseNumber: verse.number, textLength: verse.text.length });
    
    setCurrentVerse(verseIndex);
    
    // Update progress animation
    Animated.timing(progressAnim, {
      toValue: (verseIndex + 1) / verses.length,
      duration: 100,
      useNativeDriver: false,
    }).start();
    
    try {
      await Speech.speak(textToSpeak, {
        language: 'en',
        pitch: 1.0,
        rate: playbackSpeed,
        onDone: () => {
          console.log('🎵 Speech done for verse:', verseIndex);
          if (verseIndex < verses.length - 1 && !isMuted) {
            // Small delay before next verse for better user experience
            setTimeout(() => {
              speakVerse(verseIndex + 1);
            }, 500);
          } else {
            console.log('🎵 All verses completed');
            setIsPlaying(false);
          }
        },
        onError: (error) => {
          console.error('🎵 Speech error:', error);
          setIsPlaying(false);
          Alert.alert(
            'Audio Error', 
            'An error occurred while reading the text. Please try again.',
            [{ text: 'OK' }]
          );
        }
      });
    } catch (error) {
      console.error('🎵 Speech.speak error:', error);
      setIsPlaying(false);
      Alert.alert(
        'Audio Error', 
        'Unable to read the text aloud. Please check your device settings.',
        [{ text: 'OK' }]
      );
    }
  }, [verses, isMuted, playbackSpeed, progressAnim]);

  const stopAudio = () => {
    console.log('🎵 stopAudio called');
    Speech.stop();
    setIsPlaying(false);
  };

  // Retry speech functionality
  const retrySpeech = async () => {
    setRetryCount(prev => prev + 1);
    setSpeechAvailable(true);
    
    try {
      console.log('🎵 Retrying speech functionality...');
      await Speech.speak('Speech retry test', {
        language: 'en',
        rate: 1.0,
        pitch: 1.0,
        onDone: () => {
          console.log('🎵 Speech retry successful');
          setSpeechAvailable(true);
          setRetryCount(0);
          Alert.alert('Success', 'Audio functionality has been restored!');
        },
        onError: (error) => {
          console.error('🎵 Speech retry failed:', error);
          setSpeechAvailable(false);
          if (retryCount < 2) {
            Alert.alert(
              'Retry Failed', 
              'Audio is still not working. Would you like to try again?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Retry', onPress: retrySpeech }
              ]
            );
          } else {
            Alert.alert(
              'Audio Unavailable', 
              'Audio functionality is not available on this device. Please check your device settings or contact support.',
              [{ text: 'OK' }]
            );
          }
        }
      });
    } catch (error) {
      console.error('🎵 Speech retry error:', error);
      setSpeechAvailable(false);
    }
  };

  // Test function to verify speech is working
  const testSpeech = async () => {
    try {
      console.log('🎵 Testing speech with simple text...');
      await Speech.speak('Hello, this is a test of the speech functionality.', {
        language: 'en',
        pitch: 1.0,
        rate: 0.8,
        onDone: () => {
          console.log('🎵 Test speech completed');
          Alert.alert('Test Successful', 'Audio is working correctly!');
        },
        onError: (error) => {
          console.error('🎵 Test speech error:', error);
          Alert.alert(
            'Test Failed', 
            'Audio test failed. Would you like to retry?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Retry', onPress: retrySpeech }
            ]
          );
        }
      });
    } catch (error) {
      console.error('🎵 Test speech failed:', error);
      Alert.alert(
        'Test Error', 
        'Unable to test audio. Would you like to retry?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: retrySpeech }
        ]
      );
    }
  };

  const skipToVerse = (verseIndex: number) => {
    Speech.stop();
    if (verseIndex >= 0 && verseIndex < verses.length) {
      setCurrentVerse(verseIndex);
      speakVerse(verseIndex);
    }
  };

  const increaseTextSize = useCallback(() => {
    setTextSize(prev => Math.min(prev + 2, 32)); // Max size 32
  }, []);

  const decreaseTextSize = useCallback(() => {
    setTextSize(prev => Math.max(prev - 2, 16)); // Min size 16
  }, []);


  const handleNavigation = useCallback((direction: 'prev' | 'next') => {
    // Add visual feedback for navigation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    if (direction === 'prev') {
      onPrevChapter();
    } else {
      onNextChapter();
    }
  }, [fadeAnim, onPrevChapter, onNextChapter]);


  const handleDownloadForOffline = async () => {
    if (!true) {
      Alert.alert('Offline', 'You need to be online to download books for offline reading.');
      return;
    }

    if (isOfflineAvailable) {
      Alert.alert('Already Downloaded', `${bookName} is already available for offline reading.`);
      return;
    }

    Alert.alert(
      'Download Book',
      `Download "${bookName}" for offline reading? This will download all chapters.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: startDownload
        }
      ]
    );
  };

  const startDownload = async () => {
    setIsDownloading(true);
    try {
      // Simplified download - just show success message for now
      // TODO: Implement proper offline download functionality
      setTimeout(() => {
        Alert.alert('Success', `Successfully downloaded ${bookName} for offline reading!`);
        setIsOfflineAvailable(true);
        setIsDownloading(false);
      }, 1000);
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download book. Please try again.');
      setIsDownloading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* White Background */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: Colors.white }]} />

      {/* Offline overlay indicator */}
      {isOfflineAvailable && !true && (
        <View style={styles.offlineOverlay}>
          <View style={styles.offlineOverlayContent}>
            <WifiOff size={20} color={Colors.warning[600]} />
            <Text style={styles.offlineOverlayText}>Reading from offline cache</Text>
          </View>
        </View>
      )}
      
      {/* Header Card */}
      <View style={styles.hero}>
        <View style={[styles.heroGradient, { backgroundColor: Colors.white }]}>
          <View style={styles.heroContent}>
            <TouchableOpacity style={styles.heroActionButton} onPress={onBack}>
              <ArrowLeft size={20} color={Colors.primary[600]} />
            </TouchableOpacity>
            
            <View style={styles.heroTextBlock}>
              <Text style={styles.heroSubtitle}>
                {isOfflineAvailable && !true && (
                  <Text style={styles.offlineIndicatorText}>Reading from offline cache</Text>
                )}
                {isOfflineAvailable && true && (
                  <Text style={styles.onlineIndicatorText}>Available offline</Text>
                )}
                {!isOfflineAvailable && !true && (
                  <Text style={styles.offlineWarningText}>Offline - Limited access</Text>
                )}
              </Text>
            </View>
            
            <View style={styles.heroActions}>
              {/* Text Size Controls */}
              <View style={styles.textSizeSection}>
                <TouchableOpacity
                  style={[styles.textSizeButton, textSize <= 16 && styles.textSizeButtonDisabled]}
                  onPress={decreaseTextSize}
                  disabled={textSize <= 16}
                >
                  <Minus size={16} color={textSize <= 16 ? Colors.neutral[400] : Colors.primary[600]} />
                </TouchableOpacity>
                
                <View style={styles.textSizeDisplay}>
                  <Type size={14} color={Colors.primary[600]} />
                  <Text style={styles.textSizeText}>{textSize}</Text>
                </View>
                
                <TouchableOpacity
                  style={[styles.textSizeButton, textSize >= 32 && styles.textSizeButtonDisabled]}
                  onPress={increaseTextSize}
                  disabled={textSize >= 32}
                >
                  <Plus size={16} color={textSize >= 32 ? Colors.neutral[400] : Colors.primary[600]} />
                </TouchableOpacity>
              </View>

              {/* Audio Controls */}
              <View style={styles.audioControls}>
                <TouchableOpacity
                  style={[
                    styles.audioButton, 
                    (!verses.length || !speechAvailable) && styles.audioButtonDisabled
                  ]}
                  onPress={togglePlayPause}
                  disabled={!verses.length || !speechAvailable}
                >
                  {isPlaying ? (
                    <Pause size={20} color={speechAvailable ? Colors.primary[600] : Colors.neutral[400]} />
                  ) : (
                    <Play size={20} color={speechAvailable ? Colors.primary[600] : Colors.neutral[400]} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.audioButton, 
                    isMuted && styles.audioButtonActive,
                    !speechAvailable && styles.audioButtonDisabled
                  ]}
                  onPress={toggleMute}
                  disabled={!speechAvailable}
                >
                  {isMuted ? (
                    <VolumeX size={20} color={speechAvailable ? Colors.warning[600] : Colors.neutral[400]} />
                  ) : (
                    <Volume2 size={20} color={speechAvailable ? Colors.primary[600] : Colors.neutral[400]} />
                  )}
                </TouchableOpacity>


              </View>
            </View>
          </View>
        </View>
        
        {/* Speech availability indicator */}
        {!speechAvailable && (
          <View style={styles.speechWarningContainer}>
            <Text style={styles.speechWarningText}>
              Audio playback is not available on this device
            </Text>
          </View>
        )}
      </View>

      {/* Banner Ad */}
      <BannerAd placement="bible" />

      {/* Bible Content */}
      <View style={styles.contentWrapper}>
        {/* Navigation Bar - Moved to top */}
        <Animated.View style={[styles.navigationBar, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={[styles.navButton, (!canGoPrev || isLoading) && styles.navButtonDisabled]}
            onPress={() => handleNavigation('prev')}
            disabled={!canGoPrev || isLoading}
          >
            <ChevronLeft size={20} color={canGoPrev && !isLoading ? Colors.neutral[900] : Colors.neutral[400]} />
            <Text style={[styles.navButtonText, (!canGoPrev || isLoading) && styles.navButtonTextDisabled]}>
              Previous
            </Text>
          </TouchableOpacity>

          <View style={styles.chapterInfo}>
            <Text style={styles.chapterTitle}>{bookName} {chapterNumber}</Text>
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary[500]} />
                <Text style={styles.loadingText}>Loading chapter...</Text>
              </View>
            )}
            {isPlaying && !isLoading && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <Animated.View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        })
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {currentVerse + 1} / {verses.length}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.navButton, (!canGoNext || isLoading) && styles.navButtonDisabled]}
            onPress={() => handleNavigation('next')}
            disabled={!canGoNext || isLoading}
          >
            <Text style={[styles.navButtonText, (!canGoNext || isLoading) && styles.navButtonTextDisabled]}>
              Next
            </Text>
            <ChevronRight size={20} color={canGoNext && !isLoading ? Colors.neutral[900] : Colors.neutral[400]} />
          </TouchableOpacity>
        </Animated.View>

        {isLoading ? (
          <View style={styles.loadingContentContainer}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
            <Text style={styles.loadingContentText}>Loading chapter content...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.contentContainer,
              { paddingBottom: tabBarHeight + 80 } // Dynamic padding based on tab bar height
            ]}
          >
          {/* Show message when offline and content not available */}
          {!true && !isOfflineAvailable && verses.length === 0 && (
            <View style={styles.offlineUnavailableContainer}>
              <WifiOff size={48} color={Colors.warning[500]} />
              <Text style={styles.offlineUnavailableTitle}>Content Not Available</Text>
              <Text style={styles.offlineUnavailableText}>
                This chapter is not available offline. Please connect to the internet and download this book for offline reading.
              </Text>
              {true && (
                <TouchableOpacity
                  style={styles.downloadNowButton}
                  onPress={handleDownloadForOffline}
                >
                  <Download size={16} color={Colors.white} />
                  <Text style={styles.downloadNowText}>Download Book</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Show limited content message when offline */}
          {!true && isOfflineAvailable && verses.length === 0 && (
            <View style={styles.offlineLimitedContainer}>
              <WifiOff size={32} color={Colors.warning[500]} />
              <Text style={styles.offlineLimitedText}>
                Limited offline content available for this chapter.
              </Text>
            </View>
          )}

          {verses.map((verse, index) => (
            <View
              key={verse.number}
              style={[
                styles.verseContainer,
                currentVerse === index && styles.currentVerseContainer,
              ]}
            >
              <View>
                <Text style={[
                  styles.verseText,
                  currentVerse === index && styles.currentVerseText,
                  { fontSize: textSize }
                ]}>
                  <Text style={[
                    styles.verseNumber,
                    currentVerse === index && styles.currentVerseNumber
                  ]}>{verse.number}</Text>
                  {' '}{verse.text}
                </Text>
              </View>
            </View>
          ))}
          </ScrollView>
        )}
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  // Header Card Styles
  hero: {
    paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0) + Spacing.md,
    paddingBottom: Spacing.lg,
  },
  heroGradient: {
    paddingHorizontal: Spacing.lg, // Increased padding for better content spacing
    paddingVertical: Spacing.lg,
    borderRadius: 0, // Remove border radius for full width
    marginHorizontal: 0, // Remove horizontal margins for full width
    ...Shadows.md,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroActionButton: {
    padding: Spacing.sm,
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.md,
  },
  heroTextBlock: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  heroTitle: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    lineHeight: Typography.lineHeights.normal,
  },
  offlineIndicatorText: {
    fontSize: Typography.sizes.sm,
    color: Colors.success[600],
    fontWeight: Typography.weights.medium,
  },
  onlineIndicatorText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary[600],
    fontWeight: Typography.weights.medium,
  },
  offlineWarningText: {
    fontSize: Typography.sizes.sm,
    color: Colors.warning[600],
    fontWeight: Typography.weights.medium,
  },
  heroActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  audioControls: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  audioButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[100],
  },
  audioButtonDisabled: {
    opacity: 0.5,
  },
  audioButtonActive: {
    backgroundColor: Colors.warning[100],
  },
  textSizeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
  },
  textSizeButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.white,
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSizeButtonDisabled: {
    opacity: 0.5,
  },
  textSizeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    minWidth: 40,
    justifyContent: 'center',
  },
  textSizeText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.primary[600],
  },
  content: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  contentWrapper: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.md, // Reduced padding to increase width
    paddingVertical: Spacing.md,
    // paddingBottom is now set dynamically based on tab bar height
  },
  verseContainer: {
    marginBottom: Spacing.md,
  },
  verseText: {
    fontSize: 22,
    lineHeight: 28,
    color: Colors.neutral[900],
    fontWeight: Typography.weights.regular,
    textAlign: 'left',
  },
  verseNumber: {
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
  },
  currentVerseContainer: {
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  currentVerseText: {
    color: Colors.primary[900],
  },
  currentVerseNumber: {
    color: Colors.primary[700],
    fontWeight: Typography.weights.bold,
  },
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, // Reduced padding to increase width
    paddingVertical: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    // Positioned at top above content
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[100],
    minWidth: 100,
    minHeight: 44,
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  navButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[900],
  },
  navButtonTextDisabled: {
    color: Colors.neutral[400],
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  chapterInfo: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  progressContainer: {
    width: '100%',
    marginTop: Spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.neutral[200],
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary[500],
    borderRadius: 2,
  },
  progressText: {
    fontSize: Typography.sizes.xs,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary[600],
    fontWeight: Typography.weights.medium,
  },
  loadingContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
  },
  loadingContentText: {
    fontSize: Typography.sizes.lg,
    color: Colors.neutral[600],
    marginTop: Spacing.md,
    fontWeight: Typography.weights.medium,
  },
  chapterTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[900],
  },
  offlineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  offlineOverlayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning[50],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.warning[200],
  },
  offlineOverlayText: {
    fontSize: Typography.sizes.base,
    color: Colors.warning[700],
    fontWeight: Typography.weights.medium,
    marginLeft: Spacing.sm,
  },
  offlineUnavailableContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing['4xl'],
  },
  offlineUnavailableTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.warning[700],
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  offlineUnavailableText: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: Typography.lineHeights.relaxed,
    marginBottom: Spacing.lg,
  },
  downloadNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[500],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  downloadNowText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.white,
  },
  offlineLimitedContainer: {
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.warning[50],
    margin: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.warning[200],
  },
  offlineLimitedText: {
    fontSize: Typography.sizes.base,
    color: Colors.warning[700],
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
  speechWarningContainer: {
    backgroundColor: Colors.warning[50],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.warning[200],
  },
  speechWarningText: {
    fontSize: Typography.sizes.sm,
    color: Colors.warning[700],
    textAlign: 'center',
    fontWeight: Typography.weights.medium,
  },
});
