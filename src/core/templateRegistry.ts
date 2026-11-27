import { WikiPage } from '../types/wiki';

export interface TemplateParamMeta {
  name: string;
  isPositional: boolean;
  defaultValue?: string;
}

export interface TemplateCatalogEntry {
  slug: string;
  name: string; // Name without Predefinição:/Template: prefix
  title: string;
  summary: string;
  content: string;
  params: TemplateParamMeta[];
  author: string;
  isBuiltIn: boolean;
}

// Live cache populated from INITIAL_PAGES + Firestore subscribeToAllPages
const cachedTemplatesByKey = new Map<string, WikiPage>();
const cachedPagesByKey = new Map<string, WikiPage>();

function normalizeLookupKey(raw: string): string {
  const cleaned = raw.trim().replace(/[\s/]+/g, '_');
  if (!cleaned) return '';
  // MediaWiki first-letter case-insensitivity after namespace prefix
  const colonIdx = cleaned.indexOf(':');
  if (colonIdx >= 0) {
    const ns = cleaned.slice(0, colonIdx).toLowerCase();
    const rest = cleaned.slice(colonIdx + 1);
    if (!rest) return `${ns}:`;
    return `${ns}:${rest.charAt(0).toLowerCase()}${rest.slice(1)}`;
  }
  return `${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}`;
}

export function stripTemplateNamespacePrefix(rawName: string): string {
  return rawName
    .trim()
    .replace(/^(?:Predefinição|Predefinicao|Template):/i, '')
    .trim();
}

export function slugifyTemplateName(rawName: string): string {
  const clean = stripTemplateNamespacePrefix(rawName).replace(/\s+/g, '_');
  return `Predefinição:${clean}`;
}

export function setCachedTemplates(pages: WikiPage[], preserveExisting = false): void {
  if (!preserveExisting) {
    // Keep built-in defaults if Firestore hasn't seeded them yet
    const builtIns = Array.from(cachedPagesByKey.values()).filter(
      p => p.authorId === 'system_admin'
    );
    cachedTemplatesByKey.clear();
    cachedPagesByKey.clear();
    builtIns.forEach(registerSinglePage);
  }
  pages.forEach(registerSinglePage);
}

export function removeCachedTemplate(slugOrName: string): void {
  const bare = stripTemplateNamespacePrefix(slugOrName);
  const candidateKeys = [
    normalizeLookupKey(slugOrName),
    normalizeLookupKey(bare),
    normalizeLookupKey(`Predefinição:${bare}`),
    normalizeLookupKey(`Template:${bare}`),
    normalizeLookupKey(`Predefinicao:${bare}`),
  ];
  candidateKeys.forEach(key => {
    if (!key) return;
    const existing = cachedTemplatesByKey.get(key);
    if (existing && existing.authorId !== 'system_admin') {
      cachedTemplatesByKey.delete(key);
    }
    const pageExisting = cachedPagesByKey.get(key);
    if (pageExisting && pageExisting.authorId !== 'system_admin') {
      cachedPagesByKey.delete(key);
    }
  });
}

function registerSinglePage(page: WikiPage): void {
  if (!page || !page.slug) return;
  const slugKey = normalizeLookupKey(page.slug);
  const titleKey = normalizeLookupKey(page.title || page.slug);
  if (slugKey) cachedPagesByKey.set(slugKey, page);
  if (titleKey) cachedPagesByKey.set(titleKey, page);

  const isTemplate =
    page.namespace === 'Template' ||
    /^(?:Predefinição|Predefinicao|Template):/i.test(page.slug) ||
    /^(?:Predefinição|Predefinicao|Template):/i.test(page.title || '');

  if (isTemplate) {
    const bareFromSlug = stripTemplateNamespacePrefix(page.slug);
    const bareFromTitle = stripTemplateNamespacePrefix(page.title || page.slug);
    const keys = [
      normalizeLookupKey(bareFromSlug),
      normalizeLookupKey(bareFromTitle),
      normalizeLookupKey(`Predefinição:${bareFromSlug}`),
      normalizeLookupKey(`Template:${bareFromSlug}`),
      normalizeLookupKey(`Predefinicao:${bareFromSlug}`),
    ];
    keys.forEach(k => {
      if (k) cachedTemplatesByKey.set(k, page);
    });
  }
}

