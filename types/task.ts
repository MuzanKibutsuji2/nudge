/**
 * Task domain types.
 *
 * A Task is something the user said they want to do. It is intentionally light:
 * Nudge is not a task manager, so there is no priority, no status workflow and
 * no "overdue" concept. Tasks simply exist until the user says otherwise.
 */

export type TaskSize = 'tiny' | 'small' | 'medium' | 'large';

export const TASK_SIZES: TaskSize[] = ['tiny', 'small', 'medium', 'large'];

export const TASK_SIZE_LABEL: Record<TaskSize, string> = {
  tiny: 'Tiny',
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
};

/** Suggested categories. Users are never forced into one. */
export const TASK_CATEGORIES = ['School', 'Personal', 'Work', 'Health', 'Other'] as const;
export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export interface Task {
  id: string;
  title: string;
  category?: string;
  size: TaskSize;
  completed: boolean;
  createdAt: string;
  /** ISO timestamp, set when completed flips to true. */
  completedAt?: string;
  /** ISO date (yyyy-mm-dd) or ISO timestamp. Optional, never used to shame. */
  deadline?: string;
  /** Set when this task was created by breaking a bigger task down. */
  parentId?: string;
}

export interface NewTaskInput {
  title: string;
  category?: string;
  size?: TaskSize;
  deadline?: string;
  parentId?: string;
}
