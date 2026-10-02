import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { FadeIn } from '../../components/FadeIn';
import { Header } from '../../components/Header';
import { MoodCard } from '../../components/MoodCard';
import { Screen } from '../../components/Screen';
import { Text } from '../../components/Text';
import { feelings, stuck } from '../../constants/copy';
import { tap } from '../../lib/feedback';
import { useActions } from '../../lib/store';
import { useTheme } from '../../lib/theme';

/**
 * Step 1 of the main journey. The cards are a vocabulary, not a questionnaire:
 * whatever is chosen is saved as-is and never interpreted back at the user.
 */
export default function Stuck() {
  const theme = useTheme();
  const router = useRouter();
  const { logCheckIn } = useActions();

  const choose = (id: string, label: string) => {
    logCheckIn(label);
    router.push({ pathname: '/stuck/task', params: { feeling: id, feelingLabel: label } });
  };

  return (
    <Screen scroll>
      <Header />

      <FadeIn>
        <Text variant="display" accessibilityRole="header">
          {stuck.title}
        </Text>
        <Text variant="bodyLarge" tone="muted" style={{ marginTop: theme.spacing.sm }}>
          {stuck.subtitle}
        </Text>
      </FadeIn>

      <FadeIn delay={120} style={{ marginTop: theme.spacing['3xl'] }}>
        <Text variant="subheading" accessibilityRole="header">
          {stuck.question}
        </Text>
        <Text variant="caption" tone="subtle" style={{ marginTop: 4, marginBottom: theme.spacing.lg }}>
          {stuck.note}
        </Text>

        {feelings.map((feeling, index) => (
          <FadeIn key={feeling.id} delay={160 + index * 45}>
            <MoodCard
              emoji={feeling.emoji}
              label={feeling.label}
              onPress={() => choose(feeling.id, feeling.label)}
            />
          </FadeIn>
        ))}
      </FadeIn>

      <FadeIn delay={500}>
        <Pressable
          onPress={() => {
            tap();
            router.push('/wall');
          }}
          accessibilityRole="button"
          accessibilityLabel={stuck.wallEntry}
          style={({ pressed }) => [
            styles.wallRow,
            {
              marginTop: theme.spacing.xl,
              borderColor: theme.colors.line,
              borderRadius: theme.radius.lg,
              padding: theme.spacing.lg,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Feather name="moon" size={16} color={theme.colors.textMuted} />
          <Text variant="body" tone="muted" style={{ marginLeft: theme.spacing.md, flex: 1 }}>
            {stuck.wallEntry}
          </Text>
          <Feather name="chevron-right" size={18} color={theme.colors.textSubtle} />
        </Pressable>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
});
