import React, { useState, useMemo, useEffect } from 'react';
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
  Bell,
  BellRing,
  BellOff,
  Star,
  Plus,
  Trash2,
  Send,
  AlertTriangle,
  Check,
  Clock,
  ExternalLink,
  Blocks,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useWiki } from '../context/WikiContext';
import { WIKI_SITE_VERSION } from '../core/version';
import { slugify } from '../core/parser';

export const SpecialApp: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, platform, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const {
    navigateToPage,
    settings,
    currentUser,
    isExtensionActive,
    existingPageSlugs,
    watchedSlugs,
    watchPage,
    unwatchPage,
    notificationPrefs,
    updateNotificationPrefs,
    notificationPermission,
    requestNotificationPermission,
    pushAlertHistory,
    unreadAlertsCount,
    markAllAlertsRead,
    clearPushAlertHistory,
    sendTestPushNotification,
  } = useWiki();

  const extPushNotifications = isExtensionActive('push-notifications');
  const extPageWatchlist = isExtensionActive('page-watchlist');

  const [installFeedback, setInstallFeedback] = useState<string | null>(null);
  const [newWatchSlug, setNewWatchSlug] = useState('');
  const [pushFeedback, setPushFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Mark alerts as read when user visits the alert history section
  useEffect(() => {
    if (unreadAlertsCount > 0) {
      markAllAlertsRead();
    }
  }, [unreadAlertsCount, markAllAlertsRead]);

  const suggestedSlugs = useMemo(() => {
    const arr = Array.from(existingPageSlugs)
      .filter(s => s && !s.startsWith('Especial:') && !s.startsWith('Special:'))
      .sort((a, b) => a.localeCompare(b));
    return Array.from(new Set(arr)).slice(0, 60);
  }, [existingPageSlugs]);

  const handleInstallClick = async () => {
    const accepted = await install();
    if (accepted) {
      setInstallFeedback('Aplicativo WikiWazzimaGiygg instalado com sucesso neste dispositivo!');
    } else {
      setInstallFeedback('Instalação cancelada. Você pode instalar novamente a qualquer momento pelo botão abaixo ou pelo menu do navegador.');
    }
  };

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    if (result === 'granted') {
      setPushFeedback({
        ok: true,
        text: 'Permissão concedida! Você receberá alertas push no navegador sempre que suas páginas monitoradas forem editadas.',
      });
    } else if (result === 'denied') {
      setPushFeedback({
        ok: false,
        text: 'Permissão negada no navegador. Para reativar, clique no ícone de cadeado/configurações ao lado do endereço do site.',
      });
    } else if (result === 'unsupported') {
      setPushFeedback({
        ok: false,
        text: 'Este navegador ou modo de navegação não oferece suporte à API de Notificações.',
      });
    } else {
      setPushFeedback({
        ok: false,
        text: 'Solicitação fechada sem escolha. Clique novamente quando quiser autorizar.',
      });
    }
  };

  const handleSendTest = async () => {
    setIsSendingTest(true);
    setPushFeedback(null);
    try {
      const res = await sendTestPushNotification();
      setPushFeedback({ ok: res.ok, text: res.message });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleAddWatchPage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newWatchSlug.trim();
    if (!trimmed) return;
    await watchPage(slugify(trimmed));
    setNewWatchSlug('');
  };

  const platformLabel: Record<string, string> = {
    android: 'Smartphone / Tablet Android',
    ios: 'iPhone / iPad (iOS / iPadOS)',
    windows: 'Computador Windows',
    macos: 'Computador macOS',
    linux: 'Computador Linux',
    other: 'Navegador Web',
  };

  const permissionBadge = () => {
    if (notificationPermission === 'granted') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Permitidas no navegador</span>
        </span>
      );
    }
    if (notificationPermission === 'denied') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-800 text-xs font-semibold">
          <BellOff className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
          <span>Bloqueadas pelo navegador</span>
        </span>
      );
    }
    if (notificationPermission === 'unsupported') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 text-xs font-semibold">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Navegador incompatível</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-xs font-semibold">
        <Bell className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        <span>Aguardando autorização</span>
      </span>
    );
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
          Especial:Aplicativo • Instale a enciclopédia como aplicativo independente (PWA) e gerencie notificações push de páginas monitoradas.
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

      {/* ======================================================================== */}
      {/* PUSH NOTIFICATIONS & MONITORED PAGES MANAGEMENT PANEL                    */}
      {/* ======================================================================== */}
      <section
        id="notificacoes-push"
        className="p-5 bg-white dark:bg-gray-900 border border-[#a2a9b1] dark:border-gray-700 rounded shadow-2xs space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-start gap-2.5">
            <BellRing className="w-5 h-5 text-[#0645ad] dark:text-[#6ba4ff] mt-0.5 shrink-0" />
            <div>
              <h2 className="text-lg font-serif font-bold text-gray-900 dark:text-gray-100">
                Notificações Push de Páginas Monitoradas
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Receba alertas em tempo real no navegador ou aplicativo PWA sempre que qualquer página da sua lista de vigiadas receber uma nova edição.
              </p>
            </div>
          </div>
          {permissionBadge()}
        </div>

        {!extPushNotifications || !extPageWatchlist ? (
          <div className="p-4 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-200 flex flex-wrap items-center justify-between gap-3">
            <span>
              As extensões <code>push-notifications</code> ou <code>page-watchlist</code> estão desativadas no momento.
            </span>
            <button
              type="button"
              onClick={() => navigateToPage('Especial:Extensões')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#3366cc] hover:bg-[#254b99] text-white font-medium cursor-pointer"
            >
              <Blocks className="w-3.5 h-3.5" />
              <span>Ativar em Especial:Extensões</span>
            </button>
          </div>
        ) : (
          <>
            {/* Permission Actions & Toggles */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
              {/* Browser Permission Control */}
              <div className="p-4 rounded bg-[#f8f9fa] dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-[#0645ad] dark:text-[#6ba4ff]" />
                  <span>Permissão de Notificações do Navegador</span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {notificationPermission === 'granted'
                    ? 'Seu navegador já está autorizado a exibir notificações push via Service Worker mesmo em outras abas.'
                    : notificationPermission === 'denied'
                    ? 'As notificações foram bloqueadas para este site nas configurações do navegador. Clique no ícone de cadeado na barra de endereços, defina "Notificações" como "Permitir" e recarregue.'
                    : notificationPermission === 'unsupported'
                    ? 'O navegador atual não disponibiliza a API Notification (ou você está em um contexto sem suporte). Em iOS/iPadOS, instale o app na Tela de Início pelo Safari.'
                    : 'Autorize as notificações para receber avisos instantâneos quando páginas vigiadas forem modificadas.'}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {notificationPermission !== 'granted' && notificationPermission !== 'unsupported' && (
                    <button
                      type="button"
                      onClick={handleRequestPermission}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#3366cc] hover:bg-[#254b99] text-white font-semibold shadow-2xs cursor-pointer transition-colors"
                    >
                      <BellRing className="w-3.5 h-3.5" />
                      <span>
                        {notificationPermission === 'denied'
                          ? 'Verificar Permissão Novamente'
                          : 'Permitir Notificações no Navegador'}
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={isSendingTest || notificationPermission === 'unsupported'}
                    onClick={handleSendTest}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-[#a2a9b1] dark:border-gray-600 text-gray-800 dark:text-gray-200 font-semibold cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 text-[#0645ad] dark:text-[#6ba4ff]" />
                    <span>{isSendingTest ? 'Enviando...' : 'Enviar Notificação de Teste'}</span>
                  </button>
                </div>

                {pushFeedback && (
                  <div
                    className={`p-2.5 rounded border text-[11px] flex items-start gap-2 ${
                      pushFeedback.ok
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                    }`}
                  >
                    {pushFeedback.ok ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <span>{pushFeedback.text}</span>
                  </div>
                )}
              </div>

              {/* Alert Preferences */}
              <div className="p-4 rounded bg-[#f8f9fa] dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center justify-between gap-2">
                  <span>Preferências de Monitoramento</span>
                  <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                    {currentUser.isAnonymous ? 'Armazenamento local' : 'Sincronizado no Firestore'}
                  </span>
                </div>

                <label className="flex items-start justify-between gap-3 p-2.5 rounded bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 cursor-pointer">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      Alertas push em tempo real
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      Dispara notificações instantâneas quando páginas monitoradas recebem novas revisões no Firestore.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.notifyEnabled}
                    onChange={e => updateNotificationPrefs({ notifyEnabled: e.target.checked })}
                    className="mt-1 h-4 w-4 accent-[#3366cc] cursor-pointer"
                  />
                </label>

                <label className="flex items-start justify-between gap-3 p-2.5 rounded bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 cursor-pointer">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      Notificar também minhas próprias edições
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      Útil para validar alertas ao editar uma página monitorada na mesma conta.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.notifyOwnEdits}
                    onChange={e => updateNotificationPrefs({ notifyOwnEdits: e.target.checked })}
                    className="mt-1 h-4 w-4 accent-[#3366cc] cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Watched Pages List + Recent Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
              {/* Monitored Pages List */}
              <div className="p-4 rounded bg-[#f8f9fa] dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-current" />
                    <span>Páginas Monitoradas ({watchedSlugs.length})</span>
                  </div>
                  {watchedSlugs.length === 0 && (
                    <button
                      type="button"
                      onClick={() => watchPage('Página_principal')}
                      className="text-[11px] text-[#0645ad] dark:text-[#6ba4ff] hover:underline font-medium cursor-pointer"
                    >
                      + Monitorar Página Principal
                    </button>
                  )}
                </div>

                <form onSubmit={handleAddWatchPage} className="flex gap-2">
                  <input
                    type="text"
                    list="wiki-watch-suggestions"
                    value={newWatchSlug}
                    onChange={e => setNewWatchSlug(e.target.value)}
                    placeholder="Adicionar artigo (ex: Página_principal)"
                    className="flex-1 min-w-0 px-2.5 py-1.5 rounded bg-white dark:bg-gray-900 border border-[#a2a9b1] dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-hidden focus:border-[#3366cc]"
                  />
                  <datalist id="wiki-watch-suggestions">
                    {suggestedSlugs.map(s => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#3366cc] hover:bg-[#254b99] text-white font-medium cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Monitorar</span>
                  </button>
                </form>

                {watchedSlugs.length === 0 ? (
                  <div className="p-3 rounded bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-center">
                    Nenhuma página monitorada ainda. Clique na estrela (<Star className="w-3 h-3 inline text-amber-500" />) no topo de qualquer artigo ou adicione acima.
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded max-h-60 overflow-y-auto">
                    {watchedSlugs.map(slugItem => (
                      <li key={slugItem} className="px-3 py-2 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => navigateToPage(slugItem)}
                          className="text-left font-medium text-[#0645ad] dark:text-[#6ba4ff] hover:underline truncate flex items-center gap-1.5 cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-current shrink-0" />
                          <span className="truncate">{slugItem.replace(/_/g, ' ')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => unwatchPage(slugItem)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded cursor-pointer shrink-0"
                          title="Parar de monitorar esta página"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Recent Push Alert History */}
              <div className="p-4 rounded bg-[#f8f9fa] dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#0645ad] dark:text-[#6ba4ff]" />
                    <span>Alertas Recentes ({pushAlertHistory.length})</span>
                  </div>
                  {pushAlertHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={clearPushAlertHistory}
                      className="text-[11px] text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:underline cursor-pointer"
                    >
                      Limpar histórico
                    </button>
                  )}
                </div>

                {pushAlertHistory.length === 0 ? (
                  <div className="p-4 rounded bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-center">
                    Nenhum alerta disparado nesta sessão. Quando uma página monitorada for editada, o registro aparecerá aqui.
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded max-h-60 overflow-y-auto">
                    {pushAlertHistory.map(alert => (
                      <li key={alert.id} className="p-2.5 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => navigateToPage(alert.pageSlug)}
                            className="font-semibold text-[#0645ad] dark:text-[#6ba4ff] hover:underline flex items-center gap-1 truncate cursor-pointer"
                          >
                            <span className="truncate">{alert.pageTitle}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </button>
                          <span className="text-[10px] text-gray-400 shrink-0 font-mono">
                            {new Date(alert.timestamp).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-600 dark:text-gray-300">
                          <span className="font-medium">{alert.author}</span>: {alert.summary}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </section>

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
            Mantém proteção contra iframes não autorizados (com suporte ao Google AI Studio), conformidade LGPD/Marco Civil e sincronização segura no Firestore.
          </p>
        </div>
      </div>
    </div>
  );
};
