import assert from 'node:assert/strict';
import test from 'node:test';

import { summarizePatterns } from '../lib/analytics';
import { elapsedMs, isResumable, remainingMs, sessionMinutes } from '../lib/sessionTime';
import { groupSessionsByDay, winsForToday } from '../lib/taskUtils';
import { formatClock, formatDayLabel, formatDuration } from '../lib/time';
import type { ActiveSession, FocusSession } from '../types/session';
import type { Task } from '../types/task';

const minutesAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString();

const active = (over: Partial<ActiveSession> = {}): ActiveSession => ({
  id: 's1',
  taskTitle: 'Open your Physics textbook',
  plannedMinutes: 5,
  startedAt: minutesAgo(2),
  pausedAt: null,
  pausedMs: 0,
  ...over,
});

test('remaining time comes from the clock, not from ticks', () => {
  const session = active({ startedAt: minutesAgo(2) });
  assert.ok(Math.abs(remainingMs(session) - 3 * 60000) < 1500);
});

test('paused time does not count', () => {
  const session = active({ startedAt: minutesAgo(4), pausedAt: minutesAgo(3) });
  // 1 minute ran, then paused for 3 — 4 minutes should remain.
  assert.ok(Math.abs(remainingMs(session) - 4 * 60000) < 1500);
});

test('a session started in the future cannot produce negative time', () => {
  const session = active({ startedAt: new Date(Date.now() + 60000).toISOString() });
  assert.equal(elapsedMs(session), 0);
  assert.equal(remainingMs(session), 5 * 60000);
});

test('a corrupt timestamp does not crash the timer', () => {
  const session = active({ startedAt: 'not-a-date' });
  assert.equal(elapsedMs(session), 0);
});

test('short sessions are recorded honestly, not rounded away', () => {
  assert.equal(sessionMinutes(40000), 0.7);
  assert.equal(sessionMinutes(0), 0);
  assert.equal(sessionMinutes(5 * 60000), 5);
});

test('a forgotten session is resumable for a while, then dropped', () => {
  assert.equal(isResumable(active({ startedAt: minutesAgo(6) })), true);
  assert.equal(isResumable(active({ startedAt: minutesAgo(60) })), false);
});

test('today\u2019s wins mix sessions and ticked-off tasks, newest first', () => {
  const sessions: FocusSession[] = [
    {
      id: 'a',
      taskTitle: 'Read one page',
      plannedMinutes: 5,
      actualMinutes: 5,
      startedAt: minutesAgo(30),
      endedAt: minutesAgo(25),
      completed: true,
    },
    {
      id: 'b',
      taskTitle: 'Last week',
      plannedMinutes: 5,
      actualMinutes: 5,
      startedAt: minutesAgo(60 * 24 * 7),
      completed: true,
    },
  ];
  const tasks: Task[] = [
    {
      id: 't1',
      title: 'Opened Physics notes',
      size: 'tiny',
      completed: true,
      createdAt: minutesAgo(90),
      completedAt: minutesAgo(5),
    },
    { id: 't2', title: 'Not done', size: 'small', completed: false, createdAt: minutesAgo(90) },
  ];

  const wins = winsForToday(sessions, tasks);
  assert.deepEqual(
    wins.map((w) => w.label),
    ['Opened Physics notes', 'Read one page']
  );
});

test('history groups by day, newest day first', () => {
  const sessions: FocusSession[] = [
    { id: 'a', taskTitle: 'x', plannedMinutes: 5, actualMinutes: 5, startedAt: minutesAgo(10), completed: true },
    { id: 'b', taskTitle: 'y', plannedMinutes: 5, actualMinutes: 5, startedAt: minutesAgo(60 * 30), completed: true },
  ];
  const days = groupSessionsByDay(sessions);
  assert.equal(days.length, 2);
  assert.ok(days[0].key > days[1].key);
});

test('patterns stay quiet until there is enough to say', () => {
  const two: FocusSession[] = [1, 2].map((n) => ({
    id: `s${n}`,
    taskTitle: 'Open your Physics textbook',
    plannedMinutes: 5,
    actualMinutes: 5,
    startedAt: minutesAgo(n * 60),
    completed: true,
  }));
  assert.equal(summarizePatterns(two).hasEnough, false);
  assert.equal(summarizePatterns([]).hasEnough, false);
});

test('patterns describe, they do not judge', () => {
  const base = new Date();
  base.setHours(19, 0, 0, 0);
  const sessions: FocusSession[] = [0, 1, 2, 3].map((n) => {
    const started = new Date(base);
    started.setDate(started.getDate() - n);
    return {
      id: `s${n}`,
      taskTitle: 'Open your Physics textbook',
      plannedMinutes: 5,
      actualMinutes: 6,
      startedAt: started.toISOString(),
      completed: true,
    };
  });

  const patterns = summarizePatterns(sessions);
  assert.equal(patterns.hasEnough, true);
  assert.equal(patterns.durationLabel, '5–10 minute sessions');
  assert.equal(patterns.timeWindowLabel, '6–8 PM');
  assert.equal(patterns.firstActionLabel, 'Opening your Physics textbook');
  assert.equal(patterns.sessionCount, 4);
});

test('clock and duration formatting', () => {
  assert.equal(formatClock(272000), '04:32');
  assert.equal(formatClock(-5), '00:00');
  assert.equal(formatDuration(0.7), '42 sec');
  assert.equal(formatDuration(5), '5 min');
  assert.equal(formatDayLabel(dayKeyFor(0)), 'Today');
  assert.equal(formatDayLabel(dayKeyFor(-1)), 'Yesterday');
});

function dayKeyFor(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}
