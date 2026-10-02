import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '../../components/Button';
import { FadeIn } from '../../components/FadeIn';
import { Header } from '../../components/Header';
import { Screen } from '../../components/Screen';
import { Text } from '../../components/Text';
import { unclutter as copy } from '../../constants/copy';
import { resetToHome } from '../../lib/navigation';
import { captureThoughts, clearUnclutter, getUnclutter, setRaw } from '../../lib/unclutter';
import { useTheme } from '../../lib/theme';

/**
 * Brain Unclutter, part one: get it out of your head.
 *
 * Nothing is required — Continue works on an empty box, and the text is held
 * in memory only (see lib/unclutter.ts). Leaving wipes it.
 */
export default function Unclutter() {
  const theme = useTheme();
  const router = useRouter();

  const [text, setText] = useState(() => getUnclutter().raw);

  const exit = () => {
    clearUnclutter();
    resetToHome(router);
  };

  const onContinue = () => {
    captureThoughts(text);
    router.push('/reset/sort');
  };

  const onClear = () => {
    setText('');
    clearUnclutter();
  };

  return (
    <Screen
      scroll
      avoidKeyboard
      footer={
        <View>
          <Button title={copy.continue} onPress={onContinue} />
          <View style={[styles.row, { marginTop: theme.spacing.sm }]}>
            <Button
              title={copy.clear}
              variant="secondary"
              fullWidth={false}
              size="md"
              onPress={onClear}
              style={{ flex: 1 }}
            />
            <Button
              title={copy.exit}
              variant="quiet"
              fullWidth={false}
              size="md"
              onPress={exit}
              style={{ flex: 1, marginLeft: theme.spacing.sm }}
            />
          </View>
        </View>
      }
    >
      <Header backIcon="close" backLabel={copy.exit} onBack={exit} />

      <FadeIn>
        <Text variant="label" tone="subtle" style={{ letterSpacing: 1.2 }}>
          {copy.eyebrow}
        </Text>
        <Text
          variant="title"
          accessibilityRole="header"
          style={{ marginTop: theme.spacing.lg }}
        >
          {copy.title}
        </Text>
        <Text variant="body" tone="muted" style={{ marginTop: theme.spacing.sm }}>
          {copy.subtitle}
        </Text>
      </FadeIn>

      <FadeIn delay={120} style={{ marginTop: theme.spacing.xl }}>
        <TextInput
          value={text}
          onChangeText={(value) => {
            setText(value);
            setRaw(value);
          }}
          placeholder={copy.placeholder}
          placeholderTextColor={theme.colors.textSubtle}
          selectionColor={theme.colors.accent}
          multiline
          textAlignVertical="top"
          autoCorrect
          accessibilityLabel={copy.title}
          style={[
            theme.typography.bodyLarge,
            styles.input,
            {
              color: theme.colors.text,
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.line,
              borderRadius: theme.radius.lg,
              padding: theme.spacing.lg,
            },
          ]}
        />

        <Text variant="caption" tone="subtle" style={{ marginTop: theme.spacing.md }}>
          {copy.privacy}
        </Text>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1.5, minHeight: 220, width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center' },
});
