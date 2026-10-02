import React from 'react';
import { Redirect } from 'expo-router';

import { useAppState } from '../lib/store';

/** Launch gate: onboarding on a fresh install, Home afterwards. */
export default function Index() {
  const { hydrated, settings } = useAppState();
  if (!hydrated) return null;
  return <Redirect href={settings.onboarded ? '/home' : '/onboarding'} />;
}
