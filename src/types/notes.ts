import type { ID } from './common';

export interface DailyNote {
  id: ID;
  /** ISO date (YYYY-MM-DD), one note per day. */
  date: string;
  body: string;
}
