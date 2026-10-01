import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '../lib/theme';
import { Text } from './Text';

export interface LogoProps {
  size?: number;
  color?: string;
}

/**
 * The mark: a small dot giving a larger curve a gentle push.
 * Two shapes, nothing else.
 */
export function Logo({ size = 44, color }: LogoProps) {
  const theme = useTheme();
  const tint = color ?? theme.colors.accent;

  return (
    <View accessibilityRole="image" accessibilityLabel="Nudge">
      <Svg width={size} height={size} viewBox="0 0 48 48">
        <Circle cx="12" cy="24" r="5.5" fill={tint} />
        <Path
          d="M25 11.5a13.5 13.5 0 0 1 0 25"
          stroke={tint}
          strokeWidth={4.5}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

export function Wordmark({ size = 22, tone = 'default' }: { size?: number; tone?: 'default' | 'muted' }) {
  return (
    <Text
      variant="heading"
      tone={tone}
      style={{ fontSize: size, letterSpacing: size * 0.22, fontWeight: '600' }}
    >
      NUDGE
    </Text>
  );
}
