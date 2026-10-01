import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tap } from '../lib/feedback';
import { useTheme } from '../lib/theme';
import { Text } from './Text';

type FeatherName = React.ComponentProps<typeof Feather>['name'];

const ICONS: Record<string, FeatherName> = {
  home: 'home',
  today: 'sun',
  start: 'play',
  history: 'clock',
  settings: 'settings',
};

const LABELS: Record<string, string> = {
  home: 'Home',
  today: 'Today',
  start: 'Start',
  history: 'History',
  settings: 'Settings',
};

/**
 * Five destinations, with Start raised and filled because starting is the
 * whole point of the app.
 */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.line,
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'web' ? 10 : 6),
        },
      ]}
      accessibilityRole="tablist"
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const name = route.name;
        const label = LABELS[name] ?? name;
        const isStart = name === 'start';

        const onPress = () => {
          tap();
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={isStart ? 'Start something' : label}
            style={styles.item}
          >
            {isStart ? (
              <View
                style={[
                  styles.startButton,
                  { backgroundColor: theme.colors.accent, borderRadius: 26 },
                  theme.shadows.raised,
                ]}
              >
                <Feather name="play" size={21} color={theme.colors.onAccent} style={{ marginLeft: 2 }} />
              </View>
            ) : (
              <Feather
                name={ICONS[name] ?? 'circle'}
                size={21}
                color={focused ? theme.colors.accent : theme.colors.textSubtle}
              />
            )}

            <Text
              variant="caption"
              style={{
                marginTop: isStart ? 5 : 5,
                fontSize: 11,
                color: focused
                  ? theme.colors.accent
                  : isStart
                    ? theme.colors.textMuted
                    : theme.colors.textSubtle,
                fontWeight: focused || isStart ? '600' : '500',
              }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth * 2,
    paddingTop: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 52,
  },
  startButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    marginBottom: -4,
  },
});
