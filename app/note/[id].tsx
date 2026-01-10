import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EmotionStampPicker } from '@/components/capture';
import { useNotes, useBooks } from '@/contexts';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { findNoteById } from '@/db';
import type { Note, EmotionStamp } from '@/types';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const { updateNote, deleteNote } = useNotes();
  const { getBookById } = useBooks();

  const [note, setNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editPageNumber, setEditPageNumber] = useState('');
  const [editMemo, setEditMemo] = useState('');
  const [editEmotionStamp, setEditEmotionStamp] = useState<EmotionStamp | null>(null);

  useEffect(() => {
    if (id) {
      const foundNote = findNoteById(id);
      setNote(foundNote);
      if (foundNote) {
        setEditPageNumber(foundNote.pageNumber?.toString() ?? '');
        setEditMemo(foundNote.memo ?? '');
        setEditEmotionStamp(foundNote.emotionStamp);
      }
    }
  }, [id]);

  const book = note?.bookId ? getBookById(note.bookId) : null;

  const handleDelete = useCallback(() => {
    Alert.alert('削除の確認', 'このメモを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          if (note) {
            deleteNote(note.id);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
          }
        },
      },
    ]);
  }, [note, deleteNote, router]);

  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    if (note) {
      setEditPageNumber(note.pageNumber?.toString() ?? '');
      setEditMemo(note.memo ?? '');
      setEditEmotionStamp(note.emotionStamp);
    }
    setIsEditing(false);
  }, [note]);

  const handleSaveEdit = useCallback(async () => {
    if (!note) return;

    const newPageNumber = editPageNumber ? parseInt(editPageNumber, 10) : null;

    // Validate: must have photo or page number
    if (!note.photoUri && !newPageNumber) {
      Alert.alert('エラー', '写真またはページ番号が必要です');
      return;
    }

    updateNote(note.id, {
      pageNumber: newPageNumber,
      memo: editMemo.trim() || null,
      emotionStamp: editEmotionStamp,
    });

    // Refresh note data
    const updatedNote = findNoteById(note.id);
    setNote(updatedNote);

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsEditing(false);
  }, [note, editPageNumber, editMemo, editEmotionStamp, updateNote]);

  const handleAssignBook = useCallback(() => {
    if (note) {
      router.push(`/book/select?noteIds=${note.id}`);
    }
  }, [note, router]);

  if (!note) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'メモ詳細' }} />
        <View style={styles.notFound}>
          <ThemedText>メモが見つかりません</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const formattedDate = format(note.createdAt, 'yyyy年M月d日 HH:mm', { locale: ja });

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: isEditing ? '編集中' : 'メモ詳細',
          headerRight: () =>
            isEditing ? (
              <View style={styles.headerButtons}>
                <TouchableOpacity onPress={handleCancelEdit} style={styles.headerButton}>
                  <ThemedText style={styles.cancelText}>キャンセル</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveEdit} style={styles.headerButton}>
                  <ThemedText style={[styles.saveText, { color: Colors[colorScheme].tint }]}>
                    保存
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.headerButtons}>
                <TouchableOpacity onPress={handleStartEdit} style={styles.headerButton}>
                  <IconSymbol name="pencil" size={20} color={Colors[colorScheme].tint} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
                  <IconSymbol name="trash" size={20} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            ),
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Photo */}
        {note.photoUri && (
          <View style={styles.photoContainer}>
            <Image
              source={{ uri: note.photoUri }}
              style={styles.photo}
              contentFit="contain"
            />
          </View>
        )}

        {/* Page number */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel}>ページ番号</ThemedText>
          {isEditing ? (
            <TextInput
              style={[
                styles.input,
                {
                  color: Colors[colorScheme].text,
                  borderColor: Colors[colorScheme].icon + '40',
                },
              ]}
              value={editPageNumber}
              onChangeText={setEditPageNumber}
              placeholder={note.photoUri ? 'ページ番号（任意）' : 'ページ番号'}
              placeholderTextColor={Colors[colorScheme].icon}
              keyboardType="number-pad"
            />
          ) : (
            <ThemedText style={styles.value}>
              {note.pageNumber !== null ? `${note.pageNumber}ページ` : '未設定'}
            </ThemedText>
          )}
        </View>

        {/* Emotion stamp */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel}>感情</ThemedText>
          {isEditing ? (
            <EmotionStampPicker
              value={editEmotionStamp}
              onChange={setEditEmotionStamp}
            />
          ) : (
            <ThemedText style={styles.emotionStamp}>
              {note.emotionStamp ?? '未設定'}
            </ThemedText>
          )}
        </View>

        {/* Memo */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel}>メモ</ThemedText>
          {isEditing ? (
            <TextInput
              style={[
                styles.input,
                styles.memoInput,
                {
                  color: Colors[colorScheme].text,
                  borderColor: Colors[colorScheme].icon + '40',
                },
              ]}
              value={editMemo}
              onChangeText={setEditMemo}
              placeholder="メモを入力..."
              placeholderTextColor={Colors[colorScheme].icon}
              multiline
              numberOfLines={3}
            />
          ) : (
            <ThemedText style={styles.value}>
              {note.memo ?? '未設定'}
            </ThemedText>
          )}
        </View>

        {/* Book */}
        {!isEditing && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>本</ThemedText>
            <TouchableOpacity
              style={[
                styles.bookButton,
                { borderColor: Colors[colorScheme].icon + '40' },
              ]}
              onPress={handleAssignBook}
            >
              <IconSymbol
                name="book.fill"
                size={20}
                color={book ? Colors[colorScheme].tint : Colors[colorScheme].icon}
              />
              <ThemedText style={styles.bookText}>
                {book ? book.title : '本に割り当てる'}
              </ThemedText>
              <IconSymbol
                name="chevron.right"
                size={16}
                color={Colors[colorScheme].icon}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Date */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel}>作成日時</ThemedText>
          <ThemedText style={styles.value}>{formattedDate}</ThemedText>
        </View>
      </ScrollView>
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
  headerButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  cancelText: {
    fontSize: 16,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  photo: {
    flex: 1,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.5,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
  },
  emotionStamp: {
    fontSize: 32,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  memoInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  bookText: {
    flex: 1,
    fontSize: 16,
  },
});
