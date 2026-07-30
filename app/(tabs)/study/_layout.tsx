import { Stack } from 'expo-router';

export default function StudyLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Study' }} />
      <Stack.Screen name="[courseId]/index" options={{ title: '' }} />
      <Stack.Screen name="[courseId]/[unitId]" options={{ title: '' }} />
    </Stack>
  );
}
