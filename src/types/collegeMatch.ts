import type { ID } from './common';

export type SchoolApplicationStatus =
  | 'researching'
  | 'planning_to_apply'
  | 'applied'
  | 'accepted'
  | 'rejected'
  | 'enrolled';

export const schoolApplicationStatusLabels: Record<SchoolApplicationStatus, string> = {
  researching: 'Researching',
  planning_to_apply: 'Planning to apply',
  applied: 'Applied',
  accepted: 'Accepted',
  rejected: 'Rejected',
  enrolled: 'Enrolled',
};

export interface SavedSchool {
  id: ID;
  name: string;
  program?: string;
  status: SchoolApplicationStatus;
  /** Freeform, e.g. "Jan 15" — kept loose since deadlines vary by program. */
  deadline?: string;
  notes?: string;
}

export type SchoolSizePreference = 'small' | 'medium' | 'large' | 'no_preference';

export interface CollegePreferences {
  intendedMajor?: string;
  locationPreference?: string;
  sizePreference?: SchoolSizePreference;
  budgetNotes?: string;
}
