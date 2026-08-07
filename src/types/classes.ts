import type { ID } from './common';

export interface ProfessorInfo {
  name: string;
  email?: string;
  officeLocation?: string;
  officeHours?: string;
}

export type AssignmentStatus = 'not_started' | 'in_progress' | 'submitted' | 'graded';

export interface Assignment {
  id: ID;
  classId: ID;
  title: string;
  dueAt: string;
  status: AssignmentStatus;
  grade?: string;
  notes?: string;
  /** Where the due date came from — 'syllabus' for AI-extracted syllabus imports, since a
   * professor can always change a due date after the syllabus was written. Undefined means
   * entered by hand. There's no live Canvas/Google Classroom/Brightspace sync (see Import
   * syllabus) — each is a different company's own API requiring institution-specific credentials
   * this app can't obtain on a student's behalf, so the syllabus is the source of truth here. */
  source?: 'syllabus';
}

export type ExamType = 'quiz' | 'midterm' | 'final' | 'other';

export interface Exam {
  id: ID;
  classId: ID;
  title: string;
  type: ExamType;
  date: string;
  location?: string;
}

export interface ClassFile {
  id: ID;
  classId: ID;
  name: string;
  url: string;
  uploadedAt: string;
}

export interface Announcement {
  id: ID;
  classId: ID;
  title: string;
  body: string;
  postedAt: string;
}

export interface GradeEntry {
  id: ID;
  classId: ID;
  label: string;
  weightPercent?: number;
  earnedPercent?: number;
}

export type LetterGrade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-' | 'F';

export interface StudiqClass {
  id: ID;
  name: string;
  code: string;
  color: string;
  professor: ProfessorInfo;
  classroom?: string;
  term: string;
  /** Links to the matching Study workspace Course, once created. */
  studyCourseId?: ID;
  creditHours?: number;
  /** Final letter grade, entered once the class is complete; drives the GPA Tracker. */
  finalGrade?: LetterGrade;
}
