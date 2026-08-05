import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { registerCloudSyncedStore } from '@/src/lib/cloudSync';
import { createId } from '@/src/lib/id';
import { mmkvStateStorage } from '@/src/lib/mmkvStorage';
import type { DailyNote } from '@/src/types';

const BLANK_NOTES_DATA = { notes: [] as DailyNote[] };

interface NotesState {
  notes: DailyNote[];
  noteForDate: (date: string) => DailyNote | undefined;
  setNoteForDate: (date: string, body: string) => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      ...BLANK_NOTES_DATA,
      noteForDate: (date) => get().notes.find((note) => note.date === date),
      setNoteForDate: (date, body) => {
        const existing = get().notes.find((note) => note.date === date);
        if (existing) {
          set((state) => ({
            notes: state.notes.map((note) => (note.date === date ? { ...note, body } : note)),
          }));
          return;
        }
        const created: DailyNote = { id: createId(), date, body };
        set((state) => ({ notes: [...state.notes, created] }));
      },
    }),
    { name: 'studiq-notes', storage: createJSONStorage(() => mmkvStateStorage) },
  ),
);

registerCloudSyncedStore({
  name: 'notes',
  store: useNotesStore,
  serialize: (state) => ({ notes: state.notes }),
  blank: BLANK_NOTES_DATA,
});
