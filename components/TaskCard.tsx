import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import type { Task } from '../types/task';
import { deadlineLabel, isCarriedOver } from '../lib/taskUtils';
import { useTheme } from '../lib/theme';
import { Checkbox } from './Checkbox';
import { Text } from './Text';

export interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onPress?: () => void;
  /** Subtasks are indented and quieter. */
  indented?: boolean;
}

export function TaskCard({ task, onToggle, onPress, indented }: TaskCardProps) {
  const theme = useTheme();
  const deadline = deadlineLabel(task.deadline);
  const carried = isCarriedOver(task);

  const meta = [
    task.category,
    task.size === 'large' || task.size === 'medium' ? `${task.size} task` : undefined,
    deadline,
    carried ? 'from earlier' : undefined,
  ].filter(Boolean) as string[];

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.sm,
          marginLeft: indented ? theme.spacing.xl : 0,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: theme.colors.line,
        },
      ]}
    >
      <Checkbox
        checked={task.completed}
        onToggle={onToggle}
        label={`${task.completed ? 'Completed' : 'Not done'}: ${task.title}`}
      />

      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={onPress ? `Open ${task.title}` : undefined}
        style={styles.body}
      >
        <Text
          variant="body"
          weight="500"
          tone={task.completed ? 'subtle' : 'default'}
          style={task.completed ? styles.struck : undefined}
        >
          {task.title}
        </Text>
        {meta.length > 0 ? (
          <Text variant="caption" tone="subtle" style={{ marginTop: 3 }}>
            {meta.join(' · ')}
          </Text>
        ) : null}
      </Pressable>

      {onPress ? (
        <Feather name="chevron-right" size={18} color={theme.colors.textSubtle} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  body: { flex: 1, marginLeft: 14, marginRight: 6 },
  struck: { textDecorationLine: 'line-through' },
});
