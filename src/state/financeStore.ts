import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createId } from '@/src/lib/id';
import { mmkvStateStorage } from '@/src/lib/mmkvStorage';
import type { FinancialProfile, Job, Scholarship, Transaction } from '@/src/types';

interface FinanceState {
  transactions: Transaction[];
  profile: FinancialProfile;
  addTransaction: (input: Omit<Transaction, 'id'>) => Transaction;
  removeTransaction: (id: string) => void;
  updateProfile: (patch: Partial<Omit<FinancialProfile, 'jobs' | 'scholarships'>>) => void;
  addJob: (input: Omit<Job, 'id'>) => Job;
  updateJob: (id: string, patch: Partial<Omit<Job, 'id'>>) => void;
  removeJob: (id: string) => void;
  addScholarship: (input: Omit<Scholarship, 'id'>) => Scholarship;
  updateScholarship: (id: string, patch: Partial<Omit<Scholarship, 'id'>>) => void;
  removeScholarship: (id: string) => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      transactions: [],
      profile: { jobs: [], scholarships: [] },
      addTransaction: (input) => {
        const created: Transaction = { ...input, id: createId() };
        set((state) => ({ transactions: [created, ...state.transactions] }));
        return created;
      },
      removeTransaction: (id) => {
        set((state) => ({ transactions: state.transactions.filter((tx) => tx.id !== id) }));
      },
      updateProfile: (patch) => {
        set((state) => ({ profile: { ...state.profile, ...patch } }));
      },
      addJob: (input) => {
        const created: Job = { ...input, id: createId() };
        set((state) => ({ profile: { ...state.profile, jobs: [...state.profile.jobs, created] } }));
        return created;
      },
      updateJob: (id, patch) => {
        set((state) => ({
          profile: {
            ...state.profile,
            jobs: state.profile.jobs.map((job) => (job.id === id ? { ...job, ...patch } : job)),
          },
        }));
      },
      removeJob: (id) => {
        set((state) => ({
          profile: { ...state.profile, jobs: state.profile.jobs.filter((job) => job.id !== id) },
        }));
      },
      addScholarship: (input) => {
        const created: Scholarship = { ...input, id: createId() };
        set((state) => ({
          profile: { ...state.profile, scholarships: [...state.profile.scholarships, created] },
        }));
        return created;
      },
      updateScholarship: (id, patch) => {
        set((state) => ({
          profile: {
            ...state.profile,
            scholarships: state.profile.scholarships.map((scholarship) =>
              scholarship.id === id ? { ...scholarship, ...patch } : scholarship,
            ),
          },
        }));
      },
      removeScholarship: (id) => {
        set((state) => ({
          profile: {
            ...state.profile,
            scholarships: state.profile.scholarships.filter((scholarship) => scholarship.id !== id),
          },
        }));
      },
    }),
    {
      name: 'studiq-finance',
      storage: createJSONStorage(() => mmkvStateStorage),
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as FinanceState;
        return {
          ...state,
          transactions: (state?.transactions ?? []).filter((tx) => !tx.id.startsWith('seed-')),
          profile: state?.profile ?? { jobs: [], scholarships: [] },
        };
      },
    },
  ),
);
