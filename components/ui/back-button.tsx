import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from './icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export function BackButton() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <TouchableOpacity onPress={() => router.back()} style={styles.button}>
      <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme].tint} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginLeft: 8,
    padding: 4,
  },
});
