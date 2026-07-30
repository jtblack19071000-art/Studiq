export type ID = string;

export type EventCategory =
  | 'class'
  | 'work'
  | 'internship'
  | 'research'
  | 'club'
  | 'appointment'
  | 'personal';

export const eventCategoryColors: Record<EventCategory, string> = {
  class: '#3B6FE0',
  work: '#D9862B',
  internship: '#2BA6A4',
  research: '#7D5BD9',
  club: '#C4478C',
  appointment: '#4C9F4C',
  personal: '#8A8F98',
};

export const eventCategoryLabels: Record<EventCategory, string> = {
  class: 'Class',
  work: 'Work',
  internship: 'Internship',
  research: 'Research',
  club: 'Club',
  appointment: 'Appointment',
  personal: 'Personal',
};

export interface Reminder {
  id: ID;
  /** Minutes before the event start to notify. */
  minutesBefore: number;
}
