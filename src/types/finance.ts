import type { ID } from './common';

export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'tuition'
  | 'housing'
  | 'food'
  | 'transportation'
  | 'books_supplies'
  | 'entertainment'
  | 'job_income'
  | 'financial_aid'
  | 'other';

export const transactionCategoryLabels: Record<TransactionCategory, string> = {
  tuition: 'Tuition',
  housing: 'Housing',
  food: 'Food',
  transportation: 'Transportation',
  books_supplies: 'Books & Supplies',
  entertainment: 'Entertainment',
  job_income: 'Job Income',
  financial_aid: 'Financial Aid',
  other: 'Other',
};

export interface Transaction {
  id: ID;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
  notes?: string;
}
