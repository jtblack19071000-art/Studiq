import type { StoreApi, UseBoundStore } from 'zustand';

import { appStorage } from '@/src/lib/mmkvStorage';
import { supabase } from '@/src/lib/supabase';

const PUSH_DEBOUNCE_MS = 800;

/** Remembers which account this device last synced, across page refreshes/app restarts —
 * see the isSameAccount check in startCloudSyncForUser. */
const LAST_SYNCED_USER_KEY = 'studiq-cloud-sync-last-user';

function getLastSyncedUserId(): string | null {
  try {
    return appStorage.getString(LAST_SYNCED_USER_KEY) ?? null;
  } catch {
    return null;
  }
}

function setLastSyncedUserId(userId: string): void {
  try {
    appStorage.set(LAST_SYNCED_USER_KEY, userId);
  } catch {
    // no-op during server-side rendering — see mmkvStorage.ts's safeSet for the same guard.
  }
}

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
/** The latest not-yet-sent payload per store, so a pending debounced push can be flushed
 * immediately (see flushPendingPush) instead of silently dropped when sign-out clears the timer. */
const pendingPushes = new Map<string, { userId: string; data: Record<string, unknown> }>();
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
  pendingPushes.set(name, { userId, data });
  const existing = pushTimers.get(name);
  if (existing) clearTimeout(existing);
  pushTimers.set(
    name,
    setTimeout(() => {
      void flushPendingPush(name);
    }, PUSH_DEBOUNCE_MS),
  );
}

/** Sends a store's pending debounced push immediately and clears its timer — called both when
 * the debounce elapses naturally and when sign-out needs to flush before the timer would fire, so
 * an edit made in the last few hundred ms before signing out is never silently lost. */
async function flushPendingPush(name: string): Promise<void> {
  const timer = pushTimers.get(name);
  if (timer) clearTimeout(timer);
  pushTimers.delete(name);

  const pending = pendingPushes.get(name);
  if (!pending || !supabase) return;
  pendingPushes.delete(name);

  const { error } = await supabase
    .from('user_store_state')
    .upsert({ user_id: pending.userId, store_name: name, data: pending.data, updated_at: new Date().toISOString() });
  if (error) console.warn(`Cloud sync: failed to save "${name}".`, error);
}

/**
 * Switches every registered store over to `userId`'s cloud data, then applies whatever that
 * account has saved remotely (if anything). Subsequent local mutations are pushed back to that
 * account's row, debounced.
 *
 * Only resets each store to blank first when `userId` is a *different* account than the one this
 * device last synced (a genuine account switch, or a first-ever sign-in on this device) — that's
 * what stops one account's data from leaking into another signing in on the same device. A
 * same-account reconnect (e.g. a page refresh, where this runs again once getSession() resolves)
 * must never wipe what's already loaded: zustand's persist middleware already rehydrated it from
 * local storage before this function ever runs, and if the remote fetch below fails or hasn't
 * caught up with a very recent local edit, that local copy is the only copy left — wiping it
 * unconditionally on every reconnect is what made "the class I just added disappeared after a
 * refresh" a real, reproducible bug.
 */
export async function startCloudSyncForUser(userId: string): Promise<void> {
  await stopCloudSync();
  activeUserId = userId;

  const isSameAccount = getLastSyncedUserId() === userId;
  setLastSyncedUserId(userId);

  for (const reg of registrations) {
    if (!isSameAccount) {
      reg.store.setState(reg.blank);
    }

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

/** Stops pushing local changes to the cloud (call on sign-out, before resetting stores). Flushes
 * any pending debounced push first — without this, an edit made in the moment before sign-out
 * would have its timer cancelled and never reach the cloud at all. */
export async function stopCloudSync(): Promise<void> {
  activeUserId = null;
  for (const unsubscribe of subscriptions.values()) unsubscribe();
  subscriptions.clear();
  await Promise.all(Array.from(pendingPushes.keys()).map(flushPendingPush));
}

/** Clears every registered store back to its blank shape — call on sign-out. */
export function resetAllCloudSyncedStores(): void {
  for (const reg of registrations) {
    reg.store.setState(reg.blank);
  }
}
