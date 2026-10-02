import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button } from '../../components/Button';
import { FadeIn } from '../../components/FadeIn';
import { Header } from '../../components/Header';
import { Screen } from '../../components/Screen';
import { Text } from '../../components/Text';
import { action as copy, smaller as smallerCopy } from '../../constants/copy';
import { commit } from '../../lib/feedback';
import { buildPlan, smallerThan } from '../../lib/microActions';
import { numberParam, param } from '../../lib/navigation';
import { useActions, useSettings } from '../../lib/store';
import { useTheme } from '../../lib/theme';

/**
 * Step 4: one action, nothing else on screen.
 * No timer starts here — the point is to get moving physically first.
 */
export default function ActionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const settings = useSettings();
  const { startSession } = useActions();

  const task = param(params.task);
  const feeling = param(params.feeling);
  const taskId = param(params.taskId);

  const plan = useMemo(() => buildPlan(task), [task]);

  const [step, setStep] = useState(() => param(params.step, 'Make a start'));
  const [rank, setRank] = useState(() => numberParam(params.rank, 50));
  const [atFloor, setAtFloor] = useState(false);

  const display = /[.!?]$/.test(step.trim()) ? step.trim() : `${step.trim()}.`;

  const makeSmaller = () => {
    const next = smallerThan(plan, rank);
    if (!next) {
      setAtFloor(true);
      return;
    }
    setStep(next.text);
    setRank(next.rank);
    setAtFloor(false);
  };

  const begin = () => {
    commit();
    startSession({
      taskTitle: step,
      taskId: taskId || undefined,
      plannedMinutes: settings.defaultSessionMinutes,
      feeling: feeling || undefined,
      sourceTask: task || undefined,
    });
    router.replace('/focus');
  };

  return (
    <Screen
      footer={
        <View>
          <Button title={copy.doing} onPress={begin} accessibilityHint="Starts a short session" />
          <Button
            title={copy.smaller}
            variant="secondary"
            onPress={makeSmaller}
            style={{ marginTop: theme.spacing.sm }}
          />
          <Button
            title={copy.other}
            variant="quiet"
            size="md"
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace('/start');
            }}
            style={{ marginTop: theme.spacing.xs }}
          />
        </View>
      }
    >
      <Header />

      <View style={{ flex: 1, justifyContent: 'center', paddingBottom: theme.spacing['3xl'] }}>
        <FadeIn key={step}>
          <Text variant="label" tone="muted">
            {copy.eyebrow}
          </Text>
          <Text
            variant="display"
            accessibilityRole="header"
            style={{ marginTop: theme.spacing.lg, fontSize: display.length > 46 ? 28 : 34, lineHeight: display.length > 46 ? 36 : 42 }}
          >
            {display}
          </Text>
          <Text variant="body" tone="muted" style={{ marginTop: theme.spacing.xl }}>
            {copy.thatsIt}
          </Text>
          {atFloor ? (
            <Text variant="caption" tone="subtle" style={{ marginTop: theme.spacing.md }}>
              {smallerCopy.floor}
            </Text>
          ) : null}
        </FadeIn>
      </View>

      <Text variant="caption" tone="subtle" center style={{ marginBottom: theme.spacing.sm }}>
        {copy.note}
      </Text>
    </Screen>
  );
}
