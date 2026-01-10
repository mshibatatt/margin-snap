import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useNotes } from '@/contexts';

export default function UnsortedScreen() {
  const { notes, isLoading } = useNotes();
  const unsortedCount = notes.filter((n) => n.bookId === null).length;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title">未整理</ThemedText>
        <ThemedText style={styles.description}>
          {isLoading
            ? '読み込み中...'
            : `${unsortedCount}件の未整理メモ`}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  description: {
    marginTop: 8,
    opacity: 0.7,
  },
});
