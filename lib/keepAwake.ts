import { useEffect } from 'react';

/**
 * Keeps the screen on during a focus session — but only if the platform
 * actually supports it.
 *
 * `useKeepAwake()` from expo-keep-awake throws on unmount when the wake lock
 * was never granted (browsers without the Wake Lock API, denied permission,
 * some webviews). A thrown error in a cleanup function unmounts the whole tree,
 * so we manage the lock ourselves and swallow anything that goes wrong.
 */
export function useKeepScreenAwake(tag = 'nudge-focus'): void {
  useEffect(() => {
    let granted = false;
    let cancelled = false;

    (async () => {
      try {
        const { activateKeepAwakeAsync } = await import('expo-keep-awake');
        await activateKeepAwakeAsync(tag);
        if (!cancelled) granted = true;
      } catch {
        // Screen will just dim as usual. The timer is wall-clock based, so
        // nothing breaks.
      }
    })();

    return () => {
      cancelled = true;
      if (!granted) return;
      (async () => {
        try {
          const { deactivateKeepAwake } = await import('expo-keep-awake');
          await deactivateKeepAwake(tag);
        } catch {
          // ignore
        }
      })();
    };
  }, [tag]);
}
