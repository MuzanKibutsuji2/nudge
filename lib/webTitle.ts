import { useEffect, useMemo } from 'react';
import { Platform } from 'react-native';
import { usePathname } from 'expo-router';

/**
 * The browser tab should say where you are. Routes that are part of a flow
 * (a feeling, a timer, a breath) deliberately keep the plain title — a tab
 * reading "I'm stuck" is not something to leave sitting on someone's screen.
 */
const TITLES: Record<string, string> = {
  '/home': 'Home',
  '/today': 'Today',
  '/start': 'Start',
  '/history': 'History',
  '/settings': 'Settings',
  '/how-it-works': 'How it works',
  '/add-task': 'New task',
  '/break': 'Break',
  '/sit-with-me': 'Sit with me',
};

const DEFAULT_TITLE = 'Nudge — small steps. no pressure.';

/** Shown in search results and link previews. */
export const SITE_DESCRIPTION =
  'A calm place to start when you cannot. Pick the smallest useful step, do it for five minutes, stop whenever you want. Everything stays on your device.';

export function usePageTitle(): string {
  const pathname = usePathname();

  return useMemo(() => {
    const label = TITLES[pathname];
    return label ? `${label} · Nudge` : DEFAULT_TITLE;
  }, [pathname]);
}

/** Keeps the browser chrome (address bar, task switcher) in step with the theme. */
export function useThemeColor(color: string) {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    document.documentElement.style.backgroundColor = color;
    document.body.style.backgroundColor = color;

    const tags = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
    tags.forEach((tag) => tag.setAttribute('content', color));
  }, [color]);
}
