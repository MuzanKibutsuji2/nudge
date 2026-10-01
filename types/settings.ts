/**
 * Settings + onboarding state. All of it lives on the device.
 */

export type ThemePreference = 'light' | 'dark' | 'system';

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
  defaultSessionMinutes: 5,
  sounds: true,
  haptics: true,
  reduceMotion: false,
  onboarded: false,
};
