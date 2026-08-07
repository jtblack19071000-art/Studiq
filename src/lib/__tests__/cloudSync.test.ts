/// <reference types="jest" />

import { create } from 'zustand';

import {
  registerCloudSyncedStore,
  resetAllCloudSyncedStores,
  startCloudSyncForUser,
  stopCloudSync,
} from '@/src/lib/cloudSync';

// react-native-mmkv's real implementation needs a native/browser host it doesn't have under
// Jest; cloudSync.ts's same-account tracking (see getLastSyncedUserId in src/lib/cloudSync.ts)
// needs a working read/write round trip to be meaningfully testable, so back it with a plain
// in-memory map here instead of the default gracefully-no-ops-on-throw fallback.
jest.mock('react-native-mmkv', () => {
  const store = new Map<string, string>();
  return {
    createMMKV: () => ({
      getString: (key: string) => store.get(key),
      set: (key: string, value: string) => {
        store.set(key, value);
      },
      remove: (key: string) => {
        store.delete(key);
      },
    }),
  };
});

// No EXPO_PUBLIC_SUPABASE_URL/ANON_KEY is set in the test environment, so `supabase` (src/lib/supabase.ts)
// is null and every network call in cloudSync.ts short-circuits — matching the app's default,
// cloud-sync-not-configured state. This lets local behavior (reset-to-blank, push scheduling) be
// tested without a real backend.
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

afterEach(async () => {
  await stopCloudSync();
});

describe('cloudSync (Supabase not configured)', () => {
  it('startCloudSyncForUser resets a registered store to blank when there is nothing to fetch', async () => {
    const useFakeStore = buildFakeStore('cloud-sync-test-a');
    useFakeStore.getState().addItem('leftover from a previous session');
    expect(useFakeStore.getState().items).toHaveLength(1);

    await startCloudSyncForUser('user-a');

    expect(useFakeStore.getState().items).toEqual([]);
  });

  it('preserves store actions after a sync reset (partial merge, not full replace)', async () => {
    const useFakeStore = buildFakeStore('cloud-sync-test-b');

    await startCloudSyncForUser('user-b');
    useFakeStore.getState().addItem('added after sign-in');

    expect(useFakeStore.getState().items).toEqual(['added after sign-in']);
  });

  it('resetAllCloudSyncedStores clears every registered store back to blank', () => {
    const useFakeStore = buildFakeStore('cloud-sync-test-c');
    useFakeStore.getState().addItem('some local data');

    resetAllCloudSyncedStores();

    expect(useFakeStore.getState().items).toEqual([]);
  });

  it('switching users resets to blank again rather than keeping the previous account’s data', async () => {
    const useFakeStore = buildFakeStore('cloud-sync-test-d');

    await startCloudSyncForUser('alex');
    useFakeStore.getState().addItem('Alex’s class');
    expect(useFakeStore.getState().items).toEqual(['Alex’s class']);

    await startCloudSyncForUser('bella');

    expect(useFakeStore.getState().items).toEqual([]);
  });

  it('a same-account reconnect (e.g. a page refresh) does not wipe what was just added — the bug this guards against: adding a class, then refreshing the page, made it disappear', async () => {
    const useFakeStore = buildFakeStore('cloud-sync-test-e');

    await startCloudSyncForUser('casey');
    useFakeStore.getState().addItem('added while signed in');
    expect(useFakeStore.getState().items).toEqual(['added while signed in']);

    // Simulate a page refresh: supabase.auth.getSession() resolves again for the same account,
    // re-running startCloudSyncForUser with the same userId.
    await startCloudSyncForUser('casey');

    expect(useFakeStore.getState().items).toEqual(['added while signed in']);
  });
});
