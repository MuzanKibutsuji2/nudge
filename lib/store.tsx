/**
 * The single source of truth for Nudge.
 *
 * - one reducer, one provider, typed action helpers
 * - every slice is persisted through lib/storage (nothing else touches it)
 * - hydration happens once on launch; writes are per-slice so a big session
 *   list never rewrites settings
 * - an interrupted session is recoverable: remaining time is derived from
 *   timestamps, so backgrounding, reloading or killing the app is survivable
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';

import type {
  ActiveSession,
  BreakRecord,
  CheckIn,
  FocusSession,
} from '../types/session';
import type { NewTaskInput, Task } from '../types/task';
import type { Settings } from '../types/settings';
import { DEFAULT_SETTINGS } from '../types/settings';
import { configureFeedback } from './feedback';
import { createId } from './id';
import { createTask } from './taskUtils';
import { elapsedMs, isResumable, sessionMinutes } from './sessionTime';
import {
  StorageKeys,
  clearAll as clearStorage,
  isPersistenceAvailable,
  readJSON,
  writeJSON,
} from './storage';

/** Keep history honest but bounded, so storage never grows without limit. */
const MAX_SESSIONS = 500;
const MAX_CHECK_INS = 300;
const MAX_BREAKS = 200;

export interface AppState {
  hydrated: boolean;
  persistenceAvailable: boolean;
  settings: Settings;
  tasks: Task[];
  sessions: FocusSession[];
  checkIns: CheckIn[];
  breaks: BreakRecord[];
  activeSession: ActiveSession | null;
}

const initialState: AppState = {
  hydrated: false,
  persistenceAvailable: true,
  settings: DEFAULT_SETTINGS,
  tasks: [],
  sessions: [],
  checkIns: [],
  breaks: [],
  activeSession: null,
};

type Action =
  | { type: 'hydrated'; payload: Partial<AppState> }
  | { type: 'settings/patch'; payload: Partial<Settings> }
  | { type: 'tasks/set'; payload: Task[] }
  | { type: 'sessions/set'; payload: FocusSession[] }
  | { type: 'checkIns/set'; payload: CheckIn[] }
  | { type: 'breaks/set'; payload: BreakRecord[] }
  | { type: 'active/set'; payload: ActiveSession | null }
  | { type: 'reset' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrated':
      return { ...state, ...action.payload, hydrated: true };
    case 'settings/patch':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'tasks/set':
      return { ...state, tasks: action.payload };
    case 'sessions/set':
      return { ...state, sessions: action.payload.slice(0, MAX_SESSIONS) };
    case 'checkIns/set':
      return { ...state, checkIns: action.payload.slice(0, MAX_CHECK_INS) };
    case 'breaks/set':
      return { ...state, breaks: action.payload.slice(0, MAX_BREAKS) };
    case 'active/set':
      return { ...state, activeSession: action.payload };
    case 'reset':
      return {
        ...initialState,
        hydrated: true,
        persistenceAvailable: state.persistenceAvailable,
      };
    default:
      return state;
  }
}

/** Re-exported so screens only ever import from the store. */
export { elapsedMs, remainingMs } from './sessionTime';

export interface StartSessionInput {
  taskTitle: string;
  taskId?: string;
  plannedMinutes: number;
  feeling?: string;
  sourceTask?: string;
}

export interface AppActions {
  updateSettings: (patch: Partial<Settings>) => void;
  finishOnboarding: (input: { name?: string; focusAreas?: string[] }) => void;
  addTask: (input: NewTaskInput) => Task;
  addSubtasks: (parentId: string, titles: string[]) => Task[];
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  logCheckIn: (feeling: string) => CheckIn;
  startSession: (input: StartSessionInput) => ActiveSession;
  pauseSession: () => void;
  resumeSession: () => void;
  /** Ends and records the active session. Returns null if there was none. */
  endSession: (opts?: { completed?: boolean }) => FocusSession | null;
  discardSession: () => void;
  logBreak: (minutes: number | null) => void;
  clearAllData: () => Promise<void>;
}

