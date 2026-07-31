import type { AndroidSymbol, SFSymbol } from 'expo-symbols';
import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

function TabIcon({
  ios,
  android,
  color,
}: {
  ios: SFSymbol;
  android: AndroidSymbol;
  color: ColorValue;
}) {
  return (
    <SymbolView name={{ ios, android, web: android }} tintColor={color} size={26} />
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabIcon ios="house" android="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabIcon ios="calendar" android="calendar_month" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: 'Study',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabIcon ios="waveform" android="graphic_eq" color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabIcon ios="ellipsis.circle" android="more_horiz" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
