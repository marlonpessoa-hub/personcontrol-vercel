import { useState, useEffect } from 'react';
import supabase, { isSupabaseConfigured } from '../supabase';
import {
  isNative,
  abrirUrl,
  fecharNavegador,
  aoReceberCallbackUrl,
  consomeCallbackPendente,
  oauthCallbackScheme,
  oauthCallbackPath
} from './useNative';

const ERRO_SEM_CONFIG =
  'Supabase não configurado. Crie um arquivo .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (veja .env.example).';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);

  // Só aceita usuários com ID válido; sessões parciais/corrompidas viram logout
  const aplicarUsuario = (u) => setUser(u?.id ? u : null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      setIsInitializing(false);
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
        setIsInitializing(false);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      aplicarUsuario(session?.user || null);
      if (_event === 'PASSWORD_RECOVERY') {
        setIsRecoveringPassword(true);
      }
    });

    // Auto-completar OAuth se o app foi aberto via deep link (app relançado pelo SO)
    const pendente = consomeCallbackPendente();
    if (pendente) {
      (async () => {
        try {
          const code = new URL(pendente).searchParams.get('code');
          if (!code) { console.error('OAuth pendente sem código'); return; }
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) { console.error('OAuth pendente falhou:', error.message); return; }
          await fecharNavegador();
          const { data: { session } } = await supabase.auth.getSession();
          aplicarUsuario(session?.user || null);
        } catch (e) {
          console.error('OAuth pendente erro:', e);
        }
      })();
    }

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
      // Usa o fluxo OAuth nativo do Supabase (abre navegador do sistema)
      // e retorna ao app automaticamente. Não usa deep link customizado
      // para evitar problemas de interceptação no Android.
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
      await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      try {
        const ref = supabase.supabaseUrl?.split('//')[1]?.split('.')[0];
        if (ref) localStorage.removeItem(`sb-${ref}-auth-token`);
      } catch { /* ignore */ }
      try { localStorage.removeItem('personcontrol_auth'); } catch { /* ignore */ }
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
    isInitializing,
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
