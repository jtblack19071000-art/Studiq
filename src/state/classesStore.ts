import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createId } from '@/src/lib/id';
import { mmkvStateStorage } from '@/src/lib/mmkvStorage';
import type { Announcement, Assignment, ClassFile, Exam, GradeEntry, StudiqClass } from '@/src/types';

interface ClassesState {
  classes: StudiqClass[];
  assignments: Assignment[];
  exams: Exam[];
  files: ClassFile[];
  announcements: Announcement[];
  grades: GradeEntry[];
  addClass: (input: Omit<StudiqClass, 'id'>) => StudiqClass;
  updateClass: (id: string, patch: Partial<Omit<StudiqClass, 'id'>>) => void;
  addAssignment: (input: Omit<Assignment, 'id'>) => Assignment;
  updateAssignmentStatus: (id: string, status: Assignment['status']) => void;
  classById: (id: string) => StudiqClass | undefined;
}

function nextWeekday(daysFromNow: number, hour: number, minute: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

const classIdOrgo = 'seed-class-orgo';
const classIdMacro = 'seed-class-macro';
const classIdArt = 'seed-class-art';

const seedClasses: StudiqClass[] = [
  {
    id: classIdOrgo,
    name: 'Organic Chemistry II',
    code: 'CHEM 232',
    color: '#3B6FE0',
    professor: {
      name: 'Dr. Amara Lindqvist',
      email: 'lindqvist@university.edu',
      officeLocation: 'Chem Bldg 214',
      officeHours: 'Tue/Thu 2:00–3:30 PM',
    },
    classroom: 'Chem Bldg 118',
    term: 'Fall 2026',
    creditHours: 4,
  },
  {
    id: classIdMacro,
    name: 'Intermediate Macroeconomics',
    code: 'ECON 301',
    color: '#D9862B',
    professor: {
      name: 'Prof. Daniel Osei',
      email: 'osei@university.edu',
      officeLocation: 'Econ Hall 402',
      officeHours: 'Mon 1:00–2:00 PM, Wed 3:00–4:00 PM',
    },
    classroom: 'Econ Hall 110',
    term: 'Fall 2026',
    creditHours: 3,
  },
  {
    id: classIdArt,
    name: 'Survey of Modern Art',
    code: 'ARTH 210',
    color: '#7D5BD9',
    professor: {
      name: 'Dr. Priya Chandran',
      officeHours: 'By appointment',
    },
    classroom: 'Fine Arts 220',
    term: 'Fall 2026',
    creditHours: 3,
  },
  {
    id: 'seed-class-bio-spring',
    name: 'Introduction to Biology',
    code: 'BIOL 101',
    color: '#2BA6A4',
    professor: { name: 'Dr. Wren Okafor' },
    term: 'Spring 2026',
    creditHours: 4,
    finalGrade: 'A-',
  },
  {
    id: 'seed-class-writing-spring',
    name: 'College Writing II',
    code: 'ENGL 102',
    color: '#C4478C',
    professor: { name: 'Prof. Lena Marchetti' },
    term: 'Spring 2026',
    creditHours: 3,
    finalGrade: 'B+',
  },
];

const seedAssignments: Assignment[] = [
  {
    id: 'seed-assignment-1',
    classId: classIdOrgo,
    title: 'Problem Set 4 — Reaction Mechanisms',
    dueAt: nextWeekday(2, 23, 59),
    status: 'in_progress',
  },
  {
    id: 'seed-assignment-2',
    classId: classIdMacro,
    title: 'Policy Response Paper',
    dueAt: nextWeekday(4, 17, 0),
    status: 'not_started',
  },
  {
    id: 'seed-assignment-3',
    classId: classIdArt,
    title: 'Museum Visit Reflection',
    dueAt: nextWeekday(6, 23, 59),
    status: 'not_started',
  },
];

const seedExams: Exam[] = [
  {
    id: 'seed-exam-1',
    classId: classIdOrgo,
    title: 'Midterm 2',
    type: 'midterm',
    date: nextWeekday(9, 10, 0),
    location: 'Chem Bldg 118',
  },
  {
    id: 'seed-exam-2',
    classId: classIdMacro,
    title: 'Final Exam',
    type: 'final',
    date: nextWeekday(30, 9, 0),
  },
];

const seedAnnouncements: Announcement[] = [
  {
    id: 'seed-announcement-1',
    classId: classIdOrgo,
    title: 'Office hours moved this week',
    body: 'Thursday office hours moved to Friday 1–2:30 PM due to a department meeting.',
    postedAt: nextWeekday(-1, 9, 0),
  },
];

export const useClassesStore = create<ClassesState>()(
  persist(
    (set, get) => ({
      classes: seedClasses,
      assignments: seedAssignments,
      exams: seedExams,
      files: [],
      announcements: seedAnnouncements,
      grades: [],
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
    { name: 'studiq-classes', storage: createJSONStorage(() => mmkvStateStorage) },
  ),
);
