import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type ViewStyle,
} from 'react-native';

import { HIT_SIZE } from '../constants/theme';
import { tap as hapticTap } from '../lib/feedback';
import { useReducedMotion, useTheme } from '../lib/theme';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'quiet';
export type ButtonSize = 'lg' | 'md' | 'sm';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Rendered to the left of the label. */
  icon?: React.ReactNode;
  style?: ViewStyle;
  /** Set false for destructive or quiet actions that shouldn't buzz. */
  haptic?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'lg',
  fullWidth = true,
  icon,
  style,
  haptic = true,
  disabled,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;

  const animate = (to: number) => {
    if (reduceMotion) return;
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  const height = size === 'lg' ? 58 : size === 'md' ? HIT_SIZE : 40;
  const paddingHorizontal = size === 'sm' ? theme.spacing.lg : theme.spacing.xl;

  const palette: Record<ButtonVariant, { bg: string; border: string; tone: Parameters<typeof Text>[0]['tone'] }> = {
    primary: { bg: theme.colors.accent, border: 'transparent', tone: 'onAccent' },
    secondary: { bg: theme.colors.surface, border: theme.colors.lineStrong, tone: 'default' },
    ghost: { bg: theme.colors.accentSoft, border: 'transparent', tone: 'accent' },
    quiet: { bg: 'transparent', border: 'transparent', tone: 'muted' },
  };

  const look = palette[variant];

  return (
    <Animated.View
      style={[
        fullWidth ? styles.fullWidth : styles.auto,
        { transform: [{ scale }], opacity: disabled ? 0.45 : 1 },
        style,
      ]}
    >
      <Pressable
        {...rest}
        disabled={disabled}
        onPress={(event) => {
          if (haptic) hapticTap();
          onPress?.(event);
        }}
        onPressIn={() => animate(0.975)}
        onPressOut={() => animate(1)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: !!disabled }}
        style={({ pressed }) => [
          styles.base,
          {
            minHeight: height,
            paddingHorizontal,
            borderRadius: theme.radius.lg,
            backgroundColor: look.bg,
            borderColor: look.border,
            borderWidth: variant === 'secondary' ? StyleSheet.hairlineWidth * 2 : 0,
          },
          variant === 'primary' && theme.shadows.soft,
          pressed && { opacity: variant === 'quiet' ? 0.6 : 0.92 },
        ]}
      >
        {icon ? <View style={{ marginRight: theme.spacing.sm }}>{icon}</View> : null}
        <Text
          variant={size === 'sm' ? 'label' : 'subheading'}
          tone={look.tone}
          numberOfLines={2}
          style={styles.label}
        >
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullWidth: { alignSelf: 'stretch' },
  auto: { alignSelf: 'flex-start' },
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { textAlign: 'center' },
});
