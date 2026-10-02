import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '../../components/Button';
import { FadeIn } from '../../components/FadeIn';
import { Header } from '../../components/Header';
import { Screen } from '../../components/Screen';
import { Text } from '../../components/Text';
import { quietMode as copy } from '../../constants/copy';
import { resetToHome } from '../../lib/navigation';
import { useTheme } from '../../lib/theme';

/**
 * Quiet Mode. No timer, no transitions, no suggestions, nothing to finish.
 * The only moving parts are the two ways out.
 */
export default function QuietMode() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Screen
      background="calm"
      footer={
        <View>
          <Button
            title={copy.done}
            variant="secondary"
            onPress={() => router.replace('/reset/after')}
          />
          <Button
            title={copy.leave}
            variant="quiet"
            size="md"
            onPress={() => resetToHome(router)}
            style={{ marginTop: theme.spacing.xs }}
          />
        </View>
      }
    >
      <Header backIcon="close" backLabel={copy.leave} onBack={() => resetToHome(router)} />

      <View style={styles.body}>
        <FadeIn duration={700}>
          <Text variant="label" tone="subtle" style={{ letterSpacing: 1.2 }}>
            {copy.eyebrow}
          </Text>
        </FadeIn>

        {copy.lines.map((line, index) => (
          <FadeIn key={line} delay={400 + index * 500} duration={900}>
            <Text
              variant={index === 0 ? 'display' : 'bodyLarge'}
              tone={index === 0 ? 'default' : 'muted'}
              style={{ marginTop: index === 0 ? theme.spacing.xl : theme.spacing.lg }}
              accessibilityRole={index === 0 ? 'header' : undefined}
            >
              {line}
            </Text>
          </FadeIn>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', paddingBottom: 24 },
});
