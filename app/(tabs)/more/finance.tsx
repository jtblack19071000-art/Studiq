import { format, isSameMonth } from 'date-fns';
import { useMemo, useState } from 'react';
import { Button, H2, Input, Paragraph, Text, XStack, YStack } from 'tamagui';

import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { Screen } from '@/src/components/Screen';
import { SectionHeader } from '@/src/components/SectionHeader';
import { useFinanceStore } from '@/src/state/financeStore';
import { transactionCategoryLabels, type TransactionCategory, type TransactionType } from '@/src/types';

const CATEGORIES = Object.keys(transactionCategoryLabels) as TransactionCategory[];

function formatCurrency(amount: number): string {
  return amount.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

export default function FinanceScreen() {
  const transactions = useFinanceStore((state) => state.transactions);
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const removeTransaction = useFinanceStore((state) => state.removeTransaction);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<TransactionCategory>('other');
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => {
    const now = new Date();
    const thisMonth = transactions.filter((tx) => isSameMonth(new Date(tx.date), now));
    const income = thisMonth.filter((tx) => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const expenses = thisMonth.filter((tx) => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [transactions]);

  function handleAdd() {
    const parsedAmount = Number(amount);
    if (!title.trim()) {
      setError('Give the transaction a title.');
      return;
    }
    if (!amount.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Enter a valid amount.');
      return;
    }
    setError(null);
    addTransaction({ title: title.trim(), amount: parsedAmount, type, category, date: new Date().toISOString() });
    setTitle('');
    setAmount('');
  }

  return (
    <Screen>
      <YStack gap="$1" paddingTop="$2">
        <H2>Finance</H2>
      </YStack>

      <Card>
        <XStack justifyContent="space-between">
          <YStack alignItems="center" flex={1}>
            <Text color="$color10" fontSize="$2">
              Income
            </Text>
            <Text fontWeight="700" fontSize="$6" color="$green10">
              {formatCurrency(summary.income)}
            </Text>
          </YStack>
          <YStack alignItems="center" flex={1}>
            <Text color="$color10" fontSize="$2">
              Expenses
            </Text>
            <Text fontWeight="700" fontSize="$6" color="$red10">
              {formatCurrency(summary.expenses)}
            </Text>
          </YStack>
          <YStack alignItems="center" flex={1}>
            <Text color="$color10" fontSize="$2">
              Balance
            </Text>
            <Text fontWeight="700" fontSize="$6">
              {formatCurrency(summary.balance)}
            </Text>
          </YStack>
        </XStack>
        <Paragraph color="$color10" fontSize="$3" textAlign="center">
          This month
        </Paragraph>
      </Card>

      <YStack gap="$2">
        <SectionHeader title="Add transaction" />
        <Card gap="$3">
          <XStack gap="$2">
            <Input flex={1} placeholder="Title" value={title} onChangeText={setTitle} />
            <Input width={100} placeholder="Amount" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />
          </XStack>
          <XStack gap="$2">
            <Button flex={1} size="$3" theme={type === 'expense' ? 'active' : undefined} onPress={() => setType('expense')}>
              Expense
            </Button>
            <Button flex={1} size="$3" theme={type === 'income' ? 'active' : undefined} onPress={() => setType('income')}>
              Income
            </Button>
          </XStack>
          <XStack flexWrap="wrap" gap="$2">
            {CATEGORIES.map((option) => (
              <Button
                key={option}
                size="$2"
                theme={category === option ? 'active' : undefined}
                onPress={() => setCategory(option)}>
                {transactionCategoryLabels[option]}
              </Button>
            ))}
          </XStack>
          {error ? <Paragraph color="$red10">{error}</Paragraph> : null}
          <Button theme="active" onPress={handleAdd}>
            Add
          </Button>
        </Card>
      </YStack>

      <YStack gap="$2">
        <SectionHeader title="Recent transactions" />
        {transactions.length === 0 ? (
          <Card>
            <EmptyState message="No transactions yet." />
          </Card>
        ) : (
          <YStack gap="$2">
            {transactions.map((tx) => (
              <Card key={tx.id}>
                <XStack justifyContent="space-between" alignItems="center">
                  <YStack flex={1}>
                    <Text fontWeight="600">{tx.title}</Text>
                    <Paragraph color="$color10" fontSize="$3">
                      {transactionCategoryLabels[tx.category]} · {format(new Date(tx.date), 'MMM d')}
                    </Paragraph>
                  </YStack>
                  <XStack alignItems="center" gap="$3">
                    <Text fontWeight="700" color={tx.type === 'income' ? '$green10' : '$red10'}>
                      {tx.type === 'income' ? '+' : '−'}
                      {formatCurrency(tx.amount)}
                    </Text>
                    <Button size="$2" chromeless onPress={() => removeTransaction(tx.id)}>
                      Remove
                    </Button>
                  </XStack>
                </XStack>
              </Card>
            ))}
          </YStack>
        )}
      </YStack>
    </Screen>
  );
}
