import { Tabs } from 'expo-router';
import { Text, YStack } from 'tamagui';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { ACCENT_SOFT_BG, ACCENT_TINT, useThemeStore, type AccentColor } from '@/src/state/themeStore';

/**
 * Plain-text glyphs, not an icon-font library — every icon-font path (expo-symbols,
 * @expo/vector-icons) pulls in expo-font, whose web module reads a `globalThis.expo` singleton
 * that two of Expo static export's own concurrent bundling passes (client + SSR) race to
 * initialize, deterministically crashing the export on slower build machines (reproduced on
 * Vercel every time, never locally). Text glyphs need no font loading at all, so this bug class
 * doesn't apply here. Trade-off: emoji are inherently colored, so they don't re-tint when a tab
 * is active the way a monochrome icon font would — the soft pill behind it plus the label below
 * still show the active state clearly.
 */
function TabIcon({ glyph, focused, accentColor }: { glyph: string; focused: boolean; accentColor: AccentColor }) {
  return (
    <YStack
      width={40}
      height={30}
      borderRadius="$10"
      alignItems="center"
      justifyContent="center"
      style={focused ? { backgroundColor: ACCENT_SOFT_BG[accentColor] } : undefined}>
      <Text fontSize={focused ? 20 : 18}>{glyph}</Text>
    </YStack>
  );
}

export default function TabLayout() {
  const accentColor = useThemeStore((state) => state.accentColor);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ACCENT_TINT[accentColor],
        tabBarLabelStyle: { fontWeight: '600' },
        tabBarStyle: { height: 64, paddingTop: 6, paddingBottom: 10 },
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon glyph="🏠" focused={focused} accentColor={accentColor} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon glyph="📅" focused={focused} accentColor={accentColor} />,
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: 'Study',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon glyph="🎙️" focused={focused} accentColor={accentColor} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon glyph="⋯" focused={focused} accentColor={accentColor} />,
        }}
      />
    </Tabs>
  );
}
