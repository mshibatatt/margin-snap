import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useBooks, useToast } from '@/contexts';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { findBookById } from '@/db';
import type { Book } from '@/types';

export default function EditBookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const { updateBook } = useBooks();
  const { showSuccess, showError } = useToast();

  const [book, setBook] = useState<Book | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      const foundBook = findBookById(id);
      setBook(foundBook);
      if (foundBook) {
        setTitle(foundBook.title);
        setAuthor(foundBook.author ?? '');
      }
    }
  }, [id]);

  const handleSave = useCallback(async () => {
    if (!book) return;

    if (!title.trim()) {
      showError('タイトルを入力してください');
      return;
    }

    try {
      setIsSaving(true);
      updateBook(book.id, {
        title: title.trim(),
        author: author.trim() || null,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showSuccess('本を更新しました');
      router.back();
    } catch (error) {
      console.error('Failed to update book:', error);
      showError('本の更新に失敗しました');
    } finally {
      setIsSaving(false);
    }
  }, [book, title, author, updateBook, router, showSuccess, showError]);

  if (!book) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.notFound}>
          <ThemedText>本が見つかりません</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const hasChanges =
    title.trim() !== book.title ||
    (author.trim() || null) !== book.author;

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>タイトル</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  color: Colors[colorScheme].text,
                  backgroundColor: Colors[colorScheme].background,
                  borderColor: Colors[colorScheme].icon + '40',
                },
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="本のタイトルを入力..."
              placeholderTextColor={Colors[colorScheme].icon}
              autoFocus
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>著者（任意）</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  color: Colors[colorScheme].text,
                  backgroundColor: Colors[colorScheme].background,
                  borderColor: Colors[colorScheme].icon + '40',
                },
              ]}
              value={author}
              onChangeText={setAuthor}
              placeholder="著者名を入力..."
              placeholderTextColor={Colors[colorScheme].icon}
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor:
                  title.trim() && hasChanges
                    ? Colors[colorScheme].tint
                    : Colors[colorScheme].icon + '40',
              },
            ]}
            onPress={handleSave}
            disabled={!title.trim() || !hasChanges || isSaving}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.saveButtonText}>
              {isSaving ? '保存中...' : '保存'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
