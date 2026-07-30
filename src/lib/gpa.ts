import type { LetterGrade, StudiqClass } from '@/src/types';

export const LETTER_GRADES: LetterGrade[] = [
  'A+',
  'A',
  'A-',
  'B+',
  'B',
  'B-',
  'C+',
  'C',
  'C-',
  'D+',
  'D',
  'D-',
  'F',
];

const GRADE_POINTS: Record<LetterGrade, number> = {
  'A+': 4.0,
  A: 4.0,
  'A-': 3.7,
  'B+': 3.3,
  B: 3.0,
  'B-': 2.7,
  'C+': 2.3,
  C: 2.0,
  'C-': 1.7,
  'D+': 1.3,
  D: 1.0,
  'D-': 0.7,
  F: 0.0,
};

export interface GpaResult {
  gpa: number | null;
  totalCreditHours: number;
}

/** Credit-hour-weighted GPA across the given classes; only classes with both a grade and credit hours count. */
export function calculateGpa(classes: StudiqClass[]): GpaResult {
  let qualityPoints = 0;
  let totalCreditHours = 0;

  for (const studiqClass of classes) {
    if (!studiqClass.finalGrade || !studiqClass.creditHours) continue;
    qualityPoints += GRADE_POINTS[studiqClass.finalGrade] * studiqClass.creditHours;
    totalCreditHours += studiqClass.creditHours;
  }

  return {
    gpa: totalCreditHours > 0 ? qualityPoints / totalCreditHours : null,
    totalCreditHours,
  };
}

export function groupClassesByTerm(classes: StudiqClass[]): Map<string, StudiqClass[]> {
  const map = new Map<string, StudiqClass[]>();
  for (const studiqClass of classes) {
    const existing = map.get(studiqClass.term);
    if (existing) {
      existing.push(studiqClass);
    } else {
      map.set(studiqClass.term, [studiqClass]);
    }
  }
  return map;
}
