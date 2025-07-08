'use client';
import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import { User, Session } from '@supabase/supabase-js';
import { Tables } from '@/types/database';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Tables<'user_profiles'> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (data: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    organizationName: string;
    organizationSubdomain: string;
  }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user && data.session) {
        // Get user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        set({
          user: data.user,
          session: data.session,
          profile,
          isAuthenticated: true,
          isLoading: false,
        });
      }

      return {};
    } catch (error) {
      set({ isLoading: false });
      return { error: 'An unexpected error occurred' };
    }
  },

  signUp: async (data) => {
    try {
      set({ isLoading: true });
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.details ? `${result.error}: ${result.details}` : result.error || 'Signup failed';
        console.error('Signup API error:', result);
        return { error: errorMessage };
      }

      // Auto-sign in after successful signup
      const signInResult = await get().signIn(data.email, data.password);
      return signInResult;
    } catch (error) {
      set({ isLoading: false });
      return { error: 'An unexpected error occurred' };
    }
  },

  signOut: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      await supabase.auth.signOut();
      
      set({
        user: null,
        session: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Signout error:', error);
    }
  },

  refreshProfile: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        set({
          user,
          profile,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          session: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Profile refresh error:', error);
      set({ isLoading: false });
    }
  },
}));

// Initialize auth state
if (typeof window !== 'undefined') {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      useAuth.getState().refreshProfile();
    } else {
      useAuth.setState({ isLoading: false });
    }
  });

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      useAuth.getState().refreshProfile();
    } else if (event === 'SIGNED_OUT') {
      useAuth.setState({
        user: null,
        session: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  });
} 