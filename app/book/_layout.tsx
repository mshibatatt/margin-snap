import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function BookLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 8 }}>
            <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme].tint} />
          </TouchableOpacity>
        ),
      }}
    />
  );
}
