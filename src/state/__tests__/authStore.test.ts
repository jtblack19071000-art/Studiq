/// <reference types="jest" />

import { useAuthStore } from '@/src/state/authStore';

const initialState = useAuthStore.getState();

beforeEach(() => {
  useAuthStore.setState(initialState, true);
});

// No EXPO_PUBLIC_SUPABASE_URL/KEY are set in the test environment, so `supabase` (src/lib/supabase.ts)
// is null and every action here takes its "cloud sync not configured" branch — the same state the
// app is in until Supabase credentials are provided. See README "Setup" for the configured path.
describe('useAuthStore (cloud sync not configured)', () => {
  it('starts initializing with no user or session', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.initializing).toBe(true);
  });

  it('init() finishes initializing without a session when Supabase is not configured', () => {
    useAuthStore.getState().init();

    expect(useAuthStore.getState().initializing).toBe(false);
    expect(useAuthStore.getState().session).toBeNull();
  });

  it('signUp() surfaces a clear "not configured" error instead of hanging or crashing', async () => {
    await useAuthStore.getState().signUp('email', 'student@example.edu', 'password123');

    expect(useAuthStore.getState().error).toBe('Cloud sync is not configured.');
  });

  it('signIn() surfaces a clear "not configured" error instead of hanging or crashing', async () => {
    await useAuthStore.getState().signIn('student@example.edu', 'password123');

    expect(useAuthStore.getState().error).toBe('Cloud sync is not configured.');
  });

  it('signOut() resolves without throwing when there is nothing to sign out of', async () => {
    await expect(useAuthStore.getState().signOut()).resolves.toBeUndefined();
  });

  it('updateProfile() surfaces a clear "not configured" error instead of hanging or crashing', async () => {
    await useAuthStore.getState().updateProfile({ college: 'State University' });

    expect(useAuthStore.getState().error).toBe('Cloud sync is not configured.');
  });

  it('verifyOtp() surfaces a clear "not configured" error instead of hanging or crashing', async () => {
    await useAuthStore.getState().verifyOtp('123456');

    expect(useAuthStore.getState().error).toBe('Cloud sync is not configured.');
  });

  it('resendOtp() is a no-op instead of hanging or crashing', async () => {
    await expect(useAuthStore.getState().resendOtp()).resolves.toBeUndefined();
  });

  it('requestPasswordReset() surfaces a clear "not configured" error instead of hanging or crashing', async () => {
    await useAuthStore.getState().requestPasswordReset('student@example.edu');

    expect(useAuthStore.getState().error).toBe('Cloud sync is not configured.');
  });

  it('setNewPassword() surfaces a clear "not configured" error instead of hanging or crashing', async () => {
    await useAuthStore.getState().setNewPassword('newpassword123');

    expect(useAuthStore.getState().error).toBe('Cloud sync is not configured.');
  });

  it('deleteAccount() surfaces a clear "not configured" error and resolves false', async () => {
    const result = await useAuthStore.getState().deleteAccount();

    expect(result).toBe(false);
    expect(useAuthStore.getState().error).toBe('Cloud sync is not configured.');
  });

  it('clearPendingVerification() clears both pendingVerification and error', () => {
    useAuthStore.setState({ pendingVerification: { type: 'email', value: 'a@b.com', purpose: 'sign_up' }, error: 'oops' });

    useAuthStore.getState().clearPendingVerification();

    expect(useAuthStore.getState().pendingVerification).toBeNull();
    expect(useAuthStore.getState().error).toBeNull();
  });
});
