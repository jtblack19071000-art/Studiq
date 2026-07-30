import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createId } from '@/src/lib/id';
import { mmkvStateStorage } from '@/src/lib/mmkvStorage';
import type { CampusResource } from '@/src/types';

interface CampusResourcesState {
  resources: CampusResource[];
  addResource: (input: Omit<CampusResource, 'id'>) => CampusResource;
  removeResource: (id: string) => void;
}

// Generic starting points — not tied to any specific school. Replace with your campus's actual
// office names, contacts, and locations.
const seedResources: CampusResource[] = [
  {
    id: 'seed-resource-1',
    name: 'Tutoring Center',
    category: 'tutoring',
    notes: 'Free peer and staff tutoring — add your hours and location here.',
  },
  {
    id: 'seed-resource-2',
    name: 'Counseling & Health Services',
    category: 'counseling',
    notes: 'Add your campus health center contact info here.',
  },
];

export const useCampusResourcesStore = create<CampusResourcesState>()(
  persist(
    (set) => ({
      resources: seedResources,
      addResource: (input) => {
        const created: CampusResource = { ...input, id: createId() };
        set((state) => ({ resources: [...state.resources, created] }));
        return created;
      },
      removeResource: (id) => {
        set((state) => ({ resources: state.resources.filter((resource) => resource.id !== id) }));
      },
    }),
    { name: 'studiq-campus-resources', storage: createJSONStorage(() => mmkvStateStorage) },
  ),
);
