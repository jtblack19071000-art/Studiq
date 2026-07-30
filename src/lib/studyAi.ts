import { appendAudioToFormData } from '@/src/lib/audioUpload';
import type { ConceptExplanation, Flashcard, QuizQuestion, VocabularyEntry } from '@/src/types';

export class StudyAiError extends Error {}

async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.error === 'string') return body.error;
  } catch {
    // fall through to generic message
  }
  return `Request failed with status ${response.status}.`;
}

export interface TranscribeResult {
  text: string;
  durationInSeconds: number | null;
}

export async function transcribeAudio(uri: string, fileName: string): Promise<TranscribeResult> {
  const formData = new FormData();
  await appendAudioToFormData(formData, uri, fileName, 'audio/m4a');

  const response = await fetch('/api/transcribe', { method: 'POST', body: formData });
  if (!response.ok) {
    throw new StudyAiError(await parseErrorResponse(response));
  }
  return response.json();
}

export interface LectureMaterials {
  notes: string;
  summary: string;
  vocabulary: VocabularyEntry[];
  formulas: string[];
  professorEmphasis: string[];
  detectedAssignments: string[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  conceptExplanations: ConceptExplanation[];
}

export async function generateLectureMaterials(transcript: string): Promise<LectureMaterials> {
  const response = await fetch('/api/generate-lecture-materials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript }),
  });
  if (!response.ok) {
    throw new StudyAiError(await parseErrorResponse(response));
  }
  return response.json();
}

export interface UnitStudyGuideResult {
  studyGuide: string;
  reviewSheet: string;
  chapterSummary: string;
  keyConcepts: string[];
  vocabulary: VocabularyEntry[];
  equationsAndFormulas: string[];
  flashcards: Flashcard[];
  practiceQuiz: QuizQuestion[];
  practiceExam: QuizQuestion[];
  likelyExamTopics: string[];
  professorEmphasis: string[];
  mnemonics: string[];
  reviewChecklist: string[];
}

export async function generateUnitStudyGuide(
  unitTitle: string,
  lectures: { title: string; transcript: string }[],
): Promise<UnitStudyGuideResult> {
  const response = await fetch('/api/generate-unit-study-guide', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ unitTitle, lectures }),
  });
  if (!response.ok) {
    throw new StudyAiError(await parseErrorResponse(response));
  }
  return response.json();
}
