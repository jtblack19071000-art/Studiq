import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createId } from '@/src/lib/id';
import { mmkvStateStorage } from '@/src/lib/mmkvStorage';
import type { ScheduleEvent } from '@/src/types';

interface ScheduleState {
  events: ScheduleEvent[];
  addEvent: (input: Omit<ScheduleEvent, 'id'>) => ScheduleEvent;
  updateEvent: (id: string, patch: Partial<Omit<ScheduleEvent, 'id'>>) => void;
  removeEvent: (id: string) => void;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set) => ({
      events: [],
      addEvent: (input) => {
        const created: ScheduleEvent = { ...input, id: createId() };
        set((state) => ({ events: [...state.events, created] }));
        return created;
      },
      updateEvent: (id, patch) => {
        set((state) => ({
          events: state.events.map((event) => (event.id === id ? { ...event, ...patch } : event)),
        }));
      },
      removeEvent: (id) => {
        set((state) => ({ events: state.events.filter((event) => event.id !== id) }));
      },
    }),
    {
      name: 'studiq-schedule',
      storage: createJSONStorage(() => mmkvStateStorage),
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as ScheduleState;
        return {
          ...state,
          events: (state?.events ?? []).filter((event) => !event.id.startsWith('seed-')),
        };
      },
    },
  ),
);
