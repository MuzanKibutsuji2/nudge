import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { HIT_SIZE } from '../constants/theme';
import { tap } from '../lib/feedback';
import { useTheme } from '../lib/theme';
import { Text } from './Text';

export interface HeaderProps {
  title?: string;
  /** Defaults to router.back(). */
  onBack?: () => void;
  showBack?: boolean;
  right?: React.ReactNode;
  /** Label for the back control, e.g. "Leave wall mode". */
  backLabel?: string;
  /** 'close' shows an X instead of a chevron (used by modals). */
  backIcon?: 'chevron' | 'close';
}

export function Header({
  title,
  onBack,
  showBack = true,
  right,
  backLabel = 'Go back',
  backIcon = 'chevron',
}: HeaderProps) {
  const theme = useTheme();
  const router = useRouter();

  const handleBack = () => {
    tap();
    if (onBack) return onBack();
    if (router.canGoBack()) router.back();
    else router.replace('/home');
  };

  return (
    <View style={[styles.row, { marginBottom: theme.spacing.lg }]}>
      {showBack ? (
        <Pressable
          onPress={handleBack}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={backLabel}
          style={({ pressed }) => [
            styles.iconButton,
            {
              backgroundColor: theme.colors.surfaceAlt,
              borderRadius: theme.radius.pill,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Feather
            name={backIcon === 'close' ? 'x' : 'chevron-left'}
            size={20}
            color={theme.colors.text}
          />
        </Pressable>
      ) : (
        <View style={styles.iconButton} />
      )}

      <View style={styles.titleWrap}>
        {title ? (
          <Text variant="label" tone="muted" numberOfLines={1} center>
            {title}
          </Text>
        ) : null}
      </View>

      <View style={styles.iconButton}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: HIT_SIZE - 8,
    height: HIT_SIZE - 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: { flex: 1, paddingHorizontal: 8 },
});
