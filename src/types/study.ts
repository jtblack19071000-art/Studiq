import type { ID } from './common';

export type TranscriptionStatus = 'pending' | 'transcribing' | 'transcribed' | 'failed';
export type GenerationStatus = 'not_generated' | 'generating' | 'ready' | 'failed';

export interface VocabularyEntry {
  term: string;
  definition: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface QuizQuestion {
  question: string;
  options?: string[];
  answer: string;
}

export interface ConceptExplanation {
  concept: string;
  explanation: string;
}

export interface Lecture {
  id: ID;
  unitId: ID;
  title: string;
  recordedAt: string;
  durationSeconds: number;
  audioUri?: string;
  transcriptionStatus: TranscriptionStatus;
  transcriptionError?: string;
  transcript?: string;
  generationStatus: GenerationStatus;
  generationError?: string;
  /** AI-generated per-lecture materials; populated once generation completes. */
  generatedNotes?: string;
  generatedSummary?: string;
  vocabulary?: VocabularyEntry[];
  formulas?: string[];
  professorEmphasis?: string[];
  detectedAssignments?: string[];
  flashcards?: Flashcard[];
  quiz?: QuizQuestion[];
  conceptExplanations?: ConceptExplanation[];
}

export interface UnitStudyGuide {
  status: GenerationStatus;
  error?: string;
  generatedAt?: string;
  studyGuide?: string;
  reviewSheet?: string;
  chapterSummary?: string;
  keyConcepts?: string[];
  vocabulary?: VocabularyEntry[];
  equationsAndFormulas?: string[];
  flashcards?: Flashcard[];
  practiceQuiz?: QuizQuestion[];
  practiceExam?: QuizQuestion[];
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
