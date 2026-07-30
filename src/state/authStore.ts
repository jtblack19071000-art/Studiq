import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

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

export const useAuthStore = create<AuthState>()((set) => ({
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
      set({ session: data.session, user: data.session?.user ?? null, initializing: false });
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
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
