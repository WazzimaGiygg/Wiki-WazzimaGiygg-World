import React, { useState, useRef, useMemo } from 'react';
import {
  Bold,
  Italic,
  Link,
  Code,
  List,
  ListOrdered,
  Heading2,
  Table,
  Quote,
  Eye,
  FileDiff,
  Save,
  X,
  Sparkles,
  HelpCircle,
  FileCode,
  Lock,
  LogIn,
  ShieldAlert,
  Copy,
  Check,
  Image as ImageIcon,
  Flame,
  UploadCloud,
  ExternalLink,
  Loader2,
  Globe,
  Search,
  PanelRight,
  Info,
  User as UserIcon,
  BookOpen,
  Braces,
  Plus,
  Trash2,
  Underline,
  Strikethrough,
  Heading3,
  Tag,
  Terminal,
  ChevronDown,
  Columns2,
  Type,
} from 'lucide-react';
import { useWiki } from '../context/WikiContext';
import { wikitextToFormattedHtml, formattedHtmlToWikitext } from '../core/wikitextFormattedBridge';
import { WikiPage } from '../types/wiki';
import { savePage, canUserEditPage, getEffectiveProtectionLevel } from '../services/wikiService';
import { saveUploadedFile, subscribeToUploadedFiles } from '../services/extensionService';
import { queryGoogleSearchGrounding, SearchGroundingResult } from '../services/groundingService';
import {
  subscribeToTemplates,
  saveTemplate,
  deleteTemplate,
  validateTemplate,
  expandWikitextTemplates,
  expandSubstInWikitext,
  buildTemplateInvocation,
  formatTemplateSlug,
  TemplateCatalogEntry,
} from '../services/templateService';
import { WikiFileDoc } from '../extensions/types';
import { computeRevisionDiff } from '../core/diff';
import { DEFAULT_CATEGORY_DEFINITIONS } from '../core/defaultCategories';
import { prepareImageForWikiUpload } from '../utils/imageCompression';
import { cleanCategoryName } from '../utils/categoryUtils';

interface EditViewProps {
  page: WikiPage | null;
  slug: string;
  onSaved: (page: WikiPage) => void;
  onCancel: () => void;
  initialSection?: number;
}

