/**
 * Date/time helpers. All local-time, no libraries, no locale surprises.
 */

export function startOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** "2026-10-01" in local time. Safe for grouping. */
export function dayKey(input: string | Date = new Date()): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return 'unknown';
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** "Today" / "Yesterday" / "October 1" (no year unless it differs). */
export function formatDayLabel(key: string, now: Date = new Date()): string {
  const [y, m, d] = key.split('-').map((part) => Number(part));
  if (!y || !m || !d) return 'Earlier';
  const date = new Date(y, m - 1, d);
  const today = startOfDay(now);
  const diffDays = Math.round((startOfDay(date).getTime() - today.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === -1) return 'Yesterday';
  const base = `${MONTHS[m - 1]} ${d}`;
  return y === now.getFullYear() ? base : `${base}, ${y}`;
}

/** "6:40 PM" */
export function formatTime(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return '';
  let hours = d.getHours();
  const minutes = `${d.getMinutes()}`.padStart(2, '0');
  const suffix = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${suffix}`;
}

/** "04:32" from milliseconds. Never negative. */
export function formatClock(ms: number): string {
  const safe = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${`${minutes}`.padStart(2, '0')}:${`${seconds}`.padStart(2, '0')}`;
}

/** Spoken form for screen readers: "4 minutes 32 seconds remaining". */
export function clockForScreenReader(ms: number): string {
  const safe = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  const parts: string[] = [];
  if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
  parts.push(`${seconds} ${seconds === 1 ? 'second' : 'seconds'}`);
  return `${parts.join(' ')} remaining`;
}

/** Rounds up to the nearest minute, but keeps sub-minute sessions honest. */
export function minutesFromMs(ms: number): number {
  if (ms <= 0) return 0;
  const minutes = ms / 60000;
  if (minutes < 1) return Math.round(minutes * 10) / 10;
  return Math.round(minutes);
}

/** "5 min" / "40 sec" — short, for history rows. */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return 'under a minute';
  if (minutes < 1) return `${Math.round(minutes * 60)} sec`;
  return `${Math.round(minutes)} min`;
}

export function isToday(iso?: string): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return isSameDay(d, new Date());
}
