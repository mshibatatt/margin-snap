import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, Components } from '@/constants/theme';
import { getBookDisplayName } from '@/utils/bookDisplayName';
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
          {
            borderColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].surface,
          },
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
          <ThemedText type="h3" numberOfLines={2}>
            {getBookDisplayName(book)}
          </ThemedText>
          {book.author && (
            <ThemedText type="bodySmall" secondary numberOfLines={1}>
              {book.author}
            </ThemedText>
          )}
          <View style={styles.meta}>
            <ThemedText type="caption" secondary>
              {book.noteCount}件のメモ
            </ThemedText>
            <ThemedText type="caption" secondary>更新: {formattedDate}</ThemedText>
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
    borderRadius: Components.card.borderRadius,
    padding: Components.card.padding,
    gap: Spacing.md,
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
    gap: Spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
});
