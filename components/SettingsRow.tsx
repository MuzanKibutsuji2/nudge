import React from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { tap } from '../lib/feedback';
import { useTheme } from '../lib/theme';
import { Text } from './Text';

interface BaseProps {
  label: string;
  description?: string;
  /** Last row in a group skips the divider. */
  last?: boolean;
}

export function SettingsGroup({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={{ marginBottom: theme.spacing['2xl'] }}>
      {title ? (
        <Text
          variant="caption"
          tone="subtle"
          weight="600"
          style={{
            marginBottom: theme.spacing.sm,
            marginLeft: theme.spacing.xs,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </Text>
      ) : null}
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.xl,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: theme.colors.line,
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
    </View>
  );
}

export function SettingsRow({
  label,
  description,
  last,
  right,
  onPress,
  destructive,
  accessibilityHint,
}: BaseProps & {
  right?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  accessibilityHint?: string;
}) {
  const theme = useTheme();

  const content = (
    <View
      style={[
        styles.row,
        {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.lg,
          borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth * 2,
          borderBottomColor: theme.colors.line,
        },
      ]}
    >
      <View style={styles.labels}>
        <Text variant="body" weight="500" style={destructive ? { color: theme.colors.warm } : undefined}>
          {label}
        </Text>
        {description ? (
          <Text variant="caption" tone="subtle" style={{ marginTop: 2 }}>
            {description}
          </Text>
        ) : null}
      </View>
      {right ?? (onPress ? <Feather name="chevron-right" size={18} color={theme.colors.textSubtle} /> : null)}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => (pressed ? { backgroundColor: theme.colors.surfaceAlt } : undefined)}
    >
      {content}
    </Pressable>
  );
}

export function SettingsToggle({
  label,
  description,
  value,
  onChange,
  last,
}: BaseProps & { value: boolean; onChange: (next: boolean) => void }) {
  const theme = useTheme();
  return (
    <SettingsRow
      label={label}
      description={description}
      last={last}
      right={
        <Switch
          value={value}
          onValueChange={(next) => {
            tap();
            onChange(next);
          }}
          accessibilityLabel={label}
          trackColor={{ true: theme.colors.accent, false: theme.colors.lineStrong }}
          thumbColor={theme.colors.surface}
          ios_backgroundColor={theme.colors.lineStrong}
        />
      }
    />
  );
}

export function SettingsBlock({
  label,
  description,
  children,
  last,
}: BaseProps & { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.lg,
        borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth * 2,
        borderBottomColor: theme.colors.line,
      }}
    >
      <Text variant="body" weight="500">
        {label}
      </Text>
      {description ? (
        <Text variant="caption" tone="subtle" style={{ marginTop: 2 }}>
          {description}
        </Text>
      ) : null}
      <View style={{ marginTop: theme.spacing.md }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 56 },
  labels: { flex: 1, marginRight: 12 },
});
