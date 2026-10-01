import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { tap } from '../lib/feedback';
import { useTheme } from '../lib/theme';
import { Text } from './Text';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  /** Shows a tick when selected, so selection isn't conveyed by colour alone. */
  showCheck?: boolean;
}

export function Chip({ label, selected, onPress, showCheck = true }: ChipProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.colors.accentSoft : theme.colors.surface,
          borderColor: selected ? theme.colors.accent : theme.colors.line,
          borderRadius: theme.radius.pill,
          paddingVertical: 11,
          paddingHorizontal: theme.spacing.lg,
          marginRight: theme.spacing.sm,
          marginBottom: theme.spacing.sm,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      {selected && showCheck ? (
        <Feather name="check" size={14} color={theme.colors.accentSoftText} style={{ marginRight: 6 }} />
      ) : null}
      <Text variant="label" tone={selected ? 'accent' : 'muted'} weight={selected ? '600' : '500'}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    minHeight: 44,
  },
});
