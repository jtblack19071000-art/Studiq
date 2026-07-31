/// <reference types="jest" />

import { Platform } from 'react-native';

import {
  generateLectureMaterials,
  generateUnitStudyGuide,
  StudyAiError,
  transcribeAudio,
} from '@/src/lib/studyAi';

function jsonResponse(status: number, ok: boolean, body: unknown) {
  return { ok, status, json: jest.fn().mockResolvedValue(body) };
}

function brokenJsonResponse(status: number) {
  return { ok: false, status, json: jest.fn().mockRejectedValue(new Error('not JSON')) };
}

describe('studyAi.ts client wrappers', () => {
  const originalFetch = globalThis.fetch;
  const originalPlatformOS = Platform.OS;

  beforeEach(() => {
    // Native's FormData path in appendAudioToFormData doesn't fetch the audio URI, so
    // transcribeAudio only makes one network call (to /api/transcribe) — simpler to mock.
    Platform.OS = 'ios';
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    Platform.OS = originalPlatformOS;
  });

  describe('transcribeAudio', () => {
    it('returns the parsed transcript on success', async () => {
      const result = { text: 'Hello class.', durationInSeconds: 42 };
      globalThis.fetch = jest.fn().mockResolvedValue(jsonResponse(200, true, result)) as unknown as typeof fetch;

      await expect(transcribeAudio('file:///rec.m4a', 'lecture.m4a')).resolves.toEqual(result);
    });

    it('throws StudyAiError with the server-provided message on failure', async () => {
      globalThis.fetch = jest
        .fn()
        .mockResolvedValue(jsonResponse(500, false, { error: 'OPENAI_API_KEY is not configured.' })) as unknown as typeof fetch;

      await expect(transcribeAudio('file:///rec.m4a', 'lecture.m4a')).rejects.toThrow(
        new StudyAiError('OPENAI_API_KEY is not configured.'),
      );
    });

    it('falls back to a generic message when the error body is not JSON', async () => {
      globalThis.fetch = jest.fn().mockResolvedValue(brokenJsonResponse(502)) as unknown as typeof fetch;

      await expect(transcribeAudio('file:///rec.m4a', 'lecture.m4a')).rejects.toThrow(
        new StudyAiError('Request failed with status 502.'),
      );
    });
  });

  describe('generateLectureMaterials', () => {
    it('returns the parsed materials on success', async () => {
      const result = {
        notes: 'Notes',
        summary: 'Summary',
        vocabulary: [],
        formulas: [],
        professorEmphasis: [],
        detectedAssignments: [],
        flashcards: [],
        quiz: [],
        conceptExplanations: [],
      };
      globalThis.fetch = jest.fn().mockResolvedValue(jsonResponse(200, true, result)) as unknown as typeof fetch;

      await expect(generateLectureMaterials('transcript text')).resolves.toEqual(result);
    });

    it('throws StudyAiError with the server-provided message on failure', async () => {
      globalThis.fetch = jest
        .fn()
        .mockResolvedValue(jsonResponse(401, false, { error: 'ANTHROPIC_API_KEY is not configured.' })) as unknown as typeof fetch;

      await expect(generateLectureMaterials('transcript text')).rejects.toThrow(
        new StudyAiError('ANTHROPIC_API_KEY is not configured.'),
      );
    });
  });

  describe('generateUnitStudyGuide', () => {
    it('throws StudyAiError with a generic message when the error body is not JSON', async () => {
      globalThis.fetch = jest.fn().mockResolvedValue(brokenJsonResponse(500)) as unknown as typeof fetch;

      await expect(
        generateUnitStudyGuide('Unit 1', [{ title: 'Lecture 1', transcript: 'transcript' }]),
      ).rejects.toThrow(new StudyAiError('Request failed with status 500.'));
    });
  });
});
