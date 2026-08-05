import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { registerCloudSyncedStore } from '@/src/lib/cloudSync';
import { createId } from '@/src/lib/id';
import { mmkvStateStorage } from '@/src/lib/mmkvStorage';
import type { Lecture, StudyCourse, StudyUnit, UnitStudyGuide } from '@/src/types';

const BLANK_STUDY_DATA = {
  courses: [] as StudyCourse[],
  units: [] as StudyUnit[],
  lectures: [] as Lecture[],
};

interface StudyState {
  courses: StudyCourse[];
  units: StudyUnit[];
  lectures: Lecture[];
  addCourse: (input: Omit<StudyCourse, 'id' | 'createdAt'>) => StudyCourse;
  addUnit: (input: Omit<StudyUnit, 'id' | 'createdAt' | 'studyGuide'>) => StudyUnit;
  addLecture: (input: Omit<Lecture, 'id' | 'transcriptionStatus' | 'generationStatus'>) => Lecture;
  updateLecture: (id: string, patch: Partial<Omit<Lecture, 'id'>>) => void;
  removeLecture: (id: string) => void;
  updateUnitStudyGuide: (unitId: string, patch: Partial<UnitStudyGuide>) => void;
  courseByClassId: (classId: string) => StudyCourse | undefined;
}

/** Drops any leftover pre-launch sample content (ids prefixed `seed-`) while keeping data the user entered themselves. */
function dropSeeds<T extends { id: string }>(items: T[] | undefined): T[] {
  return (items ?? []).filter((item) => !item.id.startsWith('seed-'));
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      ...BLANK_STUDY_DATA,
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
        const created: Lecture = {
          ...input,
          id: createId(),
          transcriptionStatus: 'pending',
          generationStatus: 'not_generated',
        };
        set((state) => ({ lectures: [...state.lectures, created] }));
        return created;
      },
      updateLecture: (id, patch) => {
        set((state) => ({
          lectures: state.lectures.map((lecture) => (lecture.id === id ? { ...lecture, ...patch } : lecture)),
        }));
      },
      removeLecture: (id) => {
        set((state) => ({ lectures: state.lectures.filter((lecture) => lecture.id !== id) }));
      },
      updateUnitStudyGuide: (unitId, patch) => {
        set((state) => ({
          units: state.units.map((unit) =>
            unit.id === unitId ? { ...unit, studyGuide: { ...unit.studyGuide, ...patch } } : unit,
          ),
        }));
      },
      courseByClassId: (classId) => get().courses.find((course) => course.classId === classId),
    }),
    {
      name: 'studiq-study',
      storage: createJSONStorage(() => mmkvStateStorage),
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as StudyState;
        return {
          ...state,
          courses: dropSeeds(state?.courses),
          units: dropSeeds(state?.units),
          lectures: dropSeeds(state?.lectures),
        };
      },
    },
  ),
);

registerCloudSyncedStore({
  name: 'study',
  store: useStudyStore,
  serialize: (state) => ({ courses: state.courses, units: state.units, lectures: state.lectures }),
  blank: BLANK_STUDY_DATA,
});
