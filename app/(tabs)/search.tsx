import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { NoteList, FilterBar, SearchBar } from '@/components/notes';
import { useNotes, useBooks } from '@/contexts';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import type { DateFilter, NoteStatusFilter, EmotionStamp, SortOrder } from '@/types';

export default function SearchScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { notes, isLoading, deleteNotes } = useNotes();
  const { books } = useBooks();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [statusFilter, setStatusFilter] = useState<NoteStatusFilter>('all');
  const [emotionStamps, setEmotionStamps] = useState<EmotionStamp[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  // Create a map of book info for search (title + author)
  const bookSearchMap = useMemo(() => {
    const map = new Map<string, { title: string; author: string | null }>();
    books.forEach((book) => {
      map.set(book.id, {
        title: book.title.toLowerCase(),
        author: book.author?.toLowerCase() ?? null,
      });
    });
    return map;
  }, [books]);

  // Filter and search notes
  const filteredNotes = useMemo(() => {
    let result = [...notes];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((note) => {
        // Search in memo
        if (note.memo && note.memo.toLowerCase().includes(query)) {
          return true;
        }
        // Search in page number
        if (note.pageNumber !== null && note.pageNumber.toString().includes(query)) {
          return true;
        }
        // Search in book title and author
        if (note.bookId) {
          const bookInfo = bookSearchMap.get(note.bookId);
          if (bookInfo) {
            if (bookInfo.title.includes(query)) {
              return true;
            }
            if (bookInfo.author && bookInfo.author.includes(query)) {
              return true;
            }
          }
        }
        return false;
      });
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let cutoff: Date;

      switch (dateFilter) {
        case 'today':
          cutoff = startOfToday;
          break;
        case 'week':
          cutoff = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoff = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoff = new Date(0);
      }

      result = result.filter((note) => note.createdAt >= cutoff);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'unsorted') {
        result = result.filter((note) => note.bookId === null);
      } else if (statusFilter === 'sorted') {
        result = result.filter((note) => note.bookId !== null);
      }
    }

    // Apply emotion filter
    if (emotionStamps.length > 0) {
      result = result.filter(
        (note) => note.emotionStamp && emotionStamps.includes(note.emotionStamp)
      );
    }

    // Apply sort
    result.sort((a, b) => {
      switch (sortOrder) {
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'page':
          if (a.pageNumber === null && b.pageNumber === null) return 0;
          if (a.pageNumber === null) return 1;
          if (b.pageNumber === null) return -1;
          return a.pageNumber - b.pageNumber;
        case 'newest':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

    return result;
  }, [notes, searchQuery, dateFilter, statusFilter, emotionStamps, sortOrder, bookSearchMap]);

  const handleDeleteNotes = useCallback(
    (ids: string[]) => {
      deleteNotes(ids);
    },
    [deleteNotes]
  );

  const handleAssignToBook = useCallback(
    (ids: string[]) => {
      router.push(`/book/select?noteIds=${ids.join(',')}`);
    },
    [router]
  );

  const handleBookPress = useCallback(
    (bookId: string) => {
      router.push(`/book/${bookId}`);
    },
    [router]
  );

  const hasActiveFilters =
    searchQuery.trim() ||
    dateFilter !== 'all' ||
    statusFilter !== 'all' ||
    emotionStamps.length > 0;

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </ThemedView>
    );
  }

  const ListHeader = (
    <View style={styles.header}>
      {/* Search bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="メモ、ページ番号、本タイトル、著者名を検索..."
      />

      {/* Filter bar */}
      <FilterBar
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        emotionStamps={emotionStamps}
        onEmotionStampsChange={setEmotionStamps}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        showStatusFilter={true}
      />

      {/* Results count */}
      <View style={styles.resultsHeader}>
        <ThemedText style={styles.resultsCount}>
          {hasActiveFilters
            ? `${filteredNotes.length}件の検索結果`
            : `すべてのメモ (${filteredNotes.length}件)`}
        </ThemedText>
      </View>
    </View>
  );

  // Show empty state if no notes at all
  if (notes.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyContainer}>
          <IconSymbol name="magnifyingglass" size={48} color={Colors[colorScheme].icon} />
          <ThemedText style={styles.emptyText}>メモがありません</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            キャプチャタブからメモを作成してください
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <NoteList
        notes={filteredNotes}
        emptyMessage={
          hasActiveFilters
            ? '条件に一致するメモがありません'
            : 'メモがありません'
        }
        emptyIcon="magnifyingglass"
        onDeleteNotes={handleDeleteNotes}
        onAssignToBook={handleAssignToBook}
        ListHeaderComponent={ListHeader}
        showBookTitle
        onBookPress={handleBookPress}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  header: {
    gap: 16,
    marginBottom: 16,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultsCount: {
    fontSize: 15,
    fontWeight: '600',
    opacity: 0.7,
  },
});
