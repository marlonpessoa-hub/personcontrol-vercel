import { useState, useEffect } from 'react';
import supabase, { isSupabaseConfigured } from '../supabase';

const ERRO_SEM_CONFIG =
  'Supabase não configurado. Crie um arquivo .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (veja .env.example).';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return undefined;
    }

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setLoading(false);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    if (!isSupabaseConfigured) return { success: false, error: ERRO_SEM_CONFIG };
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase.auth.signUp({ email, password });
      if (supabaseError) throw supabaseError;
      setUser(data.user);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) return { success: false, error: ERRO_SEM_CONFIG };
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase.auth.signInWithPassword({ email, password });
      if (supabaseError) throw supabaseError;
      setUser(data.user);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) return { success: false, error: ERRO_SEM_CONFIG };
    setLoading(true);
    setError(null);
    try {
      const { error: supabaseError } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (supabaseError) throw supabaseError;
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user
  };
};

export default useAuth;
