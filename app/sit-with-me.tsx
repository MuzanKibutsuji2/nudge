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
import { sitWithMe as copy } from '../constants/copy';
import { useTheme } from '../lib/theme';

/**
 * A preview of a future feature. Nothing here is wired to a backend, and the
 * screen says so plainly rather than pretending to work.
 */
export default function SitWithMe() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Screen
      scroll
      footer={
        <Button
          title="Back"
          variant="secondary"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/start'))}
        />
      }
    >
      <Header />

      <FadeIn>
        <View style={styles.titleRow}>
          <Text variant="display" accessibilityRole="header">
            {copy.title}
          </Text>
          <View
            style={{
              backgroundColor: theme.colors.surfaceAlt,
              borderRadius: theme.radius.pill,
              paddingHorizontal: 10,
              paddingVertical: 5,
              marginLeft: theme.spacing.md,
            }}
          >
            <Text variant="caption" tone="muted" weight="600">
              {copy.badge}
            </Text>
          </View>
        </View>

        <Text variant="bodyLarge" tone="muted" style={{ marginTop: theme.spacing.md }}>
          {copy.body}
        </Text>
      </FadeIn>

      <FadeIn delay={120} style={{ marginTop: theme.spacing['2xl'] }}>
        <Text variant="label" tone="muted" style={{ marginBottom: theme.spacing.md }}>
          {copy.presenceTitle}
        </Text>

        <Card>
          <PresenceRow label={copy.youLabel} status={copy.focusing} />
          <View
            style={{
              height: StyleSheet.hairlineWidth * 2,
              backgroundColor: theme.colors.line,
              marginVertical: theme.spacing.lg,
            }}
          />
          <PresenceRow label={copy.friendLabel} status={copy.focusing} />
        </Card>

        <Text variant="caption" tone="subtle" center style={{ marginTop: theme.spacing.md }}>
          {copy.onlyPresence}
        </Text>
      </FadeIn>

      <FadeIn delay={180} style={{ marginTop: theme.spacing['2xl'] }}>
        <Card tone="alt">
          <Text variant="subheading">{copy.neverTitle}</Text>
          {copy.never.map((item) => (
            <View key={item} style={[styles.row, { marginTop: theme.spacing.md }]}>
              <Feather name="eye-off" size={15} color={theme.colors.textMuted} />
              <Text variant="body" tone="muted" style={{ marginLeft: theme.spacing.md, flex: 1 }}>
                {item}
              </Text>
            </View>
          ))}
        </Card>
      </FadeIn>

      <FadeIn delay={240} style={{ marginTop: theme.spacing.xl }}>
        <Text variant="body" tone="muted">
          {copy.optIn}
        </Text>
        <Text variant="caption" tone="subtle" style={{ marginTop: theme.spacing.md }}>
          {copy.notBuilt}
        </Text>
      </FadeIn>
    </Screen>
  );
}

function PresenceRow({ label, status }: { label: string; status: string }) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: theme.colors.accent,
          marginRight: theme.spacing.md,
        }}
      />
      <Text variant="label" weight="600" style={{ letterSpacing: 1, flex: 1 }}>
        {label}
      </Text>
      <Text variant="label" tone="muted">
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
});
