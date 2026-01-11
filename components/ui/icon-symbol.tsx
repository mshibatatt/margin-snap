// Fallback for using Ionicons on Android and web.
// Ionicons provides a modern, refined look that matches our design system.

import Ionicons from '@expo/vector-icons/Ionicons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof Ionicons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * SF Symbols to Ionicons mappings.
 * Ionicons: https://ionic.io/ionicons
 * SF Symbols: https://developer.apple.com/sf-symbols/
 */
const MAPPING = {
  // Navigation
  'house.fill': 'home',
  'chevron.right': 'chevron-forward',
  'chevron.left.forwardslash.chevron.right': 'code-slash',

  // Tab icons
  'camera.fill': 'camera',
  'tray.fill': 'file-tray-full',
  'book.fill': 'book',
  'book': 'book-outline',
  'magnifyingglass': 'search',

  // Actions
  'plus': 'add',
  'xmark': 'close',
  'xmark.circle': 'close-circle',
  'xmark.circle.fill': 'close-circle',
  'checkmark': 'checkmark',
  'checkmark.circle.fill': 'checkmark-circle',
  'pencil': 'pencil',
  'trash': 'trash-outline',
  'trash.fill': 'trash',
  'arrow.counterclockwise': 'refresh',
  'paperplane.fill': 'send',

  // UI elements
  'delete.left': 'backspace-outline',
  'photo': 'image-outline',
  'photo.fill': 'image',
  'ellipsis': 'ellipsis-horizontal',
  'square.and.arrow.up': 'share-outline',
  'info.circle': 'information-circle-outline',
  'info.circle.fill': 'information-circle',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Ionicons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Ionicons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <Ionicons color={color} size={size} name={MAPPING[name]} style={style} />;
}
