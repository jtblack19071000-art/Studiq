import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createId } from '@/src/lib/id';
import { mmkvStateStorage } from '@/src/lib/mmkvStorage';
import type { ApplicationStatus, JobApplication } from '@/src/types';

interface CareerState {
  applications: JobApplication[];
  addApplication: (input: Omit<JobApplication, 'id' | 'status'>) => JobApplication;
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void;
  removeApplication: (id: string) => void;
}

const seedApplications: JobApplication[] = [
  {
    id: 'seed-application-1',
    company: 'Riverside Labs',
    role: 'Data Analytics Intern',
    status: 'applied',
    appliedDate: new Date().toISOString(),
  },
];

export const useCareerStore = create<CareerState>()(
  persist(
    (set) => ({
      applications: seedApplications,
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
    { name: 'studiq-career', storage: createJSONStorage(() => mmkvStateStorage) },
  ),
);
