/// <reference types="jest" />

import { create } from 'zustand';

import { registerCloudSyncedStore, startCloudSyncForUser, stopCloudSync } from '@/src/lib/cloudSync';

// cloudSync.ts reads `supabase` once, at import time, and treats it as null to mean "not
// configured" — see src/lib/__tests__/cloudSync.test.ts for that (default, unconfigured) path.
// This file instead mocks a working client, to cover the debounced-push behavior that only runs
// when cloud sync is actually configured — in particular, that sign-out flushes a pending push
// instead of silently dropping it (the bug behind "an edit right before signing out never saved").
//
// jest.mock's factory can't close over normal out-of-scope variables — only ones prefixed "mock"
// (case-insensitive) are allowed — so every helper referenced from inside the factories below is
// named to match that rule.
const mockMaybeSingle = jest.fn(async () => ({ data: null, error: null }));
const mockUpsert = jest.fn(async (_payload: unknown) => ({ error: null }));

function mockBuildQueryBuilder() {
  const builder: Record<string, jest.Mock> = {};
  builder.select = jest.fn(() => builder);
  builder.eq = jest.fn(() => builder);
  builder.maybeSingle = jest.fn(() => mockMaybeSingle());
  builder.upsert = jest.fn((payload: unknown) => mockUpsert(payload));
  return builder;
}

jest.mock('@/src/lib/supabase', () => ({
  supabase: { from: jest.fn(() => mockBuildQueryBuilder()) },
}));

// react-native-mmkv's real implementation needs a native/browser host it doesn't have under
// Jest; cloudSync.ts's same-account tracking needs a working read/write round trip, so back it
// with a plain in-memory map instead of the default gracefully-no-ops-on-throw fallback.
jest.mock('react-native-mmkv', () => {
  const mockMmkvBackingStore = new Map<string, string>();
  return {
    createMMKV: () => ({
      getString: (key: string) => mockMmkvBackingStore.get(key),
      set: (key: string, value: string) => {
        mockMmkvBackingStore.set(key, value);
      },
      remove: (key: string) => {
        mockMmkvBackingStore.delete(key);
      },
    }),
  };
});

interface FakeState {
  items: string[];
  addItem: (item: string) => void;
}

function buildFakeStore(name: string) {
  const useFakeStore = create<FakeState>()((set) => ({
    items: [],
    addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  }));
  registerCloudSyncedStore({
    name,
    store: useFakeStore,
    serialize: (state) => ({ items: state.items }),
    blank: { items: [] },
  });
  return useFakeStore;
}

beforeEach(() => {
  mockMaybeSingle.mockClear();
  mockUpsert.mockClear();
});

afterEach(async () => {
  await stopCloudSync();
});

describe('cloudSync push (Supabase configured)', () => {
  it('debounces a local edit and eventually pushes it to Supabase', async () => {
    jest.useFakeTimers();
    const useFakeStore = buildFakeStore('push-test-a');
    await startCloudSyncForUser('user-a');

    useFakeStore.getState().addItem('new class');
    expect(mockUpsert).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(800);

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-a', store_name: 'push-test-a', data: { items: ['new class'] } }),
    );
    jest.useRealTimers();
  });

  it('stopCloudSync flushes a pending push immediately instead of dropping it — the bug this guards against: signing out right after an edit lost that edit', async () => {
    const useFakeStore = buildFakeStore('push-test-b');
    await startCloudSyncForUser('user-b');

    useFakeStore.getState().addItem('added just before sign-out');

    // No fake timers here — stopCloudSync must send this without waiting for the debounce.
    await stopCloudSync();

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-b',
        store_name: 'push-test-b',
        data: { items: ['added just before sign-out'] },
      }),
    );
  });
});
