/// <reference types="jest" />

import { useNotesStore } from '@/src/state/notesStore';

const initialState = useNotesStore.getState();

beforeEach(() => {
  useNotesStore.setState(initialState, true);
});

describe('useNotesStore', () => {
  it('starts with no notes', () => {
    expect(useNotesStore.getState().notes).toEqual([]);
  });

  it('creates a new note for a date with no existing note', () => {
    useNotesStore.getState().setNoteForDate('2024-03-01', 'Finish problem set');

    const notes = useNotesStore.getState().notes;
    expect(notes).toHaveLength(1);
    expect(notes[0]).toMatchObject({ date: '2024-03-01', body: 'Finish problem set' });
    expect(notes[0].id).toBeTruthy();
  });

  it('overwrites the body of an existing note for the same date instead of duplicating it', () => {
    useNotesStore.getState().setNoteForDate('2024-03-01', 'First draft');
    const firstId = useNotesStore.getState().notes[0].id;

    useNotesStore.getState().setNoteForDate('2024-03-01', 'Revised draft');

    const notes = useNotesStore.getState().notes;
    expect(notes).toHaveLength(1);
    expect(notes[0]).toMatchObject({ id: firstId, date: '2024-03-01', body: 'Revised draft' });
  });

  it('keeps notes for different dates separate', () => {
    useNotesStore.getState().setNoteForDate('2024-03-01', 'Day one');
    useNotesStore.getState().setNoteForDate('2024-03-02', 'Day two');

    expect(useNotesStore.getState().notes).toHaveLength(2);
  });

  it('noteForDate finds the note matching a date, or undefined if none exists', () => {
    useNotesStore.getState().setNoteForDate('2024-03-01', 'Some notes');

    expect(useNotesStore.getState().noteForDate('2024-03-01')?.body).toBe('Some notes');
    expect(useNotesStore.getState().noteForDate('2024-03-02')).toBeUndefined();
  });
});
