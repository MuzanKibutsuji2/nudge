import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { ACCENT_TOKENS, HIT_SIZE } from '../constants/theme';
import { tap } from '../lib/feedback';
import { useTheme } from '../lib/theme';
import { ACCENT_IDS, type AccentId } from '../types/settings';
import { Text } from './Text';

const SWATCH = 44;

/**
 * Accent colour chooser.
 *
 * Every option is named as well as coloured, and the current one gets a tick
 * plus a ring — nothing here depends on being able to tell colours apart.
 */
export function PalettePicker({
  value,
  onChange,
}: {
  value: AccentId;
  onChange: (value: AccentId) => void;
}) {
  const theme = useTheme();

  return (
    <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel="Colour">
      {ACCENT_IDS.map((id) => {
        const definition = ACCENT_TOKENS[id];
        const tokens = definition[theme.scheme];
        const selected = value === id;

        return (
          <Pressable
            key={id}
            onPress={() => {
              tap();
              onChange(id);
            }}
            accessibilityRole="radio"
            accessibilityState={{ selected, checked: selected }}
            accessibilityLabel={definition.label}
            style={({ pressed }) => [styles.cell, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View
              style={[
                styles.ring,
                {
                  borderColor: selected ? tokens.accent : 'transparent',
                  backgroundColor: selected ? tokens.accentSoft : 'transparent',
                },
              ]}
            >
              <View style={[styles.swatch, { backgroundColor: tokens.accent }]}>
                {selected ? <Feather name="check" size={20} color={tokens.onAccent} /> : null}
              </View>
            </View>
            <Text
              variant="caption"
              tone={selected ? 'default' : 'muted'}
              weight={selected ? '600' : '400'}
              center
              style={{ marginTop: 6 }}
            >
              {definition.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  cell: {
    width: '33.33%',
    minHeight: HIT_SIZE + 24,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  ring: {
    width: SWATCH + 10,
    height: SWATCH + 10,
    borderRadius: (SWATCH + 10) / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatch: {
    width: SWATCH,
    height: SWATCH,
    borderRadius: SWATCH / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
