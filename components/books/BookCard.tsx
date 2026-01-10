import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import type { BookWithNoteCount } from '@/types';

interface BookCardProps {
  book: BookWithNoteCount;
  onPress: () => void;
  onLongPress?: () => void;
}

export function BookCard({ book, onPress, onLongPress }: BookCardProps) {
  const colorScheme = useColorScheme() ?? 'light';

  const formattedDate = format(book.updatedAt, 'M/d', { locale: ja });

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      delayLongPress={300}
    >
      <ThemedView
        style={[
          styles.container,
          { borderColor: Colors[colorScheme].icon + '20' },
        ]}
      >
        {/* Book cover */}
        {book.coverUri ? (
          <Image
            source={{ uri: book.coverUri }}
            style={styles.cover}
            contentFit="cover"
          />
        ) : (
          <View
            style={[
              styles.coverPlaceholder,
              { backgroundColor: Colors[colorScheme].tint + '15' },
            ]}
          >
            <IconSymbol
              name="book.fill"
              size={32}
              color={Colors[colorScheme].tint}
            />
          </View>
        )}

        {/* Book info */}
        <View style={styles.info}>
          <ThemedText style={styles.title} numberOfLines={2}>
            {book.title}
          </ThemedText>
          <View style={styles.meta}>
            <ThemedText style={styles.noteCount}>
              {book.noteCount}件のメモ
            </ThemedText>
            <ThemedText style={styles.date}>更新: {formattedDate}</ThemedText>
          </View>
        </View>

        {/* Chevron */}
        <IconSymbol
          name="chevron.right"
          size={16}
          color={Colors[colorScheme].icon}
        />
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  cover: {
    width: 56,
    height: 76,
    borderRadius: 6,
  },
  coverPlaceholder: {
    width: 56,
    height: 76,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  noteCount: {
    fontSize: 13,
    opacity: 0.6,
  },
  date: {
    fontSize: 12,
    opacity: 0.4,
  },
});
