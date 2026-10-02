import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FadeIn } from '../../components/FadeIn';
import { Field } from '../../components/Field';
import { Header } from '../../components/Header';
import { Screen } from '../../components/Screen';
import { Text } from '../../components/Text';
import { smaller as copy } from '../../constants/copy';
import { tap } from '../../lib/feedback';
import { buildPlan, smallerThan, type MicroAction } from '../../lib/microActions';
import { param } from '../../lib/navigation';
import { useTheme } from '../../lib/theme';

/**
 * Step 3: turn one typed sentence into something startable.
 *
 * Two ways down:
 *   - pick one of the suggested first actions
 *   - press "make it even smaller" as many times as you like
 */
export default function Smaller() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  const task = param(params.task).trim();
  const feeling = param(params.feeling);
  const taskId = param(params.taskId);

  const plan = useMemo(() => buildPlan(task), [task]);
  const [trail, setTrail] = useState<MicroAction[]>([]);
  const [customOpen, setCustomOpen] = useState(false);
  const [custom, setCustom] = useState('');

  if (!task) return <Redirect href="/stuck/task" />;

  const currentRank = trail.length > 0 ? trail[trail.length - 1].rank : -1;
  const nextSmaller = smallerThan(plan, currentRank);

  const choose = (text: string, rank: number) => {
    router.push({
      pathname: '/stuck/action',
      params: { task, step: text, rank: String(rank), feeling, taskId },
    });
  };

  const goSmaller = () => {
    if (!nextSmaller) return;
    setTrail((list) => [...list, nextSmaller]);
  };

  const headline = plan.size === 'tiny' ? "That's already small." : copy.title;
  const subline = plan.size === 'tiny' ? "Here's where you could start." : copy.subtitle;

  return (
    <Screen scroll avoidKeyboard>
      <Header />

      <FadeIn>
        <Text variant="display" accessibilityRole="header">
          {headline}
        </Text>
        <Text variant="bodyLarge" tone="muted" style={{ marginTop: theme.spacing.sm }}>
          {subline}
        </Text>

        <View
          style={[
            styles.quote,
            {
              borderLeftColor: theme.colors.lineStrong,
              marginTop: theme.spacing.xl,
              paddingLeft: theme.spacing.lg,
            },
          ]}
        >
          <Text variant="caption" tone="subtle">
            You said
          </Text>
          <Text variant="subheading" weight="500" style={{ marginTop: 2 }}>
            {plan.rawTask}
          </Text>
        </View>
      </FadeIn>

      <FadeIn delay={120} style={{ marginTop: theme.spacing['2xl'] }}>
        <Text variant="label" tone="muted" style={{ marginBottom: theme.spacing.md }}>
          {copy.pick}
        </Text>

        {plan.suggestions.map((suggestion, index) => (
          <FadeIn key={suggestion.id} delay={160 + index * 45}>
            <Card
              onPress={() => choose(suggestion.text, suggestion.rank)}
              padded={false}
              accessibilityLabel={suggestion.text}
              accessibilityHint="Choose this as your one small step"
              style={{ marginBottom: theme.spacing.sm }}
            >
              <View style={[styles.row, { padding: theme.spacing.lg }]}>
                <Text variant="body" weight="500" style={styles.rowText}>
                  {suggestion.text}
                </Text>
                <Feather name="arrow-right" size={17} color={theme.colors.textSubtle} />
              </View>
            </Card>
          </FadeIn>
        ))}

        {customOpen ? (
          <View style={{ marginTop: theme.spacing.sm }}>
            <Field
              value={custom}
              onChangeText={setCustom}
              placeholder="In your own words"
              autoFocus
              maxLength={120}
              returnKeyType="go"
              onSubmitEditing={() => custom.trim() && choose(custom.trim(), 85)}
              accessibilityLabel="Write your own step"
            />
            <Button
              title="Use this one"
              size="md"
              variant="secondary"
              onPress={() => custom.trim() && choose(custom.trim(), 85)}
              disabled={!custom.trim()}
              style={{ marginTop: theme.spacing.sm }}
            />
          </View>
        ) : (
          <Pressable
            onPress={() => {
              tap();
              setCustomOpen(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Write your own step"
            style={({ pressed }) => [styles.customRow, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Feather name="edit-3" size={15} color={theme.colors.textMuted} />
            <Text variant="label" tone="muted" style={{ marginLeft: 8 }}>
              Something else, in my words
            </Text>
          </Pressable>
        )}
      </FadeIn>

      <View
        style={{
          marginTop: theme.spacing['2xl'],
          borderTopWidth: StyleSheet.hairlineWidth * 2,
          borderTopColor: theme.colors.line,
          paddingTop: theme.spacing.xl,
        }}
      >
        {trail.length > 0 ? (
          <View style={{ marginBottom: theme.spacing.lg }}>
            <Text variant="caption" tone="subtle" style={{ marginBottom: theme.spacing.md }}>
              {copy.ladderLabel}
            </Text>

            <Text variant="body" tone="subtle" numberOfLines={1}>
              {plan.rawTask}
            </Text>

            {trail.map((step, index) => {
              const isLast = index === trail.length - 1;
              return (
                <View key={step.id}>
                  <Feather
                    name="arrow-down"
                    size={14}
                    color={theme.colors.textSubtle}
                    style={{ marginVertical: 6, marginLeft: 2 }}
                  />
                  {isLast ? (
                    <FadeIn>
                      <Card tone="accent">
                        <Text variant="heading">{step.text}</Text>
                        <Button
                          title="This one"
                          size="md"
                          onPress={() => choose(step.text, step.rank)}
                          style={{ marginTop: theme.spacing.lg }}
                        />
                      </Card>
                    </FadeIn>
                  ) : (
                    <Text variant="body" tone="subtle">
                      {step.text}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        ) : null}

        <Button
          title={copy.makeSmaller}
          variant={trail.length > 0 ? 'secondary' : 'ghost'}
          onPress={goSmaller}
          disabled={!nextSmaller}
          accessibilityHint="Shows a smaller version of this step"
        />

        {!nextSmaller ? (
          <Text variant="caption" tone="subtle" center style={{ marginTop: theme.spacing.md }}>
            {copy.floor}
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  rowText: { flex: 1, marginRight: 12 },
  quote: { borderLeftWidth: 2 },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    minHeight: 48,
  },
});
