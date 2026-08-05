import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { registerCloudSyncedStore } from '@/src/lib/cloudSync';
import { createId } from '@/src/lib/id';
import { mmkvStateStorage } from '@/src/lib/mmkvStorage';
import type { Announcement, Assignment, ClassFile, Exam, GradeEntry, StudiqClass } from '@/src/types';

const BLANK_CLASSES_DATA = {
  classes: [] as StudiqClass[],
  assignments: [] as Assignment[],
  exams: [] as Exam[],
  files: [] as ClassFile[],
  announcements: [] as Announcement[],
  grades: [] as GradeEntry[],
};

interface ClassesState {
  classes: StudiqClass[];
  assignments: Assignment[];
  exams: Exam[];
  files: ClassFile[];
  announcements: Announcement[];
  grades: GradeEntry[];
  addClass: (input: Omit<StudiqClass, 'id'>) => StudiqClass;
  updateClass: (id: string, patch: Partial<Omit<StudiqClass, 'id'>>) => void;
  removeClass: (id: string) => void;
  addAssignment: (input: Omit<Assignment, 'id'>) => Assignment;
  updateAssignmentStatus: (id: string, status: Assignment['status']) => void;
  classById: (id: string) => StudiqClass | undefined;
}

/** Drops any leftover pre-launch sample content (ids prefixed `seed-`) while keeping data the user entered themselves. */
function dropSeeds<T extends { id: string }>(items: T[] | undefined): T[] {
  return (items ?? []).filter((item) => !item.id.startsWith('seed-'));
}

export const useClassesStore = create<ClassesState>()(
  persist(
    (set, get) => ({
      ...BLANK_CLASSES_DATA,
      addClass: (input) => {
        const created: StudiqClass = { ...input, id: createId() };
        set((state) => ({ classes: [...state.classes, created] }));
        return created;
      },
      updateClass: (id, patch) => {
        set((state) => ({
          classes: state.classes.map((studiqClass) =>
            studiqClass.id === id ? { ...studiqClass, ...patch } : studiqClass,
          ),
        }));
      },
      removeClass: (id) => {
        set((state) => ({
          classes: state.classes.filter((studiqClass) => studiqClass.id !== id),
          assignments: state.assignments.filter((assignment) => assignment.classId !== id),
          exams: state.exams.filter((exam) => exam.classId !== id),
          files: state.files.filter((file) => file.classId !== id),
          announcements: state.announcements.filter((announcement) => announcement.classId !== id),
          grades: state.grades.filter((grade) => grade.classId !== id),
        }));
      },
      addAssignment: (input) => {
        const created: Assignment = { ...input, id: createId() };
        set((state) => ({ assignments: [...state.assignments, created] }));
        return created;
      },
      updateAssignmentStatus: (id, status) => {
        set((state) => ({
          assignments: state.assignments.map((assignment) =>
            assignment.id === id ? { ...assignment, status } : assignment,
          ),
        }));
      },
      classById: (id) => get().classes.find((studiqClass) => studiqClass.id === id),
    }),
    {
      name: 'studiq-classes',
      storage: createJSONStorage(() => mmkvStateStorage),
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as ClassesState;
        return {
          ...state,
          classes: dropSeeds(state?.classes),
          assignments: dropSeeds(state?.assignments),
          exams: dropSeeds(state?.exams),
          announcements: dropSeeds(state?.announcements),
        };
      },
    },
  ),
);

registerCloudSyncedStore({
  name: 'classes',
  store: useClassesStore,
  serialize: (state) => ({
    classes: state.classes,
    assignments: state.assignments,
    exams: state.exams,
    files: state.files,
    announcements: state.announcements,
    grades: state.grades,
  }),
  blank: BLANK_CLASSES_DATA,
});
