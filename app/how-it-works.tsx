import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FadeIn } from '../components/FadeIn';
import { Header } from '../components/Header';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { howItWorks as copy } from '../constants/copy';
import { useTheme } from '../lib/theme';

/** Plain instructions. Reachable from Home, Settings and the last onboarding step. */
export default function HowItWorks() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Screen
      scroll
      footer={
        <Button
          title={copy.cta}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
        />
      }
    >
      <Header />

      <FadeIn>
        <Text variant="title" accessibilityRole="header">
          {copy.title}
        </Text>
        <Text variant="bodyLarge" tone="muted" style={{ marginTop: theme.spacing.sm }}>
          {copy.intro}
        </Text>
      </FadeIn>

      <FadeIn delay={80} style={{ marginTop: theme.spacing['2xl'] }}>
        {copy.steps.map((step, index) => (
          <View key={step.title} style={styles.step}>
            <View
              style={[
                styles.number,
                {
                  backgroundColor: theme.colors.accentSoft,
                  borderRadius: theme.radius.pill,
                  marginRight: theme.spacing.lg,
                },
              ]}
            >
              <Text variant="label" tone="accent" weight="600">
                {index + 1}
              </Text>
            </View>
            <View style={styles.stepBody}>
              <Text variant="subheading">{step.title}</Text>
              <Text variant="body" tone="muted" style={{ marginTop: 2 }}>
                {step.body}
              </Text>
            </View>
          </View>
        ))}
      </FadeIn>

      <FadeIn delay={140} style={{ marginTop: theme.spacing.xl }}>
        <Text variant="subheading" accessibilityRole="header">
          {copy.afterTitle}
        </Text>
        <Text variant="caption" tone="subtle" style={{ marginTop: 4 }}>
          {copy.afterNote}
        </Text>
        <Card tone="alt" style={{ marginTop: theme.spacing.md }}>
          {copy.after.map((item, index) => (
            <View
              key={item.label}
              style={[
                index > 0 && {
                  marginTop: theme.spacing.lg,
                  paddingTop: theme.spacing.lg,
                  borderTopWidth: StyleSheet.hairlineWidth * 2,
                  borderTopColor: theme.colors.line,
                },
              ]}
            >
              <Text variant="body" weight="600">
                “{item.label}”
              </Text>
              <Text variant="body" tone="muted" style={{ marginTop: 2 }}>
                {item.body}
              </Text>
            </View>
          ))}
        </Card>
      </FadeIn>

      <FadeIn delay={200} style={{ marginTop: theme.spacing['2xl'] }}>
        <Text variant="subheading" accessibilityRole="header">
          {copy.restTitle}
        </Text>
        <View style={{ marginTop: theme.spacing.md }}>
          {copy.rest.map((item) => (
            <View key={item.label} style={[styles.row, { marginBottom: theme.spacing.md }]}>
              <Text variant="body" weight="600" style={styles.rowLabel}>
                {item.label}
              </Text>
              <Text variant="body" tone="muted" style={styles.rowBody}>
                {item.body}
              </Text>
            </View>
          ))}
        </View>
      </FadeIn>

      <FadeIn delay={260} style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing.xl }}>
        <Card tone="accent">
          <Text variant="label" tone="accent" weight="600">
            {copy.promisesTitle}
          </Text>
          {copy.promises.map((promise) => (
            <View key={promise} style={[styles.promise, { marginTop: theme.spacing.md }]}>
              <Feather
                name="check"
                size={16}
                color={theme.colors.accent}
                style={{ marginRight: theme.spacing.sm, marginTop: 4 }}
              />
              <Text variant="body" style={styles.promiseText}>
                {promise}
              </Text>
            </View>
          ))}
        </Card>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  step: { flexDirection: 'row', marginBottom: 22 },
  number: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  stepBody: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  rowLabel: { width: 78 },
  rowBody: { flex: 1 },
  promise: { flexDirection: 'row', alignItems: 'flex-start' },
  promiseText: { flex: 1 },
});
