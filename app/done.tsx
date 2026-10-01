import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FadeIn } from '../components/FadeIn';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { finished as copy } from '../constants/copy';
import { numberParam, param, resetToHome } from '../lib/navigation';
import { useActions, useAppState } from '../lib/store';
import { useTheme } from '../lib/theme';
import { formatDuration } from '../lib/time';

/**
 * What happens after a session — the screen that decides whether Nudge feels
 * safe. Stopping early is never framed as failure, and nothing auto-continues.
 */
export default function Done() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { settings, tasks } = useAppState();
  const { startSession, toggleTask } = useActions();

  const title = param(params.title, 'that');
  const task = param(params.task);
  const taskId = param(params.taskId);
  const actual = numberParam(params.actual, 0);
  const planned = numberParam(params.planned, settings.defaultSessionMinutes);
  const completed = param(params.completed) === '1';

  const linkedTask = taskId ? tasks.find((t) => t.id === taskId && !t.completed) : undefined;

  const again = (minutes: number) => {
    startSession({
      taskTitle: title,
      taskId: taskId || undefined,
      plannedMinutes: minutes,
      sourceTask: task || undefined,
    });
    router.replace('/focus');
  };

  const oneMoreTinyThing = () => {
    router.replace({
      pathname: '/stuck/smaller',
      params: { task: task || title, taskId },
    });
  };

  return (
    <Screen background="calm" scroll centered>
      <View style={{ flex: 1, justifyContent: 'center', paddingVertical: theme.spacing['2xl'] }}>
        <FadeIn>
          <Text variant="display" accessibilityRole="header">
            {completed ? copy.fullTitleTemplate(planned) : copy.earlyTitle}
          </Text>
          {!completed ? (
            <Text variant="bodyLarge" tone="muted" style={{ marginTop: theme.spacing.sm }}>
              {copy.earlyBody}
            </Text>
          ) : null}
        </FadeIn>

        <FadeIn delay={120} style={{ marginTop: theme.spacing.xl }}>
          <Card tone="alt">
            <Text variant="body" weight="500" numberOfLines={3}>
              {title}
            </Text>
            <Text variant="caption" tone="subtle" style={{ marginTop: 4 }}>
              {formatDuration(actual)} · {copy.loggedNote}
            </Text>
          </Card>
        </FadeIn>

        <FadeIn delay={200} style={{ marginTop: theme.spacing['2xl'] }}>
          <Text variant="subheading" style={{ marginBottom: theme.spacing.lg }}>
            {copy.fullQuestion}
          </Text>

          {completed ? (
            <View>
              <Button
                title={copy.options.another(settings.defaultSessionMinutes)}
                subtitle={copy.optionNotes.sameThing(settings.defaultSessionMinutes)}
                onPress={() => again(settings.defaultSessionMinutes)}
              />
              <Button
                title={copy.options.takeBreak}
                subtitle={copy.optionNotes.takeBreak}
                variant="secondary"
                onPress={() => router.replace('/break')}
                style={{ marginTop: theme.spacing.sm }}
              />
              <Button
                title={copy.options.finishHere}
                variant="quiet"
                onPress={() => resetToHome(router)}
                style={{ marginTop: theme.spacing.xs }}
              />
            </View>
          ) : (
            <View>
              <Button
                title={copy.options.keepGoing}
                subtitle={copy.optionNotes.sameThing(settings.defaultSessionMinutes)}
                onPress={() => again(settings.defaultSessionMinutes)}
              />
              <Button
                title={copy.options.oneMore}
                subtitle={copy.optionNotes.oneMore}
                variant="secondary"
                onPress={oneMoreTinyThing}
                style={{ marginTop: theme.spacing.sm }}
              />
              <Button
                title={copy.options.takeBreak}
                subtitle={copy.optionNotes.takeBreak}
                variant="secondary"
                onPress={() => router.replace('/break')}
                style={{ marginTop: theme.spacing.sm }}
              />
              <Button
                title={copy.options.doneForNow}
                variant="quiet"
                onPress={() => resetToHome(router)}
                style={{ marginTop: theme.spacing.xs }}
              />
            </View>
          )}

          <Button
            title={copy.explain}
            variant="quiet"
            size="sm"
            onPress={() => router.push('/how-it-works')}
            style={{ marginTop: theme.spacing.sm }}
          />

          {linkedTask ? (
            <Button
              title={`Tick off “${linkedTask.title}”`}
              variant="quiet"
              size="md"
              onPress={() => {
                toggleTask(linkedTask.id);
                resetToHome(router);
              }}
              style={{ marginTop: theme.spacing.md }}
            />
          ) : null}
        </FadeIn>
      </View>
    </Screen>
  );
}
