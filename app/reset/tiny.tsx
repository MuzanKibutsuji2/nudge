import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Checkbox } from '../../components/Checkbox';
import { FadeIn } from '../../components/FadeIn';
import { Header } from '../../components/Header';
import { Screen } from '../../components/Screen';
import { Text } from '../../components/Text';
import { tinyStep as copy } from '../../constants/copy';
import { tap } from '../../lib/feedback';
import { buildPlan, firstStep, smallerThan } from '../../lib/microActions';
import { numberParam, param, resetToHome } from '../../lib/navigation';
import { useActions, useTasks } from '../../lib/store';
import { openTasks } from '../../lib/taskUtils';
import { clearUnclutter } from '../../lib/unclutter';
import { useTheme } from '../../lib/theme';

const MAX_TASKS_SHOWN = 6;

/**
 * One tiny, editable action — then, if they want it, a one or five minute
 * session through the app's existing timer.
 *
 * Tasks are shown as plain titles here: no deadlines, no sizes, no counts,
 * nothing that could land as pressure while someone is still settling.
 */
export default function TinyStepScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const tasks = useTasks();
  const { addTask, startSession } = useActions();

  const incomingTask = param(params.task).trim();
  const incomingRank = numberParam(params.rank, -1);
  const startSmaller = param(params.smaller) === '1';

  const [subject, setSubject] = useState(incomingTask);
  const [typed, setTyped] = useState('');

  const plan = useMemo(() => (subject ? buildPlan(subject) : null), [subject]);

  const initial = useMemo(() => {
    if (!plan) return null;
    if (incomingRank >= 0) {
      const next = startSmaller ? smallerThan(plan, incomingRank) : null;
      return next ?? firstStep(plan);
    }
    return firstStep(plan);
  }, [incomingRank, plan, startSmaller]);

  const [rank, setRank] = useState(initial?.rank ?? 0);
  const [action, setAction] = useState(initial?.text ?? '');
  const [edited, setEdited] = useState(false);
  const [keepTask, setKeepTask] = useState(false);
  const [atFloor, setAtFloor] = useState(false);

  const open = openTasks(tasks).slice(0, MAX_TASKS_SHOWN);

  const choose = (text: string) => {
    const next = buildPlan(text);
    const step = firstStep(next);
    setSubject(text);
    setRank(step.rank);
    setAction(step.text);
    setEdited(false);
    setAtFloor(false);
  };

  const goSmaller = () => {
    if (!plan) return;
    const next = smallerThan(plan, rank);
    if (!next) {
      setAtFloor(true);
      return;
    }
    setRank(next.rank);
    setAction(next.text);
    setEdited(false);
  };

  const begin = (minutes: number) => {
    const title = action.trim() || subject;
    let taskId: string | undefined;
    if (keepTask) taskId = addTask({ title: subject }).id;
    startSession({ taskTitle: title, taskId, plannedMinutes: minutes, sourceTask: subject });
    router.replace('/focus');
  };

  const withoutTimer = () => {
    if (keepTask) addTask({ title: subject });
    router.replace({
      pathname: '/reset/after',
      params: { mode: 'step', task: subject, rank: String(rank) },
    });
  };

  const leave = () => {
    clearUnclutter();
    resetToHome(router);
  };

  /* ---------------- step 1: what are we talking about ---------------- */

  if (!subject || !plan) {
    return (
      <Screen
        scroll
        avoidKeyboard
        footer={
          <View>
            <Button
              title={copy.continue}
              disabled={!typed.trim()}
              onPress={() => choose(typed.trim())}
            />
            <Button
              title={copy.skip}
              variant="quiet"
              size="md"
              onPress={() => router.replace('/reset/after')}
              style={{ marginTop: theme.spacing.xs }}
            />
          </View>
        }
      >
        <Header backIcon="close" backLabel="Leave" onBack={leave} />

        <FadeIn>
          <Text variant="title" accessibilityRole="header">
            {copy.pickTitle}
          </Text>
          <Text variant="body" tone="muted" style={{ marginTop: theme.spacing.sm }}>
            {copy.pickSubtitle}
          </Text>
        </FadeIn>

        {open.length > 0 ? (
          <FadeIn delay={100} style={{ marginTop: theme.spacing['2xl'] }}>
            <Text variant="label" tone="subtle">
              {copy.yourTasks}
            </Text>
            <View style={{ marginTop: theme.spacing.md }}>
              {open.map((task) => (
                <Card
                  key={task.id}
                  tone="surface"
                  onPress={() => choose(task.title)}
                  accessibilityLabel={task.title}
                  style={{ marginBottom: theme.spacing.sm }}
                >
                  <View style={styles.taskRow}>
                    <Text variant="body" style={styles.grow} numberOfLines={2}>
                      {task.title}
                    </Text>
                    <Feather name="chevron-right" size={18} color={theme.colors.textSubtle} />
                  </View>
                </Card>
              ))}
            </View>
          </FadeIn>
        ) : null}

        <FadeIn delay={160} style={{ marginTop: theme.spacing.xl }}>
          <Text variant="label" tone="subtle">
            {copy.somethingElse}
          </Text>
          <TextInput
            value={typed}
            onChangeText={setTyped}
            placeholder={copy.placeholder}
            placeholderTextColor={theme.colors.textSubtle}
            selectionColor={theme.colors.accent}
            returnKeyType="done"
            maxLength={120}
            onSubmitEditing={() => typed.trim() && choose(typed.trim())}
            accessibilityLabel={copy.somethingElse}
            style={[
              theme.typography.bodyLarge,
              styles.input,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.line,
                borderRadius: theme.radius.lg,
                marginTop: theme.spacing.md,
              },
            ]}
          />
        </FadeIn>
      </Screen>
    );
  }

  /* ---------------- step 2: the tiny action ---------------- */

  return (
    <Screen
      scroll
      avoidKeyboard
      footer={
        <View>
          <Button title={copy.startFive} onPress={() => begin(5)} />
          <Button
            title={copy.startOne}
            variant="secondary"
            onPress={() => begin(1)}
            style={{ marginTop: theme.spacing.sm }}
          />
          <Button
            title={copy.noTimer}
            variant="quiet"
            size="md"
            onPress={withoutTimer}
            style={{ marginTop: theme.spacing.xs }}
          />
        </View>
      }
    >
      <Header backIcon="close" backLabel="Leave" onBack={leave} />

      <FadeIn>
        <Text variant="title" accessibilityRole="header">
          {copy.actionTitle}
        </Text>
        <Text variant="body" tone="muted" style={{ marginTop: theme.spacing.sm }}>
          {copy.actionNote}
        </Text>

        <Pressable
          onPress={() => {
            tap();
            setSubject('');
            setTyped('');
          }}
          accessibilityRole="button"
          accessibilityLabel={copy.back}
          hitSlop={8}
          style={({ pressed }) => [styles.subjectRow, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text variant="caption" tone="subtle" numberOfLines={2} style={styles.grow}>
            {subject}
          </Text>
          <Text variant="caption" tone="accent" weight="600">
            {copy.back}
          </Text>
        </Pressable>
      </FadeIn>

      <FadeIn delay={100} style={{ marginTop: theme.spacing.xl }}>
        <Text variant="label" tone="subtle" style={{ marginBottom: theme.spacing.sm }}>
          {copy.label}
        </Text>
        <TextInput
          value={action}
          onChangeText={(value) => {
            setAction(value);
            setEdited(true);
          }}
          multiline
          selectionColor={theme.colors.accent}
          accessibilityLabel={copy.label}
          style={[
            theme.typography.bodyLarge,
            styles.input,
            {
              color: theme.colors.text,
              backgroundColor: theme.colors.surface,
              borderColor: edited ? theme.colors.accent : theme.colors.line,
              borderRadius: theme.radius.lg,
              minHeight: 76,
            },
          ]}
        />

        <Button
          title={copy.smaller}
          variant="secondary"
          size="md"
          onPress={goSmaller}
          style={{ marginTop: theme.spacing.md }}
        />
        {atFloor ? (
          <Text variant="caption" tone="muted" style={{ marginTop: theme.spacing.sm }}>
            {copy.floor}
          </Text>
        ) : null}
      </FadeIn>

      <FadeIn delay={160} style={{ marginTop: theme.spacing.xl }}>
        <Card tone="alt">
          <View style={styles.keepRow}>
            <Checkbox
              checked={keepTask}
              onToggle={() => setKeepTask((value) => !value)}
              label={copy.saveTask}
            />
            {/* The checkbox above carries the label for screen readers; this
                side is just a bigger tap target for the same toggle. */}
            <Pressable
              onPress={() => {
                tap();
                setKeepTask((value) => !value);
              }}
              accessibilityElementsHidden
              importantForAccessibility="no"
              style={({ pressed }) => [styles.keepText, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Text variant="body">{copy.saveTask}</Text>
              <Text variant="caption" tone="subtle" style={{ marginTop: 2 }}>
                {copy.saveTaskNote}
              </Text>
            </Pressable>
          </View>
        </Card>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: '100%',
    minHeight: 56,
  },
  taskRow: { flexDirection: 'row', alignItems: 'center' },
  grow: { flex: 1 },
  subjectRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  keepRow: { flexDirection: 'row', alignItems: 'flex-start' },
  keepText: { flex: 1, marginLeft: 14, paddingVertical: 2 },
});
