/**
 * Nudge design system.
 *
 * Warm neutrals, one swappable accent, generous spacing, soft edges.
 * Nothing in here should feel like a dashboard.
 *
 * Colours live in ./palette.ts (no react-native import) so they can be
 * contrast-tested in plain node.
 */
import { Platform, TextStyle, ViewStyle } from 'react-native';

import {
  ACCENT_TOKENS,
  DEFAULT_ACCENT,
  buildPalette,
  isAccentId,
  palettes,
  type ColorScheme,
  type Palette,
} from './palette';
import type { AccentId } from '../types/settings';

export {
  ACCENT_TOKENS,
  DEFAULT_ACCENT,
  buildPalette,
  isAccentId,
  mix,
  palettes,
  type AccentDefinition,
  type AccentTokens,
  type ColorScheme,
  type Palette,
} from './palette';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 56,
  '6xl': 72,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  '2xl': 32,
  pill: 999,
} as const;

/** Minimum tappable size (accessibility). */
export const HIT_SIZE = 48;

export type TypeVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'subheading'
  | 'bodyLarge'
  | 'body'
  | 'label'
  | 'caption'
  | 'timer';

export const typography: Record<TypeVariant, TextStyle> = {
  display: { fontSize: 34, lineHeight: 42, fontWeight: '600', letterSpacing: -0.6 },
  title: { fontSize: 27, lineHeight: 34, fontWeight: '600', letterSpacing: -0.4 },
  heading: { fontSize: 21, lineHeight: 28, fontWeight: '600', letterSpacing: -0.2 },
  subheading: { fontSize: 17, lineHeight: 24, fontWeight: '600', letterSpacing: -0.1 },
  bodyLarge: { fontSize: 18, lineHeight: 28, fontWeight: '400' },
  body: { fontSize: 16, lineHeight: 25, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  timer: {
    fontSize: 72,
    lineHeight: 84,
    fontWeight: '200',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
};

type ShadowName = 'none' | 'soft' | 'card' | 'raised';

export function makeShadows(palette: Palette): Record<ShadowName, ViewStyle> {
  const base = (
    opacity: number,
    radiusPx: number,
    offsetY: number,
    elevation: number
  ): ViewStyle =>
    Platform.select<ViewStyle>({
      android: { elevation, shadowColor: palette.shadowColor },
      default: {
        shadowColor: palette.shadowColor,
        shadowOpacity: opacity,
        shadowRadius: radiusPx,
        shadowOffset: { width: 0, height: offsetY },
      },
    }) as ViewStyle;

  return {
    none: {},
    soft: base(0.05, 10, 3, 1),
    card: base(0.07, 18, 6, 3),
    raised: base(0.12, 26, 10, 8),
  };
}

export const motion = {
  fast: 140,
  base: 240,
  slow: 420,
  /** Used by Wall Mode when lines appear one after another. */
  reveal: 900,
} as const;

/** Content never grows wider than this, so tablets/large phones stay calm. */
export const MAX_CONTENT_WIDTH = 560;

export interface Theme {
  scheme: ColorScheme;
  accent: AccentId;
  colors: Palette;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadows: ReturnType<typeof makeShadows>;
  motion: typeof motion;
}

export function buildTheme(scheme: ColorScheme, accent: AccentId = DEFAULT_ACCENT): Theme {
  const safeAccent = isAccentId(accent) ? accent : DEFAULT_ACCENT;
  const colors = buildPalette(scheme, safeAccent);
  return {
    scheme,
    accent: safeAccent,
    colors,
    spacing,
    radius,
    typography,
    shadows: makeShadows(colors),
    motion,
  };
}
