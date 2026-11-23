import React, { useState } from 'react';
import {
  Smartphone,
  Monitor,
  Download,
  CheckCircle2,
  Wifi,
  WifiOff,
  Share,
  PlusSquare,
  ShieldCheck,
  Zap,
  Laptop,
  TabletSmartphone,
  Info,
  ArrowLeft,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useWiki } from '../context/WikiContext';
import { WIKI_SITE_VERSION } from '../core/version';

export const SpecialApp: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, platform, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const { navigateToPage, settings } = useWiki();
  const [installFeedback, setInstallFeedback] = useState<string | null>(null);

  const handleInstallClick = async () => {
    const accepted = await install();
    if (accepted) {
      setInstallFeedback('Aplicativo WikiWazzimaGiygg instalado com sucesso neste dispositivo!');
    } else {
      setInstallFeedback('Instalação cancelada. Você pode instalar novamente a qualquer momento pelo botão abaixo ou pelo menu do navegador.');
    }
  };

  const platformLabel: Record<string, string> = {
    android: 'Smartphone / Tablet Android',
    ios: 'iPhone / iPad (iOS / iPadOS)',
    windows: 'Computador Windows',
    macos: 'Computador macOS',
    linux: 'Computador Linux',
    other: 'Navegador Web',
  };

  return (
    <div className="py-2 space-y-6">
      {/* Header */}
      <div className="border-b border-[#a2a9b1] dark:border-gray-700 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
            <TabletSmartphone className="w-6 h-6 text-[#0645ad] dark:text-[#6ba4ff] shrink-0" />
            <span>Aplicativo {settings.sitename} (Smartphone & Computador)</span>
          </h1>
          <button
            type="button"
            onClick={() => navigateToPage('Página_principal')}
            className="inline-flex items-center gap-1.5 text-xs text-[#0645ad] dark:text-[#6ba4ff] hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar à Página Principal</span>
          </button>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Especial:Aplicativo • Instale a enciclopédia como aplicativo independente (PWA) no Android, iPhone, iPad, Windows, macOS e Linux.
        </p>
      </div>

      {/* App Identity & Install Status Card */}
      <div className="p-5 bg-[#f8f9fa] dark:bg-gray-900 border border-[#a2a9b1] dark:border-gray-700 rounded shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src="/pwa-192x192.png"
            alt="Ícone do Aplicativo WikiWazzimaGiygg"
            className="w-16 h-16 rounded-xl border border-gray-300 dark:border-gray-700 shadow-xs bg-black shrink-0"
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-serif font-bold text-gray-900 dark:text-gray-100">
                {settings.sitename} App
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-100 dark:bg-blue-950 text-[#0645ad] dark:text-[#6ba4ff] border border-blue-200 dark:border-blue-800">
                {WIKI_SITE_VERSION}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
              <span>Dispositivo detectado: <strong className="text-gray-800 dark:text-gray-200">{platformLabel[platform]}</strong></span>
              <span>•</span>
              <span className={`inline-flex items-center gap-1 font-medium ${isOnline ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                {isOnline ? 'Conectado' : 'Modo Offline'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {isInstalled ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Aplicativo instalado e ativo</span>
            </div>
          ) : isInstallable ? (
            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Instalar Aplicativo Agora</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-blue-50 dark:bg-blue-950/40 text-[#0645ad] dark:text-[#6ba4ff] border border-blue-200 dark:border-blue-800 text-xs font-medium">
              <Info className="w-4 h-4 shrink-0" />
              <span>Siga o guia abaixo para seu dispositivo</span>
            </div>
          )}
        </div>
      </div>

      {installFeedback && (
        <div className="p-3 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{installFeedback}</span>
        </div>
      )}

      {/* Platform Instructions Grid: Smartphone & Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Smartphone & Tablet Card */}
        <div className="p-4 bg-white dark:bg-gray-900 border border-[#a2a9b1] dark:border-gray-700 rounded space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-800">
            <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-serif font-bold text-gray-900 dark:text-gray-100">
              Aplicativo para Smartphone (Android e iOS)
            </h3>
          </div>

          <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
            <div className="p-3 rounded bg-[#f8f9fa] dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 space-y-1.5">
              <div className="font-bold text-gray-900 dark:text-gray-100">
                Android (Chrome, Edge, Brave ou Samsung Internet)
              </div>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Abra o WikiWazzimaGiygg no navegador do seu celular.</li>
                <li>Clique em <strong>Instalar App</strong> no cabeçalho (quando disponível) ou toque no menu <strong>⋮</strong> do navegador.</li>
                <li>Selecione <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.</li>
              </ol>
            </div>

            <div className={`p-3 rounded border space-y-1.5 ${
              isIOS
                ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800'
                : 'bg-[#f8f9fa] dark:bg-gray-800/70 border-gray-200 dark:border-gray-700'
            }`}>
              <div className="font-bold text-gray-900 dark:text-gray-100">
                iPhone e iPad (Safari no iOS / iPadOS)
              </div>
              <ol className="list-decimal pl-4 space-y-1">
                <li>
                  Toque no ícone <strong className="inline-flex items-center gap-1"><Share className="w-3.5 h-3.5 text-[#0645ad]" /> Compartilhar</strong> na barra do Safari.
                </li>
                <li>
                  Toque em <strong className="inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 text-[#0645ad]" /> Adicionar à Tela de Início</strong>.
                </li>
                <li>Toque em <strong>Adicionar</strong> no canto superior direito.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Desktop Computer Card */}
        <div className="p-4 bg-white dark:bg-gray-900 border border-[#a2a9b1] dark:border-gray-700 rounded space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-800">
            <Monitor className="w-5 h-5 text-[#0645ad] dark:text-[#6ba4ff]" />
            <h3 className="text-base font-serif font-bold text-gray-900 dark:text-gray-100">
              Aplicativo para Computador (Windows, macOS e Linux)
            </h3>
          </div>

          <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
            <div className="p-3 rounded bg-[#f8f9fa] dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 space-y-1.5">
              <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-blue-600" />
                <span>Windows, Linux e macOS (Google Chrome ou Microsoft Edge)</span>
              </div>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Clique no botão <strong>Instalar App</strong> no topo desta página ou no ícone de computador na barra de endereços.</li>
                <li>No menu do navegador, você também pode escolher <strong>Salvar e compartilhar → Instalar {settings.sitename}</strong>.</li>
                <li>O aplicativo ganha janela própria sem barra do navegador e atalho no Menu Iniciar / Área de Trabalho / Dock.</li>
              </ol>
            </div>

            <div className="p-3 rounded bg-[#f8f9fa] dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 space-y-1.5">
              <div className="font-bold text-gray-900 dark:text-gray-100">
                macOS (Safari 17+)
              </div>
              <ol className="list-decimal pl-4 space-y-1">
                <li>No menu superior do macOS, clique em <strong>Arquivo</strong>.</li>
                <li>Selecione <strong>Adicionar ao Dock...</strong> e confirme em <strong>Adicionar</strong>.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Capabilities summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 bg-[#f8f9fa] dark:bg-gray-900 border border-[#a2a9b1] dark:border-gray-700 rounded space-y-1">
          <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Janela Nativa Standalone</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Executa em janela dedicada no desktop e em tela cheia no smartphone, com atalhos rápidos no ícone do app.
          </p>
        </div>

        <div className="p-3.5 bg-[#f8f9fa] dark:bg-gray-900 border border-[#a2a9b1] dark:border-gray-700 rounded space-y-1">
          <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
            <WifiOff className="w-4 h-4 text-emerald-600" />
            <span>Cache Offline Inteligente</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Service Worker mantém o motor, estilos e recursos estáticos disponíveis mesmo sem internet, com indicador offline.
          </p>
        </div>

        <div className="p-3.5 bg-[#f8f9fa] dark:bg-gray-900 border border-[#a2a9b1] dark:border-gray-700 rounded space-y-1">
          <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Privacidade e Segurança</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Mantém bloqueio anti-iframe, conformidade com LGPD/Marco Civil e sincronização segura com o Firebase Firestore.
          </p>
        </div>
      </div>
    </div>
  );
};
