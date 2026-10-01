import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../lib/theme';
import { Button } from './Button';
import { Text } from './Text';

export interface EmptyStateProps {
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

/** Empty is never framed as failure. */
export function EmptyState({ title, body, actionLabel, onAction, compact }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingVertical: compact ? theme.spacing.xl : theme.spacing['3xl'],
          paddingHorizontal: theme.spacing.lg,
          backgroundColor: theme.colors.surfaceAlt,
          borderRadius: theme.radius.xl,
        },
      ]}
    >
      <Text variant={compact ? 'subheading' : 'heading'} center>
        {title}
      </Text>
      {body ? (
        <Text variant="body" tone="muted" center style={{ marginTop: theme.spacing.xs }}>
          {body}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          variant="ghost"
          size="md"
          fullWidth={false}
          onPress={onAction}
          style={{ marginTop: theme.spacing.lg }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
