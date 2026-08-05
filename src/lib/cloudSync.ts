import type { StoreApi, UseBoundStore } from 'zustand';

import { supabase } from '@/src/lib/supabase';

const PUSH_DEBOUNCE_MS = 800;

interface CloudSyncRegistration<T> {
  /** Row key in the `user_store_state` table — see supabase/migrations. */
  name: string;
  store: UseBoundStore<StoreApi<T>>;
  /** Extracts just the persisted data fields (no action functions) from the store's full state. */
  serialize: (state: T) => Record<string, unknown>;
  /** The shape a signed-in account starts from when it has no saved cloud data yet. */
  blank: Record<string, unknown>;
}

const registrations: CloudSyncRegistration<any>[] = [];
const pushTimers = new Map<string, ReturnType<typeof setTimeout>>();
const subscriptions = new Map<string, () => void>();

/** Called once per store, at module load, before any sign-in can happen. */
export function registerCloudSyncedStore<T>(registration: CloudSyncRegistration<T>): void {
  registrations.push(registration);
}

let activeUserId: string | null = null;

async function fetchRemote(userId: string, name: string): Promise<Record<string, unknown> | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('user_store_state')
    .select('data')
    .eq('user_id', userId)
    .eq('store_name', name)
    .maybeSingle();
  if (error || !data) return null;
  return data.data as Record<string, unknown>;
}

function scheduleRemotePush(userId: string, name: string, data: Record<string, unknown>): void {
  if (!supabase) return;
  const existing = pushTimers.get(name);
  if (existing) clearTimeout(existing);
  pushTimers.set(
    name,
    setTimeout(() => {
      supabase!
        .from('user_store_state')
        .upsert({ user_id: userId, store_name: name, data, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) console.warn(`Cloud sync: failed to save "${name}".`, error);
        });
    }, PUSH_DEBOUNCE_MS),
  );
}

/**
 * Switches every registered store over to `userId`'s cloud data: always resets to blank first,
 * then applies whatever that account has saved (if anything), so no data from a previous session
 * on this device — anonymous or a different account — ever leaks into the newly signed-in
 * account. Subsequent local mutations are pushed back to that account's row, debounced.
 */
export async function startCloudSyncForUser(userId: string): Promise<void> {
  stopCloudSync();
  activeUserId = userId;

  for (const reg of registrations) {
    reg.store.setState(reg.blank);
    const remote = await fetchRemote(userId, reg.name);
    if (activeUserId !== userId) return; // signed out again while this fetch was in flight

    if (remote) reg.store.setState(remote);

    const unsubscribe = reg.store.subscribe((state: any) => {
      if (activeUserId !== userId) return;
      scheduleRemotePush(userId, reg.name, reg.serialize(state));
    });
    subscriptions.set(reg.name, unsubscribe);
  }
}

/** Stops pushing local changes to the cloud (call on sign-out, before resetting stores). */
export function stopCloudSync(): void {
  activeUserId = null;
  for (const unsubscribe of subscriptions.values()) unsubscribe();
  subscriptions.clear();
  for (const timer of pushTimers.values()) clearTimeout(timer);
  pushTimers.clear();
}

/** Clears every registered store back to its blank shape — call on sign-out. */
export function resetAllCloudSyncedStores(): void {
  for (const reg of registrations) {
    reg.store.setState(reg.blank);
  }
}
