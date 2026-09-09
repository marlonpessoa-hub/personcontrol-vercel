import { createClient } from '@supabase/supabase-js';
import { Preferences } from '@capacitor/preferences';
import { isNative, nativeStorage } from './hooks/useNative';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[PersonControl] Supabase não configurado. ' +
    'Crie um arquivo .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (veja .env.example). ' +
    'O login ficará indisponível até lá.'
  );
}

// Adaptador de storage direto para o Supabase usando as APIs de storage brutas (sem serialização extra)
const supabaseStorageAdapter = {
  getItem: async (key) => {
    if (isNative) {
      try {
        const { value } = await Preferences.get({ key });
        return value;
      } catch (e) {
        console.error('[Supabase Storage] Erro ao ler:', key, e);
        return null;
      }
    }
    return localStorage.getItem(key);
  },
  setItem: async (key, value) => {
    if (isNative) {
      try {
        await Preferences.set({ key, value });
      } catch (e) {
        console.error('[Supabase Storage] Erro ao gravar:', key, e);
      }
      return;
    }
    localStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    if (isNative) {
      try {
        await Preferences.remove({ key });
      } catch (e) {
        console.error('[Supabase Storage] Erro ao remover:', key, e);
      }
      return;
    }
    localStorage.removeItem(key);
  }
};

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      flowType: 'pkce',
      storage: supabaseStorageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

export default supabase;
