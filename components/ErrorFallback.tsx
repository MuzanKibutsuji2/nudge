import React from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { palettes } from '../constants/theme';

/**
 * Last line of defence. Rendered by expo-router if a screen throws while
 * rendering, so a bug shows a calm way out instead of a blank white screen.
 *
 * Deliberately uses no providers, no context and no app state — it has to work
 * even when something further up has failed.
 */
export function ErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = palettes[scheme];

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text }]}>Something went wrong.</Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>
        That&apos;s on the app, not on you. Nothing you saved has been lost.
      </Text>

      {__DEV__ ? (
        <Text style={[styles.detail, { color: colors.textSubtle }]} numberOfLines={6}>
          {String(error?.message ?? error)}
        </Text>
      ) : null}

      <Pressable
        onPress={retry}
        accessibilityRole="button"
        accessibilityLabel="Try again"
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.accent, opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <Text style={[styles.buttonLabel, { color: colors.onAccent }]}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  title: { fontSize: 27, fontWeight: '600', letterSpacing: -0.4, textAlign: 'center' },
  body: { fontSize: 16, lineHeight: 25, textAlign: 'center', marginTop: 10 },
  detail: { fontSize: 13, lineHeight: 18, textAlign: 'center', marginTop: 18 },
  button: {
    marginTop: 32,
    minHeight: 56,
    paddingHorizontal: 28,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: { fontSize: 17, fontWeight: '600' },
});
