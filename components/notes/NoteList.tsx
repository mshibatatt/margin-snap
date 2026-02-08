import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { NoteCard } from './NoteCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBooks } from '@/contexts';
import { Colors } from '@/constants/theme';
import { getBookDisplayName } from '@/utils/bookDisplayName';
import type { Note } from '@/types';

interface NoteListProps {
  notes: Note[];
  emptyMessage?: string;
  emptyDescription?: string;
  emptyIcon?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  onDeleteNotes?: (ids: string[]) => void;
  onAssignToBook?: (ids: string[]) => void;
  ListHeaderComponent?: React.ReactElement;
  showBookTitle?: boolean;
  onBookPress?: (bookId: string) => void;
}

export function NoteList({
  notes,
  emptyMessage = 'メモがありません',
  emptyDescription,
  emptyIcon = 'tray',
  emptyActionLabel,
  onEmptyAction,
  onDeleteNotes,
  onAssignToBook,
  ListHeaderComponent,
  showBookTitle = false,
  onBookPress,
}: NoteListProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { books } = useBooks();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Create a lookup map for book display names
  const bookDisplayNameMap = useMemo(() => {
    const map = new Map<string, string>();
    books.forEach((book) => map.set(book.id, getBookDisplayName(book)));
    return map;
  }, [books]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handlePress = useCallback(
    (note: Note) => {
      if (selectionMode) {
        toggleSelection(note.id);
      } else {
        router.push(`/note/${note.id}`);
      }
    },
    [selectionMode, router, toggleSelection]
  );

  const handleLongPress = useCallback(
    async (note: Note) => {
      if (!selectionMode) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSelectionMode(true);
        setSelectedIds(new Set([note.id]));
      }
    },
    [selectionMode]
  );

  const cancelSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(notes.map((n) => n.id)));
  }, [notes]);

  const handleDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;

    Alert.alert(
      '削除の確認',
      `${selectedIds.size}件のメモを削除しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            onDeleteNotes?.(Array.from(selectedIds));
            cancelSelection();
          },
        },
      ]
    );
  }, [selectedIds, onDeleteNotes, cancelSelection]);

  const handleAssignToBook = useCallback(() => {
    if (selectedIds.size === 0) return;
    onAssignToBook?.(Array.from(selectedIds));
    cancelSelection();
  }, [selectedIds, onAssignToBook, cancelSelection]);

  const renderItem = useCallback(
    ({ item, index }: { item: Note; index: number }) => (
      <NoteCard
        note={item}
        onPress={() => handlePress(item)}
        onLongPress={() => handleLongPress(item)}
        isSelected={selectedIds.has(item.id)}
        selectionMode={selectionMode}
        index={index}
        bookTitle={showBookTitle && item.bookId ? bookDisplayNameMap.get(item.bookId) : undefined}
        onBookPress={onBookPress && item.bookId ? () => onBookPress(item.bookId!) : undefined}
      />
    ),
    [handlePress, handleLongPress, selectedIds, selectionMode, showBookTitle, bookDisplayNameMap, onBookPress]
  );

  const keyExtractor = useCallback((item: Note) => item.id, []);

  if (notes.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <View style={styles.emptyHeader}>{ListHeaderComponent}</View>
        <View style={styles.emptyContent}>
          <View
            style={[
              styles.emptyIconContainer,
              { backgroundColor: Colors[colorScheme].icon + '15' },
            ]}
          >
            <IconSymbol
              name={emptyIcon as any}
              size={48}
              color={Colors[colorScheme].icon}
            />
          </View>
          <ThemedText style={styles.emptyText}>{emptyMessage}</ThemedText>
          {emptyDescription && (
            <ThemedText style={styles.emptyDescription}>{emptyDescription}</ThemedText>
          )}
          {emptyActionLabel && onEmptyAction && (
            <TouchableOpacity
              style={[styles.emptyActionButton, { backgroundColor: Colors[colorScheme].tint }]}
              onPress={onEmptyAction}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.emptyActionButtonText}>{emptyActionLabel}</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Selection toolbar */}
      {selectionMode && (
        <View
          style={[
            styles.selectionBar,
            { backgroundColor: Colors[colorScheme].tint + '15' },
          ]}
        >
          <TouchableOpacity onPress={cancelSelection} style={styles.selectionAction}>
            <IconSymbol name="xmark" size={20} color={Colors[colorScheme].text} />
            <ThemedText style={styles.selectionText}>キャンセル</ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.selectionCount}>
            {selectedIds.size}件選択中
          </ThemedText>

          <TouchableOpacity onPress={selectAll} style={styles.selectionAction}>
            <ThemedText style={[styles.selectionText, { color: Colors[colorScheme].tint }]}>
              全選択
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}

      <FlashList
        data={notes}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={ListHeaderComponent}
        showsVerticalScrollIndicator={false}
      />

      {/* Selection actions */}
      {selectionMode && selectedIds.size > 0 && (
        <View
          style={[
            styles.actionBar,
            {
              backgroundColor: Colors[colorScheme].surface,
              borderTopColor: Colors[colorScheme].border,
            },
          ]}
        >
          {onAssignToBook && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: Colors[colorScheme].tint }]}
              onPress={handleAssignToBook}
            >
              <IconSymbol name="book.fill" size={20} color="#fff" />
              <ThemedText style={styles.actionButtonText}>本にまとめる</ThemedText>
            </TouchableOpacity>
          )}

          {onDeleteNotes && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: Colors[colorScheme].error }]}
              onPress={handleDelete}
            >
              <IconSymbol name="trash.fill" size={20} color="#fff" />
              <ThemedText style={styles.actionButtonText}>削除</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyHeader: {
    padding: 16,
    paddingBottom: 0,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 20,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  emptyActionButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },
  emptyActionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  separator: {
    height: 12,
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectionCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
