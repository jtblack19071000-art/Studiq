import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

export const appStorage = createMMKV({ id: 'studiq-app-storage' });

/**
 * MMKV's web shim has no `localStorage` to back onto during server-side static rendering and
 * throws when called there. There's no real persisted state to load during prerendering anyway,
 * so no-oping is correct there, not a compromise — this only guards the SSG pass, real browser
 * and native runtimes are unaffected.
 */
function safeGetString(name: string): string | undefined {
  try {
    return appStorage.getString(name);
  } catch {
    return undefined;
  }
}

function safeSet(name: string, value: string): void {
  try {
    appStorage.set(name, value);
  } catch {
    // no-op during server-side rendering
  }
}

function safeRemove(name: string): void {
  try {
    appStorage.remove(name);
  } catch {
    // no-op during server-side rendering
  }
}

/** Adapts react-native-mmkv to zustand's persist StateStorage interface. */
export const mmkvStateStorage: StateStorage = {
  getItem: (name) => safeGetString(name) ?? null,
  setItem: safeSet,
  removeItem: safeRemove,
};

/**
 * Supabase's auth client requires an async storage interface, unlike zustand's sync one. It also
 * reads storage eagerly in its constructor (not deferred to an effect like zustand's persist
 * middleware), so this needs the same server-side guard as above, just wrapped as async.
 */
export const asyncMmkvStorage = {
  getItem: async (name: string) => safeGetString(name) ?? null,
  setItem: async (name: string, value: string) => safeSet(name, value),
  removeItem: async (name: string) => safeRemove(name),
};
