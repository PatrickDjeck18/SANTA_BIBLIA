import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useBibleAPI } from '@/hooks/useBibleAPI';
import { APIBook, APIChapter } from '@/types/bible';

interface PerformanceOptimizedBibleScreenProps {
  selectedBible: string;
  selectedBook: APIBook | null;
  selectedChapter: number;
  viewMode: 'books' | 'chapters' | 'read' | 'search';
  onBookSelect: (book: APIBook) => void;
  onChapterSelect: (chapter: APIChapter) => void;
  onBack: () => void;
  renderBookItem: (props: { item: APIBook }) => React.ReactElement;
  renderChapterItem: (props: { item: APIChapter }) => React.ReactElement;
  renderVerseContent: () => React.ReactElement;
  renderSearchInput: () => React.ReactElement;
  renderSearchResults: () => React.ReactElement;
  loading: boolean;
  error: string | null;
  filteredBooks: APIBook[];
  apiChapters: APIChapter[];
  tabBarHeight: number;
  isSmallScreen: boolean;
  isLargeScreen: boolean;
}

// Memoized book item component to prevent unnecessary re-renders
const MemoizedBookItem = memo(({ item, onPress, renderItem }: {
  item: APIBook;
  onPress: (book: APIBook) => void;
  renderItem: (props: { item: APIBook }) => React.ReactElement;
}) => {
  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      {renderItem({ item })}
    </TouchableOpacity>
  );
});

// Memoized chapter item component
const MemoizedChapterItem = memo(({ item, onPress, renderItem }: {
  item: APIChapter;
  onPress: (chapter: APIChapter) => void;
  renderItem: (props: { item: APIChapter }) => React.ReactElement;
}) => {
  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      {renderItem({ item })}
    </TouchableOpacity>
  );
});

// Optimized FlatList with performance improvements
const OptimizedFlatList = memo(({ 
  data, 
  renderItem, 
  keyExtractor, 
  numColumns = 1,
  showsVerticalScrollIndicator = false,
  contentContainerStyle,
  onItemPress
}: {
  data: any[];
  renderItem: (props: { item: any }) => React.ReactElement;
  keyExtractor: (item: any) => string;
  numColumns?: number;
  showsVerticalScrollIndicator?: boolean;
  contentContainerStyle?: any;
  onItemPress: (item: any) => void;
}) => {
  // Memoize the render function to prevent recreation
  const memoizedRenderItem = useCallback(({ item }: { item: any }) => {
    if (numColumns > 1) {
      // For grid layouts, use the chapter item component
      return (
        <MemoizedChapterItem
          item={item}
          onPress={onItemPress}
          renderItem={renderItem}
        />
      );
    } else {
      // For list layouts, use the book item component
      return (
        <MemoizedBookItem
          item={item}
          onPress={onItemPress}
          renderItem={renderItem}
        />
      );
    }
  }, [renderItem, onItemPress, numColumns]);

  return (
    <FlatList
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      contentContainerStyle={contentContainerStyle}
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
      getItemLayout={numColumns > 1 ? undefined : (data, index) => ({
        length: 80, // Approximate item height
        offset: 80 * index,
        index,
      })}
    />
  );
});

// Main performance optimized Bible screen component
const PerformanceOptimizedBibleScreen: React.FC<PerformanceOptimizedBibleScreenProps> = memo(({
  selectedBible,
  selectedBook,
  selectedChapter,
  viewMode,
  onBookSelect,
  onChapterSelect,
  onBack,
  renderBookItem,
  renderChapterItem,
  renderVerseContent,
  renderSearchInput,
  renderSearchResults,
  loading,
  error,
  filteredBooks,
  apiChapters,
  tabBarHeight,
  isSmallScreen,
  isLargeScreen,
}) => {
  // Memoize expensive calculations
  const numColumns = useMemo(() => {
    if (viewMode === 'chapters') {
      return isSmallScreen ? 3 : isLargeScreen ? 5 : 4;
    }
    return 1;
  }, [viewMode, isSmallScreen, isLargeScreen]);

  // Memoize content container styles
  const contentContainerStyle = useMemo(() => ({
    paddingBottom: tabBarHeight + 32, // 32 is Spacing['4xl']
  }), [tabBarHeight]);

  // Memoize key extractors
  const bookKeyExtractor = useCallback((item: APIBook) => item.id, []);
  const chapterKeyExtractor = useCallback((item: APIChapter) => item.id, []);

  // Handle loading state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16, fontSize: 16 }}>Loading Bible content...</Text>
      </View>
    );
  }

  // Handle error state
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, color: 'red', textAlign: 'center' }}>
          Error: {error}
        </Text>
      </View>
    );
  }

  // Render based on view mode
  switch (viewMode) {
    case 'books':
      return (
        <OptimizedFlatList
          data={filteredBooks}
          renderItem={renderBookItem}
          keyExtractor={bookKeyExtractor}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={contentContainerStyle}
          onItemPress={onBookSelect}
        />
      );

    case 'chapters':
      return (
        <OptimizedFlatList
          data={apiChapters}
          renderItem={renderChapterItem}
          keyExtractor={chapterKeyExtractor}
          numColumns={numColumns}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={contentContainerStyle}
          onItemPress={onChapterSelect}
        />
      );

    case 'read':
      return renderVerseContent();

    case 'search':
      return (
        <View style={{ flex: 1 }}>
          {renderSearchInput()}
          {renderSearchResults()}
        </View>
      );

    default:
      return null;
  }
});

// Set display name for debugging
PerformanceOptimizedBibleScreen.displayName = 'PerformanceOptimizedBibleScreen';

export default PerformanceOptimizedBibleScreen;
