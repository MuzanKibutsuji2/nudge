import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { FadeIn } from '../../components/FadeIn';
import { Screen } from '../../components/Screen';
import { Text } from '../../components/Text';
import { history as copy } from '../../constants/copy';
import { summarizePatterns } from '../../lib/analytics';
import { useSessions } from '../../lib/store';
import { groupSessionsByDay } from '../../lib/taskUtils';
import { useTheme } from '../../lib/theme';
import { formatDayLabel, formatDuration, formatTime } from '../../lib/time';

/**
 * A plain record of sessions. No streaks, no ranking, no comparison between
 * days — the only question it answers is "what did I actually do?".
 */
export default function History() {
  const theme = useTheme();
  const router = useRouter();
  const sessions = useSessions();

  const days = useMemo(() => groupSessionsByDay(sessions), [sessions]);
  const patterns = useMemo(() => summarizePatterns(sessions), [sessions]);

  return (
    <Screen scroll inTabs>
      <FadeIn>
        <Text variant="title" accessibilityRole="header">
          {copy.title}
        </Text>
        <Text variant="body" tone="subtle" style={{ marginTop: 2 }}>
          {copy.subtitle}
        </Text>
      </FadeIn>

      {days.length === 0 ? (
        <FadeIn delay={80} style={{ marginTop: theme.spacing['2xl'] }}>
          <EmptyState
            title={copy.emptyTitle}
            body={copy.emptyBody}
            actionLabel="Start one tiny thing"
            onAction={() => router.push('/start')}
          />
        </FadeIn>
      ) : (
        <FadeIn delay={80} style={{ marginTop: theme.spacing['2xl'] }}>
          {days.map((day, dayIndex) => (
            <View
              key={day.key}
              style={{ marginBottom: theme.spacing['2xl'] }}
              accessibilityRole="summary"
            >
              <Text
                variant="label"
                tone="muted"
                weight="600"
                style={{ marginBottom: theme.spacing.md }}
                accessibilityRole="header"
              >
                {formatDayLabel(day.key)}
              </Text>

              <Card padded={false} tone={dayIndex === 0 ? 'surface' : 'alt'}>
                {day.sessions.map((session, index) => (
                  <View
                    key={session.id}
                    style={[
                      styles.row,
                      {
                        paddingHorizontal: theme.spacing.lg,
                        paddingVertical: theme.spacing.md,
                        borderBottomWidth: index === day.sessions.length - 1 ? 0 : StyleSheet.hairlineWidth * 2,
                        borderBottomColor: theme.colors.line,
                      },
                    ]}
                  >
                    <Text variant="body" weight="600" style={{ width: 62 }}>
                      {formatDuration(session.actualMinutes)}
                    </Text>
                    <Text variant="body" style={styles.title} numberOfLines={2}>
                      {session.taskTitle}
                    </Text>
                    <Text variant="caption" tone="subtle">
                      {formatTime(session.startedAt)}
                    </Text>
                  </View>
                ))}
              </Card>
            </View>
          ))}
        </FadeIn>
      )}

      <FadeIn delay={160} style={{ marginTop: theme.spacing.md }}>
        <Card tone="accent">
          <Text variant="subheading" accessibilityRole="header">
            {copy.patternsTitle}
          </Text>

          {!patterns.hasEnough ? (
            <Text variant="body" tone="muted" style={{ marginTop: theme.spacing.sm }}>
              {copy.patternsEmpty}
            </Text>
          ) : (
            <View style={{ marginTop: theme.spacing.lg }}>
              {patterns.durationLabel ? (
                <PatternLine label="You tend to start most often with" value={patterns.durationLabel} />
              ) : null}
              {patterns.timeWindowLabel ? (
                <PatternLine label="Most common starting time" value={patterns.timeWindowLabel} />
              ) : null}
              {patterns.firstActionLabel ? (
                <PatternLine label="Most common first action" value={patterns.firstActionLabel} />
              ) : null}
              <Text variant="caption" tone="muted" style={{ marginTop: theme.spacing.md }}>
                {copy.sessionsLabel(patterns.sessionCount)} ·{' '}
                {copy.minutesLabel(patterns.totalMinutes)} · stays on this device
              </Text>
            </View>
          )}
        </Card>
      </FadeIn>
    </Screen>
  );
}

function PatternLine({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={{ marginBottom: theme.spacing.lg }}>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Text variant="subheading" weight="600" style={{ marginTop: 2 }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 48 },
  title: { flex: 1, marginRight: 10 },
});
