import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Network } from '@capacitor/network';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Geolocation } from '@capacitor/geolocation';

// Detectar se estamos rodando como app nativo (Capacitor) ou no navegador
const isNative = Capacitor.isNativePlatform();

// Esquema customizado para callback OAuth no app nativo
export const oauthCallbackScheme = 'com.marlonfpessoa.personcontrol';
export const oauthCallbackPath = 'oauth2redirect';

// ── Navegador in-app (OAuth) ──
export const abrirUrl = async (url) => {
  if (isNative) {
    await Browser.open({ url, presentationStyle: 'popover' });
  } else {
    window.location.href = url;
  }
};

export const fecharNavegador = async () => {
  if (isNative) {
    await Browser.close();
  }
};

// Callback único para o deep link OAuth (evita acumular listeners)
let callbackOAuth = null;
let callbackRegistrado = false;

const processarOAuth = (url) => {
  if (callbackOAuth && url.includes(oauthCallbackPath)) {
    callbackOAuth(url);
  }
};

// Registrar callback do OAuth (deep link) no app nativo (registrado apenas 1x)
export const aoReceberCallbackUrl = (callback) => {
  callbackOAuth = callback;
  if (callbackRegistrado || !isNative) return;
  callbackRegistrado = true;
  App.addListener('appUrlOpen', processarOAuth);
};

// ── Armazenamento seguro ──
// No app nativo usa Preferences (SQLite/SharedPreferences nativo).
// No navegador usa localStorage (fallback compatível).
export const nativeStorage = {
  async get(key) {
    if (isNative) {
      const { value } = await Preferences.get({ key });
      return value !== null ? JSON.parse(value) : null;
    }
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  },
  async set(key, value) {
    if (isNative) {
      await Preferences.set({ key, value: JSON.stringify(value) });
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  },
  async remove(key) {
    if (isNative) {
      await Preferences.remove({ key });
      return;
    }
    localStorage.removeItem(key);
  }
};

// ── Haptics (feedback tátil) ──
export const vibrar = (estilo = ImpactStyle.Medium) => {
  if (isNative) Haptics.impact({ style: estilo });
};

// ── Rede ──
export const verificarRede = async () => {
  try {
    if (isNative) {
      const status = await Network.getStatus();
      return status.connected;
    }
    return navigator.onLine !== false;
  } catch {
    return navigator.onLine !== false;
  }
};

// ── Ciclo de vida do app ──
export const aoPausarApp = (callback) => {
  if (isNative) {
    App.addListener('pause', callback);
  } else {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) callback();
    });
  }
};

export const aoResumirApp = (callback) => {
  if (isNative) {
    App.addListener('resume', callback);
  } else {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) callback();
    });
  }
};

// ── Notificações locais ──
export const pedirPermissaoNotificacao = async () => {
  if (!isNative) return true;
  try {
    const perms = await LocalNotifications.requestPermissions();
    return perms.display === 'granted';
  } catch {
    return false;
  }
};

export const agendarNotificacao = async (titulo, corpo, emMs) => {
  if (!isNative) return;
  try {
    await LocalNotifications.schedule({
      notifications: [{
        id: Date.now(),
        title: titulo,
        body: corpo,
        schedule: { at: new Date(Date.now() + emMs) }
      }]
    });
  } catch (err) {
    console.error('Erro ao agendar notificação:', err);
  }
};

export const cancelarNotificacoes = async () => {
  if (!isNative) return;
  try {
    const pending = await LocalNotifications.getPending();
    const ids = pending.notifications.map(n => n.id);
    if (ids.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }
  } catch { /* ignore */ }
};

// ── Push notifications ──
export const registrarPush = async () => {
  if (!isNative) return null;
  try {
    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive !== 'granted') {
      permStatus = await PushNotifications.requestPermissions();
    }
    if (permStatus.receive === 'granted') {
      await PushNotifications.register();
      return true;
    }
    return false;
  } catch (err) {
    console.error('Erro ao registrar push:', err);
    return false;
  }
};

export const aoReceberPush = (callback) => {
  if (!isNative) return;
  PushNotifications.addListener('pushNotificationReceived', callback);
  PushNotifications.addListener('pushNotificationActionPerformed', callback);
};

// ── Geolocalização ──
export const obterPosicao = async () => {
  if (!isNative) return null;
  try {
    const perms = await Geolocation.checkPermissions();
    if (perms.location !== 'granted') {
      const req = await Geolocation.requestPermissions();
      if (req.location !== 'granted') return null;
    }
    const pos = await Geolocation.getCurrentPosition();
    return {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy
    };
  } catch (err) {
    console.error('Erro ao obter posição:', err);
    return null;
  }
};

// ── Backup/Export de dados (arquivo + compartilhar) ──
export const exportarDados = async (nomeArquivo, conteudoTexto, mimeType = 'application/json') => {
  if (isNative) {
    try {
      const nomeComExt = nomeArquivo.endsWith('.json') ? nomeArquivo : `${nomeArquivo}.json`;
      const gravar = await Filesystem.writeFile({
        path: nomeComExt,
        data: conteudoTexto,
        directory: Directory.Cache,
        encoding: 'utf8'
      });
      const uri = gravar.uri;
      await Share.share({ title: 'Backup PersonControl', url: uri });
      return { sucesso: true, uri };
    } catch (err) {
      console.error('Erro ao exportar dados nativo:', err);
      return { sucesso: false, erro: err.message };
    }
  }
  // Fallback navegador: download
  try {
    const blob = new Blob([conteudoTexto], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    a.click();
    URL.revokeObjectURL(url);
    return { sucesso: true };
  } catch (err) {
    return { sucesso: false, erro: err.message };
  }
};

// ── Compartilhar texto (relatório) ──
export const compartilhar = async (titulo, texto) => {
  if (isNative) {
    try {
      await Share.share({ title: titulo, text: texto });
      return { sucesso: true };
    } catch (err) {
      return { sucesso: false, erro: err.message };
    }
  }
  // Fallback navegador: Web Share API ou clipboard
  try {
    if (navigator.share) {
      await navigator.share({ title: titulo, text: texto });
      return { sucesso: true };
    }
    await navigator.clipboard.writeText(texto);
    return { sucesso: true, copiado: true };
  } catch (err) {
    return { sucesso: false, erro: err.message };
  }
};

export default {
  isNative,
  storage: nativeStorage,
  vibrar,
  verificarRede,
  aoPausarApp,
  aoResumirApp,
  pedirPermissaoNotificacao,
  agendarNotificacao,
  cancelarNotificacoes,
  registrarPush,
  aoReceberPush,
  obterPosicao,
  exportarDados,
  compartilhar,
  abrirUrl,
  fecharNavegador,
  aoReceberCallbackUrl,
  oauthCallbackScheme,
  oauthCallbackPath
};