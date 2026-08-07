/// <reference types="jest" />

import {
  DEFAULT_HOUR_HEIGHT,
  MAX_HOUR_HEIGHT,
  MIN_HOUR_HEIGHT,
  buildTimeRows,
  clampHourHeight,
  formatTimeLabel,
  minuteIntervalForHourHeight,
  minutesToOffset,
} from '@/src/lib/weekGridZoom';

describe('clampHourHeight', () => {
  it('leaves an in-range value untouched', () => {
    expect(clampHourHeight(120)).toBe(120);
  });

  it('clamps below MIN_HOUR_HEIGHT', () => {
    expect(clampHourHeight(1)).toBe(MIN_HOUR_HEIGHT);
  });

  it('clamps above MAX_HOUR_HEIGHT', () => {
    expect(clampHourHeight(10000)).toBe(MAX_HOUR_HEIGHT);
  });
});

describe('minuteIntervalForHourHeight', () => {
  it('uses hourly labels at the default (zoomed-out) height', () => {
    expect(minuteIntervalForHourHeight(DEFAULT_HOUR_HEIGHT)).toBe(60);
  });

  it('switches to 30-minute labels once zoomed in a bit, matching a laptop-calendar-style zoom', () => {
    expect(minuteIntervalForHourHeight(90)).toBe(30);
    expect(minuteIntervalForHourHeight(159)).toBe(30);
  });

  it('switches to 15-minute labels zoomed in further', () => {
    expect(minuteIntervalForHourHeight(160)).toBe(15);
    expect(minuteIntervalForHourHeight(239)).toBe(15);
  });

  it('switches to 10-minute labels at maximum zoom', () => {
    expect(minuteIntervalForHourHeight(240)).toBe(10);
    expect(minuteIntervalForHourHeight(MAX_HOUR_HEIGHT)).toBe(10);
  });

  it('never gets finer than the zoomed-in labels even beyond the clamped max', () => {
    expect(minuteIntervalForHourHeight(1000)).toBe(10);
  });
});

describe('formatTimeLabel', () => {
  it('omits the minutes on the hour', () => {
    expect(formatTimeLabel(7 * 60)).toBe('7 AM');
    expect(formatTimeLabel(13 * 60)).toBe('1 PM');
  });

  it('includes zero-padded minutes off the hour', () => {
    expect(formatTimeLabel(7 * 60 + 30)).toBe('7:30 AM');
    expect(formatTimeLabel(13 * 60 + 5)).toBe('1:05 PM');
  });

  it('handles the midnight/noon 12-hour edge cases', () => {
    expect(formatTimeLabel(0)).toBe('12 AM');
    expect(formatTimeLabel(12 * 60)).toBe('12 PM');
  });
});

describe('buildTimeRows', () => {
  it('produces one row per hour at the default zoom, covering the full day', () => {
    const rows = buildTimeRows(DEFAULT_HOUR_HEIGHT);

    expect(rows).toHaveLength(24);
    expect(rows[0]).toEqual({ minutes: 0, height: DEFAULT_HOUR_HEIGHT, label: '12 AM' });
    expect(rows[7]).toEqual({ minutes: 420, height: DEFAULT_HOUR_HEIGHT, label: '7 AM' });
  });

  it('produces twice as many, half-height rows once zoomed to 30-minute labels', () => {
    const rows = buildTimeRows(120);

    expect(rows).toHaveLength(48);
    expect(rows[1]).toEqual({ minutes: 30, height: 60, label: '12:30 AM' });
  });

  it('every row height sums to 24 times the given hour height, regardless of zoom level', () => {
    for (const hourHeight of [DEFAULT_HOUR_HEIGHT, 100, 200, MAX_HOUR_HEIGHT]) {
      const rows = buildTimeRows(hourHeight);
      const total = rows.reduce((sum, row) => sum + row.height, 0);
      expect(total).toBeCloseTo(24 * hourHeight, 5);
    }
  });
});

describe('minutesToOffset', () => {
  it('scales linearly with the current hour height', () => {
    expect(minutesToOffset(90, 56)).toBe(84); // 1.5 hours * 56
    expect(minutesToOffset(90, 112)).toBe(168); // same time, double the zoom
  });

  it('is zero at midnight', () => {
    expect(minutesToOffset(0, DEFAULT_HOUR_HEIGHT)).toBe(0);
  });
});
