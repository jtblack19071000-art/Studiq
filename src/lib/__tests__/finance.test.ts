/// <reference types="jest" />

import { calculateMonthlySummary } from '@/src/lib/finance';
import type { Transaction } from '@/src/types';

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
