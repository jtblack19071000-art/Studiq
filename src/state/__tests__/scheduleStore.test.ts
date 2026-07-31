/// <reference types="jest" />

import { useScheduleStore } from '@/src/state/scheduleStore';

const initialState = useScheduleStore.getState();

const baseInput = {
  title: 'Study group',
  category: 'personal' as const,
  startsAt: '2024-03-01T18:00:00.000Z',
  endsAt: '2024-03-01T19:00:00.000Z',
  reminders: [],
};

beforeEach(() => {
  useScheduleStore.setState(initialState, true);
});

describe('useScheduleStore', () => {
  it('seeds with starter events', () => {
    expect(useScheduleStore.getState().events.length).toBeGreaterThan(0);
  });

  it('addEvent assigns an id and appends to the list', () => {
    const before = useScheduleStore.getState().events.length;
    const created = useScheduleStore.getState().addEvent(baseInput);

    expect(created.id).toBeTruthy();
    const events = useScheduleStore.getState().events;
    expect(events).toHaveLength(before + 1);
    expect(events[events.length - 1]).toEqual(created);
  });

  it('updateEvent merges a partial patch onto only the targeted event', () => {
    const created = useScheduleStore.getState().addEvent(baseInput);
    const seededId = useScheduleStore.getState().events[0].id;

    useScheduleStore.getState().updateEvent(created.id, { title: 'Renamed session', location: 'Library' });

    const events = useScheduleStore.getState().events;
    const updated = events.find((event) => event.id === created.id);
    expect(updated).toMatchObject({
      title: 'Renamed session',
      location: 'Library',
      startsAt: baseInput.startsAt, // untouched fields survive the patch
    });
    expect(events.find((event) => event.id === seededId)?.title).not.toBe('Renamed session');
  });

  it('removeEvent removes only the targeted event', () => {
    const created = useScheduleStore.getState().addEvent(baseInput);
    const before = useScheduleStore.getState().events.length;

    useScheduleStore.getState().removeEvent(created.id);

    const events = useScheduleStore.getState().events;
    expect(events).toHaveLength(before - 1);
    expect(events.find((event) => event.id === created.id)).toBeUndefined();
  });
});
