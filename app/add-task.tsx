import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { FadeIn } from '../components/FadeIn';
import { Field } from '../components/Field';
import { Header } from '../components/Header';
import { Screen } from '../components/Screen';
import { SegmentedControl } from '../components/SegmentedControl';
import { Text } from '../components/Text';
import { TASK_CATEGORIES, TASK_SIZES, TASK_SIZE_LABEL, type TaskSize } from '../types/task';
import { estimateSize } from '../lib/microActions';
import { useActions } from '../lib/store';
import { DEADLINE_PRESETS } from '../lib/taskUtils';
import { useTheme } from '../lib/theme';

/** Writing something down should take seconds and commit you to nothing. */
export default function AddTask() {
  const theme = useTheme();
  const router = useRouter();
  const { addTask } = useActions();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [sizeTouched, setSizeTouched] = useState(false);
  const [size, setSize] = useState<TaskSize>('small');
  const [deadlineId, setDeadlineId] = useState('none');

  const trimmed = title.trim();
  const guessed = useMemo(() => estimateSize(trimmed), [trimmed]);
  const effectiveSize = sizeTouched ? size : guessed;

  const save = () => {
    if (!trimmed) return;
    const preset = DEADLINE_PRESETS.find((p) => p.id === deadlineId);
    addTask({
      title: trimmed,
      category,
      size: effectiveSize,
      deadline: preset?.toISO(),
    });
    if (router.canGoBack()) router.back();
    else router.replace('/today');
  };

  return (
    <Screen
      scroll
      avoidKeyboard
      footer={
        <Button title="Save it" onPress={save} disabled={!trimmed} />
      }
    >
      <Header backIcon="close" backLabel="Close" title="Add something" />

      <FadeIn>
        <Field
          prominent
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Study Rotational Motion"
          autoFocus
          maxLength={120}
          returnKeyType="done"
          onSubmitEditing={save}
          accessibilityLabel="What do you want to write down?"
        />
      </FadeIn>

      <FadeIn delay={90} style={{ marginTop: theme.spacing['2xl'] }}>
        <Text variant="label" tone="muted" style={{ marginBottom: theme.spacing.md }}>
          Category
        </Text>
        <View style={styles.chips}>
          {TASK_CATEGORIES.map((item) => (
            <Chip
              key={item}
              label={item}
              selected={category === item}
              onPress={() => setCategory((current) => (current === item ? undefined : item))}
            />
          ))}
        </View>
      </FadeIn>

      <FadeIn delay={140} style={{ marginTop: theme.spacing.xl }}>
        <Text variant="label" tone="muted" style={{ marginBottom: theme.spacing.md }}>
          How big does it feel?
        </Text>
        <SegmentedControl<TaskSize>
          accessibilityLabel="Task size"
          value={effectiveSize}
          onChange={(value) => {
            setSizeTouched(true);
            setSize(value);
          }}
          options={TASK_SIZES.map((item) => ({ value: item, label: TASK_SIZE_LABEL[item] }))}
        />
        {effectiveSize === 'large' || effectiveSize === 'medium' ? (
          <Text variant="caption" tone="subtle" style={{ marginTop: theme.spacing.sm }}>
            You can break this one into smaller pieces after saving.
          </Text>
        ) : null}
      </FadeIn>

      <FadeIn delay={190} style={{ marginTop: theme.spacing.xl }}>
        <Text variant="label" tone="muted" style={{ marginBottom: theme.spacing.md }}>
          When (optional)
        </Text>
        <View style={styles.chips}>
          {DEADLINE_PRESETS.map((preset) => (
            <Chip
              key={preset.id}
              label={preset.label}
              selected={deadlineId === preset.id}
              onPress={() => setDeadlineId(preset.id)}
            />
          ))}
        </View>
        <Text variant="caption" tone="subtle" style={{ marginTop: theme.spacing.sm }}>
          A date is just a note to yourself. Nothing turns red here.
        </Text>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
});
