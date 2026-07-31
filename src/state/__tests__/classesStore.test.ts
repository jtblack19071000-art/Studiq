/// <reference types="jest" />

import { useClassesStore } from '@/src/state/classesStore';

const initialState = useClassesStore.getState();

const baseClassInput = {
  name: 'Linear Algebra',
  code: 'MATH 221',
  color: '#3B6FE0',
  professor: { name: 'Dr. Nguyen' },
  term: 'Fall 2026',
};

beforeEach(() => {
  useClassesStore.setState(initialState, true);
});

describe('useClassesStore', () => {
  it('seeds with starter classes, assignments, exams, and announcements', () => {
    const state = useClassesStore.getState();
    expect(state.classes.length).toBeGreaterThan(0);
    expect(state.assignments.length).toBeGreaterThan(0);
    expect(state.exams.length).toBeGreaterThan(0);
    expect(state.announcements.length).toBeGreaterThan(0);
    expect(state.files).toEqual([]);
    expect(state.grades).toEqual([]);
  });

  it('addClass assigns an id and appends to the list', () => {
    const before = useClassesStore.getState().classes.length;
    const created = useClassesStore.getState().addClass(baseClassInput);

    expect(created.id).toBeTruthy();
    expect(useClassesStore.getState().classes).toHaveLength(before + 1);
  });

  it('updateClass merges a patch (e.g. credit hours + final grade) onto only the targeted class', () => {
    const created = useClassesStore.getState().addClass(baseClassInput);
    const seededId = useClassesStore.getState().classes[0].id;

    useClassesStore.getState().updateClass(created.id, { creditHours: 4, finalGrade: 'A-' });

    const classes = useClassesStore.getState().classes;
    const updated = classes.find((studiqClass) => studiqClass.id === created.id);
    expect(updated).toMatchObject({ creditHours: 4, finalGrade: 'A-', name: baseClassInput.name });
    expect(classes.find((studiqClass) => studiqClass.id === seededId)?.finalGrade).not.toBe('A-');
  });

  it('addAssignment assigns an id and appends to the list', () => {
    const before = useClassesStore.getState().assignments.length;
    const created = useClassesStore.getState().addAssignment({
      classId: 'class-1',
      title: 'Homework 1',
      dueAt: '2024-03-10T23:59:00.000Z',
      status: 'not_started',
    });

    expect(created.id).toBeTruthy();
    expect(useClassesStore.getState().assignments).toHaveLength(before + 1);
  });

  it('updateAssignmentStatus updates only the targeted assignment', () => {
    const created = useClassesStore.getState().addAssignment({
      classId: 'class-1',
      title: 'Homework 1',
      dueAt: '2024-03-10T23:59:00.000Z',
      status: 'not_started',
    });
    const seededId = useClassesStore.getState().assignments[0].id;

    useClassesStore.getState().updateAssignmentStatus(created.id, 'submitted');

    const assignments = useClassesStore.getState().assignments;
    expect(assignments.find((a) => a.id === created.id)?.status).toBe('submitted');
    expect(assignments.find((a) => a.id === seededId)?.status).not.toBe('submitted');
  });

  it('classById finds a class by id, or undefined if none exists', () => {
    const seededClass = useClassesStore.getState().classes[0];

    expect(useClassesStore.getState().classById(seededClass.id)).toEqual(seededClass);
    expect(useClassesStore.getState().classById('no-such-class')).toBeUndefined();
  });
});
