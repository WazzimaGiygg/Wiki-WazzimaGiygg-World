import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  ExternalLink,
  FolderOpen,
  RefreshCw,
  Search,
  Tag,
} from 'lucide-react';
import { useWiki } from '../context/WikiContext';
import { INITIAL_PAGES } from '../core/defaultPages';
import { subscribeToAllPages } from '../services/wikiService';
import { WikiPage } from '../types/wiki';

export interface CategoryExplorerProps {
  initialCategory?: string;
  embedded?: boolean;
  hideCategoryPageLink?: boolean;
}

interface CategoryGroup {
  key: string;
  name: string;
  pages: WikiPage[];
}

const NAMESPACE_LABELS: Record<string, string> = {
  Main: 'Principal',
  Template: 'Predefinição',
  Help: 'Ajuda',
  Manual: 'Manual',
  Wiki: 'Wiki',
  User: 'Usuário',
  Category: 'Categoria',
  File: 'Ficheiro',
  Special: 'Especial',
};

function cleanCategoryName(raw: string): string {
  return raw
    .split('|')[0]
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeCategoryKey(name: string): string {
  return cleanCategoryName(name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function extractCategoriesFromPage(page: WikiPage): string[] {
  const found = new Map<string, string>();

  const addCat = (raw: string) => {
    const cleaned = cleanCategoryName(raw);
    if (!cleaned || cleaned.includes('{{{') || cleaned.includes('{{')) return;
    const key = normalizeCategoryKey(cleaned);
    if (!key) return;
    if (!found.has(key)) {
      found.set(key, cleaned);
    }
  };

  if (Array.isArray(page.categories)) {
    for (const cat of page.categories) {
      addCat(cat);
    }
  }

  if (page.content) {
    let scannable = page.content
      .replace(/<nowiki>[\s\S]*?<\/nowiki>/gi, '')
      .replace(/<pre[^>]*>[\s\S]*?<\/pre>/gi, '')
      .replace(/<syntaxhighlight[^>]*>[\s\S]*?<\/syntaxhighlight>/gi, '')
      .replace(/<code[^>]*>[\s\S]*?<\/code>/gi, '');

    if (page.namespace === 'Template' || page.slug.startsWith('Predefinição:')) {
      // Template pages categorize themselves inside <noinclude>, whereas <includeonly> targets transcluding articles.
      scannable = scannable.replace(/<includeonly>[\s\S]*?<\/includeonly>/gi, '');
    } else {
      scannable = scannable.replace(/<noinclude>[\s\S]*?<\/noinclude>/gi, '');
    }

    const catRegex = /\[\[\s*(?:Categoria|Category)\s*:\s*([^\]|]+)(?:\|[^\]]*)?\]\]/gi;
    let match: RegExpExecArray | null;
    while ((match = catRegex.exec(scannable)) !== null) {
      addCat(match[1]);
    }
  }

  return Array.from(found.values());
}

function formatShortDate(iso?: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export const CategoryExplorer: React.FC<CategoryExplorerProps> = ({
  initialCategory,
  embedded = false,
  hideCategoryPageLink = false,
}) => {
  const { navigateToPage } = useWiki();
  const [firestorePages, setFirestorePages] = useState<WikiPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [articleFilter, setArticleFilter] = useState('');
  const [namespaceFilter, setNamespaceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'alpha' | 'count'>('alpha');
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(() =>
    initialCategory ? normalizeCategoryKey(initialCategory) : null
  );

  useEffect(() => {
    setSelectedCategoryKey(initialCategory ? normalizeCategoryKey(initialCategory) : null);
    setArticleFilter('');
    setNamespaceFilter('all');
  }, [initialCategory]);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToAllPages(list => {
      setFirestorePages(list);
      setLoading(false);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const allPages = useMemo<WikiPage[]>(() => {
    const bySlug = new Map<string, WikiPage>();
    for (const def of Object.values(INITIAL_PAGES)) {
      bySlug.set(def.slug.toLowerCase(), def);
    }
    for (const live of firestorePages) {
      bySlug.set(live.slug.toLowerCase(), live);
    }
    return Array.from(bySlug.values());
  }, [firestorePages]);

  const categoryGroups = useMemo<CategoryGroup[]>(() => {
    const map = new Map<string, { name: string; pagesBySlug: Map<string, WikiPage> }>();

    for (const page of allPages) {
      const cats = extractCategoriesFromPage(page);
      for (const catName of cats) {
        const key = normalizeCategoryKey(catName);
        if (!map.has(key)) {
          map.set(key, { name: catName, pagesBySlug: new Map() });
        }
        const entry = map.get(key)!;
        entry.pagesBySlug.set(page.slug.toLowerCase(), page);
      }
    }

    return Array.from(map.entries()).map(([key, value]) => ({
      key,
      name: value.name,
      pages: Array.from(value.pagesBySlug.values()).sort((a, b) =>
        a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' })
      ),
    }));
  }, [allPages]);

  const sortedAndFilteredCategories = useMemo(() => {
    const q = categoryFilter.trim().toLowerCase();
    const filtered = q
      ? categoryGroups.filter(cat => cat.name.toLowerCase().includes(q))
      : categoryGroups;

    return [...filtered].sort((a, b) => {
      if (sortBy === 'count') {
        const diff = b.pages.length - a.pages.length;
        if (diff !== 0) return diff;
      }
      return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
    });
  }, [categoryGroups, categoryFilter, sortBy]);

  const selectedGroup = useMemo<CategoryGroup | null>(() => {
    if (!selectedCategoryKey) return null;
    const found = categoryGroups.find(c => c.key === selectedCategoryKey);
    if (found) return found;
    if (initialCategory) {
      return {
        key: selectedCategoryKey,
        name: cleanCategoryName(initialCategory),
        pages: [],
      };
    }
    return null;
  }, [categoryGroups, selectedCategoryKey, initialCategory]);

  const availableNamespaces = useMemo(() => {
    if (!selectedGroup) return [];
    const set = new Set<string>();
    for (const p of selectedGroup.pages) {
      set.add(p.namespace || 'Main');
    }
    return Array.from(set).sort((a, b) =>
      (NAMESPACE_LABELS[a] || a).localeCompare(NAMESPACE_LABELS[b] || b, 'pt-BR')
    );
  }, [selectedGroup]);

  const filteredArticles = useMemo(() => {
    if (!selectedGroup) return [];
    const q = articleFilter.trim().toLowerCase();
    return selectedGroup.pages.filter(page => {
      if (namespaceFilter !== 'all' && page.namespace !== namespaceFilter) return false;
      if (q) {
        return (
          page.title.toLowerCase().includes(q) ||
          page.slug.toLowerCase().includes(q) ||
          (page.summary || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedGroup, articleFilter, namespaceFilter]);

  const totalCategorizedPages = useMemo(() => {
    const slugs = new Set<string>();
    for (const group of categoryGroups) {
      for (const page of group.pages) {
        slugs.add(page.slug.toLowerCase());
      }
    }
    return slugs.size;
  }, [categoryGroups]);

  const handleSelectCategory = (key: string) => {
    setSelectedCategoryKey(key);
    setArticleFilter('');
    setNamespaceFilter('all');
  };

  return (
    <section aria-label="Explorador de Categorias" className={embedded ? 'space-y-4' : 'py-2 space-y-4'}>
      {/* Header */}
      {embedded ? (
        <div className="border-b border-gray-200 dark:border-gray-800 pb-2.5 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-lg font-serif font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#0645ad] dark:text-[#6ba4ff]" />
              <span>Explorador de Categorias</span>
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Clique em uma categoria para listar todos os artigos e páginas associados a ela.
            </p>
          </div>
          <div className="text-xs font-mono tabular-nums text-gray-500 dark:text-gray-400">
            {categoryGroups.length} categorias · {totalCategorizedPages} páginas categorizadas
          </div>
        </div>
      ) : (
        <div className="border-b border-[#a2a9b1] dark:border-gray-700 pb-2.5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="text-2xl font-serif text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#0645ad] dark:text-[#6ba4ff]" />
              <span>Categorias</span>
            </h1>
            <div className="text-xs font-mono tabular-nums text-gray-500 dark:text-gray-400">
              {categoryGroups.length} categorias · {totalCategorizedPages} páginas categorizadas
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Navegue por todas as categorias indexadas do WikiWazzimaGiygg e consulte os artigos associados em tempo real.
          </p>
        </div>
      )}

      {loading && firestorePages.length === 0 ? (
        <div className="py-10 text-center text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-800 rounded bg-white dark:bg-[#1a1f2c]">
          <RefreshCw className="w-4 h-4 animate-spin text-[#3366cc]" />
          <span>Carregando índice de categorias...</span>
        </div>
      ) : selectedGroup ? (
        /* Category Detail: Associated Articles List */
        <div className="space-y-3">
          {/* Breadcrumb & Back Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedCategoryKey(null)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Todas as categorias</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="font-serif font-semibold text-base text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-[#0645ad] dark:text-[#6ba4ff]" />
                <span>{selectedGroup.name}</span>
              </span>
              <span className="font-mono tabular-nums text-[11px] text-gray-500 dark:text-gray-400">
                · {selectedGroup.pages.length}{' '}
                {selectedGroup.pages.length === 1 ? 'página' : 'páginas'}
              </span>
            </div>

            {!hideCategoryPageLink && (
              <button
                type="button"
                onClick={() => navigateToPage(`Categoria:${selectedGroup.name.replace(/\s+/g, '_')}`)}
                className="inline-flex items-center gap-1 text-xs text-[#0645ad] dark:text-[#6ba4ff] hover:underline cursor-pointer"
              >
                <span>Abrir página Categoria:{selectedGroup.name}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Search & Namespace Filter for Articles inside Category */}
          <div className="flex flex-wrap items-center gap-2.5 p-2.5 rounded border border-gray-200 dark:border-gray-800 bg-[#f8f9fa] dark:bg-[#131722] text-xs">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={articleFilter}
                onChange={e => setArticleFilter(e.target.value)}
                placeholder={`Filtrar artigos em "${selectedGroup.name}"...`}
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#3366cc]"
              />
            </div>

            {availableNamespaces.length > 1 && (
              <div className="flex items-center gap-1.5">
                <label
                  htmlFor="category-ns-filter"
                  className="font-medium text-gray-600 dark:text-gray-400"
                >
                  Espaço nominal:
                </label>
                <select
                  id="category-ns-filter"
                  value={namespaceFilter}
                  onChange={e => setNamespaceFilter(e.target.value)}
                  className="px-2 py-1.5 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded text-xs text-gray-900 dark:text-gray-100"
                >
                  <option value="all">Todos ({selectedGroup.pages.length})</option>
                  {availableNamespaces.map(ns => (
                    <option key={ns} value={ns}>
                      {NAMESPACE_LABELS[ns] || ns}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="text-[11px] font-mono tabular-nums text-gray-500 dark:text-gray-400 ml-auto">
              Exibindo {filteredArticles.length} de {selectedGroup.pages.length}
            </div>
          </div>

          {/* Articles List */}
          {filteredArticles.length === 0 ? (
            <div className="p-8 text-center border border-gray-200 dark:border-gray-800 rounded bg-white dark:bg-[#1a1f2c] space-y-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {selectedGroup.pages.length === 0
                  ? `Nenhuma página está associada à categoria "${selectedGroup.name}" no momento.`
                  : 'Nenhum artigo corresponde aos filtros aplicados nesta categoria.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (selectedGroup.pages.length === 0) {
                    setSelectedCategoryKey(null);
                  } else {
                    setArticleFilter('');
                    setNamespaceFilter('all');
                  }
                }}
                className="text-xs text-[#0645ad] dark:text-[#6ba4ff] hover:underline font-medium cursor-pointer"
              >
                {selectedGroup.pages.length === 0 ? 'Voltar para todas as categorias' : 'Limpar filtros'}
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded bg-white dark:bg-[#1a1f2c]">
              {filteredArticles.map(page => (
                <li
                  key={page.slug}
                  className="p-3.5 hover:bg-[#f8f9fa] dark:hover:bg-gray-900/60 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => navigateToPage(page.slug, 'view')}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0645ad] dark:text-[#6ba4ff] hover:underline text-left cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{page.title}</span>
                    </button>
                    <div className="text-[11px] font-mono tabular-nums text-gray-500 dark:text-gray-400 shrink-0">
                      {NAMESPACE_LABELS[page.namespace] || page.namespace} · {page.revisionCount || 1}{' '}
                      {(page.revisionCount || 1) === 1 ? 'revisão' : 'revisões'} ·{' '}
                      {formatShortDate(page.updatedAt)}
                    </div>
                  </div>
                  {page.summary && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {page.summary}
                    </p>
                  )}
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Última edição por <span className="font-medium text-gray-700 dark:text-gray-300">{page.author || 'Sistema'}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        /* Category Directory: All Categories */
        <div className="space-y-3">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 rounded border border-gray-200 dark:border-gray-800 bg-[#f8f9fa] dark:bg-[#131722] text-xs">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                placeholder="Buscar categoria por nome..."
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#3366cc]"
              />
            </div>

            <div className="flex items-center gap-1" role="group" aria-label="Ordenar categorias">
              <button
                type="button"
                onClick={() => setSortBy('alpha')}
                className={`px-2.5 py-1.5 rounded border text-xs font-medium transition-colors cursor-pointer ${
                  sortBy === 'alpha'
                    ? 'bg-[#3366cc] text-white border-[#254b99]'
                    : 'bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                Alfabética (A–Z)
              </button>
              <button
                type="button"
                onClick={() => setSortBy('count')}
                className={`px-2.5 py-1.5 rounded border text-xs font-medium transition-colors cursor-pointer ${
                  sortBy === 'count'
                    ? 'bg-[#3366cc] text-white border-[#254b99]'
                    : 'bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                Mais artigos
              </button>
            </div>
          </div>

          {sortedAndFilteredCategories.length === 0 ? (
            <div className="p-8 text-center border border-gray-200 dark:border-gray-800 rounded bg-white dark:bg-[#1a1f2c] space-y-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Nenhuma categoria encontrada para &quot;{categoryFilter}&quot;.
              </p>
              {categoryFilter && (
                <button
                  type="button"
                  onClick={() => setCategoryFilter('')}
                  className="text-xs text-[#0645ad] dark:text-[#6ba4ff] hover:underline font-medium cursor-pointer"
                >
                  Limpar busca
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {sortedAndFilteredCategories.map(cat => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => handleSelectCategory(cat.key)}
                  className="p-3 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f2c] hover:border-[#3366cc] dark:hover:border-blue-500 hover:bg-[#f8f9fa] dark:hover:bg-gray-900/70 transition-colors text-left flex items-center justify-between gap-2 group cursor-pointer"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <FolderOpen className="w-4 h-4 text-[#0645ad] dark:text-[#6ba4ff] shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-[#0645ad] dark:group-hover:text-[#6ba4ff] truncate">
                      {cat.name}
                    </span>
                  </span>
                  <span className="text-[11px] font-mono tabular-nums text-gray-500 dark:text-gray-400 shrink-0">
                    {cat.pages.length} {cat.pages.length === 1 ? 'artigo' : 'artigos'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
