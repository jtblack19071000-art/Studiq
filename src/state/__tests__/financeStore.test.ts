/// <reference types="jest" />

import { useFinanceStore } from '@/src/state/financeStore';

const initialState = useFinanceStore.getState();

beforeEach(() => {
  useFinanceStore.setState(initialState, true);
});

describe('useFinanceStore', () => {
  it('starts blank with no transactions and an empty profile', () => {
    const state = useFinanceStore.getState();
    expect(state.transactions).toEqual([]);
    expect(state.profile).toEqual({ jobs: [], scholarships: [] });
  });

  it('addTransaction assigns an id and prepends to the list', () => {
    const created = useFinanceStore.getState().addTransaction({
      title: 'Paycheck',
      amount: 200,
      type: 'income',
      category: 'job_income',
      date: '2024-03-01T00:00:00.000Z',
    });

    expect(created.id).toBeTruthy();
    expect(useFinanceStore.getState().transactions).toEqual([created]);
  });

  it('removeTransaction removes only the targeted transaction', () => {
    const first = useFinanceStore.getState().addTransaction({
      title: 'Paycheck',
      amount: 200,
      type: 'income',
      category: 'job_income',
      date: '2024-03-01T00:00:00.000Z',
    });
    const second = useFinanceStore.getState().addTransaction({
      title: 'Groceries',
      amount: 40,
      type: 'expense',
      category: 'food',
      date: '2024-03-02T00:00:00.000Z',
    });

    useFinanceStore.getState().removeTransaction(first.id);

    expect(useFinanceStore.getState().transactions).toEqual([second]);
  });

  it('updateProfile merges school/major fields without touching jobs or scholarships', () => {
    useFinanceStore.getState().addJob({ title: 'Barista', payType: 'hourly', rate: 12, hoursPerWeek: 10 });

    useFinanceStore.getState().updateProfile({ schoolName: 'State University', major: 'Biology' });

    const profile = useFinanceStore.getState().profile;
    expect(profile.schoolName).toBe('State University');
    expect(profile.major).toBe('Biology');
    expect(profile.jobs).toHaveLength(1);
  });

  it('addJob/updateJob/removeJob manage the jobs list independently of other jobs', () => {
    const job = useFinanceStore.getState().addJob({ title: 'Barista', payType: 'hourly', rate: 12, hoursPerWeek: 10 });
    const other = useFinanceStore.getState().addJob({ title: 'Tutor', payType: 'hourly', rate: 20, hoursPerWeek: 5 });

    useFinanceStore.getState().updateJob(job.id, { rate: 14 });
    expect(useFinanceStore.getState().profile.jobs.find((j) => j.id === job.id)?.rate).toBe(14);
    expect(useFinanceStore.getState().profile.jobs.find((j) => j.id === other.id)?.rate).toBe(20);

    useFinanceStore.getState().removeJob(job.id);
    expect(useFinanceStore.getState().profile.jobs).toEqual([other]);
  });

  it('addScholarship/updateScholarship/removeScholarship manage the scholarships list independently', () => {
    const scholarship = useFinanceStore.getState().addScholarship({ name: 'Merit award', amount: 6000, frequency: 'year' });
    const other = useFinanceStore.getState().addScholarship({ name: 'Dean list', amount: 1000, frequency: 'one_time' });

    useFinanceStore.getState().updateScholarship(scholarship.id, { amount: 6500 });
    expect(useFinanceStore.getState().profile.scholarships.find((s) => s.id === scholarship.id)?.amount).toBe(6500);
    expect(useFinanceStore.getState().profile.scholarships.find((s) => s.id === other.id)?.amount).toBe(1000);

    useFinanceStore.getState().removeScholarship(scholarship.id);
    expect(useFinanceStore.getState().profile.scholarships).toEqual([other]);
  });
});
