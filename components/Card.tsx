import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';

import { tap as hapticTap } from '../lib/feedback';
import { useReducedMotion, useTheme } from '../lib/theme';

export interface CardProps extends ViewProps {
  onPress?: () => void;
  /** 'surface' sits on the background, 'alt' is quieter, 'accent' is tinted. */
  tone?: 'surface' | 'alt' | 'accent' | 'outline';
  padded?: boolean;
  style?: ViewStyle | ViewStyle[];
  accessibilityLabel?: string;
  accessibilityHint?: string;
  haptic?: boolean;
}

export function Card({
  onPress,
  tone = 'surface',
  padded = true,
  style,
  children,
  accessibilityLabel,
  accessibilityHint,
  haptic = true,
  ...rest
}: CardProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;

  const backgrounds: Record<NonNullable<CardProps['tone']>, string> = {
    surface: theme.colors.surface,
    alt: theme.colors.surfaceAlt,
    accent: theme.colors.accentSoft,
    outline: 'transparent',
  };

  const base: ViewStyle = {
    backgroundColor: backgrounds[tone],
    borderRadius: theme.radius.xl,
    padding: padded ? theme.spacing.xl : 0,
    borderWidth: tone === 'outline' ? StyleSheet.hairlineWidth * 2 : 0,
    borderColor: theme.colors.line,
  };

  if (!onPress) {
    return (
      <View {...rest} style={[base, tone === 'surface' && theme.shadows.soft, style]}>
        {children}
      </View>
    );
  }

  const animate = (to: number) => {
    if (reduceMotion) return;
    Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={() => {
          if (haptic) hapticTap();
          onPress();
        }}
        onPressIn={() => animate(0.985)}
        onPressOut={() => animate(1)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        style={({ pressed }) => [base, tone === 'surface' && theme.shadows.card, pressed && { opacity: 0.95 }]}
        {...rest}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
