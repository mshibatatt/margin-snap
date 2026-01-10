import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import {
  EMOTION_STAMPS,
  type DateFilter,
  type NoteStatusFilter,
  type EmotionStamp,
  type SortOrder,
} from '@/types';

interface FilterBarProps {
  dateFilter: DateFilter;
  onDateFilterChange: (filter: DateFilter) => void;
  statusFilter: NoteStatusFilter;
  onStatusFilterChange: (filter: NoteStatusFilter) => void;
  emotionStamps: EmotionStamp[];
  onEmotionStampsChange: (stamps: EmotionStamp[]) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (order: SortOrder) => void;
  showStatusFilter?: boolean;
}

interface FilterChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

function FilterChip({ label, isSelected, onPress }: FilterChipProps) {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: isSelected
            ? Colors[colorScheme].tint
            : Colors[colorScheme].icon + '15',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <ThemedText
        style={[
          styles.chipText,
          { color: isSelected ? '#fff' : Colors[colorScheme].text },
        ]}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

const DATE_FILTER_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'today', label: '今日' },
  { value: 'week', label: '7日' },
  { value: 'month', label: '30日' },
];

const STATUS_FILTER_OPTIONS: { value: NoteStatusFilter; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'unsorted', label: '未整理' },
  { value: 'sorted', label: '本あり' },
];

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'newest', label: '新しい順' },
  { value: 'oldest', label: '古い順' },
  { value: 'page', label: 'ページ順' },
];

export function FilterBar({
  dateFilter,
  onDateFilterChange,
  statusFilter,
  onStatusFilterChange,
  emotionStamps,
  onEmotionStampsChange,
  sortOrder,
  onSortOrderChange,
  showStatusFilter = true,
}: FilterBarProps) {
  const colorScheme = useColorScheme() ?? 'light';

  const toggleEmotionStamp = (stamp: EmotionStamp) => {
    if (emotionStamps.includes(stamp)) {
      onEmotionStampsChange(emotionStamps.filter((s) => s !== stamp));
    } else {
      onEmotionStampsChange([...emotionStamps, stamp]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Sort order */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionLabel}>並び順</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipRow}>
            {SORT_OPTIONS.map((option) => (
              <FilterChip
                key={option.value}
                label={option.label}
                isSelected={sortOrder === option.value}
                onPress={() => onSortOrderChange(option.value)}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Date filter */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionLabel}>期間</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipRow}>
            {DATE_FILTER_OPTIONS.map((option) => (
              <FilterChip
                key={option.value}
                label={option.label}
                isSelected={dateFilter === option.value}
                onPress={() => onDateFilterChange(option.value)}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Status filter */}
      {showStatusFilter && (
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel}>状態</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {STATUS_FILTER_OPTIONS.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  isSelected={statusFilter === option.value}
                  onPress={() => onStatusFilterChange(option.value)}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Emotion stamps */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionLabel}>感情</ThemedText>
        <View style={styles.chipRow}>
          {EMOTION_STAMPS.map((stamp) => (
            <TouchableOpacity
              key={stamp}
              style={[
                styles.emojiChip,
                {
                  backgroundColor: emotionStamps.includes(stamp)
                    ? Colors[colorScheme].tint + '25'
                    : Colors[colorScheme].icon + '10',
                  borderColor: emotionStamps.includes(stamp)
                    ? Colors[colorScheme].tint
                    : 'transparent',
                },
              ]}
              onPress={() => toggleEmotionStamp(stamp)}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.emojiText}>{stamp}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    gap: 12,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.5,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emojiChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  emojiText: {
    fontSize: 20,
  },
});
