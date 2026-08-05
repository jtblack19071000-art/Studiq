import { useState } from 'react';
import { Button, H4, Input, Paragraph, Text, YStack } from 'tamagui';

import { useAuthStore } from '@/src/state/authStore';

export function AuthForm() {
  const signIn = useAuthStore((state) => state.signIn);
  const signUp = useAuthStore((state) => state.signUp);
  const authError = useAuthStore((state) => state.error);

  const [mode, setMode] = useState<'sign_in' | 'sign_up'>('sign_in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    if (mode === 'sign_in') {
      await signIn(email.trim(), password);
    } else {
      await signUp(email.trim(), password, name.trim() || undefined);
    }
    setSubmitting(false);
  }

  return (
    <YStack gap="$3">
      <H4>{mode === 'sign_in' ? 'Sign in' : 'Create an account'}</H4>
      <Paragraph color="$color10" fontSize="$3">
        Your account keeps your data separate from anyone else who uses Studiq — and Premium
        features follow you across devices too.
      </Paragraph>
      {mode === 'sign_up' ? (
        <Input placeholder="Your name" value={name} onChangeText={setName} />
      ) : null}
      <Input placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <Input placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      {authError ? <Paragraph color="$red10">{authError}</Paragraph> : null}
      <Button theme="active" onPress={handleSubmit} disabled={submitting || !email.trim() || !password}>
        {submitting ? 'Please wait…' : mode === 'sign_in' ? 'Sign in' : 'Create account'}
      </Button>
      <Text
        textAlign="center"
        color="$color10"
        onPress={() => setMode(mode === 'sign_in' ? 'sign_up' : 'sign_in')}>
        {mode === 'sign_in' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
      </Text>
    </YStack>
  );
}
