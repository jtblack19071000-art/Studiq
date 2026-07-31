/// <reference types="jest" />

import { useStudyStore } from '@/src/state/studyStore';

const initialState = useStudyStore.getState();

beforeEach(() => {
  useStudyStore.setState(initialState, true);
});

describe('useStudyStore', () => {
  it('seeds with a starter course, unit, and lecture', () => {
    const state = useStudyStore.getState();
    expect(state.courses.length).toBeGreaterThan(0);
    expect(state.units.length).toBeGreaterThan(0);
    expect(state.lectures.length).toBeGreaterThan(0);
  });

  it('addCourse assigns an id and createdAt', () => {
    const before = useStudyStore.getState().courses.length;
    const created = useStudyStore.getState().addCourse({ classId: 'class-1', title: 'Intro to Physics' });

    expect(created.id).toBeTruthy();
    expect(created.createdAt).toBeTruthy();
    expect(useStudyStore.getState().courses).toHaveLength(before + 1);
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
    const seededTranscript = useStudyStore.getState().lectures[0].transcript;
    const created = useStudyStore.getState().addLecture({
      unitId: 'unit-1',
      title: 'Lecture 1',
      recordedAt: '2024-03-01T00:00:00.000Z',
      durationSeconds: 600,
    });
    const seededId = useStudyStore.getState().lectures[0].id;

    useStudyStore.getState().updateLecture(created.id, {
      transcriptionStatus: 'transcribed',
      transcript: 'Full transcript text.',
    });

    const lectures = useStudyStore.getState().lectures;
    const updated = lectures.find((lecture) => lecture.id === created.id);
    expect(updated?.transcriptionStatus).toBe('transcribed');
    expect(updated?.transcript).toBe('Full transcript text.');
    // The seeded lecture is untouched by patching a different lecture.
    expect(lectures.find((lecture) => lecture.id === seededId)?.transcript).toBe(seededTranscript);
  });

  it('updateUnitStudyGuide merges a patch into the existing studyGuide rather than replacing it', () => {
    const created = useStudyStore.getState().addUnit({ courseId: 'course-1', title: 'Unit 1' });

    useStudyStore.getState().updateUnitStudyGuide(created.id, { status: 'generating' });
    useStudyStore.getState().updateUnitStudyGuide(created.id, { status: 'ready', studyGuide: 'Guide text' });

    const unit = useStudyStore.getState().units.find((u) => u.id === created.id);
    expect(unit?.studyGuide).toEqual({ status: 'ready', studyGuide: 'Guide text' });
  });

  it('courseByClassId finds the course linked to a class, or undefined if none exists', () => {
    const seededCourse = useStudyStore.getState().courses[0];

    expect(useStudyStore.getState().courseByClassId(seededCourse.classId)).toEqual(seededCourse);
    expect(useStudyStore.getState().courseByClassId('no-such-class')).toBeUndefined();
  });
});
