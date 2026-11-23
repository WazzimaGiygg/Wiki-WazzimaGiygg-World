import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, X, Monitor } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useWiki } from '../context/WikiContext';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, platform, install } = usePWAInstall();
  const { navigateToPage } = useWiki();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Suppress button when already running in standalone installed app mode
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Windows / macOS / Linux native install prompt
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-2xs transition-colors cursor-pointer"
        title="Instalar aplicativo WikiWazzimaGiygg no smartphone ou computador"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden lg:inline">Instalar App</span>
        <span className="lg:hidden">App</span>
      </button>
    );
  }

  // iOS Safari guided flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-emerald-500/60 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-medium transition-colors cursor-pointer"
          title="Instalar no iPhone ou iPad"
        >
          <Smartphone className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Instalar App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-lg bg-white dark:bg-gray-900 border border-[#a2a9b1] dark:border-gray-700 p-5 shadow-xl space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
                <h3 className="text-base font-serif font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Instalar no iPhone / iPad</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ol className="space-y-2.5 text-gray-700 dark:text-gray-300 leading-relaxed list-decimal pl-4">
                <li>
                  Toque no botão <strong className="inline-flex items-center gap-1"><Share className="w-3.5 h-3.5 text-[#0645ad]" /> Compartilhar</strong> na barra inferior ou superior do Safari.
                </li>
                <li>
                  Role as opções e toque em <strong className="inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 text-[#0645ad]" /> Adicionar à Tela de Início</strong>.
                </li>
                <li>
                  Confirme tocando em <strong>Adicionar</strong> para abrir o WikiWazzimaGiygg como aplicativo nativo.
                </li>
              </ol>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowIOSGuide(false);
                    navigateToPage('Especial:Aplicativo');
                  }}
                  className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  Ver guia completo
                </button>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="px-3 py-1.5 rounded bg-[#3366cc] hover:bg-[#254b99] text-white font-medium cursor-pointer"
                >
                  Entendi
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback button when browser hasn't fired beforeinstallprompt yet (Safari macOS, Firefox, etc.)
  const isMobile = platform === 'android';
  return (
    <button
      type="button"
      onClick={() => navigateToPage('Especial:Aplicativo')}
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-medium transition-colors cursor-pointer"
      title="Abrir página do Aplicativo para Smartphone e Computador (Especial:Aplicativo)"
    >
      {isMobile ? (
        <Smartphone className="w-3.5 h-3.5 text-[#0645ad] dark:text-[#6ba4ff] shrink-0" />
      ) : (
        <Monitor className="w-3.5 h-3.5 text-[#0645ad] dark:text-[#6ba4ff] shrink-0" />
      )}
      <span className="hidden xl:inline">App</span>
    </button>
  );
};
