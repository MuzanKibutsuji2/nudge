import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '../components/Button';
import { FadeIn } from '../components/FadeIn';
import { Field } from '../components/Field';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { wall as copy } from '../constants/copy';
import { tap } from '../lib/feedback';
import { resetToHome } from '../lib/navigation';
import { useTheme } from '../lib/theme';

type Phase = 'intro' | 'steps' | 'ask';

const LINE_DELAY = 1900;

/**
 * Wall Mode: for when even choosing feels like too much.
 *
 * Almost no interface, three physical steps, then one question. These are
 * small practical actions — explicitly not treatment or medical advice.
 */
export default function Wall() {
  const theme = useTheme();
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>('intro');
  const [revealed, setRevealed] = useState(1);
  const [stepIndex, setStepIndex] = useState(0);
  const [task, setTask] = useState('');

  useEffect(() => {
    if (phase !== 'intro') return;
    const done = revealed >= copy.lines.length;
    const timer = setTimeout(
      () => (done ? setPhase('steps') : setRevealed((value) => value + 1)),
      LINE_DELAY
    );
    return () => clearTimeout(timer);
  }, [phase, revealed]);

  const skipAhead = () => {
    if (phase !== 'intro') return;
    if (revealed < copy.lines.length) setRevealed(copy.lines.length);
    else setPhase('steps');
  };

  const nextStep = () => {
    tap();
    if (stepIndex < copy.steps.length - 1) setStepIndex((value) => value + 1);
    else setPhase('ask');
  };

  const leave = (
    <Pressable
      onPress={() => {
        tap();
        resetToHome(router);
      }}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={copy.exit}
      style={({ pressed }) => [styles.leave, { opacity: pressed ? 0.5 : 1 }]}
    >
      <Text variant="caption" tone="subtle">
        {copy.exit}
      </Text>
    </Pressable>
  );

  if (phase === 'intro') {
    return (
      <Screen background="calm">
        <Pressable
          onPress={skipAhead}
          accessibilityRole="button"
          accessibilityLabel="Continue"
          style={styles.fill}
        >
          <View style={styles.introBody}>
            {copy.lines.slice(0, revealed).map((line, index) => (
              <FadeIn key={line} duration={900}>
                <Text
                  variant={index === 0 ? 'display' : 'bodyLarge'}
                  tone={index === 0 ? 'default' : 'muted'}
                  style={{ marginBottom: theme.spacing.xl }}
                >
                  {line}
                </Text>
              </FadeIn>
            ))}
          </View>
        </Pressable>
        {leave}
      </Screen>
    );
  }

  if (phase === 'steps') {
    const step = copy.steps[stepIndex];
    return (
      <Screen
        background="calm"
        footer={
          <View>
            <Button title={copy.stepCta} onPress={nextStep} />
            <Button
              title={copy.skip}
              variant="quiet"
              size="md"
              onPress={nextStep}
              style={{ marginTop: theme.spacing.xs }}
            />
          </View>
        }
      >
        <View style={styles.centerBody}>
          <View style={[styles.dots, { marginBottom: theme.spacing['3xl'] }]}>
            {copy.steps.map((_, index) => (
              <View
                key={index}
                accessibilityElementsHidden
                importantForAccessibility="no"
                style={{
                  width: index === stepIndex ? 16 : 6,
                  height: 6,
                  borderRadius: 3,
                  marginRight: 5,
                  backgroundColor:
                    index <= stepIndex ? theme.colors.accent : theme.colors.lineStrong,
                }}
              />
            ))}
          </View>

          <FadeIn key={step}>
            <Text variant="display" accessibilityRole="header">
              {step}
            </Text>
          </FadeIn>
        </View>

        <Text variant="caption" tone="subtle" center style={{ marginBottom: theme.spacing.sm }}>
          {copy.disclaimer}
        </Text>
        {leave}
      </Screen>
    );
  }

  return (
    <Screen
      background="calm"
      avoidKeyboard
      footer={
        <View>
          <Button
            title={copy.taskCta}
            disabled={!task.trim()}
            onPress={() =>
              router.replace({
                pathname: '/stuck/smaller',
                params: { task: task.trim(), feeling: 'wall' },
              })
            }
          />
          <Button
            title={copy.taskSkip}
            variant="quiet"
            size="md"
            onPress={() => resetToHome(router)}
            style={{ marginTop: theme.spacing.xs }}
          />
        </View>
      }
    >
      <View style={styles.centerBody}>
        <FadeIn>
          <Text variant="title" accessibilityRole="header">
            {copy.taskQuestion}
          </Text>
          <Field
            prominent
            value={task}
            onChangeText={setTask}
            placeholder={copy.taskPlaceholder}
            autoFocus
            maxLength={120}
            returnKeyType="go"
            style={{ marginTop: theme.spacing.xl }}
            onSubmitEditing={() =>
              task.trim() &&
              router.replace({
                pathname: '/stuck/smaller',
                params: { task: task.trim(), feeling: 'wall' },
              })
            }
          />
        </FadeIn>
      </View>
      {leave}
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  introBody: { flex: 1, justifyContent: 'center' },
  centerBody: { flex: 1, justifyContent: 'center' },
  dots: { flexDirection: 'row', alignItems: 'center' },
  leave: {
    position: 'absolute',
    top: 14,
    right: 18,
    padding: 10,
  },
});
