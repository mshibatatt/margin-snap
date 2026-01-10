import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface PageNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function PageNumberInput({
  value,
  onChange,
  placeholder = 'ページ番号',
}: PageNumberInputProps) {
  const colorScheme = useColorScheme() ?? 'light';

  const handleKeyPress = async (key: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (key === 'delete') {
      onChange(value.slice(0, -1));
    } else if (key === 'clear') {
      onChange('');
    } else {
      // Limit to reasonable page numbers (max 5 digits)
      if (value.length < 5) {
        onChange(value + key);
      }
    }
  };

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['clear', '0', 'delete'],
  ];

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.display,
          { borderColor: Colors[colorScheme].icon + '40' },
        ]}
      >
        <TextInput
          style={[styles.displayText, { color: Colors[colorScheme].text }]}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={Colors[colorScheme].icon}
          editable={false}
          keyboardType="number-pad"
        />
        {value.length > 0 && (
          <ThemedText style={styles.pageLabel}>ページ</ThemedText>
        )}
      </View>

      <View style={styles.keypad}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.key,
                  {
                    backgroundColor:
                      key === 'clear' || key === 'delete'
                        ? Colors[colorScheme].background
                        : Colors[colorScheme].tint + '15',
                  },
                ]}
                onPress={() => handleKeyPress(key)}
                activeOpacity={0.6}
              >
                {key === 'delete' ? (
                  <IconSymbol
                    name="delete.left"
                    size={24}
                    color={Colors[colorScheme].text}
                  />
                ) : key === 'clear' ? (
                  <ThemedText style={styles.keyTextSmall}>C</ThemedText>
                ) : (
                  <ThemedText style={styles.keyText}>{key}</ThemedText>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  display: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  displayText: {
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
    minWidth: 100,
  },
  pageLabel: {
    fontSize: 16,
    opacity: 0.6,
  },
  keypad: {
    gap: 8,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  key: {
    width: 72,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 24,
    fontWeight: '500',
  },
  keyTextSmall: {
    fontSize: 18,
    fontWeight: '600',
    opacity: 0.7,
  },
});
