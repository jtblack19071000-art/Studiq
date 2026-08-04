import { router, useLocalSearchParams } from 'expo-router';
import { Button, H2, Paragraph, YStack } from 'tamagui';

import { useStudyStore } from '@/src/state/studyStore';

/**
 * Web build of the record screen intentionally has no `expo-audio` import. expo-audio's web
 * module defines `class AudioPlayerWeb extends globalThis.expo.SharedObject` at module-evaluation
 * time, and Expo Router's static export always loads every route module (even fully dynamic ones,
 * to check for `generateStaticParams`) via a `Promise.all` that races against the export's own
 * client bundling pass to initialize that `globalThis.expo` singleton — crashing the build
 * non-deterministically on slower machines (reproduced on Vercel every time). Browser mic capture
 * also isn't the same experience as native recording, so web falls back to a placeholder here
 * rather than trying to make expo-audio safe for SSR.
 */
export default function RecordLectureWebScreen() {
  const { unitId } = useLocalSearchParams<{ courseId: string; unitId: string }>();
  const unit = useStudyStore((state) => state.units.find((u) => u.id === unitId));

  return (
    <YStack flex={1} backgroundColor="$background" padding="$4" gap="$4">
      <H2>Record lecture</H2>
      {unit ? <Paragraph color="$color10">{unit.title}</Paragraph> : null}
      <Paragraph>
        Lecture recording is only available in the Studiq mobile app on iOS and Android. Install
        the app to record and transcribe lectures.
      </Paragraph>
      <Button size="$4" chromeless onPress={() => router.back()}>
        Back
      </Button>
    </YStack>
  );
}
