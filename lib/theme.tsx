/**
 * Theme provider: resolves the user's preference against the OS setting,
 * and exposes reduced-motion state so animations can switch themselves off.
 */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, useColorScheme } from 'react-native';

import { buildTheme, type ColorScheme, type Theme } from '../constants/theme';
import { useSettings } from './store';

const ThemeContext = createContext<Theme>(buildTheme('light'));
const ReducedMotionContext = createContext<boolean>(false);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const settings = useSettings();
  const system = useColorScheme();
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((value) => {
        if (mounted) setSystemReduceMotion(!!value);
      })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (value) =>
      setSystemReduceMotion(!!value)
    );
    return () => {
      mounted = false;
      sub?.remove?.();
    };
  }, []);

  const scheme: ColorScheme =
    settings.theme === 'system' ? ((system as ColorScheme) ?? 'light') : settings.theme;

  const theme = useMemo(() => buildTheme(scheme, settings.accent), [scheme, settings.accent]);
  const reduceMotion = systemReduceMotion || settings.reduceMotion;

  useEffect(() => {
    // Keeps the area behind the app (overscroll, web body) in the right colour.
    (async () => {
      try {
        const SystemUI = await import('expo-system-ui');
        await SystemUI.setBackgroundColorAsync(theme.colors.bg);
      } catch {
        // not supported on this platform — harmless
      }
    })();
  }, [theme]);

  return (
    <ThemeContext.Provider value={theme}>
      <ReducedMotionContext.Provider value={reduceMotion}>{children}</ReducedMotionContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

export function useReducedMotion(): boolean {
  return useContext(ReducedMotionContext);
}