const StateContext = createContext<AppState | null>(null);
const ActionsContext = createContext<AppActions | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  /* ---------------- hydrate once ---------------- */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [settings, tasks, sessions, checkIns, breaks, active] = await Promise.all([
        readJSON<Settings>(StorageKeys.settings, DEFAULT_SETTINGS),
        readJSON<Task[]>(StorageKeys.tasks, []),
        readJSON<FocusSession[]>(StorageKeys.sessions, []),
        readJSON<CheckIn[]>(StorageKeys.checkIns, []),
        readJSON<BreakRecord[]>(StorageKeys.breaks, []),
        readJSON<ActiveSession | null>(StorageKeys.activeSession, null),
      ]);

      if (cancelled) return;

      // A session left open for far longer than it was meant to last can't be
      // honestly recorded, so it is quietly dropped rather than invented.
      const activeSession: ActiveSession | null = active && isResumable(active) ? active : null;

      const merged: Settings = { ...DEFAULT_SETTINGS, ...settings };
      configureFeedback({ haptics: merged.haptics, sounds: merged.sounds });

      dispatch({
        type: 'hydrated',
        payload: {
          settings: merged,
          tasks: Array.isArray(tasks) ? tasks : [],
          sessions: Array.isArray(sessions) ? sessions : [],
          checkIns: Array.isArray(checkIns) ? checkIns : [],
          breaks: Array.isArray(breaks) ? breaks : [],
          activeSession,
          persistenceAvailable: isPersistenceAvailable(),
        },
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------------- persist on change ---------------- */
  const hydrated = state.hydrated;

  useEffect(() => {
    if (!hydrated) return;
    void writeJSON(StorageKeys.settings, state.settings);
    configureFeedback({ haptics: state.settings.haptics, sounds: state.settings.sounds });
  }, [hydrated, state.settings]);

  useEffect(() => {
    if (!hydrated) return;
    void writeJSON(StorageKeys.tasks, state.tasks);
  }, [hydrated, state.tasks]);

  useEffect(() => {
    if (!hydrated) return;
    void writeJSON(StorageKeys.sessions, state.sessions);
  }, [hydrated, state.sessions]);

  useEffect(() => {
    if (!hydrated) return;
    void writeJSON(StorageKeys.checkIns, state.checkIns);
  }, [hydrated, state.checkIns]);

  useEffect(() => {
    if (!hydrated) return;
    void writeJSON(StorageKeys.breaks, state.breaks);
  }, [hydrated, state.breaks]);

  useEffect(() => {
    if (!hydrated) return;
    void writeJSON(StorageKeys.activeSession, state.activeSession);
  }, [hydrated, state.activeSession]);

  /* ---------------- actions ---------------- */

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    dispatch({ type: 'settings/patch', payload: patch });
  }, []);

  const finishOnboarding = useCallback((input: { name?: string; focusAreas?: string[] }) => {
    dispatch({
      type: 'settings/patch',
      payload: {
        name: (input.name ?? '').trim(),
        focusAreas: input.focusAreas ?? [],
        onboarded: true,
      },
    });
  }, []);

  const addTask = useCallback((input: NewTaskInput): Task => {
    const task = createTask(input);
    dispatch({ type: 'tasks/set', payload: [task, ...stateRef.current.tasks] });
    return task;
  }, []);

  const addSubtasks = useCallback((parentId: string, titles: string[]): Task[] => {
    const created = titles
      .map((title) => title.trim())
      .filter(Boolean)
      .map((title) => createTask({ title, parentId, size: 'tiny' }));
    if (created.length === 0) return [];
    dispatch({ type: 'tasks/set', payload: [...created, ...stateRef.current.tasks] });
    return created;
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    dispatch({
      type: 'tasks/set',
      payload: stateRef.current.tasks.map((task) => (task.id === id ? { ...task, ...patch } : task)),
    });
  }, []);

  const toggleTask = useCallback((id: string) => {
    dispatch({
      type: 'tasks/set',
      payload: stateRef.current.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date().toISOString() : undefined,
            }
          : task
      ),
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    const next = stateRef.current.tasks.filter((task) => task.id !== id && task.parentId !== id);
    dispatch({ type: 'tasks/set', payload: next });
    // A session in progress keeps its title, so deleting the task mid-focus is safe.
    const active = stateRef.current.activeSession;
    if (active?.taskId === id) {
      dispatch({ type: 'active/set', payload: { ...active, taskId: undefined } });
    }
  }, []);

  const logCheckIn = useCallback((feeling: string): CheckIn => {
    const checkIn: CheckIn = {
      id: createId('chk'),
      feeling,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'checkIns/set', payload: [checkIn, ...stateRef.current.checkIns] });
    return checkIn;
  }, []);

  const startSession = useCallback((input: StartSessionInput): ActiveSession => {
    const session: ActiveSession = {
      id: createId('ses'),
      taskId: input.taskId,
      taskTitle: input.taskTitle.trim() || 'One small thing',
      plannedMinutes: Math.max(1, Math.round(input.plannedMinutes)),
      startedAt: new Date().toISOString(),
      pausedAt: null,
      pausedMs: 0,
      feeling: input.feeling,
      sourceTask: input.sourceTask,
    };
    dispatch({ type: 'active/set', payload: session });
    return session;
  }, []);

  const pauseSession = useCallback(() => {
    const active = stateRef.current.activeSession;
    if (!active || active.pausedAt) return;
    dispatch({ type: 'active/set', payload: { ...active, pausedAt: new Date().toISOString() } });
  }, []);

  const resumeSession = useCallback(() => {
    const active = stateRef.current.activeSession;
    if (!active || !active.pausedAt) return;
    const pausedFor = Math.max(0, Date.now() - new Date(active.pausedAt).getTime());
    dispatch({
      type: 'active/set',
      payload: { ...active, pausedAt: null, pausedMs: active.pausedMs + pausedFor },
    });
  }, []);

  const endSession = useCallback((opts?: { completed?: boolean }): FocusSession | null => {
    const active = stateRef.current.activeSession;
    if (!active) return null;

    const ms = elapsedMs(active);
    const plannedMs = active.plannedMinutes * 60000;
    const completed = opts?.completed ?? ms >= plannedMs;

    const record: FocusSession = {
      id: active.id,
      taskId: active.taskId,
      taskTitle: active.taskTitle,
      plannedMinutes: active.plannedMinutes,
      actualMinutes: sessionMinutes(Math.min(ms, plannedMs + 60000)),
      startedAt: active.startedAt,
      endedAt: new Date().toISOString(),
      completed,
      feeling: active.feeling,
    };

    dispatch({ type: 'sessions/set', payload: [record, ...stateRef.current.sessions] });
    dispatch({ type: 'active/set', payload: null });
    return record;
  }, []);

  const discardSession = useCallback(() => {
    dispatch({ type: 'active/set', payload: null });
  }, []);

  const logBreak = useCallback((minutes: number | null) => {
    const record: BreakRecord = {
      id: createId('brk'),
      minutes,
      startedAt: new Date().toISOString(),
    };
    dispatch({ type: 'breaks/set', payload: [record, ...stateRef.current.breaks] });
  }, []);

  const clearAllData = useCallback(async () => {
    await clearStorage();
    dispatch({ type: 'reset' });
    configureFeedback({ haptics: DEFAULT_SETTINGS.haptics, sounds: DEFAULT_SETTINGS.sounds });
  }, []);

  const actions = useMemo<AppActions>(
    () => ({
      updateSettings,
      finishOnboarding,
      addTask,
      addSubtasks,
      updateTask,
      toggleTask,
      deleteTask,
      logCheckIn,
      startSession,
      pauseSession,
      resumeSession,
      endSession,
      discardSession,
      logBreak,
      clearAllData,
    }),
    [
      updateSettings,
      finishOnboarding,
      addTask,
      addSubtasks,
      updateTask,
      toggleTask,
      deleteTask,
      logCheckIn,
      startSession,
      pauseSession,
      resumeSession,
      endSession,
      discardSession,
      logBreak,
      clearAllData,
    ]
  );

  return (
    <StateContext.Provider value={state}>
      <ActionsContext.Provider value={actions}>{children}</ActionsContext.Provider>
    </StateContext.Provider>
  );
}

export function useAppState(): AppState {
  const value = useContext(StateContext);
  if (!value) throw new Error('useAppState must be used inside <AppProvider>');
  return value;
}

export function useActions(): AppActions {
  const value = useContext(ActionsContext);
  if (!value) throw new Error('useActions must be used inside <AppProvider>');
  return value;
}

export function useSettings(): Settings {
  return useAppState().settings;
}

export function useTasks(): Task[] {
  return useAppState().tasks;
}

export function useSessions(): FocusSession[] {
  return useAppState().sessions;
}

export function useActiveSession(): ActiveSession | null {
  return useAppState().activeSession;
}
