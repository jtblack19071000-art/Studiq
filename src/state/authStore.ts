import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { resetAllCloudSyncedStores, startCloudSyncForUser, stopCloudSync } from '@/src/lib/cloudSync';
import { supabase } from '@/src/lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  initializing: boolean;
  error: string | null;
  init: () => void;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
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
  signUp: async (email, password) => {
    if (!supabase) {
      set({ error: 'Cloud sync is not configured.' });
      return;
    }
    set({ error: null });
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) set({ error: error.message });
  },
  signIn: async (email, password) => {
    if (!supabase) {
      set({ error: 'Cloud sync is not configured.' });
      return;
    }
    set({ error: null });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) set({ error: error.message });
  },
  signOut: async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  },
}));
