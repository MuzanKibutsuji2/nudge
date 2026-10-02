import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MAX_CONTENT_WIDTH } from '../constants/theme';
import { useTheme } from '../lib/theme';

export interface ScreenProps {
  children: React.ReactNode;
  /** Scrollable body. Off by default so short screens stay perfectly centred. */
  scroll?: boolean;
  /** Pinned to the bottom, outside the scroll area. */
  footer?: React.ReactNode;
  /** Wall mode / focus use the calmer background. */
  background?: 'default' | 'calm' | 'surface';
  /** Screens inside the tab navigator don't need their own bottom inset. */
  inTabs?: boolean;
  padded?: boolean;
  centered?: boolean;
  avoidKeyboard?: boolean;
  contentStyle?: ViewStyle;
  scrollProps?: Partial<ScrollViewProps>;
  testID?: string;
}

/**
 * One layout primitive for every screen: safe areas, side padding, a readable
 * max width on big devices, optional scrolling and a pinned footer.
 */
export function Screen({
  children,
  scroll = false,
  footer,
  background = 'default',
  inTabs = false,
  padded = true,
  centered = false,
  avoidKeyboard = false,
  contentStyle,
  scrollProps,
  testID,
}: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const backgroundColor =
    background === 'calm'
      ? theme.colors.calmBg
      : background === 'surface'
        ? theme.colors.surface
        : theme.colors.bg;

  const horizontal = padded ? theme.spacing.xl : 0;
  const paddingTop = Math.max(insets.top, theme.spacing.md) + (padded ? theme.spacing.sm : 0);
  const paddingBottom = inTabs
    ? theme.spacing.xl
    : Math.max(insets.bottom, theme.spacing.md) + theme.spacing.sm;

  const inner = (
    <View style={[styles.limit, { maxWidth: MAX_CONTENT_WIDTH }, contentStyle]}>{children}</View>
  );

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingHorizontal: horizontal,
          paddingTop,
          paddingBottom: footer ? theme.spacing.lg : paddingBottom,
        },
        centered && styles.centered,
      ]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      showsVerticalScrollIndicator={false}
      {...scrollProps}
    >
      {inner}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.flex,
        {
          paddingHorizontal: horizontal,
          paddingTop,
          paddingBottom: footer ? theme.spacing.lg : paddingBottom,
        },
        centered && styles.centered,
      ]}
    >
      {inner}
    </View>
  );

  const content = (
    <>
      {body}
      {footer ? (
        <View
          style={[
            styles.footer,
            {
              paddingHorizontal: horizontal,
              paddingBottom,
              paddingTop: theme.spacing.md,
            },
          ]}
        >
          <View style={[styles.limit, { maxWidth: MAX_CONTENT_WIDTH }]}>{footer}</View>
        </View>
      ) : null}
    </>
  );

  return (
    <View style={[styles.flex, { backgroundColor }]} testID={testID}>
      {avoidKeyboard ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  centered: { justifyContent: 'center' },
  limit: { width: '100%', alignSelf: 'center', flexGrow: 1 },
  footer: { width: '100%' },
});
