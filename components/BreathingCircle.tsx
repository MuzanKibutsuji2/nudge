import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { useReducedMotion, useTheme } from '../lib/theme';

/** Half a cycle. Slow on purpose — nobody has to keep up with it. */
export const BREATH_MS = 5000;

export interface BreathingCircleProps {
  running: boolean;
  size?: number;
}

/**
 * A soft circle that grows and shrinks.
 *
 * It is a pacing suggestion, not an instruction: there is no counting, no
 * holding, and nothing happens if you ignore it. If the device asks for
 * reduced motion the circle simply stays still.
 */
export function BreathingCircle({ running, size = 220 }: BreathingCircleProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!running || reduceMotion) return undefined;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: BREATH_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: BREATH_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [progress, reduceMotion, running]);

  const scale = reduceMotion
    ? 0.88
    : progress.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });
  const haloScale = reduceMotion
    ? 1
    : progress.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1.12] });
  const haloOpacity = reduceMotion
    ? 0.35
    : progress.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.5] });

  return (
    <View
      style={[styles.wrap, { width: size, height: size }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Animated.View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: theme.colors.accentSoft,
            opacity: haloOpacity,
            transform: [{ scale: haloScale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.circle,
          {
            width: size * 0.74,
            height: size * 0.74,
            borderRadius: (size * 0.74) / 2,
            backgroundColor: theme.colors.accent,
            opacity: 0.85,
            transform: [{ scale }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  circle: { position: 'absolute' },
});
