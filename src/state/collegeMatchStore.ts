import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createId } from '@/src/lib/id';
import { mmkvStateStorage } from '@/src/lib/mmkvStorage';
import type { CollegePreferences, SavedSchool, SchoolApplicationStatus } from '@/src/types';

interface CollegeMatchState {
  preferences: CollegePreferences;
  schools: SavedSchool[];
  setPreferences: (patch: Partial<CollegePreferences>) => void;
  addSchool: (input: Omit<SavedSchool, 'id' | 'status'>) => SavedSchool;
  updateSchoolStatus: (id: string, status: SchoolApplicationStatus) => void;
  removeSchool: (id: string) => void;
}

const seedSchools: SavedSchool[] = [
  {
    id: 'seed-school-1',
    name: 'State University',
    program: 'B.S. Chemistry',
    status: 'researching',
  },
];

export const useCollegeMatchStore = create<CollegeMatchState>()(
  persist(
    (set) => ({
      preferences: {},
      schools: seedSchools,
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
    { name: 'studiq-college-match', storage: createJSONStorage(() => mmkvStateStorage) },
  ),
);
