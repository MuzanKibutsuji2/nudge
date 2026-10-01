/**
 * Settings + onboarding state. All of it lives on the device.
 */

export type ThemePreference = 'light' | 'dark' | 'system';

/**
 * Accent palettes. Ids are stable (they are written to storage); the human
 * labels and the actual colours live in constants/palette.ts.
 */
export type AccentId = 'forest' | 'blush' | 'lavender' | 'ocean' | 'clay' | 'ink';

/** Display order in Settings. */
export const ACCENT_IDS: AccentId[] = ['forest', 'blush', 'lavender', 'ocean', 'clay', 'ink'];

export type SessionLength = 5 | 10 | 15;

export const SESSION_LENGTHS: SessionLength[] = [5, 10, 15];

/** What the user said they usually want help starting (onboarding step 4). */
export const FOCUS_AREAS = [
  'Studying',
  'Homework',
  'Projects',
  'Coding',
  'Exercise',
  'Personal tasks',
  'Other',
] as const;

export type FocusArea = (typeof FOCUS_AREAS)[number];

export interface Settings {
  /** Optional. Onboarding always allows skipping. */
  name: string;
  focusAreas: string[];
  theme: ThemePreference;
  /** Accent colour used across the app. */
  accent: AccentId;
  defaultSessionMinutes: SessionLength;
  sounds: boolean;
  haptics: boolean;
  /** Forces reduced motion even if the OS does not ask for it. */
  reduceMotion: boolean;
  onboarded: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  name: '',
  focusAreas: [],
  theme: 'system',
  accent: 'forest',
  defaultSessionMinutes: 5,
  sounds: true,
  haptics: true,
  reduceMotion: false,
  onboarded: false,
};