export const EditView: React.FC<EditViewProps> = ({
  page,
  slug,
  onSaved,
  onCancel,
}) => {
  const {
    currentUser,
    existingPageSlugs,
    loginWithGoogle,
    isBlazePlanActive,
    isAdmin,
    isBureaucrat,
    toggleBlazePlan,
    navigateToPage,
    settings,
    isExtensionActive,
    disabledExtensionIds,
  } = useWiki();

  const extWikiEditor = isExtensionActive('wiki-editor');
  const extVisualEditor = isExtensionActive('visual-editor');
  const extLiveDiff = isExtensionActive('live-diff');
  const extTemplates = isExtensionActive('templates-transclusion');
  const extWikitable = isExtensionActive('wikitable-parser');
  const extCite = isExtensionActive('cite');
  const extSyntaxHighlight = isExtensionActive('syntax-highlight');
  const extSignatures = isExtensionActive('wiki-signatures');
  const extScribunto = isExtensionActive('scribunto');
  const extUploadWizard = isExtensionActive('upload-wizard');
  const extGoogleSearch = isExtensionActive('google-search-grounding');

  // Image insertion modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalTab, setImageModalTab] = useState<'upload' | 'gallery' | 'manual'>('upload');
  const [recentFiles, setRecentFiles] = useState<WikiFileDoc[]>([]);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageAlign, setImageAlign] = useState<'right' | 'left' | 'center' | 'none'>('right');
  const [imageWidth, setImageWidth] = useState('300px');

  // Quick upload state inside modal
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadPreparedMeta, setUploadPreparedMeta] = useState<{
    mimeType: string;
    sizeBytes: number;
    width?: number;
    height?: number;
    wasCompressed: boolean;
  } | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [enablingBlaze, setEnablingBlaze] = useState(false);
  const [blazeError, setBlazeError] = useState<string | null>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // Infobox builder modal state (Software, Usuário, and Tutorial)
  const isUserNamespacePage = /^(?:Usuário|User):/i.test(page?.title || slug);
  const [showInfoboxModal, setShowInfoboxModal] = useState(false);

  // MediaWiki Templates (Predefinições) modal state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateModalTab, setTemplateModalTab] = useState<'use' | 'create'>('use');
  const [liveTemplates, setLiveTemplates] = useState<TemplateCatalogEntry[]>([]);
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedTemplateSlug, setSelectedTemplateSlug] = useState<string>('Predefinição:Ambox');
  const [templateParamValues, setTemplateParamValues] = useState<Record<string, string>>({});
  const [templateUseSubst, setTemplateUseSubst] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateSummary, setNewTemplateSummary] = useState('');
  const [newTemplateBody, setNewTemplateBody] = useState(
    `<includeonly><div class="my-3 p-3 rounded border border-[#a2a9b1] dark:border-gray-700 border-l-4 border-l-indigo-500 bg-[#f8f9fa] dark:bg-gray-800/80 text-xs text-gray-800 dark:text-gray-200">{{#if:{{{título|}}}|<div class="font-bold mb-0.5">{{{título}}}</div>|}}<div>{{{1|{{{texto|Conteúdo da predefinição}}}}}}</div></div></includeonly><noinclude>\nDescreva aqui como usar esta predefinição.\n\n[[Categoria:Predefinições do WikiWazzimaGiygg]]\n</noinclude>`
  );
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templateFeedback, setTemplateFeedback] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);

  // Visual toolbar interactive drawers for new editors (Link builder, Table builder, Quick templates, Categories, Cheat sheet)
  const [activeToolbarDrawer, setActiveToolbarDrawer] = useState<
    'none' | 'link' | 'table' | 'templates' | 'categories' | 'cheatsheet'
  >('none');
  const [categoryDrawerSearch, setCategoryDrawerSearch] = useState('');
  const [categoryDrawerCustom, setCategoryDrawerCustom] = useState('');
  const [categoryDrawerKind, setCategoryDrawerKind] = useState<'all' | 'article' | 'page'>('all');
  const [quickLinkType, setQuickLinkType] = useState<'internal' | 'external'>('internal');
  const [quickLinkTarget, setQuickLinkTarget] = useState('');
  const [quickLinkLabel, setQuickLinkLabel] = useState('');
  const [quickTableRows, setQuickTableRows] = useState(3);
  const [quickTableCols, setQuickTableCols] = useState(3);
  const [quickTableHeader, setQuickTableHeader] = useState(true);
  const [quickTableCaption, setQuickTableCaption] = useState('');
  const [infoboxModalTab, setInfoboxModalTab] = useState<'software' | 'user' | 'tutorial'>(() =>
    isUserNamespacePage ? 'user' : 'software'
  );
  const [infoboxIncludeEmpty, setInfoboxIncludeEmpty] = useState(false);
  const [infoboxFields, setInfoboxFields] = useState({
    nome: page?.title || slug.replace(/_/g, ' '),
    subtitulo: '',
    logo: '',
    legenda: '',
    tipo: '',
    desenvolvedor: '',
    mantenedor: '',
    email: '',
    versao: '',
    lancamento: '',
    linguagem: '',
    plataforma: '',
    licenca: '',
    site: '',
    repositorio: '',
    documentacao: '',
    status: '',
    descricao: '',
  });
  const [userInfoboxFields, setUserInfoboxFields] = useState({
    nome: currentUser.isAnonymous ? '' : currentUser.username,
    subtitulo: 'Colaborador(a) do WikiWazzimaGiygg',
    foto: currentUser.avatarUrl || '',
    legenda: '',
    usuario: currentUser.isAnonymous ? '' : currentUser.username,
    email: currentUser.email || '',
    uid: currentUser.isAnonymous ? '' : `\`${currentUser.uid}\``,
    funcao: currentUser.isBureaucrat
      ? 'Burocrata'
      : currentUser.isAdmin
      ? 'Administrador'
      : 'Colaborador Registrado',
    especialidade: '',
    idiomas: 'Português',
    localizacao: '',
    discussao: currentUser.userTalkSlug ? `[[${currentUser.userTalkSlug}|Discussão]]` : '',
    site: '',
    status: 'Ativo',
    biografia: '',
  });

  // Subscribe to recent files when modal opens
  React.useEffect(() => {
    if (!showImageModal) return;
    const unsub = subscribeToUploadedFiles(files => {
      setRecentFiles(files);
      if (files.length > 0 && !selectedFileName) {
        setSelectedFileName(files[0].fileName);
      }
    }, 20);
    return () => unsub();
  }, [showImageModal, selectedFileName]);

  const handleSelectModalFile = async (file: File) => {
    setUploadFile(file);
    setUploadError(null);
    setUploadPreparedMeta(null);
    const clean = file.name.replace(/\s+/g, '_');
    setUploadTitle(clean);
    try {
      const prepared = await prepareImageForWikiUpload(file);
      setUploadPreview(prepared.dataUrl);
      setUploadPreparedMeta({
        mimeType: prepared.mimeType,
        sizeBytes: prepared.sizeBytes,
        width: prepared.width,
        height: prepared.height,
        wasCompressed: prepared.wasCompressed,
      });
    } catch (err: any) {
      setUploadFile(null);
      setUploadPreview(null);
      setUploadPreparedMeta(null);
      setUploadError(err?.message || 'Não foi possível preparar a imagem selecionada.');
    }
  };

  const insertRawText = (textToInsert: string) => {
    const textarea = textareaRef.current;
    syncSourceRef.current = 'code';
    if (!textarea) {
      setContent(prev => prev + '\n' + textToInsert);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent =
      textarea.value.substring(0, start) + textToInsert + textarea.value.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 10);
  };

  const buildImageSyntax = (name: string, caption: string, align: string, width: string) => {
    const clean = name.replace(/^(ficheiro:|file:|imagem:|image:)/i, '').replace(/\s+/g, '_');
    const parts = [`Ficheiro:${clean}`, 'thumb'];
    if (align && align !== 'right') parts.push(align);
    if (width && width !== '300px') parts.push(width);
    if (caption.trim()) parts.push(caption.trim());
    return `[[${parts.join('|')}]]\n`;
  };

  const handleQuickUploadAndInsert = async () => {
    if (!isBlazePlanActive) {
      setUploadError('O upload de imagens está bloqueado porque o Plano Blaze não está ativado na extensão UploadWizard 5.0.0.XL.1.');
      return;
    }
    if (!uploadFile || !uploadPreview) {
      setUploadError('Selecione um arquivo de imagem para carregar.');
      return;
    }
    if (currentUser.isAnonymous) {
      setUploadError('Você precisa estar autenticado para carregar arquivos.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    try {
      const savedDoc = await saveUploadedFile({
        fileName: uploadTitle || uploadFile.name,
        dataUrl: uploadPreview,
        mimeType: uploadPreparedMeta?.mimeType || uploadFile.type || 'image/png',
        size: uploadPreparedMeta?.sizeBytes ?? uploadFile.size,
        width: uploadPreparedMeta?.width,
        height: uploadPreparedMeta?.height,
        author: currentUser.username,
        authorId: currentUser.uid,
        description: uploadDesc || imageCaption,
      });

      const tag = buildImageSyntax(savedDoc.fileName, imageCaption, imageAlign, imageWidth);
      insertRawText(tag);
      setShowImageModal(false);
      setUploadFile(null);
      setUploadPreview(null);
      setUploadPreparedMeta(null);
      setUploadTitle('');
      setUploadDesc('');
    } catch (err: any) {
      setUploadError('Falha no upload: ' + (err.message || String(err)));
    } finally {
      setIsUploading(false);
    }
  };

  const handleInsertExistingFile = () => {
    if (!selectedFileName.trim()) return;
    const tag = buildImageSyntax(selectedFileName.trim(), imageCaption, imageAlign, imageWidth);
    insertRawText(tag);
    setShowImageModal(false);
  };

  const buildInfoboxSyntax = () => {
    if (infoboxModalTab === 'user') {
      const userMap: Array<{ key: keyof typeof userInfoboxFields; param: string }> = [
        { key: 'nome', param: 'nome' },
        { key: 'subtitulo', param: 'subtítulo' },
        { key: 'foto', param: 'foto' },
        { key: 'legenda', param: 'legenda' },
        { key: 'usuario', param: 'usuário' },
        { key: 'email', param: 'e-mail' },
        { key: 'uid', param: 'uid' },
        { key: 'funcao', param: 'função' },
        { key: 'especialidade', param: 'especialidade' },
        { key: 'idiomas', param: 'idiomas' },
        { key: 'localizacao', param: 'localização' },
        { key: 'discussao', param: 'página_de_discussão' },
        { key: 'site', param: 'site' },
        { key: 'status', param: 'status' },
        { key: 'biografia', param: 'biografia' },
      ];

      const lines = userMap
        .filter(({ key }) => infoboxIncludeEmpty || userInfoboxFields[key].trim() !== '')
        .map(({ key, param }) => `| ${param} = ${userInfoboxFields[key].trim()}`);

      if (lines.length === 0) {
        lines.push(`| nome = ${currentUser.username || 'Usuário'}`);
      }

      return `{{Infobox usuário\n${lines.join('\n')}\n}}\n`;
    }

    const fieldMap: Array<{ key: keyof typeof infoboxFields; param: string }> = [
      { key: 'nome', param: 'nome' },
      { key: 'subtitulo', param: 'subtítulo' },
      { key: 'logo', param: 'logotipo' },
      { key: 'legenda', param: 'legenda' },
      { key: 'tipo', param: 'tipo' },
      { key: 'desenvolvedor', param: 'desenvolvedor' },
      { key: 'mantenedor', param: 'mantenedor' },
      { key: 'email', param: 'e-mail' },
      { key: 'versao', param: 'versão_estável' },
      { key: 'lancamento', param: 'lançamento' },
      { key: 'linguagem', param: 'linguagem' },
      { key: 'plataforma', param: 'plataforma' },
      { key: 'licenca', param: 'licença' },
      { key: 'site', param: 'site' },
      { key: 'repositorio', param: 'repositório' },
      { key: 'documentacao', param: 'documentação' },
      { key: 'status', param: 'status' },
      { key: 'descricao', param: 'descrição' },
    ];

    const lines = fieldMap
      .filter(({ key }) => infoboxIncludeEmpty || infoboxFields[key].trim() !== '')
      .map(({ key, param }) => `| ${param} = ${infoboxFields[key].trim()}`);

    if (lines.length === 0) {
      lines.push(`| nome = ${page?.title || slug.replace(/_/g, ' ')}`);
    }

    return `{{Infobox software\n${lines.join('\n')}\n}}\n`;
  };

  const handleFillInfoboxExample = () => {
    if (infoboxModalTab === 'user') {
      setUserInfoboxFields({
        nome: currentUser.isAnonymous ? 'Maria Silva' : currentUser.username,
        subtitulo: 'Colaborador(a) do WikiWazzimaGiygg',
        foto: currentUser.avatarUrl || '/assets/aistudio/image_19fe7a14.png',
        legenda: 'Foto de perfil',
        usuario: currentUser.isAnonymous ? 'Maria Silva' : currentUser.username,
        email: currentUser.email || 'contato@exemplo.com',
        uid: currentUser.isAnonymous ? '`uid_exemplo_123`' : `\`${currentUser.uid}\``,
        funcao: currentUser.isBureaucrat
          ? 'Burocrata'
          : currentUser.isAdmin
          ? 'Administrador'
          : 'Colaborador Registrado',
        especialidade: 'Documentação Técnica, TypeScript e História',
        idiomas: 'Português, Inglês',
        localizacao: 'Brasil',
        discussao: currentUser.userTalkSlug
          ? `[[${currentUser.userTalkSlug}|Discussão]]`
          : '[[Discussão_Usuário:Maria_Silva|Enviar mensagem]]',
        site: 'https://wikiwazzimagiygg.wazzimagiygg.com',
        status: 'Ativo',
        biografia: 'Contribuidor(a) voluntário(a) da enciclopédia livre.',
      });
      return;
    }

    setInfoboxFields({
      nome: page?.title || slug.replace(/_/g, ' '),
      subtitulo: 'Software colaborativo de código aberto',
      logo: '/assets/aistudio/image_19fe7a14.png',
      legenda: 'Logotipo oficial do projeto',
      tipo: 'Aplicação Web / Ferramenta Técnica',
      desenvolvedor: 'Equipe de Desenvolvimento',
      mantenedor: 'Comunidade Colaborativa',
      email: 'contato@exemplo.com',
      versao: 'WC1.16.C7.1',
      lancamento: '2026',
      linguagem: 'TypeScript, React',
      plataforma: 'Web, Linux, Windows, macOS',
      licenca: 'GPL-2.0-or-later / MIT',
      site: 'https://wikiwazzimagiygg.wazzimagiygg.com',
      repositorio: 'https://github.com/WazzimaGiygg/WikiWazzimaGiygg',
      documentacao: '[[Ajuda:Wikitexto|Documentação Oficial]]',
      status: 'Ativo',
      descricao: 'Plataforma modular com armazenamento estruturado em tempo real.',
    });
  };

  const handleInsertInfobox = () => {
    insertRawText(buildInfoboxSyntax());
    setShowInfoboxModal(false);
  };

  const editPermission = useMemo(() => {
    if (settings.maintenanceMode && !currentUser.isBureaucrat) {
      return {
        allowed: false,
        isProtected: true,
        level: 'locked' as const,
        reason:
          settings.maintenanceMessage ||
          'Modo de manutenção ativo no banco de dados. Apenas Burocratas podem salvar edições no momento.',
      };
    }
    return page
      ? canUserEditPage(page, currentUser)
      : { allowed: !currentUser.isAnonymous, isProtected: false, level: 'unprotected' as const };
  }, [page, currentUser, settings.maintenanceMode, settings.maintenanceMessage]);

  const [copiedSource, setCopiedSource] = useState<boolean>(false);

  const [content, setContent] = useState<string>(() => {
    if (page?.content) return page.content;
    if (/^(?:Categoria|Category):/i.test(slug)) {
      const catLabel = slug.replace(/^(?:Categoria|Category):/i, '').replace(/_/g, ' ').trim();
      return `Esta categoria reúne páginas e artigos relacionados a '''${catLabel}'''.\n\nTodas as páginas que utilizam a tag <code><nowiki>[[Categoria:${catLabel}]]</nowiki></code> ou o link <code><nowiki>[[:Categoria:${catLabel}]]</nowiki></code> são listadas automaticamente abaixo em ordem alfabética.`;
    }
    return `== Introdução ==\nEscreva o conteúdo do seu artigo aqui em wikitexto.\n\n== Detalhes ==\n* Item 1\n* Item 2\n\n[[Categoria:Geral]]`;
  });

  const [summary, setSummary] = useState<string>('');
  const [isMinor, setIsMinor] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activePreview, setActivePreview] = useState<'none' | 'preview' | 'diff'>('none');
  const [editorLayout, setEditorLayout] = useState<'code' | 'split' | 'formatted'>(() =>
    isExtensionActive('visual-editor') ? 'split' : 'code'
  );
  const [formattedPaneMode, setFormattedPaneMode] = useState<'editable' | 'preview'>('editable');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Enforce visual-editor extension state
  const effectiveEditorLayout = extVisualEditor ? editorLayout : 'code';

  // Google Search Grounding research state
  const [showResearchPanel, setShowResearchPanel] = useState(false);
  const [researchQuery, setResearchQuery] = useState(() => page?.title || slug.replace(/_/g, ' '));
  const [researchLoading, setResearchLoading] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);
  const [researchResult, setResearchResult] = useState<SearchGroundingResult | null>(null);

  const handleRunResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!researchQuery.trim()) return;
    setResearchLoading(true);
    setResearchError(null);
    try {
      const data = await queryGoogleSearchGrounding({
        query: researchQuery.trim(),
        mode: 'research',
        articleTitle: page?.title || slug.replace(/_/g, ' '),
      });
      setResearchResult(data);
    } catch (err: unknown) {
      setResearchError(err instanceof Error ? err.message : 'Erro ao pesquisar fontes.');
    } finally {
      setResearchLoading(false);
    }
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formattedEditorRef = useRef<HTMLDivElement>(null);
  const syncSourceRef = useRef<'code' | 'formatted' | null>(null);
  const lastFocusedPaneRef = useRef<'code' | 'formatted'>('code');

  const handleCopySource = () => {
    navigator.clipboard.writeText(content);
    setCopiedSource(true);
    setTimeout(() => setCopiedSource(false), 2000);
  };

  // Real-time Firestore template catalog subscription
  React.useEffect(() => {
    const unsub = subscribeToTemplates(list => {
      setLiveTemplates(list);
    });
    return () => unsub();
  }, []);

  // Synchronize code -> formatted contentEditable DOM whenever code edits or templates load
  React.useEffect(() => {
    if (effectiveEditorLayout === 'code' || formattedPaneMode !== 'editable') return;
    const el = formattedEditorRef.current;
    if (!el) return;
    if (syncSourceRef.current === 'formatted') {
      syncSourceRef.current = null;
      return;
    }
    const nextHtml = wikitextToFormattedHtml(content, existingPageSlugs, {
      pageTitle: page?.title || slug.replace(/_/g, ' '),
      pageSlug: slug,
      namespace: page?.namespace,
      totalPages: existingPageSlugs.size,
      disabledExtensions: disabledExtensionIds,
    });
    if (el.innerHTML !== nextHtml) {
      el.innerHTML = nextHtml;
    }
  }, [
    content,
    effectiveEditorLayout,
    formattedPaneMode,
    existingPageSlugs,
    page?.title,
    page?.namespace,
    slug,
    liveTemplates,
    disabledExtensionIds,
  ]);

  const handleFormattedPaneInput = () => {
    const el = formattedEditorRef.current;
    if (!el || !editPermission.allowed) return;
    syncSourceRef.current = 'formatted';
    const nextWikitext = formattedHtmlToWikitext(el);
    setContent(nextWikitext);
  };

  const formattedPreviewResult = useMemo(() => {
    if (effectiveEditorLayout === 'code' || formattedPaneMode !== 'preview') return null;
    return expandWikitextTemplates(content, existingPageSlugs, {
      pageTitle: page?.title || slug.replace(/_/g, ' '),
      pageSlug: slug,
      namespace: page?.namespace,
      totalPages: existingPageSlugs.size,
      disabledExtensions: disabledExtensionIds,
    });
  }, [
    content,
    effectiveEditorLayout,
    formattedPaneMode,
    existingPageSlugs,
    page?.title,
    page?.namespace,
    slug,
    liveTemplates,
    disabledExtensionIds,
  ]);

  // Computed live preview with templateService expansion
  const livePreview = useMemo(() => {
    if (activePreview !== 'preview') return null;
    return expandWikitextTemplates(content, existingPageSlugs, {
      pageTitle: page?.title || slug.replace(/_/g, ' '),
      pageSlug: slug,
      namespace: page?.namespace,
      totalPages: existingPageSlugs.size,
      disabledExtensions: disabledExtensionIds,
    });
  }, [
    content,
    activePreview,
    existingPageSlugs,
    page?.title,
    page?.namespace,
    slug,
    liveTemplates,
    disabledExtensionIds,
  ]);

  const filteredTemplates = useMemo(() => {
    const q = templateSearch.trim().toLowerCase();
    if (!q) return liveTemplates;
    return liveTemplates.filter(
      t =>
        t.name.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q)
    );
  }, [liveTemplates, templateSearch]);

  const availableCategoriesForDrawer = useMemo(() => {
    const byKey = new Map<string, { name: string; kind: 'article' | 'page'; summary: string }>();

    for (const def of DEFAULT_CATEGORY_DEFINITIONS) {
      byKey.set(def.name.toLowerCase(), {
        name: def.name,
        kind: def.kind,
        summary: def.summary,
      });
    }

    existingPageSlugs.forEach(s => {
      const m = s.match(/^(?:Categoria|Category):(.+)$/i);
      if (m) {
        const name = m[1].replace(/_/g, ' ').trim();
        if (name && !byKey.has(name.toLowerCase())) {
          byKey.set(name.toLowerCase(), {
            name,
            kind: 'article',
            summary: 'Categoria personalizada da wiki',
          });
        }
      }
    });

    const q = categoryDrawerSearch.trim().toLowerCase();
    return Array.from(byKey.values())
      .filter(cat => {
        if (categoryDrawerKind !== 'all' && cat.kind !== categoryDrawerKind) return false;
        if (q) {
          return (
            cat.name.toLowerCase().includes(q) ||
            cat.summary.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
  }, [existingPageSlugs, categoryDrawerSearch, categoryDrawerKind]);

  const selectedTemplate = useMemo<TemplateCatalogEntry | null>(() => {
    return (
      liveTemplates.find(t => t.slug === selectedTemplateSlug) ||
      filteredTemplates[0] ||
      liveTemplates[0] ||
      null
    );
  }, [liveTemplates, filteredTemplates, selectedTemplateSlug]);

  const buildTemplateCallSyntax = (): string => {
    if (!selectedTemplate) return '';
    return buildTemplateInvocation(
      selectedTemplate.name,
      templateParamValues,
      selectedTemplate.params,
      templateUseSubst
    );
  };

  const renderedTemplateCallPreview = useMemo(() => {
    if (!showTemplateModal || templateModalTab !== 'use' || !selectedTemplate) return '';
    const call = buildTemplateInvocation(
      selectedTemplate.name,
      templateParamValues,
      selectedTemplate.params,
      false
    );
    return expandWikitextTemplates(call, existingPageSlugs, {
      pageTitle: page?.title || slug.replace(/_/g, ' '),
      pageSlug: slug,
      namespace: page?.namespace,
    }).html;
  }, [showTemplateModal, templateModalTab, selectedTemplate, templateParamValues, existingPageSlugs, page?.title, page?.namespace, slug, liveTemplates]);

  const newTemplateValidation = useMemo(() => {
    if (!showTemplateModal || templateModalTab !== 'create') return null;
    return validateTemplate(newTemplateName, newTemplateBody);
  }, [showTemplateModal, templateModalTab, newTemplateName, newTemplateBody]);

  const handleInsertTemplate = () => {
    const snippet = buildTemplateCallSyntax();
    if (!snippet) return;
    insertRawText(snippet + '\n');
    setShowTemplateModal(false);
  };

  const handleSaveCustomTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setTemplateFeedback(null);
    setIsSavingTemplate(true);
    try {
      const saved = await saveTemplate({
        name: newTemplateName,
        content: newTemplateBody,
        summary: newTemplateSummary,
        user: currentUser,
      });
      setSelectedTemplateSlug(saved.slug);
      setTemplateParamValues({});
      setTemplateModalTab('use');
      setTemplateFeedback({
        type: 'success',
        msg: `Predefinição "${saved.title}" salva no Firestore e pronta para reutilização!`,
      });
    } catch (err: unknown) {
      setTemplateFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Erro ao salvar predefinição no Firestore.',
      });
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleEditSelectedTemplateInModal = (tpl: TemplateCatalogEntry) => {
    setNewTemplateName(tpl.name);
    setNewTemplateSummary(tpl.summary);
    setNewTemplateBody(tpl.content);
    setTemplateFeedback(null);
    setTemplateModalTab('create');
  };

  const handleDeleteCustomTemplate = async (tpl: TemplateCatalogEntry) => {
    if (!isBureaucrat) return;
    setTemplateFeedback(null);
    try {
      await deleteTemplate(tpl.slug, isBureaucrat);
      setTemplateFeedback({
        type: 'success',
        msg: `Predefinição "${tpl.title}" removida do Firestore.`,
      });
    } catch (err: unknown) {
      setTemplateFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Erro ao remover predefinição.',
      });
    }
  };

  // Computed diff preview
  const diffRows = useMemo(() => {
    if (activePreview !== 'diff') return [];
    const originalText = page?.content || '';
    return computeRevisionDiff(originalText, content);
  }, [page?.content, content, activePreview]);

  // Apply rich formatting when Formatted pane is active, or insert wikitext snippet in Code pane
  const applyFormattedCommand = (command: string, value?: string): boolean => {
    if (
      effectiveEditorLayout === 'code' ||
      formattedPaneMode !== 'editable' ||
      (effectiveEditorLayout === 'split' && lastFocusedPaneRef.current !== 'formatted')
    ) {
      return false;
    }
    const el = formattedEditorRef.current;
    if (!el) return false;
    el.focus();
    document.execCommand(command, false, value);
    handleFormattedPaneInput();
    return true;
  };

  // Insert wikitext snippets
  const insertSyntax = (before: string, after: string = '', defaultPlaceholder = '') => {
    if (
      effectiveEditorLayout === 'formatted' ||
      (effectiveEditorLayout === 'split' &&
        formattedPaneMode === 'editable' &&
        lastFocusedPaneRef.current === 'formatted')
    ) {
      if (before === "'''") {
        if (applyFormattedCommand('bold')) return;
      } else if (before === "''") {
        if (applyFormattedCommand('italic')) return;
      } else if (before === '<u>') {
        if (applyFormattedCommand('underline')) return;
      } else if (before === '<s>') {
        if (applyFormattedCommand('strikeThrough')) return;
      } else if (before.includes('== ')) {
        const lvl = before.includes('===') ? 'H3' : 'H2';
        if (applyFormattedCommand('formatBlock', lvl)) return;
      } else if (before.includes('* ')) {
        if (applyFormattedCommand('insertUnorderedList')) return;
      } else if (before.includes('# ')) {
        if (applyFormattedCommand('insertOrderedList')) return;
      }
    }

    const textarea = textareaRef.current;
    if (!textarea) {
      setContent(prev => prev + `${before}${defaultPlaceholder}${after}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end) || defaultPlaceholder;

    const replacement = `${before}${selected}${after}`;
    const newContent =
      textarea.value.substring(0, start) + replacement + textarea.value.substring(end);

    syncSourceRef.current = 'code';
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      );
    }, 10);
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!editPermission.allowed) return;
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
      const key = e.key.toLowerCase();
      if (key === 'b') {
        e.preventDefault();
        insertSyntax("'''", "'''", 'texto em negrito');
      } else if (key === 'i') {
        e.preventDefault();
        insertSyntax("''", "''", 'texto em itálico');
      } else if (key === 'k') {
        e.preventDefault();
        setActiveToolbarDrawer(prev => (prev === 'link' ? 'none' : 'link'));
      }
    }
  };

  const quickLinkSuggestions = useMemo(() => {
    if (activeToolbarDrawer !== 'link' || quickLinkType !== 'internal') return [];
    const q = quickLinkTarget.trim().toLowerCase();
    const all = Array.from(existingPageSlugs);
    if (!q) return all.slice(0, 6);
    return all.filter(s => s.toLowerCase().includes(q) || s.replace(/_/g, ' ').toLowerCase().includes(q)).slice(0, 6);
  }, [activeToolbarDrawer, quickLinkType, quickLinkTarget, existingPageSlugs]);

  const builtQuickLinkSyntax = useMemo(() => {
    const target = quickLinkTarget.trim();
    const label = quickLinkLabel.trim();
    if (quickLinkType === 'internal') {
      const safeTarget = target || 'Página_principal';
      return label && label !== safeTarget.replace(/_/g, ' ')
        ? `[[${safeTarget}|${label}]]`
        : `[[${safeTarget}]]`;
    }
    const safeUrl = target || 'https://wikiwazzimagiygg.wazzimagiygg.com';
    return label ? `[${safeUrl} ${label}]` : `[${safeUrl} Título do Link]`;
  }, [quickLinkType, quickLinkTarget, quickLinkLabel]);

  const builtQuickTableSyntax = useMemo(() => {
    const cols = Math.max(1, Math.min(8, quickTableCols));
    const rows = Math.max(1, Math.min(10, quickTableRows));
    const lines: string[] = ['{| class="wikitable" style="width:100%; text-align:left;"'];
    if (quickTableCaption.trim()) {
      lines.push(`|+ ${quickTableCaption.trim()}`);
    }
    if (quickTableHeader) {
      const headers = Array.from({ length: cols }, (_, i) => `Coluna ${i + 1}`).join(' !! ');
      lines.push(`! ${headers}`);
    }
    for (let r = 0; r < rows; r++) {
      lines.push('|-');
      const cells = Array.from({ length: cols }, (_, c) => `Célula ${r + 1}.${c + 1}`).join(' || ');
      lines.push(`| ${cells}`);
    }
    lines.push('|}');
    return lines.join('\n') + '\n';
  }, [quickTableRows, quickTableCols, quickTableHeader, quickTableCaption]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.isAnonymous) {
      setErrorMessage('Contribuições não são permitidas sem login. Por favor, entre com sua conta para poder publicar alterações.');
      return;
    }
    if (!editPermission.allowed) {
      setErrorMessage(`Operação bloqueada: ${editPermission.reason}`);
      return;
    }
    if (!content.trim()) {
      setErrorMessage('O conteúdo da página não pode estar vazio.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const pageTitle = page?.title || slug.replace(/_/g, ' ');
      const expandedContent = expandSubstInWikitext(content, pageTitle);
      if (expandedContent !== content) {
        setContent(expandedContent);
      }
      const saved = await savePage({
        slug,
        title: pageTitle,
        content: expandedContent,
        summary: summary || (page ? 'Edição de conteúdo' : 'Criação inicial da página'),
        author: currentUser.username,
        authorId: currentUser.uid,
        minorEdit: isMinor,
        user: currentUser,
      });

      onSaved(saved);
    } catch (err: any) {
      console.error('Error saving wiki page:', err);
      setErrorMessage('Erro ao salvar no Firestore: ' + (err.message || String(err)));
    } finally {
      setIsSaving(false);
    }
  };

  const presetSummaries = [
    'correção ortográfica',
    'atualização técnica',
    'nova seção',
    'formatação de wikitexto',
    'adição de referências',
  ];

  return (
    <div className="py-2">
      {/* Title */}
      <div className="border-b border-[#a2a9b1] dark:border-gray-700 pb-2 mb-3">
        <h1 className="text-2xl font-serif text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>{editPermission.allowed ? 'A editar' : 'A ver o código-fonte de'}</span>
          <span className="font-bold underline decoration-blue-500">{page?.title || slug.replace(/_/g, ' ')}</span>
          {!editPermission.allowed && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded font-sans font-semibold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800">
              <Lock className="w-3 h-3" />
              <span>Protegida</span>
            </span>
          )}
        </h1>
        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
          {editPermission.allowed
            ? `As alterações serão gravadas na coleção /wiki_pages/${slug} do Firestore com controle de revisões.`
            : `Esta página possui restrições de edição ativas. O código-fonte abaixo está em modo somente leitura.`}
        </div>
      </div>

      {/* Page Protection Alert for Unauthorized Users */}
      {!editPermission.allowed && (
        <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded text-xs text-red-900 dark:text-red-200 flex items-start justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <Lock className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-sm">Esta página está protegida contra alterações</div>
              <p className="text-[11px] mt-1 text-red-800 dark:text-red-300">
                {page?.protectionReason || editPermission.reason || 'Esta página foi protegida pela administração comunitária.'}
              </p>
              <p className="text-[11px] mt-1 text-gray-600 dark:text-gray-400">
                Você pode visualizar e copiar o código-fonte deste artigo abaixo, mas não possui permissões para gravá-lo no Firestore.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopySource}
            className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 rounded font-medium text-xs flex items-center gap-1.5 shrink-0 hover:bg-red-50 dark:hover:bg-red-900/40 cursor-pointer shadow-2xs"
          >
            {copiedSource ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSource ? 'Copiado!' : 'Copiar código-fonte'}</span>
          </button>
        </div>
      )}

      {/* Advisory Banner for Privileged Users Editing a Protected Page */}
      {editPermission.allowed && editPermission.isProtected && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <span className="font-semibold">Modo Administrativo:</span> Você está editando uma página protegida ({editPermission.level === 'locked' ? 'Bloqueada' : 'Semiprotegida'}).
            {page?.protectionReason && ` Motivo: "${page.protectionReason}".`}
          </div>
        </div>
      )}

      {currentUser.isAnonymous && (
        <div className="mb-4 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded text-xs text-amber-900 dark:text-amber-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-sm">Login obrigatório para contribuir</div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                O WikiWazzimaGiygg não permite edições sem login. Você pode redigir e pré-visualizar, mas precisará entrar com sua conta Google para publicar.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={loginWithGoogle}
            className="px-3.5 py-1.5 bg-[#3366cc] hover:bg-[#254b99] text-white rounded font-medium text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Entrar com Google</span>
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      {/* Editor Layout Mode Switcher (Code | Side-by-Side | Formatted) */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5 bg-[#eaecf0] dark:bg-gray-800/90 border border-[#a2a9b1] dark:border-gray-700 rounded text-xs">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 mr-1">
            Modo de Edição:
          </span>
          <button
            type="button"
            onClick={() => setEditorLayout('code')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors ${
              effectiveEditorLayout === 'code'
                ? 'bg-[#3366cc] text-white shadow-2xs'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Código</span>
          </button>

          {extVisualEditor && (
            <>
              <button
                type="button"
                onClick={() => setEditorLayout('split')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                  effectiveEditorLayout === 'split'
                    ? 'bg-[#3366cc] text-white shadow-2xs'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Exibir código wikitexto à esquerda e edição formatada à direita simultaneamente"
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span>Lado a Lado (Código + Formatado)</span>
              </button>

              <button
                type="button"
                onClick={() => setEditorLayout('formatted')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                  effectiveEditorLayout === 'formatted'
                    ? 'bg-[#3366cc] text-white shadow-2xs'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Editar diretamente no formato visual rico"
              >
                <Type className="w-3.5 h-3.5" />
                <span>Formatado</span>
              </button>
            </>
          )}
        </div>

        <span className="text-[10px] text-gray-500 dark:text-gray-400">
          {effectiveEditorLayout === 'split'
            ? 'Edite no código ou no texto formatado com sincronização instantânea'
            : effectiveEditorLayout === 'formatted'
            ? 'Edição visual formatada sincronizada com o wikitexto'
            : 'Edição pura em código-fonte wikitexto'}
        </span>
      </div>

      {/* Visual Wikitext Editor Toolbar (guarded by wiki-editor extension) */}
      {extWikiEditor && (
      <div className="bg-[#f8f9fa] dark:bg-gray-800 border border-[#a2a9b1] dark:border-gray-700 rounded-t text-xs divide-y divide-gray-200 dark:divide-gray-700">
        {/* Row 1: Text Formatting & Document Structure */}
        <div className="flex flex-wrap items-center gap-1 px-2 py-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mr-1 hidden sm:inline">
            Texto:
          </span>

          <button
            type="button"
            disabled={!editPermission.allowed}
            onClick={() => insertSyntax("'''", "'''", 'texto em negrito')}
            className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 disabled:opacity-40 cursor-pointer font-medium"
            title="Negrito (Ctrl+B) — envolve em '''texto'''"
          >
            <Bold className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Negrito</span>
          </button>

          <button
            type="button"
            disabled={!editPermission.allowed}
            onClick={() => insertSyntax("''", "''", 'texto em itálico')}
            className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 disabled:opacity-40 cursor-pointer font-medium"
            title="Itálico (Ctrl+I) — envolve em ''texto''"
          >
            <Italic className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Itálico</span>
          </button>

          <button
            type="button"
            disabled={!editPermission.allowed}
            onClick={() => insertSyntax('<u>', '</u>', 'texto sublinhado')}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 cursor-pointer"
            title="Sublinhado (<u>...</u>)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            disabled={!editPermission.allowed}
            onClick={() => insertSyntax('<s>', '</s>', 'texto riscado')}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 cursor-pointer"
            title="Tachado (<s>...</s>)"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            disabled={!editPermission.allowed}
            onClick={() => insertSyntax('`', '`', 'código')}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 cursor-pointer"
            title="Código inline (`...`)"
          >
            <Terminal className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1" />

          <button
            type="button"
            disabled={!editPermission.allowed}
            onClick={() => insertSyntax('\n== ', ' ==\n', 'Título da Seção')}
            className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 disabled:opacity-40 cursor-pointer font-medium"
            title="Cabeçalho de Seção H2 (== ==)"
          >
            <Heading2 className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Seção</span>
          </button>

          <button
            type="button"
            disabled={!editPermission.allowed}
            onClick={() => insertSyntax('\n=== ', ' ===\n', 'Subseção')}
            className="inline-flex items-center gap-1 px-1.5 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 cursor-pointer"
            title="Subseção H3 (=== ===)"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            disabled={!editPermission.allowed}
            onClick={() => insertSyntax('\n* ', '', 'Item da lista')}
            className="inline-flex items-center gap-1 px-1.5 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 cursor-pointer"
            title="Lista com marcadores (*)"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Lista</span>
          </button>

          <button
            type="button"
            disabled={!editPermission.allowed}
            onClick={() => insertSyntax('\n# ', '', 'Item numerado')}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 cursor-pointer"
            title="Lista numerada (#)"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            disabled={!editPermission.allowed}
            onClick={() => insertSyntax('{{Citação|', '|Autor|Fonte}}', 'Texto da citação')}
            className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 cursor-pointer"
            title="Bloco de citação ({{Citação|...}})"
          >
            <Quote className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Citação</span>
          </button>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                setActiveToolbarDrawer(prev => (prev === 'cheatsheet' ? 'none' : 'cheatsheet'))
              }
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium cursor-pointer border transition-colors ${
                activeToolbarDrawer === 'cheatsheet'
                  ? 'bg-blue-100 dark:bg-blue-950/70 text-[#0645ad] dark:text-[#6ba4ff] border-blue-300 dark:border-blue-700'
                  : 'bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
              }`}
              title="Mostrar guia rápido de sintaxe wikitexto para novos editores"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Guia Rápido</span>
            </button>
          </div>
        </div>

        {/* Row 2: Links, Tables, References, Templates & Media */}
        <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 bg-gray-50/70 dark:bg-gray-800/80">
          <button
            type="button"
            disabled={!editPermission.allowed}
            onClick={() => setActiveToolbarDrawer(prev => (prev === 'link' ? 'none' : 'link'))}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium cursor-pointer disabled:opacity-40 transition-colors ${
              activeToolbarDrawer === 'link'
                ? 'bg-blue-100 dark:bg-blue-950/70 text-[#0645ad] dark:text-[#6ba4ff] border-blue-400 dark:border-blue-700'
                : 'bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600'
            }`}
            title="Construtor de Link Interno ou Externo (Ctrl+K)"
          >
            <Link className="w-3.5 h-3.5 text-[#0645ad] dark:text-[#6ba4ff]" />
            <span>Link</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {extWikitable && (
            <button
              type="button"
              disabled={!editPermission.allowed}
              onClick={() => setActiveToolbarDrawer(prev => (prev === 'table' ? 'none' : 'table'))}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium cursor-pointer disabled:opacity-40 transition-colors ${
                activeToolbarDrawer === 'table'
                  ? 'bg-blue-100 dark:bg-blue-950/70 text-[#0645ad] dark:text-[#6ba4ff] border-blue-400 dark:border-blue-700'
                  : 'bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600'
              }`}
              title="Construtor visual de tabela wikitexto ({| class=&quot;wikitable&quot; |})"
            >
              <Table className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Tabela</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>
          )}

          <button
            type="button"
            disabled={!editPermission.allowed}
            onClick={() =>
              setActiveToolbarDrawer(prev => (prev === 'categories' ? 'none' : 'categories'))
            }
            className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium cursor-pointer disabled:opacity-40 transition-colors ${
              activeToolbarDrawer === 'categories'
                ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 border-emerald-400 dark:border-emerald-700'
                : 'bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600'
            }`}
            title="Selecionar ou inserir Categorias de Artigos e Páginas ([[Categoria:...]])"
          >
            <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Categoria</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {extCite && (
            <>
              <button
                type="button"
                disabled={!editPermission.allowed}
                onClick={() => insertSyntax('<ref>', '</ref>', 'Referência bibliográfica ou link')}
                className="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-serif font-bold text-xs disabled:opacity-40 cursor-pointer"
                title="Inserir nota de rodapé (<ref>...</ref>)"
              >
                [ref]
              </button>

              <button
                type="button"
                disabled={!editPermission.allowed}
                onClick={() => insertSyntax('\n== Referências ==\n<references />\n')}
                className="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-mono text-[11px] disabled:opacity-40 cursor-pointer"
                title="Inserir lista de referências (<references />)"
              >
                &lt;refs/&gt;
              </button>
            </>
          )}

          {extSyntaxHighlight && (
            <button
              type="button"
              disabled={!editPermission.allowed}
              onClick={() =>
                insertSyntax('<syntaxhighlight lang="typescript">\n', '\n</syntaxhighlight>', '// Código aqui')
              }
              className="inline-flex items-center gap-1 px-1.5 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 cursor-pointer"
              title="Bloco de código formatado (<syntaxhighlight>)"
            >
              <Code className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Código</span>
            </button>
          )}

          <button
            type="button"
            disabled={!editPermission.allowed}
            onClick={() => insertSyntax('<nowiki>', '</nowiki>', 'texto literal')}
            className="px-1.5 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-mono text-[11px] disabled:opacity-40 cursor-pointer"
            title="Texto sem formatação wiki (<nowiki>)"
          >
            &lt;nowiki&gt;
          </button>

          {extSignatures && (
            <button
              type="button"
              disabled={!editPermission.allowed}
              onClick={() => insertSyntax('--~~~~')}
              className="px-1.5 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-mono text-[11px] disabled:opacity-40 cursor-pointer"
              title="Assinatura com data (--~~~~)"
            >
              --~~~~
            </button>
          )}

          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1" />

          {editPermission.allowed && (
            <>
              {extTemplates && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(true)}
                    className="px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 font-medium text-xs cursor-pointer transition-colors"
                    title="Abrir Assistente Completo de Predefinições ({{Nome}})"
                  >
                    <Braces className="w-3.5 h-3.5" />
                    <span>Predefinições</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveToolbarDrawer(prev => (prev === 'templates' ? 'none' : 'templates'))
                    }
                    className={`px-2 py-1 rounded border text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                      activeToolbarDrawer === 'templates'
                        ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-200 border-indigo-400'
                        : 'bg-white dark:bg-gray-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                    }`}
                    title="Barra de inserção rápida das predefinições mais usadas"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span className="hidden sm:inline">Atalhos {'{{}}'}</span>
                  </button>
                </>
              )}

              {extScribunto && (
                <button
                  type="button"
                  onClick={() => setShowInfoboxModal(true)}
                  className="px-2 py-1 rounded bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1 font-medium text-xs cursor-pointer transition-colors"
                  title="Inserir caixa {{Infobox software}} ou {{Infobox usuário}}"
                >
                  <PanelRight className="w-3.5 h-3.5" />
                  <span>Infobox</span>
                </button>
              )}
            </>
          )}

          {extUploadWizard && (
            <button
              type="button"
              disabled={!editPermission.allowed}
              onClick={() => setShowImageModal(true)}
              className={`px-2 py-1 rounded flex items-center gap-1.5 cursor-pointer transition-colors text-xs font-medium disabled:opacity-40 ${
                isBlazePlanActive
                  ? 'bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-[#0645ad] dark:text-[#6ba4ff] border border-blue-200 dark:border-blue-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
              }`}
              title="Inserir ou carregar imagem no artigo"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Imagem</span>
              {isBlazePlanActive ? (
                <span className="hidden xl:flex items-center gap-0.5 text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 font-semibold">
                  <Flame className="w-2.5 h-2.5 text-emerald-600" />
                  Blaze ON
                </span>
              ) : (
                <span className="hidden xl:flex items-center gap-0.5 text-[9px] px-1 py-0.2 rounded bg-amber-200 text-amber-900 dark:bg-amber-900/80 dark:text-amber-200 font-semibold">
                  <Flame className="w-2.5 h-2.5 text-amber-600" />
                  Blaze OFF
                </span>
              )}
            </button>
          )}

          {editPermission.allowed && extGoogleSearch && (
            <button
              type="button"
              onClick={() => setShowResearchPanel(prev => !prev)}
              className={`px-2 py-1 rounded flex items-center gap-1.5 cursor-pointer transition-colors text-xs font-medium border ${
                showResearchPanel
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-400 dark:border-emerald-700'
                  : 'bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'
              }`}
              title="Buscar fatos atualizados e referências no Google Search"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden md:inline">Fontes Google</span>
            </button>
          )}
        </div>

        {/* Interactive Drawer 1: Quick Link Builder */}
        {activeToolbarDrawer === 'link' && editPermission.allowed && (
          <div className="p-3 bg-blue-50/70 dark:bg-blue-950/25 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                <Link className="w-3.5 h-3.5 text-[#0645ad] dark:text-[#6ba4ff]" />
                <span>Inserir Link Wikitexto</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setQuickLinkType('internal')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer border ${
                    quickLinkType === 'internal'
                      ? 'bg-[#3366cc] text-white border-[#3366cc]'
                      : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700'
                  }`}
                >
                  Link Interno ([[Página]])
                </button>
                <button
                  type="button"
                  onClick={() => setQuickLinkType('external')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer border ${
                    quickLinkType === 'external'
                      ? 'bg-[#3366cc] text-white border-[#3366cc]'
                      : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700'
                  }`}
                >
                  Link Externo ([https://...])
                </button>
                <button
                  type="button"
                  onClick={() => setActiveToolbarDrawer('none')}
                  className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                  {quickLinkType === 'internal' ? 'Nome ou Slug da Página no Wiki' : 'URL Externa Completa'}
                </label>
                <input
                  type="text"
                  value={quickLinkTarget}
                  onChange={e => setQuickLinkTarget(e.target.value)}
                  placeholder={
                    quickLinkType === 'internal'
                      ? 'Ex: Ajuda:Predefinições ou Página_principal'
                      : 'https://exemplo.com.br/artigo'
                  }
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                  Texto Exibido ao Leitor (opcional)
                </label>
                <input
                  type="text"
                  value={quickLinkLabel}
                  onChange={e => setQuickLinkLabel(e.target.value)}
                  placeholder="Ex: leia mais neste guia"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-xs"
                />
              </div>
            </div>

            {quickLinkType === 'internal' && quickLinkSuggestions.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[10px] text-gray-500">Sugestões existentes:</span>
                {quickLinkSuggestions.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQuickLinkTarget(s)}
                    className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800 text-[10px] text-[#0645ad] dark:text-[#6ba4ff] hover:bg-blue-100 dark:hover:bg-blue-900/40 cursor-pointer"
                  >
                    {s.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <code className="px-2 py-1 rounded bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-mono text-[11px] text-gray-800 dark:text-gray-200">
                {builtQuickLinkSyntax}
              </code>
              <button
                type="button"
                onClick={() => {
                  insertRawText(builtQuickLinkSyntax);
                  setQuickLinkTarget('');
                  setQuickLinkLabel('');
                  setActiveToolbarDrawer('none');
                }}
                className="px-3 py-1.5 bg-[#3366cc] hover:bg-[#254b99] text-white rounded font-medium text-xs flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Inserir Link</span>
              </button>
            </div>
          </div>
        )}

        {/* Interactive Drawer 2: Quick Table Builder */}
        {activeToolbarDrawer === 'table' && editPermission.allowed && (
          <div className="p-3 bg-teal-50/60 dark:bg-teal-950/20 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Construtor Visual de Tabela Wikitexto</span>
              </span>
              <button
                type="button"
                onClick={() => setActiveToolbarDrawer('none')}
                className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
              <div>
                <label className="block text-[11px] font-medium mb-0.5">Linhas de dados</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={quickTableRows}
                  onChange={e => setQuickTableRows(Number(e.target.value) || 2)}
                  className="w-full px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium mb-0.5">Colunas</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={quickTableCols}
                  onChange={e => setQuickTableCols(Number(e.target.value) || 2)}
                  className="w-full px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium mb-0.5">Legenda (opcional)</label>
                <input
                  type="text"
                  value={quickTableCaption}
                  onChange={e => setQuickTableCaption(e.target.value)}
                  placeholder="Título da tabela"
                  className="w-full px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-xs"
                />
              </div>
              <label className="inline-flex items-center gap-1.5 py-1.5 cursor-pointer text-[11px]">
                <input
                  type="checkbox"
                  checked={quickTableHeader}
                  onChange={e => setQuickTableHeader(e.target.checked)}
                  className="rounded border-gray-300 text-teal-600"
                />
                <span>Linha de cabeçalho (!)</span>
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <pre className="flex-1 min-w-[220px] p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded font-mono text-[10px] text-gray-700 dark:text-gray-300 overflow-x-auto max-h-24">
                {builtQuickTableSyntax}
              </pre>
              <button
                type="button"
                onClick={() => {
                  insertRawText('\n' + builtQuickTableSyntax);
                  setActiveToolbarDrawer('none');
                }}
                className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded font-medium text-xs flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Inserir Tabela</span>
              </button>
            </div>
          </div>
        )}

        {/* Interactive Drawer 3: Quick One-Click Templates Strip */}
        {activeToolbarDrawer === 'templates' && editPermission.allowed && (
          <div className="p-2.5 bg-indigo-50/70 dark:bg-indigo-950/25 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5 text-[11px]">
                <Braces className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Inserção Rápida de Pré-definições (1 clique):</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveToolbarDrawer('none');
                    setShowTemplateModal(true);
                  }}
                  className="text-[11px] text-indigo-700 dark:text-indigo-300 hover:underline font-medium cursor-pointer"
                >
                  Abrir Assistente Completo →
                </button>
                <button
                  type="button"
                  onClick={() => setActiveToolbarDrawer('none')}
                  className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto">
              {[
                { label: '{{Info/Biografia}}', code: '{{Info/Biografia|nome=|imagem=|nascimento_data=|nascimento_local=|nacionalidade=|ocupacao=|obras_principais=}}\n' },
                { label: '{{Info/País}}', code: '{{Info/País|nome=|capital=|lingua_oficial=|populacao=|area_total=|moeda=|governo=}}\n' },
                { label: '{{Info/Município}}', code: '{{Info/Município|nome=|pais=|estado=|fundacao=|populacao=|area_total=|site=}}\n' },
                { label: '{{Info/Empresa}}', code: '{{Info/Empresa|nome=|tipo=|fundacao=|sede=|industria=|site=}}\n' },
                { label: '{{Info/Livro}}', code: '{{Info/Livro|nome=|autor=|idioma=|genero=|editora=|lancamento=|paginas=|isbn=}}\n' },
                { label: '{{Info/Filme}}', code: '{{Info/Filme|nome=|diretor=|genero=|lancamento=|duracao=|idioma=|pais=}}\n' },
                { label: '{{Info/Jogo}}', code: '{{Info/Jogo|nome=|desenvolvedora=|publicadora=|plataformas=|lancamento=|genero=|modos=}}\n' },
                { label: '{{Info/Evento}}', code: '{{Info/Evento|nome=|data=|local=|tipo=|participantes=|resultado=}}\n' },
                { label: '{{Citar_web}}', code: '<ref>{{Citar_web|url=https://|título=|autor=|obra=|data=|acessodata=}}</ref>' },
                { label: '{{Citar_livro}}', code: '<ref>{{Citar_livro|autor=|título=|editora=|ano=|local=|isbn=}}</ref>' },
                { label: '{{Citar_jornal}}', code: '<ref>{{Citar_jornal|autor=|título=|jornal=|data=|url=|acessodata=}}</ref>' },
                { label: '{{Citar_periódico}}', code: '<ref>{{Citar_periódico|autor=|título=|periódico=|volume=|ano=|doi=}}</ref>' },
                { label: '{{Citar_lei}}', code: '<ref>{{Citar_lei|jurisdição=Brasil|número=|data=|ementa=|url=}}</ref>' },
                { label: '{{Citar_jogo}}', code: '<ref>{{Citar_jogo|título=|desenvolvedora=|ano=|plataforma=}}</ref>' },
                { label: '{{Referências}}', code: '\n== Referências ==\n{{Referências}}\n' },
                { label: '{{ISBN}}', code: '{{ISBN|978-85-00000-00-0}}' },
                { label: '{{DOI}}', code: '{{DOI|10.1000/182}}' },
                { label: '{{Wayback}}', code: '{{Wayback|url=https://|date=20261127}}' },
                { label: '{{Sem_fonte}}', code: '{{Sem_fonte|data=Novembro de 2026}}' },
                { label: '{{Quando}}', code: '{{Quando}}' },
                { label: '{{Quem}}', code: '{{Quem}}' },
                { label: '{{Aviso}}', code: '{{Aviso|título=Observação|texto=Mensagem importante aqui.}}\n' },
                { label: '{{Info}}', code: '{{Info|título=Informação|texto=Detalhe técnico complementar.}}\n' },
                { label: '{{Nota}}', code: '{{Nota|tipo=dica|título=Dica|texto=Sugestão útil ao leitor.}}\n' },
                { label: '{{Atenção}}', code: '{{Atenção|título=Atenção|texto=Aviso crítico de segurança ou compatibilidade.}}\n' },
                { label: '{{Ambox}}', code: '{{Ambox|tipo=aviso|título=Revisão|texto=Descrição da pendência editorial.|data=Novembro de 2026}}\n' },
                { label: '{{Artigo_principal}}', code: '{{Artigo_principal|Nome_do_Artigo}}\n' },
                { label: '{{Ver_também}}', code: '{{Ver_também|Artigo_1|Artigo_2}}\n' },
                { label: '{{Não_confundir}}', code: '{{Não_confundir|Outro_Artigo}}\n' },
                { label: '{{Redireciona_aqui}}', code: '{{Redireciona_aqui|Termo|Outro_Artigo}}\n' },
                { label: '{{Homônimos}}', code: '{{Homônimos|Termo}}\n' },
                { label: '{{Sobre}}', code: '{{Sobre|este tema|outro significado|Outro_Artigo}}\n' },
                { label: '{{Citação}}', code: '{{Citação|Texto citado|Autor|Fonte}}\n' },
                { label: '{{Epígrafe}}', code: '{{Epígrafe|Texto da epígrafe|Autor|Obra}}\n' },
                { label: '{{Esboço}}', code: '{{Esboço|Tema do Artigo}}\n' },
                { label: '{{Wikificar}}', code: '{{Wikificar|data=Novembro de 2026}}\n' },
                { label: '{{Carece_de_fontes}}', code: '{{Carece_de_fontes|data=Novembro de 2026}}\n' },
                { label: '{{Poucas_referências}}', code: '{{Poucas_referências|data=Novembro de 2026}}\n' },
                { label: '{{Desatualizado}}', code: '{{Desatualizado|data=Novembro de 2026}}\n' },
                { label: '{{Parcialidade}}', code: '{{Parcialidade|motivo=|data=Novembro de 2026}}\n' },
                { label: '{{Fusão}}', code: '{{Fusão|Outro_Artigo|data=Novembro de 2026}}\n' },
                { label: '{{Atualizar}}', code: '{{Atualizar|data=Novembro de 2026}}\n' },
                { label: '{{Expandir}}', code: '{{Expandir|seção=|data=Novembro de 2026}}\n' },
                { label: '{{Lang}}', code: '{{Lang|en|termo em inglês}}' },
                { label: '{{Tecla}}', code: '{{Tecla|Ctrl|B}}' },
                { label: '{{Cor}}', code: '{{Cor|#3366cc|Azul MediaWiki}}' },
                { label: '{{Data}}', code: '{{Data|27|11|2026}}' },
                { label: '{{Data_de_nascimento}}', code: '{{Data_de_nascimento|01|01|1990}}' },
                { label: '{{Moeda}}', code: '{{Moeda|1500|BRL}}' },
                { label: '{{Bandeira}}', code: '{{Bandeira|Brasil}}' },
                { label: '{{Tooltip}}', code: '{{Tooltip|sigla|Significado completo}}' },
                { label: '{{Fórmula}}', code: '{{Fórmula|E = mc²|número=1}}\n' },
                { label: '{{Ocultar}}', code: '{{Ocultar|título=Clique para expandir|conteúdo=Conteúdo oculto aqui.}}\n' },
                { label: '{{Navbox}}', code: '{{Navbox\n| título = Navegação Temática\n| grupo1 = Tópicos\n| lista1 = [[Página_principal]] • [[Ajuda:Wikitexto]]\n}}\n' },
                { label: '{{Sucessão}}', code: '{{Sucessão|título=Cargo|antes=Antecessor|período=2022–2026|depois=Sucessor}}\n' },
                { label: '{{Controle_de_autoridade}}', code: '{{Controle_de_autoridade|VIAF=|ORCID=|ISBN=}}\n' },
                { label: '{{Coordenadas}}', code: '{{Coordenadas|23° 33′ S, 46° 38′ O|local=São Paulo}}' },
                { label: '{{Atalho}}', code: '{{Atalho|Página_principal}}\n' },
                { label: '{{Sim}}', code: '{{Sim}}' },
                { label: '{{Não}}', code: '{{Não}}' },
                { label: '{{Parcial}}', code: '{{Parcial}}' },
                { label: '{{Apoio}}', code: '{{Apoio}}' },
                { label: '{{Contra}}', code: '{{Contra}}' },
                { label: '{{Abstenção}}', code: '{{Abstenção}}' },
                { label: '{{Concordo}}', code: '{{Concordo}}' },
                { label: '{{Discordo}}', code: '{{Discordo}}' },
                { label: '{{Feito}}', code: '{{Feito}}' },
                { label: '{{Resolvido}}', code: '{{Resolvido}}' },
                { label: '{{Estrela}}', code: '{{Estrela|título=Reconhecimento|texto=Excelente contribuição na wiki!}}\n' },
                { label: '{{Portal}}', code: '{{Portal|Tecnologia|Privacidade}}\n' },
              ].map(item => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => insertRawText(item.code)}
                  className="px-2 py-1 rounded bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 font-mono text-[11px] text-indigo-700 dark:text-indigo-300 cursor-pointer shadow-2xs"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Drawer 3B: Categories Picker (Article & Wiki Page Categories) */}
        {activeToolbarDrawer === 'categories' && editPermission.allowed && (
          <div className="p-2.5 bg-emerald-50/70 dark:bg-emerald-950/20 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5 text-[11px]">
                <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Seletor de Categorias (Artigos e Páginas):</span>
              </span>
              <div className="flex items-center gap-1.5">
                {(
                  [
                    { id: 'all', label: 'Todas' },
                    { id: 'article', label: 'Artigos' },
                    { id: 'page', label: 'Páginas' },
                  ] as const
                ).map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCategoryDrawerKind(tab.id)}
                    className={`px-2 py-0.5 rounded border text-[10px] font-medium cursor-pointer transition-colors ${
                      categoryDrawerKind === tab.id
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setActiveToolbarDrawer('none')}
                  className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={categoryDrawerSearch}
                  onChange={e => setCategoryDrawerSearch(e.target.value)}
                  placeholder="Filtrar categorias existentes..."
                  className="w-full pl-7 pr-2.5 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-xs"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={categoryDrawerCustom}
                  onChange={e => setCategoryDrawerCustom(e.target.value)}
                  placeholder="Nova categoria (ex: Astronomia)"
                  className="flex-1 px-2.5 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-xs"
                />
                <button
                  type="button"
                  disabled={!categoryDrawerCustom.trim()}
                  onClick={() => {
                    const clean = cleanCategoryName(categoryDrawerCustom);
                    if (!clean) return;
                    const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '[\\s_]+');
                    const catRegex = new RegExp(`\\[\\[\\s*(?:Categoria|Category)\\s*:\\s*${escaped}\\s*(?:\\|[^\\]]*)?\\]\\]`, 'i');
                    if (!catRegex.test(content)) {
                      syncSourceRef.current = 'code';
                      setContent(prev => {
                        const prefix = prev.endsWith('\n') || prev.length === 0 ? '' : '\n';
                        return `${prev}${prefix}[[Categoria:${clean}]]`;
                      });
                    }
                    setCategoryDrawerCustom('');
                  }}
                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded text-[11px] font-medium cursor-pointer shrink-0"
                >
                  + Inserir
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-0.5">
              {availableCategoriesForDrawer.map(cat => {
                const escaped = cat.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '[\\s_]+');
                const catRegex = new RegExp(`\\[\\[\\s*(?:Categoria|Category)\\s*:\\s*${escaped}\\s*(?:\\|[^\\]]*)?\\]\\]`, 'i');
                const alreadyInContent = catRegex.test(content);
                return (
                  <button
                    key={cat.name}
                    type="button"
                    title={alreadyInContent ? `${cat.summary} (clique para remover)` : cat.summary}
                    onClick={() => {
                      syncSourceRef.current = 'code';
                      if (!alreadyInContent) {
                        setContent(prev => {
                          const prefix = prev.endsWith('\n') || prev.length === 0 ? '' : '\n';
                          return `${prev}${prefix}[[Categoria:${cat.name}]]`;
                        });
                      } else {
                        const removeRegex = new RegExp(`\\n?\\[\\[\\s*(?:Categoria|Category)\\s*:\\s*${escaped}\\s*(?:\\|[^\\]]*)?\\]\\]`, 'gi');
                        setContent(prev => prev.replace(removeRegex, '').replace(/\n{3,}/g, '\n\n').trimEnd());
                      }
                    }}
                    className={`px-2 py-1 rounded border text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors ${
                      alreadyInContent
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-white dark:bg-gray-900 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                    }`}
                  >
                    {alreadyInContent && <Check className="w-3 h-3 shrink-0" />}
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Interactive Drawer 4: Beginner Wikitext Cheat Sheet */}
        {activeToolbarDrawer === 'cheatsheet' && (
          <div className="p-2.5 bg-amber-50/70 dark:bg-amber-950/20 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-amber-950 dark:text-amber-200 text-[11px]">
                Guia Rápido de Wikitexto (clique em qualquer exemplo para inserir no texto):
              </span>
              <button
                type="button"
                onClick={() => setActiveToolbarDrawer('none')}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 text-[11px]">
              {[
                { desc: 'Negrito', syntax: "'''negrito'''", before: "'''", after: "'''", sample: 'negrito' },
                { desc: 'Itálico', syntax: "''itálico''", before: "''", after: "''", sample: 'itálico' },
                { desc: 'Link interno', syntax: '[[Página|Texto]]', before: '[[', after: '|Texto]]', sample: 'Página' },
                { desc: 'Link externo', syntax: '[https://site.com Nome]', before: '[https://', after: ' Nome]', sample: 'site.com' },
                { desc: 'Seção', syntax: '== Título ==', before: '\n== ', after: ' ==\n', sample: 'Título' },
                { desc: 'Lista', syntax: '* Item', before: '\n* ', after: '', sample: 'Item' },
                { desc: 'Nota de rodapé', syntax: '<ref>Fonte</ref>', before: '<ref>', after: '</ref>', sample: 'Fonte' },
                { desc: 'Pré-definição', syntax: '{{Nome|param}}', before: '{{', after: '|parâmetro}}', sample: 'Aviso' },
              ].map(ex => (
                <button
                  key={ex.desc}
                  type="button"
                  disabled={!editPermission.allowed}
                  onClick={() => insertSyntax(ex.before, ex.after, ex.sample)}
                  className="flex items-center justify-between gap-2 px-2 py-1 bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800/70 rounded hover:bg-amber-100/70 dark:hover:bg-amber-900/40 text-left cursor-pointer disabled:opacity-40"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-300">{ex.desc}</span>
                  <code className="font-mono text-[10px] text-[#0645ad] dark:text-[#6ba4ff]">{ex.syntax}</code>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      )}

      {/* Google Search Grounding Research Drawer */}
      {showResearchPanel && editPermission.allowed && extGoogleSearch && (
        <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border-x border-b border-[#a2a9b1] dark:border-gray-700 text-xs space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pesquisa de fontes atualizadas (Google Search)</span>
            </span>
            <button
              type="button"
              onClick={() => setShowResearchPanel(false)}
              className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <form onSubmit={handleRunResearch} className="flex flex-wrap gap-2">
            <input
              type="text"
              value={researchQuery}
              onChange={e => setResearchQuery(e.target.value)}
              placeholder="Pesquisar assunto no Google Search..."
              className="flex-1 min-w-[200px] px-2.5 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-xs"
            />
            <button
              type="submit"
              disabled={researchLoading}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded font-medium flex items-center gap-1.5 cursor-pointer"
            >
              {researchLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>{researchLoading ? 'Pesquisando...' : 'Buscar na Web'}</span>
            </button>
          </form>

          {researchError && (
            <div className="p-2 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 rounded">
              {researchError}
            </div>
          )}

          {researchResult && (
            <div className="space-y-2">
              <div className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {researchResult.answer}
              </div>
              {researchResult.sources.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                    Fontes encontradas (clique para inserir como &lt;ref&gt; no texto):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {researchResult.sources.map((src, idx) => (
                      <div
                        key={`${src.uri}-${idx}`}
                        className="inline-flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-[11px]"
                      >
                        <a
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0645ad] dark:text-[#6ba4ff] hover:underline truncate max-w-[200px]"
                          title={src.uri}
                        >
                          {src.title}
                        </a>
                        <button
                          type="button"
                          onClick={() => insertRawText(`<ref>[${src.uri} ${src.title}]</ref>`)}
                          className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950 text-[#0645ad] dark:text-[#6ba4ff] rounded border border-blue-200 dark:border-blue-800 hover:bg-blue-100 cursor-pointer font-mono text-[10px]"
                        >
                          +&lt;ref&gt;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Editor Workspace: Code Only, Side-by-Side (Code + Formatted), or Formatted Only */}
      <div
        className={`grid gap-0 border border-[#a2a9b1] dark:border-gray-700 ${
          extWikiEditor ? 'border-t-0 rounded-b' : 'rounded'
        } overflow-hidden ${
          effectiveEditorLayout === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {/* Left / Source Wikitext Code Pane */}
        {(effectiveEditorLayout === 'code' || effectiveEditorLayout === 'split') && (
          <div
            className={`flex flex-col ${
              effectiveEditorLayout === 'split'
                ? 'border-b lg:border-b-0 lg:border-r border-[#a2a9b1] dark:border-gray-700'
                : ''
            }`}
          >
            {effectiveEditorLayout === 'split' && (
              <div className="px-3 py-1.5 bg-[#f8f9fa] dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-[#0645ad] dark:text-[#6ba4ff]" />
                  <span>Edição de Código (Wikitexto)</span>
                </span>
                <span className="text-[10px] font-mono text-gray-500">
                  {content.length} caracteres
                </span>
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={content}
              onFocus={() => {
                lastFocusedPaneRef.current = 'code';
              }}
              onChange={e => {
                syncSourceRef.current = 'code';
                setContent(e.target.value);
              }}
              onKeyDown={handleTextareaKeyDown}
              rows={effectiveEditorLayout === 'split' ? 22 : 18}
              readOnly={!editPermission.allowed}
              className={`w-full flex-1 min-h-[420px] p-3 font-mono text-xs sm:text-sm resize-y leading-relaxed shadow-inner ${
                !editPermission.allowed
                  ? 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-300 cursor-not-allowed select-text'
                  : 'bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-1 focus:ring-inset focus:ring-[#3366cc]'
              }`}
              placeholder="Digite o conteúdo do artigo em wikitexto..."
            />
          </div>
        )}

        {/* Right / Formatted Rich Editing Pane */}
        {(effectiveEditorLayout === 'formatted' || effectiveEditorLayout === 'split') && (
          <div className="flex flex-col bg-white dark:bg-[#1a1f2c] min-h-[420px]">
            <div className="px-3 py-1.5 bg-[#f8f9fa] dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Edição Formatada (Visual)</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setFormattedPaneMode('editable')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium cursor-pointer border ${
                    formattedPaneMode === 'editable'
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700'
                  }`}
                >
                  Interativa
                </button>
                <button
                  type="button"
                  onClick={() => setFormattedPaneMode('preview')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium cursor-pointer border ${
                    formattedPaneMode === 'preview'
                      ? 'bg-blue-600 text-white border-blue-700'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700'
                  }`}
                >
                  Leitura Final
                </button>
              </div>
            </div>

            {formattedPaneMode === 'editable' ? (
              <div
                ref={formattedEditorRef}
                contentEditable={editPermission.allowed}
                suppressContentEditableWarning
                onFocus={() => {
                  lastFocusedPaneRef.current = 'formatted';
                }}
                onInput={handleFormattedPaneInput}
                onClick={e => {
                  const target = (e.target as HTMLElement).closest('a');
                  if (target) {
                    e.preventDefault();
                  }
                }}
                className={`mw-body-content mw-formatted-editor flex-1 p-4 overflow-y-auto max-h-[580px] text-sm leading-relaxed text-gray-800 dark:text-gray-200 focus:outline-hidden focus:ring-1 focus:ring-inset focus:ring-emerald-500 [&_h1]:text-2xl [&_h1]:font-serif [&_h1]:border-b [&_h1]:border-gray-300 [&_h1]:dark:border-gray-700 [&_h1]:pb-1 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-serif [&_h2]:border-b [&_h2]:border-gray-300 [&_h2]:dark:border-gray-700 [&_h2]:pb-1 [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-serif [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:mt-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_p]:my-2.5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-gray-100 [&_code]:dark:bg-gray-800 [&_code]:text-pink-600 [&_code]:dark:text-pink-400 [&_code]:font-mono [&_code]:text-xs ${
                  !editPermission.allowed ? 'bg-gray-50 dark:bg-gray-900 cursor-not-allowed' : ''
                }`}
              />
            ) : (
              <div className="flex-1 p-4 overflow-y-auto max-h-[580px] space-y-4">
                <div
                  className="mw-body-content leading-relaxed text-gray-800 dark:text-gray-200"
                  dangerouslySetInnerHTML={{ __html: formattedPreviewResult?.html || '' }}
                />
                {formattedPreviewResult && formattedPreviewResult.categories.length > 0 && (
                  <div className="p-2.5 bg-[#f8f9fa] dark:bg-gray-900 border border-[#a2a9b1] dark:border-gray-700 rounded text-xs flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-700 dark:text-gray-300">
                    <span className="font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1 tabular-nums">
                      <Tag className="w-3 h-3" />
                      <span>
                        {formattedPreviewResult.categories.length === 1
                          ? 'Categoria:'
                          : `Categorias (${formattedPreviewResult.categories.length}):`}
                      </span>
                    </span>
                    {formattedPreviewResult.categories.map((cat, idx) => (
                      <React.Fragment key={cat}>
                        {idx > 0 && <span className="text-gray-400" aria-hidden="true">|</span>}
                        <span className="text-[#0645ad] dark:text-[#6ba4ff]">{cat}</span>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Summary & Options Box */}
      <div className="mt-3 p-3 bg-[#f8f9fa] dark:bg-gray-900 border border-[#a2a9b1] dark:border-gray-700 rounded text-xs space-y-3">
        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
            Resumo da edição (descreva brevemente o que foi alterado):
          </label>
          <input
            type="text"
            value={summary}
            onChange={e => setSummary(e.target.value)}
            disabled={!editPermission.allowed}
            placeholder={
              !editPermission.allowed
                ? 'Página protegida contra edições'
                : 'Ex: correção ortográfica, adição de fontes, atualização técnica...'
            }
            maxLength={250}
            className="w-full p-2 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded text-xs disabled:opacity-50"
          />

          {/* Quick preset buttons */}
          {editPermission.allowed && (
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className="text-[11px] text-gray-500">Resumos rápidos:</span>
              {presetSummaries.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSummary(prev => (prev ? `${prev}, ${preset}` : preset))}
                  className="px-2 py-0.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded text-[11px] text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  +{preset}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Checkboxes */}
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={isMinor}
              disabled={!editPermission.allowed}
              onChange={e => setIsMinor(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
            />
            <span>Esta é uma edição menor</span>
          </label>

          <span className="text-gray-400">|</span>

          <span className="text-gray-500">
            A editar como: <strong className="text-gray-800 dark:text-gray-200">{currentUser.username}</strong>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-2">
          {!editPermission.allowed ? (
            <button
              type="button"
              disabled
              className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium rounded flex items-center gap-1.5 shadow-2xs cursor-not-allowed border border-gray-300 dark:border-gray-700"
              title={editPermission.reason || 'Edição bloqueada'}
            >
              <Lock className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span>Código-fonte protegido (Somente leitura)</span>
            </button>
          ) : currentUser.isAnonymous ? (
            <button
              type="button"
              onClick={loginWithGoogle}
              className="px-4 py-2 bg-[#3366cc] hover:bg-[#254b99] text-white font-medium rounded flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              title="Faça login com sua conta para poder publicar alterações"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar com Google para publicar</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="px-4 py-2 bg-[#3366cc] hover:bg-[#254b99] text-white font-medium rounded flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'A publicar...' : 'Publicar alterações'}</span>
            </button>
          )}

          {!editPermission.allowed && (
            <button
              type="button"
              onClick={handleCopySource}
              className="px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded font-medium flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              {copiedSource ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSource ? 'Código copiado!' : 'Copiar todo o código-fonte'}</span>
            </button>
          )}

          {extLiveDiff && (
            <>
              <button
                type="button"
                onClick={() => setActivePreview(prev => (prev === 'preview' ? 'none' : 'preview'))}
                className={`px-3 py-2 border rounded font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activePreview === 'preview'
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{activePreview === 'preview' ? 'Ocultar previsão' : 'Mostrar previsão'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePreview(prev => (prev === 'diff' ? 'none' : 'diff'))}
                className={`px-3 py-2 border rounded font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activePreview === 'diff'
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <FileDiff className="w-3.5 h-3.5" />
                <span>{activePreview === 'diff' ? 'Ocultar alterações' : 'Mostrar alterações (Diff)'}</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 ml-auto cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Live Preview Section */}
      {activePreview === 'preview' && livePreview && (
        <div className="mt-6 p-4 rounded border-2 border-dashed border-[#3366cc]/40 bg-white dark:bg-gray-900 shadow-sm">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>Previsão do Artigo (Esta é apenas uma pré-visualização; as alterações ainda não foram gravadas!)</span>
            </span>
            <button
              type="button"
              onClick={() => setActivePreview('none')}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div
            className="mw-body-content min-h-[150px] leading-relaxed text-gray-800 dark:text-gray-200"
            dangerouslySetInnerHTML={{ __html: livePreview.html }}
          />
          {livePreview.categories.length > 0 && (
            <div className="mt-4 p-2.5 bg-[#f8f9fa] dark:bg-gray-950 border border-[#a2a9b1] dark:border-gray-700 rounded text-xs flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-700 dark:text-gray-300">
              <span className="font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1 tabular-nums">
                <Tag className="w-3 h-3" />
                <span>
                  {livePreview.categories.length === 1
                    ? 'Categoria:'
                    : `Categorias (${livePreview.categories.length}):`}
                </span>
              </span>
              {livePreview.categories.map((cat, idx) => (
                <React.Fragment key={cat}>
                  {idx > 0 && <span className="text-gray-400" aria-hidden="true">|</span>}
                  <span className="text-[#0645ad] dark:text-[#6ba4ff]">{cat}</span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Live Diff Preview Section */}
      {activePreview === 'diff' && (
        <div className="mt-6 p-4 rounded border-2 border-dashed border-emerald-500/40 bg-white dark:bg-gray-900 shadow-sm">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="flex items-center gap-1.5">
              <FileDiff className="w-4 h-4" />
              <span>Comparação de Alterações com a Versão Atual (Diff)</span>
            </span>
            <button
              type="button"
              onClick={() => setActivePreview('none')}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {diffRows.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500">
              Nenhuma alteração detectada em relação à versão original.
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded font-mono text-xs">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
                    <th className="p-1.5 w-1/2 text-left font-sans font-semibold text-red-700 dark:text-red-400">
                      Versão Atual
                    </th>
                    <th className="p-1.5 w-1/2 text-left font-sans font-semibold text-emerald-700 dark:text-emerald-400">
                      Sua Versão (Não salva)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {diffRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900/60">
                      <td
                        className={`p-1.5 align-top border-r border-gray-200 dark:border-gray-800 ${
                          row.type === 'deleted' || row.type === 'modified'
                            ? 'bg-red-50 dark:bg-red-950/30'
                            : ''
                        }`}
                      >
                        {row.leftContent !== undefined && (
                          <div className="flex items-start gap-2">
                            <span className="text-[10px] text-gray-400 select-none w-6 text-right">
                              {row.leftLineNumber}
                            </span>
                            <span
                              className="text-red-900 dark:text-red-200 break-words"
                              dangerouslySetInnerHTML={{ __html: row.leftDiffHtml || '' }}
                            />
                          </div>
                        )}
                      </td>
                      <td
                        className={`p-1.5 align-top ${
                          row.type === 'added' || row.type === 'modified'
                            ? 'bg-emerald-50 dark:bg-emerald-950/30'
                            : ''
                        }`}
                      >
                        {row.rightContent !== undefined && (
                          <div className="flex items-start gap-2">
                            <span className="text-[10px] text-gray-400 select-none w-6 text-right">
                              {row.rightLineNumber}
                            </span>
                            <span
                              className="text-emerald-900 dark:text-emerald-200 break-words"
                              dangerouslySetInnerHTML={{ __html: row.rightDiffHtml || '' }}
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Image Insertion Modal with Blaze Plan Verification */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1a1f2c] border border-gray-300 dark:border-gray-700 rounded-lg shadow-2xl max-w-2xl w-full my-8 overflow-hidden text-gray-900 dark:text-gray-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-[#f8f9fa] dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded text-[#0645ad] dark:text-[#6ba4ff]">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base">Inserir Ficheiro de Mídia</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {isBlazePlanActive ? (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <Flame className="w-3 h-3 text-emerald-600" />
                        Plano Blaze Ativo na Extensão (Upload Permitido)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        <Flame className="w-3 h-3 text-amber-600" />
                        Plano Blaze Inativo na Extensão (Upload Bloqueado)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowImageModal(false);
                  setUploadError(null);
                }}
                className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If Blaze Plan is NOT enabled: prominent alert and 1-click activation for administrators */}
            {!isBlazePlanActive && (
              <div className="p-5 bg-amber-50/80 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/70 rounded-full text-amber-600 dark:text-amber-300 shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-amber-950 dark:text-amber-100">
                        Upload de Imagens Desativado via Extensão
                      </h4>
                      <span className="px-1.5 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 font-mono text-[10px]">
                        5.0.0.XL.1
                      </span>
                    </div>
                    <p className="leading-relaxed">
                      Conforme a arquitetura do Wiki, a extensão{' '}
                      <code>UploadWizard</code> (<code>5.0.0.XL.1</code>) requer que o{' '}
                      <strong>Plano Blaze do Firebase</strong> esteja habilitado na conta pelo administrador antes do envio de ficheiros.
                    </p>
                  </div>
                </div>

                {blazeError && (
                  <div className="p-2 rounded bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-[11px]">
                    {blazeError}
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-amber-200/60 dark:border-amber-900/40">
                  {isAdmin ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={enablingBlaze}
                        onClick={async () => {
                          setEnablingBlaze(true);
                          setBlazeError(null);
                          try {
                            await toggleBlazePlan(true);
                          } catch (err: any) {
                            setBlazeError(err?.message || 'Erro ao habilitar o Plano Blaze na extensão.');
                          } finally {
                            setEnablingBlaze(false);
                          }
                        }}
                        className="px-3.5 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {enablingBlaze ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Flame className="w-3.5 h-3.5" />
                        )}
                        <span>Ativar Plano Blaze na Extensão Agora</span>
                      </button>
                      <span className="text-[11px] text-amber-800 dark:text-amber-300">
                        (Ação exclusiva de Administrador / Burocrata)
                      </span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-amber-800 dark:text-amber-300">
                      Apenas administradores ou burocratas podem habilitar o Plano Blaze na extensão para liberar o upload.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowImageModal(false);
                      navigateToPage('Especial:Extensões');
                    }}
                    className="text-xs text-[#0645ad] dark:text-[#6ba4ff] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Configurações em Especial:Extensões</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Modal Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850 px-4 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setImageModalTab('upload')}
                disabled={!isBlazePlanActive}
                className={`px-3 py-2 font-medium border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                  imageModalTab === 'upload'
                    ? 'border-[#3366cc] text-[#0645ad] dark:text-[#6ba4ff]'
                    : !isBlazePlanActive
                    ? 'border-transparent text-gray-400 cursor-not-allowed opacity-60'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>1. Carregar Arquivo {isBlazePlanActive ? '' : '(Requer Blaze)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setImageModalTab('gallery')}
                className={`px-3 py-2 font-medium border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                  imageModalTab === 'gallery'
                    ? 'border-[#3366cc] text-[#0645ad] dark:text-[#6ba4ff]'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>2. Ficheiros do Wiki ({recentFiles.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setImageModalTab('manual')}
                className={`px-3 py-2 font-medium border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                  imageModalTab === 'manual'
                    ? 'border-[#3366cc] text-[#0645ad] dark:text-[#6ba4ff]'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>3. Inserção Manual / URL</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto text-xs">
              {uploadError && (
                <div className="p-2.5 rounded bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300">
                  {uploadError}
                </div>
              )}

              {/* TAB 1: UPLOAD NOVO ARQUIVO */}
              {imageModalTab === 'upload' && (
                <div className="space-y-4">
                  {isBlazePlanActive ? (
                    <>
                      <input
                        ref={modalFileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleSelectModalFile(file);
                        }}
                      />

                      {!uploadFile ? (
                        <div
                          onClick={() => modalFileInputRef.current?.click()}
                          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer transition-colors"
                        >
                          <UploadCloud className="w-8 h-8 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
                          <div className="font-semibold text-gray-800 dark:text-gray-200">
                            Clique para selecionar uma imagem do computador
                          </div>
                          <div className="text-[11px] text-gray-500 mt-1">
                            Formatos suportados: PNG, JPG, WebP, SVG, GIF (máx. 10MB)
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg items-center">
                          {uploadPreview && (
                            <div className="w-20 h-20 shrink-0 bg-white dark:bg-black rounded border border-gray-300 dark:border-gray-600 p-1 flex items-center justify-center overflow-hidden">
                              <img
                                src={uploadPreview}
                                alt="Preview"
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                          )}
                          <div className="flex-1 space-y-1">
                            <div className="font-medium text-gray-800 dark:text-gray-200 truncate">
                              {uploadFile.name}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              {((uploadPreparedMeta?.sizeBytes ?? uploadFile.size) / 1024).toFixed(1)} KB •{' '}
                              {uploadPreparedMeta?.mimeType || uploadFile.type || 'Imagem'}
                              {uploadPreparedMeta?.width && uploadPreparedMeta?.height
                                ? ` • ${uploadPreparedMeta.width}×${uploadPreparedMeta.height}px`
                                : ''}
                              {uploadPreparedMeta?.wasCompressed ? ' • Otimizada para Firestore' : ''}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setUploadFile(null);
                                setUploadPreview(null);
                                setUploadPreparedMeta(null);
                              }}
                              className="text-red-600 dark:text-red-400 hover:underline cursor-pointer text-[11px]"
                            >
                              Trocar imagem
                            </button>
                          </div>
                        </div>
                      )}

                      {uploadFile && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                              Nome canônico de destino na Wiki (com extensão)
                            </label>
                            <input
                              type="text"
                              value={uploadTitle}
                              onChange={e => setUploadTitle(e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 font-mono text-xs"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Legenda exibida no artigo
                              </label>
                              <input
                                type="text"
                                value={imageCaption}
                                onChange={e => setImageCaption(e.target.value)}
                                placeholder="Ex: Vista panorâmica do castelo"
                                className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Alinhamento na página
                              </label>
                              <select
                                value={imageAlign}
                                onChange={e => setImageAlign(e.target.value as any)}
                                className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                              >
                                <option value="right">Direita (Padrão MediaWiki)</option>
                                <option value="left">Esquerda</option>
                                <option value="center">Centro</option>
                                <option value="none">Sem alinhamento</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      O upload direto está desativado nesta wiki porque o Plano Blaze da extensão está desligado. Use a aba "Ficheiros do Wiki" ou "Inserção Manual".
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: GALERIA DE FICHEIROS EXISTENTES */}
              {imageModalTab === 'gallery' && (
                <div className="space-y-3">
                  <div className="text-gray-600 dark:text-gray-400">
                    Selecione uma imagem já carregada no Wiki para incorporar no texto:
                  </div>

                  {recentFiles.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 bg-gray-50 dark:bg-gray-800/40 rounded border border-gray-200 dark:border-gray-700">
                      Nenhum ficheiro carregado ainda na wiki.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1">
                      {recentFiles.map(file => {
                        const isSelected = selectedFileName === file.fileName;
                        return (
                          <div
                            key={file.id}
                            onClick={() => setSelectedFileName(file.fileName)}
                            className={`p-2 rounded border cursor-pointer transition-all flex flex-col items-center text-center ${
                              isSelected
                                ? 'border-[#3366cc] bg-blue-50/70 dark:bg-blue-950/50 ring-2 ring-[#3366cc]/40'
                                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                          >
                            <div className="w-full h-20 bg-white dark:bg-black rounded flex items-center justify-center overflow-hidden mb-1.5 border border-gray-200 dark:border-gray-800">
                              <img
                                src={file.url}
                                alt={file.title}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <span className="font-mono text-[10px] text-gray-800 dark:text-gray-200 truncate w-full">
                              {file.fileName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {selectedFileName && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Legenda
                          </label>
                          <input
                            type="text"
                            value={imageCaption}
                            onChange={e => setImageCaption(e.target.value)}
                            placeholder="Legenda da imagem"
                            className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Alinhamento
                          </label>
                          <select
                            value={imageAlign}
                            onChange={e => setImageAlign(e.target.value as any)}
                            className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                          >
                            <option value="right">Direita (Padrão)</option>
                            <option value="left">Esquerda</option>
                            <option value="center">Centro</option>
                            <option value="none">Sem alinhamento</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: INSERÇÃO MANUAL */}
              {imageModalTab === 'manual' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Nome do Ficheiro ou URL Externa da Imagem
                    </label>
                    <input
                      type="text"
                      value={selectedFileName}
                      onChange={e => setSelectedFileName(e.target.value)}
                      placeholder="Ex: Exemplo.png ou https://exemplo.com/foto.jpg"
                      className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 font-mono text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Legenda
                      </label>
                      <input
                        type="text"
                        value={imageCaption}
                        onChange={e => setImageCaption(e.target.value)}
                        placeholder="Legenda da imagem"
                        className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Alinhamento
                      </label>
                      <select
                        value={imageAlign}
                        onChange={e => setImageAlign(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                      >
                        <option value="right">Direita (Padrão)</option>
                        <option value="left">Esquerda</option>
                        <option value="center">Centro</option>
                        <option value="none">Sem alinhamento</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Wikitext Preview Code */}
              {(uploadTitle || selectedFileName) && (
                <div className="p-2.5 bg-gray-100 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800">
                  <div className="text-[10px] font-semibold uppercase text-gray-500 mb-1">
                    Código Wikitexto a ser inserido:
                  </div>
                  <code className="text-[11px] text-[#0645ad] dark:text-[#6ba4ff] font-mono break-all">
                    {buildImageSyntax(
                      uploadTitle || selectedFileName || 'Exemplo.png',
                      imageCaption,
                      imageAlign,
                      imageWidth
                    )}
                  </code>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-gray-50 dark:bg-gray-850 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowImageModal(false);
                  setUploadError(null);
                }}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                Cancelar
              </button>

              <div className="flex items-center gap-2">
                {imageModalTab === 'upload' && isBlazePlanActive && uploadFile && (
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={handleQuickUploadAndInsert}
                    className="px-4 py-1.5 bg-[#3366cc] hover:bg-[#254b99] text-white rounded font-medium shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isUploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <UploadCloud className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploading ? 'A carregar...' : 'Carregar e Inserir no Artigo'}</span>
                  </button>
                )}

                {(imageModalTab === 'gallery' || imageModalTab === 'manual') && selectedFileName && (
                  <button
                    type="button"
                    onClick={handleInsertExistingFile}
                    className="px-4 py-1.5 bg-[#3366cc] hover:bg-[#254b99] text-white rounded font-medium shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Inserir no Artigo</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Infobox Builder & Tutorial Modal */}
      {showInfoboxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1a1f2c] border border-gray-300 dark:border-gray-700 rounded-lg shadow-2xl max-w-3xl w-full my-8 overflow-hidden text-gray-900 dark:text-gray-100">
            {/* Modal Header */}
            <div className="p-4 bg-[#f8f9fa] dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded text-purple-700 dark:text-purple-300">
                  <PanelRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base">Assistente de Infobox (Usuário e Software)</h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Crie caixas de identificação de usuário, fichas técnicas de software ou consulte o tutorial rápido de uso.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInfoboxModal(false)}
                className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850 px-4 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setInfoboxModalTab('user')}
                className={`px-3 py-2 font-medium border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                  infoboxModalTab === 'user'
                    ? 'border-purple-600 text-purple-700 dark:text-purple-300'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Infobox Usuário</span>
              </button>

              <button
                type="button"
                onClick={() => setInfoboxModalTab('software')}
                className={`px-3 py-2 font-medium border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                  infoboxModalTab === 'software'
                    ? 'border-purple-600 text-purple-700 dark:text-purple-300'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <PanelRight className="w-3.5 h-3.5" />
                <span>Infobox Software</span>
              </button>

              <button
                type="button"
                onClick={() => setInfoboxModalTab('tutorial')}
                className={`px-3 py-2 font-medium border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                  infoboxModalTab === 'tutorial'
                    ? 'border-purple-600 text-purple-700 dark:text-purple-300'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Tutorial de Como Usar</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4 max-h-[62vh] overflow-y-auto text-xs">
              {infoboxModalTab === 'tutorial' ? (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded space-y-1.5">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                      Como usar o Infobox em 4 passos simples
                    </h4>
                    <ol className="list-decimal pl-5 space-y-1 text-gray-700 dark:text-gray-300 leading-relaxed">
                      <li>
                        Escolha o tipo acima: <strong>Infobox Usuário</strong> (para páginas <code>Usuário:...</code>) ou <strong>Infobox Software</strong> (para artigos de projetos e programas).
                      </li>
                      <li>
                        Preencha os campos desejados — como <code>nome</code>, <code>e-mail</code>, <code>foto</code>/<code>logotipo</code>, <code>uid</code> ou <code>site</code>. Campos em branco são ocultados automaticamente na leitura.
                      </li>
                      <li>
                        Clique em <strong>Inserir Infobox no Artigo</strong> para adicionar o código wikitexto na posição do cursor.
                      </li>
                      <li>
                        Você também pode editar o bloco manualmente adicionando novos campos com sublinhados: <code>| meu_campo = valor</code>.
                      </li>
                    </ol>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 space-y-1.5">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        Exemplo: Infobox de Usuário
                      </div>
                      <pre className="text-[11px] font-mono text-[#0645ad] dark:text-[#6ba4ff] whitespace-pre-wrap">{`{{Infobox usuário
| nome = João Pedro
| subtítulo = Editor da Comunidade
| foto = https://...
| usuário = João Pedro
| e-mail = joao@exemplo.com
| uid = \`google_uid_123\`
| função = Colaborador Registrado
| especialidade = Física e História
| status = Ativo
}}`}</pre>
                    </div>

                    <div className="p-3 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 space-y-1.5">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        Exemplo: Infobox de Software
                      </div>
                      <pre className="text-[11px] font-mono text-[#0645ad] dark:text-[#6ba4ff] whitespace-pre-wrap">{`{{Infobox software
| nome = WikiWazzimaGiygg
| tipo = Enciclopédia Livre
| desenvolvedor = Comunidade Aberta
| e-mail = contato@exemplo.com
| versão_estável = WC1.16.C7.1
| linguagem = TypeScript, React
| licença = MIT
| site = https://wikiwazzimagiygg.wazzimagiygg.com
| status = Ativo
}}`}</pre>
                    </div>
                  </div>

                  <div className="p-3 border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 rounded text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                    <div className="font-semibold">Dicas automáticas de formatação:</div>
                    <ul className="list-disc pl-5 space-y-0.5">
                      <li>Endereços de e-mail válidos em <code>e-mail</code> são convertidos em links <code>mailto:</code> clicáveis.</li>
                      <li>Links iniciados com <code>https://</code> viram links externos clicáveis automaticamente.</li>
                      <li>Use <code>[[Nome_da_Página|Rótulo]]</code> para criar ligações internas dentro de qualquer campo.</li>
                    </ul>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowInfoboxModal(false);
                        navigateToPage('Ajuda:Infobox');
                      }}
                      className="text-xs text-[#0645ad] dark:text-[#6ba4ff] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <span>Abrir página completa: Ajuda:Infobox</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Quick Actions & Tips */}
                  <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-start gap-2 text-[11px] text-blue-900 dark:text-blue-200 max-w-xl">
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <span>
                        Endereços em <strong>E-mail</strong> viram links <code>mailto:</code> automaticamente; URLs em <strong>Site</strong> e <strong>Repositório</strong> ficam clicáveis; campos extras podem ser adicionados com <code>| meu_campo = valor</code>.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleFillInfoboxExample}
                      className="px-2.5 py-1 bg-white dark:bg-gray-900 border border-blue-300 dark:border-blue-700 text-[#0645ad] dark:text-[#6ba4ff] rounded font-medium text-[11px] flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-950 cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{infoboxModalTab === 'user' ? 'Preencher com meus dados' : 'Preencher exemplo'}</span>
                    </button>
                  </div>

                  {infoboxModalTab === 'user' ? (
                    <>
                      {/* User Section 1 */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200 dark:border-gray-800 pb-1">
                          1. Identificação do Usuário
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Nome de exibição (<code>nome</code>)</label>
                            <input
                              type="text"
                              value={userInfoboxFields.nome}
                              onChange={e => setUserInfoboxFields(prev => ({ ...prev, nome: e.target.value }))}
                              placeholder="Ex: Maria Silva"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Subtítulo (<code>subtítulo</code>)</label>
                            <input
                              type="text"
                              value={userInfoboxFields.subtitulo}
                              onChange={e => setUserInfoboxFields(prev => ({ ...prev, subtítulo: e.target.value, subtitulo: e.target.value }))}
                              placeholder="Ex: Colaborador(a) do WikiWazzimaGiygg"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Foto / Avatar (<code>foto</code>)</label>
                            <input
                              type="text"
                              value={userInfoboxFields.foto}
                              onChange={e => setUserInfoboxFields(prev => ({ ...prev, foto: e.target.value }))}
                              placeholder="URL da foto ou Ficheiro:Avatar.png"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 font-mono text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Legenda da foto (<code>legenda</code>)</label>
                            <input
                              type="text"
                              value={userInfoboxFields.legenda}
                              onChange={e => setUserInfoboxFields(prev => ({ ...prev, legenda: e.target.value }))}
                              placeholder="Ex: Avatar do usuário"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* User Section 2 */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200 dark:border-gray-800 pb-1">
                          2. Conta e Contato
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Usuário (<code>usuário</code>)</label>
                            <input
                              type="text"
                              value={userInfoboxFields.usuario}
                              onChange={e => setUserInfoboxFields(prev => ({ ...prev, usuario: e.target.value }))}
                              placeholder="Nome na wiki"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">E-mail (<code>e-mail</code>)</label>
                            <input
                              type="email"
                              value={userInfoboxFields.email}
                              onChange={e => setUserInfoboxFields(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="contato@exemplo.com"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Google UID (<code>uid</code>)</label>
                            <input
                              type="text"
                              value={userInfoboxFields.uid}
                              onChange={e => setUserInfoboxFields(prev => ({ ...prev, uid: e.target.value }))}
                              placeholder="`uid_usuario`"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 font-mono text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Função / Cargo (<code>função</code>)</label>
                            <input
                              type="text"
                              value={userInfoboxFields.funcao}
                              onChange={e => setUserInfoboxFields(prev => ({ ...prev, funcao: e.target.value }))}
                              placeholder="Colaborador Registrado"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Página de discussão (<code>página_de_discussão</code>)</label>
                            <input
                              type="text"
                              value={userInfoboxFields.discussao}
                              onChange={e => setUserInfoboxFields(prev => ({ ...prev, discussao: e.target.value }))}
                              placeholder="[[Discussão_Usuário:Nome|Discussão]]"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 font-mono text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Status (<code>status</code>)</label>
                            <input
                              type="text"
                              value={userInfoboxFields.status}
                              onChange={e => setUserInfoboxFields(prev => ({ ...prev, status: e.target.value }))}
                              placeholder="Ativo"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* User Section 3 */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200 dark:border-gray-800 pb-1">
                          3. Perfil Comunitário (Opcional)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Especialidade (<code>especialidade</code>)</label>
                            <input
                              type="text"
                              value={userInfoboxFields.especialidade}
                              onChange={e => setUserInfoboxFields(prev => ({ ...prev, especialidade: e.target.value }))}
                              placeholder="Ex: TypeScript, História, Biologia"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Idiomas (<code>idiomas</code>)</label>
                            <input
                              type="text"
                              value={userInfoboxFields.idiomas}
                              onChange={e => setUserInfoboxFields(prev => ({ ...prev, idiomas: e.target.value }))}
                              placeholder="Português, Inglês"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Localização (<code>localização</code>)</label>
                            <input
                              type="text"
                              value={userInfoboxFields.localizacao}
                              onChange={e => setUserInfoboxFields(prev => ({ ...prev, localizacao: e.target.value }))}
                              placeholder="Ex: Brasil"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Site / Portfólio (<code>site</code>)</label>
                            <input
                              type="url"
                              value={userInfoboxFields.site}
                              onChange={e => setUserInfoboxFields(prev => ({ ...prev, site: e.target.value }))}
                              placeholder="https://..."
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 font-mono text-xs"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold mb-1">Biografia curta (<code>biografia</code>)</label>
                            <input
                              type="text"
                              value={userInfoboxFields.biografia}
                              onChange={e => setUserInfoboxFields(prev => ({ ...prev, biografia: e.target.value }))}
                              placeholder="Breve descrição sobre você e suas contribuições"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Section 1: Identificação */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200 dark:border-gray-800 pb-1">
                          1. Identificação e Logotipo
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Nome do software (<code>nome</code>)</label>
                            <input
                              type="text"
                              value={infoboxFields.nome}
                              onChange={e => setInfoboxFields(prev => ({ ...prev, nome: e.target.value }))}
                              placeholder="Ex: WikiWazzimaGiygg"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Subtítulo (<code>subtítulo</code>)</label>
                            <input
                              type="text"
                              value={infoboxFields.subtitulo}
                              onChange={e => setInfoboxFields(prev => ({ ...prev, subtitulo: e.target.value }))}
                              placeholder="Ex: Plataforma Wiki em TypeScript"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Tipo / Categoria (<code>tipo</code>)</label>
                            <input
                              type="text"
                              value={infoboxFields.tipo}
                              onChange={e => setInfoboxFields(prev => ({ ...prev, tipo: e.target.value }))}
                              placeholder="Ex: Enciclopédia Livre, Utilitário, IDE"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Logotipo / Imagem (<code>logotipo</code>)</label>
                            <input
                              type="text"
                              value={infoboxFields.logo}
                              onChange={e => setInfoboxFields(prev => ({ ...prev, logo: e.target.value }))}
                              placeholder="URL ou Ficheiro:Logo.png"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 font-mono text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Legenda do logotipo (<code>legenda</code>)</label>
                            <input
                              type="text"
                              value={infoboxFields.legenda}
                              onChange={e => setInfoboxFields(prev => ({ ...prev, legenda: e.target.value }))}
                              placeholder="Ex: Logotipo oficial da versão 2.0"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Descrição resumida (<code>descrição</code>)</label>
                            <input
                              type="text"
                              value={infoboxFields.descricao}
                              onChange={e => setInfoboxFields(prev => ({ ...prev, descricao: e.target.value }))}
                              placeholder="Breve resumo sobre a finalidade do software"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Autoria e Contato */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200 dark:border-gray-800 pb-1">
                          2. Autoria e Contato
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Desenvolvedor / Autor (<code>desenvolvedor</code>)</label>
                            <input
                              type="text"
                              value={infoboxFields.desenvolvedor}
                              onChange={e => setInfoboxFields(prev => ({ ...prev, desenvolvedor: e.target.value }))}
                              placeholder="Ex: Comunidade Aberta"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Mantenedor (<code>mantenedor</code>)</label>
                            <input
                              type="text"
                              value={infoboxFields.mantenedor}
                              onChange={e => setInfoboxFields(prev => ({ ...prev, mantenedor: e.target.value }))}
                              placeholder="Ex: Equipe Core"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">E-mail de contato/suporte (<code>e-mail</code>)</label>
                            <input
                              type="email"
                              value={infoboxFields.email}
                              onChange={e => setInfoboxFields(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="Ex: contato@exemplo.com"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Especificações Técnicas */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200 dark:border-gray-800 pb-1">
                          3. Ficha Técnica e Licenciamento
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Versão estável (<code>versão_estável</code>)</label>
                            <input
                              type="text"
                              value={infoboxFields.versao}
                              onChange={e => setInfoboxFields(prev => ({ ...prev, versao: e.target.value }))}
                              placeholder="Ex: 1.0.0"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Lançamento (<code>lançamento</code>)</label>
                            <input
                              type="text"
                              value={infoboxFields.lancamento}
                              onChange={e => setInfoboxFields(prev => ({ ...prev, lancamento: e.target.value }))}
                              placeholder="Ex: 15/03/2026 ou 2026"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Status (<code>status</code>)</label>
                            <input
                              type="text"
                              value={infoboxFields.status}
                              onChange={e => setInfoboxFields(prev => ({ ...prev, status: e.target.value }))}
                              placeholder="Ex: Ativo, Estável, Beta"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Linguagem (<code>linguagem</code>)</label>
                            <input
                              type="text"
                              value={infoboxFields.linguagem}
                              onChange={e => setInfoboxFields(prev => ({ ...prev, linguagem: e.target.value }))}
                              placeholder="Ex: TypeScript, Python"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Plataforma / SO (<code>plataforma</code>)</label>
                            <input
                              type="text"
                              value={infoboxFields.plataforma}
                              onChange={e => setInfoboxFields(prev => ({ ...prev, plataforma: e.target.value }))}
                              placeholder="Ex: Web, Linux, Windows"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Licença (<code>licença</code>)</label>
                            <input
                              type="text"
                              value={infoboxFields.licenca}
                              onChange={e => setInfoboxFields(prev => ({ ...prev, licenca: e.target.value }))}
                              placeholder="Ex: MIT, GPL v2.0+"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 4: Links */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200 dark:border-gray-800 pb-1">
                          4. Site, Repositório e Documentação
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Site oficial (<code>site</code>)</label>
                            <input
                              type="url"
                              value={infoboxFields.site}
                              onChange={e => setInfoboxFields(prev => ({ ...prev, site: e.target.value }))}
                              placeholder="https://wikiwazzimagiygg.wazzimagiygg.com"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 font-mono text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Repositório (<code>repositório</code>)</label>
                            <input
                              type="url"
                              value={infoboxFields.repositorio}
                              onChange={e => setInfoboxFields(prev => ({ ...prev, repositorio: e.target.value }))}
                              placeholder="https://github.com/..."
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 font-mono text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Documentação (<code>documentação</code>)</label>
                            <input
                              type="text"
                              value={infoboxFields.documentacao}
                              onChange={e => setInfoboxFields(prev => ({ ...prev, documentacao: e.target.value }))}
                              placeholder="URL ou [[Página_Docs]]"
                              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 font-mono text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Options & Generated Code Preview */}
                  <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-[11px] text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={infoboxIncludeEmpty}
                        onChange={e => setInfoboxIncludeEmpty(e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span>Incluir campos em branco como modelo no wikitexto</span>
                    </label>

                    <div className="p-2.5 bg-gray-100 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800">
                      <div className="text-[10px] font-semibold uppercase text-gray-500 mb-1">
                        Pré-visualização do código wikitexto:
                      </div>
                      <pre className="text-[11px] text-[#0645ad] dark:text-[#6ba4ff] font-mono whitespace-pre-wrap break-all">
                        {buildInfoboxSyntax()}
                      </pre>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-850 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowInfoboxModal(false)}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-xs"
              >
                {infoboxModalTab === 'tutorial' ? 'Fechar' : 'Cancelar'}
              </button>
              {infoboxModalTab !== 'tutorial' && (
                <button
                  type="button"
                  onClick={handleInsertInfobox}
                  className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded font-medium shadow-xs flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Inserir Infobox no Artigo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MediaWiki Predefinições (Templates) Assistant Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1a1f2c] border border-gray-300 dark:border-gray-700 rounded-lg shadow-2xl max-w-4xl w-full my-8 overflow-hidden text-gray-900 dark:text-gray-100">
            {/* Modal Header */}
            <div className="p-4 bg-[#f8f9fa] dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded text-indigo-700 dark:text-indigo-300">
                  <Braces className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base">
                    Gerenciador e Assistente de Predefinições (MediaWiki)
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Reutilize <code>{'{{NomeDaPredefinição|parâmetro}}'}</code> ou crie novos modelos salvos no Firestore sem perder seu rascunho.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850 px-4 pt-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setTemplateModalTab('use');
                  setTemplateFeedback(null);
                }}
                className={`px-3 py-2 font-medium border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                  templateModalTab === 'use'
                    ? 'border-indigo-600 text-indigo-700 dark:text-indigo-300'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <Braces className="w-3.5 h-3.5" />
                <span>Usar Predefinição ({liveTemplates.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTemplateModalTab('create');
                  setTemplateFeedback(null);
                }}
                className={`px-3 py-2 font-medium border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                  templateModalTab === 'create'
                    ? 'border-indigo-600 text-indigo-700 dark:text-indigo-300'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Criar / Editar Modelo no Firestore</span>
              </button>
            </div>

            {templateFeedback && (
              <div
                className={`mx-4 mt-3 p-2.5 rounded text-xs border ${
                  templateFeedback.type === 'error'
                    ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                }`}
              >
                {templateFeedback.msg}
              </div>
            )}

            {/* Tab 1: Use Existing Template */}
            {templateModalTab === 'use' ? (
              <div className="grid grid-cols-1 md:grid-cols-5 max-h-[62vh] text-xs">
                {/* Left Column: Template Catalog */}
                <div className="md:col-span-2 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 p-3 flex flex-col gap-2.5 bg-gray-50/70 dark:bg-gray-900/60 overflow-y-auto max-h-[62vh]">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      value={templateSearch}
                      onChange={e => setTemplateSearch(e.target.value)}
                      placeholder="Filtrar predefinições..."
                      className="w-full pl-8 pr-2.5 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-xs"
                    />
                  </div>

                  <div className="space-y-1 flex-1 overflow-y-auto">
                    {filteredTemplates.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-[11px]">
                        Nenhuma predefinição encontrada para &quot;{templateSearch}&quot;.
                      </div>
                    ) : (
                      filteredTemplates.map(tpl => {
                        const isSelected = selectedTemplate?.slug === tpl.slug;
                        return (
                          <button
                            key={tpl.slug}
                            type="button"
                            onClick={() => {
                              setSelectedTemplateSlug(tpl.slug);
                              setTemplateParamValues({});
                            }}
                            className={`w-full text-left p-2 rounded border transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-700 text-indigo-950 dark:text-indigo-100'
                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-indigo-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-semibold text-[12px] text-[#0645ad] dark:text-[#6ba4ff]">
                                {`{{${tpl.name}}}`}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono">
                                {tpl.isBuiltIn ? 'Padrão' : 'Comunidade'}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-2 mt-0.5 leading-snug">
                              {tpl.summary}
                            </p>
                          </button>
                        );
                      })
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setNewTemplateName('');
                      setNewTemplateSummary('');
                      setTemplateFeedback(null);
                      setTemplateModalTab('create');
                    }}
                    className="w-full py-1.5 px-2.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded font-medium text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Criar Nova Predefinição</span>
                  </button>
                </div>

                {/* Right Column: Parameters & Live Expansion Preview */}
                <div className="md:col-span-3 p-4 space-y-3 overflow-y-auto max-h-[62vh]">
                  {selectedTemplate ? (
                    <>
                      <div className="flex flex-wrap items-start justify-between gap-2 pb-2 border-b border-gray-200 dark:border-gray-800">
                        <div>
                          <h4 className="font-serif font-bold text-sm text-gray-900 dark:text-gray-100">
                            {selectedTemplate.title}
                          </h4>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                            {selectedTemplate.summary}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {!currentUser.isAnonymous && (
                            <button
                              type="button"
                              onClick={() => handleEditSelectedTemplateInModal(selectedTemplate)}
                              className="text-[11px] px-2 py-0.5 rounded border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer"
                            >
                              Editar modelo
                            </button>
                          )}
                          {isBureaucrat && !selectedTemplate.isBuiltIn && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomTemplate(selectedTemplate)}
                              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded cursor-pointer"
                              title="Excluir predefinição do Firestore (Somente Burocratas)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setShowTemplateModal(false);
                              navigateToPage(selectedTemplate.slug, 'view');
                            }}
                            className="text-[11px] text-[#0645ad] dark:text-[#6ba4ff] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>Abrir página</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {selectedTemplate.params.length === 0 ? (
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded text-[11px] text-gray-600 dark:text-gray-400">
                          Esta predefinição não exige parâmetros. Basta clicar em <strong>Inserir Predefinição</strong> abaixo.
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                            Parâmetros da Predefinição ({selectedTemplate.params.length})
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {selectedTemplate.params.map(param => (
                              <div
                                key={param.name}
                                className={param.name === 'texto' || param.name === '1' ? 'sm:col-span-2' : ''}
                              >
                                <label className="block text-[11px] font-semibold mb-1 text-gray-700 dark:text-gray-300">
                                  {param.isPositional ? `Parâmetro ${param.name} ` : `${param.name} `}
                                  <code className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                                    {`{{{${param.name}}}}`}
                                  </code>
                                </label>
                                <input
                                  type="text"
                                  value={templateParamValues[param.name] || ''}
                                  onChange={e =>
                                    setTemplateParamValues(prev => ({
                                      ...prev,
                                      [param.name]: e.target.value,
                                    }))
                                  }
                                  placeholder={
                                    param.defaultValue
                                      ? `Padrão: ${param.defaultValue}`
                                      : `Valor para ${param.name}...`
                                  }
                                  className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t border-gray-200 dark:border-gray-800 space-y-2">
                        <label className="inline-flex items-center gap-2 cursor-pointer text-[11px] text-gray-700 dark:text-gray-300">
                          <input
                            type="checkbox"
                            checked={templateUseSubst}
                            onChange={e => setTemplateUseSubst(e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>
                            Substituir código ao publicar (<code>subst:</code>) — expande o wikitexto fixo na gravação
                          </span>
                        </label>

                        <div className="p-2.5 bg-gray-100 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800">
                          <div className="text-[10px] font-semibold uppercase text-gray-500 mb-1">
                            Chamada wikitexto gerada:
                          </div>
                          <pre className="text-[11px] text-[#0645ad] dark:text-[#6ba4ff] font-mono whitespace-pre-wrap break-all">
                            {buildTemplateCallSyntax()}
                          </pre>
                        </div>

                        {renderedTemplateCallPreview && (
                          <div className="p-2.5 bg-white dark:bg-gray-950 rounded border border-gray-200 dark:border-gray-800">
                            <div className="text-[10px] font-semibold uppercase text-gray-500 mb-1">
                              Pré-visualização renderizada no ArticleViewer:
                            </div>
                            <div
                              className="mw-body-content text-xs"
                              dangerouslySetInnerHTML={{ __html: renderedTemplateCallPreview }}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      Selecione uma predefinição na lista à esquerda.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Tab 2: Create or Edit Template directly in Firestore */
              <form onSubmit={handleSaveCustomTemplate} className="p-4 space-y-3 max-h-[62vh] overflow-y-auto text-xs">
                {currentUser.isAnonymous && (
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded text-amber-900 dark:text-amber-200">
                    Faça login com sua conta Google para criar ou modificar predefinições no Firebase Firestore.
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">
                      Nome da Predefinição (sem prefixo)
                    </label>
                    <input
                      type="text"
                      required
                      value={newTemplateName}
                      onChange={e => setNewTemplateName(e.target.value)}
                      placeholder="Ex: Caixa_Alerta ou Destaque"
                      className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                    />
                    {newTemplateName.trim() && (
                      <div className="text-[10px] text-gray-500 mt-0.5 font-mono">
                        Será salva como: {formatTemplateSlug(newTemplateName)}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold mb-1">
                      Descrição curta / Finalidade
                    </label>
                    <input
                      type="text"
                      value={newTemplateSummary}
                      onChange={e => setNewTemplateSummary(e.target.value)}
                      placeholder="Ex: Caixa colorida reutilizável para notas técnicas"
                      className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-[11px] font-semibold">
                      Código Wikitexto do Modelo (use <code>{'{{{1}}}'}</code>, <code>{'{{{param|padrão}}}'}</code> e <code>&lt;includeonly&gt;</code>)
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { label: '+{{{1|Texto}}}', val: '{{{1|Texto}}}' },
                        { label: '+{{{título|}}}', val: '{{{título|}}}' },
                        { label: '+{{#if:}}', val: '{{#if:{{{1|}}}|Sim|Não}}' },
                      ].map(chip => (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => setNewTemplateBody(prev => prev + chip.val)}
                          className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-[10px] font-mono border border-gray-300 dark:border-gray-700 cursor-pointer"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={8}
                    required
                    value={newTemplateBody}
                    onChange={e => setNewTemplateBody(e.target.value)}
                    className="w-full p-2.5 font-mono text-xs border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
                    placeholder="<includeonly>...</includeonly><noinclude>Documentação</noinclude>"
                  />
                </div>

                {newTemplateValidation && (newTemplateName.trim() || newTemplateBody.trim()) && (
                  <div className="space-y-1.5 text-[11px]">
                    {newTemplateValidation.errors.length > 0 && newTemplateName.trim() && (
                      <div className="p-2 rounded bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 space-y-0.5">
                        {newTemplateValidation.errors.map((errMsg, idx) => (
                          <div key={idx}>• {errMsg}</div>
                        ))}
                      </div>
                    )}
                    {newTemplateValidation.warnings.length > 0 && (
                      <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 space-y-0.5">
                        {newTemplateValidation.warnings.map((warnMsg, idx) => (
                          <div key={idx}>• {warnMsg}</div>
                        ))}
                      </div>
                    )}
                    {newTemplateValidation.detectedParams.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 text-gray-600 dark:text-gray-400">
                        <span>Parâmetros validados:</span>
                        {newTemplateValidation.detectedParams.map(p => (
                          <code
                            key={p.name}
                            className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 font-mono text-[10px]"
                          >
                            {`{{{${p.name}${p.defaultValue !== undefined ? `|${p.defaultValue}` : ''}}}}`}
                          </code>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setTemplateModalTab('use')}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-xs"
                  >
                    Voltar ao catálogo
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isSavingTemplate ||
                      currentUser.isAnonymous ||
                      !newTemplateName.trim() ||
                      (newTemplateValidation ? !newTemplateValidation.valid : false)
                    }
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded font-medium shadow-xs flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingTemplate ? 'Salvando no Firestore...' : 'Salvar Predefinição no Firestore'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Modal Footer */}
            {templateModalTab === 'use' && (
              <div className="p-4 bg-gray-50 dark:bg-gray-850 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(false)}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTemplateModal(false);
                      navigateToPage('Ajuda:Predefinições');
                    }}
                    className="text-xs text-[#0645ad] dark:text-[#6ba4ff] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Guia: Ajuda:Predefinições</span>
                  </button>
                </div>
                <button
                  type="button"
                  disabled={!selectedTemplate}
                  onClick={handleInsertTemplate}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded font-medium shadow-xs flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Inserir Predefinição no Artigo</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
