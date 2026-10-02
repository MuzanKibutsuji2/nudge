import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FadeIn } from '../../components/FadeIn';
import { Header } from '../../components/Header';
import { Screen } from '../../components/Screen';
import { Text } from '../../components/Text';
import { unclutter } from '../../constants/copy';
import { tap } from '../../lib/feedback';
import { resetToHome } from '../../lib/navigation';
import {
  BUCKETS,
  addThought,
  clearUnclutter,
  editThought,
  removeThought,
  setBucket,
  useUnclutter,
  type SortedBucket,
} from '../../lib/unclutter';
import { useTheme } from '../../lib/theme';

const copy = unclutter.sort;

/**
 * Brain Unclutter, part two: optional sorting.
 *
 * Every thought can be moved, edited, deleted or left alone, and the whole
 * screen can be skipped. Nothing is prioritised for the user, and nothing is
 * saved anywhere unless they later choose to turn one into a task.
 */
export default function SortThoughts() {
  const router = useRouter();
  const theme = useTheme();
  const { thoughts } = useUnclutter();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState('');
  const [picking, setPicking] = useState(false);

  const leave = () => {
    clearUnclutter();
    resetToHome(router);
  };

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setDraft(text);
  };

  const commitEdit = () => {
    if (editingId) editThought(editingId, draft);
    setEditingId(null);
    setDraft('');
  };

  const act = (text: string) => {
    router.push({ pathname: '/reset/tiny', params: { task: text } });
  };

  const bucketLabel: Record<SortedBucket, string> = {
    now: copy.counts.now,
    later: copy.counts.later,
    unsure: copy.counts.unsure,
  };

  return (
    <Screen
      scroll
      avoidKeyboard
      footer={
        <View>
          {thoughts.length > 0 ? (
            <Button
              title={picking ? copy.cancelPick : copy.act}
              variant={picking ? 'quiet' : 'secondary'}
              onPress={() => setPicking((value) => !value)}
            />
          ) : null}
          <Button
            title={copy.done}
            onPress={() => router.replace('/reset/after')}
            style={{ marginTop: theme.spacing.sm }}
          />
        </View>
      }
    >
      <Header backIcon="close" backLabel="Leave" onBack={leave} />

      <FadeIn>
        <Text variant="title" accessibilityRole="header">
          {thoughts.length ? copy.title : copy.empty}
        </Text>
        <Text variant="body" tone="muted" style={{ marginTop: theme.spacing.sm }}>
          {thoughts.length ? copy.subtitle : unclutter.privacy}
        </Text>
        {picking ? (
          <Text variant="label" tone="accent" weight="600" style={{ marginTop: theme.spacing.lg }}>
            {copy.pick}
          </Text>
        ) : null}
      </FadeIn>

      <FadeIn delay={100} style={{ marginTop: theme.spacing.xl }}>
        {thoughts.map((thought) => {
          const editing = editingId === thought.id;

          return (
            <Card
              key={thought.id}
              tone="surface"
              onPress={picking ? () => act(thought.text) : undefined}
              accessibilityLabel={picking ? `Start something small for ${thought.text}` : undefined}
              style={{ marginBottom: theme.spacing.md }}
            >
              {editing ? (
                <View>
                  <TextInput
                    value={draft}
                    onChangeText={setDraft}
                    autoFocus
                    multiline
                    selectionColor={theme.colors.accent}
                    accessibilityLabel="Edit this thought"
                    onBlur={commitEdit}
                    style={[
                      theme.typography.body,
                      styles.input,
                      {
                        color: theme.colors.text,
                        backgroundColor: theme.colors.surfaceSunken,
                        borderColor: theme.colors.line,
                        borderRadius: theme.radius.md,
                      },
                    ]}
                  />
                  <Button
                    title={copy.save}
                    size="sm"
                    fullWidth={false}
                    onPress={commitEdit}
                    style={{ marginTop: theme.spacing.md }}
                  />
                </View>
              ) : (
                <View>
                  <Text variant="body">{thought.text}</Text>

                  {!picking ? (
                    <View style={[styles.buckets, { marginTop: theme.spacing.md }]}>
                      {BUCKETS.map((bucket) => {
                        const active = thought.bucket === bucket;
                        return (
                          <Pressable
                            key={bucket}
                            onPress={() => {
                              tap();
                              setBucket(thought.id, bucket);
                            }}
                            accessibilityRole="button"
                            accessibilityState={{ selected: active }}
                            accessibilityLabel={`${bucketLabel[bucket]} — ${thought.text}`}
                            style={({ pressed }) => [
                              styles.bucket,
                              {
                                backgroundColor: active
                                  ? theme.colors.accentSoft
                                  : theme.colors.surfaceAlt,
                                borderColor: active ? theme.colors.accent : 'transparent',
                                borderRadius: theme.radius.pill,
                                opacity: pressed ? 0.7 : 1,
                              },
                            ]}
                          >
                            <Text
                              variant="caption"
                              weight={active ? '600' : '500'}
                              tone={active ? 'accent' : 'muted'}
                            >
                              {bucketLabel[bucket]}
                            </Text>
                          </Pressable>
                        );
                      })}

                      <View style={styles.spacer} />

                      <Pressable
                        onPress={() => {
                          tap();
                          startEdit(thought.id, thought.text);
                        }}
                        hitSlop={10}
                        accessibilityRole="button"
                        accessibilityLabel={`${copy.edit} — ${thought.text}`}
                        style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.5 : 1 }]}
                      >
                        <Feather name="edit-2" size={15} color={theme.colors.textMuted} />
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          tap();
                          removeThought(thought.id);
                        }}
                        hitSlop={10}
                        accessibilityRole="button"
                        accessibilityLabel={`${copy.remove} — ${thought.text}`}
                        style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.5 : 1 }]}
                      >
                        <Feather name="x" size={17} color={theme.colors.textMuted} />
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              )}
            </Card>
          );
        })}
      </FadeIn>

      {!picking ? (
        <FadeIn delay={140}>
          <View style={styles.addRow}>
            <TextInput
              value={adding}
              onChangeText={setAdding}
              placeholder={copy.addPlaceholder}
              placeholderTextColor={theme.colors.textSubtle}
              selectionColor={theme.colors.accent}
              accessibilityLabel={copy.add}
              returnKeyType="done"
              onSubmitEditing={() => {
                addThought(adding);
                setAdding('');
              }}
              style={[
                theme.typography.body,
                styles.addInput,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.line,
                  borderRadius: theme.radius.md,
                },
              ]}
            />
            <Button
              title={copy.add}
              size="md"
              variant="secondary"
              fullWidth={false}
              onPress={() => {
                addThought(adding);
                setAdding('');
              }}
              style={{ marginLeft: theme.spacing.sm }}
            />
          </View>

          <Text variant="caption" tone="subtle" style={{ marginTop: theme.spacing.lg }}>
            {copy.hints.now} · {copy.hints.later} · {copy.hints.unsure}
          </Text>

          <Button
            title={copy.skip}
            variant="quiet"
            size="md"
            onPress={() => router.replace('/reset/after')}
            style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.lg }}
          />
        </FadeIn>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1.5, minHeight: 72, padding: 12, width: '100%' },
  buckets: { flexDirection: 'row', alignItems: 'center' },
  bucket: { paddingHorizontal: 12, paddingVertical: 8, marginRight: 6, borderWidth: 1.5 },
  spacer: { flex: 1 },
  iconBtn: { padding: 8 },
  addRow: { flexDirection: 'row', alignItems: 'center' },
  addInput: { flex: 1, borderWidth: 1.5, paddingHorizontal: 14, minHeight: 48 },
});
