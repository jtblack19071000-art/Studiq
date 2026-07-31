import type { EventCategory, ID, Reminder } from './common';

/** Subset of RFC 5545 frequencies exposed to the UI; maps directly onto rrule's Frequency enum. */
export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  /** 0=Monday..6=Sunday, matching rrule's Weekday numbering. */
  byWeekday?: number[];
  interval?: number;
  /** ISO date string; recurrence stops on or before this date. */
  until?: string;
}

export interface ScheduleEvent {
  id: ID;
  title: string;
  category: EventCategory;
  /** ISO datetime for the first/only occurrence. */
  startsAt: string;
  /** ISO datetime for the first/only occurrence. */
  endsAt: string;
  location?: string;
  notes?: string;
  /** Overrides the linked class's color (if any) or the category default — see resolveEventColor. */
  color?: string;
  recurrence?: RecurrenceRule;
  reminders: Reminder[];
  /** Links this event back to a Class, when category is 'class'. */
  classId?: ID;
}
