import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { NoteList, FilterBar } from '@/components/notes';
import { useNotes, useBooks } from '@/contexts';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import type { DateFilter, EmotionStamp, SortOrder } from '@/types';

export default function UnsortedScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { notes, isLoading, deleteNotes, refresh: refreshNotes } = useNotes();
  const { books, refresh: refreshBooks } = useBooks();

  // Refresh data when screen gains focus
  useFocusEffect(
    useCallback(() => {
      refreshNotes();
      refreshBooks();
    }, [refreshNotes, refreshBooks])
  );

  // Local filter state (unsorted only, so no status filter needed)
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [emotionStamps, setEmotionStamps] = useState<EmotionStamp[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  // Filter notes to unsorted only
  const filteredNotes = useMemo(() => {
    let result = notes.filter((note) => note.bookId === null);

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
  }, [notes, dateFilter, emotionStamps, sortOrder]);

  const handleDeleteNotes = useCallback(
    (ids: string[]) => {
      deleteNotes(ids);
    },
    [deleteNotes]
  );

  const handleAssignToBook = useCallback(
    (ids: string[]) => {
      if (books.length === 0) {
        router.push({
          pathname: '/book/new',
          params: { noteIds: ids.join(',') },
        });
      } else {
        router.push({
          pathname: '/book/select',
          params: { noteIds: ids.join(',') },
        });
      }
    },
    [books, router]
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </ThemedView>
    );
  }

  const ListHeader = (
    <View style={styles.header}>
      <ThemedText style={styles.headerTitle}>
        未整理メモ ({filteredNotes.length}件)
      </ThemedText>
      <FilterBar
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        statusFilter="unsorted"
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
      <NoteList
        notes={filteredNotes}
        emptyMessage="未整理のメモはありません"
        emptyIcon="tray"
        onDeleteNotes={handleDeleteNotes}
        onAssignToBook={handleAssignToBook}
        ListHeaderComponent={ListHeader}
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
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    opacity: 0.7,
    marginBottom: 8,
  },
});
