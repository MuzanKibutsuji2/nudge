import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button } from '../../components/Button';
import { FadeIn } from '../../components/FadeIn';
import { Header } from '../../components/Header';
import { Screen } from '../../components/Screen';
import { Text } from '../../components/Text';
import { resetAfter as copy } from '../../constants/copy';
import { numberParam, param, resetToHome } from '../../lib/navigation';
import { clearUnclutter } from '../../lib/unclutter';
import { useTheme } from '../../lib/theme';

/**
 * What happens after an activity — and after a tiny step.
 *
 * It never assumes the person is ready to study, never asks how they feel now,
 * and every option including "stop" is offered with the same weight.
 */
export default function ResetAfter() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  /** 'step' is the version shown after a tiny step, per the restart flow. */
  const mode = param(params.mode) === 'step' ? 'step' : 'activity';
  const task = param(params.task);
  const rank = numberParam(params.rank, -1);

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
            {mode === 'step' ? copy.stepTitle : copy.title}
          </Text>
          <Text variant="bodyLarge" tone="muted" style={{ marginTop: theme.spacing.sm }}>
            {mode === 'step' ? copy.stepSubtitle : copy.subtitle}
          </Text>
        </FadeIn>

        <FadeIn delay={140} style={{ marginTop: theme.spacing['2xl'] }}>
          {mode === 'step' ? (
            <View>
              <Button
                title={copy.options.continueStep}
                subtitle={copy.notes.continueStep}
                onPress={() =>
                  router.replace({ pathname: '/reset/tiny', params: { task, rank: String(rank) } })
                }
              />
              <Button
                title={copy.options.smaller}
                subtitle={copy.notes.smaller}
                variant="secondary"
                onPress={() =>
                  router.replace({
                    pathname: '/reset/tiny',
                    params: { task, rank: String(rank), smaller: '1' },
                  })
                }
                style={{ marginTop: theme.spacing.sm }}
              />
            </View>
          ) : (
            <View>
              <Button
                title={copy.options.untangle}
                subtitle={copy.notes.untangle}
                variant="secondary"
                onPress={() => router.replace('/reset/unclutter')}
              />
              <Button
                title={copy.options.tiny}
                subtitle={copy.notes.tiny}
                variant="secondary"
                onPress={() => router.replace('/reset/restart')}
                style={{ marginTop: theme.spacing.sm }}
              />
            </View>
          )}

          <Button
            title={copy.options.takeBreak}
            subtitle={copy.notes.takeBreak}
            variant="secondary"
            onPress={() => router.replace('/break')}
            style={{ marginTop: theme.spacing.sm }}
          />
          <Button
            title={copy.options.finish}
            subtitle={copy.notes.finish}
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
