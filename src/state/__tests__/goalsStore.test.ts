/// <reference types="jest" />

import { useGoalsStore } from '@/src/state/goalsStore';

const initialState = useGoalsStore.getState();

beforeEach(() => {
  useGoalsStore.setState(initialState, true);
});

describe('useGoalsStore', () => {
  it('seeds with starter goals', () => {
    expect(useGoalsStore.getState().goals.length).toBeGreaterThan(0);
  });

  it('addGoal always starts a new goal at "not_started", regardless of input', () => {
    const before = useGoalsStore.getState().goals.length;
    const created = useGoalsStore.getState().addGoal({
      title: 'Apply to 5 internships',
      category: 'career',
    });

    expect(created.status).toBe('not_started');
    expect(useGoalsStore.getState().goals).toHaveLength(before + 1);
  });

  it('updateGoalStatus updates only the targeted goal', () => {
    const created = useGoalsStore.getState().addGoal({ title: 'New goal', category: 'personal' });
    const seededId = useGoalsStore.getState().goals[0].id;

    useGoalsStore.getState().updateGoalStatus(created.id, 'completed');

    const goals = useGoalsStore.getState().goals;
    expect(goals.find((goal) => goal.id === created.id)?.status).toBe('completed');
    expect(goals.find((goal) => goal.id === seededId)?.status).not.toBe('completed');
  });

  it('removeGoal removes only the targeted goal', () => {
    const created = useGoalsStore.getState().addGoal({ title: 'New goal', category: 'personal' });
    const before = useGoalsStore.getState().goals.length;

    useGoalsStore.getState().removeGoal(created.id);

    const goals = useGoalsStore.getState().goals;
    expect(goals).toHaveLength(before - 1);
    expect(goals.find((goal) => goal.id === created.id)).toBeUndefined();
  });
});
