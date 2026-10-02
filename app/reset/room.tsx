import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BreathingCircle, BREATH_MS } from '../../components/BreathingCircle';
import { Button } from '../../components/Button';
import { FadeIn } from '../../components/FadeIn';
import { Header } from '../../components/Header';
import { Screen } from '../../components/Screen';
import { SegmentedControl } from '../../components/SegmentedControl';
import { Text } from '../../components/Text';
import { resetRoom as copy } from '../../constants/copy';
import { tap } from '../../lib/feedback';
import { useKeepScreenAwake } from '../../lib/keepAwake';
import { resetToHome } from '../../lib/navigation';
import { useReducedMotion, useTheme } from '../../lib/theme';

type Mode = 'breath' | 'notice';
type Phase = 'in' | 'out';

/**
 * Reset Room — optional grounding. Everything here can be ignored, paused,
 * hidden or skipped, and nothing moves on by itself.
 */
export default function ResetRoom() {
  const theme = useTheme();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [mode, setMode] = useState<Mode>('breath');
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [showCircle, setShowCircle] = useState(true);
  const [phase, setPhase] = useState<Phase>('in');
  const [promptIndex, setPromptIndex] = useState(0);

  const phaseTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useKeepScreenAwake('reset-room');

  useEffect(() => {
    if (!running) {
      if (phaseTimer.current) clearInterval(phaseTimer.current);
      phaseTimer.current = null;
      return undefined;
    }
    phaseTimer.current = setInterval(
      () => setPhase((value) => (value === 'in' ? 'out' : 'in')),
      BREATH_MS
    );
    return () => {
      if (phaseTimer.current) clearInterval(phaseTimer.current);
      phaseTimer.current = null;
    };
  }, [running]);

  const start = () => {
    setStarted(true);
    setPhase('in');
    setRunning(true);
  };

  const stop = () => {
    setRunning(false);
    setStarted(false);
    setPhase('in');
  };

  const leave = () => resetToHome(router);
  const finish = () => router.replace('/reset/after');

  const prompts = copy.notice.prompts;
  const atEnd = promptIndex >= prompts.length;

  return (
    <Screen
      background="calm"
      scroll
      footer={<Button title={copy.done} variant="secondary" onPress={finish} />}
    >
      <Header backIcon="close" backLabel="Leave" onBack={leave} />

      <FadeIn>
        <Text variant="label" tone="subtle" style={{ letterSpacing: 1.2 }}>
          {copy.eyebrow}
        </Text>
        <View style={{ marginTop: theme.spacing.lg }}>
          <SegmentedControl<Mode>
            accessibilityLabel="Choose an activity"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'breath', label: copy.tabs.breath },
              { value: 'notice', label: copy.tabs.notice },
            ]}
          />
        </View>
      </FadeIn>

      {mode === 'breath' ? (
        <FadeIn key="breath" style={{ marginTop: theme.spacing['2xl'] }}>
          <Text variant="title" accessibilityRole="header">
            {copy.breath.title}
          </Text>
          <Text variant="body" tone="muted" style={{ marginTop: theme.spacing.sm }}>
            {copy.breath.subtitle}
          </Text>

          <View style={[styles.stage, { marginTop: theme.spacing['2xl'] }]}>
            {showCircle ? <BreathingCircle running={running} /> : null}
            <View style={showCircle ? styles.overlay : undefined}>
              <Text
                variant={showCircle ? 'heading' : 'title'}
                tone={showCircle ? 'onAccent' : 'muted'}
                center
                accessibilityLiveRegion="polite"
              >
                {running ? copy.breath[phase] : started ? copy.breath.pause : ' '}
              </Text>
            </View>
          </View>

          {!showCircle ? (
            <Text variant="caption" tone="subtle" center style={{ marginTop: theme.spacing.lg }}>
              {copy.breath.hidden}
            </Text>
          ) : null}

          {reduceMotion && showCircle ? (
            <Text variant="caption" tone="subtle" center style={{ marginTop: theme.spacing.lg }}>
              {copy.breath.reducedMotion}
            </Text>
          ) : null}

          <View style={{ marginTop: theme.spacing['2xl'] }}>
            {!started ? (
              <Button title={copy.breath.start} onPress={start} />
            ) : (
              <View style={styles.controls}>
                <Button
                  title={running ? copy.breath.pause : copy.breath.resume}
                  fullWidth={false}
                  onPress={() => setRunning((value) => !value)}
                  style={{ flex: 1 }}
                />
                <Button
                  title={copy.breath.stop}
                  variant="secondary"
                  fullWidth={false}
                  onPress={stop}
                  style={{ flex: 1, marginLeft: theme.spacing.sm }}
                />
              </View>
            )}

            <Pressable
              onPress={() => {
                tap();
                setShowCircle((value) => !value);
              }}
              accessibilityRole="button"
              accessibilityState={{ checked: !showCircle }}
              hitSlop={10}
              style={({ pressed }) => [styles.quietLink, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Text variant="label" tone="muted">
                {showCircle ? copy.breath.hide : copy.breath.show}
              </Text>
            </Pressable>

            <Text variant="caption" tone="subtle" center style={{ marginTop: theme.spacing.md }}>
              {copy.breath.note}
            </Text>
          </View>
        </FadeIn>
      ) : (
        <FadeIn key="notice" style={{ marginTop: theme.spacing['2xl'] }}>
          <Text variant="title" accessibilityRole="header">
            {copy.notice.title}
          </Text>
          <Text variant="body" tone="muted" style={{ marginTop: theme.spacing.sm }}>
            {copy.notice.subtitle}
          </Text>

          <View
            style={[
              styles.prompt,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radius.xl,
                marginTop: theme.spacing['2xl'],
                padding: theme.spacing['2xl'],
              },
              theme.shadows.soft,
            ]}
          >
            <Text variant="bodyLarge" center accessibilityLiveRegion="polite">
              {atEnd ? copy.notice.end : prompts[promptIndex]}
            </Text>
          </View>

          <View style={{ marginTop: theme.spacing.xl }}>
            {atEnd ? (
              <Button
                title={copy.notice.again}
                variant="secondary"
                onPress={() => setPromptIndex(0)}
              />
            ) : (
              <View>
                <Button
                  title={copy.notice.next}
                  onPress={() => setPromptIndex((value) => value + 1)}
                />
                <Button
                  title={copy.notice.skip}
                  variant="quiet"
                  onPress={() => setPromptIndex((value) => value + 1)}
                  style={{ marginTop: theme.spacing.xs }}
                />
              </View>
            )}
          </View>
        </FadeIn>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stage: { alignItems: 'center', justifyContent: 'center', minHeight: 230 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: { flexDirection: 'row', alignItems: 'center' },
  quietLink: { alignSelf: 'center', marginTop: 14, paddingVertical: 8, paddingHorizontal: 12 },
  prompt: { minHeight: 130, alignItems: 'center', justifyContent: 'center' },
});
