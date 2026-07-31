/// <reference types="jest" />

import { createId } from '@/src/lib/id';

describe('createId', () => {
  it('returns a non-empty string', () => {
    const id = createId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('generates unique ids across many calls', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => createId()));
    expect(ids.size).toBe(1000);
  });
});
