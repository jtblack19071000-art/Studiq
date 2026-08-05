import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { registerCloudSyncedStore } from '@/src/lib/cloudSync';
import { createId } from '@/src/lib/id';
import { mmkvStateStorage } from '@/src/lib/mmkvStorage';
import type { Goal, GoalStatus } from '@/src/types';

const BLANK_GOALS_DATA = { goals: [] as Goal[] };

interface GoalsState {
  goals: Goal[];
  addGoal: (input: Omit<Goal, 'id' | 'status'>) => Goal;
  updateGoalStatus: (id: string, status: GoalStatus) => void;
  removeGoal: (id: string) => void;
}

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set) => ({
      ...BLANK_GOALS_DATA,
      addGoal: (input) => {
        const created: Goal = { ...input, id: createId(), status: 'not_started' };
        set((state) => ({ goals: [...state.goals, created] }));
        return created;
      },
      updateGoalStatus: (id, status) => {
        set((state) => ({
          goals: state.goals.map((goal) => (goal.id === id ? { ...goal, status } : goal)),
        }));
      },
      removeGoal: (id) => {
        set((state) => ({ goals: state.goals.filter((goal) => goal.id !== id) }));
      },
    }),
    {
      name: 'studiq-goals',
      storage: createJSONStorage(() => mmkvStateStorage),
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as GoalsState;
        return { ...state, goals: (state?.goals ?? []).filter((goal) => !goal.id.startsWith('seed-')) };
      },
    },
  ),
);

registerCloudSyncedStore({
  name: 'goals',
  store: useGoalsStore,
  serialize: (state) => ({ goals: state.goals }),
  blank: BLANK_GOALS_DATA,
});
