import React, { useState, useMemo, useEffect } from 'react';
import {
  Edit3,
  History,
  MessageSquare,
  Eye,
  Star,
  ChevronDown,
  ChevronUp,
  Share2,
  Bookmark,
  Calendar,
  User,
  AlertCircle,
  Tag,
  ArrowRight,
  Lock,
  LogIn,
  ShieldCheck,
  ShieldAlert,
  Download,
  Image as ImageIcon,
  Braces,
  Copy,
  Check,
  Bell,
  BellRing,
  X,
} from 'lucide-react';
import { useWiki } from '../context/WikiContext';
import { WikiPage } from '../types/wiki';
import {
  subscribeToTemplates,
  expandWikitextTemplates,
  extractTemplateParameters,
  formatTemplateDisplayName,
} from '../services/templateService';
import { canUserEditPage, getEffectiveProtectionLevel } from '../services/wikiService';
import { getFileDoc } from '../services/extensionService';
import { WikiFileDoc } from '../extensions/types';
import { PageProtectionModal } from './PageProtectionModal';
import { CategoryExplorer } from './CategoryExplorer';
import { WIKI_SITE_VERSION } from '../core/version';

interface ArticleViewProps {
  page: WikiPage | null;
  slug: string;
  onEdit: (section?: number) => void;
  onViewHistory: () => void;
  onViewTalk: () => void;
}

