import { createClient } from '@supabase/supabase-js';
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

// Adaptador de storage para o Supabase que converte objetos/arrays (se houver) em string,
// pois o Supabase-js espera strings cruas.
const supabaseStorageAdapter = {
  getItem: async (key) => {
    const val = await nativeStorage.get(key);
    // nativeStorage converte de/para JSON, mas o supabase quer a string original
    // Se for string, retornamos direto. Se for objeto (ex: array de flows), stringificamos de volta.
    if (val === null || val === undefined) return null;
    return typeof val === 'string' ? val : JSON.stringify(val);
  },
  setItem: async (key, value) => {
    // Gravamos como string mesmo (o nativeStorage.set vai fazer JSON.stringify, 
    // então a string vai ficar duplamente serializada ""valor"", mas tudo bem, o getItem lida com isso)
    await nativeStorage.set(key, value);
  },
  removeItem: async (key) => {
    await nativeStorage.remove(key);
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
