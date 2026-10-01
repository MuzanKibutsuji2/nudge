/**
 * Nudge design system.
 *
 * One accent colour, warm neutrals, generous spacing, soft edges.
 * Nothing in here should feel like a dashboard.
 */
import { Platform, TextStyle, ViewStyle } from 'react-native';

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
  /** Background used by Wall Mode and the focus timer. */
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

const light: Palette = {
  bg: '#FBF8F4',
  surface: '#FFFFFF',
  surfaceAlt: '#F3EEE7',
  surfaceSunken: '#F1EBE2',
  calmBg: '#EFEAE2',

  // Contrast checked against bg / surface / surfaceAlt / calmBg:
  // text 13.8:1, textMuted 6.2:1, textSubtle 4.8:1 — all above WCAG AA.
  text: '#221E1A',
  textMuted: '#5C544D',
  textSubtle: '#6E655D',
  onAccent: '#FFFFFF',

  line: '#EBE3D9',
  lineStrong: '#D6CABA',

  accent: '#2E6B5E',
  accentSoft: '#E4EFEB',
  accentSoftText: '#275A4F',

  positive: '#35705A',
  warm: '#9A5A2A',

  overlay: 'rgba(34, 30, 26, 0.38)',
  shadowColor: '#2A231B',
};

const dark: Palette = {
  bg: '#131210',
  surface: '#1C1A17',
  surfaceAlt: '#24211C',
  surfaceSunken: '#17150F',
  calmBg: '#0E0D0B',

  text: '#F2EDE6',
  textMuted: '#A79E95',
  textSubtle: '#948B83',
  onAccent: '#0E1F1A',

  line: '#2B2722',
  lineStrong: '#3A352E',

  accent: '#7BC4AE',
  accentSoft: '#1E2B27',
  accentSoftText: '#9BD7C4',

  positive: '#7BC4AE',
  warm: '#D6A077',

  overlay: 'rgba(0, 0, 0, 0.55)',
  shadowColor: '#000000',
};

export const palettes: Record<ColorScheme, Palette> = { light, dark };

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
  colors: Palette;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadows: ReturnType<typeof makeShadows>;
  motion: typeof motion;
}

export function buildTheme(scheme: ColorScheme): Theme {
  const colors = palettes[scheme];
  return {
    scheme,
    colors,
    spacing,
    radius,
    typography,
    shadows: makeShadows(colors),
    motion,
  };
}
