import type { ID } from './common';

export type ApplicationStatus = 'saved' | 'applied' | 'interviewing' | 'offer' | 'accepted' | 'rejected';

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  saved: 'Saved',
  applied: 'Applied',
  interviewing: 'Interviewing',
  offer: 'Offer',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

export interface JobApplication {
  id: ID;
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedDate?: string;
  notes?: string;
  url?: string;
}
