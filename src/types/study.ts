import type { ID } from './common';

export type TranscriptionStatus = 'pending' | 'transcribing' | 'transcribed' | 'failed';

export interface Lecture {
  id: ID;
  unitId: ID;
  title: string;
  recordedAt: string;
  durationSeconds: number;
  audioUri?: string;
  transcriptionStatus: TranscriptionStatus;
  transcript?: string;
  /** AI-generated per-lecture materials; populated once transcription completes. */
  generatedNotes?: string;
  generatedSummary?: string;
  vocabulary?: { term: string; definition: string }[];
  detectedAssignments?: string[];
}

export type StudyGuideStatus = 'not_generated' | 'generating' | 'ready' | 'failed';

export interface UnitStudyGuide {
  status: StudyGuideStatus;
  generatedAt?: string;
  studyGuide?: string;
  reviewSheet?: string;
  chapterSummary?: string;
  keyConcepts?: string[];
  vocabulary?: { term: string; definition: string }[];
  equationsAndFormulas?: string[];
  flashcards?: { front: string; back: string }[];
  practiceQuiz?: string;
  practiceExam?: string;
  likelyExamTopics?: string[];
  professorEmphasis?: string[];
  mnemonics?: string[];
  reviewChecklist?: string[];
}

export interface StudyUnit {
  id: ID;
  courseId: ID;
  title: string;
  createdAt: string;
  studyGuide: UnitStudyGuide;
}

export interface StudyCourse {
  id: ID;
  classId: ID;
  title: string;
  createdAt: string;
}
