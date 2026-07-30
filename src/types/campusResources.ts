import type { ID } from './common';

export type ResourceCategory =
  | 'tutoring'
  | 'health'
  | 'counseling'
  | 'career_services'
  | 'financial_aid'
  | 'disability_services'
  | 'other';

export const resourceCategoryLabels: Record<ResourceCategory, string> = {
  tutoring: 'Tutoring',
  health: 'Health',
  counseling: 'Counseling',
  career_services: 'Career Services',
  financial_aid: 'Financial Aid',
  disability_services: 'Disability Services',
  other: 'Other',
};

export interface CampusResource {
  id: ID;
  name: string;
  category: ResourceCategory;
  contact?: string;
  location?: string;
  notes?: string;
}
