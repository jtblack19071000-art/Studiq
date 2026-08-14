/// <reference types="jest" />

import { groupClassesByTerm } from '@/src/lib/gpa';
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
