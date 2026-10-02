import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { useTheme } from '../lib/theme';

/** Shown for any unknown link. Still calm, still a way back. */
export default function NotFound() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Screen footer={<Button title="Go home" onPress={() => router.replace('/home')} />}>
      <View style={styles.center}>
        <Logo size={36} />
        <Text variant="title" style={{ marginTop: theme.spacing.xl }}>
          Nothing here.
        </Text>
        <Text variant="body" tone="muted" style={{ marginTop: theme.spacing.sm }}>
          That screen doesn&apos;t exist — no harm done.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
});
