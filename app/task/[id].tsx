import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Checkbox } from '../../components/Checkbox';
import { FadeIn } from '../../components/FadeIn';
import { Header } from '../../components/Header';
import { Screen } from '../../components/Screen';
import { SectionTitle } from '../../components/Section';
import { Text } from '../../components/Text';
import { TASK_SIZE_LABEL } from '../../types/task';
import { buildPlan } from '../../lib/microActions';
import { param } from '../../lib/navigation';
import { useActions, useTasks } from '../../lib/store';
import { deadlineLabel, subtasksOf } from '../../lib/taskUtils';
import { useTheme } from '../../lib/theme';

/** Task detail: start it, break it down, tick it off, or let it go. */
export default function TaskDetail() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = param(params.id);

  const tasks = useTasks();
  const { toggleTask, deleteTask, addSubtasks } = useActions();

  const task = tasks.find((item) => item.id === id);
  const children = useMemo(() => (task ? subtasksOf(tasks, task.id) : []), [task, tasks]);

  const [breakingDown, setBreakingDown] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const plan = useMemo(() => (task ? buildPlan(task.title) : null), [task]);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/today');
  };

  if (!task) {
    return (
      <Screen footer={<Button title="Close" onPress={close} />}>
        <Header backIcon="close" backLabel="Close" />
        <View style={styles.centered}>
          <Text variant="heading" center>
            This one isn&apos;t here any more.
          </Text>
          <Text variant="body" tone="muted" center style={{ marginTop: theme.spacing.sm }}>
            It may have been cleared or deleted.
          </Text>
        </View>
      </Screen>
    );
  }

  const meta = [
    task.category,
    TASK_SIZE_LABEL[task.size],
    deadlineLabel(task.deadline),
  ].filter(Boolean) as string[];

  const addPicked = () => {
    addSubtasks(task.id, picked);
    setPicked([]);
    setBreakingDown(false);
  };

  return (
    <Screen
      scroll
      footer={
        <View>
          <Button
            title="Start this"
            onPress={() =>
              router.replace({
                pathname: '/stuck/smaller',
                params: { task: task.title, taskId: task.id },
              })
            }
          />
          {!breakingDown ? (
            <Button
              title="Make this smaller"
              variant="secondary"
              onPress={() => setBreakingDown(true)}
              style={{ marginTop: theme.spacing.sm }}
            />
          ) : null}
        </View>
      }
    >
      <Header backIcon="close" backLabel="Close" />

      <FadeIn>
        <Text variant="title" accessibilityRole="header">
          {task.title}
        </Text>
        {meta.length > 0 ? (
          <Text variant="caption" tone="subtle" style={{ marginTop: theme.spacing.sm }}>
            {meta.join(' · ')}
          </Text>
        ) : null}

        <View style={[styles.row, { marginTop: theme.spacing.xl }]}>
          <Checkbox
            checked={task.completed}
            onToggle={() => toggleTask(task.id)}
            label={task.completed ? 'Mark as not done' : 'Mark as done'}
          />
          <Text variant="body" style={{ marginLeft: theme.spacing.md }}>
            {task.completed ? 'Done' : 'Mark it done'}
          </Text>
        </View>
      </FadeIn>

      {breakingDown && plan ? (
        <FadeIn style={{ marginTop: theme.spacing['2xl'] }}>
          <SectionTitle title="Pick the pieces that help" />
          <Text variant="caption" tone="subtle" style={{ marginBottom: theme.spacing.md }}>
            They&apos;ll be added under this task. You don&apos;t have to use all of them.
          </Text>

          {plan.suggestions.map((suggestion) => {
            const selected = picked.includes(suggestion.text);
            return (
              <Card
                key={suggestion.id}
                tone={selected ? 'accent' : 'surface'}
                padded={false}
                onPress={() =>
                  setPicked((list) =>
                    selected ? list.filter((t) => t !== suggestion.text) : [...list, suggestion.text]
                  )
                }
                accessibilityLabel={suggestion.text}
                style={{ marginBottom: theme.spacing.sm }}
              >
                <View style={[styles.row, { padding: theme.spacing.lg }]}>
                  <Checkbox
                    checked={selected}
                    size={22}
                    onToggle={() =>
                      setPicked((list) =>
                        selected
                          ? list.filter((t) => t !== suggestion.text)
                          : [...list, suggestion.text]
                      )
                    }
                    label={suggestion.text}
                  />
                  <Text variant="body" style={{ marginLeft: theme.spacing.md, flex: 1 }}>
                    {suggestion.text}
                  </Text>
                </View>
              </Card>
            );
          })}

          <Button
            title={picked.length === 0 ? 'Add steps' : `Add ${picked.length} step${picked.length === 1 ? '' : 's'}`}
            variant="secondary"
            size="md"
            onPress={addPicked}
            disabled={picked.length === 0}
            style={{ marginTop: theme.spacing.sm }}
          />
          <Button
            title="Not now"
            variant="quiet"
            size="md"
            onPress={() => {
              setBreakingDown(false);
              setPicked([]);
            }}
            style={{ marginTop: theme.spacing.xs }}
          />
        </FadeIn>
      ) : null}

      {children.length > 0 ? (
        <FadeIn style={{ marginTop: theme.spacing['2xl'] }}>
          <SectionTitle title="Smaller pieces" />
          {children.map((child) => (
            <View
              key={child.id}
              style={[
                styles.row,
                {
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.radius.lg,
                  borderWidth: StyleSheet.hairlineWidth * 2,
                  borderColor: theme.colors.line,
                  padding: theme.spacing.lg,
                  marginBottom: theme.spacing.sm,
                },
              ]}
            >
              <Checkbox
                checked={child.completed}
                size={22}
                onToggle={() => toggleTask(child.id)}
                label={child.title}
              />
              <Text
                variant="body"
                tone={child.completed ? 'subtle' : 'default'}
                style={[
                  { marginLeft: theme.spacing.md, flex: 1 },
                  child.completed ? styles.struck : null,
                ]}
              >
                {child.title}
              </Text>
            </View>
          ))}
        </FadeIn>
      ) : null}

      <View style={styles.spacer} />

      <View style={{ marginTop: theme.spacing['3xl'] }}>
        {confirmDelete ? (
          <View>
            <Text variant="body" tone="muted" center style={{ marginBottom: theme.spacing.md }}>
              Delete this and its smaller pieces?
            </Text>
            <Button
              title="Yes, delete it"
              variant="secondary"
              size="md"
              onPress={() => {
                deleteTask(task.id);
                close();
              }}
            />
            <Button
              title="Keep it"
              variant="quiet"
              size="md"
              onPress={() => setConfirmDelete(false)}
              style={{ marginTop: theme.spacing.xs }}
            />
          </View>
        ) : (
          <Button
            title="Delete"
            variant="quiet"
            size="md"
            onPress={() => setConfirmDelete(true)}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  struck: { textDecorationLine: 'line-through' },
  spacer: { flex: 1, minHeight: 8 },
});
