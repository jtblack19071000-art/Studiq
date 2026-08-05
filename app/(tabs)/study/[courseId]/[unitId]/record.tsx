import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, H2, Input, Label, Paragraph, Text, YStack } from 'tamagui';

import { PremiumGate } from '@/src/components/PremiumGate';
import { generateLectureMaterials, transcribeAudio } from '@/src/lib/studyAi';
import { useStudyStore } from '@/src/state/studyStore';
import { useSubscriptionStore } from '@/src/state/subscriptionStore';
import type { Lecture } from '@/src/types';

function formatDuration(millis: number): string {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** Runs transcription then AI generation in the background; UI reflects progress via the store. */
async function runTranscriptionAndGenerationPipeline(
  lectureId: string,
  audioUri: string,
  fileName: string,
  updateLecture: (id: string, patch: Partial<Omit<Lecture, 'id'>>) => void,
) {
  updateLecture(lectureId, { transcriptionStatus: 'transcribing' });
  let transcript: string;
  try {
    const result = await transcribeAudio(audioUri, fileName);
    transcript = result.text;
    updateLecture(lectureId, { transcriptionStatus: 'transcribed', transcript });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Transcription failed.';
    updateLecture(lectureId, { transcriptionStatus: 'failed', transcriptionError: message });
    return;
  }

  updateLecture(lectureId, { generationStatus: 'generating' });
  try {
    const materials = await generateLectureMaterials(transcript);
    updateLecture(lectureId, { generationStatus: 'ready', ...materials });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generation failed.';
    updateLecture(lectureId, { generationStatus: 'failed', generationError: message });
  }
}

export default function RecordLectureScreen() {
  const { courseId, unitId } = useLocalSearchParams<{ courseId: string; unitId: string }>();
  const unit = useStudyStore((state) => state.units.find((u) => u.id === unitId));
  const lectures = useStudyStore((state) => state.lectures);
  const addLecture = useStudyStore((state) => state.addLecture);
  const updateLecture = useStudyStore((state) => state.updateLecture);

  const lectureCountInUnit = lectures.filter((lecture) => lecture.unitId === unitId).length;
  const [title, setTitle] = useState(`Lecture ${lectureCountInUnit + 1}`);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 200);
  const isPremium = useSubscriptionStore((state) => state.tier === 'premium');

  useEffect(() => {
    if (!isPremium) return;
    (async () => {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        setPermissionError('Microphone permission is required to record a lecture.');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
    })();
  }, [recorder, isPremium]);

  function handleStart() {
    recorder.record();
  }

  function handlePause() {
    recorder.pause();
  }

  function handleResume() {
    recorder.record();
  }

  async function handleStopAndSave() {
    setSaving(true);
    await recorder.stop();
    const uri = recorder.uri;
    if (!uri) {
      setSaving(false);
      setPermissionError('Recording did not produce an audio file. Please try again.');
      return;
    }

    const durationSeconds = Math.round(recorderState.durationMillis / 1000);
    const fileName = `${title.trim() || 'lecture'}.m4a`;
    const created = addLecture({
      unitId: unitId!,
      title: title.trim() || `Lecture ${lectureCountInUnit + 1}`,
      recordedAt: new Date().toISOString(),
      durationSeconds,
      audioUri: uri,
    });

    void runTranscriptionAndGenerationPipeline(created.id, uri, fileName, updateLecture);

    router.replace(`/study/${courseId}/${unitId}/lecture/${created.id}`);
  }

  if (!unit) {
    return (
      <YStack flex={1} backgroundColor="$background" padding="$4">
        <Paragraph>Unit not found.</Paragraph>
      </YStack>
    );
  }

  if (!isPremium) {
    return (
      <YStack flex={1} backgroundColor="$background" padding="$4" gap="$4">
        <H2>Record lecture</H2>
        <PremiumGate>{null}</PremiumGate>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background" padding="$4" gap="$4">
      <H2>Record lecture</H2>
      <Paragraph color="$color10">{unit.title}</Paragraph>

      <YStack gap="$2">
        <Label>Title</Label>
        <Input value={title} onChangeText={setTitle} disabled={recorderState.isRecording} />
      </YStack>

      {permissionError ? <Paragraph color="$red10">{permissionError}</Paragraph> : null}

      <YStack alignItems="center" gap="$3" paddingVertical="$6">
        <Text fontSize="$10" fontWeight="700">
          {formatDuration(recorderState.durationMillis)}
        </Text>
        <Text color="$color10">
          {recorderState.isRecording ? 'Recording…' : recorderState.durationMillis > 0 ? 'Paused' : 'Ready'}
        </Text>
      </YStack>

      <YStack gap="$3">
        {!recorderState.isRecording && recorderState.durationMillis === 0 ? (
          <Button size="$5" theme="active" onPress={handleStart} disabled={!!permissionError}>
            Start recording
          </Button>
        ) : null}

        {recorderState.isRecording ? (
          <Button size="$5" onPress={handlePause}>
            Pause
          </Button>
        ) : null}

        {!recorderState.isRecording && recorderState.durationMillis > 0 ? (
          <Button size="$5" theme="active" onPress={handleResume}>
            Resume
          </Button>
        ) : null}

        {recorderState.durationMillis > 0 ? (
          <Button size="$5" onPress={handleStopAndSave} disabled={saving}>
            {saving ? 'Saving…' : 'Stop & save'}
          </Button>
        ) : null}

        <Button size="$4" chromeless onPress={() => router.back()} disabled={saving}>
          Cancel
        </Button>
      </YStack>
    </YStack>
  );
}
