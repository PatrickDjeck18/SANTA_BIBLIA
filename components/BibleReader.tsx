import React, { useState, useEffect } from 'react';
import { useBibleAPI } from '../hooks/useBibleAPI';
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
} from 'react-native';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  Download,
  Wifi,
  WifiOff,
  CheckCircle
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';
import * as Speech from 'expo-speech';

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
}) => {
  console.log('📖 BibleReader rendered with:', { bookName, chapterNumber, canGoPrev, canGoNext });

  const {
    isOnline,
    isBookAvailableOffline,
    downloadBookForOffline,
    getOfflineStats
  } = useBibleAPI();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(0);
  const [isOfflineAvailable, setIsOfflineAvailable] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showOfflineMenu, setShowOfflineMenu] = useState(false);

  // Check offline availability when component mounts or book/chapter changes
  useEffect(() => {
    const checkOfflineStatus = async () => {
      const available = await isBookAvailableOffline(bookId, bibleId);
      setIsOfflineAvailable(available);
    };
    checkOfflineStatus();
  }, [bookId, bibleId, isBookAvailableOffline]);

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

  const togglePlayPause = async () => {
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
    } else {
      if (verses.length === 0) return;
      
      setIsPlaying(true);
      setCurrentVerse(0);
      await speakVerse(0);
    }
  };

  const speakVerse = async (verseIndex: number) => {
    if (verseIndex >= verses.length) {
      setIsPlaying(false);
      return;
    }

    const verse = verses[verseIndex];
    const textToSpeak = `${verse.number}. ${verse.text}`;
    
    setCurrentVerse(verseIndex);
    
    await Speech.speak(textToSpeak, {
      language: 'en',
      pitch: 1.0,
      rate: 0.8, // Slightly slower for better comprehension
      onDone: () => {
        if (verseIndex < verses.length - 1) {
          speakVerse(verseIndex + 1);
        } else {
          setIsPlaying(false);
        }
      },
      onError: () => {
        setIsPlaying(false);
      }
    });
  };

  const stopAudio = () => {
    Speech.stop();
    setIsPlaying(false);
  };

  const skipToVerse = (verseIndex: number) => {
    Speech.stop();
    if (verseIndex >= 0 && verseIndex < verses.length) {
      setCurrentVerse(verseIndex);
      speakVerse(verseIndex);
    }
  };


  const handleDownloadForOffline = async () => {
    if (!isOnline) {
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
      // Create a minimal book object for download
      const book = {
        id: bookId,
        name: bookName,
        translationId: bibleId,
        commonName: bookName,
        title: bookName,
        order: 0,
        numberOfChapters: 0,
        firstChapterApiLink: '',
        lastChapterApiLink: '',
        totalNumberOfVerses: 0,
        isApocryphal: false
      };

      const result = await downloadBookForOffline(book, bibleId, (progress) => {
        console.log(`Download progress: ${progress}%`);
      });

      if (result.success) {
        Alert.alert('Success', `Successfully downloaded ${bookName} for offline reading!`);
        setIsOfflineAvailable(true);
      } else {
        Alert.alert('Error', 'Failed to download book. Please try again.');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download book. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* White Background */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: Colors.white }]} />

      {/* Offline overlay indicator */}
      {isOfflineAvailable && !isOnline && (
        <View style={styles.offlineOverlay}>
          <View style={styles.offlineOverlayContent}>
            <WifiOff size={20} color={Colors.warning[600]} />
            <Text style={styles.offlineOverlayText}>Reading from offline cache</Text>
          </View>
        </View>
      )}
      
      {/* Header Card */}
      <View style={styles.hero}>
        <LinearGradient
          colors={Colors.gradients.spiritualLight || ['#fdfcfb', '#e2d1c3', '#c9d6ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.heroContent}>
            <TouchableOpacity style={styles.heroActionButton} onPress={onBack}>
              <ArrowLeft size={20} color={Colors.primary[600]} />
            </TouchableOpacity>
            
            <View style={styles.heroTextBlock}>
              <Text style={styles.heroTitle}>{bookName} {chapterNumber}</Text>
              <Text style={styles.heroSubtitle}>
                {isOfflineAvailable && !isOnline && (
                  <Text style={styles.offlineIndicatorText}>Reading from offline cache</Text>
                )}
                {isOfflineAvailable && isOnline && (
                  <Text style={styles.onlineIndicatorText}>Available offline</Text>
                )}
                {!isOfflineAvailable && !isOnline && (
                  <Text style={styles.offlineWarningText}>Offline - Limited access</Text>
                )}
              </Text>
            </View>
            
            <View style={styles.heroActions}>
              {/* Offline Status and Download */}
              <View style={styles.offlineSection}>
                <TouchableOpacity
                  style={styles.offlineButton}
                  onPress={() => setShowOfflineMenu(!showOfflineMenu)}
                >
                  {isOfflineAvailable ? (
                    <CheckCircle size={16} color={Colors.success[600]} />
                  ) : isOnline ? (
                    <Wifi size={16} color={Colors.neutral[600]} />
                  ) : (
                    <WifiOff size={16} color={Colors.warning[600]} />
                  )}
                </TouchableOpacity>

                {isOnline && !isOfflineAvailable && (
                  <TouchableOpacity
                    style={[styles.downloadButton, isDownloading && styles.downloadButtonDisabled]}
                    onPress={handleDownloadForOffline}
                    disabled={isDownloading}
                  >
                    <Download size={16} color={isDownloading ? Colors.neutral[400] : Colors.primary[600]} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Audio Controls */}
              <TouchableOpacity
                style={[styles.audioButton, !verses.length && styles.audioButtonDisabled]}
                onPress={togglePlayPause}
                disabled={!verses.length}
              >
                {isPlaying ? (
                  <Pause size={20} color={Colors.primary[600]} />
                ) : (
                  <Play size={20} color={Colors.primary[600]} />
                )}
              </TouchableOpacity>

              {isPlaying && (
                <TouchableOpacity
                  style={styles.audioButton}
                  onPress={stopAudio}
                >
                  <Volume2 size={20} color={Colors.primary[600]} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Bible Content */}
      <View style={styles.contentWrapper}>
        {/* Navigation Bar - Moved to top */}
        <View style={styles.navigationBar}>
          <TouchableOpacity
            style={[styles.navButton, !canGoPrev && styles.navButtonDisabled]}
            onPress={onPrevChapter}
            disabled={!canGoPrev}
          >
            <ChevronLeft size={20} color={Colors.neutral[900]} />
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>

          <Text style={styles.chapterTitle}>
            {bookName} {chapterNumber}
          </Text>

          <TouchableOpacity
            style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}
            onPress={onNextChapter}
            disabled={!canGoNext}
          >
            <Text style={styles.navButtonText}>Next</Text>
            <ChevronRight size={20} color={Colors.neutral[900]} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Show message when offline and content not available */}
          {!isOnline && !isOfflineAvailable && verses.length === 0 && (
            <View style={styles.offlineUnavailableContainer}>
              <WifiOff size={48} color={Colors.warning[500]} />
              <Text style={styles.offlineUnavailableTitle}>Content Not Available</Text>
              <Text style={styles.offlineUnavailableText}>
                This chapter is not available offline. Please connect to the internet and download this book for offline reading.
              </Text>
              {isOnline && (
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
          {!isOnline && isOfflineAvailable && verses.length === 0 && (
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
                  currentVerse === index && styles.currentVerseText
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg,
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
  offlineSection: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center',
  },
  offlineButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[100],
  },
  downloadButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[100],
  },
  downloadButtonDisabled: {
    opacity: 0.5,
  },
  audioButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[100],
  },
  audioButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  contentWrapper: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: 100, // Space for navigation bar
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
    paddingHorizontal: Spacing.lg,
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
  navButtonDisabled: {
    opacity: 0.5,
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
});
