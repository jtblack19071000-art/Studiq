import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { registerCloudSyncedStore } from '@/src/lib/cloudSync';
import { createId } from '@/src/lib/id';
import { mmkvStateStorage } from '@/src/lib/mmkvStorage';
import type { ApplicationStatus, JobApplication } from '@/src/types';

const BLANK_CAREER_DATA = { applications: [] as JobApplication[] };

interface CareerState {
  applications: JobApplication[];
  addApplication: (input: Omit<JobApplication, 'id' | 'status'>) => JobApplication;
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void;
  removeApplication: (id: string) => void;
}

export const useCareerStore = create<CareerState>()(
  persist(
    (set) => ({
      ...BLANK_CAREER_DATA,
      addApplication: (input) => {
        const created: JobApplication = { ...input, id: createId(), status: 'saved' };
        set((state) => ({ applications: [created, ...state.applications] }));
        return created;
      },
      updateApplicationStatus: (id, status) => {
        set((state) => ({
          applications: state.applications.map((application) =>
            application.id === id ? { ...application, status } : application,
          ),
        }));
      },
      removeApplication: (id) => {
        set((state) => ({
          applications: state.applications.filter((application) => application.id !== id),
        }));
      },
    }),
    {
      name: 'studiq-career',
      storage: createJSONStorage(() => mmkvStateStorage),
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as CareerState;
        return {
          ...state,
          applications: (state?.applications ?? []).filter((application) => !application.id.startsWith('seed-')),
        };
      },
    },
  ),
);

registerCloudSyncedStore({
  name: 'career',
  store: useCareerStore,
  serialize: (state) => ({ applications: state.applications }),
  blank: BLANK_CAREER_DATA,
});
