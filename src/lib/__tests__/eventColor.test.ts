/// <reference types="jest" />

import { resolveEventColor } from '@/src/lib/eventColor';
import type { ScheduleEvent, StudiqClass } from '@/src/types';

function buildEvent(overrides: Partial<ScheduleEvent> = {}): ScheduleEvent {
  return {
    id: 'event-1',
    title: 'Study session',
    category: 'personal',
    startsAt: '2024-01-01T09:00:00.000Z',
    endsAt: '2024-01-01T10:00:00.000Z',
    reminders: [],
    ...overrides,
  };
}

function buildClass(overrides: Partial<StudiqClass> = {}): StudiqClass {
  return {
    id: 'class-1',
    name: 'Organic Chemistry II',
    code: 'CHEM 232',
    color: '#3B6FE0',
    professor: { name: 'Dr. Lindqvist' },
    term: 'Fall 2026',
    ...overrides,
  };
}

describe('resolveEventColor', () => {
  it('uses the event color override when set, even if the event is linked to a class', () => {
    const studiqClass = buildClass({ id: 'class-1', color: '#3B6FE0' });
    const event = buildEvent({ classId: 'class-1', color: '#E0473B' });

    expect(resolveEventColor(event, new Map([['class-1', studiqClass]]))).toBe('#E0473B');
  });

  it('falls back to the linked class color when there is no override', () => {
    const studiqClass = buildClass({ id: 'class-1', color: '#3B6FE0' });
    const event = buildEvent({ classId: 'class-1', category: 'class' });

    expect(resolveEventColor(event, new Map([['class-1', studiqClass]]))).toBe('#3B6FE0');
  });

  it('falls back to the category color when there is no override and no linked class', () => {
    const event = buildEvent({ category: 'work' });

    expect(resolveEventColor(event, new Map())).toBe('#D9862B');
  });

  it('falls back to the category color when classId points at a class that no longer exists', () => {
    const event = buildEvent({ classId: 'deleted-class', category: 'appointment' });

    expect(resolveEventColor(event, new Map())).toBe('#4C9F4C');
  });
});
