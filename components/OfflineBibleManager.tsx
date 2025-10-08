import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Download,
  Trash2,
  Book,
  BookOpen,
  Wifi,
  WifiOff,
  CheckCircle,
  Clock,
  HardDrive,
  RefreshCw,
  X
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';
import { useBibleAPI } from '@/hooks/useBibleAPI';

interface OfflineBibleManagerProps {
  visible: boolean;
  onClose: () => void;
  bibleId: string;
  books: any[];
}

interface DownloadProgress {
  bookId: string;
  progress: number;
  status: 'downloading' | 'completed' | 'error';
}

export const OfflineBibleManager: React.FC<OfflineBibleManagerProps> = ({
  visible,
  onClose,
  bibleId,
  books,
}) => {
  const {
    getOfflineStats,
    downloadBookForOffline,
    removeBookFromOffline,
    isBookAvailableOffline,
    isOnline,
  } = useBibleAPI();

  const [offlineStats, setOfflineStats] = useState<any>(null);
  const [downloadProgress, setDownloadProgress] = useState<{[bookId: string]: DownloadProgress}>({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (visible) {
      loadOfflineStats();
    }
  }, [visible]);

  const loadOfflineStats = async () => {
    try {
      setRefreshing(true);
      const stats = await getOfflineStats();
      setOfflineStats(stats);
    } catch (error) {
      console.error('Error loading offline stats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDownloadBook = async (book: any) => {
    if (!isOnline) {
      Alert.alert('Offline', 'You need to be online to download books for offline reading.');
      return;
    }

    Alert.alert(
      'Download Book',
      `Download "${book.name}" for offline reading? This will download all ${book.numberOfChapters} chapters.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: () => startDownload(book)
        }
      ]
    );
  };

  const startDownload = async (book: any) => {
    setDownloadProgress(prev => ({
      ...prev,
      [book.id]: { bookId: book.id, progress: 0, status: 'downloading' }
    }));

    try {
      const result = await downloadBookForOffline(book, bibleId, (progress) => {
        setDownloadProgress(prev => ({
          ...prev,
          [book.id]: { ...prev[book.id], progress }
        }));
      });

      setDownloadProgress(prev => ({
        ...prev,
        [book.id]: {
          ...prev[book.id],
          progress: 100,
          status: result.success ? 'completed' : 'error'
        }
      }));

      if (result.success) {
        Alert.alert('Success', `Successfully downloaded ${result.downloadedChapters} chapters of "${book.name}"`);
        await loadOfflineStats(); // Refresh stats
      } else {
        Alert.alert('Error', 'Failed to download book. Please try again.');
      }
    } catch (error) {
      console.error('Download error:', error);
      setDownloadProgress(prev => ({
        ...prev,
        [book.id]: { ...prev[book.id], status: 'error' }
      }));
      Alert.alert('Error', 'Failed to download book. Please try again.');
    }
  };

  const handleRemoveBook = async (book: any) => {
    Alert.alert(
      'Remove Book',
      `Remove "${book.name}" from offline storage? This will free up space but require internet to read this book again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const success = await removeBookFromOffline(book.id, bibleId);
            if (success) {
              Alert.alert('Success', `"${book.name}" has been removed from offline storage.`);
              await loadOfflineStats(); // Refresh stats
            } else {
              Alert.alert('Error', 'Failed to remove book. Please try again.');
            }
          }
        }
      ]
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const renderBookItem = ({ item: book }: { item: any }) => {
    const isDownloading = downloadProgress[book.id]?.status === 'downloading';
    const isCompleted = downloadProgress[book.id]?.status === 'completed';
    const progress = downloadProgress[book.id]?.progress || 0;

    return (
      <View style={styles.bookItem}>
        <View style={styles.bookInfo}>
          <View style={styles.bookHeader}>
            <Text style={styles.bookName}>{book.name}</Text>
            <View style={styles.bookMeta}>
              <Text style={styles.bookDetails}>{book.numberOfChapters} chapters</Text>
              {isDownloading && (
                <View style={styles.downloadingBadge}>
                  <Text style={styles.downloadingText}>Downloading...</Text>
                </View>
              )}
              {isCompleted && (
                <View style={styles.completedBadge}>
                  <CheckCircle size={12} color={Colors.success[600]} />
                  <Text style={styles.completedText}>Downloaded</Text>
                </View>
              )}
            </View>
          </View>

          {isDownloading && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>
          )}
        </View>

        <View style={styles.bookActions}>
          {isDownloading ? (
            <ActivityIndicator size="small" color={Colors.primary[500]} />
          ) : (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDownloadBook(book)}
              disabled={!isOnline}
            >
              <Download size={16} color={isOnline ? Colors.primary[600] : Colors.neutral[400]} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.removeButton]}
            onPress={() => handleRemoveBook(book)}
          >
            <Trash2 size={16} color={Colors.error[600]} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderStatsCard = () => {
    if (!offlineStats) return null;

    return (
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Offline Library</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Book size={20} color={Colors.primary[600]} />
            <Text style={styles.statNumber}>{offlineStats.booksCount}</Text>
            <Text style={styles.statLabel}>Books</Text>
          </View>

          <View style={styles.statItem}>
            <BookOpen size={20} color={Colors.secondary[600]} />
            <Text style={styles.statNumber}>{offlineStats.chaptersCount}</Text>
            <Text style={styles.statLabel}>Chapters</Text>
          </View>

          <View style={styles.statItem}>
            <HardDrive size={20} color={Colors.success[600]} />
            <Text style={styles.statNumber}>{formatFileSize(offlineStats.estimatedSize)}</Text>
            <Text style={styles.statLabel}>Storage</Text>
          </View>
        </View>

        {!isOnline && (
          <View style={styles.offlineWarning}>
            <WifiOff size={16} color={Colors.warning[600]} />
            <Text style={styles.offlineWarningText}>
              You're offline. Downloaded books are available for reading.
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={Colors.neutral[600]} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Offline Library</Text>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadOfflineStats}
            disabled={refreshing}
          >
            <RefreshCw size={20} color={refreshing ? Colors.neutral[400] : Colors.primary[600]} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderStatsCard()}

          {/* Books List */}
          <View style={styles.booksSection}>
            <Text style={styles.sectionTitle}>Available Books</Text>

            {books.length > 0 ? (
              <FlatList
                data={books}
                renderItem={renderBookItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.booksList}
              />
            ) : (
              <View style={styles.emptyState}>
                <Book size={48} color={Colors.neutral[400]} />
                <Text style={styles.emptyTitle}>No Books Available</Text>
                <Text style={styles.emptySubtitle}>Books will appear here once loaded</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Downloaded books are available for offline reading and will be automatically updated when online.
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  closeButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
  },
  refreshButton: {
    padding: Spacing.sm,
  },
  content: {
    flex: 1,
  },
  statsCard: {
    backgroundColor: Colors.white,
    margin: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.md,
  },
  statsTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    marginTop: Spacing.xs,
  },
  offlineWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning[50],
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  offlineWarningText: {
    fontSize: Typography.sizes.sm,
    color: Colors.warning[700],
    marginLeft: Spacing.xs,
    flex: 1,
  },
  booksSection: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing.md,
  },
  booksList: {
    paddingBottom: Spacing.xl,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  bookInfo: {
    flex: 1,
  },
  bookHeader: {
    marginBottom: Spacing.xs,
  },
  bookName: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[900],
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookDetails: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
  },
  downloadingBadge: {
    backgroundColor: Colors.primary[100],
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  downloadingText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary[700],
    fontWeight: Typography.weights.medium,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success[100],
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  completedText: {
    fontSize: Typography.sizes.xs,
    color: Colors.success[700],
    fontWeight: Typography.weights.medium,
    marginLeft: 2,
  },
  progressContainer: {
    marginTop: Spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.sm,
  },
  progressText: {
    fontSize: Typography.sizes.xs,
    color: Colors.neutral[600],
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  bookActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[100],
  },
  removeButton: {
    backgroundColor: Colors.error[50],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
  },
  emptyTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semiBold,
    color: Colors.neutral[700],
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[500],
    textAlign: 'center',
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.neutral[50],
  },
  footerText: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: Typography.lineHeights.normal,
  },
});