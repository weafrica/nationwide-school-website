import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId) => {
    if (!userId) { setProfile(null); return; }
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data || null);
  }, []);

  useEffect(() => {
    // Until the real Supabase project is configured (see
    // supabaseClient.js), skip network calls entirely rather than
    // hitting a placeholder URL that can only fail or hang — the portal
    // simply shows as "signed out" until real env vars are set.
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      loadProfile(data.session?.user?.id).finally(() => setLoading(false));
    });

    // Auto-refresh: whenever the auth state changes on this device (sign
    // in, sign out, or Supabase silently rotating the access token),
    // re-pull session + profile so the portal reflects it immediately —
    // no manual page reload needed, the same way the eFootball app's
    // banners stay live without the person doing anything.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      loadProfile(newSession?.user?.id);
    });

    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/portal/dashboard' } });

  const signInWithPassword = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signOut = () => supabase.auth.signOut();

  const refreshProfile = () => loadProfile(session?.user?.id);

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    role: profile?.role ?? null,
    loading,
    signInWithGoogle,
    signInWithPassword,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
