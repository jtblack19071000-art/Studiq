import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { registerCloudSyncedStore } from '@/src/lib/cloudSync';
import { createId } from '@/src/lib/id';
import { mmkvStateStorage } from '@/src/lib/mmkvStorage';
import type { CampusResource } from '@/src/types';

const BLANK_CAMPUS_RESOURCES_DATA = { resources: [] as CampusResource[] };

interface CampusResourcesState {
  resources: CampusResource[];
  addResource: (input: Omit<CampusResource, 'id'>) => CampusResource;
  removeResource: (id: string) => void;
}

export const useCampusResourcesStore = create<CampusResourcesState>()(
  persist(
    (set) => ({
      ...BLANK_CAMPUS_RESOURCES_DATA,
      addResource: (input) => {
        const created: CampusResource = { ...input, id: createId() };
        set((state) => ({ resources: [...state.resources, created] }));
        return created;
      },
      removeResource: (id) => {
        set((state) => ({ resources: state.resources.filter((resource) => resource.id !== id) }));
      },
    }),
    {
      name: 'studiq-campus-resources',
      storage: createJSONStorage(() => mmkvStateStorage),
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as CampusResourcesState;
        return {
          ...state,
          resources: (state?.resources ?? []).filter((resource) => !resource.id.startsWith('seed-')),
        };
      },
    },
  ),
);

registerCloudSyncedStore({
  name: 'campus-resources',
  store: useCampusResourcesStore,
  serialize: (state) => ({ resources: state.resources }),
  blank: BLANK_CAMPUS_RESOURCES_DATA,
});
