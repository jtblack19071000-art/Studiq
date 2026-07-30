import { Stack } from 'expo-router';

export default function StudyLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Study' }} />
      <Stack.Screen name="[courseId]/index" options={{ title: '' }} />
      <Stack.Screen name="[courseId]/[unitId]/index" options={{ title: '' }} />
      <Stack.Screen name="[courseId]/[unitId]/record" options={{ title: 'Record lecture', presentation: 'modal' }} />
      <Stack.Screen name="[courseId]/[unitId]/study-guide" options={{ title: 'Study guide' }} />
      <Stack.Screen name="[courseId]/[unitId]/lecture/[lectureId]" options={{ title: '' }} />
    </Stack>
  );
}
