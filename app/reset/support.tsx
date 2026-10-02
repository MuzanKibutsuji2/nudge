import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FadeIn } from '../../components/FadeIn';
import { Header } from '../../components/Header';
import { Screen } from '../../components/Screen';
import { Text } from '../../components/Text';
import { support as copy } from '../../constants/copy';
import { useTheme } from '../../lib/theme';

/**
 * Deliberately behind a quiet link rather than shown by default: ordinary
 * stress is not an emergency, and treating it like one would be its own kind
 * of harm. No diagnosis, no claims — just where to turn if it is serious.
 */
export default function Support() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Screen
      scroll
      footer={
        <Button
          title={copy.back}
          variant="secondary"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/reset'))}
        />
      }
    >
      <Header />

      <FadeIn>
        <Text variant="title" accessibilityRole="header">
          {copy.title}
        </Text>
        <Text variant="body" tone="muted" style={{ marginTop: theme.spacing.md }}>
          {copy.body}
        </Text>
      </FadeIn>

      <FadeIn delay={100} style={{ marginTop: theme.spacing.xl }}>
        <Card tone="accent">
          <Text variant="bodyLarge">{copy.unwell}</Text>
          <Text variant="body" tone="muted" style={{ marginTop: theme.spacing.lg }}>
            {copy.emergency}
          </Text>
        </Card>
      </FadeIn>

      <FadeIn delay={160} style={{ marginTop: theme.spacing.xl }}>
        <View style={styles.footerNote}>
          <Text variant="body" tone="muted">
            {copy.ordinary}
          </Text>
        </View>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footerNote: { marginBottom: 24 },
});
