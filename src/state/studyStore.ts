import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createId } from '@/src/lib/id';
import { mmkvStateStorage } from '@/src/lib/mmkvStorage';
import type { Lecture, StudyCourse, StudyUnit } from '@/src/types';

interface StudyState {
  courses: StudyCourse[];
  units: StudyUnit[];
  lectures: Lecture[];
  addCourse: (input: Omit<StudyCourse, 'id' | 'createdAt'>) => StudyCourse;
  addUnit: (input: Omit<StudyUnit, 'id' | 'createdAt' | 'studyGuide'>) => StudyUnit;
  addLecture: (input: Omit<Lecture, 'id' | 'transcriptionStatus'>) => Lecture;
  courseByClassId: (classId: string) => StudyCourse | undefined;
}

const seedCourseId = 'seed-course-orgo';
const seedUnitId = 'seed-unit-1';

const seedCourses: StudyCourse[] = [
  {
    id: seedCourseId,
    classId: 'seed-class-orgo',
    title: 'Organic Chemistry II',
    createdAt: new Date().toISOString(),
  },
];

const seedUnits: StudyUnit[] = [
  {
    id: seedUnitId,
    courseId: seedCourseId,
    title: 'Unit 1 — Nucleophilic Substitution',
    createdAt: new Date().toISOString(),
    studyGuide: { status: 'not_generated' },
  },
];

const seedLectures: Lecture[] = [
  {
    id: 'seed-lecture-1',
    unitId: seedUnitId,
    title: 'Lecture 3 — SN1 vs SN2',
    recordedAt: new Date().toISOString(),
    durationSeconds: 2820,
    transcriptionStatus: 'transcribed',
    transcript: 'Full transcript will appear here once recording + transcription is wired up.',
    generatedSummary: 'Placeholder summary — AI generation lands in Phase 2.',
  },
];

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      courses: seedCourses,
      units: seedUnits,
      lectures: seedLectures,
      addCourse: (input) => {
        const created: StudyCourse = { ...input, id: createId(), createdAt: new Date().toISOString() };
        set((state) => ({ courses: [...state.courses, created] }));
        return created;
      },
      addUnit: (input) => {
        const created: StudyUnit = {
          ...input,
          id: createId(),
          createdAt: new Date().toISOString(),
          studyGuide: { status: 'not_generated' },
        };
        set((state) => ({ units: [...state.units, created] }));
        return created;
      },
      addLecture: (input) => {
        const created: Lecture = { ...input, id: createId(), transcriptionStatus: 'pending' };
        set((state) => ({ lectures: [...state.lectures, created] }));
        return created;
      },
      courseByClassId: (classId) => get().courses.find((course) => course.classId === classId),
    }),
    { name: 'studiq-study', storage: createJSONStorage(() => mmkvStateStorage) },
  ),
);
