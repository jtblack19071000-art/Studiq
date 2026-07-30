import { Stack } from 'expo-router';

export default function ClassesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Classes' }} />
      <Stack.Screen name="[id]" options={{ title: '' }} />
    </Stack>
  );
}
