import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useBooks } from '@/contexts';

export default function BooksScreen() {
  const { books, isLoading } = useBooks();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title">本</ThemedText>
        <ThemedText style={styles.description}>
          {isLoading ? '読み込み中...' : `${books.length}冊の本`}
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
