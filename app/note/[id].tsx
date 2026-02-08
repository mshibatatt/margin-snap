import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FloatingCaptureButton } from '@/components/ui/floating-capture-button';
import { EmotionStampPicker } from '@/components/capture';
import { useNotes, useBooks, useToast } from '@/contexts';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { findNoteById } from '@/db';
import { getBookDisplayName } from '@/utils/bookDisplayName';
import type { Note, EmotionStamp } from '@/types';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const { updateNote, deleteNote } = useNotes();
  const { getBookById } = useBooks();
  const { showSuccess, showError } = useToast();

  const [note, setNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);

  // Edit form state
  const [editPageNumber, setEditPageNumber] = useState('');
  const [editMemo, setEditMemo] = useState('');
  const [editEmotionStamp, setEditEmotionStamp] = useState<EmotionStamp | null>(null);

  // Refresh note data when screen is focused (e.g., returning from book selection)
  useFocusEffect(
    useCallback(() => {
      if (id) {
        const foundNote = findNoteById(id);
        setNote(foundNote);
        if (foundNote) {
          setEditPageNumber(foundNote.pageNumber?.toString() ?? '');
          setEditMemo(foundNote.memo ?? '');
          setEditEmotionStamp(foundNote.emotionStamp);
        }
      }
    }, [id])
  );

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
      showError('写真またはページ番号が必要です');
      return;
    }

    // updateNote returns the updated note directly
    const updatedNote = updateNote(note.id, {
      pageNumber: newPageNumber,
      memo: editMemo.trim() || null,
      emotionStamp: editEmotionStamp,
    });

    // Update local state with the returned note
    setNote(updatedNote);

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showSuccess('メモを更新しました');
    setIsEditing(false);
  }, [note, editPageNumber, editMemo, editEmotionStamp, updateNote, showSuccess, showError]);

  const handleAssignBook = useCallback(() => {
    if (note) {
      router.push(`/book/select?noteIds=${note.id}`);
    }
  }, [note, router]);

  const handleViewBook = useCallback(() => {
    if (note?.bookId) {
      router.push(`/book/${note.bookId}`);
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
                  <IconSymbol name="trash" size={20} color={Colors[colorScheme].error} />
                </TouchableOpacity>
              </View>
            ),
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Photo */}
        {note.photoUri && (
          <TouchableOpacity
            style={styles.photoContainer}
            onPress={() => setIsPhotoModalVisible(true)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: note.photoUri }}
              style={styles.photo}
              contentFit="contain"
            />
            <View style={styles.photoHint}>
              <IconSymbol name="arrow.up.left.and.arrow.down.right" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
        )}

        {/* Photo Modal */}
        <Modal
          visible={isPhotoModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsPhotoModalVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setIsPhotoModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <Image
                source={{ uri: note.photoUri }}
                style={styles.modalPhoto}
                contentFit="contain"
              />
            </View>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsPhotoModalVisible(false)}
            >
              <IconSymbol name="xmark.circle.fill" size={32} color="#fff" />
            </TouchableOpacity>
          </Pressable>
        </Modal>

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
          <ThemedText style={styles.sectionLabel}>スタンプ</ThemedText>
          {isEditing ? (
            <EmotionStampPicker
              value={editEmotionStamp}
              onChange={setEditEmotionStamp}
            />
          ) : note.emotionStamp ? (
            <ThemedText style={styles.emotionStamp}>
              {note.emotionStamp}
            </ThemedText>
          ) : (
            <ThemedText style={styles.value}>未設定</ThemedText>
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
            {book ? (
              <View
                style={[
                  styles.bookContainer,
                  { borderColor: Colors[colorScheme].icon + '40' },
                ]}
              >
                {/* Book info - tappable to view book detail */}
                <TouchableOpacity
                  style={styles.bookInfo}
                  onPress={handleViewBook}
                >
                  <IconSymbol
                    name="book.fill"
                    size={20}
                    color={Colors[colorScheme].tint}
                  />
                  <ThemedText style={styles.bookText} numberOfLines={1}>
                    {getBookDisplayName(book)}
                  </ThemedText>
                  <IconSymbol
                    name="chevron.right"
                    size={16}
                    color={Colors[colorScheme].icon}
                  />
                </TouchableOpacity>

                {/* Divider */}
                <View style={[styles.bookDivider, { backgroundColor: Colors[colorScheme].icon + '30' }]} />

                {/* Change button */}
                <TouchableOpacity
                  style={styles.bookChangeButton}
                  onPress={handleAssignBook}
                >
                  <IconSymbol
                    name="pencil"
                    size={18}
                    color={Colors[colorScheme].icon}
                  />
                </TouchableOpacity>
              </View>
            ) : (
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
                  color={Colors[colorScheme].icon}
                />
                <ThemedText style={styles.bookText}>
                  本に割り当てる
                </ThemedText>
                <IconSymbol
                  name="chevron.right"
                  size={16}
                  color={Colors[colorScheme].icon}
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Date */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel}>作成日時</ThemedText>
          <ThemedText style={styles.value}>{formattedDate}</ThemedText>
        </View>
      </ScrollView>

      {/* Floating capture button */}
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
  photoHint: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8,
  },
  modalPhoto: {
    flex: 1,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 60,
    right: 20,
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
  bookContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  bookInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  bookDivider: {
    width: 1,
    height: '60%',
  },
  bookChangeButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bookText: {
    flex: 1,
    fontSize: 16,
  },
});
