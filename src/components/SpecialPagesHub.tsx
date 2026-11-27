import React, { useMemo, useState } from 'react';
import {
  Blocks,
  BookOpen,
  Clock,
  Compass,
  Database,
  FileCheck2,
  Flag,
  Gavel,
  GitBranch,
  Globe,
  Info,
  List,
  Lock,
  MessageSquare,
  Search,
  ShieldCheck,
  Smartphone,
  Tag,
  Unlock,
  Upload,
  UserCheck,
} from 'lucide-react';
import { useWiki } from '../context/WikiContext';
import { CategoryExplorer } from './CategoryExplorer';

export interface SpecialPagesHubProps {
  initialView?: 'all' | 'pages' | 'categories';
  initialCategory?: string;
}

interface SpecialPageEntry {
  slug: string;
  title: string;
  description: string;
  group: 'indices' | 'governance' | 'system';
  extensionId?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SPECIAL_PAGES_DIRECTORY: SpecialPageEntry[] = [
  // Índices e Conteúdo
  {
    slug: 'Especial:Todas_as_páginas',
    title: 'Todas as páginas',
    description: 'Índice alfabético completo dos artigos por espaço nominal.',
    group: 'indices',
    extensionId: 'all-pages-index',
    icon: List,
  },
  {
    slug: 'Especial:Categorias',
    title: 'Categorias',
    description: 'Lista todas as categorias da wiki e os artigos vinculados a cada uma.',
    group: 'indices',
    extensionId: 'dynamic-page-list',
    icon: Tag,
  },
  {
    slug: 'Especial:Mudanças_recentes',
    title: 'Mudanças recentes',
    description: 'Registro em tempo real das últimas edições e revisões salvas.',
    group: 'indices',
    extensionId: 'recent-changes',
    icon: Clock,
  },
  {
    slug: 'Especial:Carregar_arquivo',
    title: 'Carregar arquivo',
    description: 'Assistente para envio de imagens e ficheiros para os artigos.',
    group: 'indices',
    extensionId: 'upload-wizard',
    icon: Upload,
  },

  // Administração e Governança
  {
    slug: 'Especial:Administração',
    title: 'Administração e Permissões',
    description: 'Gestão de grupos de usuários, sysops e configurações administrativas.',
    group: 'governance',
    icon: ShieldCheck,
  },
  {
    slug: 'Especial:Páginas_protegidas',
    title: 'Páginas protegidas',
    description: 'Consulta e controle de níveis de proteção contra edições.',
    group: 'governance',
    extensionId: 'page-protection',
    icon: Lock,
  },
  {
    slug: 'Especial:Verificação_de_contas',
    title: 'Verificação de contas (Fantoches)',
    description: 'Investigação técnica de múltiplas contas e sockpuppets (Admin / Burocrata).',
    group: 'governance',
    extensionId: 'checkuser',
    icon: UserCheck,
  },
  {
    slug: 'Especial:Pedidos_LGPD',
    title: 'Pedidos de LGPD (Fila Admin)',
    description: 'Gestão de solicitações de dados pessoais e Marco Civil pelo DPO e administração.',
    group: 'governance',
    extensionId: 'lgpd-privacy-suite',
    icon: FileCheck2,
  },
  {
    slug: 'Especial:Discussão_Administrativa',
    title: 'Discussão de Administradores',
    description: 'Fórum interno reservado para deliberação entre sysops e burocratas.',
    group: 'governance',
    icon: MessageSquare,
  },
  {
    slug: 'Especial:Conselho_de_Arbitragem',
    title: 'Conselho de Arbitragem (ArbCom)',
    description: 'Envie petições e acompanhe processos arbitrais e acórdãos da comunidade.',
    group: 'governance',
    extensionId: 'arbcom-ucoc-governance',
    icon: Gavel,
  },
  {
    slug: 'Especial:Denúncias',
    title: 'Denúncias & Conduta (UCoC)',
    description: 'Canal aberto para denunciar assédio, abuso ou violações ao Código de Conduta.',
    group: 'governance',
    extensionId: 'arbcom-ucoc-governance',
    icon: Flag,
  },
  {
    slug: 'Especial:Desbloqueio',
    title: 'Pedidos de desbloqueio',
    description: 'Fila de revisões e recursos para contas bloqueadas.',
    group: 'governance',
    extensionId: 'arbcom-ucoc-governance',
    icon: Unlock,
  },
  {
    slug: 'Especial:Privacidade',
    title: 'Central de Privacidade (LGPD)',
    description: 'Exercício de direitos dos titulares, Marco Civil e contato do DPO.',
    group: 'governance',
    extensionId: 'lgpd-privacy-suite',
    icon: BookOpen,
  },

  // Sistema e Extensões
  {
    slug: 'Especial:Extensões',
    title: 'Extensões do Wiki',
    description: 'Ative ou desative módulos do parser, recursos da wiki e visualizações.',
    group: 'system',
    icon: Blocks,
  },
  {
    slug: 'Especial:Versão',
    title: 'Versão do software',
    description: 'Versão atual do motor MediaWiki TS, bibliotecas e metadados.',
    group: 'system',
    icon: Info,
  },
  {
    slug: 'Especial:Aplicativo',
    title: 'Aplicativo (PC / Celular)',
    description: 'Instalação PWA em dispositivos e controle de notificações push.',
    group: 'system',
    extensionId: 'pwa-app',
    icon: Smartphone,
  },
  {
    slug: 'Especial:GitHubSync',
    title: 'Sincronização GitHub',
    description: 'Histórico de atualizações e commits sincronizados com o repositório.',
    group: 'system',
    extensionId: 'github-sync',
    icon: GitBranch,
  },
  {
    slug: 'Especial:SEO',
    title: 'Gerenciador de SEO',
    description: 'Inspeção de metadados OpenGraph, URLs canônicas e Schema.org.',
    group: 'system',
    extensionId: 'seo-manager',
    icon: Globe,
  },
  {
    slug: 'Especial:Banco_de_Dados',
    title: 'Banco de Dados (Firestore)',
    description: 'Diagnóstico e ferramentas administrativas da base de dados.',
    group: 'system',
    icon: Database,
  },
];

const GROUP_LABELS: Record<SpecialPageEntry['group'], string> = {
  indices: 'Conteúdo, Índices e Categorias',
  governance: 'Governança, Segurança e Privacidade',
  system: 'Sistema, Extensões e Aplicativo',
};

export const SpecialPagesHub: React.FC<SpecialPagesHubProps> = ({
  initialView = 'all',
  initialCategory,
}) => {
  const { navigateToPage, isExtensionActive } = useWiki();
  const [viewMode, setViewMode] = useState<'all' | 'pages' | 'categories'>(initialView);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDirectory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SPECIAL_PAGES_DIRECTORY;
    return SPECIAL_PAGES_DIRECTORY.filter(
      entry =>
        entry.title.toLowerCase().includes(q) ||
        entry.slug.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const activeCount = useMemo(
    () =>
      SPECIAL_PAGES_DIRECTORY.filter(
        item => !item.extensionId || isExtensionActive(item.extensionId)
      ).length,
    [isExtensionActive]
  );

  const groupedEntries = useMemo(() => {
    const groups: Array<{ key: SpecialPageEntry['group']; label: string; items: SpecialPageEntry[] }> = [
      { key: 'indices', label: GROUP_LABELS.indices, items: [] },
      { key: 'governance', label: GROUP_LABELS.governance, items: [] },
      { key: 'system', label: GROUP_LABELS.system, items: [] },
    ];
    for (const item of filteredDirectory) {
      const target = groups.find(g => g.key === item.group);
      if (target) target.items.push(item);
    }
    return groups.filter(g => g.items.length > 0);
  }, [filteredDirectory]);

  const showDirectory = viewMode === 'all' || viewMode === 'pages';
  const showCategories = viewMode === 'all' || viewMode === 'categories';
  const extDynamicPageList = isExtensionActive('dynamic-page-list');

  return (
    <div className="py-2 space-y-6">
      {/* Main Page Header */}
      <div className="border-b border-[#a2a9b1] dark:border-gray-700 pb-3 space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-2xl font-serif text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#0645ad] dark:text-[#6ba4ff]" />
            <span>Páginas especiais</span>
          </h1>
          <div className="text-xs font-mono tabular-nums text-gray-500 dark:text-gray-400">
            {activeCount} de {SPECIAL_PAGES_DIRECTORY.length} páginas ativas
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Central de ferramentas administrativas, relatórios em tempo real e explorador de categorias do WikiWazzimaGiygg.
        </p>

        {/* Segmented View Switcher */}
        <div className="pt-1 flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Modo de visualização">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'all'}
            onClick={() => setViewMode('all')}
            className={`px-3 py-1.5 rounded border text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'all'
                ? 'bg-[#3366cc] text-white border-[#254b99]'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Visão completa
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'pages'}
            onClick={() => setViewMode('pages')}
            className={`px-3 py-1.5 rounded border text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'pages'
                ? 'bg-[#3366cc] text-white border-[#254b99]'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Índice de páginas especiais
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'categories'}
            onClick={() => setViewMode('categories')}
            className={`px-3 py-1.5 rounded border text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'categories'
                ? 'bg-[#3366cc] text-white border-[#254b99]'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Explorador de Categorias
          </button>
        </div>
      </div>

      {/* Special Pages Directory */}
      {showDirectory && (
        <section aria-label="Diretório de Páginas Especiais" className="space-y-4">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filtrar páginas especiais por nome ou função..."
              className="w-full pl-8 pr-3 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#3366cc]"
            />
          </div>

          {groupedEntries.length === 0 ? (
            <div className="p-6 text-center border border-gray-200 dark:border-gray-800 rounded bg-white dark:bg-[#1a1f2c] text-xs text-gray-500 dark:text-gray-400">
              Nenhuma página especial encontrada para &quot;{searchQuery}&quot;.
            </div>
          ) : (
            <div className="space-y-5">
              {groupedEntries.map(group => (
                <div key={group.key} className="space-y-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {group.label}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {group.items.map(item => {
                      const Icon = item.icon;
                      const enabled = !item.extensionId || isExtensionActive(item.extensionId);
                      return (
                        <button
                          key={item.slug}
                          type="button"
                          onClick={() => navigateToPage(item.slug)}
                          className={`p-3 rounded border text-left transition-colors flex flex-col justify-between gap-2 cursor-pointer ${
                            enabled
                              ? 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f2c] hover:border-[#3366cc] dark:hover:border-blue-500 hover:bg-[#f8f9fa] dark:hover:bg-gray-900/70'
                              : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0645ad] dark:text-[#6ba4ff]">
                                <Icon className="w-4 h-4 shrink-0" />
                                <span>{item.title}</span>
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                          <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400 flex items-center justify-between gap-2 pt-1 border-t border-gray-100 dark:border-gray-800/80">
                            <span className="truncate">{item.slug}</span>
                            {!enabled && <span className="text-amber-700 dark:text-amber-400 shrink-0">Desativada</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Integrated Category Explorer */}
      {showCategories && (
        <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
          {extDynamicPageList ? (
            <CategoryExplorer embedded initialCategory={initialCategory} />
          ) : (
            <div className="p-4 rounded border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-900 dark:text-amber-200 flex flex-wrap items-center justify-between gap-2">
              <span>
                O Explorador de Categorias depende da extensão{' '}
                <code className="font-mono">dynamic-page-list</code>, que está desativada no momento.
              </span>
              <button
                type="button"
                onClick={() => navigateToPage('Especial:Extensões')}
                className="text-[#0645ad] dark:text-[#6ba4ff] hover:underline font-semibold cursor-pointer"
              >
                Reativar em Especial:Extensões
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
