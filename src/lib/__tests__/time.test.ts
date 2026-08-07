/// <reference types="jest" />

import { startOfWeek } from 'date-fns';

import { anchorMeetingTimes, formatTimeOfDay, parseFlexibleDate, parseTimeToday } from '@/src/lib/time';

function hm(date: Date | null): string | null {
  if (!date) return null;
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
}

describe('parseTimeToday', () => {
  it('parses 12-hour PM times without a leading zero, e.g. "1:30 PM"', () => {
    expect(hm(parseTimeToday('1:30 PM'))).toBe('13:30');
  });

  it('parses 12-hour AM times without a leading zero, e.g. "9:05 AM"', () => {
    expect(hm(parseTimeToday('9:05 AM'))).toBe('9:05');
  });

  it('accepts periods, no space, and lowercase — "1:30P.M.", "1:30pm", "1:30 p.m."', () => {
    expect(hm(parseTimeToday('1:30P.M.'))).toBe('13:30');
    expect(hm(parseTimeToday('1:30pm'))).toBe('13:30');
    expect(hm(parseTimeToday('1:30 p.m.'))).toBe('13:30');
  });

  it('handles the 12-hour edge cases: 12 AM is midnight, 12 PM is noon', () => {
    expect(hm(parseTimeToday('12:00 AM'))).toBe('0:00');
    expect(hm(parseTimeToday('12:00 PM'))).toBe('12:00');
  });

  it('still accepts bare 24-hour "HH:mm" for backward compatibility', () => {
    expect(hm(parseTimeToday('13:30'))).toBe('13:30');
    expect(hm(parseTimeToday('9:05'))).toBe('9:05');
  });

  it('rejects an out-of-range 12-hour hour, e.g. "13:30 PM"', () => {
    expect(parseTimeToday('13:30 PM')).toBeNull();
  });

  it('rejects invalid minutes and garbage input', () => {
    expect(parseTimeToday('1:75 PM')).toBeNull();
    expect(parseTimeToday('not a time')).toBeNull();
    expect(parseTimeToday('')).toBeNull();
  });

  it('a PM start time correctly compares after an earlier PM end typed without AM/PM confusion', () => {
    // The bug this guards against: typing a class as "1:30 PM" to "2:20 PM" must not be
    // misread as "1:30 AM" to "2:20 AM" and it must not spuriously report start >= end.
    const start = parseTimeToday('1:30 PM')!;
    const end = parseTimeToday('2:20 PM')!;
    expect(end.getTime()).toBeGreaterThan(start.getTime());
  });
});

describe('parseFlexibleDate', () => {
  it('parses a date that already includes a year', () => {
    const date = parseFlexibleDate('Feb 14, 2026')!;
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(1);
    expect(date.getDate()).toBe(14);
  });

  it('assumes the current year when none is given', () => {
    const date = parseFlexibleDate('March 3')!;
    expect(date.getFullYear()).toBe(new Date().getFullYear());
    expect(date.getMonth()).toBe(2);
    expect(date.getDate()).toBe(3);
  });

  it('accepts numeric formats like "2/14/2026" and "2026-02-14"', () => {
    expect(parseFlexibleDate('2/14/2026')!.getMonth()).toBe(1);
    expect(parseFlexibleDate('2026-02-14')!.getFullYear()).toBe(2026);
  });

  it('defaults to noon local time when no hour is given', () => {
    const date = parseFlexibleDate('Feb 14, 2026')!;
    expect(date.getHours()).toBe(12);
  });

  it('respects a custom hour', () => {
    const date = parseFlexibleDate('Feb 14, 2026', 23)!;
    expect(date.getHours()).toBe(23);
  });

  it('returns null for empty or unparseable input', () => {
    expect(parseFlexibleDate('')).toBeNull();
    expect(parseFlexibleDate('   ')).toBeNull();
    expect(parseFlexibleDate('not a date at all')).toBeNull();
  });
});

describe('anchorMeetingTimes', () => {
  it('anchors to this week\'s Monday, not "today" — a Monday meeting still resolves even if added later in the week', () => {
    const { startsAt, endsAt } = anchorMeetingTimes('9:00 AM', '9:50 AM')!;
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    expect(startsAt.getDay()).toBe(1); // Monday
    expect(startsAt.getFullYear()).toBe(monday.getFullYear());
    expect(startsAt.getMonth()).toBe(monday.getMonth());
    expect(startsAt.getDate()).toBe(monday.getDate());
    expect(hm(startsAt)).toBe('9:00');
    expect(hm(endsAt)).toBe('9:50');
  });

  it('returns null when either time fails to parse', () => {
    expect(anchorMeetingTimes('not a time', '9:50 AM')).toBeNull();
    expect(anchorMeetingTimes('9:00 AM', '')).toBeNull();
  });
});

describe('formatTimeOfDay', () => {
  it('formats an afternoon time as 12-hour with no leading zero', () => {
    expect(formatTimeOfDay(new Date(2024, 2, 1, 13, 30).toISOString())).toBe('1:30 PM');
  });

  it('formats midnight and noon correctly', () => {
    expect(formatTimeOfDay(new Date(2024, 2, 1, 0, 0).toISOString())).toBe('12:00 AM');
    expect(formatTimeOfDay(new Date(2024, 2, 1, 12, 0).toISOString())).toBe('12:00 PM');
  });
});
