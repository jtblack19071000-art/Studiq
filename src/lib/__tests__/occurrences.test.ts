/// <reference types="jest" />

import { getOccurrencesInRange } from '@/src/lib/occurrences';
import type { ScheduleEvent } from '@/src/types';

function buildEvent(overrides: Partial<ScheduleEvent> = {}): ScheduleEvent {
  return {
    id: 'event-1',
    title: 'CS 101 Lecture',
    category: 'class',
    startsAt: '2024-01-01T09:00:00.000Z',
    endsAt: '2024-01-01T10:30:00.000Z',
    reminders: [],
    ...overrides,
  };
}

describe('getOccurrencesInRange', () => {
  describe('non-recurring events', () => {
    it('returns the single occurrence when it falls inside the range', () => {
      const event = buildEvent();
      const occurrences = getOccurrencesInRange(
        event,
        new Date('2024-01-01T00:00:00.000Z'),
        new Date('2024-01-31T23:59:59.000Z'),
      );

      expect(occurrences).toHaveLength(1);
      expect(occurrences[0].event).toBe(event);
      expect(occurrences[0].startsAt).toEqual(new Date('2024-01-01T09:00:00.000Z'));
      expect(occurrences[0].endsAt).toEqual(new Date('2024-01-01T10:30:00.000Z'));
    });

    it('returns nothing when the event falls outside the range', () => {
      const event = buildEvent({
        startsAt: '2024-02-10T09:00:00.000Z',
        endsAt: '2024-02-10T10:00:00.000Z',
      });
      const occurrences = getOccurrencesInRange(
        event,
        new Date('2024-01-01T00:00:00.000Z'),
        new Date('2024-01-31T23:59:59.000Z'),
      );

      expect(occurrences).toEqual([]);
    });

    it('includes an occurrence that starts exactly on the range boundary', () => {
      const event = buildEvent({
        startsAt: '2024-01-31T23:59:59.000Z',
        endsAt: '2024-02-01T01:00:00.000Z',
      });
      const occurrences = getOccurrencesInRange(
        event,
        new Date('2024-01-01T00:00:00.000Z'),
        new Date('2024-01-31T23:59:59.000Z'),
      );

      expect(occurrences).toHaveLength(1);
    });
  });

  describe('recurring events', () => {
    it('expands a weekly recurrence into one occurrence per matching weekday', () => {
      const event = buildEvent({
        recurrence: { frequency: 'WEEKLY', byWeekday: [0, 2] }, // Monday & Wednesday
      });
      const occurrences = getOccurrencesInRange(
        event,
        new Date('2024-01-01T00:00:00.000Z'),
        new Date('2024-01-14T23:59:59.000Z'),
      );

      expect(occurrences.map((o) => o.startsAt.toISOString())).toEqual([
        '2024-01-01T09:00:00.000Z',
        '2024-01-03T09:00:00.000Z',
        '2024-01-08T09:00:00.000Z',
        '2024-01-10T09:00:00.000Z',
      ]);
    });

    it('preserves the original duration on every generated occurrence', () => {
      const event = buildEvent({
        startsAt: '2024-01-01T09:00:00.000Z',
        endsAt: '2024-01-01T10:30:00.000Z', // 90 minutes
        recurrence: { frequency: 'WEEKLY', byWeekday: [0] },
      });
      const occurrences = getOccurrencesInRange(
        event,
        new Date('2024-01-01T00:00:00.000Z'),
        new Date('2024-01-31T23:59:59.000Z'),
      );

      expect(occurrences.length).toBeGreaterThan(1);
      for (const occurrence of occurrences) {
        const durationMs = occurrence.endsAt.getTime() - occurrence.startsAt.getTime();
        expect(durationMs).toBe(90 * 60 * 1000);
      }
    });

    it('respects a multi-week interval', () => {
      const event = buildEvent({
        recurrence: { frequency: 'WEEKLY', byWeekday: [0], interval: 2 },
      });
      const occurrences = getOccurrencesInRange(
        event,
        new Date('2024-01-01T00:00:00.000Z'),
        new Date('2024-02-29T23:59:59.000Z'),
      );

      expect(occurrences.map((o) => o.startsAt.toISOString())).toEqual([
        '2024-01-01T09:00:00.000Z',
        '2024-01-15T09:00:00.000Z',
        '2024-01-29T09:00:00.000Z',
        '2024-02-12T09:00:00.000Z',
        '2024-02-26T09:00:00.000Z',
      ]);
    });

    it('stops generating occurrences after the until date', () => {
      const event = buildEvent({
        recurrence: { frequency: 'WEEKLY', byWeekday: [0], until: '2024-01-15T23:59:59.000Z' },
      });
      const occurrences = getOccurrencesInRange(
        event,
        new Date('2024-01-01T00:00:00.000Z'),
        new Date('2024-02-29T23:59:59.000Z'),
      );

      expect(occurrences.map((o) => o.startsAt.toISOString())).toEqual([
        '2024-01-01T09:00:00.000Z',
        '2024-01-08T09:00:00.000Z',
        '2024-01-15T09:00:00.000Z',
      ]);
    });

    it('returns nothing when no occurrence falls inside the range', () => {
      const event = buildEvent({
        recurrence: { frequency: 'WEEKLY', byWeekday: [0] },
      });
      const occurrences = getOccurrencesInRange(
        event,
        new Date('2023-12-01T00:00:00.000Z'),
        new Date('2023-12-31T23:59:59.000Z'),
      );

      expect(occurrences).toEqual([]);
    });

    it('never generates an occurrence before dtstart, even for a weekday earlier in the same week', () => {
      // dtstart is Wednesday 2024-01-03; Monday (weekday 0) is requested too, but the current
      // week's Monday (2024-01-01) is before dtstart, so it's correctly excluded. This is the
      // exact reason a class's meeting time must anchor to the week's Monday rather than "today"
      // — see anchorMeetingTimes in src/lib/time.ts — otherwise a class added mid-week with an
      // earlier meeting day looks entirely absent from the calendar until the following week.
      const event = buildEvent({
        startsAt: '2024-01-03T09:00:00.000Z',
        endsAt: '2024-01-03T09:50:00.000Z',
        recurrence: { frequency: 'WEEKLY', byWeekday: [0, 2] }, // Monday & Wednesday
      });
      const occurrences = getOccurrencesInRange(
        event,
        new Date('2024-01-01T00:00:00.000Z'),
        new Date('2024-01-07T23:59:59.000Z'),
      );

      expect(occurrences.map((o) => o.startsAt.toISOString())).toEqual(['2024-01-03T09:00:00.000Z']);
    });
  });
});
