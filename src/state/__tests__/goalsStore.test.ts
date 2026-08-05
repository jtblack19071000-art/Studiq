/// <reference types="jest" />

import { useGoalsStore } from '@/src/state/goalsStore';

const initialState = useGoalsStore.getState();

beforeEach(() => {
  useGoalsStore.setState(initialState, true);
});

describe('useGoalsStore', () => {
  it('starts blank so every student begins with their own goals, not sample data', () => {
    expect(useGoalsStore.getState().goals).toEqual([]);
  });

  it('addGoal always starts a new goal at "not_started", regardless of input', () => {
    const created = useGoalsStore.getState().addGoal({
      title: 'Apply to 5 internships',
      category: 'career',
    });

    expect(created.status).toBe('not_started');
    expect(useGoalsStore.getState().goals).toEqual([created]);
  });

  it('updateGoalStatus updates only the targeted goal', () => {
    const first = useGoalsStore.getState().addGoal({ title: 'First goal', category: 'personal' });
    const second = useGoalsStore.getState().addGoal({ title: 'Second goal', category: 'academic' });

    useGoalsStore.getState().updateGoalStatus(first.id, 'completed');

    const goals = useGoalsStore.getState().goals;
    expect(goals.find((goal) => goal.id === first.id)?.status).toBe('completed');
    expect(goals.find((goal) => goal.id === second.id)?.status).toBe('not_started');
  });

  it('removeGoal removes only the targeted goal', () => {
    const first = useGoalsStore.getState().addGoal({ title: 'First goal', category: 'personal' });
    const second = useGoalsStore.getState().addGoal({ title: 'Second goal', category: 'academic' });

    useGoalsStore.getState().removeGoal(first.id);

    expect(useGoalsStore.getState().goals).toEqual([second]);
  });
});
