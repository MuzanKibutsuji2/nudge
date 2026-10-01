/**
 * The only place in the app that talks to AsyncStorage.
 *
 * Everything is defensive on purpose:
 *  - if the native/web storage backend is missing or throws (private browsing,
 *    full disk, a wiped keychain), we fall back to an in-memory map so the app
 *    keeps working for the session instead of crashing
 *  - corrupted JSON is treated as "no value" rather than an exception
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'nudge/v1/';

export const StorageKeys = {
  settings: `${PREFIX}settings`,
  tasks: `${PREFIX}tasks`,
  sessions: `${PREFIX}sessions`,
  checkIns: `${PREFIX}check-ins`,
  breaks: `${PREFIX}breaks`,
  activeSession: `${PREFIX}active-session`,
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];

const ALL_KEYS: StorageKey[] = Object.values(StorageKeys);

const memoryFallback = new Map<string, string>();
let usingFallback = false;

function degrade(error: unknown) {
  if (!usingFallback) {
    usingFallback = true;
    if (__DEV__) {
      console.warn('[nudge] persistent storage unavailable, using memory only', error);
    }
  }
}

/** True when writes are only being kept in memory for this session. */
export function isPersistenceAvailable(): boolean {
  return !usingFallback;
}

async function getRaw(key: string): Promise<string | null> {
  if (usingFallback) return memoryFallback.get(key) ?? null;
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    degrade(error);
    return memoryFallback.get(key) ?? null;
  }
}

async function setRaw(key: string, value: string): Promise<void> {
  memoryFallback.set(key, value);
  if (usingFallback) return;
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    degrade(error);
  }
}

async function removeRaw(key: string): Promise<void> {
  memoryFallback.delete(key);
  if (usingFallback) return;
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    degrade(error);
  }
}

/** Reads and parses a value, returning `fallback` for anything unexpected. */
export async function readJSON<T>(key: StorageKey, fallback: T): Promise<T> {
  const raw = await getRaw(key);
  if (raw == null) return fallback;
  try {
    const parsed = JSON.parse(raw) as T;
    if (parsed == null) return fallback;
    // Guard against a shape change between versions.
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    return parsed;
  } catch (error) {
    if (__DEV__) console.warn(`[nudge] could not parse ${key}`, error);
    return fallback;
  }
}

export async function writeJSON(key: StorageKey, value: unknown): Promise<void> {
  try {
    await setRaw(key, JSON.stringify(value));
  } catch (error) {
    // JSON.stringify can only fail on cycles; never let it bubble to the UI.
    if (__DEV__) console.warn(`[nudge] could not serialise ${key}`, error);
  }
}

export async function removeKey(key: StorageKey): Promise<void> {
  await removeRaw(key);
}

/** Wipes every Nudge key. Used by Settings → Clear all local data. */
export async function clearAll(): Promise<void> {
  memoryFallback.clear();
  if (usingFallback) return;
  try {
    await AsyncStorage.multiRemove(ALL_KEYS as string[]);
  } catch (error) {
    degrade(error);
  }
}
