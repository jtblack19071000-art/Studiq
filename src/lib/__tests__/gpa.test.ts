/// <reference types="jest" />

import { calculateGpa, groupClassesByTerm } from '@/src/lib/gpa';
import type { StudiqClass } from '@/src/types';

function buildClass(overrides: Partial<StudiqClass> = {}): StudiqClass {
  return {
    id: overrides.id ?? 'class-1',
    name: 'Intro to Computer Science',
    code: 'CS 101',
    color: '#3B6FE0',
    professor: { name: 'Dr. Smith' },
    term: 'Fall 2024',
    ...overrides,
  };
}

describe('calculateGpa', () => {
  it('returns null and zero credit hours for an empty class list', () => {
    expect(calculateGpa([])).toEqual({ gpa: null, totalCreditHours: 0 });
  });

  it('returns null when no class has both a grade and credit hours', () => {
    const classes = [
      buildClass({ id: 'a', creditHours: 3 }), // no grade yet
      buildClass({ id: 'b', finalGrade: 'A' }), // no credit hours yet
    ];

    expect(calculateGpa(classes)).toEqual({ gpa: null, totalCreditHours: 0 });
  });

  it('computes a straight 4.0 for a single A class', () => {
    const classes = [buildClass({ finalGrade: 'A', creditHours: 3 })];

    const result = calculateGpa(classes);
    expect(result.gpa).toBe(4.0);
    expect(result.totalCreditHours).toBe(3);
  });

  it('credit-hour-weights the GPA across multiple graded classes', () => {
    const classes = [
      buildClass({ id: 'a', finalGrade: 'A', creditHours: 3 }), // 4.0 * 3 = 12
      buildClass({ id: 'b', finalGrade: 'B', creditHours: 4 }), // 3.0 * 4 = 12
      buildClass({ id: 'c', finalGrade: 'C+', creditHours: 2 }), // 2.3 * 2 = 4.6
    ];

    const result = calculateGpa(classes);
    // (12 + 12 + 4.6) / 9 = 3.1777...
    expect(result.gpa).toBeCloseTo(3.1778, 4);
    expect(result.totalCreditHours).toBe(9);
  });

  it('ignores classes missing a final grade or credit hours in a mixed list', () => {
    const classes = [
      buildClass({ id: 'a', finalGrade: 'A', creditHours: 3 }),
      buildClass({ id: 'b', creditHours: 4 }), // in progress, no grade yet
      buildClass({ id: 'c', finalGrade: 'B', creditHours: 3 }),
    ];

    const result = calculateGpa(classes);
    // Only 'a' and 'c' count: (4.0*3 + 3.0*3) / 6 = 3.5
    expect(result.gpa).toBe(3.5);
    expect(result.totalCreditHours).toBe(6);
  });

  it('gives an F class zero quality points without excluding its credit hours', () => {
    const classes = [
      buildClass({ id: 'a', finalGrade: 'F', creditHours: 3 }),
      buildClass({ id: 'b', finalGrade: 'A', creditHours: 3 }),
    ];

    const result = calculateGpa(classes);
    // (0.0*3 + 4.0*3) / 6 = 2.0
    expect(result.gpa).toBe(2.0);
    expect(result.totalCreditHours).toBe(6);
  });
});

describe('groupClassesByTerm', () => {
  it('groups classes under their term, preserving insertion order within each group', () => {
    const fall1 = buildClass({ id: 'fall-1', term: 'Fall 2024' });
    const spring1 = buildClass({ id: 'spring-1', term: 'Spring 2025' });
    const fall2 = buildClass({ id: 'fall-2', term: 'Fall 2024' });

    const grouped = groupClassesByTerm([fall1, spring1, fall2]);

    expect(Array.from(grouped.keys())).toEqual(['Fall 2024', 'Spring 2025']);
    expect(grouped.get('Fall 2024')).toEqual([fall1, fall2]);
    expect(grouped.get('Spring 2025')).toEqual([spring1]);
  });

  it('returns an empty map for an empty class list', () => {
    expect(groupClassesByTerm([])).toEqual(new Map());
  });
});
