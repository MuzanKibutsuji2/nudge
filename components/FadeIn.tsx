import React, { useEffect, useRef } from 'react';
import { Animated, Easing, type ViewProps, type ViewStyle } from 'react-native';

import { useReducedMotion, useTheme } from '../lib/theme';

export interface FadeInProps extends ViewProps {
  /** Milliseconds before the fade starts. Used to stagger lists. */
  delay?: number;
  duration?: number;
  /** How far up the content drifts while fading in. */
  offset?: number;
  style?: ViewStyle | ViewStyle[];
}

/**
 * The only entrance animation in the app: a short fade with a few pixels of
 * drift. Disabled entirely when the user asks for reduced motion.
 */
export function FadeIn({
  delay = 0,
  duration,
  offset = 8,
  style,
  children,
  ...rest
}: FadeInProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(1);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: 1,
      delay,
      duration: duration ?? theme.motion.slow,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [delay, duration, progress, reduceMotion, theme.motion.slow]);

  return (
    <Animated.View
      {...rest}
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [offset, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
