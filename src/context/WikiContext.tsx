import React, { createContext, useContext, useState, useEffect } from 'react';
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
