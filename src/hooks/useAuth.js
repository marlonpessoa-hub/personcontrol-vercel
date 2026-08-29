import { useState, useEffect } from 'react';
import supabase, { isSupabaseConfigured } from '../supabase';
import {
  isNative,
  abrirUrl,
  fecharNavegador,
  aoReceberCallbackUrl,
  oauthCallbackScheme,
  oauthCallbackPath
} from './useNative';

const ERRO_SEM_CONFIG =
  'Supabase não configurado. Crie um arquivo .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (veja .env.example).';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);

  // Só aceita usuários com ID válido; sessões parciais/corrompidas viram logout
  const aplicarUsuario = (u) => setUser(u?.id ? u : null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return undefined;
    }

    const checkSession = async () => {
      try {
        const timeout = new Promise((resolve) =>
          setTimeout(() => resolve({ data: { session: null } }), 10000)
        );
        const { data: { session } } = await Promise.race([
          supabase.auth.getSession(),
          timeout
        ]);
        aplicarUsuario(session?.user || null);
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setLoading(false);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      aplicarUsuario(session?.user || null);
      if (_event === 'PASSWORD_RECOVERY') {
        setIsRecoveringPassword(true);
      }
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
      aplicarUsuario(data.user);
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
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Tempo limite excedido. Verifique sua conexão e tente novamente.')), 30000)
      );
      const { data, error: supabaseError } = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        timeout
      ]);
      if (supabaseError) throw supabaseError;
      aplicarUsuario(data.user);
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
      if (isNative) {
        const redirectTo = `${oauthCallbackScheme}://${oauthCallbackPath}`;
        const { data, error: supabaseError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            flowType: 'pkce',
            skipBrowserRedirect: true
          }
        });
        if (supabaseError) throw supabaseError;

        const authUrl = data?.url;
        if (!authUrl) throw new Error('Não foi possível iniciar o login com Google.');

        const retorno = await new Promise((resolve) => {
          aoReceberCallbackUrl(async (callbackUrl) => {
            try {
              const parsed = new URL(callbackUrl);
              const code = parsed.searchParams.get('code');
              if (!code) return resolve({ success: false, error: 'Callback sem código de autorização.' });
              const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
              if (exchangeError) throw exchangeError;
              await fecharNavegador();
              const { data: { session } } = await supabase.auth.getSession();
              aplicarUsuario(session?.user || null);
              resolve({ success: true });
            } catch (err) {
              resolve({ success: false, error: err.message });
            }
          });
          setTimeout(() => resolve({ success: false, error: 'Tempo de login excedido.' }), 60000);
          abrirUrl(authUrl);
        });
        return retorno;
      }

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
      await supabase.auth.signOut({ scope: 'local' });
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setUser(null);
    }
  };

  const resetPassword = async (email) => {
    if (!isSupabaseConfigured) return { success: false, error: ERRO_SEM_CONFIG };
    setLoading(true);
    setError(null);
    try {
      const redirectTo = isNative
        ? `${oauthCallbackScheme}://${oauthCallbackPath}`
        : `${window.location.origin}`;

      const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo
      });
      if (supabaseError) throw supabaseError;
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword) => {
    if (!isSupabaseConfigured) return { success: false, error: ERRO_SEM_CONFIG };
    setLoading(true);
    setError(null);
    try {
      const { error: supabaseError } = await supabase.auth.updateUser({ password: newPassword });
      if (supabaseError) throw supabaseError;
      setIsRecoveringPassword(false);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const cancelPasswordRecovery = () => {
    setIsRecoveringPassword(false);
    setError(null);
  };

  return {
    user,
    loading,
    error,
    isRecoveringPassword,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    cancelPasswordRecovery,
    isAuthenticated: !!user
  };
};

export default useAuth;
