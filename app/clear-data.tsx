import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FadeIn } from '../components/FadeIn';
import { Header } from '../components/Header';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { settings as copy } from '../constants/copy';
import { useActions } from '../lib/store';
import { useTheme } from '../lib/theme';

/** A real confirmation screen, not a one-tap destructive button. */
export default function ClearData() {
  const theme = useTheme();
  const router = useRouter();
  const { clearAllData } = useActions();

  const [cleared, setCleared] = useState(false);
  const [working, setWorking] = useState(false);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/settings');
  };

  const confirm = async () => {
    setWorking(true);
    await clearAllData();
    setWorking(false);
    setCleared(true);
  };

  if (cleared) {
    return (
      <Screen
        footer={<Button title="Start again" onPress={() => router.replace('/onboarding')} />}
      >
        <View style={styles.centered}>
          <FadeIn>
            <Text variant="display" center accessibilityRole="header">
              {copy.clear.doneTitle}
            </Text>
            <Text variant="bodyLarge" tone="muted" center style={{ marginTop: theme.spacing.md }}>
              {copy.clear.doneBody}
            </Text>
          </FadeIn>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <View>
          <Button title={copy.clear.cancel} onPress={close} />
          <Button
            title={copy.clear.confirm}
            variant="secondary"
            onPress={confirm}
            disabled={working}
            style={{ marginTop: theme.spacing.sm }}
            accessibilityHint="Permanently removes everything stored on this device"
          />
        </View>
      }
    >
      <Header backIcon="close" backLabel="Close" />

      <View style={styles.body}>
        <FadeIn>
          <Text variant="display" accessibilityRole="header">
            {copy.clear.title}
          </Text>
          <Text variant="bodyLarge" tone="muted" style={{ marginTop: theme.spacing.md }}>
            {copy.clear.body}
          </Text>

          <Card tone="alt" style={{ marginTop: theme.spacing['2xl'] }}>
            <Text variant="label" weight="600">
              What gets removed
            </Text>
            {['Tasks and smaller steps', 'Session history', 'Check-ins', 'Your name and settings'].map(
              (item) => (
                <Text key={item} variant="body" tone="muted" style={{ marginTop: theme.spacing.sm }}>
                  · {item}
                </Text>
              )
            )}
          </Card>
        </FadeIn>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', paddingVertical: 24 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
