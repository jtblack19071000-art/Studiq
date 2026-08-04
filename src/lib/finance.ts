import { isSameMonth } from 'date-fns';

import type { FinancialProfile, Transaction } from '@/src/types';

export interface FinanceSummary {
  income: number;
  expenses: number;
  balance: number;
}

const WEEKS_PER_MONTH = 52 / 12;
const MONTHS_PER_SEMESTER = 4.5;

export interface ProfileIncomeEstimate {
  /** Recurring monthly income from jobs plus semester/year scholarships, amortized to a monthly figure. */
  monthlyIncome: number;
  /** Scholarships marked one-time, not amortized into the monthly figure. */
  oneTimeScholarships: number;
}

/** Estimates recurring monthly income from a student's jobs and scholarships. Purely arithmetic — no AI involved. */
export function estimateMonthlyIncomeFromProfile(profile: FinancialProfile): ProfileIncomeEstimate {
  const jobsMonthly = profile.jobs.reduce((sum, job) => {
    if (job.payType === 'salary') return sum + job.rate / 12;
    return sum + job.rate * (job.hoursPerWeek ?? 0) * WEEKS_PER_MONTH;
  }, 0);

  const scholarshipsMonthly = profile.scholarships
    .filter((scholarship) => scholarship.frequency !== 'one_time')
    .reduce((sum, scholarship) => {
      if (scholarship.frequency === 'year') return sum + scholarship.amount / 12;
      return sum + scholarship.amount / MONTHS_PER_SEMESTER;
    }, 0);

  const oneTimeScholarships = profile.scholarships
    .filter((scholarship) => scholarship.frequency === 'one_time')
    .reduce((sum, scholarship) => sum + scholarship.amount, 0);

  return { monthlyIncome: jobsMonthly + scholarshipsMonthly, oneTimeScholarships };
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
