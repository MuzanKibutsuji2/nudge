import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FadeIn } from '../../components/FadeIn';
import { Field } from '../../components/Field';
import { Screen } from '../../components/Screen';
import { SectionTitle } from '../../components/Section';
import { Text } from '../../components/Text';
import { sitWithMe } from '../../constants/copy';
import { tap } from '../../lib/feedback';
import { useTasks } from '../../lib/store';
import { openTasks, orderedForToday } from '../../lib/taskUtils';
import { useTheme } from '../../lib/theme';

/**
 * The Start tab: for "I know what I need to do".
 * Type it, or pick something already written down — both land in the same
 * "make it smaller" flow.
 */
export default function Start() {
  const theme = useTheme();
  const router = useRouter();
  const tasks = useTasks();

  const [value, setValue] = useState('');
  const trimmed = value.trim();

  const pending = useMemo(() => orderedForToday(openTasks(tasks)).slice(0, 5), [tasks]);

  const go = (task: string, taskId?: string) => {
    if (!task.trim()) return;
    router.push({ pathname: '/stuck/smaller', params: { task: task.trim(), taskId: taskId ?? '' } });
  };

  return (
    <Screen scroll inTabs avoidKeyboard>
      <FadeIn>
        <Text variant="title" accessibilityRole="header">
          Start something
        </Text>
        <Text variant="bodyLarge" tone="muted" style={{ marginTop: theme.spacing.xs }}>
          We&apos;ll break it down before you begin.
        </Text>
      </FadeIn>

      <FadeIn delay={100} style={{ marginTop: theme.spacing['2xl'] }}>
        <Field
          prominent
          value={value}
          onChangeText={setValue}
          placeholder="e.g. Study Physics"
          returnKeyType="go"
          maxLength={120}
          onSubmitEditing={() => go(trimmed)}
          accessibilityLabel="What are you trying to do?"
        />
        <Button
          title="Make it smaller"
          onPress={() => go(trimmed)}
          disabled={!trimmed}
          style={{ marginTop: theme.spacing.md }}
        />
      </FadeIn>

      {pending.length > 0 ? (
        <FadeIn delay={160} style={{ marginTop: theme.spacing['3xl'] }}>
          <SectionTitle title="Something you wrote down" />
          {pending.map((task) => (
            <Card
              key={task.id}
              padded={false}
              onPress={() => go(task.title, task.id)}
              accessibilityLabel={`Start ${task.title}`}
              style={{ marginBottom: theme.spacing.sm }}
            >
              <View style={[styles.row, { padding: theme.spacing.lg }]}>
                <Text variant="body" weight="500" style={styles.rowText} numberOfLines={2}>
                  {task.title}
                </Text>
                <Feather name="arrow-right" size={17} color={theme.colors.textSubtle} />
              </View>
            </Card>
          ))}
        </FadeIn>
      ) : null}

      <FadeIn delay={220} style={{ marginTop: theme.spacing['2xl'] }}>
        <Pressable
          onPress={() => {
            tap();
            router.push('/stuck');
          }}
          accessibilityRole="button"
          accessibilityLabel="I don't know where to start"
          style={({ pressed }) => [
            styles.quietRow,
            {
              borderColor: theme.colors.line,
              borderRadius: theme.radius.lg,
              padding: theme.spacing.lg,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Feather name="help-circle" size={16} color={theme.colors.textMuted} />
          <Text variant="body" tone="muted" style={{ marginLeft: theme.spacing.md, flex: 1 }}>
            I don&apos;t know where to start
          </Text>
          <Feather name="chevron-right" size={18} color={theme.colors.textSubtle} />
        </Pressable>
      </FadeIn>

      <View style={styles.spacer} />

      <FadeIn delay={280} style={{ marginTop: theme.spacing['3xl'] }}>
        <Card
          tone="outline"
          onPress={() => router.push('/sit-with-me')}
          accessibilityLabel="Sit With Me, coming later"
        >
          <View style={styles.row}>
            <Feather name="users" size={16} color={theme.colors.textMuted} />
            <Text variant="label" weight="600" style={{ marginLeft: theme.spacing.md, flex: 1 }}>
              {sitWithMe.title}
            </Text>
            <View
              style={{
                backgroundColor: theme.colors.surfaceAlt,
                borderRadius: theme.radius.pill,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text variant="caption" tone="subtle">
                {sitWithMe.badge}
              </Text>
            </View>
          </View>
        </Card>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  rowText: { flex: 1, marginRight: 12 },
  quietRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  spacer: { flex: 1, minHeight: 16 },
});
