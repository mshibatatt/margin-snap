import { Stack } from 'expo-router';
import { BackButton } from '@/components/ui/back-button';

export default function BookLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => <BackButton />,
      }}
    >
      {/* Modal screens */}
      <Stack.Screen name="new" options={{ presentation: 'modal', title: '新しい本' }} />
      <Stack.Screen name="select" options={{ presentation: 'modal', title: '本を選択' }} />
      <Stack.Screen name="[id]/edit" options={{ presentation: 'modal', title: '本を編集' }} />

      {/* Regular screens */}
      <Stack.Screen name="[id]/index" />
    </Stack>
  );
}
