import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../lib/theme';
import { Card } from './Card';
import { Text } from './Text';

export interface MoodCardProps {
  emoji: string;
  label: string;
  onPress: () => void;
  selected?: boolean;
}

/**
 * One "closest to how you feel" card.
 * Deliberately has no description: we never interpret the choice back at the user.
 */
export function MoodCard({ emoji, label, onPress, selected }: MoodCardProps) {
  const theme = useTheme();

  return (
    <Card
      tone={selected ? 'accent' : 'surface'}
      onPress={onPress}
      padded={false}
      accessibilityLabel={label}
      accessibilityHint="Opens the next step"
      style={{ marginBottom: theme.spacing.sm }}
    >
      <View style={[styles.row, { padding: theme.spacing.lg }]}>
        <Text
          variant="subheading"
          style={{ width: 30 }}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          {emoji}
        </Text>
        <Text variant="subheading" weight="500" style={styles.label}>
          {label}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { flex: 1, marginLeft: 4 },
});
