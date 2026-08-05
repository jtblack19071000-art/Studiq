import { useState } from 'react';
import { Button, H4, Input, Paragraph, Text, XStack, YStack } from 'tamagui';

import { useAuthStore, type AuthIdentifierType } from '@/src/state/authStore';

type BaseMode = 'sign_in' | 'sign_up' | 'forgot_password';

export function AuthForm() {
  const signIn = useAuthStore((state) => state.signIn);
  const signUp = useAuthStore((state) => state.signUp);
  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const resendOtp = useAuthStore((state) => state.resendOtp);
  const requestPasswordReset = useAuthStore((state) => state.requestPasswordReset);
  const submitNewPassword = useAuthStore((state) => state.setNewPassword);
  const clearPendingVerification = useAuthStore((state) => state.clearPendingVerification);
  const pendingVerification = useAuthStore((state) => state.pendingVerification);
  const session = useAuthStore((state) => state.session);
  const authError = useAuthStore((state) => state.error);

  const [baseMode, setBaseMode] = useState<BaseMode>('sign_in');
  const [signUpMethod, setSignUpMethod] = useState<AuthIdentifierType>('email');
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function run(action: () => Promise<void>) {
    setSubmitting(true);
    await action();
    setSubmitting(false);
  }

  // A recovery code has been verified — a session now exists, but the password hasn't been
  // changed yet. Keep the wall up (see requiresSignIn in app/_layout.tsx) until it is.
  if (pendingVerification?.purpose === 'recovery' && session) {
    return (
      <YStack gap="$3">
        <H4>Choose a new password</H4>
        <Input placeholder="New password" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
        {authError ? <Paragraph color="$red10">{authError}</Paragraph> : null}
        <Button
          theme="active"
          disabled={submitting || newPassword.length < 6}
          onPress={() => run(() => submitNewPassword(newPassword))}>
          {submitting ? 'Saving…' : 'Save password'}
        </Button>
      </YStack>
    );
  }

  if (pendingVerification) {
    const destination = pendingVerification.type === 'email' ? 'email' : 'phone';
    return (
      <YStack gap="$3">
        <H4>Enter your code</H4>
        <Paragraph color="$color10" fontSize="$3">
          We sent a 6-digit code to the {destination} {pendingVerification.value}.
        </Paragraph>
        <Input
          placeholder="123456"
          keyboardType="number-pad"
          autoCapitalize="none"
          value={code}
          onChangeText={setCode}
        />
        {authError ? <Paragraph color="$red10">{authError}</Paragraph> : null}
        <Button theme="active" disabled={submitting || !code.trim()} onPress={() => run(() => verifyOtp(code.trim()))}>
          {submitting ? 'Verifying…' : 'Verify'}
        </Button>
        <XStack justifyContent="space-between">
          <Text color="$color10" onPress={() => run(resendOtp)}>
            Resend code
          </Text>
          <Text color="$color10" onPress={clearPendingVerification}>
            Cancel
          </Text>
        </XStack>
      </YStack>
    );
  }

  if (baseMode === 'forgot_password') {
    return (
      <YStack gap="$3">
        <H4>Reset your password</H4>
        <Paragraph color="$color10" fontSize="$3">
          Enter the email on your account and we&apos;ll send you a code to reset your password.
        </Paragraph>
        <Input
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={resetEmail}
          onChangeText={setResetEmail}
        />
        {authError ? <Paragraph color="$red10">{authError}</Paragraph> : null}
        <Button
          theme="active"
          disabled={submitting || !resetEmail.trim()}
          onPress={() => run(() => requestPasswordReset(resetEmail))}>
          {submitting ? 'Sending…' : 'Send reset code'}
        </Button>
        <Text textAlign="center" color="$color10" onPress={() => setBaseMode('sign_in')}>
          Back to sign in
        </Text>
      </YStack>
    );
  }

  async function handleSubmit() {
    if (baseMode === 'sign_in') {
      await run(() => signIn(identifier.trim(), password));
    } else {
      await run(() => signUp(signUpMethod, identifier.trim(), password, name.trim() || undefined));
    }
  }

  return (
    <YStack gap="$3">
      <H4>{baseMode === 'sign_in' ? 'Sign in' : 'Create an account'}</H4>
      <Paragraph color="$color10" fontSize="$3">
        Your account keeps your data separate from anyone else who uses Studiq — and Premium
        features follow you across devices too.
      </Paragraph>
      {baseMode === 'sign_up' ? (
        <>
          <Input placeholder="Your name" value={name} onChangeText={setName} />
          <XStack gap="$2">
            <Button
              flex={1}
              size="$3"
              theme={signUpMethod === 'email' ? 'active' : undefined}
              onPress={() => {
                setSignUpMethod('email');
                setIdentifier('');
              }}>
              Email
            </Button>
            <Button
              flex={1}
              size="$3"
              theme={signUpMethod === 'phone' ? 'active' : undefined}
              onPress={() => {
                setSignUpMethod('phone');
                setIdentifier('');
              }}>
              Phone
            </Button>
          </XStack>
          <Input
            placeholder={signUpMethod === 'email' ? 'Email' : 'Phone number, e.g. +15551234567'}
            autoCapitalize="none"
            keyboardType={signUpMethod === 'email' ? 'email-address' : 'phone-pad'}
            value={identifier}
            onChangeText={setIdentifier}
          />
        </>
      ) : (
        <Input
          placeholder="Email or phone"
          autoCapitalize="none"
          keyboardType="email-address"
          value={identifier}
          onChangeText={setIdentifier}
        />
      )}
      <Input placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      {authError ? <Paragraph color="$red10">{authError}</Paragraph> : null}
      <Button theme="active" onPress={handleSubmit} disabled={submitting || !identifier.trim() || !password}>
        {submitting ? 'Please wait…' : baseMode === 'sign_in' ? 'Sign in' : 'Create account'}
      </Button>
      {baseMode === 'sign_up' ? (
        <Paragraph color="$color10" fontSize="$2" textAlign="center">
          We&apos;ll text or email you a code to verify it&apos;s you before your account is created.
        </Paragraph>
      ) : null}
      <YStack gap="$2" alignItems="center">
        <Text
          textAlign="center"
          color="$color10"
          onPress={() => setBaseMode(baseMode === 'sign_in' ? 'sign_up' : 'sign_in')}>
          {baseMode === 'sign_in' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
        </Text>
        {baseMode === 'sign_in' ? (
          <Text textAlign="center" color="$color10" onPress={() => setBaseMode('forgot_password')}>
            Forgot password?
          </Text>
        ) : null}
      </YStack>
    </YStack>
  );
}
