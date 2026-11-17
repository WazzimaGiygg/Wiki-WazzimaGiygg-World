export const PRIVACY_CONSENT_STORAGE_KEY = 'mw_lgpd_consent_v1';
export const PRIVACY_POLICY_VERSION = '2026.1-LGPD-MCI';

export interface PrivacyConsentPreferences {
  essential: true;
  preferences: boolean;
  externalIntegrations: boolean;
  policyVersion: string;
  updatedAt: string;
}

export const LEGAL_COMPLIANCE_INFO = {
  lgpdLaw: 'Lei nº 13.709/2018 (LGPD)',
  marcoCivilLaw: 'Lei nº 12.965/2014 (Marco Civil da Internet)',
  marcoCivilDecree: 'Decreto nº 8.771/2016',
  defaultDpoContact: 'pedrohenriquecardonaperes@gmail.com',
  defaultRetentionMonths: 6, // Art. 15 da Lei nº 12.965/2014
  policyVersion: PRIVACY_POLICY_VERSION,
} as const;

export function getStoredConsent(): PrivacyConsentPreferences | null {
  try {
    const raw = localStorage.getItem(PRIVACY_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PrivacyConsentPreferences>;
    if (typeof parsed.preferences !== 'boolean' || typeof parsed.externalIntegrations !== 'boolean') {
      return null;
    }
    return {
      essential: true,
      preferences: parsed.preferences,
      externalIntegrations: parsed.externalIntegrations,
      policyVersion: parsed.policyVersion || PRIVACY_POLICY_VERSION,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveStoredConsent(prefs: {
  preferences: boolean;
  externalIntegrations: boolean;
}): PrivacyConsentPreferences {
  const record: PrivacyConsentPreferences = {
    essential: true,
    preferences: prefs.preferences,
    externalIntegrations: prefs.externalIntegrations,
    policyVersion: PRIVACY_POLICY_VERSION,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(PRIVACY_CONSENT_STORAGE_KEY, JSON.stringify(record));
    if (!prefs.preferences) {
      localStorage.removeItem('mw_skin');
      localStorage.removeItem('mw_guest_name');
    }
    window.dispatchEvent(new CustomEvent('wiki:consent-updated', { detail: record }));
  } catch {
    // Ignore storage quota / private mode errors
  }

  return record;
}

export function hasPreferenceStorageConsent(): boolean {
  const consent = getStoredConsent();
  return consent ? consent.preferences : false;
}

export function clearNonEssentialLocalData(): void {
  try {
    localStorage.removeItem('mw_skin');
    localStorage.removeItem('mw_guest_name');
    localStorage.removeItem('mw_settings');
    saveStoredConsent({ preferences: false, externalIntegrations: false });
  } catch {
    // Ignore storage errors
  }
}
