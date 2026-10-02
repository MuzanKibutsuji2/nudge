/**
 * "What helps you start" — purely descriptive patterns from local sessions.
 *
 * Rules:
 *  - never compares days
 *  - never says "better" or "worse"
 *  - stays quiet until there is enough to say something honest
 *  - nothing leaves the device
 */
import type { FocusSession } from '../types/session';
import { toGerund } from './phrasing';
import { dayKey } from './time';

/** Below this we say "keep using Nudge" instead of guessing. */
export const MIN_SESSIONS_FOR_PATTERNS = 3;

export interface Patterns {
  hasEnough: boolean;
  sessionCount: number;
  totalMinutes: number;
  /** e.g. "5–10 minute sessions" */
  durationLabel?: string;
  /** e.g. "6–8 PM" */
  timeWindowLabel?: string;
  /** e.g. "Opening your textbook" */
  firstActionLabel?: string;
}

function mostCommon<T>(items: T[], keyOf: (item: T) => string): { key: string; count: number } | null {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = keyOf(item);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let best: { key: string; count: number } | null = null;
  for (const [key, count] of counts) {
    if (!best || count > best.count) best = { key, count };
  }
  return best;
}

function durationBucket(minutes: number): string {
  if (minutes < 5) return 'short sessions, under 5 minutes';
  if (minutes < 10) return '5–10 minute sessions';
  if (minutes < 20) return '10–20 minute sessions';
  return 'longer sessions, 20 minutes or more';
}

function hourWindow(hour: number): string {
  // Two-hour windows, named the way people talk about them.
  const start = Math.floor(hour / 2) * 2;
  const end = start + 2;
  const fmt = (h: number) => {
    const suffix = h >= 12 && h < 24 ? 'PM' : 'AM';
    const normalized = h % 12 === 0 ? 12 : h % 12;
    return { normalized, suffix };
  };
  const a = fmt(start);
  const b = fmt(end === 24 ? 0 : end);
  if (a.suffix === b.suffix) return `${a.normalized}–${b.normalized} ${b.suffix}`;
  return `${a.normalized} ${a.suffix}–${b.normalized} ${b.suffix}`;
}

export function summarizePatterns(sessions: FocusSession[]): Patterns {
  const valid = sessions.filter((s) => !!s.startedAt);
  const sessionCount = valid.length;
  const totalMinutes = Math.round(valid.reduce((sum, s) => sum + (s.actualMinutes || 0), 0));

  if (sessionCount < MIN_SESSIONS_FOR_PATTERNS) {
    return { hasEnough: false, sessionCount, totalMinutes };
  }

  const durations = mostCommon(valid, (s) => durationBucket(s.actualMinutes || 0));

  const times = mostCommon(valid, (s) => {
    const d = new Date(s.startedAt);
    return Number.isNaN(d.getTime()) ? '' : hourWindow(d.getHours());
  });

  // "First action" = the action that most often opens a day.
  const firstOfDay = new Map<string, FocusSession>();
  for (const session of valid) {
    const key = dayKey(session.startedAt);
    const existing = firstOfDay.get(key);
    if (!existing || session.startedAt < existing.startedAt) firstOfDay.set(key, session);
  }
  const firstActions = mostCommon([...firstOfDay.values()], (s) => s.taskTitle.trim().toLowerCase());
  const firstActionOriginal = firstActions
    ? [...firstOfDay.values()].find((s) => s.taskTitle.trim().toLowerCase() === firstActions.key)
    : undefined;

  return {
    hasEnough: true,
    sessionCount,
    totalMinutes,
    durationLabel: durations?.key,
    timeWindowLabel: times?.key,
    firstActionLabel: firstActionOriginal ? toGerund(firstActionOriginal.taskTitle) : undefined,
  };
}
