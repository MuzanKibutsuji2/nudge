import type { ImperativeRouter } from 'expo-router';

/**
 * Ends a flow and returns to Home without leaving half-finished screens in the
 * back stack. Written defensively because the stack shape differs between
 * deep links, tab switches and fresh launches.
 */
export function resetToHome(router: ImperativeRouter): void {
  try {
    if (router.canDismiss?.()) {
      router.dismissAll();
      return;
    }
  } catch {
    // fall through
  }
  try {
    router.replace('/home');
  } catch {
    router.navigate('/home');
  }
}

/** Reads a router param that may arrive as a string or an array of strings. */
export function param(value: string | string[] | undefined, fallback = ''): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export function numberParam(value: string | string[] | undefined, fallback: number): number {
  const raw = param(value, '');
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}
