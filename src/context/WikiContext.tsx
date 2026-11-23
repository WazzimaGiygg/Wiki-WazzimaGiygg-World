import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { WikiSkin, WikiSettings, WikiUser, UserRightsRecord } from '../types/wiki';
import {
  subscribeToAllPages,
  subscribeToWikiSettings,
  saveWikiSettingsToFirestore,
  seedInitialPagesIfNeeded,
  ensureUserPagesExist,
  subscribeToUserRights,
  subscribeToRecentChanges,
  DEFAULT_SUPER_ADMIN_EMAIL,
} from '../services/wikiService';
import {
  syncCodebaseExtensionsToFirestore,
  subscribeToExtensions,
  updateExtensionConfigInFirestore,
  isBlazePlanActiveInExtensions,
  mergeExtensionsWithCodebase,
  isExtensionEnabled,
  getDisabledExtensionIds,
} from '../services/extensionService';
import {
  NotificationPermissionState,
  WatchlistPreferences,
  PushNotificationLogItem,
  DEFAULT_WATCHLIST_PREFS,
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
  normalizeWatchedSlugs,
  loadLocalWatchlistState,
  saveLocalWatchlistState,
  loadPushAlertHistory,
  savePushAlertHistory,
  subscribeToUserWatchlist,
  saveUserWatchlistToFirestore,
  dispatchBrowserPushNotification,
} from '../services/notificationService';
import { WikiExtensionDoc } from '../extensions';
import { slugify } from '../core/parser';
import { INITIAL_PAGES } from '../core/defaultPages';
import { setCachedTemplates } from '../core/templateRegistry';
import { LEGAL_COMPLIANCE_INFO, hasPreferenceStorageConsent } from '../core/compliance';

interface WikiContextType {
  currentUser: WikiUser;
  skin: WikiSkin;
  setSkin: (skin: WikiSkin) => void;
  currentSlug: string;
  setCurrentSlug: (slug: string) => void;
  activeTab: 'view' | 'edit' | 'history' | 'talk';
  setActiveTab: (tab: 'view' | 'edit' | 'history' | 'talk') => void;
  settings: WikiSettings;
  updateSettings: (newSettings: Partial<WikiSettings>) => Promise<void>;
  existingPageSlugs: Set<string>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setGuestNickname: (name: string) => void;
  navigateToPage: (target: string, tab?: 'view' | 'edit' | 'history' | 'talk') => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isRealtimeConnected: boolean;
  isBureaucrat: boolean;
  userPageSlug?: string;
  userTalkSlug?: string;
  isBlazePlanActive: boolean;
  uploadWizardExtension: WikiExtensionDoc | null;
  toggleBlazePlan: (active: boolean) => Promise<void>;
  extensions: WikiExtensionDoc[];
  disabledExtensionIds: string[];
  isExtensionActive: (extensionId: string) => boolean;
  watchedSlugs: string[];
  isPageWatched: (slug: string) => boolean;
  toggleWatchPage: (slug: string) => Promise<boolean>;
  watchPage: (slug: string) => Promise<void>;
  unwatchPage: (slug: string) => Promise<void>;
  notificationPrefs: { notifyEnabled: boolean; notifyOwnEdits: boolean };
  updateNotificationPrefs: (prefs: Partial<{ notifyEnabled: boolean; notifyOwnEdits: boolean }>) => Promise<void>;
  notificationPermission: NotificationPermissionState;
  refreshNotificationPermission: () => void;
  requestNotificationPermission: () => Promise<NotificationPermissionState>;
  pushAlertHistory: PushNotificationLogItem[];
  unreadAlertsCount: number;
  markAllAlertsRead: () => void;
  clearPushAlertHistory: () => void;
  latestToastAlert: PushNotificationLogItem | null;
  dismissToastAlert: () => void;
  sendTestPushNotification: () => Promise<{ ok: boolean; message: string }>;
}

