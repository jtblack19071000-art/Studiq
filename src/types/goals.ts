import type { ID } from './common';

export type GoalCategory = 'academic' | 'career' | 'personal' | 'health' | 'financial';
export type GoalStatus = 'not_started' | 'in_progress' | 'completed';

export const goalCategoryLabels: Record<GoalCategory, string> = {
  academic: 'Academic',
  career: 'Career',
  personal: 'Personal',
  health: 'Health',
  financial: 'Financial',
};

export interface Goal {
  id: ID;
  title: string;
  category: GoalCategory;
  status: GoalStatus;
  /** Freeform, e.g. "by Dec 2026" or "end of semester" — goals rarely have a strict date. */
  targetTimeframe?: string;
  notes?: string;
}
