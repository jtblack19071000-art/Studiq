import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { Button, H2, Input, Label, Paragraph, Text, XStack, YStack } from 'tamagui';

import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { Screen } from '@/src/components/Screen';
import { SectionHeader } from '@/src/components/SectionHeader';
import { calculateMonthlySummary, estimateMonthlyIncomeFromProfile } from '@/src/lib/finance';
import { estimateHourlyPay, PayEstimateAiError } from '@/src/lib/payEstimateAi';
import { useFinanceStore } from '@/src/state/financeStore';
import {
  transactionCategoryLabels,
  type Job,
  type JobPayType,
  type Scholarship,
  type ScholarshipFrequency,
  type TransactionCategory,
  type TransactionType,
} from '@/src/types';

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

  const summary = useMemo(() => calculateMonthlySummary(transactions), [transactions]);

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
        <H2>💸 Finance</H2>
      </YStack>

      <Card>
        <XStack justifyContent="space-between">
          <YStack alignItems="center" flex={1}>
            <Text color="$color10" fontSize="$2">
              💰 Income
            </Text>
            <Text fontWeight="700" fontSize="$6" color="$green10">
              {formatCurrency(summary.income)}
            </Text>
          </YStack>
          <YStack alignItems="center" flex={1}>
            <Text color="$color10" fontSize="$2">
              🧾 Expenses
            </Text>
            <Text fontWeight="700" fontSize="$6" color="$red10">
              {formatCurrency(summary.expenses)}
            </Text>
          </YStack>
          <YStack alignItems="center" flex={1}>
            <Text color="$color10" fontSize="$2">
              ⚖️ Balance
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

      <FinancialProfileSection />

      <YStack gap="$2">
        <SectionHeader title="Add transaction" emoji="➕" />
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
        <SectionHeader title="Recent transactions" emoji="🧾" />
        {transactions.length === 0 ? (
          <Card>
            <EmptyState emoji="💳" message="No transactions yet." />
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

function FinancialProfileSection() {
  const profile = useFinanceStore((state) => state.profile);
  const updateProfile = useFinanceStore((state) => state.updateProfile);
  const removeJob = useFinanceStore((state) => state.removeJob);
  const removeScholarship = useFinanceStore((state) => state.removeScholarship);

  const estimate = useMemo(() => estimateMonthlyIncomeFromProfile(profile), [profile]);

  return (
    <YStack gap="$2">
      <SectionHeader title="Financial profile" emoji="🧑‍🎓" />
      <Card gap="$3">
        <Paragraph color="$color10" fontSize="$3">
          Set this up once — your school, jobs, and scholarships — so Studiq can estimate your monthly income.
          Update it any time your situation changes.
        </Paragraph>
        <XStack gap="$3">
          <YStack flex={1} gap="$2">
            <Label>School</Label>
            <Input
              value={profile.schoolName ?? ''}
              onChangeText={(text) => updateProfile({ schoolName: text })}
              placeholder="e.g. State University"
            />
          </YStack>
          <YStack flex={1} gap="$2">
            <Label>Major</Label>
            <Input
              value={profile.major ?? ''}
              onChangeText={(text) => updateProfile({ major: text })}
              placeholder="e.g. Biology"
            />
          </YStack>
        </XStack>
      </Card>

      <Card alignItems="center" paddingVertical="$4">
        <Text fontWeight="700" fontSize="$8">
          {formatCurrency(estimate.monthlyIncome)}
        </Text>
        <Paragraph color="$color10" fontSize="$3">
          Estimated monthly income from jobs & scholarships
        </Paragraph>
        {estimate.oneTimeScholarships > 0 ? (
          <Paragraph color="$color10" fontSize="$3">
            + {formatCurrency(estimate.oneTimeScholarships)} in one-time scholarships not shown above
          </Paragraph>
        ) : null}
      </Card>

      <YStack gap="$2">
        <Text fontWeight="600">Jobs</Text>
        {profile.jobs.map((job) => (
          <JobRow key={job.id} job={job} onRemove={() => removeJob(job.id)} />
        ))}
        <AddJobForm />
      </YStack>

      <YStack gap="$2">
        <Text fontWeight="600">Scholarships & aid</Text>
        {profile.scholarships.map((scholarship) => (
          <ScholarshipRow key={scholarship.id} scholarship={scholarship} onRemove={() => removeScholarship(scholarship.id)} />
        ))}
        <AddScholarshipForm />
      </YStack>
    </YStack>
  );
}

function JobRow({ job, onRemove }: { job: Job; onRemove: () => void }) {
  return (
    <Card>
      <XStack justifyContent="space-between" alignItems="center">
        <YStack flex={1}>
          <Text fontWeight="600">{job.title}</Text>
          <Paragraph color="$color10" fontSize="$3">
            {job.payType === 'hourly'
              ? `${formatCurrency(job.rate)}/hr · ${job.hoursPerWeek ?? 0} hrs/week`
              : `${formatCurrency(job.rate)}/year`}
            {job.employer ? ` · ${job.employer}` : ''}
          </Paragraph>
        </YStack>
        <Button size="$2" chromeless onPress={onRemove}>
          Remove
        </Button>
      </XStack>
    </Card>
  );
}

function ScholarshipRow({ scholarship, onRemove }: { scholarship: Scholarship; onRemove: () => void }) {
  const frequencyLabel: Record<ScholarshipFrequency, string> = {
    one_time: 'one-time',
    semester: 'per semester',
    year: 'per year',
  };
  return (
    <Card>
      <XStack justifyContent="space-between" alignItems="center">
        <YStack flex={1}>
          <Text fontWeight="600">{scholarship.name}</Text>
          <Paragraph color="$color10" fontSize="$3">
            {formatCurrency(scholarship.amount)} {frequencyLabel[scholarship.frequency]}
          </Paragraph>
        </YStack>
        <Button size="$2" chromeless onPress={onRemove}>
          Remove
        </Button>
      </XStack>
    </Card>
  );
}

function AddJobForm() {
  const addJob = useFinanceStore((state) => state.addJob);

  const [title, setTitle] = useState('');
  const [employer, setEmployer] = useState('');
  const [location, setLocation] = useState('');
  const [payType, setPayType] = useState<JobPayType>('hourly');
  const [rate, setRate] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [estimateNote, setEstimateNote] = useState<string | null>(null);

  async function handleEstimatePay() {
    if (!title.trim()) {
      setError('Enter a job title first so AI has something to estimate from.');
      return;
    }
    setError(null);
    setEstimateNote(null);
    setEstimating(true);
    try {
      const result = await estimateHourlyPay({
        jobTitle: title.trim(),
        employer: employer.trim() || undefined,
        location: location.trim() || undefined,
      });
      setPayType('hourly');
      setRate(result.estimatedHourlyRate.toFixed(2));
      setEstimateNote(
        `AI estimate: ${formatCurrency(result.rangeLow)}–${formatCurrency(result.rangeHigh)}/hr. ${result.reasoning}`,
      );
    } catch (err) {
      setError(err instanceof PayEstimateAiError ? err.message : 'Could not get an estimate. Try entering it manually.');
    } finally {
      setEstimating(false);
    }
  }

  function handleAdd() {
    const parsedRate = Number(rate);
    if (!title.trim()) {
      setError('Give the job a title.');
      return;
    }
    if (!rate.trim() || Number.isNaN(parsedRate) || parsedRate <= 0) {
      setError('Enter a valid rate.');
      return;
    }
    const parsedHours = Number(hoursPerWeek);
    setError(null);
    addJob({
      title: title.trim(),
      payType,
      rate: parsedRate,
      hoursPerWeek: payType === 'hourly' && hoursPerWeek.trim() && !Number.isNaN(parsedHours) ? parsedHours : undefined,
      employer: employer.trim() || undefined,
    });
    setTitle('');
    setEmployer('');
    setLocation('');
    setRate('');
    setHoursPerWeek('');
    setEstimateNote(null);
  }

  return (
    <Card gap="$3">
      <Input value={title} onChangeText={setTitle} placeholder="Job title, e.g. Library front desk" />
      <XStack gap="$2">
        <Input flex={1} value={employer} onChangeText={setEmployer} placeholder="Employer (optional)" />
        <Input flex={1} value={location} onChangeText={setLocation} placeholder="Location (optional)" />
      </XStack>
      <XStack gap="$2">
        <Button flex={1} size="$3" theme={payType === 'hourly' ? 'active' : undefined} onPress={() => setPayType('hourly')}>
          Hourly
        </Button>
        <Button flex={1} size="$3" theme={payType === 'salary' ? 'active' : undefined} onPress={() => setPayType('salary')}>
          Annual salary
        </Button>
      </XStack>
      <XStack gap="$2">
        <Input
          flex={1}
          value={rate}
          onChangeText={setRate}
          keyboardType="decimal-pad"
          placeholder={payType === 'hourly' ? 'Rate ($/hr)' : 'Salary ($/yr)'}
        />
        {payType === 'hourly' ? (
          <Input flex={1} value={hoursPerWeek} onChangeText={setHoursPerWeek} keyboardType="decimal-pad" placeholder="Hours/week" />
        ) : null}
      </XStack>
      <Button size="$3" onPress={handleEstimatePay} disabled={estimating}>
        {estimating ? 'Estimating…' : "Don't know your pay? Estimate with AI"}
      </Button>
      {estimateNote ? (
        <Paragraph color="$color10" fontSize="$3">
          {estimateNote}
        </Paragraph>
      ) : null}
      {error ? <Paragraph color="$red10">{error}</Paragraph> : null}
      <Button theme="active" onPress={handleAdd}>
        Add job
      </Button>
    </Card>
  );
}

function AddScholarshipForm() {
  const addScholarship = useFinanceStore((state) => state.addScholarship);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<ScholarshipFrequency>('semester');
  const [error, setError] = useState<string | null>(null);

  const FREQUENCY_OPTIONS: { value: ScholarshipFrequency; label: string }[] = [
    { value: 'one_time', label: 'One-time' },
    { value: 'semester', label: 'Per semester' },
    { value: 'year', label: 'Per year' },
  ];

  function handleAdd() {
    const parsedAmount = Number(amount);
    if (!name.trim()) {
      setError('Give the scholarship or aid a name.');
      return;
    }
    if (!amount.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Enter a valid amount.');
      return;
    }
    setError(null);
    addScholarship({ name: name.trim(), amount: parsedAmount, frequency });
    setName('');
    setAmount('');
  }

  return (
    <Card gap="$3">
      <XStack gap="$2">
        <Input flex={1} value={name} onChangeText={setName} placeholder="e.g. Merit scholarship" />
        <Input width={100} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="Amount" />
      </XStack>
      <XStack gap="$2">
        {FREQUENCY_OPTIONS.map((option) => (
          <Button
            key={option.value}
            flex={1}
            size="$3"
            theme={frequency === option.value ? 'active' : undefined}
            onPress={() => setFrequency(option.value)}>
            {option.label}
          </Button>
        ))}
      </XStack>
      {error ? <Paragraph color="$red10">{error}</Paragraph> : null}
      <Button theme="active" onPress={handleAdd}>
        Add scholarship
      </Button>
    </Card>
  );
}
