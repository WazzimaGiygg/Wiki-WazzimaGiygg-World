import { WikiPage } from '../types/wiki';
import { expandWikitextTemplates } from '../services/templateService';

export interface CategoryAssociation {
  key: string;
  name: string;
  viaTag: boolean;
  viaLink: boolean;
}

export function cleanCategoryName(raw: string): string {
  return raw
    .trim()
    .replace(/^:/, '')
    .replace(/^(?:Categoria|Category):/i, '')
    .split('|')[0]
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeCategoryKey(name: string): string {
  return cleanCategoryName(name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function decodeBasicHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function stripLiteralBlocks(raw: string): string {
  return raw
    .replace(/<nowiki>[\s\S]*?<\/nowiki>/gi, '')
    .replace(/<pre[^>]*>[\s\S]*?<\/pre>/gi, '')
    .replace(/<syntaxhighlight[^>]*>[\s\S]*?<\/syntaxhighlight>/gi, '')
    .replace(/<code[^>]*>[\s\S]*?<\/code>/gi, '')
    .replace(/`[^`\n]+`/g, '');
}

export function isCategoryWikiPage(page: Pick<WikiPage, 'namespace' | 'slug' | 'title'>): boolean {
  return (
    page.namespace === 'Category' ||
    /^(?:Categoria|Category):/i.test(page.slug) ||
    /^(?:Categoria|Category):/i.test(page.title || '')
  );
}

export function getCategoryPageOwnKey(page: Pick<WikiPage, 'slug' | 'title'>): string {
  const rawName = (page.title || page.slug).replace(/^(?:Categoria|Category):/i, '');
  return normalizeCategoryKey(rawName);
}

/**
 * Extracts all category associations from a wiki page:
 * 1. Stored page.categories tags
 * 2. Direct [[Categoria:Nome]] / [[Category:Nome]] tags
 * 3. Direct [[:Categoria:Nome]] / [[:Category:Nome]] links inserted in article text
 * 4. Categories & category links emitted by transcluded templates ({{...}})
 */
export function extractCategoryAssociations(
  page: WikiPage,
  existingPageSlugs: Set<string> = new Set(),
  disabledExtensions?: string[] | Set<string>
): CategoryAssociation[] {
  const found = new Map<string, CategoryAssociation>();

  const register = (raw: string, source: 'tag' | 'link') => {
    const cleaned = cleanCategoryName(raw);
    if (!cleaned || cleaned.includes('{{{') || cleaned.includes('{{')) return;
    const key = normalizeCategoryKey(cleaned);
    if (!key) return;

    const existing = found.get(key);
    if (existing) {
      if (source === 'tag') existing.viaTag = true;
      if (source === 'link') existing.viaLink = true;
      return;
    }
    found.set(key, {
      key,
      name: cleaned,
      viaTag: source === 'tag',
      viaLink: source === 'link',
    });
  };

  if (Array.isArray(page.categories)) {
    for (const cat of page.categories) {
      register(cat, 'tag');
    }
  }

  if (page.content) {
    const isTemplate =
      page.namespace === 'Template' ||
      /^(?:Predefinição|Predefinicao|Template):/i.test(page.slug);

    let scannable = stripLiteralBlocks(page.content);
    if (isTemplate) {
      // Template pages categorize themselves inside <noinclude>, whereas <includeonly> targets transcluding articles.
      scannable = scannable.replace(/<includeonly>[\s\S]*?<\/includeonly>/gi, '');
    } else {
      scannable = scannable.replace(/<noinclude>[\s\S]*?<\/noinclude>/gi, '');
    }

    // 1. Standard category tags [[Categoria:Nome]] / [[Category:Nome]]
    const tagRegex = /\[\[\s*(?:Categoria|Category)\s*:\s*([^\]|]+)(?:\|[^\]]*)?\]\]/gi;
    let match: RegExpExecArray | null;
    while ((match = tagRegex.exec(scannable)) !== null) {
      register(match[1], 'tag');
    }

    // 2. Inline category links inserted inside the article [[:Categoria:Nome]] / [[:Category:Nome]]
    const linkRegex = /\[\[\s*:\s*(?:Categoria|Category)\s*:\s*([^\]|]+)(?:\|[^\]]*)?\]\]/gi;
    while ((match = linkRegex.exec(scannable)) !== null) {
      register(match[1], 'link');
    }

    // 3. Direct hash links to category pages inside wikitext/HTML
    const hashLinkRegex = /#\/wiki\/(?:Categoria|Category)(?::|%3A)([^"'\s&#?]+)/gi;
    while ((match = hashLinkRegex.exec(scannable)) !== null) {
      try {
        register(decodeURIComponent(match[1]), 'link');
      } catch {
        register(match[1], 'link');
      }
    }

    // 4. Transcluded templates ({{...}}) in non-template pages can emit tags or category links
    if (!isTemplate && scannable.includes('{{')) {
      try {
        const expanded = expandWikitextTemplates(page.content, existingPageSlugs, {
          pageTitle: page.title,
          pageSlug: page.slug,
          namespace: page.namespace,
          disabledExtensions,
        });

        for (const cat of expanded.categories) {
          register(cat, 'tag');
        }

        const renderedTargetRegex = /data-target="((?:Categoria|Category):[^"]+)"/gi;
        while ((match = renderedTargetRegex.exec(expanded.html)) !== null) {
          register(decodeBasicHtmlEntities(match[1]), 'link');
        }
      } catch {
        // Ignore template expansion errors during indexing so category listing never breaks
      }
    }
  }

  return Array.from(found.values());
}

export function getAlphabeticalGroupKey(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return '#';
  const firstChar = trimmed.charAt(0).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  if (/^[A-Z]$/.test(firstChar)) return firstChar;
  if (/^[0-9]$/.test(firstChar)) return '0–9';
  return '#';
}
