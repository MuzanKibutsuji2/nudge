import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { tap } from '../lib/feedback';
import { useReducedMotion, useTheme } from '../lib/theme';

export interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label: string;
  size?: number;
}

/** A calm checkmark: it settles in, it does not pop. */
export function Checkbox({ checked, onToggle, label, size = 26 }: CheckboxProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(checked ? 1 : 0);
      return;
    }
    Animated.timing(progress, {
      toValue: checked ? 1 : 0,
      duration: theme.motion.base,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [checked, progress, reduceMotion, theme.motion.base]);

  return (
    <Pressable
      onPress={() => {
        tap();
        onToggle();
      }}
      hitSlop={12}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: checked ? theme.colors.accent : theme.colors.lineStrong,
          backgroundColor: checked ? theme.colors.accent : 'transparent',
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Animated.View
        style={{
          opacity: progress,
          transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
        }}
      >
        <Feather name="check" size={size * 0.6} color={theme.colors.onAccent} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
});
