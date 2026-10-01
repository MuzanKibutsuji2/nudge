import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { FadeIn } from '../components/FadeIn';
import { Field } from '../components/Field';
import { Logo, Wordmark } from '../components/Logo';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { TAGLINE, onboarding } from '../constants/copy';
import { FOCUS_AREAS } from '../types/settings';
import { useActions } from '../lib/store';
import { useTheme } from '../lib/theme';

const LAST_STEP = onboarding.steps.length - 1;

export default function Onboarding() {
  const theme = useTheme();
  const router = useRouter();
  const { finishOnboarding } = useActions();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [areas, setAreas] = useState<string[]>([]);

  const current = onboarding.steps[step];

  const next = () => {
    if (step < LAST_STEP) {
      setStep((value) => value + 1);
      return;
    }
    finishOnboarding({ name, focusAreas: areas });
    router.replace('/home');
  };

  const skip = () => {
    if (step === 2) setName('');
    if (step === 3) setAreas([]);
    setStep((value) => Math.min(LAST_STEP, value + 1));
  };

  const toggleArea = (area: string) => {
    setAreas((list) => (list.includes(area) ? list.filter((a) => a !== area) : [...list, area]));
  };

  return (
    <Screen
      avoidKeyboard
      scroll
      footer={
        <View>
          <Button title={current.cta} onPress={next} />
          {step === 2 || step === 3 ? (
            <Button
              title={onboarding.skip}
              variant="quiet"
              size="md"
              onPress={skip}
              style={{ marginTop: theme.spacing.xs }}
            />
          ) : null}
        </View>
      }
    >
      <View style={styles.body}>
        <View style={[styles.dots, { marginBottom: theme.spacing['3xl'] }]}>
          {onboarding.steps.map((_, index) => (
            <View
              key={index}
              accessibilityElementsHidden
              importantForAccessibility="no"
              style={{
                width: index === step ? 18 : 6,
                height: 6,
                borderRadius: 3,
                marginRight: 5,
                backgroundColor: index === step ? theme.colors.accent : theme.colors.lineStrong,
              }}
            />
          ))}
        </View>

        <FadeIn key={step} style={styles.grow}>
          {step === 0 ? (
            <View style={{ marginBottom: theme.spacing['2xl'] }}>
              <Logo size={48} />
              <View style={{ marginTop: theme.spacing.lg }}>
                <Wordmark size={20} />
                <Text variant="label" tone="muted" style={{ marginTop: 4 }}>
                  {TAGLINE}
                </Text>
              </View>
            </View>
          ) : null}

          <Text variant="display" accessibilityRole="header">
            {current.title}
          </Text>
          <Text variant="bodyLarge" tone="muted" style={{ marginTop: theme.spacing.md }}>
            {current.body}
          </Text>

          {step === 2 ? (
            <View style={{ marginTop: theme.spacing['2xl'] }}>
              <Field
                prominent
                placeholder={onboarding.namePlaceholder}
                value={name}
                onChangeText={setName}
                returnKeyType="done"
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={40}
                onSubmitEditing={next}
                hint={onboarding.privacyNote}
              />
            </View>
          ) : null}

          {step === 3 ? (
            <View style={[styles.chips, { marginTop: theme.spacing['2xl'] }]}>
              {FOCUS_AREAS.map((area) => (
                <Chip
                  key={area}
                  label={area}
                  selected={areas.includes(area)}
                  onPress={() => toggleArea(area)}
                />
              ))}
            </View>
          ) : null}

          {step === LAST_STEP ? (
            <View
              style={{
                marginTop: theme.spacing['2xl'],
                padding: theme.spacing.lg,
                borderRadius: theme.radius.lg,
                backgroundColor: theme.colors.accentSoft,
              }}
            >
              <Text variant="body" tone="accent">
                No account. No streaks. Everything stays on this device.
              </Text>
            </View>
          ) : null}
        </FadeIn>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', paddingVertical: 24 },
  grow: { width: '100%' },
  dots: { flexDirection: 'row', alignItems: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
});
