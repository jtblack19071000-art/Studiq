import { Tabs } from 'expo-router';
import { Text } from 'tamagui';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { ACCENT_TINT, useThemeStore } from '@/src/state/themeStore';

/**
 * Plain-text glyphs, not an icon-font library — every icon-font path (expo-symbols,
 * @expo/vector-icons) pulls in expo-font, whose web module reads a `globalThis.expo` singleton
 * that two of Expo static export's own concurrent bundling passes (client + SSR) race to
 * initialize, deterministically crashing the export on slower build machines (reproduced on
 * Vercel every time, never locally). Text glyphs need no font loading at all, so this bug class
 * doesn't apply here. Trade-off: emoji are inherently colored, so they don't re-tint when a tab
 * is active the way a monochrome icon font would — the label text below still does.
 */
function TabIcon({ glyph }: { glyph: string }) {
  return <Text fontSize={22}>{glyph}</Text>;
}

export default function TabLayout() {
  const accentColor = useThemeStore((state) => state.accentColor);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ACCENT_TINT[accentColor],
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: () => <TabIcon glyph="🏠" />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          headerShown: false,
          tabBarIcon: () => <TabIcon glyph="📅" />,
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: 'Study',
          headerShown: false,
          tabBarIcon: () => <TabIcon glyph="🎙️" />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          headerShown: false,
          tabBarIcon: () => <TabIcon glyph="⋯" />,
        }}
      />
    </Tabs>
  );
}
