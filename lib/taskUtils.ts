/**
 * Pure helpers for tasks and "small wins".
 * No storage access, no React — easy to reason about and to test.
 */
import type { FocusSession } from '../types/session';
import type { NewTaskInput, Task, TaskSize } from '../types/task';
import { createId } from './id';
import { estimateSize } from './microActions';
import { toPastTense } from './phrasing';
import { dayKey, isToday, startOfDay } from './time';

export function createTask(input: NewTaskInput): Task {
  const title = input.title.trim();
  return {
    id: createId('task'),
    title,
    category: input.category,
    size: input.size ?? estimateSize(title),
    completed: false,
    createdAt: new Date().toISOString(),
    deadline: input.deadline,
    parentId: input.parentId,
  };
}

export function isBigEnoughToBreakDown(task: Task): boolean {
  return task.size === 'large' || task.size === 'medium';
}

export function subtasksOf(tasks: Task[], parentId: string): Task[] {
  return tasks.filter((t) => t.parentId === parentId);
}

export function topLevelTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => !t.parentId);
}

export function openTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => !t.completed);
}

export function completedToday(tasks: Task[]): Task[] {
  return tasks.filter((t) => t.completed && isToday(t.completedAt));
}

/** A task written before today that is still open. Shown gently, never in red. */
export function isCarriedOver(task: Task): boolean {
  if (task.completed) return false;
  const created = new Date(task.createdAt);
  if (Number.isNaN(created.getTime())) return false;
  return created.getTime() < startOfDay().getTime();
}

/**
 * Ordering: open tasks first (newest first), then anything completed today.
 * Subtasks are kept directly under their parent.
 */
export function orderedForToday(tasks: Task[]): Task[] {
  const open = openTasks(tasks);
  const parents = open.filter((t) => !t.parentId);
  const ordered: Task[] = [];
  const byNewest = (a: Task, b: Task) => (a.createdAt < b.createdAt ? 1 : -1);

  for (const parent of [...parents].sort(byNewest)) {
    ordered.push(parent);
    for (const child of subtasksOf(open, parent.id).sort(byNewest)) ordered.push(child);
  }
  // Orphans (parent completed or deleted) still deserve to show up.
  for (const task of open) {
    if (task.parentId && !ordered.includes(task)) ordered.push(task);
  }
  return ordered;
}

export interface Win {
  id: string;
  label: string;
  at: string;
  kind: 'session' | 'task';
  /** e.g. "5 min" — optional detail shown after the label. */
  detail?: string;
}

/**
 * "Today's small wins" = sessions started today + tasks ticked off today.
 * Deliberately not a score, not a count, not a percentage.
 */
export function winsForToday(sessions: FocusSession[], tasks: Task[]): Win[] {
  const todaySessions = sessions.filter((s) => isToday(s.startedAt));
  const todayTasks = completedToday(tasks);

  const wins: Win[] = [
    ...todaySessions.map<Win>((s) => ({
      id: `s_${s.id}`,
      label: toPastTense(s.taskTitle),
      at: s.endedAt ?? s.startedAt,
      kind: 'session',
      detail: s.actualMinutes >= 1 ? `${Math.round(s.actualMinutes)} min` : undefined,
    })),
    ...todayTasks.map<Win>((t) => ({
      id: `t_${t.id}`,
      label: toPastTense(t.title),
      at: t.completedAt ?? t.createdAt,
      kind: 'task',
    })),
  ];

  return wins.sort((a, b) => (a.at < b.at ? 1 : -1));
}

export function sessionsForDay(sessions: FocusSession[], key: string): FocusSession[] {
  return sessions.filter((s) => dayKey(s.startedAt) === key);
}

export function groupSessionsByDay(sessions: FocusSession[]): { key: string; sessions: FocusSession[] }[] {
  const map = new Map<string, FocusSession[]>();
  for (const session of sessions) {
    const key = dayKey(session.startedAt);
    const list = map.get(key);
    if (list) list.push(session);
    else map.set(key, [session]);
  }
  return [...map.entries()]
    .map(([key, list]) => ({
      key,
      sessions: list.sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1)),
    }))
    .sort((a, b) => (a.key < b.key ? 1 : -1));
}

const SIZE_ORDER: TaskSize[] = ['tiny', 'small', 'medium', 'large'];

export function compareSize(a: TaskSize, b: TaskSize): number {
  return SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b);
}

/** Non-judgemental deadline text. Returns undefined when there is nothing to say. */
export function deadlineLabel(deadline?: string): string | undefined {
  if (!deadline) return undefined;
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return undefined;
  const diff = Math.round((startOfDay(date).getTime() - startOfDay().getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Was yesterday';
  if (diff > 1 && diff <= 7) return `In ${diff} days`;
  if (diff < -1) return 'Earlier';
  const month = date.toLocaleString(undefined, { month: 'short' });
  return `${month} ${date.getDate()}`;
}

export const DEADLINE_PRESETS: { id: string; label: string; toISO: () => string | undefined }[] = [
  { id: 'none', label: 'No date', toISO: () => undefined },
  {
    id: 'today',
    label: 'Today',
    toISO: () => startOfDay().toISOString(),
  },
  {
    id: 'tomorrow',
    label: 'Tomorrow',
    toISO: () => {
      const d = startOfDay();
      d.setDate(d.getDate() + 1);
      return d.toISOString();
    },
  },
  {
    id: 'week',
    label: 'This week',
    toISO: () => {
      const d = startOfDay();
      d.setDate(d.getDate() + 7);
      return d.toISOString();
    },
  },
];
