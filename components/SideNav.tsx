import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import Constants from 'expo-constants';

import { SIDE_NAV_WIDTH } from '../lib/layout';
import { tap } from '../lib/feedback';
import { useTheme } from '../lib/theme';
import { Logo } from './Logo';
import { Text } from './Text';

type FeatherName = React.ComponentProps<typeof Feather>['name'];

interface NavItem {
  path: string;
  label: string;
  icon: FeatherName;
}

const ITEMS: NavItem[] = [
  { path: '/home', label: 'Home', icon: 'home' },
  { path: '/today', label: 'Today', icon: 'sun' },
  { path: '/start', label: 'Start', icon: 'play' },
  { path: '/history', label: 'History', icon: 'clock' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
];

/**
 * The wide-screen navigation. Same five destinations as the bottom bar, with
 * Start filled in because starting is the whole point.
 */
export function SideNav() {
  const theme = useTheme();
  const pathname = usePathname();

  const go = (path: string) => {
    tap();
    if (pathname !== path) router.navigate(path as never);
  };

  return (
    <View
      style={[
        styles.rail,
        {
          width: SIDE_NAV_WIDTH,
          backgroundColor: theme.colors.surface,
          borderRightColor: theme.colors.line,
          paddingHorizontal: theme.spacing.md,
        },
      ]}
      role="navigation"
      aria-label="Main"
    >
      <View style={[styles.brand, { paddingHorizontal: theme.spacing.sm }]}>
        <Logo size={30} />
        <View style={styles.brandText}>
          <Text variant="heading" style={{ fontSize: 19, letterSpacing: -0.3 }}>
            nudge
          </Text>
          <Text variant="caption" tone="subtle" style={{ fontSize: 11.5, marginTop: 1 }}>
            small steps. no pressure.
          </Text>
        </View>
      </View>

      <View style={styles.items} accessibilityRole="tablist">
        {ITEMS.map((item) => {
          const active = pathname === item.path;
          const isStart = item.path === '/start';

          return (
            <Pressable
              key={item.path}
              onPress={() => go(item.path)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={isStart ? 'Start something' : item.label}
              style={(state) => [
                styles.item,
                {
                  borderRadius: theme.radius.md,
                  paddingHorizontal: theme.spacing.sm,
                  backgroundColor: isStart
                    ? theme.colors.accent
                    : active
                      ? theme.colors.accentSoft
                      : // `hovered` is web-only and missing from the RN types.
                        (state as { hovered?: boolean }).hovered
                        ? theme.colors.surfaceAlt
                        : 'transparent',
                },
              ]}
            >
              <Feather
                name={item.icon}
                size={18}
                color={
                  isStart
                    ? theme.colors.onAccent
                    : active
                      ? theme.colors.accentSoftText
                      : theme.colors.textSubtle
                }
              />
              <Text
                variant="body"
                style={{
                  fontSize: 15,
                  fontWeight: active || isStart ? '600' : '500',
                  color: isStart
                    ? theme.colors.onAccent
                    : active
                      ? theme.colors.accentSoftText
                      : theme.colors.textMuted,
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.foot}>
        <Text variant="caption" tone="subtle" style={styles.footLine}>
          Everything stays on this device.
        </Text>
        <Text variant="caption" tone="subtle" style={styles.footLine}>
          Version {Constants.expoConfig?.version ?? '1.0.0'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    borderRightWidth: StyleSheet.hairlineWidth * 2,
    paddingTop: 26,
    paddingBottom: 20,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 26 },
  brandText: { flexShrink: 1 },
  items: { gap: 2 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 44,
  },
  foot: { marginTop: 'auto', paddingHorizontal: 10, gap: 2 },
  footLine: { fontSize: 11, lineHeight: 16 },
});
