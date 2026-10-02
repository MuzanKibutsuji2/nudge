/**
 * Pure time maths for focus sessions.
 *
 * Kept separate from the store so it can be reasoned about (and tested)
 * without React. Everything is derived from wall-clock timestamps, which is
 * what makes a session survive backgrounding, sleeping or an app restart.
 */
import type { ActiveSession } from '../types/session';

export function elapsedMs(session: ActiveSession, now: number = Date.now()): number {
  const started = new Date(session.startedAt).getTime();
  if (Number.isNaN(started)) return 0;
  const pausedNow = session.pausedAt ? now - new Date(session.pausedAt).getTime() : 0;
  return Math.max(0, now - started - session.pausedMs - Math.max(0, pausedNow));
}

export function remainingMs(session: ActiveSession, now: number = Date.now()): number {
  return Math.max(0, session.plannedMinutes * 60000 - elapsedMs(session, now));
}

/** Minutes with one decimal, so a 40 second start is recorded honestly. */
export function sessionMinutes(ms: number): number {
  if (ms <= 0) return 0;
  return Math.round((ms / 60000) * 10) / 10;
}

/**
 * A session left open for far longer than it was meant to last cannot be
 * honestly recorded, so it is dropped instead of invented.
 */
export const RESUME_GRACE_MS = 15 * 60 * 1000;

export function isResumable(session: ActiveSession, now: number = Date.now()): boolean {
  if (!session?.startedAt) return false;
  const over = elapsedMs(session, now) - session.plannedMinutes * 60000;
  return over < RESUME_GRACE_MS;
}
