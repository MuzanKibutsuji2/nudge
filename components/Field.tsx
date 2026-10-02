import React, { forwardRef } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '../lib/theme';
import { Text } from './Text';

export interface FieldProps extends TextInputProps {
  label?: string;
  hint?: string;
  /** Bigger type for the single-question screens. */
  prominent?: boolean;
}

export const Field = forwardRef<TextInput, FieldProps>(function Field(
  { label, hint, prominent, style, ...rest },
  ref
) {
  const theme = useTheme();

  return (
    <View>
      {label ? (
        <Text variant="label" tone="muted" style={{ marginBottom: theme.spacing.sm }}>
          {label}
        </Text>
      ) : null}

      <TextInput
        ref={ref}
        placeholderTextColor={theme.colors.textSubtle}
        selectionColor={theme.colors.accent}
        accessibilityLabel={label ?? rest.placeholder}
        {...rest}
        style={[
          prominent ? theme.typography.bodyLarge : theme.typography.body,
          styles.input,
          {
            color: theme.colors.text,
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.line,
            borderRadius: theme.radius.lg,
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: prominent ? theme.spacing.lg : theme.spacing.md,
            minHeight: prominent ? 60 : 52,
          },
          style,
        ]}
      />

      {hint ? (
        <Text variant="caption" tone="subtle" style={{ marginTop: theme.spacing.sm }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  input: {
    borderWidth: 1.5,
    width: '100%',
  },
});
