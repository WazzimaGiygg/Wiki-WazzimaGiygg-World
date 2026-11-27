/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WikiProvider, useWiki } from './context/WikiContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ArticleView } from './components/ArticleView';
import { EditView } from './components/EditView';
import { HistoryView } from './components/HistoryView';
import { TalkView } from './components/TalkView';
import { SpecialRecentChanges } from './components/SpecialRecentChanges';
import { SpecialAllPages } from './components/SpecialAllPages';
import { SpecialVersion } from './components/SpecialVersion';
import { SpecialGitHubSync } from './components/SpecialGitHubSync';
import { SpecialBureaucratAdmin } from './components/SpecialBureaucratAdmin';
import { SpecialExtensions } from './components/SpecialExtensions';
import { SpecialUpload } from './components/SpecialUpload';
import { SpecialPrivacy } from './components/SpecialPrivacy';
import { SpecialApp } from './components/SpecialApp';
import { ConsentBanner } from './components/ConsentBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Footer } from './components/Footer';
import { LocalSettingsModal } from './components/LocalSettingsModal';
import { subscribeToPage } from './services/wikiService';
import { WikiPage } from './types/wiki';
import { Loader2, Blocks, Lock, BellRing, X, MessageSquare } from 'lucide-react';
import { updateDocumentSEO } from './utils/seo';

