import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorFallback } from '../components/ErrorFallback';
import { AppProvider, useAppState } from '../lib/store';
import { ThemeProvider, useTheme } from '../lib/theme';
import { usePageTitle, useThemeColor } from '../lib/webTitle';

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

  const title = usePageTitle();
  useThemeColor(theme.colors.bg);

  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync().catch(() => {});
  }, [hydrated]);

  // Rendered in both branches: the prerendered HTML has no stored state, so
  // this is the only pass that ever runs when a page is exported.
  const head = (
    <Head>
      {/* Only the title: expo-router's Head drops other tags on web, so the
          rest of the metadata lives in app/+html.tsx. */}
      <title>{title}</title>
    </Head>
  );

  if (!hydrated) {
    // Nothing to show yet — a flash of the right colour beats a flash of white.
    return <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>{head}</View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      {head}
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
        <Stack.Screen name="reset/index" options={{ animation: 'fade' }} />
        <Stack.Screen name="reset/room" options={{ animation: 'fade' }} />
        <Stack.Screen name="reset/quiet" options={{ animation: 'fade' }} />
        <Stack.Screen name="reset/unclutter" />
        <Stack.Screen name="reset/sort" />
        <Stack.Screen name="reset/restart" options={{ animation: 'fade' }} />
        <Stack.Screen name="reset/tiny" />
        <Stack.Screen name="reset/after" options={{ animation: 'fade' }} />
        <Stack.Screen
          name="reset/support"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="sit-with-me" />
        <Stack.Screen
          name="how-it-works"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack>
    </View>
  );
}
