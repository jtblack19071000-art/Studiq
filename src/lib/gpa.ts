import type { StudiqClass } from '@/src/types';

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
