import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createId } from '@/src/lib/id';
import { mmkvStateStorage } from '@/src/lib/mmkvStorage';
import type { Goal, GoalStatus } from '@/src/types';

interface GoalsState {
  goals: Goal[];
  addGoal: (input: Omit<Goal, 'id' | 'status'>) => Goal;
  updateGoalStatus: (id: string, status: GoalStatus) => void;
  removeGoal: (id: string) => void;
}

const seedGoals: Goal[] = [
  {
    id: 'seed-goal-1',
    title: 'Raise Organic Chemistry grade to a B+',
    category: 'academic',
    status: 'in_progress',
    targetTimeframe: 'By end of semester',
  },
  {
    id: 'seed-goal-2',
    title: 'Land a summer internship',
    category: 'career',
    status: 'not_started',
    targetTimeframe: 'By March 2027',
  },
];

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set) => ({
      goals: seedGoals,
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
    { name: 'studiq-goals', storage: createJSONStorage(() => mmkvStateStorage) },
  ),
);
