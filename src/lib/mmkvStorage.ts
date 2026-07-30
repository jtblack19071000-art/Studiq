import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

export const appStorage = createMMKV({ id: 'studiq-app-storage' });

/** Adapts react-native-mmkv to zustand's persist StateStorage interface. */
export const mmkvStateStorage: StateStorage = {
  getItem: (name) => appStorage.getString(name) ?? null,
  setItem: (name, value) => appStorage.set(name, value),
  removeItem: (name) => {
    appStorage.remove(name);
  },
};
