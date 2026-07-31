/// <reference types="jest" />

import { layoutDayOccurrences } from '@/src/lib/weekGridLayout';
import type { EventOccurrence } from '@/src/lib/occurrences';
import type { ScheduleEvent } from '@/src/types';

function buildEvent(id: string, overrides: Partial<ScheduleEvent> = {}): ScheduleEvent {
  return {
    id,
    title: `Event ${id}`,
    category: 'personal',
    startsAt: '2024-01-01T09:00:00.000Z',
    endsAt: '2024-01-01T10:00:00.000Z',
    reminders: [],
    ...overrides,
  };
}

function occurrence(id: string, startsAt: string, endsAt: string): EventOccurrence {
  return { event: buildEvent(id), startsAt: new Date(startsAt), endsAt: new Date(endsAt) };
}

function byEventId(positioned: ReturnType<typeof layoutDayOccurrences>) {
  return Object.fromEntries(
    positioned.map((p) => [p.occurrence.event.id, { column: p.column, columnCount: p.columnCount }]),
  );
}

describe('layoutDayOccurrences', () => {
  it('returns an empty array for no occurrences', () => {
    expect(layoutDayOccurrences([])).toEqual([]);
  });

  it('gives a single occurrence column 0 with columnCount 1', () => {
    const result = layoutDayOccurrences([occurrence('a', '2024-01-01T09:00:00.000Z', '2024-01-01T10:00:00.000Z')]);
    expect(result).toEqual([{ occurrence: expect.anything(), column: 0, columnCount: 1 }]);
  });

  it('gives sequential non-overlapping occurrences their own column 0, each in its own cluster', () => {
    const result = layoutDayOccurrences([
      occurrence('a', '2024-01-01T09:00:00.000Z', '2024-01-01T10:00:00.000Z'),
      occurrence('b', '2024-01-01T11:00:00.000Z', '2024-01-01T12:00:00.000Z'),
    ]);
    expect(byEventId(result)).toEqual({
      a: { column: 0, columnCount: 1 },
      b: { column: 0, columnCount: 1 },
    });
  });

  it('places two fully-overlapping occurrences side by side', () => {
    const result = layoutDayOccurrences([
      occurrence('a', '2024-01-01T09:00:00.000Z', '2024-01-01T10:00:00.000Z'),
      occurrence('b', '2024-01-01T09:00:00.000Z', '2024-01-01T10:00:00.000Z'),
    ]);
    expect(byEventId(result)).toEqual({
      a: { column: 0, columnCount: 2 },
      b: { column: 1, columnCount: 2 },
    });
  });

  it('places a partially-overlapping occurrence in a second column', () => {
    const result = layoutDayOccurrences([
      occurrence('a', '2024-01-01T09:00:00.000Z', '2024-01-01T10:00:00.000Z'),
      occurrence('b', '2024-01-01T09:30:00.000Z', '2024-01-01T10:30:00.000Z'),
    ]);
    expect(byEventId(result)).toEqual({
      a: { column: 0, columnCount: 2 },
      b: { column: 1, columnCount: 2 },
    });
  });

  it('reuses a column once its previous occupant has ended', () => {
    const result = layoutDayOccurrences([
      occurrence('a', '2024-01-01T09:00:00.000Z', '2024-01-01T10:00:00.000Z'),
      occurrence('b', '2024-01-01T09:00:00.000Z', '2024-01-01T11:00:00.000Z'),
      // Starts exactly when 'a' ends, but 'b' is still running — needs a third column.
      occurrence('c', '2024-01-01T10:00:00.000Z', '2024-01-01T10:30:00.000Z'),
    ]);
    const byId = byEventId(result);
    expect(byId.a.column).toBe(0);
    expect(byId.b.column).toBe(1);
    expect(byId.c.column).toBe(0); // reuses column 0, freed up when 'a' ended
    // Peak concurrency is 2 ('a' and 'b' overlapping) — 'c' reusing column 0 doesn't add a third.
    expect(byId.a.columnCount).toBe(2);
    expect(byId.c.columnCount).toBe(2);
  });

  it('gives a three-way overlap three columns', () => {
    const result = layoutDayOccurrences([
      occurrence('a', '2024-01-01T09:00:00.000Z', '2024-01-01T10:00:00.000Z'),
      occurrence('b', '2024-01-01T09:15:00.000Z', '2024-01-01T09:45:00.000Z'),
      occurrence('c', '2024-01-01T09:30:00.000Z', '2024-01-01T10:15:00.000Z'),
    ]);
    const columnCounts = new Set(result.map((p) => p.columnCount));
    expect(columnCounts).toEqual(new Set([3]));
    const columns = new Set(result.map((p) => p.column));
    expect(columns).toEqual(new Set([0, 1, 2]));
  });

  it('keeps an unrelated later event in its own cluster instead of being squeezed by an earlier overlap', () => {
    const result = layoutDayOccurrences([
      occurrence('a', '2024-01-01T09:00:00.000Z', '2024-01-01T10:00:00.000Z'),
      occurrence('b', '2024-01-01T09:00:00.000Z', '2024-01-01T10:00:00.000Z'),
      occurrence('c', '2024-01-01T14:00:00.000Z', '2024-01-01T15:00:00.000Z'),
    ]);
    const byId = byEventId(result);
    expect(byId.a.columnCount).toBe(2);
    expect(byId.b.columnCount).toBe(2);
    expect(byId.c.columnCount).toBe(1);
    expect(byId.c.column).toBe(0);
  });
});
