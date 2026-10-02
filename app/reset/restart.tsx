import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '../../components/Button';
import { FadeIn } from '../../components/FadeIn';
import { Header } from '../../components/Header';
import { Screen } from '../../components/Screen';
import { Text } from '../../components/Text';
import { restart as copy } from '../../constants/copy';
import { resetToHome } from '../../lib/navigation';
import { clearUnclutter } from '../../lib/unclutter';
import { useTheme } from '../../lib/theme';

/**
 * The tiniest possible restart. Offered after Reset Room or Brain Unclutter,
 * and reachable on its own for anyone who wants to skip straight here.
 */
export default function Restart() {
  const theme = useTheme();
  const router = useRouter();

  const finish = () => {
    clearUnclutter();
    resetToHome(router);
  };

  return (
    <Screen background="calm" scroll>
      <Header backIcon="close" backLabel="Leave" onBack={finish} />

      <View style={styles.body}>
        <FadeIn>
          <Text variant="display" accessibilityRole="header">
            {copy.title}
          </Text>
          <Text variant="bodyLarge" tone="muted" style={{ marginTop: theme.spacing.sm }}>
            {copy.subtitle}
          </Text>
        </FadeIn>

        <FadeIn delay={140} style={{ marginTop: theme.spacing['2xl'] }}>
          <Button title={copy.options.start} onPress={() => router.push('/reset/tiny')} />
          <Button
            title={copy.options.takeBreak}
            variant="secondary"
            onPress={() => router.replace('/break')}
            style={{ marginTop: theme.spacing.sm }}
          />
          <Button
            title={copy.options.done}
            subtitle={copy.finishNote}
            variant="quiet"
            onPress={finish}
            style={{ marginTop: theme.spacing.sm }}
          />
        </FadeIn>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', paddingVertical: 12 },
});
