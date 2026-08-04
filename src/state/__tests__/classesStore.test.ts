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
  it('starts blank so every student begins with their own classes, not sample data', () => {
    const state = useClassesStore.getState();
    expect(state.classes).toEqual([]);
    expect(state.assignments).toEqual([]);
    expect(state.exams).toEqual([]);
    expect(state.announcements).toEqual([]);
    expect(state.files).toEqual([]);
    expect(state.grades).toEqual([]);
  });

  it('addClass assigns an id and appends to the list', () => {
    const created = useClassesStore.getState().addClass(baseClassInput);

    expect(created.id).toBeTruthy();
    expect(useClassesStore.getState().classes).toEqual([created]);
  });

  it('updateClass merges a patch (e.g. credit hours + final grade) onto only the targeted class', () => {
    const first = useClassesStore.getState().addClass(baseClassInput);
    const second = useClassesStore.getState().addClass({ ...baseClassInput, name: 'Physics I', code: 'PHYS 101' });

    useClassesStore.getState().updateClass(first.id, { creditHours: 4, finalGrade: 'A-' });

    const classes = useClassesStore.getState().classes;
    expect(classes.find((studiqClass) => studiqClass.id === first.id)).toMatchObject({
      creditHours: 4,
      finalGrade: 'A-',
    });
    expect(classes.find((studiqClass) => studiqClass.id === second.id)?.finalGrade).toBeUndefined();
  });

  it('removeClass deletes the class and cascades to its assignments, exams, and announcements', () => {
    const target = useClassesStore.getState().addClass(baseClassInput);
    const other = useClassesStore.getState().addClass({ ...baseClassInput, name: 'Physics I', code: 'PHYS 101' });

    useClassesStore.getState().addAssignment({
      classId: target.id,
      title: 'Homework 1',
      dueAt: '2024-03-10T23:59:00.000Z',
      status: 'not_started',
    });
    const keptAssignment = useClassesStore.getState().addAssignment({
      classId: other.id,
      title: 'Lab report',
      dueAt: '2024-03-10T23:59:00.000Z',
      status: 'not_started',
    });

    useClassesStore.getState().removeClass(target.id);

    const state = useClassesStore.getState();
    expect(state.classes).toEqual([other]);
    expect(state.assignments).toEqual([keptAssignment]);
  });

  it('addAssignment assigns an id and appends to the list', () => {
    const created = useClassesStore.getState().addAssignment({
      classId: 'class-1',
      title: 'Homework 1',
      dueAt: '2024-03-10T23:59:00.000Z',
      status: 'not_started',
    });

    expect(created.id).toBeTruthy();
    expect(useClassesStore.getState().assignments).toEqual([created]);
  });

  it('updateAssignmentStatus updates only the targeted assignment', () => {
    const first = useClassesStore.getState().addAssignment({
      classId: 'class-1',
      title: 'Homework 1',
      dueAt: '2024-03-10T23:59:00.000Z',
      status: 'not_started',
    });
    const second = useClassesStore.getState().addAssignment({
      classId: 'class-1',
      title: 'Homework 2',
      dueAt: '2024-03-17T23:59:00.000Z',
      status: 'not_started',
    });

    useClassesStore.getState().updateAssignmentStatus(first.id, 'submitted');

    const assignments = useClassesStore.getState().assignments;
    expect(assignments.find((a) => a.id === first.id)?.status).toBe('submitted');
    expect(assignments.find((a) => a.id === second.id)?.status).toBe('not_started');
  });

  it('classById finds a class by id, or undefined if none exists', () => {
    const created = useClassesStore.getState().addClass(baseClassInput);

    expect(useClassesStore.getState().classById(created.id)).toEqual(created);
    expect(useClassesStore.getState().classById('no-such-class')).toBeUndefined();
  });
});
