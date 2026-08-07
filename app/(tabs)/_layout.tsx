import { Tabs } from 'expo-router';
import { YStack } from 'tamagui';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { Icon, type IconName } from '@/src/components/Icon';
import { ACCENT_SOFT_BG, ACCENT_TINT, useThemeStore, type AccentColor } from '@/src/state/themeStore';

/**
 * Renders via the custom Icon component (react-native-svg — plain SVG DOM elements on web, no
 * font loading), not an icon-font library. Icon-font paths (expo-symbols, @expo/vector-icons)
 * pull in expo-font, whose web module reads a `globalThis.expo` singleton that two of Expo static
 * export's own concurrent bundling passes (client + SSR) race to initialize, deterministically
 * crashing the export on slower build machines (reproduced on Vercel every time, never locally).
 * react-native-svg's web implementation doesn't touch expo-font or that singleton at all, so this
 * bug class doesn't apply here — see the web-safety check this was verified against before adding.
 */
function TabIcon({ name, focused, accentColor }: { name: IconName; focused: boolean; accentColor: AccentColor }) {
  return (
    <YStack
      width={40}
      height={30}
      borderRadius="$10"
      alignItems="center"
      justifyContent="center"
      style={focused ? { backgroundColor: ACCENT_SOFT_BG[accentColor] } : undefined}>
      <Icon name={name} size={focused ? 22 : 20} color={focused ? ACCENT_TINT[accentColor] : '#8A8F98'} />
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
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} accentColor={accentColor} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name="calendar" focused={focused} accentColor={accentColor} />,
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: 'Study',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name="mic" focused={focused} accentColor={accentColor} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name="more" focused={focused} accentColor={accentColor} />,
        }}
      />
    </Tabs>
  );
}
