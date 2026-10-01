import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { FadeIn } from '../../components/FadeIn';
import { Field } from '../../components/Field';
import { Header } from '../../components/Header';
import { Screen } from '../../components/Screen';
import { Text } from '../../components/Text';
import { taskPrompt } from '../../constants/copy';
import { param } from '../../lib/navigation';
import { useTheme } from '../../lib/theme';

/** Step 2: what are you trying to do? Anything goes — it is only a label. */
export default function StuckTask() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const feeling = param(params.feeling);

  const [value, setValue] = useState('');
  const trimmed = value.trim();

  const submit = () => {
    if (!trimmed) return;
    router.push({ pathname: '/stuck/smaller', params: { task: trimmed, feeling } });
  };

  return (
    <Screen
      scroll
      avoidKeyboard
      footer={
        <View>
          <Button title={taskPrompt.cta} onPress={submit} disabled={!trimmed} />
          <Button
            title={taskPrompt.skipTitle}
            variant="quiet"
            size="md"
            onPress={() => router.push('/wall')}
            style={{ marginTop: theme.spacing.xs }}
          />
        </View>
      }
    >
      <Header />

      <FadeIn>
        <Text variant="display" accessibilityRole="header">
          {taskPrompt.title}
        </Text>
        <Text variant="bodyLarge" tone="muted" style={{ marginTop: theme.spacing.sm }}>
          {taskPrompt.subtitle}
        </Text>
      </FadeIn>

      <FadeIn delay={120} style={{ marginTop: theme.spacing['2xl'] }}>
        <Field
          prominent
          value={value}
          onChangeText={setValue}
          placeholder={taskPrompt.placeholder}
          autoFocus
          returnKeyType="go"
          onSubmitEditing={submit}
          maxLength={120}
          accessibilityLabel="What are you trying to do?"
        />
      </FadeIn>

      <FadeIn delay={200} style={{ marginTop: theme.spacing.xl }}>
        <Text variant="caption" tone="subtle" style={{ marginBottom: theme.spacing.md }}>
          Or borrow one of these
        </Text>
        <View style={styles.chips}>
          {taskPrompt.examples.map((example) => (
            <Chip
              key={example}
              label={example}
              showCheck={false}
              selected={trimmed.toLowerCase() === example.toLowerCase()}
              onPress={() => setValue(example)}
            />
          ))}
        </View>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
});
