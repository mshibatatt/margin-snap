import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Typography, Colors } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption';
  secondary?: boolean;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  secondary = false,
  ...rest
}: ThemedTextProps) {
  const colorKey = secondary ? 'textSecondary' : 'text';
  const color = useThemeColor({ light: lightColor, dark: darkColor }, colorKey);
  const linkColor = useThemeColor({}, 'tint');

  return (
    <Text
      style={[
        { color },
        styles[type] ?? styles.default,
        type === 'link' ? { color: linkColor } : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  // Legacy types (backward compatibility)
  default: {
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
  },
  defaultSemiBold: {
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    fontWeight: '600',
  },
  title: {
    fontSize: Typography.h1.fontSize,
    fontWeight: Typography.h1.fontWeight,
    lineHeight: Typography.h1.lineHeight,
  },
  subtitle: {
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight,
    lineHeight: Typography.h2.lineHeight,
  },
  link: {
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
  },
  // New design system types
  h1: {
    fontSize: Typography.h1.fontSize,
    fontWeight: Typography.h1.fontWeight,
    lineHeight: Typography.h1.lineHeight,
  },
  h2: {
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight,
    lineHeight: Typography.h2.lineHeight,
  },
  h3: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    lineHeight: Typography.h3.lineHeight,
  },
  body: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    lineHeight: Typography.body.lineHeight,
  },
  bodySmall: {
    fontSize: Typography.bodySmall.fontSize,
    fontWeight: Typography.bodySmall.fontWeight,
    lineHeight: Typography.bodySmall.lineHeight,
  },
  caption: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.caption.fontWeight,
    lineHeight: Typography.caption.lineHeight,
  },
});
