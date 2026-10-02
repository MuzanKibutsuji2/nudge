import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router/js-tabs';

import { SideNav } from '../../components/SideNav';
import { TabBar } from '../../components/TabBar';
import { useWideLayout } from '../../lib/layout';
import { useTheme } from '../../lib/theme';

export default function TabsLayout() {
  const theme = useTheme();
  const wide = useWideLayout();

  return (
    <View style={[styles.row, { backgroundColor: theme.colors.bg }]}>
      {wide ? <SideNav /> : null}

      <View style={styles.flex}>
        <Tabs
          // On a wide screen the rail on the left is the navigation, so the
          // bottom bar would just be a second copy of it.
          tabBar={(props) => (wide ? null : <TabBar {...props} />)}
          screenOptions={{
            headerShown: false,
            sceneStyle: { backgroundColor: theme.colors.bg },
          }}
        >
          <Tabs.Screen name="home" options={{ title: 'Home' }} />
          <Tabs.Screen name="today" options={{ title: 'Today' }} />
          <Tabs.Screen name="start" options={{ title: 'Start' }} />
          <Tabs.Screen name="history" options={{ title: 'History' }} />
          <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flex: 1, flexDirection: 'row' },
  flex: { flex: 1 },
});
