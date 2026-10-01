/**
 * Colours only — no React, no react-native imports.
 *
 * Kept separate from theme.ts so the contrast guarantees below can be checked
 * by a plain node test (see tests/palette.test.ts).
 *
 * Structure: one set of warm neutrals per scheme, plus a swappable accent.
 * Every accent ships a light and a dark version, and every foreground /
 * background pair in here clears WCAG AA (4.5:1) in both schemes.
 */
import type { AccentId } from '../types/settings';

export type ColorScheme = 'light' | 'dark';

export interface Palette {
  /** App background. */
  bg: string;
  /** Cards and raised surfaces. */
  surface: string;
  /** Quieter surface for grouped rows / chips. */
  surfaceAlt: string;
  /** Recessed surface, e.g. inputs. */
  surfaceSunken: string;
  /** Background used by Wall Mode and the focus timer. Tinted by the accent. */
  calmBg: string;

  text: string;
  textMuted: string;
  textSubtle: string;
  /** Text that sits on top of the accent colour. */
  onAccent: string;

  line: string;
  lineStrong: string;

  accent: string;
  accentSoft: string;
  accentSoftText: string;

  /** Gentle "this happened" colour. Never used alone to convey meaning. */
  positive: string;
  warm: string;

  overlay: string;
  shadowColor: string;
}

/** The accent-independent part of each scheme. */
const neutrals: Record<ColorScheme, Omit<Palette, 'accent' | 'accentSoft' | 'accentSoftText' | 'onAccent' | 'calmBg'> & { calmBase: string }> = {
  light: {
    bg: '#FBF8F4',
    surface: '#FFFFFF',
    surfaceAlt: '#F3EEE7',
    surfaceSunken: '#F1EBE2',
    calmBase: '#EFEAE2',

    text: '#221E1A',
    textMuted: '#5C544D',
    textSubtle: '#665E56',

    line: '#EBE3D9',
    lineStrong: '#D6CABA',

    positive: '#35705A',
    warm: '#9A5A2A',

    overlay: 'rgba(34, 30, 26, 0.38)',
    shadowColor: '#2A231B',
  },
  dark: {
    bg: '#131210',
    surface: '#1C1A17',
    surfaceAlt: '#24211C',
    surfaceSunken: '#17150F',
    calmBase: '#0E0D0B',

    text: '#F2EDE6',
    textMuted: '#A79E95',
    textSubtle: '#948B83',

    line: '#2B2722',
    lineStrong: '#3A352E',

    positive: '#7BC4AE',
    warm: '#D6A077',

    overlay: 'rgba(0, 0, 0, 0.55)',
    shadowColor: '#000000',
  },
};

export interface AccentTokens {
  accent: string;
  accentSoft: string;
  accentSoftText: string;
  onAccent: string;
}

export interface AccentDefinition {
  /** Shown next to the swatch, so the choice is never colour-only. */
  label: string;
  light: AccentTokens;
  dark: AccentTokens;
}

/**
 * Keyed by AccentId, so adding an id to the union forces a palette here.
 * Contrast-checked: accent vs every surface, onAccent vs accent,
 * accentSoftText vs accentSoft, and the three text tones vs the tinted calmBg.
 */
export const ACCENT_TOKENS: Record<AccentId, AccentDefinition> = {
  forest: {
    label: 'Forest',
    light: { accent: '#2E6B5E', accentSoft: '#E4EFEB', accentSoftText: '#275A4F', onAccent: '#FFFFFF' },
    dark: { accent: '#7BC4AE', accentSoft: '#1E2B27', accentSoftText: '#9BD7C4', onAccent: '#0E1F1A' },
  },
  blush: {
    label: 'Blush',
    light: { accent: '#A53464', accentSoft: '#F9E7EE', accentSoftText: '#8E2C56', onAccent: '#FFFFFF' },
    dark: { accent: '#F0A4C0', accentSoft: '#2E2026', accentSoftText: '#F5BCD1', onAccent: '#2B0E1B' },
  },
  lavender: {
    label: 'Lavender',
    light: { accent: '#6A4FB3', accentSoft: '#EDE8F8', accentSoftText: '#59419B', onAccent: '#FFFFFF' },
    dark: { accent: '#BCA9F2', accentSoft: '#262236', accentSoftText: '#CCBDF7', onAccent: '#1C1330' },
  },
  ocean: {
    label: 'Ocean',
    light: { accent: '#2A6490', accentSoft: '#E3EDF6', accentSoftText: '#23557C', onAccent: '#FFFFFF' },
    dark: { accent: '#8CC2EA', accentSoft: '#1A242F', accentSoftText: '#A6D1F2', onAccent: '#0B1A26' },
  },
  clay: {
    label: 'Clay',
    light: { accent: '#A2492B', accentSoft: '#F8E7DE', accentSoftText: '#8A3D23', onAccent: '#FFFFFF' },
    dark: { accent: '#E6A47C', accentSoft: '#2E231C', accentSoftText: '#F0B894', onAccent: '#2A1309' },
  },
  ink: {
    label: 'Ink',
    light: { accent: '#3E3932', accentSoft: '#EDE7DE', accentSoftText: '#332F29', onAccent: '#FFFFFF' },
    dark: { accent: '#D8CEC1', accentSoft: '#272420', accentSoftText: '#E4DCD1', onAccent: '#1A1713' },
  },
};

export const DEFAULT_ACCENT: AccentId = 'forest';

/** How much accent is stirred into the calm background. Deliberately faint. */
const CALM_TINT: Record<ColorScheme, number> = { light: 0.05, dark: 0.06 };

function channels(color: string): [number, number, number] {
  const value = color.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

function toHex(rgb: number[]): string {
  return `#${rgb
    .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
}

/** Linear blend of two hex colours. t = 0 keeps a, t = 1 gives b. */
export function mix(a: string, b: string, t: number): string {
  const from = channels(a);
  const to = channels(b);
  return toHex(from.map((v, i) => v + (to[i] - v) * t));
}

export function isAccentId(value: unknown): value is AccentId {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(ACCENT_TOKENS, value);
}

/** Builds the full palette for a scheme + accent. Unknown accents fall back. */
export function buildPalette(scheme: ColorScheme, accent: AccentId = DEFAULT_ACCENT): Palette {
  const { calmBase, ...base } = neutrals[scheme];
  const tokens = (isAccentId(accent) ? ACCENT_TOKENS[accent] : ACCENT_TOKENS[DEFAULT_ACCENT])[scheme];
  return {
    ...base,
    ...tokens,
    calmBg: mix(calmBase, tokens.accent, CALM_TINT[scheme]),
  };
}

/** Convenience for places that only need the default accent (e.g. crash screen). */
export const palettes: Record<ColorScheme, Palette> = {
  light: buildPalette('light'),
  dark: buildPalette('dark'),
};
