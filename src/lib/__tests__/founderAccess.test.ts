/// <reference types="jest" />

import { isFounderEmail } from '@/src/lib/founderAccess';

describe('isFounderEmail', () => {
  it('returns true for a founder email', () => {
    expect(isFounderEmail('jtblack07@icloud.com')).toBe(true);
    expect(isFounderEmail('cadenmichael0808@gmail.com')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(isFounderEmail('JTBlack07@ICloud.com')).toBe(true);
  });

  it('returns false for a non-founder email', () => {
    expect(isFounderEmail('someone-else@example.com')).toBe(false);
  });

  it('returns false for null, undefined, or an empty string', () => {
    expect(isFounderEmail(null)).toBe(false);
    expect(isFounderEmail(undefined)).toBe(false);
    expect(isFounderEmail('')).toBe(false);
  });
});
