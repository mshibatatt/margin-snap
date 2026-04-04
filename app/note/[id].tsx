import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  type ViewToken,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { NoteDetailContent } from '@/components/notes';
import { FloatingCaptureButton } from '@/components/ui/floating-capture-button';
import { useNotes, useBooks } from '@/contexts';
import { findNoteById } from '@/db';
import { parseSearchScope, applySearchFilters } from '@/utils/noteFilters';
import type { Note } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function NoteDetailScreen() {
  const { id, scope } = useLocalSearchParams<{ id: string; scope?: string }>();
  const router = useRouter();
  const { notes } = useNotes();
  const { books } = useBooks();

  const [isEditing, setIsEditing] = useState(false);
  const initialIdRef = useRef(id);
  const currentNoteIdRef = useRef<string | undefined>(id);

  // Create book search map for search filtering
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

  // Filter notes based on scope
  const scopedNotes = useMemo(() => {
    if (!scope) {
      return notes;
    }

    if (scope === 'unsorted') {
      return notes.filter((n) => n.bookId === null);
    }

    if (scope.startsWith('book:')) {
      const bookId = scope.replace('book:', '');
      return notes.filter((n) => n.bookId === bookId);
    }

    if (scope.startsWith('search:')) {
      const filters = parseSearchScope(scope);
      return applySearchFilters(notes, filters, bookSearchMap);
    }

    return notes;
  }, [notes, scope, bookSearchMap]);

  // Find initial index based on the initial ID (stable, doesn't change on swipe)
  const initialIndex = useMemo(() => {
    const targetId = initialIdRef.current;
    if (!targetId || scopedNotes.length === 0) return 0;
    const index = scopedNotes.findIndex((n) => n.id === targetId);
    return index >= 0 ? index : 0;
  }, [scopedNotes]);

  // Track current visible note (no URL update to avoid navigation animation)
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].item) {
        const visibleNote = viewableItems[0].item as Note;
        currentNoteIdRef.current = visibleNote.id;
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  const handleNoteDelete = useCallback(() => {
    router.back();
  }, [router]);

  const getItemLayout = useCallback(
    (_: ArrayLike<Note> | null | undefined, index: number) => ({
      length: SCREEN_WIDTH,
      offset: SCREEN_WIDTH * index,
      index,
    }),
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: Note }) => (
      <NoteDetailContent
        note={item}
        isEditing={isEditing && item.id === currentNoteIdRef.current}
        onEditingChange={setIsEditing}
        onNoteDelete={handleNoteDelete}
        width={SCREEN_WIDTH}
      />
    ),
    [isEditing, handleNoteDelete]
  );

  const keyExtractor = useCallback((item: Note) => item.id, []);

  // Fallback: show single note from DB if context is empty
  if (scopedNotes.length === 0) {
    const singleNote = id ? findNoteById(id) : null;
    if (singleNote) {
      return (
        <ThemedView style={styles.container}>
          <Stack.Screen options={{ title: 'メモ詳細' }} />
          <NoteDetailContent
            note={singleNote}
            isEditing={isEditing}
            onEditingChange={setIsEditing}
            onNoteDelete={handleNoteDelete}
            width={SCREEN_WIDTH}
          />
          <FloatingCaptureButton />
        </ThemedView>
      );
    }
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'メモ詳細' }} />
        <View style={styles.notFound}>
          <ThemedText>メモが見つかりません</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: isEditing ? '編集中' : 'メモ詳細',
          headerRight: () => null,
        }}
      />

      <FlatList
        key={`${initialIdRef.current}-${scope ?? 'all'}`}
        data={scopedNotes}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={getItemLayout}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEnabled={!isEditing}
        bounces={!isEditing}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="start"
        removeClippedSubviews
        maxToRenderPerBatch={3}
        windowSize={3}
      />

      <FloatingCaptureButton />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
