/**
 * Focus session types.
 *
 * Sessions are a record of "I started something", not a productivity metric.
 * A 40 second session is as valid as a 15 minute one.
 */

export interface FocusSession {
  id: string;
  taskId?: string;
  /** The micro-action the user was doing, e.g. "Open your Physics textbook". */
  taskTitle: string;
  plannedMinutes: number;
  actualMinutes: number;
  startedAt: string;
  endedAt?: string;
  /** True when the planned time ran out (rather than the user stopping early). */
  completed: boolean;
  /** Optional feeling captured in the "I'm stuck" flow that led here. */
  feeling?: string;
}

/**
 * A session currently in progress. Persisted so the app can survive being
 * backgrounded, killed or reloaded mid-session. Remaining time is always
 * derived from wall-clock timestamps, never from an in-memory tick count.
 */
export interface ActiveSession {
  id: string;
  taskId?: string;
  taskTitle: string;
  plannedMinutes: number;
  startedAt: string;
  /** ISO timestamp of when the user paused, or null when running. */
  pausedAt?: string | null;
  /** Total milliseconds already spent paused. */
  pausedMs: number;
  feeling?: string;
  /** The bigger thing this micro-action came from, e.g. "Study Physics". */
  sourceTask?: string;
}

export interface CheckIn {
  id: string;
  /** Free-form label of the chosen card, e.g. "I feel blank". Never a diagnosis. */
  feeling: string;
  createdAt: string;
}

/** A break the user took. Kept only so History can show an honest picture. */
export interface BreakRecord {
  id: string;
  minutes: number | null;
  startedAt: string;
}
