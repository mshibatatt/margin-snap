import { Stack } from 'expo-router';
import { BackButton } from '@/components/ui/back-button';

export default function NoteLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => <BackButton />,
      }}
    >
      <Stack.Screen name="[id]" options={{ title: 'メモ詳細' }} />
    </Stack>
  );
}
