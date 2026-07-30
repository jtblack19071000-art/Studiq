import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createId } from '@/src/lib/id';
import { mmkvStateStorage } from '@/src/lib/mmkvStorage';
import type { Transaction } from '@/src/types';

interface FinanceState {
  transactions: Transaction[];
  addTransaction: (input: Omit<Transaction, 'id'>) => Transaction;
  removeTransaction: (id: string) => void;
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

const seedTransactions: Transaction[] = [
  {
    id: 'seed-tx-1',
    title: 'Campus job paycheck',
    amount: 340,
    type: 'income',
    category: 'job_income',
    date: daysAgo(3),
  },
  {
    id: 'seed-tx-2',
    title: 'Groceries',
    amount: 62.4,
    type: 'expense',
    category: 'food',
    date: daysAgo(2),
  },
  {
    id: 'seed-tx-3',
    title: 'Textbook rental',
    amount: 85,
    type: 'expense',
    category: 'books_supplies',
    date: daysAgo(6),
  },
];

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      transactions: seedTransactions,
      addTransaction: (input) => {
        const created: Transaction = { ...input, id: createId() };
        set((state) => ({ transactions: [created, ...state.transactions] }));
        return created;
      },
      removeTransaction: (id) => {
        set((state) => ({ transactions: state.transactions.filter((tx) => tx.id !== id) }));
      },
    }),
    { name: 'studiq-finance', storage: createJSONStorage(() => mmkvStateStorage) },
  ),
);
