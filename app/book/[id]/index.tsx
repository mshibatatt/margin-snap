import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { NoteList, FilterBar } from '@/components/notes';
import { FloatingCaptureButton } from '@/components/ui/floating-capture-button';
import { useNotes, useBooks } from '@/contexts';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { findBookById } from '@/db';
import { getBookDisplayName } from '@/utils/bookDisplayName';
import type { Book, DateFilter, EmotionStamp, SortOrder } from '@/types';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { notes, isLoading, deleteNotes, refresh: refreshNotes } = useNotes();
  const { refresh: refreshBooks } = useBooks();

  const [book, setBook] = useState<Book | null>(null);

  // Local filter state
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [emotionStamps, setEmotionStamps] = useState<EmotionStamp[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  // Refresh data when screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (id) {
        const foundBook = findBookById(id);
        setBook(foundBook);
      }
      refreshNotes();
    }, [id, refreshNotes])
  );

  // Filter notes to this book only
  const filteredNotes = useMemo(() => {
    if (!id) return [];

    let result = notes.filter((note) => note.bookId === id);

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

    // Apply emotion filter
    if (emotionStamps.length > 0) {
      result = result.filter(
        (note) => note.emotionStamp && emotionStamps.includes(note.emotionStamp)
      );
    }

    // Apply sort
    result = [...result].sort((a, b) => {
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
  }, [id, notes, dateFilter, emotionStamps, sortOrder]);

  const handleDeleteNotes = useCallback(
    (ids: string[]) => {
      deleteNotes(ids);
      refreshBooks(); // Update note count
    },
    [deleteNotes, refreshBooks]
  );

  const handleAssignToBook = useCallback(
    (ids: string[]) => {
      router.push(`/book/select?noteIds=${ids.join(',')}`);
    },
    [router]
  );

  if (!book) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: '本' }} />
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
          </View>
        ) : (
          <View style={styles.notFound}>
            <ThemedText>本が見つかりません</ThemedText>
          </View>
        )}
      </ThemedView>
    );
  }

  const ListHeader = (
    <View style={styles.header}>
      {/* Book info section for full title display */}
      <View style={[styles.bookInfo, { borderBottomColor: Colors[colorScheme].border }]}>
        <ThemedText style={styles.bookTitle}>
          {getBookDisplayName(book)}
        </ThemedText>
        {book.author && (
          <ThemedText style={styles.bookAuthor}>{book.author}</ThemedText>
        )}
      </View>
      <ThemedText style={styles.headerTitle}>
        {filteredNotes.length}件のメモ
      </ThemedText>
      <FilterBar
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        statusFilter="all"
        onStatusFilterChange={() => {}}
        emotionStamps={emotionStamps}
        onEmotionStampsChange={setEmotionStamps}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        showStatusFilter={false}
      />
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: '',
          headerRight: () => null,
        }}
      />

      <NoteList
        notes={filteredNotes}
        emptyMessage="この本にはメモがありません"
        emptyIcon="book"
        onDeleteNotes={handleDeleteNotes}
        onAssignToBook={handleAssignToBook}
        ListHeaderComponent={ListHeader}
        scope={`book:${id}`}
      />

      {/* Floating capture button */}
      <FloatingCaptureButton />
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
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 16,
  },
  bookInfo: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  bookAuthor: {
    fontSize: 15,
    opacity: 0.6,
    marginTop: 4,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    opacity: 0.7,
    marginBottom: 8,
  },
});
