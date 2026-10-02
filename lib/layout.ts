import { Platform, useWindowDimensions } from 'react-native';

/**
 * Nudge runs in a browser, on screens from a 320px phone to a 27" monitor.
 *
 * Narrow: one column, navigation along the bottom, exactly like a phone app.
 * Wide: a quiet navigation rail down the left, content in a readable column.
 *
 * Nothing in between — two layouts are enough, and each one is simple.
 */
export const SIDE_NAV_WIDTH = 236;

/** Below this the bottom bar is the better reach; above it, a side rail. */
export const WIDE_BREAKPOINT = 900;

export function useWideLayout(): boolean {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' && width >= WIDE_BREAKPOINT;
}

/** True on a browser wide enough to show the page some breathing room. */
export function useRoomyLayout(): boolean {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' && width >= 1180;
}
