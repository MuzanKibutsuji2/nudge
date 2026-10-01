import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DeviceFrame } from '../components/DeviceFrame';
import { ErrorFallback } from '../components/ErrorFallback';
import { AppProvider, useAppState } from '../lib/store';
import { ThemeProvider, useTheme } from '../lib/theme';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash control is best effort; never block launch on it.
});

/** expo-router renders this instead of a white screen if a route throws. */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <ErrorFallback error={error} retry={retry} />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <ThemeProvider>
          <RootShell />
        </ThemeProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}

function RootShell() {
  const theme = useTheme();
  const { hydrated } = useAppState();

  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync().catch(() => {});
  }, [hydrated]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    // Keep the page behind the phone frame calm and scroll-free.
    const style = document.createElement('style');
    style.textContent = `
      html, body, #root { height: 100%; margin: 0; overflow: hidden; }
      body { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
      input, textarea { outline: none; }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (!hydrated) {
    // Nothing to show yet — a flash of the right colour beats a flash of white.
    return <View style={{ flex: 1, backgroundColor: theme.colors.bg }} />;
  }

  return (
    <DeviceFrame>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: theme.colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="stuck/index" />
        <Stack.Screen name="stuck/task" />
        <Stack.Screen name="stuck/smaller" />
        <Stack.Screen name="stuck/action" />
        <Stack.Screen name="focus" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="done" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="wall" options={{ animation: 'fade' }} />
        <Stack.Screen name="break" options={{ animation: 'fade' }} />
        <Stack.Screen
          name="add-task"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="task/[id]"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="clear-data"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="sit-with-me" />
      </Stack>
    </DeviceFrame>
  );
}
