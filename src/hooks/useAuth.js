import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import supabase, { isSupabaseConfigured } from '../supabase';
import {
  isNative,
  abrirUrl,
  fecharNavegador,
  aoReceberCallbackUrl,
  consomeCallbackPendente,
  nativeStorage,
  oauthCallbackScheme,
  oauthCallbackPath
} from './useNative';

const ERRO_SEM_CONFIG =
  'Supabase não configurado. Crie um arquivo .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (veja .env.example).';

// ── PKCE (OAuth) agora gerenciado nativamente pelo @supabase/supabase-js ──
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
          const parsed = new URL(pendente);
          const code = parsed.searchParams.get('code');
          if (!code) { console.error('OAuth pendente sem código'); return; }
          const flowId = parsed.searchParams.get('sb_flow_id') || 
            (parsed.hash ? new URLSearchParams(parsed.hash.replace(/^#/, '')).get('sb_flow_id') : null);
          const { error } = await supabase.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined);
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
      
      if (data.session) {
        aplicarUsuario(data.user);
        return { success: true };
      } else {
        // Quando a confirmação de email está ativada no Supabase, a session vem nula
        return { success: true, needsConfirmation: true };
      }
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
          let processado = false;
          const finalizar = (resultado) => {
            if (processado) return;
            processado = true;
            resolve(resultado);
          };

          const processar = async (callbackUrl) => {
            try {
              console.log('[OAuth] Callback recebido:', callbackUrl);
              const parsed = new URL(callbackUrl);
              
              let code = parsed.searchParams.get('code');
              if (!code && parsed.hash) {
                const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ''));
                code = hashParams.get('code') || hashParams.get('access_token');
              }
              if (!code) {
                const qIdx = callbackUrl.indexOf('?');
                if (qIdx !== -1) {
                  const qs = new URLSearchParams(callbackUrl.substring(qIdx + 1).split('#')[0]);
                  code = qs.get('code');
                }
              }
              if (!code) {
                const err = parsed.searchParams.get('error') || parsed.searchParams.get('error_code');
                const desc = parsed.searchParams.get('error_description') || parsed.searchParams.get('errorCode');
                const hashErr = parsed.hash ? new URLSearchParams(parsed.hash.replace(/^#/, '')).get('error') : null;
                const detalhe = err || hashErr ? ` erro=${err || hashErr} desc=${desc || ''}` : '';
                throw new Error(`Callback sem código de autorização.${detalhe} URL=${callbackUrl}`);
              }

              // Extrai sb_flow_id do callback URL (PKCE_FLOW_ID_PARAM da lib)
              const flowId = parsed.searchParams.get('sb_flow_id') || 
                (parsed.hash ? new URLSearchParams(parsed.hash.replace(/^#/, '')).get('sb_flow_id') : null);
              
              const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined);
              if (exchangeError) throw exchangeError;
              
              await fecharNavegador();
              const { data: { session } } = await supabase.auth.getSession();
              aplicarUsuario(session?.user || null);
              finalizar({ success: true });
            } catch (err) {
              console.error('[OAuth] Falha no processar:', err.message);
              let debugInfo = '';
              try {
                const { keys } = await Preferences.getKeys();
                const sbKeys = keys.filter(k => k.includes('sb-') || k.includes('verifier') || k.includes('flow'));
                const list = [];
                for (const k of sbKeys) {
                  const { value } = await Preferences.get({ key: k });
                  list.push(`${k}=${value ? value.substring(0, 15) + '...' : 'null'}`);
                }
                debugInfo = ` | StorageKeys: [${list.join(', ')}]`;
              } catch (se) {
                debugInfo = ` | Erro ao ler debug keys: ${se.message}`;
              }
              finalizar({ success: false, error: `${err.message}${debugInfo}` });
            }
          };

          aoReceberCallbackUrl(processar);
          const pendente = consomeCallbackPendente();
          if (pendente) {
            processar(pendente);
            return;
          }

          // Fallback: polling caso o appUrlOpen não entregue o deep link
          const intervalo = setInterval(() => {
            const pend = consomeCallbackPendente();
            if (pend) {
              clearInterval(intervalo);
              processar(pend);
            }
          }, 500);

          setTimeout(() => {
            clearInterval(intervalo);
            if (!processado) {
              finalizar({ success: false, error: 'Tempo de login excedido (o retorno do Google não foi recebido).' });
            }
          }, 60000);

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
