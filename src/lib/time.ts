import { startOfWeek } from 'date-fns';

/**
 * Parses a time typed as either 12-hour with AM/PM ("1:30 PM", "1:30pm", "1:30 P.M.") or bare
 * 24-hour ("13:30") into a Date anchored to today. No leading zero required either way. Returns
 * null on invalid input.
 */
export function parseTimeToday(time: string): Date | null {
  const trimmed = time.trim();

  const twelveHourMatch = /^(\d{1,2}):(\d{2})\s*([AaPp])\.?[Mm]\.?$/.exec(trimmed);
  if (twelveHourMatch) {
    let hours = Number(twelveHourMatch[1]);
    const minutes = Number(twelveHourMatch[2]);
    if (hours < 1 || hours > 12 || minutes > 59) return null;

    const isPm = twelveHourMatch[3].toLowerCase() === 'p';
    if (isPm && hours !== 12) hours += 12;
    if (!isPm && hours === 12) hours = 0;

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  const twentyFourHourMatch = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (twentyFourHourMatch) {
    const hours = Number(twentyFourHourMatch[1]);
    const minutes = Number(twentyFourHourMatch[2]);
    if (hours > 23 || minutes > 59) return null;
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  return null;
}

/**
 * Parses a loosely-formatted date string ("Feb 14, 2026", "2/14/2026", "2026-02-14") into a Date
 * at the given hour (default noon local time) — for syllabus-extracted or freely-typed dates that
 * don't follow a strict format. Assumes the current year when none is present. Returns null on
 * invalid or empty input.
 */
export function parseFlexibleDate(text: string, hour = 12): Date | null {
  const trimmed = text.trim();
  // Bare prose with no digits at all ("not a date") isn't a date — reject it outright, since
  // JS's Date constructor is lenient enough to sometimes parse such strings anyway.
  if (!trimmed || !/\d/.test(trimmed)) return null;

  const hasYear = /\b\d{4}\b/.test(trimmed);
  const candidate = hasYear ? trimmed : `${trimmed} ${new Date().getFullYear()}`;

  const parsed = new Date(candidate);
  if (Number.isNaN(parsed.getTime())) return null;

  parsed.setHours(hour, 0, 0, 0);
  return parsed;
}

/** Combines a calendar date with a typed time-of-day ("1:30 PM") into one Date. Returns null if
 * the time fails to parse. */
export function combineDateAndTime(date: Date, time: string): Date | null {
  const parsedTime = parseTimeToday(time);
  if (!parsedTime) return null;
  const combined = new Date(date);
  combined.setHours(parsedTime.getHours(), parsedTime.getMinutes(), 0, 0);
  return combined;
}

/**
 * Turns a meeting's start/end time-of-day strings into concrete Dates for a recurring
 * WEEKLY schedule event's `startsAt`/`endsAt`. Anchored to this week's Monday rather than
 * "today" — anchoring to today made a meeting day earlier in the week than the day the class
 * was added/edited invisible until the following week, since RRule never generates an
 * occurrence before its dtstart. Monday is always the earliest day RRule needs to consider, so
 * every weekday selected for this week (and every week after) resolves correctly. Returns null
 * if either time fails to parse.
 */
export function anchorMeetingTimes(startTime: string, endTime: string): { startsAt: Date; endsAt: Date } | null {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const startsAt = combineDateAndTime(monday, startTime);
  const endsAt = combineDateAndTime(monday, endTime);
  if (!startsAt || !endsAt) return null;
  return { startsAt, endsAt };
}

/** Formats an ISO datetime string as "1:30 PM" in local time, for prefilling time inputs. */
export function formatTimeOfDay(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  const hours24 = date.getHours();
  const minutes = date.getMinutes();
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}
