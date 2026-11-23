import {
  doc,
  setDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { slugify } from '../core/parser';

const USER_WATCHLISTS_COLLECTION = 'user_watchlists';
const LOCAL_WATCHLIST_PREFIX = 'mw_watchlist_v1_';
const LOCAL_ALERT_LOG_PREFIX = 'mw_push_alerts_v1_';
const MAX_WATCHED_SLUGS = 200;
const MAX_ALERT_HISTORY = 50;

export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export interface WatchlistPreferences {
  slugs: string[];
  notifyEnabled: boolean;
  notifyOwnEdits: boolean;
  updatedAt: string;
}

export interface PushNotificationLogItem {
  id: string;
  pageSlug: string;
  pageTitle: string;
  author: string;
  summary: string;
  timestamp: string;
  revId?: string;
  read: boolean;
  isTest?: boolean;
}

export const DEFAULT_WATCHLIST_PREFS: WatchlistPreferences = {
  slugs: [],
  notifyEnabled: true,
  notifyOwnEdits: false,
  updatedAt: new Date(0).toISOString(),
};

export function isPushNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getBrowserNotificationPermission(): NotificationPermissionState {
  if (!isPushNotificationSupported()) {
    return 'unsupported';
  }
  return window.Notification.permission;
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermissionState> {
  if (!isPushNotificationSupported()) {
    return 'unsupported';
  }
  try {
    const result = await window.Notification.requestPermission();
    return result;
  } catch (err) {
    console.warn('Erro ao solicitar permissão de notificação:', err);
    return getBrowserNotificationPermission();
  }
}

export function normalizeWatchedSlugs(slugs: string[]): string[] {
  const unique = new Set<string>();
  for (const raw of slugs) {
    const clean = slugify(String(raw || '').trim());
    if (clean && clean.length <= 200) {
      unique.add(clean);
    }
    if (unique.size >= MAX_WATCHED_SLUGS) break;
  }
  return Array.from(unique);
}

export function loadLocalWatchlistState(userKey: string): WatchlistPreferences {
  try {
    const raw = localStorage.getItem(`${LOCAL_WATCHLIST_PREFIX}${userKey}`);
    if (!raw) return { ...DEFAULT_WATCHLIST_PREFS };
    const parsed = JSON.parse(raw) as Partial<WatchlistPreferences>;
    return {
      slugs: normalizeWatchedSlugs(Array.isArray(parsed.slugs) ? parsed.slugs : []),
      notifyEnabled: typeof parsed.notifyEnabled === 'boolean' ? parsed.notifyEnabled : true,
      notifyOwnEdits: typeof parsed.notifyOwnEdits === 'boolean' ? parsed.notifyOwnEdits : false,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return { ...DEFAULT_WATCHLIST_PREFS };
  }
}

export function saveLocalWatchlistState(userKey: string, state: WatchlistPreferences): void {
  try {
    localStorage.setItem(
      `${LOCAL_WATCHLIST_PREFIX}${userKey}`,
      JSON.stringify({
        slugs: normalizeWatchedSlugs(state.slugs),
        notifyEnabled: Boolean(state.notifyEnabled),
        notifyOwnEdits: Boolean(state.notifyOwnEdits),
        updatedAt: state.updatedAt || new Date().toISOString(),
      })
    );
  } catch {
    // Ignore storage quota / privacy mode failures
  }
}

export function loadPushAlertHistory(userKey: string): PushNotificationLogItem[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_ALERT_LOG_PREFIX}${userKey}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_ALERT_HISTORY);
  } catch {
    return [];
  }
}

export function savePushAlertHistory(userKey: string, items: PushNotificationLogItem[]): void {
  try {
    localStorage.setItem(
      `${LOCAL_ALERT_LOG_PREFIX}${userKey}`,
      JSON.stringify(items.slice(0, MAX_ALERT_HISTORY))
    );
  } catch {
    // Ignore storage quota errors
  }
}

export function subscribeToUserWatchlist(
  userId: string,
  onData: (state: WatchlistPreferences | null) => void
): Unsubscribe {
  const path = `${USER_WATCHLISTS_COLLECTION}/${userId}`;
  const ref = doc(db, USER_WATCHLISTS_COLLECTION, userId);

  return onSnapshot(
    ref,
    snapshot => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }
      const data = snapshot.data();
      onData({
        slugs: normalizeWatchedSlugs(Array.isArray(data.slugs) ? data.slugs : []),
        notifyEnabled: typeof data.notifyEnabled === 'boolean' ? data.notifyEnabled : true,
        notifyOwnEdits: typeof data.notifyOwnEdits === 'boolean' ? data.notifyOwnEdits : false,
        updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : new Date().toISOString(),
      });
    },
    error => {
      console.warn(`Firestore onSnapshot error for ${path}:`, error);
      onData(null);
    }
  );
}

export async function saveUserWatchlistToFirestore(
  userId: string,
  state: WatchlistPreferences
): Promise<void> {
  const path = `${USER_WATCHLISTS_COLLECTION}/${userId}`;
  const payload = {
    userId,
    slugs: normalizeWatchedSlugs(state.slugs),
    notifyEnabled: Boolean(state.notifyEnabled),
    notifyOwnEdits: Boolean(state.notifyOwnEdits),
    updatedAt: state.updatedAt || new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, USER_WATCHLISTS_COLLECTION, userId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export interface DispatchPushParams {
  title: string;
  body: string;
  slug: string;
  tag?: string;
  icon?: string;
}

export async function dispatchBrowserPushNotification(
  params: DispatchPushParams
): Promise<{ delivered: boolean; channel: 'service-worker' | 'window-notification' | 'none'; reason?: string }> {
  if (!isPushNotificationSupported()) {
    return {
      delivered: false,
      channel: 'none',
      reason: 'Este navegador não suporta a API de Notificações.',
    };
  }

  if (window.Notification.permission !== 'granted') {
    return {
      delivered: false,
      channel: 'none',
      reason: 'Permissão de notificação não concedida pelo usuário.',
    };
  }

  const icon = params.icon || '/pwa-192x192.png';
  const targetHash = `#/wiki/${encodeURIComponent(params.slug || 'Página_principal')}`;
  const targetUrl = `/${targetHash}`;

  // Prefer Service Worker registration (works cleanly in desktop & mobile PWAs)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && typeof reg.showNotification === 'function') {
        await reg.showNotification(params.title, {
          body: params.body,
          icon,
          badge: icon,
          tag: params.tag || `wiki-watch-${params.slug}`,
          renotify: true,
          data: {
            slug: params.slug,
            url: targetUrl,
          },
        } as NotificationOptions);
        return { delivered: true, channel: 'service-worker' };
      }
    } catch (err) {
      console.warn('ServiceWorker showNotification fallback to Notification():', err);
    }
  }

  // Fallback to standard Notification constructor
  try {
    const notification = new window.Notification(params.title, {
      body: params.body,
      icon,
      tag: params.tag || `wiki-watch-${params.slug}`,
    });
    notification.onclick = () => {
      try {
        window.focus();
        window.location.hash = targetHash;
        notification.close();
      } catch {
        // Ignore window focus errors
      }
    };
    return { delivered: true, channel: 'window-notification' };
  } catch (err) {
    console.warn('Notification dispatch failed:', err);
    return {
      delivered: false,
      channel: 'none',
      reason: err instanceof Error ? err.message : 'Falha ao exibir notificação no navegador.',
    };
  }
}
