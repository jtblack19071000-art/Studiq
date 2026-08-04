/// <reference types="jest" />

import { useStudyStore } from '@/src/state/studyStore';

const initialState = useStudyStore.getState();

beforeEach(() => {
  useStudyStore.setState(initialState, true);
});

describe('useStudyStore', () => {
  it('starts blank so every student begins with their own courses, not sample data', () => {
    const state = useStudyStore.getState();
    expect(state.courses).toEqual([]);
    expect(state.units).toEqual([]);
    expect(state.lectures).toEqual([]);
  });

  it('addCourse assigns an id and createdAt', () => {
    const created = useStudyStore.getState().addCourse({ classId: 'class-1', title: 'Intro to Physics' });

    expect(created.id).toBeTruthy();
    expect(created.createdAt).toBeTruthy();
    expect(useStudyStore.getState().courses).toEqual([created]);
  });

  it('addUnit always starts with a not_generated study guide', () => {
    const created = useStudyStore.getState().addUnit({ courseId: 'course-1', title: 'Unit 1' });

    expect(created.studyGuide).toEqual({ status: 'not_generated' });
  });

  it('addLecture always starts pending transcription and not_generated generation', () => {
    const created = useStudyStore.getState().addLecture({
      unitId: 'unit-1',
      title: 'Lecture 1',
      recordedAt: '2024-03-01T00:00:00.000Z',
      durationSeconds: 600,
    });

    expect(created.transcriptionStatus).toBe('pending');
    expect(created.generationStatus).toBe('not_generated');
  });

  it('updateLecture merges a patch onto only the targeted lecture', () => {
    const first = useStudyStore.getState().addLecture({
      unitId: 'unit-1',
      title: 'Lecture 1',
      recordedAt: '2024-03-01T00:00:00.000Z',
      durationSeconds: 600,
    });
    const second = useStudyStore.getState().addLecture({
      unitId: 'unit-1',
      title: 'Lecture 2',
      recordedAt: '2024-03-08T00:00:00.000Z',
      durationSeconds: 600,
    });

    useStudyStore.getState().updateLecture(first.id, {
      transcriptionStatus: 'transcribed',
      transcript: 'Full transcript text.',
    });

    const lectures = useStudyStore.getState().lectures;
    expect(lectures.find((lecture) => lecture.id === first.id)?.transcript).toBe('Full transcript text.');
    expect(lectures.find((lecture) => lecture.id === second.id)?.transcript).toBeUndefined();
  });

  it('removeLecture removes only the targeted lecture', () => {
    const first = useStudyStore.getState().addLecture({
      unitId: 'unit-1',
      title: 'Lecture 1',
      recordedAt: '2024-03-01T00:00:00.000Z',
      durationSeconds: 600,
    });
    const second = useStudyStore.getState().addLecture({
      unitId: 'unit-1',
      title: 'Lecture 2',
      recordedAt: '2024-03-08T00:00:00.000Z',
      durationSeconds: 600,
    });

    useStudyStore.getState().removeLecture(first.id);

    expect(useStudyStore.getState().lectures).toEqual([second]);
  });

  it('updateUnitStudyGuide merges a patch into the existing studyGuide rather than replacing it', () => {
    const created = useStudyStore.getState().addUnit({ courseId: 'course-1', title: 'Unit 1' });

    useStudyStore.getState().updateUnitStudyGuide(created.id, { status: 'generating' });
    useStudyStore.getState().updateUnitStudyGuide(created.id, { status: 'ready', studyGuide: 'Guide text' });

    const unit = useStudyStore.getState().units.find((u) => u.id === created.id);
    expect(unit?.studyGuide).toEqual({ status: 'ready', studyGuide: 'Guide text' });
  });

  it('courseByClassId finds the course linked to a class, or undefined if none exists', () => {
    const created = useStudyStore.getState().addCourse({ classId: 'class-1', title: 'Intro to Physics' });

    expect(useStudyStore.getState().courseByClassId(created.classId)).toEqual(created);
    expect(useStudyStore.getState().courseByClassId('no-such-class')).toBeUndefined();
  });
});
