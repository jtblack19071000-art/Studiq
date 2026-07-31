/// <reference types="jest" />

import { createMMKV } from 'react-native-mmkv';

import { asyncMmkvStorage, mmkvStateStorage } from '@/src/lib/mmkvStorage';

jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  })),
}));

// mmkvStorage.ts calls createMMKV(...) exactly once, at module-load time, to build `appStorage`.
// Grab that same mocked instance so tests can control what its methods return/throw.
const mmkvInstance = (createMMKV as jest.Mock).mock.results[0].value as {
  getString: jest.Mock<string | undefined, [string]>;
  set: jest.Mock<void, [string, string]>;
  remove: jest.Mock<void, [string]>;
};

beforeEach(() => {
  mmkvInstance.getString.mockReset();
  mmkvInstance.set.mockReset();
  mmkvInstance.remove.mockReset();
});

describe('mmkvStateStorage (sync, for zustand persist)', () => {
  it('passes through a stored value', () => {
    mmkvInstance.getString.mockReturnValue('{"hello":"world"}');
    expect(mmkvStateStorage.getItem('studiq-notes')).toBe('{"hello":"world"}');
  });

  it('returns null (not undefined) when nothing is stored', () => {
    mmkvInstance.getString.mockReturnValue(undefined);
    expect(mmkvStateStorage.getItem('studiq-notes')).toBeNull();
  });

  it('degrades to null instead of throwing when the underlying store throws', () => {
    // Simulates MMKV's web shim during static rendering, where there's no `localStorage` to
    // back onto — see the comment on safeGetString in src/lib/mmkvStorage.ts.
    mmkvInstance.getString.mockImplementation(() => {
      throw new Error('Tried to access storage on the server');
    });
    expect(() => mmkvStateStorage.getItem('studiq-notes')).not.toThrow();
    expect(mmkvStateStorage.getItem('studiq-notes')).toBeNull();
  });

  it('setItem writes through to the underlying store', () => {
    mmkvStateStorage.setItem('studiq-notes', '{"a":1}');
    expect(mmkvInstance.set).toHaveBeenCalledWith('studiq-notes', '{"a":1}');
  });

  it('setItem silently no-ops instead of throwing when the underlying store throws', () => {
    mmkvInstance.set.mockImplementation(() => {
      throw new Error('Tried to access storage on the server');
    });
    expect(() => mmkvStateStorage.setItem('studiq-notes', '{"a":1}')).not.toThrow();
  });

  it('removeItem silently no-ops instead of throwing when the underlying store throws', () => {
    mmkvInstance.remove.mockImplementation(() => {
      throw new Error('Tried to access storage on the server');
    });
    expect(() => mmkvStateStorage.removeItem('studiq-notes')).not.toThrow();
  });
});

describe('asyncMmkvStorage (async, for Supabase auth)', () => {
  it('resolves with a stored value', async () => {
    mmkvInstance.getString.mockReturnValue('{"session":true}');
    await expect(asyncMmkvStorage.getItem('sb-auth')).resolves.toBe('{"session":true}');
  });

  it('resolves to null instead of rejecting when the underlying store throws', async () => {
    // The regression this guards: Supabase's auth client reads storage eagerly in its
    // constructor, so a thrown/rejected read here would crash app startup, not just this call.
    mmkvInstance.getString.mockImplementation(() => {
      throw new Error('Tried to access storage on the server');
    });
    await expect(asyncMmkvStorage.getItem('sb-auth')).resolves.toBeNull();
  });

  it('setItem/removeItem resolve instead of rejecting when the underlying store throws', async () => {
    mmkvInstance.set.mockImplementation(() => {
      throw new Error('Tried to access storage on the server');
    });
    mmkvInstance.remove.mockImplementation(() => {
      throw new Error('Tried to access storage on the server');
    });
    await expect(asyncMmkvStorage.setItem('sb-auth', 'x')).resolves.toBeUndefined();
    await expect(asyncMmkvStorage.removeItem('sb-auth')).resolves.toBeUndefined();
  });
});
