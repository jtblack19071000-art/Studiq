import { isSameMonth } from 'date-fns';

import type { Transaction } from '@/src/types';

export interface FinanceSummary {
  income: number;
  expenses: number;
  balance: number;
}

/** Income/expense/balance totals for transactions in the same calendar month as `referenceDate`. */
export function calculateMonthlySummary(
  transactions: Transaction[],
  referenceDate: Date = new Date(),
): FinanceSummary {
  const thisMonth = transactions.filter((tx) => isSameMonth(new Date(tx.date), referenceDate));
  const income = thisMonth
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const expenses = thisMonth
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return { income, expenses, balance: income - expenses };
}
