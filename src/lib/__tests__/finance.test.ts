/// <reference types="jest" />

import { calculateMonthlySummary, estimateMonthlyIncomeFromProfile } from '@/src/lib/finance';
import type { FinancialProfile, Transaction } from '@/src/types';

function buildTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: overrides.id ?? 'tx-1',
    title: 'Groceries',
    amount: 50,
    type: 'expense',
    category: 'food',
    date: '2024-03-15T12:00:00.000Z',
    ...overrides,
  };
}

describe('calculateMonthlySummary', () => {
  const referenceDate = new Date('2024-03-20T00:00:00.000Z');

  it('returns all zeros for an empty transaction list', () => {
    expect(calculateMonthlySummary([], referenceDate)).toEqual({
      income: 0,
      expenses: 0,
      balance: 0,
    });
  });

  it('sums income and expenses within the reference month and computes balance', () => {
    const transactions = [
      buildTransaction({ id: 'a', type: 'income', amount: 340, date: '2024-03-03T00:00:00.000Z' }),
      buildTransaction({ id: 'b', type: 'expense', amount: 62.4, date: '2024-03-05T00:00:00.000Z' }),
      buildTransaction({ id: 'c', type: 'expense', amount: 85, date: '2024-03-18T00:00:00.000Z' }),
    ];

    const summary = calculateMonthlySummary(transactions, referenceDate);
    expect(summary.income).toBe(340);
    expect(summary.expenses).toBeCloseTo(147.4, 5);
    expect(summary.balance).toBeCloseTo(192.6, 5);
  });

  it('excludes transactions from months other than the reference month', () => {
    const transactions = [
      buildTransaction({ id: 'feb', type: 'income', amount: 500, date: '2024-02-28T23:59:59.000Z' }),
      buildTransaction({ id: 'mar', type: 'income', amount: 100, date: '2024-03-01T00:00:00.000Z' }),
      buildTransaction({ id: 'apr', type: 'expense', amount: 40, date: '2024-04-01T00:00:00.000Z' }),
    ];

    const summary = calculateMonthlySummary(transactions, referenceDate);
    expect(summary).toEqual({ income: 100, expenses: 0, balance: 100 });
  });

  it('handles a month with only expenses (negative balance)', () => {
    const transactions = [
      buildTransaction({ id: 'a', type: 'expense', amount: 30, date: '2024-03-02T00:00:00.000Z' }),
      buildTransaction({ id: 'b', type: 'expense', amount: 20, date: '2024-03-10T00:00:00.000Z' }),
    ];

    const summary = calculateMonthlySummary(transactions, referenceDate);
    expect(summary).toEqual({ income: 0, expenses: 50, balance: -50 });
  });

  it('handles a month with only income', () => {
    const transactions = [
      buildTransaction({ id: 'a', type: 'income', amount: 200, date: '2024-03-02T00:00:00.000Z' }),
    ];

    const summary = calculateMonthlySummary(transactions, referenceDate);
    expect(summary).toEqual({ income: 200, expenses: 0, balance: 200 });
  });

  it('defaults to the current date when no reference date is given', () => {
    const now = new Date();
    const transactions = [buildTransaction({ type: 'income', amount: 75, date: now.toISOString() })];

    const summary = calculateMonthlySummary(transactions);
    expect(summary).toEqual({ income: 75, expenses: 0, balance: 75 });
  });
});

function buildProfile(overrides: Partial<FinancialProfile> = {}): FinancialProfile {
  return { jobs: [], scholarships: [], ...overrides };
}

describe('estimateMonthlyIncomeFromProfile', () => {
  it('returns zero income for an empty profile', () => {
    expect(estimateMonthlyIncomeFromProfile(buildProfile())).toEqual({
      monthlyIncome: 0,
      oneTimeScholarships: 0,
    });
  });

  it('amortizes an hourly job to a monthly figure using average weeks per month', () => {
    const profile = buildProfile({
      jobs: [{ id: 'job-1', title: 'Library front desk', payType: 'hourly', rate: 15, hoursPerWeek: 10 }],
    });

    // 15 * 10 * (52/12) ≈ 650
    expect(estimateMonthlyIncomeFromProfile(profile).monthlyIncome).toBeCloseTo(650, 0);
  });

  it('treats an hourly job with no hoursPerWeek set as zero income', () => {
    const profile = buildProfile({
      jobs: [{ id: 'job-1', title: 'On-call tutor', payType: 'hourly', rate: 20 }],
    });

    expect(estimateMonthlyIncomeFromProfile(profile).monthlyIncome).toBe(0);
  });

  it('divides a salaried job evenly across 12 months', () => {
    const profile = buildProfile({
      jobs: [{ id: 'job-1', title: 'Research assistant', payType: 'salary', rate: 24000 }],
    });

    expect(estimateMonthlyIncomeFromProfile(profile).monthlyIncome).toBe(2000);
  });

  it('amortizes a per-semester scholarship across ~4.5 months and a per-year one across 12', () => {
    const profile = buildProfile({
      scholarships: [
        { id: 's-1', name: 'Dean scholarship', amount: 4500, frequency: 'semester' },
        { id: 's-2', name: 'Merit award', amount: 6000, frequency: 'year' },
      ],
    });

    expect(estimateMonthlyIncomeFromProfile(profile).monthlyIncome).toBeCloseTo(1000 + 500, 5);
  });

  it('excludes one-time scholarships from the monthly figure and totals them separately', () => {
    const profile = buildProfile({
      scholarships: [{ id: 's-1', name: 'Emergency grant', amount: 1200, frequency: 'one_time' }],
    });

    expect(estimateMonthlyIncomeFromProfile(profile)).toEqual({ monthlyIncome: 0, oneTimeScholarships: 1200 });
  });

  it('combines jobs and scholarships together', () => {
    const profile = buildProfile({
      jobs: [{ id: 'job-1', title: 'Barista', payType: 'hourly', rate: 12, hoursPerWeek: 15 }],
      scholarships: [{ id: 's-1', name: 'Merit award', amount: 6000, frequency: 'year' }],
    });

    // (12 * 15 * 52/12) + (6000/12) = 780 + 500
    expect(estimateMonthlyIncomeFromProfile(profile).monthlyIncome).toBeCloseTo(1280, 0);
  });
});