const DEFAULT_SETTINGS: WikiSettings = {
  sitename: 'WikiWazzimaGiygg',
  languageCode: 'pt-br',
  allowAnonymousEditing: false,
  enableLivePreview: true,
  defaultSkin: 'vector-modern',
  maxRecentChanges: 50,
  repositoryUrl: 'https://github.com/WazzimaGiygg/WikiWazzimaGiygg',
  lgpdDpoContact: LEGAL_COMPLIANCE_INFO.defaultDpoContact,
  marcoCivilRetentionMonths: LEGAL_COMPLIANCE_INFO.defaultRetentionMonths,
  requireExplicitConsent: true,
  hideEmailOnUserPages: true,
};

const WikiContext = createContext<WikiContextType | null>(null);

export function WikiProvider({ children }: { children: React.ReactNode }) {
  const [skin, setSkin] = useState<WikiSkin>(() => {
    return (localStorage.getItem('mw_skin') as WikiSkin) || 'vector-modern';
  });

  const [currentSlug, setCurrentSlug] = useState<string>('Página_principal');
  const [activeTab, setActiveTab] = useState<'view' | 'edit' | 'history' | 'talk'>('view');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [existingPageSlugs, setExistingPageSlugs] = useState<Set<string>>(new Set());
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);

  const [settings, setSettings] = useState<WikiSettings>(() => {
    const saved = localStorage.getItem('mw_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.sitename === 'MediaWiki TS') {
        parsed.sitename = 'WikiWazzimaGiygg';
      }
      if (!parsed.lgpdDpoContact || parsed.lgpdDpoContact === 'privacidade@wazzimagiygg.com') {
        parsed.lgpdDpoContact = LEGAL_COMPLIANCE_INFO.defaultDpoContact;
      }
      parsed.allowAnonymousEditing = false;
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
    return DEFAULT_SETTINGS;
  });

  const [guestName, setGuestName] = useState<string>(() => {
    return localStorage.getItem('mw_guest_name') || `Colaborador_${Math.floor(100 + Math.random() * 900)}`;
  });

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userRights, setUserRights] = useState<UserRightsRecord | null>(null);
  const [userPagesInfo, setUserPagesInfo] = useState<{
    userPageSlug: string;
    userTalkSlug: string;
    userPageTitle: string;
    userTalkTitle: string;
    isDisambiguated: boolean;
  } | null>(null);

  // Sync hash routing e.g. #/wiki/MediaWiki or #/wiki/MediaWiki?action=edit
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/wiki/')) {
        const fullPath = hash.replace('#/wiki/', '');
        const [pageSlug, queryString] = fullPath.split('?');
        if (pageSlug) {
          setCurrentSlug(decodeURIComponent(pageSlug));
        }
        if (queryString) {
          const params = new URLSearchParams(queryString);
          const action = params.get('action');
          if (action === 'edit') setActiveTab('edit');
          else if (action === 'history') setActiveTab('history');
          else if (action === 'talk') setActiveTab('talk');
          else setActiveTab('view');
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Listen for auth state and automatically ensure user page and user talk page exist in Firestore
  useEffect(() => {
    let unsubRights: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async user => {
      setFirebaseUser(user);
      if (user && !user.isAnonymous) {
        // Subscribe to real-time rights for this user
        if (unsubRights) unsubRights();
        unsubRights = subscribeToUserRights(user.uid, rights => {
          setUserRights(rights);
        });

        try {
          await seedInitialPagesIfNeeded();
          const res = await ensureUserPagesExist({
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            creationTime: user.metadata?.creationTime,
          });
          setUserPagesInfo(res);
        } catch (err) {
          console.warn('Could not auto-create user pages on login:', err);
        }
      } else {
        if (unsubRights) unsubRights();
        setUserRights(null);
        setUserPagesInfo(null);
      }
    });

    return () => {
      unsubscribe();
      if (unsubRights) unsubRights();
    };
  }, []);

  // REAL-TIME: Listen to all pages, settings, and extensions collections
  useEffect(() => {
    setCachedTemplates(Object.values(INITIAL_PAGES), true);

    const unsubPages = subscribeToAllPages(pages => {
      setCachedTemplates(pages);
      const slugSet = new Set<string>();
      Object.values(INITIAL_PAGES).forEach(p => {
        slugSet.add(p.slug);
        slugSet.add(p.title);
        slugSet.add(slugify(p.title));
      });
      pages.forEach(p => {
        slugSet.add(p.slug);
        slugSet.add(p.title);
        slugSet.add(slugify(p.title));
      });
      setExistingPageSlugs(slugSet);
      setIsRealtimeConnected(true);
    });

    const unsubSettings = subscribeToWikiSettings(remoteSettings => {
      if (remoteSettings && remoteSettings.sitename) {
        const normalizedRemote = {
          ...remoteSettings,
          lgpdDpoContact:
            !remoteSettings.lgpdDpoContact ||
            remoteSettings.lgpdDpoContact === 'privacidade@wazzimagiygg.com'
              ? LEGAL_COMPLIANCE_INFO.defaultDpoContact
              : remoteSettings.lgpdDpoContact,
        };
        setSettings(prev => ({ ...prev, ...normalizedRemote }));
        if (remoteSettings.defaultSkin) {
          setSkin(remoteSettings.defaultSkin);
        }
      }
    });

    const unsubExt = subscribeToExtensions(list => {
      setExtensionsList(list);
    });

    return () => {
      unsubPages();
      unsubSettings();
      unsubExt();
    };
  }, []);

  const [extensionsList, setExtensionsList] = useState<WikiExtensionDoc[]>([]);

  const mergedExtensions = React.useMemo(
    () => mergeExtensionsWithCodebase(extensionsList),
    [extensionsList]
  );

  const disabledExtensionIds = React.useMemo(
    () => getDisabledExtensionIds(mergedExtensions),
    [mergedExtensions]
  );

  const isExtensionActive = React.useCallback(
    (extensionId: string) => isExtensionEnabled(mergedExtensions, extensionId),
    [mergedExtensions]
  );

  const isBlazePlanActive = isBlazePlanActiveInExtensions(mergedExtensions);
  const uploadWizardExtension = mergedExtensions.find(e => e.id === 'upload-wizard') || null;

  const toggleBlazePlan = async (active: boolean) => {
    const currentConfig = uploadWizardExtension?.config || {};
    await updateExtensionConfigInFirestore(
      'upload-wizard',
      { ...currentConfig, blazePlanEnabled: active },
      isBureaucrat,
      currentUser.username
    );
  };

  // Persist skin (only if user consented to preference storage or hasn't opted out)
  const handleSetSkin = (newSkin: WikiSkin) => {
    setSkin(newSkin);
    if (hasPreferenceStorageConsent()) {
      localStorage.setItem('mw_skin', newSkin);
    }
    if (newSkin === 'dark-mode') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (skin === 'dark-mode') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [skin]);

  const updateSettings = async (newSettings: Partial<WikiSettings>) => {
    if (!isBureaucrat) {
      throw new Error('Acesso negado: apenas Burocratas podem alterar as configurações globais da Wiki.');
    }
    const updated: WikiSettings = {
      ...settings,
      ...newSettings,
      allowAnonymousEditing: false,
    };
    setSettings(updated);
    localStorage.setItem('mw_settings', JSON.stringify(updated));

    // Save to Firestore in real time for all clients (enforced by Firestore rules as Bureaucrat-only)
    await saveWikiSettingsToFirestore(updated, isBureaucrat);
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google Sign In Error:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  };

  const setGuestNickname = (name: string) => {
    const clean = name.trim() || 'Colaborador_Anônimo';
    setGuestName(clean);
    if (hasPreferenceStorageConsent()) {
      localStorage.setItem('mw_guest_name', clean);
    }
  };

  const navigateToPage = (target: string, tab: 'view' | 'edit' | 'history' | 'talk' = 'view') => {
    const slug = slugify(target);
    setCurrentSlug(slug);
    setActiveTab(tab);
    window.location.hash = `#/wiki/${encodeURIComponent(slug)}${tab !== 'view' ? `?action=${tab}` : ''}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isSuperAdminEmail = Boolean(
    firebaseUser?.email && firebaseUser.email.toLowerCase() === DEFAULT_SUPER_ADMIN_EMAIL.toLowerCase()
  );

  const rawGroups = userRights?.groups || [];
  const assignedGroups = isSuperAdminEmail && !rawGroups.includes('burocrata')
    ? (['burocrata', ...rawGroups] as typeof rawGroups)
    : rawGroups;

  const isBureaucrat = isSuperAdminEmail || assignedGroups.includes('burocrata');
  const isAdmin = isBureaucrat || assignedGroups.includes('administrador');
  const isBlocked = assignedGroups.includes('bloqueado');

  // Auto-sync codebase extensions to Firestore whenever a Bureaucrat session becomes active
  useEffect(() => {
    if (isBureaucrat && firebaseUser && !firebaseUser.isAnonymous) {
      syncCodebaseExtensionsToFirestore(true).catch(() => {});
    }
  }, [isBureaucrat, firebaseUser]);

  // Fallback active skin if the current skin extension was deactivated by a Bureaucrat
  useEffect(() => {
    if (skin === 'vector-legacy' && !isExtensionActive('skin-timeless')) {
      setSkin(isExtensionActive('skin-vector-2022') ? 'vector-modern' : 'dark-mode');
    } else if (skin === 'dark-mode' && !isExtensionActive('mobile-frontend')) {
      setSkin(isExtensionActive('skin-vector-2022') ? 'vector-modern' : 'vector-legacy');
    } else if (skin === 'vector-modern' && !isExtensionActive('skin-vector-2022')) {
      if (isExtensionActive('skin-timeless')) setSkin('vector-legacy');
      else if (isExtensionActive('mobile-frontend')) setSkin('dark-mode');
    }
  }, [skin, isExtensionActive]);

  const currentUser: WikiUser = firebaseUser
    ? {
        uid: firebaseUser.uid,
        username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário MediaWiki',
        email: firebaseUser.email || undefined,
        isAnonymous: false,
        avatarUrl: firebaseUser.photoURL || undefined,
        editCount: 1,
        joinedAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
        userPageSlug: userPagesInfo?.userPageSlug,
        userTalkSlug: userPagesInfo?.userTalkSlug,
        userPageTitle: userPagesInfo?.userPageTitle,
        userTalkTitle: userPagesInfo?.userTalkTitle,
        groups: assignedGroups,
        isBureaucrat,
        isAdmin,
        isBlocked,
      }
    : {
        uid: `anon_${guestName}`,
        username: guestName,
        isAnonymous: true,
        editCount: 0,
        joinedAt: new Date().toISOString(),
        groups: [],
        isBureaucrat: false,
        isAdmin: false,
        isBlocked: false,
      };

  // ========================================================================
  // MONITORED PAGES WATCHLIST & BROWSER PUSH NOTIFICATIONS
  // ========================================================================
  const storageUserKey =
    firebaseUser && !firebaseUser.isAnonymous ? firebaseUser.uid : 'guest';

  const [watchlistState, setWatchlistState] = useState<WatchlistPreferences>(() =>
    loadLocalWatchlistState('guest')
  );
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermissionState>(() => getBrowserNotificationPermission());
  const [pushAlertHistory, setPushAlertHistory] = useState<PushNotificationLogItem[]>(() =>
    loadPushAlertHistory('guest')
  );
  const [latestToastAlert, setLatestToastAlert] = useState<PushNotificationLogItem | null>(null);

  const watchlistStateRef = useRef<WatchlistPreferences>(watchlistState);
  watchlistStateRef.current = watchlistState;

  const currentUserRef = useRef<WikiUser>(currentUser);
  currentUserRef.current = currentUser;

  const storageUserKeyRef = useRef<string>(storageUserKey);
  storageUserKeyRef.current = storageUserKey;

  const pushEnabledExtRef = useRef<boolean>(true);
  pushEnabledExtRef.current =
    isExtensionActive('push-notifications') && isExtensionActive('page-watchlist');

  const navigateToPageRef = useRef(navigateToPage);
  navigateToPageRef.current = navigateToPage;

  const refreshNotificationPermission = useCallback(() => {
    setNotificationPermission(getBrowserNotificationPermission());
  }, []);

  // Keep browser notification permission synchronized when tab regains focus or browser settings change
  useEffect(() => {
    refreshNotificationPermission();
    const handleFocus = () => refreshNotificationPermission();
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    let permissionStatus: PermissionStatus | null = null;
    if ('permissions' in navigator && typeof navigator.permissions.query === 'function') {
      navigator.permissions
        .query({ name: 'notifications' as PermissionName })
        .then(status => {
          permissionStatus = status;
          status.onchange = () => refreshNotificationPermission();
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, [refreshNotificationPermission]);

  // Listen to Service Worker click-to-navigate messages
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const handleSwMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'WIKI_NAVIGATE' && event.data.slug) {
        navigateToPageRef.current(event.data.slug);
      }
    };
    navigator.serviceWorker.addEventListener('message', handleSwMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleSwMessage);
  }, []);

  // Load and sync Watchlist + Alert History when auth user changes
  useEffect(() => {
    const localState = loadLocalWatchlistState(storageUserKey);
    setWatchlistState(localState);
    setPushAlertHistory(loadPushAlertHistory(storageUserKey));

    if (!firebaseUser || firebaseUser.isAnonymous) {
      return;
    }

    const uid = firebaseUser.uid;
    const guestBackup = loadLocalWatchlistState('guest');
    let initializedRemote = false;

    const unsubWatchlist = subscribeToUserWatchlist(uid, remoteState => {
      if (remoteState) {
        initializedRemote = true;
        setWatchlistState(remoteState);
        saveLocalWatchlistState(uid, remoteState);
      } else if (!initializedRemote) {
        initializedRemote = true;
        // Bootstrap Firestore watchlist from any existing local/guest selections
        const mergedSlugs = normalizeWatchedSlugs([
          ...localState.slugs,
          ...guestBackup.slugs,
        ]);
        if (mergedSlugs.length > 0) {
          const initialPayload: WatchlistPreferences = {
            slugs: mergedSlugs,
            notifyEnabled: localState.notifyEnabled,
            notifyOwnEdits: localState.notifyOwnEdits,
            updatedAt: new Date().toISOString(),
          };
          setWatchlistState(initialPayload);
          saveLocalWatchlistState(uid, initialPayload);
          saveUserWatchlistToFirestore(uid, initialPayload).catch(() => {});
        }
      }
    });

    return () => unsubWatchlist();
  }, [firebaseUser, storageUserKey]);

  const persistWatchlistState = useCallback(
    async (nextState: WatchlistPreferences) => {
      const normalized: WatchlistPreferences = {
        slugs: normalizeWatchedSlugs(nextState.slugs),
        notifyEnabled: Boolean(nextState.notifyEnabled),
        notifyOwnEdits: Boolean(nextState.notifyOwnEdits),
        updatedAt: new Date().toISOString(),
      };
      watchlistStateRef.current = normalized;
      setWatchlistState(normalized);
      saveLocalWatchlistState(storageUserKeyRef.current, normalized);

      if (firebaseUser && !firebaseUser.isAnonymous) {
        try {
          await saveUserWatchlistToFirestore(firebaseUser.uid, normalized);
        } catch (err) {
          console.warn('Falha ao salvar watchlist no Firestore:', err);
        }
      }
    },
    [firebaseUser]
  );

  const isPageWatched = useCallback(
    (slug: string) => {
      const norm = slugify(slug);
      return watchlistState.slugs.includes(norm);
    },
    [watchlistState.slugs]
  );

  const watchPage = useCallback(
    async (slug: string) => {
      const norm = slugify(slug);
      if (!norm) return;
      const curr = watchlistStateRef.current;
      if (curr.slugs.includes(norm)) return;
      await persistWatchlistState({
        ...curr,
        slugs: [norm, ...curr.slugs],
      });
    },
    [persistWatchlistState]
  );

  const unwatchPage = useCallback(
    async (slug: string) => {
      const norm = slugify(slug);
      const curr = watchlistStateRef.current;
      if (!curr.slugs.includes(norm)) return;
      await persistWatchlistState({
        ...curr,
        slugs: curr.slugs.filter(s => s !== norm),
      });
    },
    [persistWatchlistState]
  );

  const toggleWatchPage = useCallback(
    async (slug: string): Promise<boolean> => {
      const norm = slugify(slug);
      if (!norm) return false;
      const curr = watchlistStateRef.current;
      const currentlyWatched = curr.slugs.includes(norm);
      const nextSlugs = currentlyWatched
        ? curr.slugs.filter(s => s !== norm)
        : [norm, ...curr.slugs];
      await persistWatchlistState({
        ...curr,
        slugs: nextSlugs,
      });
      return !currentlyWatched;
    },
    [persistWatchlistState]
  );

  const updateNotificationPrefs = useCallback(
    async (prefs: Partial<{ notifyEnabled: boolean; notifyOwnEdits: boolean }>) => {
      const curr = watchlistStateRef.current;
      await persistWatchlistState({
        ...curr,
        ...prefs,
      });
    },
    [persistWatchlistState]
  );

  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermissionState> => {
    const result = await requestBrowserNotificationPermission();
    setNotificationPermission(result);
    return result;
  }, []);

  const appendAlertItem = useCallback((item: PushNotificationLogItem) => {
    setPushAlertHistory(prev => {
      const updated = [item, ...prev.filter(existing => existing.id !== item.id)].slice(0, 50);
      savePushAlertHistory(storageUserKeyRef.current, updated);
      return updated;
    });
    setLatestToastAlert(item);
  }, []);

  const markAllAlertsRead = useCallback(() => {
    setPushAlertHistory(prev => {
      const updated = prev.map(item => ({ ...item, read: true }));
      savePushAlertHistory(storageUserKeyRef.current, updated);
      return updated;
    });
  }, []);

  const clearPushAlertHistory = useCallback(() => {
    setPushAlertHistory([]);
    savePushAlertHistory(storageUserKeyRef.current, []);
  }, []);

  const dismissToastAlert = useCallback(() => {
    setLatestToastAlert(null);
  }, []);

  const sendTestPushNotification = useCallback(async (): Promise<{ ok: boolean; message: string }> => {
    let perm = getBrowserNotificationPermission();
    if (perm === 'default') {
      perm = await requestBrowserNotificationPermission();
      setNotificationPermission(perm);
    }

    if (perm === 'unsupported') {
      return {
        ok: false,
        message: 'Este navegador não suporta notificações push locais via API Notification.',
      };
    }

    if (perm === 'denied') {
      return {
        ok: false,
        message: 'As notificações estão bloqueadas nas permissões do navegador para este site.',
      };
    }

    const sampleSlug = watchlistStateRef.current.slugs[0] || 'Página_principal';
    const sampleTitle = sampleSlug.replace(/_/g, ' ');
    const dispatch = await dispatchBrowserPushNotification({
      title: `Teste Push • ${sampleTitle}`,
      body: 'Notificações de edições em páginas monitoradas estão funcionando corretamente.',
      slug: sampleSlug,
      tag: `wiki-test-${Date.now()}`,
    });

    const alertItem: PushNotificationLogItem = {
      id: `test_${Date.now()}`,
      pageSlug: sampleSlug,
      pageTitle: sampleTitle,
      author: currentUserRef.current.username,
      summary: 'Notificação de teste disparada via Especial:Aplicativo',
      timestamp: new Date().toISOString(),
      read: false,
      isTest: true,
    };
    appendAlertItem(alertItem);

    if (dispatch.delivered) {
      return {
        ok: true,
        message:
          dispatch.channel === 'service-worker'
            ? 'Notificação push de teste enviada via Service Worker do PWA!'
            : 'Notificação push de teste enviada pelo navegador!',
      };
    }

    return {
      ok: false,
      message: dispatch.reason || 'Não foi possível enviar a notificação de teste.',
    };
  }, [appendAlertItem]);

  // Real-time Firestore recent_changes watcher for monitored pages
  const seenChangeIdsRef = useRef<Set<string>>(new Set());
  const initialChangesLoadedRef = useRef<boolean>(false);

  useEffect(() => {
    const unsubChanges = subscribeToRecentChanges(changes => {
      if (!initialChangesLoadedRef.current) {
        changes.forEach(c => {
          const key = c.id || `${c.pageId}_${c.revId}_${c.timestamp}`;
          seenChangeIdsRef.current.add(key);
        });
        initialChangesLoadedRef.current = true;
        return;
      }

      const newChanges = changes.filter(c => {
        const key = c.id || `${c.pageId}_${c.revId}_${c.timestamp}`;
        if (seenChangeIdsRef.current.has(key)) return false;
        seenChangeIdsRef.current.add(key);
        return true;
      });

      if (newChanges.length === 0 || !pushEnabledExtRef.current) return;

      const watchPrefs = watchlistStateRef.current;
      if (!watchPrefs.notifyEnabled || watchPrefs.slugs.length === 0) return;

      const activeUser = currentUserRef.current;

      newChanges.forEach(change => {
        const normalizedSlug = slugify(change.pageId);
        if (!watchPrefs.slugs.includes(normalizedSlug)) return;

        const isSelfEdit =
          !activeUser.isAnonymous && change.authorId === activeUser.uid;
        if (isSelfEdit && !watchPrefs.notifyOwnEdits) return;

        const pageTitle = change.pageTitle || change.pageId.replace(/_/g, ' ');
        const authorName = change.author || 'Colaborador';
        const editSummary = change.summary?.trim() || 'Nova revisão publicada';

        const alertItem: PushNotificationLogItem = {
          id: change.id || `${normalizedSlug}_${change.revId}_${Date.now()}`,
          pageSlug: normalizedSlug,
          pageTitle,
          author: authorName,
          summary: editSummary,
          timestamp: change.timestamp || new Date().toISOString(),
          revId: change.revId,
          read: false,
        };

        appendAlertItem(alertItem);

        if (getBrowserNotificationPermission() === 'granted') {
          dispatchBrowserPushNotification({
            title: `Nova edição em ${pageTitle}`,
            body: `${authorName}: ${editSummary}`,
            slug: normalizedSlug,
            tag: `wiki-edit-${change.revId || normalizedSlug}`,
          }).catch(() => {});
        }
      });
    }, 25);

    return () => unsubChanges();
  }, [appendAlertItem]);

  const unreadAlertsCount = pushAlertHistory.filter(a => !a.read).length;

  return (
    <WikiContext.Provider
      value={{
        currentUser,
        skin,
        setSkin: handleSetSkin,
        currentSlug,
        setCurrentSlug,
        activeTab,
        setActiveTab,
        settings,
        updateSettings,
        existingPageSlugs,
        loginWithGoogle,
        logout,
        setGuestNickname,
        navigateToPage,
        sidebarOpen,
        setSidebarOpen,
        isRealtimeConnected,
        isBureaucrat,
        userPageSlug: userPagesInfo?.userPageSlug,
        userTalkSlug: userPagesInfo?.userTalkSlug,
        isBlazePlanActive,
        uploadWizardExtension,
        toggleBlazePlan,
        extensions: mergedExtensions,
        disabledExtensionIds,
        isExtensionActive,
        watchedSlugs: watchlistState.slugs,
        isPageWatched,
        toggleWatchPage,
        watchPage,
        unwatchPage,
        notificationPrefs: {
          notifyEnabled: watchlistState.notifyEnabled,
          notifyOwnEdits: watchlistState.notifyOwnEdits,
        },
        updateNotificationPrefs,
        notificationPermission,
        refreshNotificationPermission,
        requestNotificationPermission,
        pushAlertHistory,
        unreadAlertsCount,
        markAllAlertsRead,
        clearPushAlertHistory,
        latestToastAlert,
        dismissToastAlert,
        sendTestPushNotification,
      }}
    >
      {children}
    </WikiContext.Provider>
  );
}

export function useWiki() {
  const context = useContext(WikiContext);
  if (!context) {
    throw new Error('useWiki must be used within a WikiProvider');
  }
  return context;
}
