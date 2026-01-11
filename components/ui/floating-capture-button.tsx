import { StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from './icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface FloatingCaptureButtonProps {
  bottom?: number;
}

export function FloatingCaptureButton({ bottom = 24 }: FloatingCaptureButtonProps) {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)');
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: Colors[colorScheme].tint,
          bottom,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <IconSymbol name="camera.fill" size={24} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
