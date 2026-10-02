import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../lib/theme';
import { Text } from './Text';

export function SectionTitle({
  title,
  action,
  style,
}: {
  title: string;
  action?: React.ReactNode;
  style?: object;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.md,
        },
        style,
      ]}
    >
      <Text variant="subheading" accessibilityRole="header">
        {title}
      </Text>
      {action}
    </View>
  );
}
