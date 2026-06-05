import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseReady } from '../lib/supabase';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseReady) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    if (!isSupabaseReady) return { error: { message: 'Supabase not configured (.env)' } };
    return supabase.auth.signUp({ email, password });
  };
  const signIn = async (email, password) => {
    if (!isSupabaseReady) return { error: { message: 'Supabase not configured (.env)' } };
    return supabase.auth.signInWithPassword({ email, password });
  };
  const signInWithGoogle = async () => {
    if (!isSupabaseReady) return { error: { message: 'Supabase not configured (.env)' } };
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + window.location.pathname },
    });
  };
  const signOut = async () => { if (isSupabaseReady) await supabase.auth.signOut(); };

  const value = {
    session,
    user: session?.user || null,
    loading,
    ready: isSupabaseReady,
    signUp, signIn, signInWithGoogle, signOut,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
