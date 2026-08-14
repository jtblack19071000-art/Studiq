/// <reference types="jest" />

import { useClassesStore } from '@/src/state/classesStore';
import { useScheduleStore } from '@/src/state/scheduleStore';

const initialState = useClassesStore.getState();
const initialScheduleState = useScheduleStore.getState();

const baseClassInput = {
  name: 'Linear Algebra',
  code: 'MATH 221',
  color: '#3B6FE0',
  professor: { name: 'Dr. Nguyen' },
  term: 'Fall 2026',
};

beforeEach(() => {
  useClassesStore.setState(initialState, true);
  useScheduleStore.setState(initialScheduleState, true);
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

  it('updateClass merges a patch (e.g. classroom + color) onto only the targeted class', () => {
    const first = useClassesStore.getState().addClass(baseClassInput);
    const second = useClassesStore.getState().addClass({ ...baseClassInput, name: 'Physics I', code: 'PHYS 101' });

    useClassesStore.getState().updateClass(first.id, { classroom: 'Chem Bldg 118', color: '#4C9F4C' });

    const classes = useClassesStore.getState().classes;
    expect(classes.find((studiqClass) => studiqClass.id === first.id)).toMatchObject({
      classroom: 'Chem Bldg 118',
      color: '#4C9F4C',
    });
    expect(classes.find((studiqClass) => studiqClass.id === second.id)?.classroom).toBeUndefined();
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

  it('removeClass also removes the class\'s meeting-time event from the schedule store, not just its own records', () => {
    // The regression this guards: deleting a class left its recurring calendar block behind
    // forever as an orphaned "ghost" event with no class to point back to, because the two
    // stores' delete logic used to be entirely separate.
    const target = useClassesStore.getState().addClass(baseClassInput);
    const other = useClassesStore.getState().addClass({ ...baseClassInput, name: 'Physics I', code: 'PHYS 101' });

    const targetEvent = useScheduleStore.getState().addEvent({
      title: `${target.name} — Lecture`,
      category: 'class',
      classId: target.id,
      startsAt: '2024-01-01T09:00:00.000Z',
      endsAt: '2024-01-01T09:50:00.000Z',
      reminders: [],
      recurrence: { frequency: 'WEEKLY', byWeekday: [0, 2] },
    });
    const otherEvent = useScheduleStore.getState().addEvent({
      title: `${other.name} — Lecture`,
      category: 'class',
      classId: other.id,
      startsAt: '2024-01-01T11:00:00.000Z',
      endsAt: '2024-01-01T11:50:00.000Z',
      reminders: [],
      recurrence: { frequency: 'WEEKLY', byWeekday: [1, 3] },
    });

    useClassesStore.getState().removeClass(target.id);

    const events = useScheduleStore.getState().events;
    expect(events.find((event) => event.id === targetEvent.id)).toBeUndefined();
    expect(events.find((event) => event.id === otherEvent.id)).toEqual(otherEvent);
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

  it('addExam assigns an id and appends to the list', () => {
    const created = useClassesStore.getState().addExam({
      classId: 'class-1',
      title: 'Midterm',
      type: 'midterm',
      date: '2024-03-10T15:00:00.000Z',
    });

    expect(created.id).toBeTruthy();
    expect(useClassesStore.getState().exams).toEqual([created]);
  });

  it('classById finds a class by id, or undefined if none exists', () => {
    const created = useClassesStore.getState().addClass(baseClassInput);

    expect(useClassesStore.getState().classById(created.id)).toEqual(created);
    expect(useClassesStore.getState().classById('no-such-class')).toBeUndefined();
  });

  it('starts with no active semester, so every class shows on the calendar until one is started', () => {
    expect(useClassesStore.getState().activeTerm).toBeNull();
  });

  it('startNewSemester sets the active term, trimmed', () => {
    useClassesStore.getState().startNewSemester('  Spring 2027  ');

    expect(useClassesStore.getState().activeTerm).toBe('Spring 2027');
  });
});
