import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ChoiceCard } from '../../components/ChoiceCard';
import { FadeIn } from '../../components/FadeIn';
import { Header } from '../../components/Header';
import { Screen } from '../../components/Screen';
import { Text } from '../../components/Text';
import { reset as copy } from '../../constants/copy';
import { tap } from '../../lib/feedback';
import { resetToHome } from '../../lib/navigation';
import { clearUnclutter } from '../../lib/unclutter';
import { useTheme } from '../../lib/theme';

/**
 * The "I'm overwhelmed" door.
 *
 * Nothing is asked before support is offered: no reason, no rating, no
 * confirmation dialog. Deadlines, counts and anything resembling a statistic
 * are simply not on this side of the app.
 */
export default function Reset() {
  const theme = useTheme();
  const router = useRouter();

  const leave = () => {
    clearUnclutter();
    resetToHome(router);
  };

  return (
    <Screen background="calm" scroll>
      <Header backIcon="close" backLabel={copy.leave} onBack={leave} />

      <View style={styles.body}>
        <FadeIn>
          <Text variant="display" accessibilityRole="header">
            {copy.title}
          </Text>
          <Text variant="bodyLarge" tone="muted" style={{ marginTop: theme.spacing.md }}>
            {copy.subtitle}
          </Text>
        </FadeIn>

        <FadeIn delay={160} style={{ marginTop: theme.spacing['3xl'] }}>
          <ChoiceCard
            title={copy.options.settle.title}
            body={copy.options.settle.body}
            onPress={() => router.push('/reset/room')}
          />
          <ChoiceCard
            title={copy.options.untangle.title}
            body={copy.options.untangle.body}
            onPress={() => router.push('/reset/unclutter')}
          />
          <ChoiceCard
            title={copy.options.moment.title}
            body={copy.options.moment.body}
            onPress={() => router.push('/reset/quiet')}
          />
        </FadeIn>

        <FadeIn delay={260} style={{ marginTop: theme.spacing.xl }}>
          <Text variant="caption" tone="subtle" center>
            {copy.leaveNote}
          </Text>

          <Pressable
            onPress={() => {
              tap();
              router.push('/reset/support');
            }}
            accessibilityRole="button"
            accessibilityLabel={copy.supportLink}
            hitSlop={10}
            style={({ pressed }) => [styles.support, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Text variant="caption" tone="muted" center style={styles.underline}>
              {copy.supportLink}
            </Text>
          </Pressable>
        </FadeIn>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', paddingVertical: 12 },
  support: { marginTop: 18, alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 12 },
  underline: { textDecorationLine: 'underline' },
});
