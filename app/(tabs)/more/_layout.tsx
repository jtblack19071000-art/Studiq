import { Stack } from 'expo-router';

export default function MoreLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'More' }} />
      <Stack.Screen name="finance" options={{ title: 'Finance' }} />
      <Stack.Screen name="goals" options={{ title: 'Goals' }} />
      <Stack.Screen name="career" options={{ title: 'Career Hub' }} />
      <Stack.Screen name="college-match" options={{ title: 'College Match' }} />
      <Stack.Screen name="campus-resources" options={{ title: 'Campus Resources' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
    </Stack>
  );
}
