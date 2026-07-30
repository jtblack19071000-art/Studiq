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

function todayAt(hour: number, minute: number): string {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

const seedEvents: ScheduleEvent[] = [
  {
    id: 'seed-event-orgo-lecture',
    title: 'Organic Chemistry II — Lecture',
    category: 'class',
    classId: 'seed-class-orgo',
    startsAt: todayAt(9, 0),
    endsAt: todayAt(9, 50),
    location: 'Chem Bldg 118',
    recurrence: { frequency: 'WEEKLY', byWeekday: [0, 2, 4] },
    reminders: [{ id: 'r1', minutesBefore: 10 }],
  },
  {
    id: 'seed-event-macro-lecture',
    title: 'Intermediate Macroeconomics — Lecture',
    category: 'class',
    classId: 'seed-class-macro',
    startsAt: todayAt(11, 0),
    endsAt: todayAt(12, 15),
    location: 'Econ Hall 110',
    recurrence: { frequency: 'WEEKLY', byWeekday: [1, 3] },
    reminders: [{ id: 'r2', minutesBefore: 10 }],
  },
  {
    id: 'seed-event-work-shift',
    title: 'Library Front Desk Shift',
    category: 'work',
    startsAt: todayAt(14, 0),
    endsAt: todayAt(17, 0),
    location: 'Main Library',
    recurrence: { frequency: 'WEEKLY', byWeekday: [0, 2] },
    reminders: [{ id: 'r3', minutesBefore: 15 }],
  },
  {
    id: 'seed-event-study-session',
    title: 'Orgo Study Session',
    category: 'personal',
    startsAt: todayAt(19, 0),
    endsAt: todayAt(20, 30),
    location: 'Study Room 3B',
    reminders: [],
  },
];

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set) => ({
      events: seedEvents,
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
    { name: 'studiq-schedule', storage: createJSONStorage(() => mmkvStateStorage) },
  ),
);
