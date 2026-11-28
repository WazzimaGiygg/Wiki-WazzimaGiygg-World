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
import { DEFAULT_CATEGORY_DEFINITIONS, CategorySeedMeta } from '../core/defaultCategories';
import { subscribeToAllPages } from '../services/wikiService';
import { subscribeToTemplates } from '../services/templateService';
import { WikiPage } from '../types/wiki';
import {
  cleanCategoryName,
  extractCategoryAssociations,
  getAlphabeticalGroupKey,
  getCategoryPageOwnKey,
  isCategoryWikiPage,
  normalizeCategoryKey,
} from '../utils/categoryUtils';

export interface CategoryExplorerProps {
  initialCategory?: string;
  embedded?: boolean;
  hideCategoryPageLink?: boolean;
  categoryPageMode?: boolean;
}

interface CategoryMemberItem {
  page: WikiPage;
  viaTag: boolean;
  viaLink: boolean;
}

interface CategoryGroup {
  key: string;
  name: string;
  kind: 'article' | 'page';
  description?: string;
  members: CategoryMemberItem[];
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

function formatAssociationSource(viaTag: boolean, viaLink: boolean): string {
  if (viaTag && viaLink) return 'tag e link no artigo';
  if (viaLink) return 'link no artigo';
  return 'tag da categoria';
}

export const CategoryExplorer: React.FC<CategoryExplorerProps> = ({
  initialCategory,
  embedded = false,
  hideCategoryPageLink = false,
  categoryPageMode = false,
}) => {
  const { navigateToPage, existingPageSlugs, disabledExtensionIds } = useWiki();
  const [firestorePages, setFirestorePages] = useState<WikiPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [templatesVersion, setTemplatesVersion] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [kindFilter, setKindFilter] = useState<'all' | 'article' | 'page'>('all');
  const [articleFilter, setArticleFilter] = useState('');
  const [namespaceFilter, setNamespaceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'alpha' | 'count'>('alpha');
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(() =>
    initialCategory ? normalizeCategoryKey(initialCategory) : null
  );

  const defaultCategoryMetaMap = useMemo(() => {
    const metaMap = new Map<string, CategorySeedMeta>();
    for (const def of DEFAULT_CATEGORY_DEFINITIONS) {
      metaMap.set(normalizeCategoryKey(def.name), def);
    }
    return metaMap;
  }, []);

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

  useEffect(() => {
    const unsub = subscribeToTemplates(() => {
      setTemplatesVersion(v => v + 1);
    });
    return () => unsub();
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
    const map = new Map<string, { name: string; membersBySlug: Map<string, CategoryMemberItem> }>();

    // Ensure every seeded default category is always discoverable
    for (const def of DEFAULT_CATEGORY_DEFINITIONS) {
      const key = normalizeCategoryKey(def.name);
      if (!map.has(key)) {
        map.set(key, { name: def.name, membersBySlug: new Map() });
      }
    }

    for (const page of allPages) {
      const pageIsCategory = isCategoryWikiPage(page);
      const ownCatKey = pageIsCategory ? getCategoryPageOwnKey(page) : '';

      // Register Category:* pages themselves as browsable categories even when empty
      if (pageIsCategory && ownCatKey && !map.has(ownCatKey)) {
        const ownCatName = cleanCategoryName(page.title.replace(/^(?:Categoria|Category):/i, ''));
        map.set(ownCatKey, { name: ownCatName, membersBySlug: new Map() });
      }

      const associations = extractCategoryAssociations(
        page,
        existingPageSlugs,
        disabledExtensionIds
      );

      for (const assoc of associations) {
        // Prevent a Categoria:X page from listing itself as a member
        if (pageIsCategory && ownCatKey === assoc.key) {
          continue;
        }
        if (!map.has(assoc.key)) {
          map.set(assoc.key, { name: assoc.name, membersBySlug: new Map() });
        }
        const entry = map.get(assoc.key)!;
        const slugKey = page.slug.toLowerCase();
        const existingMember = entry.membersBySlug.get(slugKey);
        if (existingMember) {
          existingMember.viaTag = existingMember.viaTag || assoc.viaTag;
          existingMember.viaLink = existingMember.viaLink || assoc.viaLink;
        } else {
          entry.membersBySlug.set(slugKey, {
            page,
            viaTag: assoc.viaTag,
            viaLink: assoc.viaLink,
          });
        }
      }
    }

    return Array.from(map.entries()).map(([key, value]) => {
      const members = Array.from(value.membersBySlug.values()).sort((a, b) =>
        a.page.title.localeCompare(b.page.title, 'pt-BR', { sensitivity: 'base' })
      );
      const seedMeta = defaultCategoryMetaMap.get(key);
      const inferredKind: 'article' | 'page' = seedMeta
        ? seedMeta.kind
        : members.length > 0 && members.every(m => m.page.namespace !== 'Main')
        ? 'page'
        : 'article';

      return {
        key,
        name: seedMeta?.name || value.name,
        kind: inferredKind,
        description: seedMeta?.description,
        members,
      };
    });
  }, [allPages, defaultCategoryMetaMap, existingPageSlugs, disabledExtensionIds, templatesVersion]);

  const kindCounts = useMemo(() => {
    let article = 0;
    let page = 0;
    for (const cat of categoryGroups) {
      if (cat.kind === 'article') article++;
      else page++;
    }
    return { all: categoryGroups.length, article, page };
  }, [categoryGroups]);

  const sortedAndFilteredCategories = useMemo(() => {
    const q = categoryFilter.trim().toLowerCase();
    const filtered = categoryGroups.filter(cat => {
      if (kindFilter !== 'all' && cat.kind !== kindFilter) return false;
      if (q) {
        return (
          cat.name.toLowerCase().includes(q) ||
          (cat.description || '').toLowerCase().includes(q)
        );
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'count') {
        const diff = b.members.length - a.members.length;
        if (diff !== 0) return diff;
      }
      return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
    });
  }, [categoryGroups, categoryFilter, kindFilter, sortBy]);

  const selectedGroup = useMemo<CategoryGroup | null>(() => {
    if (!selectedCategoryKey) return null;
    const found = categoryGroups.find(c => c.key === selectedCategoryKey);
    if (found) return found;
    if (initialCategory) {
      const seedMeta = defaultCategoryMetaMap.get(selectedCategoryKey);
      return {
        key: selectedCategoryKey,
        name: seedMeta?.name || cleanCategoryName(initialCategory),
        kind: seedMeta?.kind || 'article',
        description: seedMeta?.description,
        members: [],
      };
    }
    return null;
  }, [categoryGroups, selectedCategoryKey, initialCategory, defaultCategoryMetaMap]);

  const availableNamespaces = useMemo(() => {
    if (!selectedGroup) return [];
    const set = new Set<string>();
    for (const m of selectedGroup.members) {
      set.add(m.page.namespace || 'Main');
    }
    return Array.from(set).sort((a, b) =>
      (NAMESPACE_LABELS[a] || a).localeCompare(NAMESPACE_LABELS[b] || b, 'pt-BR')
    );
  }, [selectedGroup]);

  const filteredMembers = useMemo(() => {
    if (!selectedGroup) return [];
    const q = articleFilter.trim().toLowerCase();
    return selectedGroup.members
      .filter(member => {
        const page = member.page;
        if (namespaceFilter !== 'all' && page.namespace !== namespaceFilter) return false;
        if (q) {
          return (
            page.title.toLowerCase().includes(q) ||
            page.slug.toLowerCase().includes(q) ||
            (page.summary || '').toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) =>
        a.page.title.localeCompare(b.page.title, 'pt-BR', { sensitivity: 'base' })
      );
  }, [selectedGroup, articleFilter, namespaceFilter]);

  const subcategories = useMemo(
    () => filteredMembers.filter(m => isCategoryWikiPage(m.page)),
    [filteredMembers]
  );

  const regularMemberPages = useMemo(
    () => filteredMembers.filter(m => !isCategoryWikiPage(m.page)),
    [filteredMembers]
  );

  const alphabeticalSections = useMemo(() => {
    const groups = new Map<string, CategoryMemberItem[]>();
    for (const item of regularMemberPages) {
      const letter = getAlphabeticalGroupKey(item.page.title);
      if (!groups.has(letter)) {
        groups.set(letter, []);
      }
      groups.get(letter)!.push(item);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => {
      if (a === '0–9' && b !== '0–9') return -1;
      if (b === '0–9' && a !== '0–9') return 1;
      if (a === '#' && b !== '#') return 1;
      if (b === '#' && a !== '#') return -1;
      return a.localeCompare(b, 'pt-BR');
    });
  }, [regularMemberPages]);

  const totalCategorizedPages = useMemo(() => {
    const slugs = new Set<string>();
    for (const group of categoryGroups) {
      for (const member of group.members) {
        slugs.add(member.page.slug.toLowerCase());
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
    <section
      aria-label={categoryPageMode && selectedGroup ? `Páginas na categoria ${selectedGroup.name}` : 'Explorador de Categorias'}
      className={embedded ? 'space-y-4' : 'py-2 space-y-4'}
    >
      {/* Header */}
      {categoryPageMode && selectedGroup ? (
        <div className="border-b border-gray-200 dark:border-gray-800 pb-2.5 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-lg font-serif font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[#0645ad] dark:text-[#6ba4ff] shrink-0" />
              <span>Índice automático da categoria &ldquo;{selectedGroup.name}&rdquo;</span>
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 tabular-nums">
              {selectedGroup.kind === 'article' ? 'Categoria de artigos' : 'Categoria de páginas'} ·{' '}
              {selectedGroup.members.length}{' '}
              {selectedGroup.members.length === 1 ? 'página listada' : 'páginas listadas'} · Ordem alfabética automática (tags e links)
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateToPage('Especial:Categorias')}
            className="text-xs text-[#0645ad] dark:text-[#6ba4ff] hover:underline cursor-pointer shrink-0"
          >
            Explorar todas as categorias →
          </button>
        </div>
      ) : embedded ? (
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
        /* Category Detail: Associated Articles List (Alphabetical) */
        <div className="space-y-4">
          {!categoryPageMode && (
            <>
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
                    · {selectedGroup.kind === 'article' ? 'Categoria de artigos' : 'Categoria de páginas'} ·{' '}
                    {selectedGroup.members.length}{' '}
                    {selectedGroup.members.length === 1 ? 'página' : 'páginas'}
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

              {selectedGroup.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed px-0.5">
                  {selectedGroup.description}
                </p>
              )}
            </>
          )}

          {/* Search & Namespace Filter for Articles inside Category */}
          {selectedGroup.members.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5 p-2.5 rounded border border-gray-200 dark:border-gray-800 bg-[#f8f9fa] dark:bg-[#131722] text-xs">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={articleFilter}
                  onChange={e => setArticleFilter(e.target.value)}
                  placeholder={`Filtrar páginas em "${selectedGroup.name}"...`}
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
                    <option value="all">Todos ({selectedGroup.members.length})</option>
                    {availableNamespaces.map(ns => (
                      <option key={ns} value={ns}>
                        {NAMESPACE_LABELS[ns] || ns}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="text-[11px] font-mono tabular-nums text-gray-500 dark:text-gray-400 ml-auto">
                Exibindo {filteredMembers.length} de {selectedGroup.members.length} (A–Z)
              </div>
            </div>
          )}

          {/* Empty state */}
          {filteredMembers.length === 0 ? (
            <div className="p-6 text-center border border-gray-200 dark:border-gray-800 rounded bg-white dark:bg-[#1a1f2c] space-y-2">
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {selectedGroup.members.length === 0
                  ? `Nenhuma página cita ainda a categoria "${selectedGroup.name}". Para incluir uma página automaticamente nesta lista em ordem alfabética, adicione [[Categoria:${selectedGroup.name}]] ou o link [[:Categoria:${selectedGroup.name}]] dentro do artigo.`
                  : 'Nenhuma página corresponde aos filtros aplicados nesta categoria.'}
              </p>
              {selectedGroup.members.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setArticleFilter('');
                    setNamespaceFilter('all');
                  }}
                  className="text-xs text-[#0645ad] dark:text-[#6ba4ff] hover:underline font-medium cursor-pointer"
                >
                  Limpar filtros
                </button>
              ) : !categoryPageMode ? (
                <button
                  type="button"
                  onClick={() => setSelectedCategoryKey(null)}
                  className="text-xs text-[#0645ad] dark:text-[#6ba4ff] hover:underline font-medium cursor-pointer"
                >
                  Voltar para todas as categorias
                </button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Subcategories section (alphabetical A-Z) */}
              {subcategories.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between border-b border-gray-200 dark:border-gray-800 pb-1">
                    <h3 className="text-sm font-serif font-semibold text-gray-900 dark:text-gray-100">
                      Subcategorias
                    </h3>
                    <span className="text-[11px] font-mono tabular-nums text-gray-500 dark:text-gray-400">
                      {subcategories.length} {subcategories.length === 1 ? 'subcategoria' : 'subcategorias'}
                    </span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {subcategories.map(({ page, viaTag, viaLink }) => (
                      <li
                        key={page.slug}
                        className="p-2.5 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f2c] hover:border-[#3366cc] dark:hover:border-blue-500 transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => navigateToPage(page.slug, 'view')}
                          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#0645ad] dark:text-[#6ba4ff] hover:underline text-left cursor-pointer"
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{page.title}</span>
                        </button>
                        <div className="text-[10px] font-mono tabular-nums text-gray-500 dark:text-gray-400 mt-0.5">
                          {formatAssociationSource(viaTag, viaLink)} · {formatShortDate(page.updatedAt)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Regular Pages section (Alphabetical A-Z Index) */}
              {regularMemberPages.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between border-b border-gray-200 dark:border-gray-800 pb-1">
                    <h3 className="text-sm font-serif font-semibold text-gray-900 dark:text-gray-100">
                      Páginas na categoria &ldquo;{selectedGroup.name}&rdquo;
                    </h3>
                    <span className="text-[11px] font-mono tabular-nums text-gray-500 dark:text-gray-400">
                      {regularMemberPages.length}{' '}
                      {regularMemberPages.length === 1 ? 'página' : 'páginas'} · ordem alfabética
                    </span>
                  </div>

                  {categoryPageMode ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      {alphabeticalSections.map(([letter, items]) => (
                        <div key={letter} className="space-y-1.5">
                          <div className="flex items-baseline justify-between border-b border-gray-200 dark:border-gray-800 pb-0.5">
                            <span className="font-serif font-semibold text-base text-gray-900 dark:text-gray-100">
                              {letter}
                            </span>
                            <span className="text-[10px] font-mono tabular-nums text-gray-400">
                              {items.length}
                            </span>
                          </div>
                          <ul className="space-y-1.5 pt-0.5">
                            {items.map(({ page, viaTag, viaLink }) => (
                              <li key={page.slug} className="leading-snug">
                                <button
                                  type="button"
                                  onClick={() => navigateToPage(page.slug, 'view')}
                                  className="inline-flex items-baseline gap-1.5 text-sm font-medium text-[#0645ad] dark:text-[#6ba4ff] hover:underline text-left cursor-pointer"
                                >
                                  <BookOpen className="w-3 h-3 text-gray-400 shrink-0 self-center" />
                                  <span>{page.title}</span>
                                </button>
                                <div className="text-[11px] text-gray-500 dark:text-gray-400 pl-4.5 font-mono tabular-nums">
                                  {NAMESPACE_LABELS[page.namespace] || page.namespace} ·{' '}
                                  {formatAssociationSource(viaTag, viaLink)} ·{' '}
                                  {formatShortDate(page.updatedAt)}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded bg-white dark:bg-[#1a1f2c]">
                      {regularMemberPages.map(({ page, viaTag, viaLink }) => (
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
                              {NAMESPACE_LABELS[page.namespace] || page.namespace} ·{' '}
                              {formatAssociationSource(viaTag, viaLink)} · {page.revisionCount || 1}{' '}
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
                            Última edição por{' '}
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {page.author || 'Sistema'}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Category Directory: All Categories */
        <div className="space-y-3">
          {/* Controls */}
          <div className="space-y-2 p-2.5 rounded border border-gray-200 dark:border-gray-800 bg-[#f8f9fa] dark:bg-[#131722] text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  placeholder="Buscar categoria por nome ou descrição..."
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
                  Mais páginas
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-gray-200/80 dark:border-gray-800">
              <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Filtrar tipo de categoria">
                {(
                  [
                    { id: 'all', label: 'Todas', count: kindCounts.all },
                    { id: 'article', label: 'Categorias de Artigos', count: kindCounts.article },
                    { id: 'page', label: 'Categorias de Páginas', count: kindCounts.page },
                  ] as const
                ).map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setKindFilter(tab.id)}
                    className={`px-2.5 py-1 rounded border text-[11px] font-medium tabular-nums transition-colors cursor-pointer ${
                      kindFilter === tab.id
                        ? 'bg-[#3366cc] text-white border-[#254b99]'
                        : 'bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
              <span className="text-[11px] font-mono tabular-nums text-gray-500 dark:text-gray-400">
                Exibindo {sortedAndFilteredCategories.length}
              </span>
            </div>
          </div>

          {sortedAndFilteredCategories.length === 0 ? (
            <div className="p-8 text-center border border-gray-200 dark:border-gray-800 rounded bg-white dark:bg-[#1a1f2c] space-y-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Nenhuma categoria encontrada para os filtros atuais.
              </p>
              {(categoryFilter || kindFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setCategoryFilter('');
                    setKindFilter('all');
                  }}
                  className="text-xs text-[#0645ad] dark:text-[#6ba4ff] hover:underline font-medium cursor-pointer"
                >
                  Limpar filtros
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
                    <FolderOpen
                      className={`w-4 h-4 shrink-0 ${
                        cat.kind === 'article'
                          ? 'text-[#0645ad] dark:text-[#6ba4ff]'
                          : 'text-teal-600 dark:text-teal-400'
                      }`}
                    />
                    <span className="min-w-0">
                      <span className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-[#0645ad] dark:group-hover:text-[#6ba4ff] truncate">
                        {cat.name}
                      </span>
                      <span className="block text-[10px] text-gray-500 dark:text-gray-400 truncate">
                        {cat.kind === 'article' ? 'Artigos' : 'Páginas'}
                      </span>
                    </span>
                  </span>
                  <span className="text-[11px] font-mono tabular-nums text-gray-500 dark:text-gray-400 shrink-0">
                    {cat.members.length} {cat.members.length === 1 ? 'página' : 'páginas'}
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
