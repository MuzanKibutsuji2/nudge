import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '../components/Button';
import { FadeIn } from '../components/FadeIn';
import { Header } from '../components/Header';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { breakCopy as copy } from '../constants/copy';
import { chime } from '../lib/feedback';
import { resetToHome } from '../lib/navigation';
import { useActions } from '../lib/store';
import { useTheme } from '../lib/theme';
import { formatClock } from '../lib/time';

type Phase = 'choose' | 'running' | 'untimed' | 'back' | 'notYet';

const PRESETS = [5, 10, 20];

/** A break is a break. No countdown pressure, no "get back to it" nudging. */
export default function BreakScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { logBreak } = useActions();

  const [phase, setPhase] = useState<Phase>('choose');
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (phase !== 'running') return;
    const interval = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'running' || endsAt == null) return;
    if (now >= endsAt) {
      chime();
      setPhase('back');
    }
  }, [endsAt, now, phase]);

  const startTimed = (minutes: number) => {
    logBreak(minutes);
    setEndsAt(Date.now() + minutes * 60000);
    setNow(Date.now());
    setPhase('running');
  };

  const startUntimed = () => {
    logBreak(null);
    setPhase('untimed');
  };

  if (phase === 'choose') {
    return (
      <Screen background="calm" scroll>
        <Header />
        <View style={styles.body}>
          <FadeIn>
            <Text variant="display" accessibilityRole="header">
              {copy.title}
            </Text>
            <Text variant="bodyLarge" tone="muted" style={{ marginTop: theme.spacing.sm }}>
              {copy.subtitle}
            </Text>
          </FadeIn>

          <FadeIn delay={140} style={{ marginTop: theme.spacing['3xl'] }}>
            <Text variant="label" tone="muted" style={{ marginBottom: theme.spacing.md }}>
              {copy.presets}
            </Text>
            {PRESETS.map((minutes, index) => (
              <Button
                key={minutes}
                title={`${minutes} minutes`}
                variant="secondary"
                onPress={() => startTimed(minutes)}
                style={{ marginBottom: theme.spacing.sm }}
                accessibilityHint={index === 0 ? 'Starts a quiet countdown' : undefined}
              />
            ))}
            <Button title={copy.noTimer} variant="ghost" onPress={startUntimed} />
          </FadeIn>
        </View>
      </Screen>
    );
  }

  if (phase === 'running') {
    const remaining = Math.max(0, (endsAt ?? 0) - now);
    return (
      <Screen
        background="calm"
        footer={
          <Button
            title={copy.endBreak}
            variant="quiet"
            onPress={() => {
              setEndsAt(null);
              setPhase('back');
            }}
          />
        }
      >
        <View style={styles.centered}>
          <Text variant="body" tone="muted" center>
            {copy.title}
          </Text>
          <Text variant="timer" center style={{ marginTop: theme.spacing.xl }}>
            {formatClock(remaining)}
          </Text>
        </View>
      </Screen>
    );
  }

  if (phase === 'untimed') {
    return (
      <Screen
        background="calm"
        footer={<Button title="I'm back" onPress={() => setPhase('back')} />}
      >
        <View style={styles.centered}>
          <Text variant="display" center>
            {copy.title}
          </Text>
          <Text variant="body" tone="muted" center style={{ marginTop: theme.spacing.md }}>
            No timer. Come back whenever.
          </Text>
        </View>
      </Screen>
    );
  }

  if (phase === 'notYet') {
    return (
      <Screen
        background="calm"
        footer={
          <View>
            <Button title={copy.fiveMore} variant="secondary" onPress={() => startTimed(5)} />
            <Button
              title="Back to Nudge"
              variant="quiet"
              onPress={() => resetToHome(router)}
              style={{ marginTop: theme.spacing.xs }}
            />
          </View>
        }
      >
        <View style={styles.centered}>
          <FadeIn>
            <Text variant="display" center>
              {copy.notYetBody}
            </Text>
          </FadeIn>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      background="calm"
      footer={
        <View>
          <Button title={copy.yes} onPress={() => resetToHome(router)} />
          <Button
            title={copy.notYet}
            variant="quiet"
            onPress={() => setPhase('notYet')}
            style={{ marginTop: theme.spacing.xs }}
          />
        </View>
      }
    >
      <View style={styles.centered}>
        <FadeIn>
          <Text variant="display" center accessibilityRole="header">
            {copy.backTitle}
          </Text>
        </FadeIn>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', paddingVertical: 24 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
