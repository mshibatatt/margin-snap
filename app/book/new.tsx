import React, { useState, useCallback, useMemo } from 'react';
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
import { useNotes, useBooks, useToast } from '@/contexts';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function NewBookScreen() {
  const { noteIds } = useLocalSearchParams<{ noteIds?: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const { assignToBook } = useNotes();
  const { createBook } = useBooks();
  const { showSuccess, showError } = useToast();

  const [title, setTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const noteIdArray = useMemo(
    () => noteIds?.split(',').filter(Boolean) ?? [],
    [noteIds]
  );

  const handleCreate = useCallback(async () => {
    if (!title.trim()) {
      showError('タイトルを入力してください');
      return;
    }

    try {
      setIsCreating(true);

      // Create the book
      const book = createBook({ title: title.trim() });

      // Assign notes if any
      if (noteIdArray.length > 0) {
        assignToBook(noteIdArray, book.id);
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showSuccess('本を作成しました');
      router.back();
    } catch (error) {
      console.error('Failed to create book:', error);
      showError('本の作成に失敗しました');
    } finally {
      setIsCreating(false);
    }
  }, [title, noteIdArray, createBook, assignToBook, router, showSuccess, showError]);

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {noteIdArray.length > 0 && (
            <ThemedText style={styles.infoText}>
              {noteIdArray.length}件のメモをこの本に追加します
            </ThemedText>
          )}

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
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.createButton,
              {
                backgroundColor: title.trim()
                  ? Colors[colorScheme].tint
                  : Colors[colorScheme].icon + '40',
              },
            ]}
            onPress={handleCreate}
            disabled={!title.trim() || isCreating}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.createButtonText}>
              {isCreating ? '作成中...' : '作成'}
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
  content: {
    flex: 1,
    padding: 16,
    gap: 20,
  },
  infoText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
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
  createButton: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
