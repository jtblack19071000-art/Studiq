/// <reference types="jest" />

import { create } from 'zustand';

import {
  registerCloudSyncedStore,
  resetAllCloudSyncedStores,
  startCloudSyncForUser,
  stopCloudSync,
} from '@/src/lib/cloudSync';

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

afterEach(() => {
  stopCloudSync();
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
});
