import React from 'react';
import { StyleSheet, View, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface MemoInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MemoInput({
  value,
  onChange,
  placeholder = '気づきや感想を入力...',
}: MemoInputProps) {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>メモ（任意）</ThemedText>
      <TextInput
        style={[
          styles.input,
          {
            color: Colors[colorScheme].text,
            backgroundColor: Colors[colorScheme].background,
            borderColor: Colors[colorScheme].icon + '40',
          },
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors[colorScheme].icon}
        multiline
        numberOfLines={2}
        maxLength={200}
        textAlignVertical="top"
      />
      <ThemedText style={styles.counter}>{value.length}/200</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    opacity: 0.7,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    minHeight: 56,
  },
  counter: {
    fontSize: 10,
    opacity: 0.5,
    textAlign: 'right',
    marginRight: 4,
  },
});
