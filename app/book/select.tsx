import React, { useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useNotes, useBooks } from '@/contexts';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import type { BookWithNoteCount } from '@/types';

export default function BookSelectScreen() {
  const { noteIds } = useLocalSearchParams<{ noteIds: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const { assignToBook } = useNotes();
  const { books } = useBooks();

  const noteIdArray = useMemo(() => noteIds?.split(',') ?? [], [noteIds]);

  const handleSelectBook = useCallback(
    async (bookId: string) => {
      assignToBook(noteIdArray, bookId);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    },
    [noteIdArray, assignToBook, router]
  );

  const handleCreateNewBook = useCallback(() => {
    router.replace(`/book/new?noteIds=${noteIds}`);
  }, [noteIds, router]);

  const handleRemoveFromBook = useCallback(async () => {
    assignToBook(noteIdArray, null);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }, [noteIdArray, assignToBook, router]);

  const renderBookItem = useCallback(
    ({ item }: { item: BookWithNoteCount }) => (
      <TouchableOpacity
        style={[styles.bookItem, { borderColor: Colors[colorScheme].icon + '20' }]}
        onPress={() => handleSelectBook(item.id)}
        activeOpacity={0.7}
      >
        {item.coverUri ? (
          <Image source={{ uri: item.coverUri }} style={styles.bookCover} contentFit="cover" />
        ) : (
          <View style={[styles.bookCoverPlaceholder, { backgroundColor: Colors[colorScheme].tint + '20' }]}>
            <IconSymbol name="book.fill" size={24} color={Colors[colorScheme].tint} />
          </View>
        )}
        <View style={styles.bookInfo}>
          <ThemedText style={styles.bookTitle} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.bookMeta}>{item.noteCount}件のメモ</ThemedText>
        </View>
        <IconSymbol name="chevron.right" size={16} color={Colors[colorScheme].icon} />
      </TouchableOpacity>
    ),
    [colorScheme, handleSelectBook]
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerText}>
          {noteIdArray.length}件のメモを割り当てる本を選択
        </ThemedText>
      </View>

      {/* Create new book button */}
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: Colors[colorScheme].tint }]}
        onPress={handleCreateNewBook}
        activeOpacity={0.7}
      >
        <IconSymbol name="plus" size={20} color="#fff" />
        <ThemedText style={styles.createButtonText}>新しい本を作成</ThemedText>
      </TouchableOpacity>

      {/* Remove from book button */}
      <TouchableOpacity
        style={[styles.removeButton, { borderColor: Colors[colorScheme].icon + '40' }]}
        onPress={handleRemoveFromBook}
        activeOpacity={0.7}
      >
        <IconSymbol name="xmark.circle" size={20} color={Colors[colorScheme].icon} />
        <ThemedText style={styles.removeButtonText}>本から外す</ThemedText>
      </TouchableOpacity>

      {/* Book list */}
      {books.length > 0 ? (
        <FlatList
          data={books}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <IconSymbol name="book" size={48} color={Colors[colorScheme].icon} />
          <ThemedText style={styles.emptyText}>本がまだありません</ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  headerText: {
    fontSize: 14,
    opacity: 0.7,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 14,
    borderRadius: 10,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  removeButtonText: {
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  separator: {
    height: 8,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    gap: 12,
  },
  bookCover: {
    width: 48,
    height: 64,
    borderRadius: 4,
  },
  bookCoverPlaceholder: {
    width: 48,
    height: 64,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookInfo: {
    flex: 1,
    gap: 4,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  bookMeta: {
    fontSize: 13,
    opacity: 0.6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.5,
  },
});
