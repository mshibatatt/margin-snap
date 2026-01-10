import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'メモを検索...',
  autoFocus = false,
}: SearchBarProps) {
  const colorScheme = useColorScheme() ?? 'light';

  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Colors[colorScheme].icon + '15',
        },
      ]}
    >
      <IconSymbol
        name="magnifyingglass"
        size={18}
        color={Colors[colorScheme].icon}
      />
      <TextInput
        style={[styles.input, { color: Colors[colorScheme].text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors[colorScheme].icon}
        autoFocus={autoFocus}
        returnKeyType="search"
        clearButtonMode="never"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconSymbol
            name="xmark.circle.fill"
            size={18}
            color={Colors[colorScheme].icon}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 2,
  },
});
