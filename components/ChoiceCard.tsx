import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../lib/theme';
import { Card } from './Card';
import { Text } from './Text';

export interface ChoiceCardProps {
  emoji?: string;
  title: string;
  body?: string;
  onPress: () => void;
  tone?: 'surface' | 'alt' | 'accent';
  showChevron?: boolean;
  accessibilityHint?: string;
}

/** The big "What do you need right now?" cards. */
export function ChoiceCard({
  emoji,
  title,
  body,
  onPress,
  tone = 'surface',
  showChevron = true,
  accessibilityHint,
}: ChoiceCardProps) {
  const theme = useTheme();

  return (
    <Card
      tone={tone}
      onPress={onPress}
      accessibilityLabel={body ? `${title}. ${body}` : title}
      accessibilityHint={accessibilityHint}
      style={{ marginBottom: theme.spacing.md }}
    >
      <View style={styles.row}>
        {emoji ? (
          <View
            style={[
              styles.emojiWrap,
              {
                backgroundColor: theme.colors.surfaceAlt,
                borderRadius: theme.radius.md,
                marginRight: theme.spacing.lg,
              },
            ]}
          >
            <Text variant="heading" accessibilityElementsHidden importantForAccessibility="no">
              {emoji}
            </Text>
          </View>
        ) : null}

        <View style={styles.textWrap}>
          <Text variant="heading">{title}</Text>
          {body ? (
            <Text variant="body" tone="muted" style={{ marginTop: 2 }}>
              {body}
            </Text>
          ) : null}
        </View>

        {showChevron ? (
          <Feather
            name="chevron-right"
            size={20}
            color={theme.colors.textSubtle}
            style={{ marginLeft: theme.spacing.sm }}
          />
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  emojiWrap: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  textWrap: { flex: 1 },
});
