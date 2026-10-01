import React from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';

import { useTheme } from '../lib/theme';

/**
 * Nudge is a phone app. When it is previewed in a desktop browser we keep it
 * inside a phone-sized frame instead of stretching it across a monitor.
 * On a real device (and on a narrow browser) this renders nothing at all.
 */
export function DeviceFrame({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();

  if (Platform.OS !== 'web') return <>{children}</>;

  const framed = width >= 560 && height >= 620;
  if (!framed) {
    return <View style={[styles.flex, { backgroundColor: theme.colors.bg }]}>{children}</View>;
  }

  const canvas = theme.scheme === 'light' ? '#DED6CA' : '#09090A';

  return (
    <View style={[styles.canvas, { backgroundColor: canvas }]}>
      <View
        style={[
          styles.device,
          {
            backgroundColor: theme.colors.bg,
            borderColor: theme.scheme === 'light' ? '#C9BFB1' : '#23211E',
            height: Math.min(880, height - 48),
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  canvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  device: {
    width: 404,
    maxWidth: '100%',
    borderRadius: 46,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
