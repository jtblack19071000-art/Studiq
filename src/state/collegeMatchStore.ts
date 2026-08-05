import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { registerCloudSyncedStore } from '@/src/lib/cloudSync';
import { createId } from '@/src/lib/id';
import { mmkvStateStorage } from '@/src/lib/mmkvStorage';
import type { CollegePreferences, SavedSchool, SchoolApplicationStatus } from '@/src/types';

const BLANK_COLLEGE_MATCH_DATA = {
  preferences: {} as CollegePreferences,
  schools: [] as SavedSchool[],
};

interface CollegeMatchState {
  preferences: CollegePreferences;
  schools: SavedSchool[];
  setPreferences: (patch: Partial<CollegePreferences>) => void;
  addSchool: (input: Omit<SavedSchool, 'id' | 'status'>) => SavedSchool;
  updateSchoolStatus: (id: string, status: SchoolApplicationStatus) => void;
  removeSchool: (id: string) => void;
}

export const useCollegeMatchStore = create<CollegeMatchState>()(
  persist(
    (set) => ({
      ...BLANK_COLLEGE_MATCH_DATA,
      setPreferences: (patch) => {
        set((state) => ({ preferences: { ...state.preferences, ...patch } }));
      },
      addSchool: (input) => {
        const created: SavedSchool = { ...input, id: createId(), status: 'researching' };
        set((state) => ({ schools: [...state.schools, created] }));
        return created;
      },
      updateSchoolStatus: (id, status) => {
        set((state) => ({
          schools: state.schools.map((school) => (school.id === id ? { ...school, status } : school)),
        }));
      },
      removeSchool: (id) => {
        set((state) => ({ schools: state.schools.filter((school) => school.id !== id) }));
      },
    }),
    {
      name: 'studiq-college-match',
      storage: createJSONStorage(() => mmkvStateStorage),
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as CollegeMatchState;
        return {
          ...state,
          schools: (state?.schools ?? []).filter((school) => !school.id.startsWith('seed-')),
        };
      },
    },
  ),
);

registerCloudSyncedStore({
  name: 'college-match',
  store: useCollegeMatchStore,
  serialize: (state) => ({ preferences: state.preferences, schools: state.schools }),
  blank: BLANK_COLLEGE_MATCH_DATA,
});