export const ArticleView: React.FC<ArticleViewProps> = ({
  page,
  slug,
  onEdit,
  onViewHistory,
  onViewTalk,
}) => {
  const {
    existingPageSlugs,
    navigateToPage,
    activeTab,
    setActiveTab,
    currentUser,
    loginWithGoogle,
    isExtensionActive,
    disabledExtensionIds,
    isPageWatched,
    toggleWatchPage,
    notificationPermission,
    notificationPrefs,
    requestNotificationPermission,
  } = useWiki();

  const extTalkPages = isExtensionActive('talk-pages');
  const extRevisionHistory = isExtensionActive('revision-history');
  const extPageProtection = isExtensionActive('page-protection');
  const extPageWatchlist = isExtensionActive('page-watchlist');
  const extPushNotifications = isExtensionActive('push-notifications');
  const extPwaApp = isExtensionActive('pwa-app');
  const extAutoToc = isExtensionActive('auto-toc');
  const extCategories = isExtensionActive('dynamic-page-list');
  const extTemplates = isExtensionActive('templates-transclusion');
  const extLgpd = isExtensionActive('lgpd-privacy-suite');
  const [showTOC, setShowTOC] = useState(true);
  const [watchBanner, setWatchBanner] = useState<'watched' | 'unwatched' | null>(null);
  const [showProtectionModal, setShowProtectionModal] = useState(false);
  const [fileDoc, setFileDoc] = useState<WikiFileDoc | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [templatesVersion, setTemplatesVersion] = useState(0);

  const isWatched = page ? isPageWatched(page.slug) : false;

  useEffect(() => {
    setWatchBanner(null);
  }, [slug]);

  const handleToggleWatch = async () => {
    if (!page) return;
    const nowWatched = await toggleWatchPage(page.slug);
    setWatchBanner(nowWatched ? 'watched' : 'unwatched');
  };

  // Keep live templates synchronized from Firestore so {{NomeDaPredefinição|parâmetro}} always reflects latest edits
  useEffect(() => {
    const unsub = subscribeToTemplates(() => {
      setTemplatesVersion(v => v + 1);
    });
    return () => unsub();
  }, []);

  const isTemplatePage = Boolean(
    page?.namespace === 'Template' ||
      /^(?:Predefinição|Predefinicao|Template):/i.test(page?.slug || slug)
  );

  const templateMeta = useMemo(() => {
    if (!page || !isTemplatePage) return null;
    const bareName = formatTemplateDisplayName(page.title || page.slug).replace(/\s+/g, '_');
    const params = extractTemplateParameters(page.content);
    const paramSnippet = params
      .slice(0, 4)
      .map(p => (p.isPositional ? p.defaultValue || `valor${p.name}` : `${p.name}=`))
      .join('|');
    const snippet = paramSnippet ? `{{${bareName}|${paramSnippet}}}` : `{{${bareName}}}`;
    return { bareName, params, snippet };
  }, [page, isTemplatePage]);

  useEffect(() => {
    const isFile = slug.startsWith('Ficheiro:') || slug.startsWith('File:') || page?.namespace === 'File';
    if (!isFile) {
      setFileDoc(null);
      return;
    }
    getFileDoc(slug).then(doc => {
      setFileDoc(doc);
    });
  }, [slug, page]);

  const effectiveLevel = getEffectiveProtectionLevel(page);
  const editPermission = page
    ? canUserEditPage(page, currentUser)
    : { allowed: !currentUser.isAnonymous, isProtected: false, level: 'unprotected' as const };

  // Expand templates and parse wikitext whenever page content or Firestore templates change
  const parseResult = useMemo(() => {
    if (!page) return { html: '', toc: [], categories: [], references: [] };
    return expandWikitextTemplates(page.content, existingPageSlugs, {
      pageTitle: page.title,
      pageSlug: page.slug,
      namespace: page.namespace,
      totalPages: existingPageSlugs.size,
      disabledExtensions: disabledExtensionIds,
    });
  }, [page, existingPageSlugs, templatesVersion, disabledExtensionIds]);

  // Handle clicks on internal wiki links inside the parsed HTML
  useEffect(() => {
    const handleArticleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a, button');
      if (!target) return;

      // Section edit button
      if (target.classList.contains('mw-section-edit')) {
        e.preventDefault();
        const sectionNum = target.getAttribute('data-section');
        onEdit(sectionNum ? parseInt(sectionNum, 10) : undefined);
        return;
      }

      // Wiki internal link
      if (target.classList.contains('mw-wiki-link') || target.classList.contains('mw-new-link')) {
        const linkTarget = target.getAttribute('data-target');
        if (linkTarget) {
          e.preventDefault();
          if (target.classList.contains('mw-new-link')) {
            navigateToPage(linkTarget, 'edit');
          } else {
            navigateToPage(linkTarget, 'view');
          }
        }
      }
    };

    const container = document.getElementById('mw-content-text');
    if (container) {
      container.addEventListener('click', handleArticleClick);
      return () => container.removeEventListener('click', handleArticleClick);
    }
  }, [navigateToPage, onEdit]);

  const formattedDate = useMemo(() => {
    if (!page?.updatedAt) return '';
    try {
      const d = new Date(page.updatedAt);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return page.updatedAt;
    }
  }, [page?.updatedAt]);

  const isCategoryNamespace = /^(Categoria|Category):/i.test(slug);
  const categoryNamespaceName = isCategoryNamespace
    ? slug.replace(/^(Categoria|Category):/i, '').replace(/_/g, ' ').trim()
    : '';

  // Page does not exist yet state (MediaWiki prompt to create page)
  if (!page) {
    if (isCategoryNamespace && extCategories) {
      return (
        <div className="py-4 space-y-5">
          <div className="border-b border-[#a2a9b1] dark:border-gray-700 pb-2 flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-3xl font-serif font-normal text-gray-900 dark:text-gray-100">
              {slug.replace(/_/g, ' ')}
            </h1>
            {!currentUser.isAnonymous && (
              <button
                type="button"
                onClick={() => onEdit()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3366cc] hover:bg-[#254b99] text-white rounded font-medium text-xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Adicionar descrição da categoria</span>
              </button>
            )}
          </div>
          <CategoryExplorer
            initialCategory={categoryNamespaceName}
            embedded
            hideCategoryPageLink
            categoryPageMode
          />
        </div>
      );
    }

    return (
      <div className="py-6">
        <h1 className="text-3xl font-serif font-normal text-gray-900 dark:text-gray-100 border-b border-[#a2a9b1] dark:border-gray-700 pb-2 mb-4">
          {slug.replace(/_/g, ' ')}
        </h1>

        <div className="p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded my-6 text-sm text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-base mb-1">O WikiWazzimaGiygg não possui esta página salva no Firebase.</p>
              <p className="text-xs text-amber-800 dark:text-amber-300 mb-3">
                {currentUser.isAnonymous
                  ? 'Contribuições sem login não são permitidas. Para criar e salvar esta página no Firestore, entre com sua conta.'
                  : 'Você pode criar este artigo agora mesmo utilizando a sintaxe de wikitexto. As alterações serão salvas diretamente no Firebase Firestore.'}
              </p>
              {currentUser.isAnonymous ? (
                <button
                  type="button"
                  onClick={loginWithGoogle}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#3366cc] hover:bg-[#254b99] text-white rounded font-medium text-xs shadow-2xs cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Fazer login para criar esta página</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onEdit()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#3366cc] hover:bg-[#254b99] text-white rounded font-medium text-xs shadow-2xs cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Criar a página &quot;{slug.replace(/_/g, ' ')}&quot;</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>Dica: Você também pode procurar por páginas similares através da barra de pesquisa no topo.</p>
          <p>Para retornar à página inicial, clique em <button type="button" onClick={() => navigateToPage('Página_principal')} className="text-blue-600 hover:underline">Página principal</button>.</p>
        </div>
      </div>
    );
  }

  return (
    <article className="py-2">
      {/* MediaWiki Vector Action Tabs */}
      <div className="print:hidden flex flex-wrap items-center justify-between border-b border-[#a2a9b1] dark:border-gray-700 text-xs mb-3">
        {/* Left Tabs (Namespace / Talk) */}
        <div className="flex items-center -mb-px">
          <button
            type="button"
            onClick={() => setActiveTab('view')}
            className={`px-3.5 py-1.5 border-t border-r border-l rounded-t transition-colors font-medium ${
              activeTab === 'view'
                ? 'bg-white dark:bg-[#1a1f2c] border-[#a2a9b1] dark:border-gray-700 text-gray-900 dark:text-gray-100 border-b-transparent'
                : 'bg-[#f8f9fa] dark:bg-gray-800/60 border-transparent text-[#0645ad] dark:text-[#6ba4ff] hover:text-blue-800'
            }`}
          >
            {isTemplatePage
              ? 'Predefinição'
              : page.namespace === 'Help'
              ? 'Ajuda'
              : page.namespace === 'Manual'
              ? 'Manual'
              : page.namespace === 'User'
              ? 'Usuário'
              : page.namespace === 'File'
              ? 'Ficheiro'
              : page.namespace === 'Category'
              ? 'Categoria'
              : page.namespace === 'Wiki'
              ? 'Wiki'
              : 'Artigo'}
          </button>
          {extTalkPages && (
            <button
              type="button"
              onClick={onViewTalk}
              className={`px-3.5 py-1.5 border-t border-r border-l rounded-t transition-colors font-medium flex items-center gap-1 ${
                activeTab === 'talk'
                  ? 'bg-white dark:bg-[#1a1f2c] border-[#a2a9b1] dark:border-gray-700 text-gray-900 dark:text-gray-100 border-b-transparent'
                  : 'bg-[#f8f9fa] dark:bg-gray-800/60 border-transparent text-[#0645ad] dark:text-[#6ba4ff] hover:text-blue-800'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>Discussão</span>
            </button>
          )}
        </div>

        {/* Right Tabs (Read / Edit / History / Star) */}
        <div className="flex items-center -mb-px">
          <button
            type="button"
            onClick={() => setActiveTab('view')}
            className={`px-3 py-1.5 border-t border-r border-l rounded-t font-medium flex items-center gap-1 ${
              activeTab === 'view'
                ? 'bg-white dark:bg-[#1a1f2c] border-[#a2a9b1] dark:border-gray-700 text-gray-900 dark:text-gray-100 border-b-transparent'
                : 'bg-[#f8f9fa] dark:bg-gray-800/60 border-transparent text-[#0645ad] dark:text-[#6ba4ff]'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Ler</span>
          </button>

          {editPermission.allowed ? (
            <button
              type="button"
              onClick={() => onEdit()}
              className="px-3 py-1.5 border-t border-r border-l border-transparent rounded-t font-medium text-[#0645ad] dark:text-[#6ba4ff] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Editar</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onEdit()}
              className="px-3 py-1.5 border-t border-r border-l border-transparent rounded-t font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1 cursor-pointer"
              title={editPermission.reason || 'Página protegida contra alterações'}
            >
              <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Ver código-fonte</span>
            </button>
          )}

          {extRevisionHistory && (
            <button
              type="button"
              onClick={onViewHistory}
              className="px-3 py-1.5 border-t border-r border-l border-transparent rounded-t font-medium text-[#0645ad] dark:text-[#6ba4ff] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1 cursor-pointer"
            >
              <History className="w-3 h-3" />
              <span>Ver histórico</span>
            </button>
          )}

          {extPageProtection && (currentUser.isBureaucrat || currentUser.isAdmin) && (
            <button
              type="button"
              onClick={() => setShowProtectionModal(true)}
              className={`px-3 py-1.5 border-t border-r border-l border-transparent rounded-t font-medium flex items-center gap-1 cursor-pointer ${
                effectiveLevel === 'locked'
                  ? 'text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40'
                  : effectiveLevel === 'semi_protected'
                  ? 'text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                  : 'text-[#0645ad] dark:text-[#6ba4ff] hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title="Configurar nível de proteção (bloqueada, semiprotegida)"
            >
              {effectiveLevel === 'locked' ? (
                <Lock className="w-3 h-3 text-red-600 dark:text-red-400" />
              ) : effectiveLevel === 'semi_protected' ? (
                <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              ) : (
                <ShieldAlert className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              )}
              <span>Proteger</span>
            </button>
          )}

          {extPageWatchlist && (
            <button
              type="button"
              onClick={handleToggleWatch}
              className={`p-1.5 rounded-t text-gray-500 hover:text-amber-500 cursor-pointer transition-colors ${
                isWatched ? 'text-amber-500' : ''
              }`}
              title={
                isWatched
                  ? 'Desvigiar esta página (notificações push ativas se autorizadas)'
                  : 'Vigiar esta página e receber alertas de novas edições'
              }
            >
              <Star className={`w-3.5 h-3.5 ${isWatched ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Inline Watchlist + Push Notification Feedback Banner */}
      {watchBanner && extPageWatchlist && (
        <div
          className={`print:hidden mb-3 px-3.5 py-2.5 rounded border text-xs flex flex-wrap items-center justify-between gap-2 ${
            watchBanner === 'watched'
              ? 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100'
              : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {watchBanner === 'watched' ? (
              <BellRing className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            ) : (
              <Bell className="w-4 h-4 text-gray-500 shrink-0" />
            )}
            <span>
              {watchBanner === 'watched' ? (
                <>
                  <strong>{page.title}</strong> adicionada às suas páginas monitoradas.
                  {extPushNotifications && notificationPermission === 'granted' && notificationPrefs.notifyEnabled && (
                    <span className="ml-1 text-emerald-700 dark:text-emerald-400 font-medium">
                      Notificações push em tempo real ativas!
                    </span>
                  )}
                  {extPushNotifications && notificationPermission === 'default' && (
                    <span className="ml-1">Ative as notificações do navegador para ser alertado sobre novas edições.</span>
                  )}
                  {extPushNotifications && notificationPermission === 'denied' && (
                    <span className="ml-1 text-red-700 dark:text-red-300">
                      Notificações bloqueadas nas permissões do navegador.
                    </span>
                  )}
                </>
              ) : (
                <>
                  <strong>{page.title}</strong> removida da sua lista de páginas monitoradas.
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {watchBanner === 'watched' && extPushNotifications && notificationPermission === 'default' && (
              <button
                type="button"
                onClick={() => requestNotificationPermission()}
                className="px-2.5 py-1 rounded bg-[#3366cc] hover:bg-[#254b99] text-white font-medium text-[11px] cursor-pointer"
              >
                Permitir Notificações Push
              </button>
            )}
            {extPwaApp && extPushNotifications && (
              <button
                type="button"
                onClick={() => navigateToPage('Especial:Aplicativo')}
                className="text-[11px] text-[#0645ad] dark:text-[#6ba4ff] hover:underline font-medium cursor-pointer"
              >
                Gerenciar em Especial:Aplicativo
              </button>
            )}
            <button
              type="button"
              onClick={() => setWatchBanner(null)}
              className="p-0.5 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
              aria-label="Fechar aviso"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Title (firstHeading) */}
      <div className="mb-4">
        <div className="flex items-center justify-between border-b border-[#a2a9b1] dark:border-gray-700 pb-2 mb-1 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h1
              id="firstHeading"
              className="text-2xl sm:text-3xl font-serif font-normal text-gray-900 dark:text-gray-100"
            >
              {page.title}
            </h1>

            {effectiveLevel === 'locked' && (
              <button
                type="button"
                onClick={() => setShowProtectionModal(true)}
                className="print:hidden inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-sans font-semibold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800 hover:opacity-90 cursor-pointer shadow-2xs"
                title={`Página Bloqueada: ${page.protectionReason || 'Apenas administradores e burocratas podem editar'}`}
              >
                <Lock className="w-3 h-3 text-red-600 dark:text-red-400" />
                <span>Bloqueada</span>
              </button>
            )}

            {effectiveLevel === 'semi_protected' && (
              <button
                type="button"
                onClick={() => setShowProtectionModal(true)}
                className="print:hidden inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-sans font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:opacity-90 cursor-pointer shadow-2xs"
                title={`Página Semiprotegida: ${page.protectionReason || 'Apenas usuários confirmados ou administradores podem editar'}`}
              >
                <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Semiprotegida</span>
              </button>
            )}
          </div>
        </div>

        <div id="siteSub" className="text-[11px] text-gray-500 dark:text-gray-400 font-sans italic">
          De WikiWazzimaGiygg, a enciclopédia livre adaptada para TypeScript & Firebase.
        </div>
      </div>

      {/* Table of Contents (TOC) */}
      {extAutoToc && parseResult.toc.length >= 2 && (
        <div className="toc my-4 p-3 max-w-sm rounded border border-[#a2a9b1] dark:border-gray-700 bg-[#f8f9fa] dark:bg-gray-900 text-xs shadow-2xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-gray-200 dark:border-gray-800">
            <span className="font-bold text-gray-800 dark:text-gray-200">Índice</span>
            <button
              type="button"
              onClick={() => setShowTOC(prev => !prev)}
              className="print:hidden text-[#0645ad] dark:text-[#6ba4ff] hover:underline flex items-center gap-0.5 text-[11px]"
            >
              <span>[{showTOC ? 'ocultar' : 'mostrar'}]</span>
              {showTOC ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {showTOC && (
            <nav className="mt-2 space-y-1">
              {parseResult.toc.map(item => (
                <div
                  key={item.id}
                  style={{ paddingLeft: `${(item.level - 2) * 14}px` }}
                  className="leading-snug"
                >
                  <a
                    href={`#${item.id}`}
                    className="text-[#0645ad] dark:text-[#6ba4ff] hover:underline inline-flex items-baseline gap-1.5"
                  >
                    <span className="text-gray-500 dark:text-gray-400 font-mono text-[10px]">
                      {item.number}
                    </span>
                    <span>{item.text}</span>
                  </a>
                </div>
              ))}
            </nav>
          )}
        </div>
      )}

      {/* MediaWiki Canonical File Viewer */}
      {fileDoc && (
        <div className="my-4 p-4 bg-[#f8f9fa] dark:bg-gray-850 border border-[#a2a9b1] dark:border-gray-700 rounded text-xs space-y-3">
          <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-black/50 border border-gray-200 dark:border-gray-700 rounded">
            <img
              src={fileDoc.url}
              alt={fileDoc.title}
              className="max-h-96 max-w-full object-contain rounded shadow-xs"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-800 dark:text-gray-200">{fileDoc.fileName}</span>
              {' • '}
              {(fileDoc.size / 1024).toFixed(1)} KB
              {fileDoc.width && fileDoc.height && ` • ${fileDoc.width} × ${fileDoc.height} pixels`}
              {' • '}
              <span>{fileDoc.mimeType}</span>
            </div>
            <a
              href={fileDoc.url}
              download={fileDoc.fileName}
              className="print:hidden inline-flex items-center gap-1.5 px-3 py-1 bg-[#3366cc] hover:bg-[#254b99] text-white rounded font-medium shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar ficheiro em resolução original</span>
            </a>
          </div>
        </div>
      )}

      {/* MediaWiki Template Namespace Usage Banner */}
      {extTemplates && isTemplatePage && templateMeta && (
        <div className="print:hidden my-4 p-3.5 bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded text-xs space-y-2 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-semibold text-indigo-950 dark:text-indigo-200">
              <Braces className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>Predefinição Reutilizável (MediaWiki Transclusion)</span>
            </div>
            <button
              type="button"
              onClick={() => navigateToPage('Ajuda:Predefinições')}
              className="text-[11px] text-[#0645ad] dark:text-[#6ba4ff] hover:underline cursor-pointer font-medium"
            >
              Ajuda:Predefinições →
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">Para incluir em qualquer artigo, use:</span>
            <code className="px-2 py-0.5 rounded bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-800 font-mono text-[11px] text-indigo-700 dark:text-indigo-300">
              {templateMeta.snippet}
            </code>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(templateMeta.snippet);
                setCopiedSnippet(true);
                setTimeout(() => setCopiedSnippet(false), 1800);
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-gray-900 border border-indigo-300 dark:border-indigo-700 rounded text-[11px] text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 cursor-pointer"
            >
              {copiedSnippet ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSnippet ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
          {templateMeta.params.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400">
              <span>Parâmetros detectados:</span>
              {templateMeta.params.map(p => (
                <code
                  key={p.name}
                  className="px-1.5 py-0.2 rounded bg-white/80 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-mono text-[10px] text-gray-800 dark:text-gray-200"
                >
                  {`{{{${p.name}${p.defaultValue !== undefined ? `|${p.defaultValue}` : ''}}}}`}
                </code>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rendered Wikitext Body */}
      {isCategoryNamespace && !parseResult.html.trim() ? (
        <div
          id="mw-content-text"
          className="mw-body-content text-xs italic text-gray-500 dark:text-gray-400 py-1"
        >
          Esta página de categoria reúne automaticamente todas as páginas associadas por tag ou link direto.
        </div>
      ) : (
        <div
          id="mw-content-text"
          className={`mw-body-content leading-relaxed text-gray-800 dark:text-gray-200 ${
            isCategoryNamespace ? '' : 'min-h-[300px]'
          }`}
          dangerouslySetInnerHTML={{ __html: parseResult.html }}
        />
      )}

      {/* Embedded Automatic Alphabetical Category Index on Categoria: pages */}
      {isCategoryNamespace && extCategories && (
        <div className="my-5 pt-4 border-t border-gray-200 dark:border-gray-800">
          <CategoryExplorer
            initialCategory={categoryNamespaceName}
            embedded
            hideCategoryPageLink
            categoryPageMode
          />
        </div>
      )}

      {/* Categories Box (mw-catlinks) */}
      {extCategories && parseResult.categories.length > 0 && (
        <div
          id="catlinks"
          className="my-6 p-2.5 bg-[#f8f9fa] dark:bg-gray-900 border border-[#a2a9b1] dark:border-gray-700 rounded text-xs flex flex-wrap items-center justify-between gap-2 text-gray-700 dark:text-gray-300"
        >
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1 tabular-nums">
              <Tag className="w-3 h-3" />
              <span>
                {parseResult.categories.length === 1
                  ? 'Categoria:'
                  : `Categorias (${parseResult.categories.length}):`}
              </span>
            </span>
            {parseResult.categories.map((cat, idx) => (
              <React.Fragment key={cat}>
                {idx > 0 && <span className="text-gray-400" aria-hidden="true">|</span>}
                <button
                  type="button"
                  onClick={() => navigateToPage(`Categoria:${cat.replace(/\s+/g, '_')}`)}
                  className="text-[#0645ad] dark:text-[#6ba4ff] hover:underline cursor-pointer"
                >
                  {cat}
                </button>
              </React.Fragment>
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigateToPage('Especial:Categorias')}
            className="text-[11px] text-[#0645ad] dark:text-[#6ba4ff] hover:underline cursor-pointer shrink-0"
          >
            Explorar todas
          </button>
        </div>
      )}

      {/* MediaWiki Article Footer */}
      <footer className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800 text-[11px] text-gray-500 dark:text-gray-400 space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            Esta página foi editada pela última vez às <span className="font-medium">{formattedDate}</span> por{' '}
            <button
              type="button"
              onClick={() => navigateToPage(`Usuário:${page.author}`)}
              className="font-medium text-[#0645ad] dark:text-[#6ba4ff] hover:underline cursor-pointer"
            >
              {page.author}
            </button>.
          </div>
          <div className="font-mono text-[10px]">
            Revisão #{page.revisionCount} ({page.latestRevisionId.slice(0, 10)})
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            Conteúdo disponibilizado nos termos da licença{' '}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Creative Commons Atribuição-CompartilhaIgual 4.0 Internacional (CC BY-SA 4.0)
            </a>{' '}
            e da GNU General Public License v2+.
          </div>
          <div className="font-mono text-[10px] shrink-0">
            <button
              type="button"
              onClick={() => navigateToPage('Especial:Versão')}
              className="text-gray-600 dark:text-gray-300 hover:text-[#0645ad] dark:hover:text-[#6ba4ff] hover:underline cursor-pointer"
            >
              Wiki-Site {WIKI_SITE_VERSION}
            </button>
          </div>
        </div>
        {extLgpd && (
          <div className="print:hidden pt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
            <button
              type="button"
              onClick={() => navigateToPage('Wiki:Política_de_Privacidade')}
              className="text-[#0645ad] dark:text-[#6ba4ff] hover:underline cursor-pointer"
            >
              Política de Privacidade (LGPD)
            </button>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <button
              type="button"
              onClick={() => navigateToPage('Wiki:Termos_de_Uso')}
              className="text-[#0645ad] dark:text-[#6ba4ff] hover:underline cursor-pointer"
            >
              Termos de Uso (Marco Civil da Internet)
            </button>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <button
              type="button"
              onClick={() => navigateToPage('Especial:Privacidade')}
              className="text-[#0645ad] dark:text-[#6ba4ff] hover:underline cursor-pointer"
            >
              Central de Privacidade e Direitos do Titular
            </button>
          </div>
        )}
      </footer>

      {/* Page Protection Modal */}
      {page && (
        <PageProtectionModal
          page={page}
          isOpen={showProtectionModal}
          onClose={() => setShowProtectionModal(false)}
        />
      )}
    </article>
  );
};
