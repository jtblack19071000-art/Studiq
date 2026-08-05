/// <reference types="jest" />

import { formatTimeOfDay, parseTimeToday } from '@/src/lib/time';

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

describe('formatTimeOfDay', () => {
  it('formats an afternoon time as 12-hour with no leading zero', () => {
    expect(formatTimeOfDay(new Date(2024, 2, 1, 13, 30).toISOString())).toBe('1:30 PM');
  });

  it('formats midnight and noon correctly', () => {
    expect(formatTimeOfDay(new Date(2024, 2, 1, 0, 0).toISOString())).toBe('12:00 AM');
    expect(formatTimeOfDay(new Date(2024, 2, 1, 12, 0).toISOString())).toBe('12:00 PM');
  });
});
