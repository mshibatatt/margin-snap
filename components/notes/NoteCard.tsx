import React, { useEffect } from 'react';
import { StyleSheet, View, Pressable, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import type { Note } from '@/types';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
  onLongPress?: () => void;
  isSelected?: boolean;
  selectionMode?: boolean;
  index?: number;
  bookTitle?: string;
  onBookPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function NoteCard({
  note,
  onPress,
  onLongPress,
  isSelected = false,
  selectionMode = false,
  index = 0,
  bookTitle,
  onBookPress,
}: NoteCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(1);

  useEffect(() => {
    const delay = Math.min(index * 50, 300);
    opacity.value = withDelay(delay, withSpring(1, { damping: 20 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 20 }));
  }, [index, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const formattedDate = format(note.createdAt, 'M/d HH:mm', { locale: ja });

  return (
    <AnimatedPressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      delayLongPress={300}
      style={animatedStyle}
    >
      <ThemedView
        style={[
          styles.container,
          {
            borderColor: isSelected
              ? Colors[colorScheme].tint
              : Colors[colorScheme].icon + '20',
            backgroundColor: isSelected
              ? Colors[colorScheme].tint + '10'
              : Colors[colorScheme].background,
          },
        ]}
      >
        {/* Selection checkbox */}
        {selectionMode && (
          <View style={styles.checkbox}>
            <View
              style={[
                styles.checkboxInner,
                {
                  backgroundColor: isSelected
                    ? Colors[colorScheme].tint
                    : 'transparent',
                  borderColor: isSelected
                    ? Colors[colorScheme].tint
                    : Colors[colorScheme].icon,
                },
              ]}
            >
              {isSelected && (
                <IconSymbol name="checkmark" size={14} color="#fff" />
              )}
            </View>
          </View>
        )}

        {/* Photo thumbnail */}
        {note.photoUri && (
          <Image
            source={{ uri: note.photoUri }}
            style={styles.thumbnail}
            contentFit="cover"
          />
        )}

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.topRow}>
            {/* Page number */}
            {note.pageNumber !== null && (
              <View style={styles.pageContainer}>
                <ThemedText style={styles.pageNumber}>
                  p.{note.pageNumber}
                </ThemedText>
              </View>
            )}

            {/* Emotion stamp */}
            {note.emotionStamp && (
              <ThemedText style={styles.emotionStamp}>
                {note.emotionStamp}
              </ThemedText>
            )}

            {/* Spacer */}
            <View style={styles.spacer} />

            {/* Date */}
            <ThemedText style={styles.date}>{formattedDate}</ThemedText>
          </View>

          {/* Memo text */}
          {note.memo && (
            <ThemedText style={styles.memo} numberOfLines={1}>
              {note.memo}
            </ThemedText>
          )}

          {/* Book title */}
          {bookTitle && (
            <TouchableOpacity
              style={styles.bookRow}
              onPress={onBookPress}
              disabled={!onBookPress}
              activeOpacity={onBookPress ? 0.6 : 1}
            >
              <IconSymbol
                name="book.fill"
                size={12}
                color={Colors[colorScheme].tint}
              />
              <ThemedText style={styles.bookTitle} numberOfLines={1}>
                {bookTitle}
              </ThemedText>
              {onBookPress && (
                <IconSymbol
                  name="chevron.right"
                  size={12}
                  color={Colors[colorScheme].icon}
                />
              )}
            </TouchableOpacity>
          )}

          {/* No content indicator */}
          {!note.pageNumber && !note.memo && !note.emotionStamp && !bookTitle && (
            <ThemedText style={styles.noContent}>写真のみ</ThemedText>
          )}
        </View>
      </ThemedView>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 80,
  },
  checkbox: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: 80,
    height: 80,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pageNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  emotionStamp: {
    fontSize: 18,
  },
  spacer: {
    flex: 1,
  },
  date: {
    fontSize: 12,
    opacity: 0.5,
  },
  memo: {
    fontSize: 14,
    opacity: 0.8,
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookTitle: {
    fontSize: 12,
    opacity: 0.6,
    flex: 1,
  },
  noContent: {
    fontSize: 13,
    opacity: 0.4,
    fontStyle: 'italic',
  },
});
