import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';

import { Card } from '../../components/Card';
import { FadeIn } from '../../components/FadeIn';
import { Logo } from '../../components/Logo';
import { PalettePicker } from '../../components/PalettePicker';
import { Screen } from '../../components/Screen';
import { SegmentedControl } from '../../components/SegmentedControl';
import {
  SettingsBlock,
  SettingsGroup,
  SettingsRow,
  SettingsToggle,
} from '../../components/SettingsRow';
import { Text } from '../../components/Text';
import { APP_NAME, TAGLINE, settings as copy, sitWithMe } from '../../constants/copy';
import { SESSION_LENGTHS, type SessionLength, type ThemePreference } from '../../types/settings';
import { useActions, useAppState } from '../../lib/store';
import { useTheme } from '../../lib/theme';

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { settings, persistenceAvailable } = useAppState();
  const { updateSettings } = useActions();

  const [name, setName] = useState(settings.name);
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <Screen scroll inTabs avoidKeyboard>
      <FadeIn>
        <Text variant="title" accessibilityRole="header">
          {copy.title}
        </Text>
      </FadeIn>

      <FadeIn delay={80} style={{ marginTop: theme.spacing['2xl'] }}>
        <SettingsGroup title={copy.profile}>
          <SettingsBlock label={copy.name} description="Only used to say hello." last>
            <TextInput
              value={name}
              onChangeText={setName}
              onBlur={() => updateSettings({ name: name.trim() })}
              onSubmitEditing={() => updateSettings({ name: name.trim() })}
              placeholder={copy.namePlaceholder}
              placeholderTextColor={theme.colors.textSubtle}
              selectionColor={theme.colors.accent}
              returnKeyType="done"
              maxLength={40}
              accessibilityLabel="Your name"
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
          </SettingsBlock>
        </SettingsGroup>

        <SettingsGroup title={copy.appearance}>
          <SettingsBlock label={copy.theme}>
            <SegmentedControl<ThemePreference>
              accessibilityLabel="Theme"
              value={settings.theme}
              onChange={(value) => updateSettings({ theme: value })}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'system', label: 'System' },
              ]}
            />
          </SettingsBlock>
          <SettingsBlock label={copy.colour} description={copy.colourNote}>
            <PalettePicker
              value={settings.accent}
              onChange={(accent) => updateSettings({ accent })}
            />
          </SettingsBlock>
          <SettingsToggle
            label={copy.reduceMotion}
            description={copy.reduceMotionNote}
            value={settings.reduceMotion}
            onChange={(value) => updateSettings({ reduceMotion: value })}
            last
          />
        </SettingsGroup>

        <SettingsGroup title={copy.focus}>
          <SettingsBlock
            label={copy.sessionLength}
            description="Used when you tap “I'm doing it”."
            last
          >
            <SegmentedControl<SessionLength>
              accessibilityLabel="Default session length"
              value={settings.defaultSessionMinutes}
              onChange={(value) => updateSettings({ defaultSessionMinutes: value })}
              options={SESSION_LENGTHS.map((minutes) => ({
                value: minutes,
                label: `${minutes} min`,
              }))}
            />
          </SettingsBlock>
        </SettingsGroup>

        <SettingsGroup title={copy.feedback}>
          <SettingsToggle
            label={copy.sounds}
            description="One soft chime when a session finishes."
            value={settings.sounds}
            onChange={(value) => updateSettings({ sounds: value })}
          />
          <SettingsToggle
            label={copy.haptics}
            description="Light taps on buttons."
            value={settings.haptics}
            onChange={(value) => updateSettings({ haptics: value })}
            last
          />
        </SettingsGroup>

        <SettingsGroup title={copy.help}>
          <SettingsRow
            label={copy.howItWorks}
            description={copy.howItWorksNote}
            onPress={() => router.push('/how-it-works')}
            last
          />
        </SettingsGroup>

        <SettingsGroup title={copy.later}>
          <SettingsRow
            label={sitWithMe.title}
            description={sitWithMe.badge}
            onPress={() => router.push('/sit-with-me')}
            last
          />
        </SettingsGroup>

        <SettingsGroup title={copy.privacy}>
          <SettingsRow
            label={copy.clearData}
            description="Tasks, sessions, check-ins and settings."
            onPress={() => router.push('/clear-data')}
            destructive
            last
          />
        </SettingsGroup>

        <Text variant="caption" tone="subtle" style={{ marginTop: -theme.spacing.lg, marginBottom: theme.spacing['2xl'], paddingHorizontal: theme.spacing.xs }}>
          {copy.privacyNote}
        </Text>

        {!persistenceAvailable ? (
          <Card tone="alt" style={{ marginBottom: theme.spacing['2xl'] }}>
            <Text variant="label" weight="600">
              Saving is unavailable on this device
            </Text>
            <Text variant="caption" tone="muted" style={{ marginTop: 4 }}>
              Nudge still works, but anything you do now will be forgotten when the app closes.
            </Text>
          </Card>
        ) : null}

        <Card tone="alt">
          <View style={styles.aboutRow}>
            <Logo size={28} />
            <View style={{ marginLeft: theme.spacing.lg, flex: 1 }}>
              <Text variant="subheading">{copy.about}</Text>
              <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
                {TAGLINE}
              </Text>
            </View>
          </View>
          <Text variant="caption" tone="subtle" style={{ marginTop: theme.spacing.lg }}>
            {APP_NAME} {version} · Works offline · No account, no tracking, no ads.
          </Text>
        </Card>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
  },
  aboutRow: { flexDirection: 'row', alignItems: 'center' },
});
