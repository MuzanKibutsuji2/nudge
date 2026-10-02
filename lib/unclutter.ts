/**
 * Brain Unclutter's scratch space.
 *
 * Deliberately NOT part of the persisted app state and never written to
 * AsyncStorage: what someone dumps out of their head here lives in memory for
 * as long as the app is open, and disappears when it closes. The only way any
 * of it becomes permanent is if the user explicitly turns one thought into a
 * task, which goes through the normal task system.
 */
import { useSyncExternalStore } from 'react';

export type Bucket = 'none' | 'now' | 'later' | 'unsure';

/** The three the user can choose. 'none' means "left alone". */
export type SortedBucket = Exclude<Bucket, 'none'>;

export const BUCKETS: SortedBucket[] = ['now', 'later', 'unsure'];

export interface Thought {
  id: string;
  text: string;
  bucket: Bucket;
}

export interface UnclutterState {
  /** Exactly what was typed, so going back doesn't lose anything. */
  raw: string;
  thoughts: Thought[];
}

const EMPTY: UnclutterState = { raw: '', thoughts: [] };

let state: UnclutterState = EMPTY;
let counter = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function set(next: UnclutterState) {
  state = next;
  emit();
}

function nextId(): string {
  counter += 1;
  return `thought_${counter}`;
}

/**
 * One thought per line. Blank lines and stray bullet characters are dropped,
 * and a single long ramble simply stays one thought — no clever parsing.
 */
export function splitThoughts(raw: string): string[] {
  return (raw ?? '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*•·—–]\s*/, '').trim())
    .filter((line) => line.length > 0);
}

/** Capture the written text as thoughts, keeping buckets already chosen. */
export function captureThoughts(raw: string): Thought[] {
  const previous = new Map(state.thoughts.map((thought) => [thought.text, thought.bucket]));
  const thoughts = splitThoughts(raw).map<Thought>((text) => ({
    id: nextId(),
    text,
    bucket: previous.get(text) ?? 'none',
  }));
  set({ raw, thoughts });
  return thoughts;
}

export function setRaw(raw: string): void {
  set({ ...state, raw });
}

export function setBucket(id: string, bucket: Bucket): void {
  set({
    ...state,
    thoughts: state.thoughts.map((thought) =>
      thought.id === id ? { ...thought, bucket: thought.bucket === bucket ? 'none' : bucket } : thought
    ),
  });
}

export function editThought(id: string, text: string): void {
  const trimmed = text.trim();
  if (!trimmed) return removeThought(id);
  set({
    ...state,
    thoughts: state.thoughts.map((thought) =>
      thought.id === id ? { ...thought, text: trimmed } : thought
    ),
  });
}

export function removeThought(id: string): void {
  set({ ...state, thoughts: state.thoughts.filter((thought) => thought.id !== id) });
}

export function addThought(text: string): Thought | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const thought: Thought = { id: nextId(), text: trimmed, bucket: 'none' };
  set({ ...state, thoughts: [...state.thoughts, thought] });
  return thought;
}

/** Wipes everything. Used by "Clear" and whenever the flow is left. */
export function clearUnclutter(): void {
  set(EMPTY);
}

export function getUnclutter(): UnclutterState {
  return state;
}

export function subscribeUnclutter(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useUnclutter(): UnclutterState {
  return useSyncExternalStore(subscribeUnclutter, getUnclutter, getUnclutter);
}

/** Order used when showing sorted thoughts: NOW, LATER, NOT SURE, unsorted. */
export function groupThoughts(thoughts: Thought[]): Record<Bucket, Thought[]> {
  return {
    now: thoughts.filter((t) => t.bucket === 'now'),
    later: thoughts.filter((t) => t.bucket === 'later'),
    unsure: thoughts.filter((t) => t.bucket === 'unsure'),
    none: thoughts.filter((t) => t.bucket === 'none'),
  };
}
