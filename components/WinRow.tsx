import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../lib/theme';
import { Text } from './Text';

/** One "✓ Opened Physics notes" line. The tick is an icon, not a colour cue. */
export function WinRow({ label, detail }: { label: string; detail?: string }) {
  const theme = useTheme();

  return (
    <View
      style={[styles.row, { paddingVertical: theme.spacing.sm }]}
      accessibilityLabel={detail ? `Done: ${label}, ${detail}` : `Done: ${label}`}
    >
      <Feather
        name="check"
        size={16}
        color={theme.colors.positive}
        style={{ marginRight: theme.spacing.md, marginTop: 4 }}
      />
      <Text variant="body" style={styles.label}>
        {label}
      </Text>
      {detail ? (
        <Text variant="caption" tone="subtle" style={{ marginLeft: theme.spacing.sm, marginTop: 3 }}>
          {detail}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  label: { flex: 1 },
});
