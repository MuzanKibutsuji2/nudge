import React, { useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';

import { Button } from '../components/Button';
import { FadeIn } from '../components/FadeIn';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Timer } from '../components/Timer';
import { focus as copy } from '../constants/copy';
import { chime, settle } from '../lib/feedback';
import { useKeepScreenAwake } from '../lib/keepAwake';
import { useActions, useActiveSession, remainingMs } from '../lib/store';
import { useTheme } from '../lib/theme';

/**
 * The session screen.
 *
 * Remaining time is recomputed from timestamps on every tick, so the countdown
 * stays correct if the phone sleeps, the app is backgrounded, or the JS timer
 * is throttled. Closing the app entirely leaves the session resumable.
 */
export default function Focus() {
  const theme = useTheme();
  const router = useRouter();
  const session = useActiveSession();
  const { pauseSession, resumeSession, endSession } = useActions();

  const [now, setNow] = useState(() => Date.now());
  const [leaving, setLeaving] = useState(false);
  const completedRef = useRef(false);

  useKeepScreenAwake();

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 250);
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') setNow(Date.now());
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  const paused = !!session?.pausedAt;
  const total = (session?.plannedMinutes ?? 0) * 60000;
  const remaining = session ? remainingMs(session, now) : 0;

  const finish = React.useCallback(
    (completed: boolean) => {
      if (completedRef.current) return;
      completedRef.current = true;
      setLeaving(true);

      const sourceTask = session?.sourceTask ?? '';
      const record = endSession({ completed });

      if (completed) {
        chime();
        settle();
      }

      router.replace({
        pathname: '/done',
        params: {
          title: record?.taskTitle ?? '',
          actual: String(record?.actualMinutes ?? 0),
          planned: String(record?.plannedMinutes ?? 0),
          completed: completed ? '1' : '0',
          taskId: record?.taskId ?? '',
          feeling: record?.feeling ?? '',
          task: sourceTask,
        },
      });
    },
    [endSession, router, session]
  );

  useEffect(() => {
    if (!session || paused || completedRef.current) return;
    if (remaining <= 0) finish(true);
  }, [finish, paused, remaining, session]);

  if (!session) {
    // Either the session just ended (we are navigating) or someone deep-linked.
    return leaving ? <View style={{ flex: 1, backgroundColor: theme.colors.calmBg }} /> : <Redirect href="/home" />;
  }

  return (
    <Screen
      background="calm"
      footer={
        <View>
          <Button
            title={paused ? copy.resume : copy.pause}
            variant="secondary"
            onPress={() => (paused ? resumeSession() : pauseSession())}
          />
          <Button
            title={copy.done}
            onPress={() => finish(false)}
            style={{ marginTop: theme.spacing.sm }}
            accessibilityHint="Ends this session and saves what you did"
          />
        </View>
      }
    >
      <View style={styles.body}>
        <FadeIn>
          <Text variant="caption" tone="subtle" center style={{ letterSpacing: 1.2 }}>
            {paused ? copy.paused.toUpperCase() : 'FOCUSING'}
          </Text>

          <Text
            variant="heading"
            center
            style={{ marginTop: theme.spacing.xl, paddingHorizontal: theme.spacing.md }}
          >
            {session.taskTitle}
          </Text>
        </FadeIn>

        <View style={{ marginTop: theme.spacing['4xl'] }}>
          <Timer remaining={remaining} total={total} paused={paused} />
        </View>
      </View>

      <Text variant="caption" tone="subtle" center style={{ marginBottom: theme.spacing.sm }}>
        {copy.leaveHint}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
