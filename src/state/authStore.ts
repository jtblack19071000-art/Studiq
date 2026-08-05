import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { resetAllCloudSyncedStores, startCloudSyncForUser, stopCloudSync } from '@/src/lib/cloudSync';
import { supabase } from '@/src/lib/supabase';

export interface ProfileMetadata {
  displayName?: string;
  college?: string;
}

export type AuthIdentifierType = 'email' | 'phone';

export interface PendingVerification {
  type: AuthIdentifierType;
  value: string;
  purpose: 'sign_up' | 'recovery';
}

interface AuthState {
  user: User | null;
  session: Session | null;
  initializing: boolean;
  error: string | null;
  /** Set once a sign-up or password-reset needs a code entered before it can complete. */
  pendingVerification: PendingVerification | null;
  init: () => void;
  signUp: (identifierType: AuthIdentifierType, identifier: string, password: string, displayName?: string) => Promise<void>;
  /** Verifies the code sent for the current `pendingVerification` (sign-up or recovery). */
  verifyOtp: (token: string) => Promise<void>;
  resendOtp: () => Promise<void>;
  signIn: (identifier: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: ProfileMetadata) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  /** Sets a new password once the recovery code has been verified (a recovery session is active). */
  setNewPassword: (newPassword: string) => Promise<void>;
  clearPendingVerification: () => void;
  /** Permanently deletes the signed-in user's account and all their data. Returns whether it succeeded. */
  deleteAccount: () => Promise<boolean>;
}

let initialized = false;

/** Reacts to a resolved auth state (from getSession() or onAuthStateChange) by syncing or clearing every cloud-synced store. */
function handleUserTransition(previousUserId: string | null, nextUserId: string | null): void {
  if (nextUserId && nextUserId !== previousUserId) {
    void startCloudSyncForUser(nextUserId);
  } else if (!nextUserId && previousUserId) {
    stopCloudSync();
    resetAllCloudSyncedStores();
  }
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  session: null,
  initializing: true,
  error: null,
  pendingVerification: null,
  init: () => {
    if (initialized || !supabase) {
      set({ initializing: false });
      return;
    }
    initialized = true;

    supabase.auth.getSession().then(({ data }) => {
      const previousUserId = get().user?.id ?? null;
      const nextUserId = data.session?.user?.id ?? null;
      set({ session: data.session, user: data.session?.user ?? null, initializing: false });
      handleUserTransition(previousUserId, nextUserId);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      const previousUserId = get().user?.id ?? null;
      const nextUserId = session?.user?.id ?? null;
      set({ session, user: session?.user ?? null });
      handleUserTransition(previousUserId, nextUserId);
    });
  },
  signUp: async (identifierType, identifier, password, displayName) => {
    if (!supabase) {
      set({ error: 'Cloud sync is not configured.' });
      return;
    }
    set({ error: null });
    const trimmed = identifier.trim();
    const options = displayName ? { data: { display_name: displayName } } : undefined;
    const { error, data } =
      identifierType === 'email'
        ? await supabase.auth.signUp({ email: trimmed, password, options })
        : await supabase.auth.signUp({ phone: trimmed, password, options });
    if (error) {
      set({ error: error.message });
      return;
    }
    if (data.session) {
      // Some Supabase projects have signup confirmation turned off entirely — the session is
      // already active and there's no code to enter.
      set({ pendingVerification: null });
      return;
    }
    set({ pendingVerification: { type: identifierType, value: trimmed, purpose: 'sign_up' } });
  },
  verifyOtp: async (token) => {
    if (!supabase) {
      set({ error: 'Cloud sync is not configured.' });
      return;
    }
    const pending = get().pendingVerification;
    if (!pending) {
      set({ error: 'Nothing to verify.' });
      return;
    }
    set({ error: null });
    const signUpType = pending.type === 'email' ? 'signup' : 'sms';
    const { error } =
      pending.type === 'email'
        ? await supabase.auth.verifyOtp({
            email: pending.value,
            token,
            type: pending.purpose === 'recovery' ? 'recovery' : signUpType,
          })
        : await supabase.auth.verifyOtp({
            phone: pending.value,
            token,
            type: pending.purpose === 'recovery' ? 'sms' : signUpType,
          });
    if (error) {
      set({ error: error.message });
      return;
    }
    if (pending.purpose === 'sign_up') set({ pendingVerification: null });
    // For a recovery code, pendingVerification stays set so the UI moves on to "set new password".
  },
  resendOtp: async () => {
    if (!supabase) return;
    const pending = get().pendingVerification;
    if (!pending) return;
    set({ error: null });
    if (pending.purpose === 'sign_up') {
      const { error } =
        pending.type === 'email'
          ? await supabase.auth.resend({ type: 'signup', email: pending.value })
          : await supabase.auth.resend({ type: 'sms', phone: pending.value });
      if (error) set({ error: error.message });
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(pending.value);
      if (error) set({ error: error.message });
    }
  },
  signIn: async (identifier, password) => {
    if (!supabase) {
      set({ error: 'Cloud sync is not configured.' });
      return;
    }
    set({ error: null });
    const trimmed = identifier.trim();
    const { error } = trimmed.includes('@')
      ? await supabase.auth.signInWithPassword({ email: trimmed, password })
      : await supabase.auth.signInWithPassword({ phone: trimmed, password });
    if (error) set({ error: error.message });
  },
  signOut: async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  },
  updateProfile: async (patch) => {
    if (!supabase) {
      set({ error: 'Cloud sync is not configured.' });
      return;
    }
    set({ error: null });
    const data: Record<string, string> = {};
    if (patch.displayName !== undefined) data.display_name = patch.displayName;
    if (patch.college !== undefined) data.college = patch.college;
    const { error, data: result } = await supabase.auth.updateUser({ data });
    if (error) {
      set({ error: error.message });
      return;
    }
    if (result.user) set({ user: result.user });
  },
  requestPasswordReset: async (email) => {
    if (!supabase) {
      set({ error: 'Cloud sync is not configured.' });
      return;
    }
    set({ error: null });
    const trimmed = email.trim();
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed);
    if (error) {
      set({ error: error.message });
      return;
    }
    set({ pendingVerification: { type: 'email', value: trimmed, purpose: 'recovery' } });
  },
  setNewPassword: async (newPassword) => {
    if (!supabase) {
      set({ error: 'Cloud sync is not configured.' });
      return;
    }
    set({ error: null });
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      set({ error: error.message });
      return;
    }
    set({ pendingVerification: null });
  },
  clearPendingVerification: () => set({ pendingVerification: null, error: null }),
  deleteAccount: async () => {
    if (!supabase) {
      set({ error: 'Cloud sync is not configured.' });
      return false;
    }
    const token = get().session?.access_token;
    if (!token) {
      set({ error: 'You must be signed in.' });
      return false;
    }
    set({ error: null });
    try {
      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        set({ error: typeof body?.error === 'string' ? body.error : 'Could not delete your account.' });
        return false;
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Could not delete your account.' });
      return false;
    }
    stopCloudSync();
    resetAllCloudSyncedStores();
    await supabase.auth.signOut();
    return true;
  },
}));
