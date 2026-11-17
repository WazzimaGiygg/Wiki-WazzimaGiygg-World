import React, { useState, useEffect } from 'react';
import { ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { useWiki } from '../context/WikiContext';
import {
  getStoredConsent,
  saveStoredConsent,
  PrivacyConsentPreferences,
} from '../core/compliance';

export const ConsentBanner: React.FC = () => {
  const { navigateToPage, settings } = useWiki();
  const [consent, setConsent] = useState<PrivacyConsentPreferences | null>(() => getStoredConsent());

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const custom = e as CustomEvent<PrivacyConsentPreferences>;
      setConsent(custom.detail || getStoredConsent());
    };
    window.addEventListener('wiki:consent-updated', handleUpdate);
    return () => window.removeEventListener('wiki:consent-updated', handleUpdate);
  }, []);

  if (settings.requireExplicitConsent === false || consent !== null) {
    return null;
  }

  const handleEssentialOnly = () => {
    const saved = saveStoredConsent({
      preferences: false,
      externalIntegrations: false,
    });
    setConsent(saved);
  };

  const handleAcceptAll = () => {
    const saved = saveStoredConsent({
      preferences: true,
      externalIntegrations: true,
    });
    setConsent(saved);
  };

  return (
    <div
      role="dialog"
      aria-label="Aviso de Privacidade, LGPD e Marco Civil da Internet"
      className="print:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[#a2a9b1] dark:border-gray-700 bg-white/98 dark:bg-[#161b26]/98 shadow-2xl backdrop-blur-xs"
    >
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5 max-w-3xl">
          <ShieldCheck className="w-5 h-5 text-[#3366cc] dark:text-[#6ba4ff] shrink-0 mt-0.5" />
          <div className="space-y-1 text-gray-700 dark:text-gray-300 leading-relaxed">
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              Privacidade, Cookies e Conformidade Legal (LGPD · Marco Civil da Internet)
            </div>
            <p>
              O <strong>{settings.sitename}</strong> utiliza armazenamento essencial para autenticação e segurança, e
              recursos opcionais para preferências visuais e integrações externas, em conformidade com a{' '}
              <strong>Lei nº 13.709/2018 (LGPD)</strong> e a <strong>Lei nº 12.965/2014 (Marco Civil da Internet)</strong>.
              Consulte nossa{' '}
              <button
                type="button"
                onClick={() => navigateToPage('Wiki:Política_de_Privacidade')}
                className="text-[#0645ad] dark:text-[#6ba4ff] hover:underline font-medium cursor-pointer"
              >
                Política de Privacidade
              </button>{' '}
              e os{' '}
              <button
                type="button"
                onClick={() => navigateToPage('Wiki:Termos_de_Uso')}
                className="text-[#0645ad] dark:text-[#6ba4ff] hover:underline font-medium cursor-pointer"
              >
                Termos de Uso
              </button>
              .
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleEssentialOnly}
            className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium cursor-pointer"
          >
            Apenas essenciais
          </button>
          <button
            type="button"
            onClick={() => navigateToPage('Especial:Privacidade')}
            className="px-3 py-1.5 rounded border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#0645ad] dark:text-[#6ba4ff] font-medium inline-flex items-center gap-1 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Personalizar</span>
          </button>
          <button
            type="button"
            onClick={handleAcceptAll}
            className="px-3.5 py-1.5 rounded bg-[#3366cc] hover:bg-[#254b99] text-white font-semibold cursor-pointer shadow-2xs"
          >
            Aceitar todos
          </button>
        </div>
      </div>
    </div>
  );
};
