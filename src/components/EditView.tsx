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
} from 'lucide-react';
import { useWiki } from '../context/WikiContext';
import { WikiPage } from '../types/wiki';
import { savePage, canUserEditPage, getEffectiveProtectionLevel } from '../services/wikiService';
import { saveUploadedFile, subscribeToUploadedFiles } from '../services/extensionService';
import { queryGoogleSearchGrounding, SearchGroundingResult } from '../services/groundingService';
import { WikiFileDoc } from '../extensions/types';
import { parseWikitext } from '../core/parser';
import { computeRevisionDiff } from '../core/diff';

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
    isBureaucrat,
    toggleBlazePlan,
    navigateToPage,
    settings,
  } = useWiki();

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
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [enablingBlaze, setEnablingBlaze] = useState(false);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // Infobox builder modal state (Software, Usuário, and Tutorial)
  const isUserNamespacePage = /^(?:Usuário|User):/i.test(page?.title || slug);
  const [showInfoboxModal, setShowInfoboxModal] = useState(false);
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

  const handleSelectModalFile = (file: File) => {
    setUploadFile(file);
    setUploadError(null);
    const clean = file.name.replace(/\s+/g, '_');
    setUploadTitle(clean);
    const reader = new FileReader();
    reader.onload = e => {
      setUploadPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const insertRawText = (textToInsert: string) => {
    const textarea = textareaRef.current;
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
      setUploadError('O upload de imagens está bloqueado porque o Plano Blaze não está ativado na extensão.');
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
        mimeType: uploadFile.type || 'image/png',
        size: uploadFile.size,
        author: currentUser.username,
        authorId: currentUser.uid,
        description: uploadDesc || imageCaption,
      });

      const tag = buildImageSyntax(savedDoc.fileName, imageCaption, imageAlign, imageWidth);
      insertRawText(tag);
      setShowImageModal(false);
      setUploadFile(null);
      setUploadPreview(null);
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
        site: 'https://core.wazzimagiygg.com',
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
      site: 'https://core.wazzimagiygg.com',
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
    return page?.content || `== Introdução ==\nEscreva o conteúdo do seu artigo aqui em wikitexto.\n\n== Detalhes ==\n* Item 1\n* Item 2\n\n[[Categoria:Geral]]`;
  });

  const [summary, setSummary] = useState<string>('');
  const [isMinor, setIsMinor] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activePreview, setActivePreview] = useState<'none' | 'preview' | 'diff'>('none');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleCopySource = () => {
    navigator.clipboard.writeText(content);
    setCopiedSource(true);
    setTimeout(() => setCopiedSource(false), 2000);
  };

  // Computed live preview
  const livePreview = useMemo(() => {
    if (activePreview !== 'preview') return null;
    return parseWikitext(content, existingPageSlugs);
  }, [content, activePreview, existingPageSlugs]);

  // Computed diff preview
  const diffRows = useMemo(() => {
    if (activePreview !== 'diff') return [];
    const originalText = page?.content || '';
    return computeRevisionDiff(originalText, content);
  }, [page?.content, content, activePreview]);

  // Insert wikitext snippets
  const insertSyntax = (before: string, after: string = '', defaultPlaceholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end) || defaultPlaceholder;

    const replacement = `${before}${selected}${after}`;
    const newContent =
      textarea.value.substring(0, start) + replacement + textarea.value.substring(end);

    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      );
    }, 10);
  };

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
      const saved = await savePage({
        slug,
        title: pageTitle,
        content,
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

      {/* MediaWiki Classic Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-1.5 bg-[#f8f9fa] dark:bg-gray-800 border border-[#a2a9b1] dark:border-gray-700 rounded-t text-xs">
        <button
          type="button"
          onClick={() => insertSyntax("'''", "'''", 'texto em negrito')}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          title="Negrito (''')"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertSyntax("''", "''", 'texto em itálico')}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          title="Itálico ('')"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1" />

        <button
          type="button"
          onClick={() => insertSyntax('[[', ']]', 'Título da Página')}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          title="Link interno ([[...]])"
        >
          <Link className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertSyntax('\n== ', ' ==\n', 'Título da Seção')}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          title="Cabeçalho nível 2 (== ==)"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertSyntax('* ', '', 'Item da lista')}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          title="Lista com marcadores (*)"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertSyntax('# ', '', 'Item numerado')}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          title="Lista numerada (#)"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1" />

        <button
          type="button"
          onClick={() => insertSyntax('<syntaxhighlight lang="typescript">\n', '\n</syntaxhighlight>', '// Código TypeScript aqui')}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          title="Bloco de código (<syntaxhighlight>)"
        >
          <Code className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertSyntax('{| class="wikitable"\n! Cabeçalho 1 !! Cabeçalho 2\n|-\n| Linha 1, Coluna 1 || Linha 1, Coluna 2\n|}\n')}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          title="Inserir tabela wikitexto"
        >
          <Table className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertSyntax('<ref>', '</ref>', 'Referência bibliográfica ou link')}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-serif font-bold text-xs"
          title="Nota de rodapé (<ref>)"
        >
          [ref]
        </button>

        <button
          type="button"
          onClick={() => insertSyntax('{{Aviso|', '}}', 'Mensagem de alerta importante')}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-amber-600 font-bold text-xs"
          title="Predefinição de aviso {{Aviso|...}}"
        >
          {'{aviso}'}
        </button>

        {editPermission.allowed && (
          <button
            type="button"
            onClick={() => setShowInfoboxModal(true)}
            className="px-2 py-1 rounded bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1 font-medium text-xs cursor-pointer transition-colors"
            title="Inserir caixa {{Infobox software}} com nome, e-mail e ficha técnica"
          >
            <PanelRight className="w-3.5 h-3.5" />
            <span>Infobox</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => insertSyntax('--~~~~')}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-mono text-xs"
          title="Assinatura com data (--~~~~)"
        >
          --~~~~
        </button>

        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1" />

        <button
          type="button"
          onClick={() => setShowImageModal(true)}
          className={`px-2 py-1 rounded flex items-center gap-1.5 cursor-pointer transition-colors text-xs font-medium ${
            isBlazePlanActive
              ? 'bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-[#0645ad] dark:text-[#6ba4ff] border border-blue-200 dark:border-blue-800'
              : 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
          }`}
          title="Inserir ou carregar imagem no artigo"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Imagem</span>
          {isBlazePlanActive ? (
            <span className="flex items-center gap-0.5 text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 font-semibold">
              <Flame className="w-2.5 h-2.5 text-emerald-600" />
              Blaze ON
            </span>
          ) : (
            <span className="flex items-center gap-0.5 text-[9px] px-1 py-0.2 rounded bg-amber-200 text-amber-900 dark:bg-amber-900/80 dark:text-amber-200 font-semibold">
              <Flame className="w-2.5 h-2.5 text-amber-600" />
              Blaze OFF
            </span>
          )}
        </button>

        {editPermission.allowed && (
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
            <span>Fontes Google</span>
          </button>
        )}
      </div>

      {/* Google Search Grounding Research Drawer */}
      {showResearchPanel && editPermission.allowed && (
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

      {/* Main Wikitext Textarea */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={18}
        readOnly={!editPermission.allowed}
        className={`w-full p-3 font-mono text-xs sm:text-sm border border-[#a2a9b1] dark:border-gray-700 border-t-0 resize-y leading-relaxed shadow-inner ${
          !editPermission.allowed
            ? 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-300 cursor-not-allowed select-text'
            : 'bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:outline-hidden focus:border-[#3366cc] focus:ring-1 focus:ring-[#3366cc]'
        }`}
        placeholder="Digite o conteúdo do artigo em wikitexto..."
      />

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

            {/* If Blaze Plan is NOT enabled: prominent alert and 1-click activation for bureaucrats */}
            {!isBlazePlanActive && (
              <div className="p-5 bg-amber-50/80 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/70 rounded-full text-amber-600 dark:text-amber-300 shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-bold text-sm text-amber-950 dark:text-amber-100">
                      Upload de Imagens Desativado via Extensão
                    </h4>
                    <p className="leading-relaxed">
                      Conforme a arquitetura do Wiki, o envio e armazenamento de ficheiros de mídia requer que a opção{' '}
                      <strong>Plano Blaze do Firebase</strong> esteja ativada nas configurações da extensão{' '}
                      <code>UploadWizard</code> (<code>upload-wizard</code>).
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-amber-200/60 dark:border-amber-900/40">
                  {isBureaucrat ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={enablingBlaze}
                        onClick={async () => {
                          setEnablingBlaze(true);
                          try {
                            await toggleBlazePlan(true);
                          } catch (err) {
                            console.error(err);
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
                        (Ação exclusiva de Burocrata)
                      </span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-amber-800 dark:text-amber-300">
                      Apenas burocratas podem alterar as configurações da extensão para habilitar o upload.
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
                              {(uploadFile.size / 1024).toFixed(1)} KB • {uploadFile.type || 'Imagem'}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setUploadFile(null);
                                setUploadPreview(null);
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
| site = https://core.wazzimagiygg.com
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
                              placeholder="https://core.wazzimagiygg.com"
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
    </div>
  );
};
