import React, { useState } from 'react';
import { Sliders, X, Check, Code, Save, RotateCcw } from 'lucide-react';
import { useWiki } from '../context/WikiContext';
import { WikiSkin } from '../types/wiki';
import { WIKI_SITE_VERSION } from '../core/version';
import { LEGAL_COMPLIANCE_INFO } from '../core/compliance';

interface LocalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocalSettingsModal: React.FC<LocalSettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, skin, setSkin } = useWiki();

  const [sitename, setSitename] = useState(settings.sitename);
  const [languageCode, setLanguageCode] = useState(settings.languageCode);
  const [allowAnon, setAllowAnon] = useState(settings.allowAnonymousEditing);
  const [livePreview, setLivePreview] = useState(settings.enableLivePreview);
  const [selectedSkin, setSelectedSkin] = useState<WikiSkin>(skin);
  const [dpoContact, setDpoContact] = useState(
    settings.lgpdDpoContact || LEGAL_COMPLIANCE_INFO.defaultDpoContact
  );
  const [retentionMonths, setRetentionMonths] = useState(
    settings.marcoCivilRetentionMonths ?? LEGAL_COMPLIANCE_INFO.defaultRetentionMonths
  );
  const [requireExplicitConsent, setRequireExplicitConsent] = useState(
    settings.requireExplicitConsent !== false
  );
  const [hideEmailOnUserPages, setHideEmailOnUserPages] = useState(
    settings.hideEmailOnUserPages !== false
  );
  const [savedAlert, setSavedAlert] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      sitename,
      languageCode,
      allowAnonymousEditing: allowAnon,
      enableLivePreview: livePreview,
      defaultSkin: selectedSkin,
      lgpdDpoContact: dpoContact.trim() || LEGAL_COMPLIANCE_INFO.defaultDpoContact,
      marcoCivilRetentionMonths: Math.max(6, Number(retentionMonths) || 6),
      requireExplicitConsent,
      hideEmailOnUserPages,
    });
    setSkin(selectedSkin);
    setSavedAlert(true);
    setTimeout(() => {
      setSavedAlert(false);
      onClose();
    }, 600);
  };

  const codeRepresentation = `// LocalSettings.ts - WikiWazzimaGiygg (${WIKI_SITE_VERSION}) Configuration
import { WikiSettings } from './types/wiki';

export const config: WikiSettings = {
  siteVersion: "${WIKI_SITE_VERSION}",
  sitename: "${sitename}",
  languageCode: "${languageCode}",
  allowAnonymousEditing: ${allowAnon},
  enableLivePreview: ${livePreview},
  defaultSkin: "${selectedSkin}",
  maxRecentChanges: 50,
  repositoryUrl: "https://github.com/WazzimaGiygg/WikiWazzimaGiygg",
  // Conformidade LGPD (Lei 13.709/2018) & Marco Civil (Lei 12.965/2014)
  lgpdDpoContact: "${dpoContact}",
  marcoCivilRetentionMonths: ${Math.max(6, Number(retentionMonths) || 6)},
  requireExplicitConsent: ${requireExplicitConsent},
  hideEmailOnUserPages: ${hideEmailOnUserPages}
};`;

  return (
    <div className="print:hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-3">
      <div className="bg-white dark:bg-gray-900 border border-[#a2a9b1] dark:border-gray-700 rounded-lg shadow-xl max-w-xl w-full text-xs overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 bg-[#eaecf0] dark:bg-gray-800 border-b border-[#a2a9b1] dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h2 className="font-serif font-bold text-sm text-gray-900 dark:text-gray-100">
              Configurações da Wiki (LocalSettings.ts)
            </h2>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-[#0645ad] dark:text-[#6ba4ff] border border-blue-200 dark:border-blue-800">
              {WIKI_SITE_VERSION}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {savedAlert && (
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Configurações salvas e aplicadas em tempo real!</span>
            </div>
          )}

          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              $wgSitename (Nome da Wiki):
            </label>
            <input
              type="text"
              required
              value={sitename}
              onChange={e => setSitename(e.target.value)}
              className="w-full p-2 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                $wgLanguageCode:
              </label>
              <select
                value={languageCode}
                onChange={e => setLanguageCode(e.target.value)}
                className="w-full p-2 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded text-xs"
              >
                <option value="pt-br">pt-br (Português do Brasil)</option>
                <option value="pt">pt (Português de Portugal)</option>
                <option value="en">en (English)</option>
                <option value="es">es (Español)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                $wgDefaultSkin:
              </label>
              <select
                value={selectedSkin}
                onChange={e => setSelectedSkin(e.target.value as WikiSkin)}
                className="w-full p-2 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded text-xs"
              >
                <option value="vector-modern">Vector Moderno (2022)</option>
                <option value="vector-legacy">Vector Clássico (2010)</option>
                <option value="dark-mode">Modo Escuro</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800">
            <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={allowAnon}
                onChange={e => setAllowAnon(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>$wgGroupPermissions[&apos;*&apos;][&apos;edit&apos;] (Permitir edições de anônimos)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={livePreview}
                onChange={e => setLivePreview(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>$wgLivePreview (Habilitar previsão ao vivo)</span>
            </label>
          </div>

          {/* LGPD & Marco Civil da Internet Settings */}
          <div className="space-y-2.5 pt-3 border-t border-gray-200 dark:border-gray-800">
            <div className="font-semibold text-gray-800 dark:text-gray-200 text-[11px] uppercase tracking-wider">
              Conformidade LGPD (Lei 13.709/2018) &amp; Marco Civil (Lei 12.965/2014)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  $wgLgpdDpoContact (Canal do Encarregado / DPO):
                </label>
                <input
                  type="text"
                  value={dpoContact}
                  onChange={e => setDpoContact(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  $wgMarcoCivilRetentionMonths (Guarda Art. 15, mín. 6 meses):
                </label>
                <input
                  type="number"
                  min={6}
                  max={60}
                  value={retentionMonths}
                  onChange={e => setRetentionMonths(Math.max(6, Number(e.target.value) || 6))}
                  className="w-full p-2 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded text-xs"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={requireExplicitConsent}
                onChange={e => setRequireExplicitConsent(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>$wgRequireExplicitConsent (Exigir banner de consentimento granular de cookies)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={hideEmailOnUserPages}
                onChange={e => setHideEmailOnUserPages(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>$wgHideEmailOnUserPages (Privacidade por padrão: ocultar e-mail em páginas de usuário)</span>
            </label>
          </div>

          {/* Live TypeScript Code Preview */}
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-gray-500 mb-1">
              <Code className="w-3.5 h-3.5" />
              <span>Visualização do código LocalSettings.ts:</span>
            </div>
            <pre className="p-3 bg-gray-950 text-emerald-400 font-mono text-[11px] rounded overflow-x-auto border border-gray-800 leading-relaxed">
              {codeRepresentation}
            </pre>
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 text-gray-700 dark:text-gray-300 rounded cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#3366cc] hover:bg-[#254b99] text-white rounded font-medium shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar configurações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
