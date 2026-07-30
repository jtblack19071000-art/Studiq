import { RRule } from 'rrule';

import type { ScheduleEvent } from '@/src/types';

const FREQUENCY_MAP = {
  DAILY: RRule.DAILY,
  WEEKLY: RRule.WEEKLY,
  MONTHLY: RRule.MONTHLY,
} as const;

const WEEKDAY_MAP = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU];

export interface EventOccurrence {
  event: ScheduleEvent;
  startsAt: Date;
  endsAt: Date;
}

/** Expands a (possibly recurring) event into its concrete occurrences within [rangeStart, rangeEnd]. */
export function getOccurrencesInRange(
  event: ScheduleEvent,
  rangeStart: Date,
  rangeEnd: Date,
): EventOccurrence[] {
  const start = new Date(event.startsAt);
  const durationMs = new Date(event.endsAt).getTime() - start.getTime();

  if (!event.recurrence) {
    if (start >= rangeStart && start <= rangeEnd) {
      return [{ event, startsAt: start, endsAt: new Date(event.endsAt) }];
    }
    return [];
  }

  const rule = new RRule({
    freq: FREQUENCY_MAP[event.recurrence.frequency],
    interval: event.recurrence.interval ?? 1,
    byweekday: event.recurrence.byWeekday?.map((day) => WEEKDAY_MAP[day]),
    dtstart: start,
    until: event.recurrence.until ? new Date(event.recurrence.until) : undefined,
  });

  return rule.between(rangeStart, rangeEnd, true).map((occurrenceStart) => ({
    event,
    startsAt: occurrenceStart,
    endsAt: new Date(occurrenceStart.getTime() + durationMs),
  }));
}
