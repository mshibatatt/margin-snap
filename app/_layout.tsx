import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { NotesProvider, BooksProvider, ToastProvider } from '@/contexts';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <BooksProvider>
          <NotesProvider>
            <ToastProvider>
              <Stack screenOptions={{ headerShown: true }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="book" options={{ headerShown: false }} />
                <Stack.Screen name="note" options={{ headerShown: false }} />
              </Stack>
              <StatusBar style="auto" />
            </ToastProvider>
          </NotesProvider>
        </BooksProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
