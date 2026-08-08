export const DEFAULT_HOUR_HEIGHT = 56;
export const MIN_HOUR_HEIGHT = 36;
export const MAX_HOUR_HEIGHT = 300;

export interface TimeRow {
  /** Minutes since midnight this row starts at. */
  minutes: number;
  /** Pixel height of this row at the current zoom level. */
  height: number;
  /** e.g. "7 AM" on the hour, "7:30 AM" otherwise. */
  label: string;
}

/**
 * Clamps a pinch-scaled hour height into the zoomable range. Marked as a worklet so the pinch
 * gesture in WeekGridCalendar can call it directly on the UI thread, not just from plain JS.
 */
export function clampHourHeight(hourHeight: number): number {
  'worklet';
  return Math.min(MAX_HOUR_HEIGHT, Math.max(MIN_HOUR_HEIGHT, hourHeight));
}

/**
 * How finely the calendar's left-hand time column subdivides an hour at a given zoom level —
 * the closer you pinch-zoom in (the taller an hour renders), the smaller the interval, so there's
 * always room to read the labels without them overlapping. 30-minute lines are the default (the
 * DEFAULT_HOUR_HEIGHT rest state); pinching out past that drops back to a hourly overview.
 */
export function minuteIntervalForHourHeight(hourHeight: number): number {
  if (hourHeight >= 240) return 10;
  if (hourHeight >= 160) return 15;
  if (hourHeight >= 50) return 30;
  return 60;
}

/** Formats minutes-since-midnight as "7 AM" on the hour, "7:30 AM" otherwise. */
export function formatTimeLabel(totalMinutes: number): string {
  const hour24 = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  if (minute === 0) return `${hour12} ${period}`;
  return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
}

/** Builds one row per time-column label/gridline for a full 24-hour day at the given zoom level. */
export function buildTimeRows(hourHeight: number): TimeRow[] {
  const interval = minuteIntervalForHourHeight(hourHeight);
  const rowHeight = (hourHeight * interval) / 60;
  const rows: TimeRow[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += interval) {
    rows.push({ minutes, height: rowHeight, label: formatTimeLabel(minutes) });
  }
  return rows;
}

/** Pixel offset from the top of the day column for a given time, at the current zoom level. */
export function minutesToOffset(minutesFromMidnight: number, hourHeight: number): number {
  return (minutesFromMidnight / 60) * hourHeight;
}