function WikiMain() {
  const {
    currentSlug,
    activeTab,
    setActiveTab,
    skin,
    sidebarOpen,
    setSidebarOpen,
    settings,
    isExtensionActive,
    navigateToPage,
    latestToastAlert,
    dismissToastAlert,
    welcomeBanner,
    dismissWelcomeBanner,
  } = useWiki();

  const [currentPage, setCurrentPage] = useState<WikiPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editSection, setEditSection] = useState<number | undefined>(undefined);

  // REAL-TIME: Subscribe to current page changes via onSnapshot
  useEffect(() => {
    setLoading(true);

    const isSpecial = currentSlug.startsWith('Especial:') || currentSlug.startsWith('Special:');
    if (isSpecial) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToPage(currentSlug, page => {
      setCurrentPage(page);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [currentSlug]);

  // Dynamically update canonical URL, meta tags, and Schema.org JSON-LD for core.wazzimagiygg.com
  useEffect(() => {
    if (!isExtensionActive('seo-manager')) return;
    const isSpecial = currentSlug.startsWith('Especial:') || currentSlug.startsWith('Special:');
    updateDocumentSEO(currentSlug, isSpecial ? null : currentPage);
  }, [currentSlug, currentPage, isExtensionActive]);

  const isSpecialPage = currentSlug.startsWith('Especial:') || currentSlug.startsWith('Special:');

  const renderDisabledExtensionNotice = (featureLabel: string, extensionId: string) => (
    <div className="my-6 p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded text-sm text-amber-950 dark:text-amber-200 space-y-3">
      <div className="flex items-start gap-3">
        <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <div className="space-y-1.5">
          <h2 className="font-serif font-bold text-base text-gray-900 dark:text-gray-100">
            Recurso desativado pela gestão de extensões
          </h2>
          <p className="text-xs leading-relaxed">
            O recurso <strong>{featureLabel}</strong> está vinculado à extensão{' '}
            <code className="px-1.5 py-0.5 rounded bg-white/80 dark:bg-gray-900 border border-amber-200 dark:border-amber-800 font-mono text-[11px]">
              {extensionId}
            </code>
            , que foi desativada por um Burocrata em{' '}
            <button
              type="button"
              onClick={() => navigateToPage('Especial:Extensões')}
              className="text-[#0645ad] dark:text-[#6ba4ff] hover:underline font-semibold cursor-pointer"
            >
              Especial:Extensões
            </button>
            .
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => navigateToPage('Especial:Extensões')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3366cc] hover:bg-[#254b99] text-white rounded text-xs font-medium cursor-pointer"
        >
          <Blocks className="w-3.5 h-3.5" />
          <span>Gerenciar em Especial:Extensões</span>
        </button>
        <button
          type="button"
          onClick={() => navigateToPage('Página_principal')}
          className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
        >
          Voltar à Página Principal
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading && !isSpecialPage) {
      return (
        <div className="py-24 text-center text-sm text-gray-500 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span>A sincronizar {currentSlug.replace(/_/g, ' ')} em tempo real com o Firestore...</span>
        </div>
      );
    }

    // Special pages routing
    if (currentSlug === 'Especial:Mudanças_recentes' || currentSlug === 'Special:RecentChanges') {
      return isExtensionActive('recent-changes')
        ? <SpecialRecentChanges />
        : renderDisabledExtensionNotice('Mudanças Recentes', 'recent-changes');
    }
    if (currentSlug === 'Especial:Todas_as_páginas' || currentSlug === 'Special:AllPages') {
      return isExtensionActive('all-pages-index')
        ? <SpecialAllPages />
        : renderDisabledExtensionNotice('Índice de Todas as Páginas', 'all-pages-index');
    }
    if (currentSlug === 'Especial:Versão' || currentSlug === 'Special:Version') {
      return <SpecialVersion />;
    }
    if (
      currentSlug === 'Especial:GitHubSync' ||
      currentSlug === 'Special:GitHubSync' ||
      currentSlug === 'Especial:Atualizações' ||
      currentSlug === 'Especial:Atualizacoes' ||
      currentSlug === 'Especial:Updates' ||
      currentSlug === 'Special:Updates'
    ) {
      return isExtensionActive('github-sync')
        ? <SpecialGitHubSync />
        : renderDisabledExtensionNotice('Sincronização com GitHub', 'github-sync');
    }
    if (
      currentSlug === 'Especial:Permissões_de_usuário' ||
      currentSlug === 'Especial:Permissoes_de_usuario' ||
      currentSlug === 'Especial:Administração' ||
      currentSlug === 'Especial:Administracao' ||
      currentSlug === 'Special:UserRights' ||
      currentSlug === 'Special:Bureaucrat'
    ) {
      return <SpecialBureaucratAdmin initialTab="manage" />;
    }
    if (
      currentSlug === 'Especial:CheckUser' ||
      currentSlug === 'Especial:Verificação_de_contas' ||
      currentSlug === 'Especial:Verificacao_de_contas' ||
      currentSlug === 'Especial:Fantoches' ||
      currentSlug === 'Special:CheckUser'
    ) {
      return isExtensionActive('checkuser')
        ? <SpecialBureaucratAdmin initialTab="checkuser" />
        : renderDisabledExtensionNotice('CheckUser & Auditoria de IPs', 'checkuser');
    }
    if (
      currentSlug === 'Especial:Desbloqueio' ||
      currentSlug === 'Especial:Discussão_de_desbloqueio' ||
      currentSlug === 'Especial:Discussao_de_desbloqueio' ||
      currentSlug === 'Especial:Discussão_de_bloqueio' ||
      currentSlug === 'Especial:Discussao_de_bloqueio' ||
      currentSlug === 'Special:Unblock'
    ) {
      return isExtensionActive('arbcom-ucoc-governance')
        ? <SpecialBureaucratAdmin initialTab="unblock" />
        : renderDisabledExtensionNotice('Pedidos de Desbloqueio (ArbCom & UCoC)', 'arbcom-ucoc-governance');
    }
    if (
      currentSlug === 'Especial:ArbCom' ||
      currentSlug === 'Especial:Conselho_de_Arbitragem' ||
      currentSlug === 'Special:ArbCom'
    ) {
      return isExtensionActive('arbcom-ucoc-governance')
        ? <SpecialBureaucratAdmin initialTab="arbcom" />
        : renderDisabledExtensionNotice('Conselho de Arbitragem (ArbCom)', 'arbcom-ucoc-governance');
    }
    if (
      currentSlug === 'Especial:UCOC' ||
      currentSlug === 'Especial:UCoC' ||
      currentSlug === 'Especial:Código_de_Conduta' ||
      currentSlug === 'Especial:Codigo_de_Conduta' ||
      currentSlug === 'Special:UCoC'
    ) {
      return isExtensionActive('arbcom-ucoc-governance')
        ? <SpecialBureaucratAdmin initialTab="ucoc" />
        : renderDisabledExtensionNotice('Código Universal de Conduta (UCoC)', 'arbcom-ucoc-governance');
    }
    if (
      currentSlug === 'Especial:Páginas_protegidas' ||
      currentSlug === 'Especial:Paginas_protegidas' ||
      currentSlug === 'Special:ProtectedPages'
    ) {
      return isExtensionActive('page-protection')
        ? <SpecialBureaucratAdmin initialTab="protected_pages" />
        : renderDisabledExtensionNotice('Páginas Protegidas', 'page-protection');
    }
    if (currentSlug === 'Especial:SEO' || currentSlug === 'Special:SEO') {
      return isExtensionActive('seo-manager')
        ? <SpecialBureaucratAdmin initialTab="seo" />
        : renderDisabledExtensionNotice('Gerenciador de SEO & Schema.org', 'seo-manager');
    }
    if (
      currentSlug === 'Especial:Banco_de_Dados' ||
      currentSlug === 'Especial:Firebase' ||
      currentSlug === 'Special:Database'
    ) {
      return <SpecialBureaucratAdmin initialTab="database" />;
    }
    if (
      currentSlug === 'Especial:Extensões' ||
      currentSlug === 'Especial:Extensoes' ||
      currentSlug === 'Special:Extensions'
    ) {
      return <SpecialExtensions />;
    }
    if (
      currentSlug === 'Especial:Carregar_arquivo' ||
      currentSlug === 'Especial:Carregar_ficheiro' ||
      currentSlug === 'Especial:Upload' ||
      currentSlug === 'Special:Upload'
    ) {
      return isExtensionActive('upload-wizard')
        ? <SpecialUpload />
        : renderDisabledExtensionNotice('Assistente de Carregamento (UploadWizard)', 'upload-wizard');
    }
    if (
      currentSlug === 'Especial:Privacidade' ||
      currentSlug === 'Especial:LGPD' ||
      currentSlug === 'Especial:Marco_Civil' ||
      currentSlug === 'Special:Privacy'
    ) {
      return isExtensionActive('lgpd-privacy-suite')
        ? <SpecialPrivacy />
        : renderDisabledExtensionNotice('Central de Privacidade (LGPD & Marco Civil)', 'lgpd-privacy-suite');
    }
    if (
      currentSlug === 'Especial:Aplicativo' ||
      currentSlug === 'Especial:App' ||
      currentSlug === 'Especial:PWA' ||
      currentSlug === 'Special:App'
    ) {
      return isExtensionActive('pwa-app')
        ? <SpecialApp />
        : renderDisabledExtensionNotice('Aplicativo Desktop & Smartphone (PWA)', 'pwa-app');
    }

    // Standard wiki page tabs
    if (activeTab === 'edit') {
      return (
        <EditView
          page={currentPage}
          slug={currentSlug}
          initialSection={editSection}
          onSaved={saved => {
            setCurrentPage(saved);
            setActiveTab('view');
          }}
          onCancel={() => setActiveTab('view')}
        />
      );
    }

    if (activeTab === 'history') {
      if (!isExtensionActive('revision-history')) {
        return renderDisabledExtensionNotice('Histórico de Revisões e Diff', 'revision-history');
      }
      return (
        <HistoryView
          page={currentPage}
          slug={currentSlug}
          onBackToArticle={() => setActiveTab('view')}
        />
      );
    }

    if (activeTab === 'talk') {
      if (!isExtensionActive('talk-pages')) {
        return renderDisabledExtensionNotice('Páginas de Discussão', 'talk-pages');
      }
      return (
        <TalkView
          page={currentPage}
          slug={currentSlug}
          onBackToArticle={() => setActiveTab('view')}
        />
      );
    }

    // Default: View mode
    return (
      <ArticleView
        page={currentPage}
        slug={currentSlug}
        onEdit={(section?: number) => {
          setEditSection(section);
          setActiveTab('edit');
        }}
        onViewHistory={() => setActiveTab('history')}
        onViewTalk={() => setActiveTab('talk')}
      />
    );
  };

  // Determine container styling based on selected skin
  const skinContainerClass =
    skin === 'vector-legacy'
      ? 'bg-[#f6f6f6] dark:bg-[#11141c]'
      : 'bg-white dark:bg-[#1a1f2c]';

  const contentBoxClass =
    skin === 'vector-legacy'
      ? 'bg-white dark:bg-[#1a1f2c] border-x border-b border-[#a2a9b1] dark:border-gray-800 px-6 py-4 shadow-xs min-h-[calc(100vh-8rem)]'
      : 'px-4 sm:px-8 py-4 max-w-5xl min-h-[calc(100vh-8rem)]';

  return (
    <div className={`wiki-app-shell min-h-screen text-gray-900 dark:text-gray-100 flex flex-col ${skinContainerClass}`}>
      <Header onOpenSettings={() => setSettingsOpen(true)} />

      <div className="wiki-layout-body flex-1 flex max-w-7xl w-full mx-auto relative">
        {/* Responsive backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="print:hidden fixed inset-0 bg-black/30 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar onOpenSettings={() => setSettingsOpen(true)} />

        <main className="flex-1 min-w-0 pb-16">
          {(settings.maintenanceMode || settings.siteNotice || welcomeBanner) && (
            <div className="print:hidden px-4 sm:px-8 pt-3 max-w-5xl space-y-2">
              {welcomeBanner && (
                <div className="px-4 py-3 rounded border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <MessageSquare className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="font-semibold">
                        Boas-vindas ao {settings.sitename}, {welcomeBanner.userName}!
                      </div>
                      <p className="text-emerald-800 dark:text-emerald-200/90 leading-snug">
                        Adicionamos automaticamente uma mensagem de boas-vindas com atalhos e instruções na sua página de discussão pessoal.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        navigateToPage(welcomeBanner.userTalkSlug);
                        dismissWelcomeBanner();
                      }}
                      className="px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-medium cursor-pointer transition-colors"
                    >
                      Abrir Página de Discussão
                    </button>
                    <button
                      type="button"
                      onClick={dismissWelcomeBanner}
                      className="p-1 rounded text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200/60 dark:hover:bg-emerald-900/60 cursor-pointer"
                      aria-label="Fechar aviso de boas-vindas"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              {settings.maintenanceMode && (
                <div className="px-3.5 py-2 rounded border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs">
                  <strong>Modo de Manutenção (Somente Leitura):</strong>{' '}
                  {settings.maintenanceMessage ||
                    'O sistema está temporariamente em manutenção. Edições permanecem restritas a Burocratas.'}
                </div>
              )}
              {settings.siteNotice && (
                <div
                  className={`px-3.5 py-2 rounded border text-xs ${
                    settings.siteNoticeLevel === 'alert'
                      ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200'
                      : settings.siteNoticeLevel === 'warning'
                      ? 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                      : 'border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                  }`}
                >
                  {settings.siteNotice}
                </div>
              )}
            </div>
          )}
          <div className={`wiki-content-box ${contentBoxClass}`}>{renderContent()}</div>
        </main>
      </div>

      <Footer onOpenSettings={() => setSettingsOpen(true)} />
      <LocalSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      {isExtensionActive('lgpd-privacy-suite') && <ConsentBanner />}
      {isExtensionActive('pwa-app') && <OfflineIndicator />}

      {latestToastAlert && isExtensionActive('push-notifications') && (
        <div className="print:hidden fixed bottom-4 right-4 z-50 max-w-sm w-[calc(100%-2rem)] bg-white dark:bg-gray-900 border border-[#3366cc] dark:border-blue-700 rounded-lg shadow-xl p-3.5 text-xs space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-gray-100">
              <BellRing className="w-4 h-4 text-[#0645ad] dark:text-[#6ba4ff] shrink-0" />
              <span className="truncate">
                {latestToastAlert.isTest
                  ? `Teste Push • ${latestToastAlert.pageTitle}`
                  : `Nova edição em ${latestToastAlert.pageTitle}`}
              </span>
            </div>
            <button
              type="button"
              onClick={dismissToastAlert}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
              aria-label="Fechar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-300 leading-snug">
            <strong className="text-gray-800 dark:text-gray-200">{latestToastAlert.author}:</strong>{' '}
            {latestToastAlert.summary}
          </p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                navigateToPage(latestToastAlert.pageSlug);
                dismissToastAlert();
              }}
              className="px-2.5 py-1 rounded bg-[#3366cc] hover:bg-[#254b99] text-white font-medium cursor-pointer"
            >
              Abrir página
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function isAllowedIframeOrigin(originOrUrl: string): boolean {
  if (!originOrUrl) return false;
  try {
    const parsed = new URL(originOrUrl, window.location.origin);
    if (parsed.origin === window.location.origin) return true;
    const host = parsed.hostname.toLowerCase();
    return (
      host === 'aistudio.google.com' ||
      host.endsWith('.aistudio.google.com') ||
      host === 'makersuite.google.com' ||
      host.endsWith('.googleusercontent.com') ||
      host.endsWith('.usercontent.goog') ||
      host.endsWith('.run.app') ||
      host.endsWith('.web.app') ||
      host.endsWith('.firebaseapp.com') ||
      host === 'localhost' ||
      host === '127.0.0.1'
    );
  } catch {
    return false;
  }
}

function isBlockedIframeContext(): boolean {
  try {
    if (window.self === window.top) return false;

    const hostname = window.location.hostname.toLowerCase();
    if (
      hostname.startsWith('ais-dev-') ||
      hostname.startsWith('ais-pre-') ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1'
    ) {
      return false;
    }

    const ancestorOrigins = (window.location as Location & { ancestorOrigins?: DOMStringList }).ancestorOrigins;
    if (ancestorOrigins && ancestorOrigins.length > 0) {
      return !Array.from(ancestorOrigins).every(origin => isAllowedIframeOrigin(origin));
    }

    if (document.referrer && isAllowedIframeOrigin(document.referrer)) {
      return false;
    }

    return true;
  } catch {
    return true;
  }
}

export default function App() {
  const [blockedInIframe] = useState<boolean>(() => isBlockedIframeContext());

  useEffect(() => {
    if (!blockedInIframe) return;
    try {
      window.top?.location.replace(window.location.href);
    } catch {
      // Cross-origin top frame blocks programmatic redirect; UI lock screen remains enforced
    }
  }, [blockedInIframe]);

  if (blockedInIframe) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] text-gray-900 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white border border-red-300 rounded-lg p-6 shadow-sm text-center space-y-3">
          <h1 className="text-lg font-serif font-bold text-red-700">
            Exibição em iframe bloqueada por segurança
          </h1>
          <p className="text-xs text-gray-600 leading-relaxed">
            O <strong>WikiWazzimaGiygg</strong> não permite carregamento incorporado em{' '}
            <code>&lt;iframe&gt;</code> para proteger os usuários contra ataques de{' '}
            <em>clickjacking</em> e captura indevida de sessão.
          </p>
          <a
            href="https://wikiwazzimagiygg.wazzimagiygg.com/"
            target="_top"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-[#3366cc] hover:bg-[#254b99] text-white text-xs font-medium rounded no-underline"
          >
            Abrir WikiWazzimaGiygg diretamente
          </a>
        </div>
      </div>
    );
  }

  return (
    <WikiProvider>
      <WikiMain />
    </WikiProvider>
  );
}
