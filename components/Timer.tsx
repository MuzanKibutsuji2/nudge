import React from 'react';
import { StyleSheet, View } from 'react-native';

import { clockForScreenReader, formatClock } from '../lib/time';
import { useTheme } from '../lib/theme';
import { Text } from './Text';

export interface TimerProps {
  remaining: number;
  total: number;
  paused?: boolean;
}

/**
 * Big, quiet, tabular time. The thin line underneath is the only progress
 * indicator — no ring, no bar, no percentage.
 */
export function Timer({ remaining, total, paused }: TimerProps) {
  const theme = useTheme();
  const progress = total > 0 ? Math.min(1, Math.max(0, 1 - remaining / total)) : 0;

  return (
    <View style={styles.wrap} accessibilityRole="timer">
      <Text
        variant="timer"
        accessibilityLabel={clockForScreenReader(remaining)}
        accessibilityLiveRegion="polite"
        style={{ opacity: paused ? 0.45 : 1 }}
      >
        {formatClock(remaining)}
      </Text>

      <View
        style={[
          styles.track,
          { backgroundColor: theme.colors.line, borderRadius: 2, marginTop: theme.spacing.xl },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              backgroundColor: paused ? theme.colors.textSubtle : theme.colors.accent,
              width: `${progress * 100}%`,
              borderRadius: 2,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  track: { height: 3, width: 132, overflow: 'hidden' },
  fill: { height: 3 },
});
