import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { FadeIn } from '../../components/FadeIn';
import { Screen } from '../../components/Screen';
import { SectionTitle } from '../../components/Section';
import { TaskCard } from '../../components/TaskCard';
import { Text } from '../../components/Text';
import { WinRow } from '../../components/WinRow';
import { today as copy } from '../../constants/copy';
import { tap } from '../../lib/feedback';
import { useActions, useAppState } from '../../lib/store';
import { openTasks, orderedForToday, winsForToday } from '../../lib/taskUtils';
import { useTheme } from '../../lib/theme';

/**
 * Today is a short list of what happened and what might happen.
 * No percentages, no completion rate, nothing turns red.
 */
export default function Today() {
  const theme = useTheme();
  const router = useRouter();
  const { tasks, sessions } = useAppState();
  const { toggleTask } = useActions();

  const wins = useMemo(() => winsForToday(sessions, tasks), [sessions, tasks]);
  const maybe = useMemo(() => orderedForToday(openTasks(tasks)), [tasks]);

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Screen scroll inTabs>
      <FadeIn>
        <Text variant="title" accessibilityRole="header">
          {copy.title}
        </Text>
        <Text variant="body" tone="subtle" style={{ marginTop: 2 }}>
          {dateLabel}
        </Text>
      </FadeIn>

      <FadeIn delay={80} style={{ marginTop: theme.spacing['2xl'] }}>
        <SectionTitle title={copy.didTitle} />
        {wins.length === 0 ? (
          <EmptyState
            title={copy.emptyTitle}
            body={copy.emptyBody}
            actionLabel={copy.emptyCta}
            onAction={() => router.push('/start')}
            compact
          />
        ) : (
          <Card tone="alt">
            {wins.map((win) => (
              <WinRow key={win.id} label={win.label} detail={win.detail} />
            ))}
          </Card>
        )}
      </FadeIn>

      <FadeIn delay={140} style={{ marginTop: theme.spacing['3xl'] }}>
        <SectionTitle
          title={copy.mightTitle}
          action={
            <Pressable
              onPress={() => {
                tap();
                router.push('/add-task');
              }}
              accessibilityRole="button"
              accessibilityLabel={copy.addTask}
              hitSlop={8}
              style={({ pressed }) => [styles.addRow, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Feather name="plus" size={15} color={theme.colors.accent} />
              <Text variant="label" tone="accent" weight="600" style={{ marginLeft: 5 }}>
                Add
              </Text>
            </Pressable>
          }
        />

        {maybe.length === 0 ? (
          <Text variant="body" tone="subtle">
            {copy.mightEmpty}
          </Text>
        ) : (
          maybe.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              indented={!!task.parentId}
              onToggle={() => toggleTask(task.id)}
              onPress={() => router.push(`/task/${task.id}`)}
            />
          ))
        )}
      </FadeIn>

      <View style={styles.spacer} />

      <Text
        variant="body"
        tone="subtle"
        center
        style={{ marginTop: theme.spacing['3xl'], marginBottom: theme.spacing.lg }}
      >
        Tasks carry over. Nothing expires.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  addRow: { flexDirection: 'row', alignItems: 'center', minHeight: 32, paddingHorizontal: 4 },
  spacer: { flex: 1, minHeight: 8 },
});
