import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { EMOTION_STAMPS, type EmotionStamp } from '@/types';

interface EmotionStampPickerProps {
  value: EmotionStamp | null;
  onChange: (stamp: EmotionStamp | null) => void;
}

export function EmotionStampPicker({ value, onChange }: EmotionStampPickerProps) {
  const colorScheme = useColorScheme() ?? 'light';

  const handleSelect = async (stamp: EmotionStamp) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Toggle: if same stamp is selected, deselect it
    if (value === stamp) {
      onChange(null);
    } else {
      onChange(stamp);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>スタンプ</ThemedText>
      <View style={styles.stamps}>
        {EMOTION_STAMPS.map((stamp) => (
          <TouchableOpacity
            key={stamp}
            style={[
              styles.stamp,
              {
                backgroundColor:
                  value === stamp
                    ? Colors[colorScheme].tint + '25'
                    : 'transparent',
                borderColor:
                  value === stamp
                    ? Colors[colorScheme].tint
                    : Colors[colorScheme].icon + '30',
              },
            ]}
            onPress={() => handleSelect(stamp)}
            activeOpacity={0.6}
          >
            <ThemedText style={styles.stampText}>{stamp}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    opacity: 0.7,
    marginLeft: 4,
  },
  stamps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  stamp: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 48,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stampText: {
    fontSize: 22,
  },
});
