/**
 * Haptics + one quiet sound, both opt-out in Settings.
 *
 * Everything is lazily required and wrapped in try/catch: a device without a
 * haptics engine, a browser that blocks autoplay, or a missing native module
 * must never break a flow. Silence is an acceptable outcome.
 */
import { Platform } from 'react-native';

type FeedbackConfig = { haptics: boolean; sounds: boolean };

let config: FeedbackConfig = { haptics: true, sounds: true };

/** Called by the store whenever settings change. */
export function configureFeedback(next: Partial<FeedbackConfig>): void {
  config = { ...config, ...next };
}

const canHaptics = Platform.OS === 'ios' || Platform.OS === 'android';

function withHaptics(fn: (haptics: typeof import('expo-haptics')) => void): void {
  if (!config.haptics || !canHaptics) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const haptics = require('expo-haptics') as typeof import('expo-haptics');
    fn(haptics);
  } catch {
    // no haptics engine — ignore
  }
}

/** A light tap for ordinary choices. */
export function tap(): void {
  withHaptics((h) => h.impactAsync(h.ImpactFeedbackStyle.Light));
}

/** Slightly firmer: committing to an action, starting a session. */
export function commit(): void {
  withHaptics((h) => h.impactAsync(h.ImpactFeedbackStyle.Medium));
}

/** Finishing something. Gentle, not celebratory. */
export function settle(): void {
  withHaptics((h) => h.notificationAsync(h.NotificationFeedbackType.Success));
}

let player: { play: () => void; seekTo: (s: number) => void } | null | undefined;

function getPlayer() {
  if (player !== undefined) return player;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createAudioPlayer } = require('expo-audio');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const source = require('../assets/sounds/chime.wav');
    player = createAudioPlayer(source);
  } catch {
    player = null;
  }
  return player;
}

/** One soft chime when a planned session completes. Never for anything else. */
export function chime(): void {
  if (!config.sounds) return;
  try {
    const p = getPlayer();
    if (!p) return;
    p.seekTo(0);
    p.play();
  } catch {
    // autoplay blocked or audio unavailable — stay quiet
  }
}
