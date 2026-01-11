/**
 * Margin Snap Design System
 * コンセプト: 落ち着き・集中 - 読書体験を邪魔しない静かで洗練されたデザイン
 * 詳細: docs/design-system.md
 */

import { Platform } from 'react-native';

// Primary: 深いティール - 知性と落ち着きを表現
const primary = '#1A5F5A';
const primaryLight = '#2A7A74';
const primaryDark = '#134845';

// Secondary: アンバー - 温かみのあるアクセント
const secondary = '#8B6914';

// Semantic Colors
const success = '#2E7D4A';
const error = '#C5392F';
const warning = '#C97A1F';

export const Colors = {
  light: {
    // Core
    text: '#1A1A1A',
    textSecondary: '#6B6B6B',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    // Brand
    tint: primary,
    tintLight: primaryLight,
    tintDark: primaryDark,
    secondary: secondary,
    // UI
    icon: '#757575',
    border: '#E0E0E0',
    tabIconDefault: '#757575',
    tabIconSelected: primary,
    // Semantic
    success: success,
    error: error,
    warning: warning,
  },
  dark: {
    // Core
    text: '#F5F5F5',
    textSecondary: '#A0A0A0',
    background: '#121212',
    surface: '#1E1E1E',
    // Brand
    tint: primaryLight, // ダークモードでは少し明るく
    tintLight: '#3A8A84',
    tintDark: primary,
    secondary: '#B8922A',
    // UI
    icon: '#9E9E9E',
    border: '#333333',
    tabIconDefault: '#9E9E9E',
    tabIconSelected: primaryLight,
    // Semantic
    success: '#4CAF6A',
    error: '#E57373',
    warning: '#FFB74D',
  },
  // 共通カラー（モード非依存）
  common: {
    primary,
    primaryLight,
    primaryDark,
    secondary,
    success,
    error,
    warning,
    white: '#FFFFFF',
    black: '#000000',
  },
};

// スペーシングスケール (4px基準)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// タイポグラフィ
export const Typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
  h2: { fontSize: 22, fontWeight: '600' as const, lineHeight: 29 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 23 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 26 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
} as const;

// コンポーネントスタイル
export const Components = {
  button: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listItem: {
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
