import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import type { TypeVariant } from '../constants/theme';
import { useTheme } from '../lib/theme';

export type TextTone = 'default' | 'muted' | 'subtle' | 'accent' | 'onAccent' | 'positive';

export interface TextProps extends RNTextProps {
  variant?: TypeVariant;
  tone?: TextTone;
  center?: boolean;
  /** Overrides the variant's weight without redefining the whole style. */
  weight?: TextStyle['fontWeight'];
}

/**
 * Every piece of text in the app goes through here, so type scale and colour
 * stay consistent and nothing hardcodes a hex value.
 */
export function Text({
  variant = 'body',
  tone = 'default',
  center,
  weight,
  style,
  ...rest
}: TextProps) {
  const theme = useTheme();

  const color =
    tone === 'muted'
      ? theme.colors.textMuted
      : tone === 'subtle'
        ? theme.colors.textSubtle
        : tone === 'accent'
          ? theme.colors.accent
          : tone === 'onAccent'
            ? theme.colors.onAccent
            : tone === 'positive'
              ? theme.colors.positive
              : theme.colors.text;

  return (
    <RNText
      {...rest}
      style={[
        theme.typography[variant],
        { color },
        center && { textAlign: 'center' },
        weight ? { fontWeight: weight } : null,
        style,
      ]}
    />
  );
}
