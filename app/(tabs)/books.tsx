import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BookCard } from '@/components/books';
import { useBooks } from '@/contexts';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import type { BookWithNoteCount } from '@/types';

export default function BooksScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { books, isLoading, deleteBook } = useBooks();

  const handleBookPress = useCallback(
    (book: BookWithNoteCount) => {
      router.push(`/book/${book.id}`);
    },
    [router]
  );

  const handleBookLongPress = useCallback(
    async (book: BookWithNoteCount) => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      Alert.alert(book.title, '操作を選択してください', [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '編集',
          onPress: () => router.push(`/book/${book.id}/edit`),
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '削除の確認',
              `「${book.title}」を削除しますか？\n紐づいているメモは未整理になります。`,
              [
                { text: 'キャンセル', style: 'cancel' },
                {
                  text: '削除',
                  style: 'destructive',
                  onPress: () => deleteBook(book.id),
                },
              ]
            );
          },
        },
      ]);
    },
    [router, deleteBook]
  );

  const handleAddBook = useCallback(() => {
    router.push('/book/new');
  }, [router]);

  const renderItem = useCallback(
    ({ item }: { item: BookWithNoteCount }) => (
      <BookCard
        book={item}
        onPress={() => handleBookPress(item)}
        onLongPress={() => handleBookLongPress(item)}
      />
    ),
    [handleBookPress, handleBookLongPress]
  );

  const keyExtractor = useCallback((item: BookWithNoteCount) => item.id, []);

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {books.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="book" size={48} color={Colors[colorScheme].icon} />
          <ThemedText style={styles.emptyText}>本がまだありません</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            メモを整理するための本を作成しましょう
          </ThemedText>
          <TouchableOpacity
            style={[styles.emptyAddButton, { backgroundColor: Colors[colorScheme].tint }]}
            onPress={handleAddBook}
            activeOpacity={0.7}
          >
            <IconSymbol name="plus" size={20} color="#fff" />
            <ThemedText style={styles.emptyAddButtonText}>本を追加</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={books}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListHeaderComponent={
              <ThemedText style={styles.headerText}>
                {books.length}冊の本
              </ThemedText>
            }
            showsVerticalScrollIndicator={false}
          />

          {/* Floating add button */}
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: Colors[colorScheme].tint }]}
            onPress={handleAddBook}
            activeOpacity={0.8}
          >
            <IconSymbol name="plus" size={28} color="#fff" />
          </TouchableOpacity>
        </>
      )}
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
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  emptyAddButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  headerText: {
    fontSize: 15,
    fontWeight: '600',
    opacity: 0.7,
    marginBottom: 16,
  },
  separator: {
    height: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
