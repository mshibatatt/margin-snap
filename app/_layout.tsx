import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { NotesProvider, BooksProvider, ToastProvider } from '@/contexts';
import { Walkthrough } from '@/components/onboarding';

const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      setShowWalkthrough(completed !== 'true');
    } catch {
      setShowWalkthrough(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalkthroughComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    } catch {
      // Ignore storage errors
    }
    setShowWalkthrough(false);
  };

  if (isLoading) {
    return null;
  }

  if (showWalkthrough) {
    return (
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Walkthrough onComplete={handleWalkthroughComplete} />
          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

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
