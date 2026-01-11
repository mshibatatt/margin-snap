import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  CameraView,
  PageNumberInput,
  EmotionStampPicker,
  MemoInput,
} from '@/components/capture';
import { useNotes, useToast } from '@/contexts';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, Components } from '@/constants/theme';
import { savePhoto } from '@/services/imageService';
import type { EmotionStamp } from '@/types';

export default function CaptureScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const insets = useSafeAreaInsets();
  const { createNote } = useNotes();
  const { showSuccess, showError } = useToast();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState('');
  const [memo, setMemo] = useState('');
  const [emotionStamp, setEmotionStamp] = useState<EmotionStamp | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const canSave = photoUri !== null || pageNumber.length > 0;

  const resetForm = useCallback(() => {
    setPhotoUri(null);
    setPageNumber('');
    setMemo('');
    setEmotionStamp(null);
  }, []);

  const handleSave = async () => {
    if (!canSave || isSaving) return;

    try {
      setIsSaving(true);

      // Save photo to permanent storage if exists (with optimization)
      let savedPhotoUri: string | null = null;
      if (photoUri) {
        savedPhotoUri = await savePhoto(photoUri);
      }

      // Create note
      createNote({
        photoUri: savedPhotoUri,
        pageNumber: pageNumber ? parseInt(pageNumber, 10) : null,
        memo: memo.trim() || null,
        emotionStamp,
      });

      // Success feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Reset form
      resetForm();

      // Show brief success message
      showSuccess('メモを保存しました');
    } catch (error) {
      console.error('Failed to save note:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showError('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Camera / Photo Preview */}
          <View style={styles.cameraContainer}>
            <CameraView
              photoUri={photoUri}
              onPhotoTaken={setPhotoUri}
              onPhotoRemoved={() => setPhotoUri(null)}
            />
          </View>

          {/* Page Number Input */}
          <View style={styles.section}>
            <PageNumberInput
              value={pageNumber}
              onChange={setPageNumber}
              placeholder={photoUri ? 'ページ番号（任意）' : 'ページ番号'}
            />
          </View>

          {/* Emotion Stamp Picker */}
          <View style={styles.section}>
            <EmotionStampPicker
              value={emotionStamp}
              onChange={setEmotionStamp}
            />
          </View>

          {/* Memo Input */}
          <View style={styles.section}>
            <MemoInput value={memo} onChange={setMemo} />
          </View>
        </ScrollView>

        {/* Fixed Save Button at Bottom */}
        <View
          style={[
            styles.saveButtonContainer,
            {
              paddingBottom: Math.max(insets.bottom, Spacing.md),
              borderTopColor: Colors[colorScheme].border,
              backgroundColor: Colors[colorScheme].surface,
            },
          ]}
        >
          {/* Validation Message */}
          {!canSave && (
            <View style={styles.validationMessage}>
              <ThemedText type="bodySmall" style={{ color: Colors[colorScheme].error }}>
                写真またはページ番号を入力してください
              </ThemedText>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: canSave
                  ? Colors[colorScheme].tint
                  : Colors[colorScheme].icon + '40',
              },
            ]}
            onPress={handleSave}
            disabled={!canSave || isSaving}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.lg,
  },
  cameraContainer: {
    alignItems: 'center',
  },
  section: {
    width: '100%',
  },
  saveButtonContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  validationMessage: {
    alignItems: 'center',
    paddingBottom: Spacing.sm,
  },
  saveButton: {
    height: Components.button.height,
    borderRadius: Components.button.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