export function resolveTranscludedPage(rawTarget: string): WikiPage | null {
  const trimmed = rawTarget.trim();
  if (!trimmed) return null;

  // Explicit main-namespace transclusion {{:Artigo}}
  if (trimmed.startsWith(':')) {
    const mainTarget = trimmed.slice(1).trim();
    return cachedPagesByKey.get(normalizeLookupKey(mainTarget)) || null;
  }

  // Explicit Template/Predefinição or other namespace transclusion
  const explicitKey = normalizeLookupKey(trimmed);
  if (cachedTemplatesByKey.has(explicitKey)) {
    return cachedTemplatesByKey.get(explicitKey) || null;
  }

  // Bare template name {{Esboço}} -> Predefinição:Esboço
  const bareName = stripTemplateNamespacePrefix(trimmed);
  const bareKey = normalizeLookupKey(bareName);
  if (cachedTemplatesByKey.has(bareKey)) {
    return cachedTemplatesByKey.get(bareKey) || null;
  }

  // Fallback to full page lookup if user wrote {{Wiki:Algo}}
  if (trimmed.includes(':')) {
    return cachedPagesByKey.get(explicitKey) || null;
  }

  return null;
}

export function extractTransclusionBody(rawContent: string): string {
  if (!rawContent) return '';
  // MediaWiki <onlyinclude> overrides everything else during transclusion
  const onlyIncludeMatches = Array.from(
    rawContent.matchAll(/<onlyinclude>([\s\S]*?)<\/onlyinclude>/gi)
  );
  if (onlyIncludeMatches.length > 0) {
    return onlyIncludeMatches.map(m => m[1]).join('');
  }

  // Remove <noinclude>...</noinclude> and unwrap <includeonly>...</includeonly>
  return rawContent
    .replace(/<noinclude>[\s\S]*?<\/noinclude>/gi, '')
    .replace(/<\/?includeonly>/gi, '');
}

export function stripTemplateViewingTags(rawContent: string): string {
  if (!rawContent) return '';
  // When viewing the Predefinição: page itself, <includeonly> blocks are not executed on the doc page,
  // while <noinclude> and <onlyinclude> tags are unwrapped so documentation renders cleanly.
  return rawContent
    .replace(/<includeonly>[\s\S]*?<\/includeonly>/gi, '')
    .replace(/<\/?noinclude>/gi, '')
    .replace(/<\/?onlyinclude>/gi, '');
}

export function extractTemplateParams(rawContent: string): TemplateParamMeta[] {
  const transcludable = extractTransclusionBody(rawContent);
  const seen = new Map<string, TemplateParamMeta>();

  let i = 0;
  while (i < transcludable.length) {
    if (
      transcludable[i] === '{' &&
      transcludable[i + 1] === '{' &&
      transcludable[i + 2] === '{'
    ) {
      let depth = 3;
      let j = i + 3;
      let firstPipe = -1;
      while (j < transcludable.length && depth > 0) {
        const ch = transcludable[j];
        if (ch === '{') depth++;
        else if (ch === '}') depth--;
        else if (ch === '|' && depth === 3 && firstPipe === -1) {
          firstPipe = j;
        }
        j++;
      }

      if (depth === 0) {
        const nameEnd = firstPipe !== -1 ? firstPipe : j - 3;
        const paramName = transcludable.slice(i + 3, nameEnd).trim();
        const defaultRaw =
          firstPipe !== -1 ? transcludable.slice(firstPipe + 1, j - 3).trim() : undefined;
        // Hide raw nested {{{...}}} markup from placeholder text
        const cleanDefault =
          defaultRaw && !/\{\{\{/.test(defaultRaw) ? defaultRaw : undefined;

        if (paramName && !/[{}<>]/.test(paramName)) {
          if (!seen.has(paramName)) {
            seen.set(paramName, {
              name: paramName,
              isPositional: /^\d+$/.test(paramName),
              defaultValue: cleanDefault,
            });
          } else if (cleanDefault && !seen.get(paramName)?.defaultValue) {
            const existing = seen.get(paramName)!;
            seen.set(paramName, { ...existing, defaultValue: cleanDefault });
          }
        }

        // Advance past opening {{{ so inner nested {{{1|}}} defaults are also discovered
        i += 3;
        continue;
      }
    }
    i++;
  }

  return Array.from(seen.values()).sort((a, b) => {
    if (a.isPositional && b.isPositional) {
      return Number(a.name) - Number(b.name);
    }
    if (a.isPositional) return -1;
    if (b.isPositional) return 1;
    return a.name.localeCompare(b.name, 'pt-BR');
  });
}

export function getAvailableTemplates(): TemplateCatalogEntry[] {
  const uniqueBySlug = new Map<string, WikiPage>();
  cachedTemplatesByKey.forEach(page => {
    if (!uniqueBySlug.has(page.slug)) {
      uniqueBySlug.set(page.slug, page);
    }
  });

  return Array.from(uniqueBySlug.values())
    .map(page => ({
      slug: page.slug,
      name: stripTemplateNamespacePrefix(page.title || page.slug),
      title: page.title || page.slug.replace(/_/g, ' '),
      summary: page.summary || 'Predefinição reutilizável do WikiWazzimaGiygg',
      content: page.content,
      params: extractTemplateParams(page.content),
      author: page.author || 'Comunidade',
      isBuiltIn: page.authorId === 'system_admin',
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}
