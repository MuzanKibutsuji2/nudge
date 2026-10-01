import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ChoiceCard } from '../../components/ChoiceCard';
import { FadeIn } from '../../components/FadeIn';
import { Logo } from '../../components/Logo';
import { Screen } from '../../components/Screen';
import { Text } from '../../components/Text';
import { WinRow } from '../../components/WinRow';
import { home } from '../../constants/copy';
import { greeting } from '../../constants/copy';
import { tap } from '../../lib/feedback';
import { useActions, useAppState } from '../../lib/store';
import { winsForToday } from '../../lib/taskUtils';
import { useTheme } from '../../lib/theme';

const MAX_WINS_SHOWN = 4;

export default function Home() {
  const theme = useTheme();
  const router = useRouter();
  const { settings, sessions, tasks, activeSession } = useAppState();
  const { endSession } = useActions();

  const wins = useMemo(() => winsForToday(sessions, tasks), [sessions, tasks]);
  const visibleWins = wins.slice(0, MAX_WINS_SHOWN);
  const hiddenCount = Math.max(0, wins.length - visibleWins.length);

  return (
    <Screen scroll inTabs>
      <FadeIn>
        <View style={styles.brandRow}>
          <Logo size={26} />
        </View>
        <Text variant="title" accessibilityRole="header" style={{ marginTop: theme.spacing.lg }}>
          {greeting(new Date(), settings.name)}
        </Text>
        <Text variant="bodyLarge" tone="muted" style={{ marginTop: theme.spacing.xs }}>
          {home.question}
        </Text>
      </FadeIn>

      {activeSession ? (
        <FadeIn delay={60} style={{ marginTop: theme.spacing.xl }}>
          <Card tone="accent">
            <Text variant="label" tone="accent" weight="600">
              {home.resumeTitle}
            </Text>
            <Text variant="body" style={{ marginTop: 4 }} numberOfLines={2}>
              {activeSession.taskTitle}
            </Text>
            <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
              {home.resumeBody}
            </Text>
            <View style={[styles.resumeActions, { marginTop: theme.spacing.lg }]}>
              <Button
                title="Pick it back up"
                size="md"
                fullWidth={false}
                onPress={() => router.push('/focus')}
                style={{ flex: 1 }}
              />
              <Button
                title="End it"
                variant="quiet"
                size="md"
                fullWidth={false}
                onPress={() => endSession()}
                style={{ marginLeft: theme.spacing.sm }}
              />
            </View>
          </Card>
        </FadeIn>
      ) : null}

      <View style={{ marginTop: theme.spacing['2xl'] }}>
        <FadeIn delay={80}>
          <ChoiceCard
            emoji={home.cards.stuck.emoji}
            title={home.cards.stuck.title}
            body={home.cards.stuck.body}
            onPress={() => router.push('/stuck')}
            accessibilityHint="Walks you through making something smaller"
          />
        </FadeIn>
        <FadeIn delay={140}>
          <ChoiceCard
            emoji={home.cards.work.emoji}
            title={home.cards.work.title}
            body={home.cards.work.body}
            onPress={() => router.push('/start')}
            accessibilityHint="Go straight to picking a first step"
          />
        </FadeIn>
        <FadeIn delay={200}>
          <ChoiceCard
            emoji={home.cards.break.emoji}
            title={home.cards.break.title}
            body={home.cards.break.body}
            onPress={() => router.push('/break')}
          />
        </FadeIn>
      </View>

      <FadeIn delay={240}>
        <Pressable
          onPress={() => {
            tap();
            router.push('/wall');
          }}
          accessibilityRole="button"
          accessibilityLabel={home.wallEntry}
          accessibilityHint="A very quiet screen with three small steps"
          style={({ pressed }) => [
            styles.wallRow,
            {
              borderColor: theme.colors.line,
              borderRadius: theme.radius.lg,
              paddingVertical: theme.spacing.lg,
              paddingHorizontal: theme.spacing.lg,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Feather name="moon" size={16} color={theme.colors.textMuted} />
          <Text variant="body" tone="muted" style={{ marginLeft: theme.spacing.md, flex: 1 }}>
            {home.wallEntry}
          </Text>
          <Feather name="chevron-right" size={18} color={theme.colors.textSubtle} />
        </Pressable>
      </FadeIn>

      <FadeIn delay={300} style={{ marginTop: theme.spacing['3xl'] }}>
        <Text variant="subheading" accessibilityRole="header">
          {home.winsTitle}
        </Text>
        <Card tone="alt" style={{ marginTop: theme.spacing.md }}>
          {visibleWins.length === 0 ? (
            <Text variant="body" tone="muted">
              {home.winsEmpty}
            </Text>
          ) : (
            <View>
              {visibleWins.map((win) => (
                <WinRow key={win.id} label={win.label} detail={win.detail} />
              ))}
              {hiddenCount > 0 ? (
                <Text variant="caption" tone="subtle" style={{ marginTop: theme.spacing.sm }}>
                  and {hiddenCount} more
                </Text>
              ) : null}
            </View>
          )}

          <Pressable
            onPress={() => {
              tap();
              router.push('/add-task');
            }}
            accessibilityRole="button"
            accessibilityLabel="Add something to do"
            style={({ pressed }) => [
              styles.addRow,
              {
                marginTop: theme.spacing.lg,
                borderTopColor: theme.colors.line,
                paddingTop: theme.spacing.md,
                opacity: pressed ? 0.6 : 1,
              },
            ]}
          >
            <Feather name="plus" size={16} color={theme.colors.accent} />
            <Text variant="label" tone="accent" weight="600" style={{ marginLeft: 8 }}>
              Add something
            </Text>
          </Pressable>
        </Card>
      </FadeIn>

      <View style={styles.spacer} />

      <Text
        variant="body"
        tone="subtle"
        center
        style={{ marginTop: theme.spacing['3xl'], marginBottom: theme.spacing.lg }}
      >
        {home.footer}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  resumeActions: { flexDirection: 'row', alignItems: 'center' },
  wallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth * 2,
  },
  spacer: { flex: 1, minHeight: 8 },
});
